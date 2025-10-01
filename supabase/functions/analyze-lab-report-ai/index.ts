import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// De-identification types and utilities (HIPAA Safe Harbor compliant)
type RawLabResult = {
  patient_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  sex?: 'Male' | 'Female' | 'Other' | 'Unknown';
  age?: number;
  notes?: string;
  labs: Array<{
    test: string;
    value: number;
    unit?: string;
    ref?: string;
  }>;
};

type DeidentifiedPayload = {
  patient_id: string;
  age_bucket: string;
  sex: 'Male' | 'Female' | 'Other' | 'Unknown';
  labs: Array<{
    test: string;
    value: number;
    unit?: string;
    ref?: string;
  }>;
  context?: Record<string, string | number | boolean>;
};

// Age bucketing for HIPAA compliance
const AGE_BUCKETS = [
  [0, 1], [2, 5], [6, 12], [13, 17],
  [18, 24], [25, 34], [35, 44], [45, 54],
  [55, 64], [65, 74], [75, 89], // 90+ handled separately
] as const;

function bucketAge(age?: number): string {
  if (age == null || Number.isNaN(age)) return 'Unknown';
  if (age >= 90) return '90+';
  for (const [lo, hi] of AGE_BUCKETS) {
    if (age >= lo && age <= hi) return `${lo}-${hi}`;
  }
  return 'Unknown';
}

// PHI detection patterns
const PATTERNS: Record<string, RegExp> = {
  phone: /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/,
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/,
  date: /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/,
  nameLike: /\b(Mr\.|Mrs\.|Ms\.|Dr\.|Patient|DOB|SSN|Address|Name)\b/i,
};

function containsPHI(obj: unknown): string[] {
  const hits: string[] = [];
  const walker = (val: any) => {
    if (val == null) return;
    if (typeof val === 'string') {
      for (const [label, regex] of Object.entries(PATTERNS)) {
        if (regex.test(val)) hits.push(label);
      }
    } else if (Array.isArray(val)) {
      val.forEach(walker);
    } else if (typeof val === 'object') {
      Object.values(val).forEach(walker);
    }
  };
  walker(obj);
  return Array.from(new Set(hits));
}

function deidentifyLabPayload(input: RawLabResult): { safe: DeidentifiedPayload; blocked?: { reason: string; details?: any } } {
  if (!input?.labs || !Array.isArray(input.labs) || input.labs.length === 0) {
    return { safe: {} as any, blocked: { reason: 'No labs' } };
  }

  // Scan for PHI in free text and top-level fields
  const freeTextHits = containsPHI(input.notes);
  const topLevelHits = containsPHI({
    patient_name: input.patient_name, email: input.email, phone: input.phone,
    dob: input.dob,
  });

  if (freeTextHits.length || topLevelHits.length) {
    return {
      safe: {} as any,
      blocked: {
        reason: 'PHI detected - data blocked from LLM transmission for HIPAA compliance',
        details: { freeTextHits, topLevelHits },
      },
    };
  }

  // Build safe, de-identified payload
  const labs = input.labs
    .filter(l => typeof l.value === 'number' && Number.isFinite(l.value))
    .map(l => ({
      test: String(l.test || '').slice(0, 120),
      value: Number(l.value),
      unit: l.unit ? String(l.unit).slice(0, 32) : undefined,
      ref: l.ref ? String(l.ref).slice(0, 64) : undefined,
    }));

  const patient_id = `pt_${Math.random().toString(36).slice(2, 8)}`;

  return {
    safe: {
      patient_id,
      age_bucket: bucketAge(input.age),
      sex: input.sex ?? 'Unknown',
      labs,
    }
  };
}

const BIOHACK_SYSTEM_PROMPT = `You are BiohackLabs AI, a clinical-grade assistant that:

Interprets DE-IDENTIFIED lab results through a functional medicine + biohacking lens.
Uses optimal/functional ranges in addition to conventional reference ranges.
Produces actionable, science-aware, and safety-conscious guidance.
Generates supplement protocols that map to the provided Fullscript catalog.
Does not diagnose or treat; outputs are educational and advise users to consult a licensed clinician.

IMPORTANT: This data has been de-identified for HIPAA compliance. You are receiving:
- Pseudonymous patient_id (not real identifier)
- Age bucket (e.g., "35-44", never exact age)
- Sex (if provided)
- Lab analytes with values, units, and reference ranges only

Guardrails:
- No diagnosis or disease claims. Use language like "may suggest," "consistent with," "consider discussing."
- Respect contraindications (pregnancy, meds, conditions) and flag interactions.
- Do not mention specific personalities or brands as sources of interpretation.
- Stay within scope: lifestyle, nutrition, sleep, stress, training, and supplement guidance.
- Provide both clickable URLs and plain URLs (as text) for users who view PDFs or printouts.
- If required data are missing, state assumptions and clearly label uncertainty.
- Never reference any personal identifiers (there aren't any)

Always return a valid JSON object matching the schema first, then a human-readable Markdown report after the JSON.`;

interface LabResult {
  name: string;
  value: number;
  units: string;
  ref_low: number;
  ref_high: number;
  collected_at: string;
  lab: string;
}

interface PatientProfile {
  age: number;
  sex: string;
  height_cm?: number;
  weight_kg?: number;
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
  diet_pattern?: string;
  goals?: string[];
}

interface SupplementProduct {
  id: string;
  name: string;
  brand: string;
  ingredients: Array<{name: string, amount: string}>;
  form: string;
  size: string;
  deep_link_url: string;
  price: number;
  contraindications?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
    
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

    const { 
      labReportId, 
      patientProfile, 
      labResults, 
      functionalRanges 
    } = await req.json();

    console.log('Processing HIPAA-safe AI analysis for lab report:', labReportId);

    // Convert raw lab data to HIPAA-safe format
    const rawLabInput: RawLabResult = {
      patient_name: patientProfile?.name,
      email: patientProfile?.email,
      phone: patientProfile?.phone,
      dob: patientProfile?.dateOfBirth,
      age: patientProfile?.age,
      sex: patientProfile?.sex || patientProfile?.gender,
      notes: patientProfile?.notes,
      labs: labResults || []
    };

    // De-identify before sending to LLM
    const deidentificationResult = deidentifyLabPayload(rawLabInput);
    
    if (deidentificationResult.blocked) {
      // Log without PHI for debugging (Ticket 4)
      console.error('Lab data blocked due to PHI:', {
        reason: deidentificationResult.blocked.reason,
        lab_report_id: labReportId,
        detected_patterns: deidentificationResult.blocked.details ? Object.keys(deidentificationResult.blocked.details) : [],
        timestamp: new Date().toISOString()
      });
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Lab data contains personally identifiable information and cannot be processed',
          details: deidentificationResult.blocked.reason 
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      )
    }

    const safePayload = deidentificationResult.safe;
    
    // Log only de-identified data for analytics (Ticket 4)
    console.log('De-identified payload ready for LLM:', { 
      patient_id: safePayload.patient_id, 
      age_bucket: safePayload.age_bucket, 
      sex: safePayload.sex,
      lab_count: safePayload.labs.length,
      lab_report_id: labReportId,
      timestamp: new Date().toISOString()
    });

    // Get supplement catalog from database (sample data for now)
    const { data: supplements } = await supabase
      .from('supplement_products')
      .select('*')
      .eq('is_active', true)
      .limit(20);

    const fullscriptCatalog = supplements?.map(s => ({
      id: s.fullscript_id,
      name: s.name,
      brand: s.brand,
      ingredients: s.ingredients || [],
      form: s.form || 'capsule',
      size: s.size_info || '60 count',
      deep_link_url: s.deep_link_url || '',
      price: (s.price_cents || 0) / 100,
      contraindications: s.contraindications || []
    })) || [];

    // Prepare the HIPAA-safe analysis request
    const analysisRequest = {
      deidentified_patient: safePayload,
      functional_ranges: functionalRanges || [],
      fullscript_catalog: fullscriptCatalog,
      analysis_context: "HIPAA-compliant de-identified lab analysis"
    };

    console.log('Sending de-identified analysis request to OpenAI...');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: BIOHACK_SYSTEM_PROMPT 
          },
          { 
            role: 'user', 
            content: `Please analyze the following DE-IDENTIFIED lab results and provide recommendations:

IMPORTANT: This data has been de-identified per HIPAA Safe Harbor standards. No personal identifiers are included.

${JSON.stringify(analysisRequest, null, 2)}`
          }
        ],
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    console.log('AI analysis completed, storing in new schema...');

    // Store the analysis in the interpretations table (Ticket 2)
    const { data: interpretation, error: interpretationError } = await supabase
      .from('interpretations')
      .insert({
        user_id: user.id,
        lab_order_id: labReportId, // Using lab report ID as lab order reference for now
        analysis: {
          raw_response: analysis,
          generated_at: new Date().toISOString(),
          model_used: 'gpt-5-2025-08-07',
          deidentified_payload: safePayload // Store the de-identified data that was sent to LLM
        }
      })
      .select()
      .single();

    if (interpretationError) {
      console.error('Error storing interpretation:', interpretationError);
      throw new Error('Failed to store analysis results');
    }

    // Update lab report with reference to interpretation
    const { error: updateError } = await supabase
      .from('lab_reports')
      .update({
        ai_analysis: { 
          interpretation_id: interpretation.id,
          generated_at: new Date().toISOString(),
          model_used: 'gpt-5-2025-08-07'
        },
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', labReportId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating lab report:', updateError);
      throw new Error('Failed to update lab report status');
    }

    console.log('Analysis saved successfully to interpretations table');

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        labReportId
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
    console.error('Error in analyze-lab-report-ai function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to analyze lab report'
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