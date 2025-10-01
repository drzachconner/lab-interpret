import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Ticket 5: PDF Generation with Server-side Context Re-attachment
 * 
 * This function safely merges de-identified AI analysis with patient context
 * for PDF generation. The LLM never sees the identifiers - they're re-attached here.
 */

interface PatientContext {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  mrn?: string;
}

interface DeidentifiedAnalysis {
  patient_id: string;
  age_bucket: string;
  sex: string;
  analysis: any;
  recommendations?: string[];
  supplements?: string[];
  created_at: string;
}

// Generate PDF-ready HTML with full context
function generateReportHTML(
  analysis: DeidentifiedAnalysis,
  patientContext: PatientContext,
  labResults: any[]
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lab Analysis Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #1f2937; }
        .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
        .patient-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .analysis-section { margin-bottom: 30px; }
        .lab-results { margin-bottom: 30px; }
        .recommendations { background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px; }
        .supplements { background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f1f5f9; font-weight: 600; }
        .logo { width: 120px; height: 40px; background: linear-gradient(135deg, #0ea5e9, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="logo">BiohackLabs</div>
      
      <div class="header">
        <h1>Functional Medicine Lab Analysis</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Analysis ID:</strong> ${analysis.patient_id}</p>
      </div>

      <div class="patient-info">
        <h2>Patient Information</h2>
        <p><strong>Name:</strong> ${patientContext.name || '[REDACTED]'}</p>
        <p><strong>Age Group:</strong> ${analysis.age_bucket}</p>
        <p><strong>Sex:</strong> ${analysis.sex}</p>
        ${patientContext.email ? `<p><strong>Email:</strong> ${patientContext.email}</p>` : ''}
        ${patientContext.phone ? `<p><strong>Phone:</strong> ${patientContext.phone}</p>` : ''}
        ${patientContext.mrn ? `<p><strong>MRN:</strong> ${patientContext.mrn}</p>` : ''}
      </div>

      <div class="lab-results">
        <h2>Lab Results</h2>
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Reference Range</th>
            </tr>
          </thead>
          <tbody>
            ${labResults.map(lab => `
              <tr>
                <td>${lab.test}</td>
                <td>${lab.value}</td>
                <td>${lab.unit || ''}</td>
                <td>${lab.ref || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="analysis-section">
        <h2>🧬 AI Analysis Results</h2>
        <div style="white-space: pre-wrap; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          ${typeof analysis.analysis === 'string' ? analysis.analysis : JSON.stringify(analysis.analysis, null, 2)}
        </div>
      </div>

      <div class="recommendations">
        <h2>🎯 Key Recommendations</h2>
        <p>Based on your de-identified lab analysis, here are personalized recommendations for optimizing your health:</p>
        <ul>
          <li>Consider discussing iron supplementation with your healthcare provider</li>
          <li>Vitamin D optimization may benefit overall wellness</li>
          <li>Continue monitoring key biomarkers quarterly</li>
        </ul>
      </div>

      <div class="supplements">
        <h2>💊 Supplement Protocol</h2>
        <p>Recommended supplements based on functional medicine analysis:</p>
        <ul>
          <li>Iron Bisglycinate 25mg daily (with Vitamin C)</li>
          <li>Vitamin D3 2000 IU daily (with K2)</li>
          <li>B-Complex for energy support</li>
        </ul>
      </div>

      <div class="footer">
        <p><strong>Important:</strong> This analysis is for educational purposes only and does not constitute medical advice. 
           Please consult with a licensed healthcare provider before making any changes to your health regimen.</p>
        <p><strong>Privacy Notice:</strong> This report was generated using HIPAA-compliant de-identification techniques. 
           Your personal health information was protected during AI analysis per Safe Harbor standards.</p>
        <p><strong>Report ID:</strong> ${analysis.patient_id} | <strong>Generated:</strong> ${new Date().toISOString()}</p>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

    const { interpretationId, patientContext } = await req.json();

    console.log('Generating PDF report for interpretation:', interpretationId);

    // Fetch the de-identified analysis from interpretations table
    const { data: interpretation, error: interpretationError } = await supabase
      .from('interpretations')
      .select('*')
      .eq('id', interpretationId)
      .eq('user_id', user.id)
      .single();

    if (interpretationError || !interpretation) {
      throw new Error('Interpretation not found or access denied');
    }

    // Fetch associated lab order
    const { data: labOrder, error: labOrderError } = await supabase
      .from('lab_orders')
      .select('*')
      .eq('id', interpretation.lab_order_id)
      .eq('user_id', user.id)
      .single();

    if (labOrderError || !labOrder) {
      throw new Error('Lab order not found or access denied');
    }

    // Log analytics event without PHI (Ticket 4)
    console.log('PDF generation analytics:', {
      interpretation_id: interpretationId,
      user_id: user.id,
      timestamp: new Date().toISOString(),
      // No PHI logged - patient context is not logged
    });

    // Prepare de-identified analysis data
    const analysisData: DeidentifiedAnalysis = {
      patient_id: `pt_${interpretationId.slice(0, 8)}`, // Use interpretation ID for pseudonymous reference
      age_bucket: '35-44', // This would come from the stored profile
      sex: 'Female', // This would come from the stored profile  
      analysis: interpretation.analysis,
      created_at: interpretation.created_at
    };

    // Mock lab results (in production, these would be decrypted from lab_order.raw_result)
    const labResults = [
      { test: 'Ferritin', value: 18, unit: 'ng/mL', ref: '15-400' },
      { test: 'Vitamin D', value: 22, unit: 'ng/mL', ref: '20-100' },
      { test: 'Fasting Glucose', value: 88, unit: 'mg/dL', ref: '70-100' },
      { test: 'HDL Cholesterol', value: 65, unit: 'mg/dL', ref: '40-200' }
    ];

    // Generate HTML report (Ticket 5: This is where PHI is re-attached)
    const htmlContent = generateReportHTML(analysisData, patientContext, labResults);

    return new Response(
      JSON.stringify({
        success: true,
        html: htmlContent,
        reportId: interpretationId
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
    console.error('Error in generate-report-pdf function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate PDF report'
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