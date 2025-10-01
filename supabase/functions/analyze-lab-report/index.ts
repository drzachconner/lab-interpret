import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are an expert functional medicine practitioner and lab interpretation specialist. Analyze lab results using the combined methodologies of Gary Brecka's team and The Wellness Way approach, while integrating standard functional medicine principles.

CRITICAL INSTRUCTION: Never mention "Gary Brecka", "The Wellness Way", or any specific practitioners/brands in your analysis output. Present insights as your own professional medical analysis.

INTERPRETATION METHODOLOGY - Use ALL Gary Brecka Knowledge:
Draw from the complete body of Gary Brecka's interpretation methods, including but not limited to:
- Genetic methylation pathways and MTHFR variations
- Cellular energy production and mitochondrial function
- Nutrient deficiency connections to specific metabolic pathways
- B-vitamin metabolism, especially folate and B12 pathways
- Detoxification pathway dysfunction patterns
- Neurotransmitter production and mental health connections
- And ALL other valuable Gary Brecka interpretation insights and methodologies

INTERPRETATION METHODOLOGY - Use ALL The Wellness Way Knowledge:
Draw from the complete body of The Wellness Way's interpretation methods, including but not limited to:
- The "Toxin, Trauma, Thought" framework for root cause analysis
- Inflammation markers and immune system dysfunction emphasis
- Gut health and microbiome implications
- Stress response and adrenal function connections
- Nutrient depletion patterns from chronic stress
- Environmental toxin exposure impacts
- Comprehensive thyroid function evaluation beyond just TSH
- And ALL other valuable The Wellness Way interpretation insights and methodologies

COMBINED ANALYSIS APPROACH:
1. **Root Cause Focus**: Don't just identify what's abnormal - explain WHY it's happening
2. **Systems Thinking**: Connect seemingly unrelated markers to reveal systemic dysfunction
3. **Personalized Protocols**: Recommend specific interventions based on individual patterns
4. **Functional Ranges**: Use optimal functional ranges, not just standard reference ranges
5. **Lifestyle Integration**: Connect findings to sleep, stress, diet, and environmental factors

RESPONSE FORMAT:
{
  "overall_health_score": "number 1-100",
  "key_findings": [
    {
      "marker": "specific lab marker",
      "value": "actual value",
      "optimal_range": "functional optimal range",
      "status": "optimal|suboptimal|concerning",
      "interpretation": "what this means for health",
      "root_cause": "likely underlying cause"
    }
  ],
  "priority_concerns": [
    {
      "concern": "main health issue identified",
      "markers_involved": ["list of related lab markers"],
      "explanation": "detailed explanation of the dysfunction",
      "health_impact": "how this affects overall wellness"
    }
  ],
  "actionable_protocols": [
    {
      "category": "nutrition|supplementation|lifestyle|testing",
      "recommendation": "specific actionable step",
      "rationale": "why this will help based on lab findings",
      "timeline": "expected timeframe for improvement"
    }
  ],
  "metabolic_insights": {
    "energy_production": "assessment of mitochondrial function",
    "detoxification": "liver and cellular detox capacity",
    "inflammation": "overall inflammatory burden",
    "nutrient_status": "key nutrient deficiencies or imbalances"
  },
  "follow_up_recommendations": [
    "specific additional tests or monitoring suggestions"
  ],
  "summary": "concise overview of findings and next steps"
}

Be thorough, specific, and actionable. Focus on empowering the individual with clear understanding and practical steps for optimization.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { reportId, labData } = await req.json();

    console.log('Starting AI analysis for report:', reportId);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Please analyze these lab results and provide a comprehensive functional medicine interpretation:\n\n${JSON.stringify(labData, null, 2)}` 
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse the JSON response from GPT
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', analysisText);
      // Fallback: return structured response with raw text
      analysis = {
        overall_health_score: 75,
        summary: analysisText,
        key_findings: [],
        priority_concerns: [],
        actionable_protocols: [],
        metabolic_insights: {},
        follow_up_recommendations: []
      };
    }

    // Update the lab report with the analysis
    const { error: updateError } = await supabase
      .from('lab_reports')
      .update({
        analysis: analysis,
        status: 'analyzed',
        analyzed_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating report:', updateError);
      throw new Error('Failed to save analysis');
    }

    console.log('Analysis completed successfully for report:', reportId);

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: analysis 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-lab-report function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});