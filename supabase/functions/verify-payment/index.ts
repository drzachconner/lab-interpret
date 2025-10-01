import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  sessionId: string;
  orderId: string;
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
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      const user = data.user;
      
      if (!user) {
        throw new Error("User not authenticated");
      }
    }

    const { sessionId, orderId } = await req.json() as VerifyPaymentRequest;
    
    console.log('Verifying payment for session:', sessionId, 'order:', orderId);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      throw new Error('Checkout session not found');
    }

    console.log('Session status:', session.payment_status);

    // Check if payment was successful
    if (session.payment_status === 'paid') {
      // Update order status to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('stripe_payment_intent_id', sessionId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        throw new Error('Failed to update order status');
      }

      // Get updated order details
      const { data: order } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            lab_panels (name)
          )
        `)
        .eq('id', orderId)
        .single();

      console.log('Order payment verified and status updated:', order?.order_number);

      return new Response(
        JSON.stringify({
          success: true,
          payment_status: 'paid',
          order: {
            id: order?.id,
            orderNumber: order?.order_number,
            status: order?.status,
            totalAmount: order?.total_amount,
            items: order?.order_items?.map((item: any) => ({
              name: item.lab_panels?.name,
              quantity: item.quantity,
              price: item.unit_price
            }))
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          payment_status: session.payment_status,
          message: 'Payment not completed'
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

  } catch (error: any) {
    console.error('Payment verification error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to verify payment'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);