import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-INTERPRET-RESULTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');
    
    const { labResults, patientProfile, labPanelId } = await req.json()
    
    if (!labResults || !patientProfile) {
      throw new Error('Missing required parameters: labResults and patientProfile');
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    
    logStep('Getting functional ranges from database');
    
    // Get functional ranges for interpretation
    const { data: functionalRanges, error: rangesError } = await supabase
      .from('functional_ranges')
      .select('*')
    
    if (rangesError) {
      console.error('Error fetching functional ranges:', rangesError);
    }
    
    logStep('Preparing AI analysis prompt');
    
    // Create comprehensive prompt for biohacking analysis
    const systemPrompt = `You are an expert functional medicine doctor and biohacking specialist. Analyze these lab results with a focus on optimization, performance, and longevity.

ANALYSIS FRAMEWORK:
1. OPTIMAL RANGES: Use functional/optimal ranges, not just standard lab ranges
2. BIOHACKING FOCUS: Emphasize performance, energy, longevity, and cognitive enhancement
3. ROOT CAUSE: Look for underlying metabolic, hormonal, and nutritional imbalances
4. ACTIONABLE: Provide specific, measurable recommendations

PATIENT CONTEXT:
- Age: ${patientProfile.age || 'Not specified'}
- Sex: ${patientProfile.sex || 'Not specified'}
- Health Goals: ${JSON.stringify(patientProfile.health_goals || [])}
- Activity Level: ${patientProfile.activity_level || 'Not specified'}

FUNCTIONAL RANGES DATABASE:
${JSON.stringify(functionalRanges, null, 2)}

Provide analysis in this exact JSON format:
{
  "overall_health_score": 85,
  "key_findings": [
    {
      "biomarker": "Testosterone",
      "current_value": "450 ng/dL",
      "optimal_range": "600-900 ng/dL",
      "status": "suboptimal",
      "impact": "May contribute to low energy and reduced muscle building capacity",
      "priority": "high"
    }
  ],
  "optimization_protocols": {
    "supplements": [
      {
        "name": "Vitamin D3",
        "dosage": "5000 IU daily",
        "rationale": "Low vitamin D correlates with low testosterone",
        "timing": "with fat-containing meal",
        "duration": "3 months, then retest"
      }
    ],
    "lifestyle": [
      {
        "category": "exercise",
        "recommendation": "Heavy compound lifting 3x/week",
        "rationale": "Stimulates testosterone production"
      }
    ],
    "nutrition": [
      {
        "category": "macros",
        "recommendation": "Increase healthy fats to 30% of calories",
        "rationale": "Cholesterol is precursor to hormone synthesis"
      }
    ]
  },
  "retest_recommendations": [
    {
      "timeframe": "8-12 weeks",
      "biomarkers": ["Total Testosterone", "Free Testosterone", "Vitamin D"],
      "rationale": "Monitor response to optimization protocol"
    }
  ],
  "red_flags": [],
  "performance_insights": {
    "energy_optimization": "Focus on thyroid and adrenal support",
    "cognitive_enhancement": "Address B12 and inflammation markers",
    "athletic_performance": "Optimize testosterone and recovery markers"
  }
}`;

    const userPrompt = `Analyze these lab results:
${JSON.stringify(labResults, null, 2)}`;

    logStep('Sending request to OpenAI');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        max_completion_tokens: 4000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json()
    const analysis = data.choices[0].message.content
    
    logStep('AI analysis completed');
    
    // Parse the JSON response
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback to returning raw text if JSON parsing fails
      parsedAnalysis = {
        raw_analysis: analysis,
        error: 'Failed to parse structured response'
      };
    }
    
    logStep('Saving interpretation to database');
    
    // Save interpretation to database
    const { data: interpretation, error: saveError } = await supabase
      .from('interpretations')
      .insert({
        user_id: patientProfile.user_id,
        lab_order_id: labPanelId,
        analysis: parsedAnalysis
      })
      .select()
      .single()
    
    if (saveError) {
      console.error('Error saving interpretation:', saveError);
      throw new Error(`Failed to save interpretation: ${saveError.message}`);
    }
    
    logStep('Analysis completed successfully');
    
    return new Response(JSON.stringify({
      success: true,
      interpretation: parsedAnalysis,
      interpretation_id: interpretation.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error: any) {
    logStep('ERROR in ai-interpret-results', { message: error.message });
    console.error('Error in AI interpretation:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})