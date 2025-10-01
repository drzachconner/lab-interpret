import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, source } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'text' in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing text of length: ${text.length} characters`);

    const systemPrompt = `You are a data extraction engine that converts Fullscript lab catalog text into structured JSON for a lab testing marketplace.

EXTRACT EVERY SINGLE LAB TEST from the provided text into this EXACT JSON schema:

{
  "providers": [
    "Quest Diagnostics",
    "Access Labcorp Draw", 
    "Access Medical Labs",
    "Precision Analytical (DUTCH)",
    "Diagnostic Solutions Laboratory",
    "Mosaic Diagnostics",
    "Doctor's Data"
  ],
  "panels": [
    {
      "id": "unique-panel-id",
      "name": "Test Panel Name",
      "display_name": "Test Panel Name",
      "aliases": [],
      "category": "Chemistry|Hematology|Endocrinology|Cardiovascular|Specialized|Hormone|Nutritional|Allergy|Infectious Disease|Autoimmune|Cancer|Toxicology|Genetics",
      "subcategory": "Basic Panels|Advanced Panels|Specialized Testing",
      "specimen": "Serum|Blood|Saliva|Stool|Urine|24-Hour Urine|Plasma",
      "fasting_required": false,
      "turnaround_days": "1-3 business days",
      "biomarkers": [],
      "clinical_significance": "",
      "lab_provider": "Provider Name",
      "popular": false,
      "notes": "",
      "providers": [
        {
          "name": "Provider Name",
          "price": 12.34,
          "phlebotomy_required": true,
          "handling_fee": false,
          "notes": ""
        }
      ]
    }
  ]
}

EXTRACTION RULES:
1. Extract EVERY lab test mentioned in the text
2. Create unique IDs by converting test names to lowercase with dashes (e.g. "Basic Metabolic Panel" → "basic-metabolic-panel")
3. If same test is offered by multiple providers, combine into ONE panel with multiple providers in the providers array
4. Parse prices from "$XX.XX" format - remove $ and convert to number
5. Set handling_fee=true for Access Medical Labs tests that say "handling fee may apply"
6. Set phlebotomy_required=true if text says "Phlebotomy required"
7. Categorize tests logically (CBC=Hematology, Metabolic Panel=Chemistry, Thyroid=Endocrinology, etc.)
8. Set popular=true for common tests: CBC, CMP, BMP, Lipid Panel, TSH, A1C, PSA, Vitamin D
9. Estimate appropriate biomarkers based on test names
10. Set fasting_required=true for glucose, lipid, insulin tests

Return ONLY valid JSON with NO explanations or markdown.`;

    const userPrompt = `Extract all laboratory test panels from this Fullscript catalog text:

${text}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 16384,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", errText);
      return new Response(JSON.stringify({ error: "OpenAI_API_Error", details: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";

    console.log('Parsing AI response...');

    let json: any;
    try {
      json = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      json = { providers: [], panels: [], raw: content };
    }

    console.log(`Successfully extracted ${json.panels?.length || 0} panels`);

    return new Response(JSON.stringify(json), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in catalog-extract-ai function:", error);
    return new Response(JSON.stringify({ error: error?.message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});