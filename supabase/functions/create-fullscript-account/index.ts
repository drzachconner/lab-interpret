import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FullscriptAccountRequest {
  userId: string;
  email: string;
  fullName: string;
  accountType: 'analysis' | 'dispensary';
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

    const { userId, email, fullName, accountType }: FullscriptAccountRequest = await req.json();

    // Verify the user ID matches the authenticated user
    if (userId !== user.id) {
      throw new Error('User ID mismatch');
    }

    console.log('Creating Fullscript account for:', { userId, email, accountType });

    // Get Fullscript API key
    const fullscriptApiKey = Deno.env.get('FULLSCRIPT_API_KEY');
    if (!fullscriptApiKey) {
      throw new Error('Fullscript API key not configured');
    }

    // Create Fullscript patient account using their API
    try {
      const fullscriptResponse = await fetch('https://api.fullscript.com/api/v1/patients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fullscriptApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          first_name: fullName.split(' ')[0] || fullName,
          last_name: fullName.split(' ').slice(1).join(' ') || '',
          patient_type: accountType === 'analysis' ? 'patient' : 'practitioner',
          send_invitation: true
        })
      });

      if (!fullscriptResponse.ok) {
        const errorText = await fullscriptResponse.text();
        console.error('Fullscript API error:', errorText);
        
        // If account already exists, fetch existing account
        if (fullscriptResponse.status === 409) {
          const existingAccountResponse = await fetch(`https://api.fullscript.com/api/v1/patients?email=${encodeURIComponent(email)}`, {
            headers: {
              'Authorization': `Bearer ${fullscriptApiKey}`,
              'Accept': 'application/json'
            }
          });
          
          if (existingAccountResponse.ok) {
            const existingData = await existingAccountResponse.json();
            if (existingData.data && existingData.data.length > 0) {
              const existingPatient = existingData.data[0];
              const fullscriptAccountId = existingPatient.id;
              const dispensaryUrl = `https://supplements.fullscript.com/patients/${fullscriptAccountId}/recommendations`;
              
              console.log('Using existing Fullscript account:', fullscriptAccountId);
              
              // Store the account info
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  fullscript_account_id: fullscriptAccountId,
                  dispensary_url: dispensaryUrl,
                  account_type: accountType,
                  dispensary_access: true,
                  updated_at: new Date().toISOString()
                })
                .eq('auth_id', userId);

              if (updateError) {
                console.error('Error updating profile:', updateError);
                throw new Error('Failed to update user profile');
              }

              return new Response(
                JSON.stringify({
                  success: true,
                  fullscriptAccountId,
                  dispensaryUrl,
                  message: 'Fullscript account linked successfully'
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
          }
        }
        
        throw new Error(`Fullscript API error: ${errorText}`);
      }

      const fullscriptData = await fullscriptResponse.json();
      const fullscriptAccountId = fullscriptData.data.id;
      const dispensaryUrl = `https://supplements.fullscript.com/patients/${fullscriptAccountId}/recommendations`;
      
      console.log('Fullscript account created:', fullscriptAccountId);
      
      // Store the account info in user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          fullscript_account_id: fullscriptAccountId,
          dispensary_url: dispensaryUrl,
          account_type: accountType,
          dispensary_access: true,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error('Failed to update user profile');
      }

      return new Response(
        JSON.stringify({
          success: true,
          fullscriptAccountId,
          dispensaryUrl,
          message: 'Fullscript account created successfully'
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
      console.error('Fullscript API integration error:', apiError);
      
      // Fallback to mock account for demo purposes
      console.log('Falling back to mock account creation for demo');
      const fullscriptAccountId = `fs_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const dispensaryUrl = `https://supplements.labpilot.com/patient/${fullscriptAccountId}`;
      
      // Store the mock account info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          fullscript_account_id: fullscriptAccountId,
          dispensary_url: dispensaryUrl,
          account_type: accountType,
          dispensary_access: true,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error('Failed to update user profile');
      }

      return new Response(
        JSON.stringify({
          success: true,
          fullscriptAccountId,
          dispensaryUrl,
          message: 'Demo Fullscript account created successfully',
          demo: true
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
    console.error('Error in create-fullscript-account function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create Fullscript account'
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