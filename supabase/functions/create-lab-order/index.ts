import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderRequest {
  panelIds: string[];
  patientInfo: {
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

    const { panelIds, patientInfo }: CreateOrderRequest = await req.json();

    console.log('Creating lab order for user:', user.id, 'panels:', panelIds);

    // Get lab panels
    const { data: panels, error: panelsError } = await supabase
      .from('lab_panels')
      .select('*')
      .in('id', panelIds)
      .eq('is_active', true);

    if (panelsError || !panels || panels.length === 0) {
      throw new Error('Invalid lab panels selected');
    }

    // Calculate pricing
    const labTotal = panels.reduce((sum, panel) => sum + panel.base_price, 0);
    const authorizationFee = 1250; // $12.50
    const drawFee = 1000; // $10.00
    const processingFee = Math.round(labTotal * 0.15); // 15% markup
    const totalAmount = labTotal + authorizationFee + drawFee + processingFee;

    // Generate order number
    const orderNumber = `BHL${Date.now().toString().slice(-8)}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        order_type: 'lab_panel',
        total_amount: totalAmount,
        lab_fee: labTotal,
        authorization_fee: authorizationFee,
        draw_fee: drawFee,
        processing_fee: processingFee
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

    // Create Stripe Payment Intent
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (stripeSecretKey) {
      try {
        const paymentIntentResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            amount: totalAmount.toString(),
            currency: 'usd',
            metadata: JSON.stringify({
              order_id: order.id,
              order_number: orderNumber,
              user_id: user.id
            })
          })
        });

        if (paymentIntentResponse.ok) {
          const paymentIntent = await paymentIntentResponse.json();
          
          // Update order with payment intent
          await supabase
            .from('orders')
            .update({ stripe_payment_intent_id: paymentIntent.id })
            .eq('id', order.id);

          console.log('Payment intent created:', paymentIntent.id);
        }
      } catch (stripeError) {
        console.error('Stripe error (non-blocking):', stripeError);
      }
    }

    console.log('Lab order created successfully:', orderNumber);

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          totalAmount: order.total_amount,
          breakdown: {
            labFee: order.lab_fee,
            authorizationFee: order.authorization_fee,
            drawFee: order.draw_fee,
            processingFee: order.processing_fee
          },
          panels: panels.map(p => ({
            id: p.id,
            name: p.name,
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
    console.error('Error in create-lab-order function:', error);
    
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