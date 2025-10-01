import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  orderId: string;
  returnUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    const { orderId, returnUrl } = await req.json() as PaymentRequest;
    
    console.log('Processing payment for order:', orderId);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          lab_panels (*)
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      throw new Error('Order not found or not authorized');
    }

    if (order.status === 'paid') {
      throw new Error('Order is already paid');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if Stripe customer exists
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Map lab panel names to Stripe price IDs
    const priceMapping: Record<string, string> = {
      'Basic Health Panel': 'price_1S6FSDLVBKKFHIdpnGg5hlzq',
      'Comprehensive Metabolic': 'price_1S6FSTLVBKKFHIdp1V2s7VN5', 
      'Hormone Optimization': 'price_1S6FSfLVBKKFHIdp8VOUyq5f',
      'Methylation & Detox': 'price_1S6FSpLVBKKFHIdpLMALWkyN',
      'Cardiovascular Risk': 'price_1S6FT1LVBKKFHIdpyM5dlTIO',
      'Lab Analysis Only': 'price_1S6FTELVBKKFHIdpitZoLaiI'
    };

    // Build line items from order
    const lineItems = order.order_items.map((item: any) => {
      const panelName = item.lab_panels?.name || 'Lab Analysis Only';
      const priceId = priceMapping[panelName];
      
      if (!priceId) {
        console.error('No price mapping found for panel:', panelName);
        throw new Error(`Invalid lab panel: ${panelName}`);
      }

      return {
        price: priceId,
        quantity: item.quantity || 1,
      };
    });

    const origin = req.headers.get("origin") || returnUrl || 'https://zhdjvfylxgtiphldjtqf.supabase.co';
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/lab-marketplace?canceled=true`,
      metadata: {
        order_id: orderId,
        user_id: user.id,
        order_number: order.order_number
      }
    });

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ 
        stripe_payment_intent_id: session.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    console.log('Payment session created:', session.id, 'for order:', order.order_number);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Payment creation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create payment session' 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);