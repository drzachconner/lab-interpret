import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderRequest {
  labPanelIds: string[];
  userId: string;
  patientInfo?: {
    fullName: string;
    dateOfBirth: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
}

interface FullscriptLab {
  id: string;
  name: string;
  price: number;
  fullscript_id?: string;
  provider: string;
  sample_type: string;
}

interface FullscriptTreatmentPlan {
  id: string;
  patient_id: string;
  status: string;
  checkout_url: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { labPanelIds, userId, patientInfo }: CreateOrderRequest = await req.json();

    console.log('Creating Fullscript lab order for user:', user.id, 'panels:', labPanelIds);

    // Get user profile with Fullscript account info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, fullscript_accounts(*)')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Get lab panels from our catalog
    const { data: panels, error: panelsError } = await supabase
      .from('lab_panels')
      .select('*')
      .in('id', labPanelIds)
      .eq('is_active', true);

    if (panelsError || !panels || panels.length === 0) {
      throw new Error('Invalid lab panels selected');
    }

    // Generate order number
    const orderNumber = `BHL${Date.now().toString().slice(-8)}`;

    // Create order in our database first
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        order_type: 'lab_panel_fullscript',
        total_amount: 0, // Will be updated after Fullscript pricing
        lab_fee: 0,
        authorization_fee: 0,
        draw_fee: 0,
        processing_fee: 0,
        fullscript_order_id: null,
        fullscript_checkout_url: null
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    // Create order items
    const orderItems = panels.map(panel => ({
      order_id: order.id,
      lab_panel_id: panel.id,
      quantity: 1,
      unit_price: panel.base_price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw new Error('Failed to create order items');
    }

    let fullscriptResult = null;
    let fullscriptError = null;

    // Try to create Fullscript treatment plan if we have the necessary data
    if (profile.fullscript_accounts && profile.fullscript_accounts.length > 0) {
      try {
        const fullscriptAccount = profile.fullscript_accounts[0];
        
        // Prepare Fullscript lab data
        const fullscriptLabs: FullscriptLab[] = panels.map(panel => ({
          id: panel.id,
          name: panel.display_name || panel.name,
          price: panel.base_price,
          fullscript_id: panel.fullscript_id,
          provider: panel.provider || 'Unknown',
          sample_type: panel.sample_type || 'blood'
        }));

        // Create Fullscript treatment plan
        const fullscriptResponse = await fetch('https://api.fullscript.com/api/v1/treatment_plans', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('FULLSCRIPT_API_KEY')}`,
            'Content-Type': 'application/json',
            'X-Practitioner-ID': Deno.env.get('FULLSCRIPT_PRACTITIONER_ID') || '',
          },
          body: JSON.stringify({
            patient_id: fullscriptAccount.fullscript_patient_id,
            dispensary_id: fullscriptAccount.fullscript_dispensary_id,
            items: fullscriptLabs.map(lab => ({
              type: 'lab_test',
              lab_test_id: lab.fullscript_id || lab.id,
              quantity: 1,
              notes: `Lab panel: ${lab.name}`
            })),
            notes: `BiohackLabs.ai Lab Order - ${orderNumber}`,
            metadata: {
              biohack_order_id: order.id,
              order_number: orderNumber,
              user_id: userId
            }
          })
        });

        if (fullscriptResponse.ok) {
          const treatmentPlan: FullscriptTreatmentPlan = await fullscriptResponse.json();
          
          fullscriptResult = {
            treatment_plan_id: treatmentPlan.id,
            checkout_url: treatmentPlan.checkout_url,
            status: treatmentPlan.status
          };

          // Update order with Fullscript data
          await supabase
            .from('orders')
            .update({
              fullscript_order_id: treatmentPlan.id,
              fullscript_checkout_url: treatmentPlan.checkout_url,
              status: 'fullscript_created'
            })
            .eq('id', order.id);

          console.log('Fullscript treatment plan created:', treatmentPlan.id);
        } else {
          const errorData = await fullscriptResponse.json();
          fullscriptError = errorData.message || 'Failed to create Fullscript treatment plan';
          console.error('Fullscript API error:', errorData);
        }
      } catch (error) {
        fullscriptError = error.message || 'Failed to connect to Fullscript API';
        console.error('Fullscript integration error:', error);
      }
    } else {
      fullscriptError = 'No Fullscript account found for user';
    }

    // If Fullscript integration failed, we still create the order but mark it as needing manual processing
    if (fullscriptError) {
      await supabase
        .from('orders')
        .update({
          status: 'pending_manual',
          notes: `Fullscript integration failed: ${fullscriptError}`
        })
        .eq('id', order.id);
    }

    // Send confirmation email
    try {
      const { error: emailError } = await supabase.functions.invoke('send-branded-email', {
        body: {
          to: user.email,
          template: 'lab_order_created',
          data: {
            orderNumber: orderNumber,
            fullscriptCheckoutUrl: fullscriptResult?.checkout_url,
            hasFullscriptIntegration: !!fullscriptResult,
            errorMessage: fullscriptError
          }
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    console.log('Lab order created successfully:', orderNumber);

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          fullscriptResult,
          fullscriptError,
          checkoutUrl: fullscriptResult?.checkout_url,
          panels: panels.map(p => ({
            id: p.id,
            name: p.display_name || p.name,
            price: p.base_price
          }))
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in create-lab-order-fullscript function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create lab order'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
