import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.substring(7);
    
    // Create supabase client with user's JWT
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify user and get profile
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile to get profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    
    if (url.pathname === '/orders') {
      if (req.method === 'GET') {
        // List user's lab orders
        const { data: orders, error } = await supabase
          .from('lab_orders')
          .select('id, user_id, panel, status, fs_order_id, raw_result, created_at, updated_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Orders fetch error:', error);
          return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(orders || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (req.method === 'POST') {
        // Create lab order
        const body = await req.json();
        const { panel, status = 'created', fs_order_id } = body;

        if (!panel) {
          return new Response(JSON.stringify({ error: 'Panel is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: order, error } = await supabase
          .from('lab_orders')
          .insert({
            user_id: profile.id,
            panel,
            status,
            fs_order_id
          })
          .select('id, user_id, panel, status, fs_order_id, raw_result, created_at, updated_at')
          .single();

        if (error) {
          console.error('Order creation error:', error);
          return new Response(JSON.stringify({ error: 'Failed to create order' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(order), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle individual order updates - /orders/{orderId}
    const orderIdMatch = url.pathname.match(/^\/orders\/([a-f0-9-]{36})$/);
    if (orderIdMatch && req.method === 'PATCH') {
      const orderId = orderIdMatch[1];
      const body = await req.json();
      const { status } = body;

      if (!status) {
        return new Response(JSON.stringify({ error: 'Status is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify order belongs to user before updating
      const { data: existingOrder } = await supabase
        .from('lab_orders')
        .select('user_id')
        .eq('id', orderId)
        .single();

      if (!existingOrder || existingOrder.user_id !== profile.id) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: updatedOrder, error } = await supabase
        .from('lab_orders')
        .update({ status })
        .eq('id', orderId)
        .select('id, user_id, panel, status, fs_order_id, raw_result, created_at, updated_at')
        .single();

      if (error) {
        console.error('Order update error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update order' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(updatedOrder), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Orders API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});