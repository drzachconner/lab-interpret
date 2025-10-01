import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoLoginRequest {
  dispensaryUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { dispensaryUrl }: AutoLoginRequest = await req.json();

    console.log('Generating auto-login for user:', user.id, 'dispensary:', dispensaryUrl);

    // Get Fullscript API key
    const fullscriptApiKey = Deno.env.get('FULLSCRIPT_API_KEY');
    if (!fullscriptApiKey) {
      throw new Error('Fullscript API key not configured');
    }

    // Get user profile to get Fullscript account ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('fullscript_account_id')
      .eq('auth_id', user.id)
      .single();

    if (profileError || !profile?.fullscript_account_id) {
      throw new Error('No Fullscript account found for user');
    }

    // Generate single sign-on token from Fullscript API
    try {
      const ssoResponse = await fetch(`https://api.fullscript.com/api/v1/patients/${profile.fullscript_account_id}/sso_token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fullscriptApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          redirect_url: dispensaryUrl
        })
      });

      if (!ssoResponse.ok) {
        const errorText = await ssoResponse.text();
        console.error('Fullscript SSO API error:', errorText);
        
        // If SSO fails, return the original URL
        return new Response(
          JSON.stringify({
            success: true,
            loginUrl: dispensaryUrl,
            autoLogin: false,
            message: 'Direct access to dispensary (SSO unavailable)'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      const ssoData = await ssoResponse.json();
      const loginUrl = ssoData.data.sso_url;
      
      console.log('SSO token generated successfully');
      
      return new Response(
        JSON.stringify({
          success: true,
          loginUrl,
          autoLogin: true,
          message: 'Auto-login token generated successfully'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
      
    } catch (apiError: any) {
      console.error('Fullscript SSO API integration error:', apiError);
      
      // Fallback to direct URL
      return new Response(
        JSON.stringify({
          success: true,
          loginUrl: dispensaryUrl,
          autoLogin: false,
          message: 'Direct access to dispensary (SSO failed)'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

  } catch (error: any) {
    console.error('Error in fullscript-auto-login function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate auto-login'
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