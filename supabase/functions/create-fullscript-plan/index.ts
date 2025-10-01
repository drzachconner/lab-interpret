import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating Fullscript plan...');
    
    const { labIds, userId, zipCode } = await req.json()
    
    if (!labIds || !userId || !zipCode) {
      throw new Error('Missing required parameters: labIds, userId, zipCode');
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    const fullscriptApiKey = Deno.env.get('FULLSCRIPT_API_KEY');
    if (!fullscriptApiKey) {
      throw new Error('FULLSCRIPT_API_KEY not configured');
    }
    
    console.log('Getting user profile...');
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('fullscript_account_id, auth_id')
      .eq('id', userId)
      .single()
    
    if (profileError) {
      console.error('Profile error:', profileError);
      throw new Error(`Failed to get user profile: ${profileError.message}`);
    }
    
    // Create Fullscript patient if needed
    if (!profile.fullscript_account_id) {
      console.log('Creating Fullscript patient...');
      
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.auth_id)
      
      if (userError) {
        console.error('User auth error:', userError);
        throw new Error(`Failed to get user data: ${userError.message}`);
      }
      
      const patientResponse = await fetch('https://api.fullscript.com/v1/patients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fullscriptApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.user.email,
          first_name: userData.user.user_metadata?.first_name || userData.user.email?.split('@')[0] || 'User',
          last_name: userData.user.user_metadata?.last_name || '',
          send_welcome_email: false
        })
      })
      
      if (!patientResponse.ok) {
        const errorText = await patientResponse.text();
        console.error('Fullscript patient creation error:', errorText);
        throw new Error(`Failed to create Fullscript patient: ${patientResponse.status}`);
      }
      
      const patient = await patientResponse.json()
      profile.fullscript_account_id = patient.id
      
      await supabase
        .from('profiles')
        .update({ fullscript_account_id: patient.id })
        .eq('id', userId)
      
      console.log('Fullscript patient created:', patient.id);
    }
    
    console.log('Getting lab details...');
    
    // Get lab details to calculate service fee
    const { data: labs, error: labsError } = await supabase
      .from('lab_panels')
      .select('*')
      .in('fullscript_lab_id', labIds)
    
    if (labsError) {
      console.error('Labs error:', labsError);
      throw new Error(`Failed to get lab details: ${labsError.message}`);
    }
    
    if (!labs || labs.length === 0) {
      throw new Error('No labs found for the provided IDs');
    }
    
    // Calculate total service fee
    const totalLabCost = labs.reduce((sum, lab) => sum + (lab.base_price || 0), 0)
    const totalServiceFee = labs.reduce((sum, lab) => sum + (lab.suggested_service_fee || 75), 0)
    
    console.log(`Lab cost: $${totalLabCost}, Service fee: $${totalServiceFee}`);
    
    // Create treatment plan with service fee
    const planResponse = await fetch('https://api.fullscript.com/v1/treatment_plans', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fullscriptApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patient_id: profile.fullscript_account_id,
        name: `Lab Order - ${new Date().toLocaleDateString()}`,
        lab_tests: labIds,
        custom_fee: {
          amount: totalServiceFee * 100, // Convert to cents
          description: "AI-Powered Biohacking Analysis & Optimization Protocol"
        },
        send_to_patient: true,
        message: `Your personalized lab panel is ready. This includes comprehensive AI analysis and supplement recommendations. Total: $${totalLabCost + totalServiceFee}`
      })
    })
    
    if (!planResponse.ok) {
      const errorText = await planResponse.text();
      console.error('Fullscript plan creation error:', errorText);
      throw new Error(`Failed to create Fullscript plan: ${planResponse.status}`);
    }
    
    const plan = await planResponse.json()
    console.log('Fullscript plan created:', plan.id);
    
    // Save order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_type: 'lab_panel',
        status: 'pending',
        fullscript_order_id: plan.id,
        total_amount: (totalLabCost + totalServiceFee) * 100, // in cents
        lab_fee: totalLabCost * 100,
        authorization_fee: totalServiceFee * 100
      })
      .select()
      .single()
    
    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }
    
    console.log('Order created successfully');
    
    return new Response(JSON.stringify({
      success: true,
      checkoutUrl: plan.patient_portal_url,
      orderId: order.id,
      breakdown: {
        labs: totalLabCost,
        serviceFee: totalServiceFee,
        total: totalLabCost + totalServiceFee
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Error creating Fullscript plan:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})