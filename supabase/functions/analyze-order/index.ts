import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

// De-identification utilities
function deidentifyLabPayload(labData: any, profile: any): any {
  const patientId = `pt_${labData.id?.slice(-6) || Math.random().toString(36).slice(2, 8)}`;
  
  return {
    patient_id: patientId,
    age_bucket: profile?.age_bucket || 'Unknown',
    sex: profile?.sex || 'Unknown',
    labs: extractLabValues(labData.raw_result),
    context: {
      panel: labData.panel,
      collection_date: labData.created_at
    }
  };
}

function extractLabValues(rawResult: any): any[] {
  if (!rawResult) return [];
  
  // Basic extraction - you can enhance this based on your lab data format
  const labs = [];
  
  if (Array.isArray(rawResult.tests)) {
    for (const test of rawResult.tests) {
      labs.push({
        test: test.name || test.test,
        value: test.value,
        unit: test.unit || test.units,
        ref: test.reference_range || test.ref_range
      });
    }
  }
  
  return labs;
}

async function analyzeWithOpenAI(deidentifiedPayload: any): Promise<any> {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are a medical AI assistant that provides health insights based on lab results. 

IMPORTANT: The data has been de-identified. You will receive:
- A patient ID (not real, for tracking only)
- Age bucket and sex (demographic info only)
- Lab values with test names, values, units, and reference ranges

Provide analysis in this JSON format:
{
  "flags": ["any abnormal values or patterns"],
  "insights": ["key health insights based on the data"],
  "supplements": ["specific supplement recommendations with dosages"],
  "lifestyle": ["lifestyle modifications recommended"],
  "follow_up_labs": ["suggested follow-up tests and timing"]
}

Be specific with supplement recommendations (include brands if helpful) and provide actionable lifestyle advice.`;

  const userPrompt = `Analyze these lab results:

Patient: ${deidentifiedPayload.patient_id}
Demographics: ${deidentifiedPayload.age_bucket}, ${deidentifiedPayload.sex}
Panel: ${deidentifiedPayload.context?.panel}

Lab Values:
${deidentifiedPayload.labs.map((lab: any) => 
  `${lab.test}: ${lab.value} ${lab.unit || ''} (Ref: ${lab.ref || 'N/A'})`
).join('\n')}

Provide comprehensive biohacking insights and recommendations.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (e) {
    // If not valid JSON, wrap in a structure
    return {
      flags: [],
      insights: [content],
      supplements: [],
      lifestyle: [],
      follow_up_labs: []
    };
  }
}

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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, sex, age_bucket')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { lab_order_id } = body;

      if (!lab_order_id) {
        return new Response(JSON.stringify({ error: 'lab_order_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get the lab order and verify ownership
      const { data: labOrder, error: orderError } = await supabase
        .from('lab_orders')
        .select('id, user_id, panel, raw_result, created_at')
        .eq('id', lab_order_id)
        .eq('user_id', profile.id)
        .single();

      if (orderError || !labOrder) {
        console.error('Lab order fetch error:', orderError);
        return new Response(JSON.stringify({ error: 'Lab order not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!labOrder.raw_result) {
        return new Response(JSON.stringify({ error: 'No lab results available for analysis' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if interpretation already exists
      const { data: existingInterpretation } = await supabase
        .from('interpretations')
        .select('id')
        .eq('lab_order_id', lab_order_id)
        .maybeSingle();

      if (existingInterpretation) {
        return new Response(JSON.stringify({ 
          interpretation_id: existingInterpretation.id,
          status: 'already_exists'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // De-identify the lab data
      const deidentifiedPayload = deidentifyLabPayload(labOrder, profile);
      console.log('De-identified payload:', JSON.stringify(deidentifiedPayload, null, 2));

      // Analyze with OpenAI
      let analysis;
      try {
        analysis = await analyzeWithOpenAI(deidentifiedPayload);
      } catch (error) {
        console.error('Analysis error:', error);
        return new Response(JSON.stringify({ error: 'Analysis failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Store the interpretation
      const { data: interpretation, error: insertError } = await supabase
        .from('interpretations')
        .insert({
          user_id: profile.id,
          lab_order_id: lab_order_id,
          analysis: analysis
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Interpretation storage error:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to store interpretation' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        interpretation_id: interpretation.id,
        status: 'ok'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analyze order error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});