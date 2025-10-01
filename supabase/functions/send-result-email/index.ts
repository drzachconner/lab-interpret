import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-RESULT-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');
    
    const { userId, interpretationId, recipientEmail, patientName } = await req.json()
    
    if (!userId || !interpretationId || !recipientEmail) {
      throw new Error('Missing required parameters: userId, interpretationId, recipientEmail');
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    
    const resend = new Resend(resendApiKey);
    
    logStep('Fetching interpretation from database');
    
    // Get the interpretation data
    const { data: interpretation, error: interpretationError } = await supabase
      .from('interpretations')
      .select(`
        *,
        lab_orders(
          panel,
          created_at
        )
      `)
      .eq('id', interpretationId)
      .single()
    
    if (interpretationError) {
      console.error('Error fetching interpretation:', interpretationError);
      throw new Error(`Failed to fetch interpretation: ${interpretationError.message}`);
    }
    
    const analysis = interpretation.analysis;
    const healthScore = analysis.overall_health_score || 'N/A';
    const keyFindings = analysis.key_findings || [];
    const supplementProtocol = analysis.optimization_protocols?.supplements || [];
    const lifestyleRecommendations = analysis.optimization_protocols?.lifestyle || [];
    
    logStep('Generating email content');
    
    // Generate email HTML content
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .score-badge { background: #4CAF50; color: white; padding: 15px 25px; border-radius: 50px; font-size: 24px; font-weight: bold; display: inline-block; margin: 20px 0; }
        .section { margin: 30px 0; padding: 20px; border-radius: 8px; background: #f9f9f9; }
        .finding { margin: 15px 0; padding: 15px; border-left: 4px solid #667eea; background: white; }
        .finding.high { border-left-color: #ff4444; }
        .finding.medium { border-left-color: #ffaa00; }
        .finding.low { border-left-color: #4CAF50; }
        .supplement { margin: 10px 0; padding: 12px; background: white; border-radius: 5px; border: 1px solid #ddd; }
        .lifestyle { margin: 10px 0; padding: 12px; background: #e8f5e8; border-radius: 5px; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; background: #f0f0f0; border-radius: 8px; }
        .disclaimer { font-size: 12px; color: #666; margin-top: 20px; line-height: 1.4; }
        h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        h3 { color: #555; }
        .status { font-weight: bold; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.optimal { background: #4CAF50; color: white; }
        .status.suboptimal { background: #ffaa00; color: white; }
        .status.concerning { background: #ff4444; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧬 Your Biohacking Lab Analysis</h1>
        <p>AI-Powered Functional Medicine Interpretation</p>
        <div class="score-badge">Health Score: ${healthScore}/100</div>
    </div>

    <div class="section">
        <h2>📊 Key Findings</h2>
        ${keyFindings.map(finding => `
            <div class="finding ${finding.priority}">
                <h3>${finding.biomarker}</h3>
                <p><strong>Your Value:</strong> ${finding.current_value}</p>
                <p><strong>Optimal Range:</strong> ${finding.optimal_range}</p>
                <p><strong>Status:</strong> <span class="status ${finding.status}">${finding.status}</span></p>
                <p><strong>Impact:</strong> ${finding.impact}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>💊 Supplement Protocol</h2>
        <p>Based on your biomarkers, here's your personalized optimization protocol:</p>
        ${supplementProtocol.map(supplement => `
            <div class="supplement">
                <h3>${supplement.name}</h3>
                <p><strong>Dosage:</strong> ${supplement.dosage}</p>
                <p><strong>Timing:</strong> ${supplement.timing || 'As directed'}</p>
                <p><strong>Duration:</strong> ${supplement.duration || 'Ongoing'}</p>
                <p><strong>Why:</strong> ${supplement.rationale}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>🏃 Lifestyle Optimization</h2>
        ${lifestyleRecommendations.map(lifestyle => `
            <div class="lifestyle">
                <h3>${lifestyle.category?.toUpperCase()}</h3>
                <p><strong>Recommendation:</strong> ${lifestyle.recommendation}</p>
                <p><strong>Why:</strong> ${lifestyle.rationale}</p>
            </div>
        `).join('')}
    </div>

    ${analysis.performance_insights ? `
    <div class="section">
        <h2>⚡ Performance Insights</h2>
        <div class="lifestyle">
            <h3>ENERGY OPTIMIZATION</h3>
            <p>${analysis.performance_insights.energy_optimization}</p>
        </div>
        <div class="lifestyle">
            <h3>COGNITIVE ENHANCEMENT</h3>
            <p>${analysis.performance_insights.cognitive_enhancement}</p>
        </div>
        <div class="lifestyle">
            <h3>ATHLETIC PERFORMANCE</h3>
            <p>${analysis.performance_insights.athletic_performance}</p>
        </div>
    </div>
    ` : ''}

    ${analysis.retest_recommendations?.length > 0 ? `
    <div class="section">
        <h2>🔄 Follow-up Testing</h2>
        ${analysis.retest_recommendations.map(retest => `
            <div class="lifestyle">
                <h3>RETEST IN ${retest.timeframe?.toUpperCase()}</h3>
                <p><strong>Biomarkers:</strong> ${retest.biomarkers?.join(', ')}</p>
                <p><strong>Why:</strong> ${retest.rationale}</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="footer">
        <h3>🎯 Next Steps</h3>
        <p>1. Start your supplement protocol gradually</p>
        <p>2. Implement lifestyle changes one at a time</p>
        <p>3. Track your energy, sleep, and performance</p>
        <p>4. Schedule follow-up testing as recommended</p>
        
        <p><strong>Questions?</strong> Reply to this email or contact our support team.</p>
        
        <div class="disclaimer">
            <strong>MEDICAL DISCLAIMER:</strong> This analysis is for educational purposes only and is not intended as medical advice. 
            The recommendations provided are based on functional medicine principles and biohacking protocols. 
            Please consult with your healthcare provider before making any changes to your health regimen, 
            especially if you have underlying health conditions or are taking medications.
            Lab ranges and recommendations are based on optimization goals and may differ from standard medical ranges.
        </div>
    </div>
</body>
</html>`;

    const textContent = `
Your Biohacking Lab Analysis
Health Score: ${healthScore}/100

Key Findings:
${keyFindings.map(finding => `
${finding.biomarker}: ${finding.current_value} (Optimal: ${finding.optimal_range})
Status: ${finding.status} - ${finding.impact}
`).join('')}

Supplement Protocol:
${supplementProtocol.map(supplement => `
${supplement.name} - ${supplement.dosage}
${supplement.rationale}
`).join('')}

This analysis is for educational purposes only. Please consult your healthcare provider before making changes to your health regimen.
`;

    logStep('Sending email via Resend');
    
    // Send email
    const emailResponse = await resend.emails.send({
      from: 'Lab Analysis <results@labanalysis.com>',
      to: [recipientEmail],
      subject: `🧬 Your Biohacking Lab Analysis - Health Score: ${healthScore}/100`,
      html: emailHtml,
      text: textContent,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    logStep('Email sent successfully', { emailId: emailResponse.data?.id });
    
    // Update interpretation record to mark as emailed
    await supabase
      .from('interpretations')
      .update({ 
        emailed_at: new Date().toISOString(),
        email_recipient: recipientEmail 
      })
      .eq('id', interpretationId)

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id,
      message: 'Analysis email sent successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error: any) {
    logStep('ERROR in send-result-email', { message: error.message });
    console.error('Error sending result email:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})