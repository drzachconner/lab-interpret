/**
 * Ticket 5: PDF Rendering with Server-side Context Re-attachment
 * 
 * This utility handles merging de-identified AI analysis results 
 * with patient context for display/download while maintaining HIPAA compliance.
 */

export interface PatientContext {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  mrn?: string;
}

export interface DeidentifiedAnalysis {
  patient_id: string;
  age_bucket: string;
  sex: string;
  analysis: any;
  recommendations: string[];
  supplements: string[];
  created_at: string;
}

export interface ReportData {
  patientContext: PatientContext;
  analysis: DeidentifiedAnalysis;
  labResults: Array<{
    test: string;
    value: number;
    unit?: string;
    ref?: string;
  }>;
}

/**
 * Merges de-identified analysis with patient context for display
 * This happens AFTER the LLM analysis is complete, maintaining HIPAA safety
 */
export function mergeAnalysisWithContext(
  analysis: DeidentifiedAnalysis,
  patientContext: PatientContext,
  labResults: any[]
): ReportData {
  // Log only non-PHI data for analytics
  console.log('Rendering report for analysis:', {
    patient_id: analysis.patient_id, // Pseudonymous ID only
    age_bucket: analysis.age_bucket,
    sex: analysis.sex,
    lab_count: labResults.length,
    timestamp: analysis.created_at
  });

  return {
    patientContext,
    analysis,
    labResults
  };
}

/**
 * Generates PDF-ready HTML content with full patient context
 * This is the ONLY place where PHI and analysis results are combined
 */
export function generateReportHTML(reportData: ReportData): string {
  const { patientContext, analysis, labResults } = reportData;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lab Analysis Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
        .patient-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .analysis-section { margin-bottom: 30px; }
        .lab-results { margin-bottom: 30px; }
        .recommendations { background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; }
        .supplements { background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f1f5f9; font-weight: 600; }
        .value-normal { color: #059669; }
        .value-high { color: #dc2626; }
        .value-low { color: #d97706; }
      </style>
    </head>
    <body>
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${labResults.map(lab => `
              <tr>
                <td>${lab.test}</td>
                <td class="value-normal">${lab.value}</td>
                <td>${lab.unit || ''}</td>
                <td>${lab.ref || ''}</td>
                <td class="value-normal">Normal</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="analysis-section">
        <h2>AI Analysis Results</h2>
        <div style="white-space: pre-wrap; background: #f8fafc; padding: 20px; border-radius: 8px;">
          ${typeof analysis.analysis === 'string' ? analysis.analysis : JSON.stringify(analysis.analysis, null, 2)}
        </div>
      </div>

      ${analysis.recommendations?.length ? `
        <div class="recommendations">
          <h2>🎯 Key Recommendations</h2>
          <ul>
            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${analysis.supplements?.length ? `
        <div class="supplements">
          <h2>💊 Supplement Recommendations</h2>
          <ul>
            ${analysis.supplements.map(supp => `<li>${supp}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="footer">
        <p><strong>Important:</strong> This analysis is for educational purposes only and does not constitute medical advice. 
           Please consult with a licensed healthcare provider before making any changes to your health regimen.</p>
        <p><strong>Privacy Notice:</strong> This report was generated using HIPAA-compliant de-identification techniques. 
           Your personal health information was protected during AI analysis.</p>
        <p><strong>Report ID:</strong> ${analysis.patient_id} | <strong>Generated:</strong> ${new Date().toISOString()}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Safe logging function that excludes PHI from analytics
 * Ticket 4: Ensure server logs and client analytics exclude PHI
 */
export function logAnalyticsEvent(eventName: string, properties: Record<string, any>) {
  // Strip any potential PHI from properties before logging
  const safeProperties = {
    ...properties,
    // Remove common PHI fields
    name: undefined,
    email: undefined,
    phone: undefined,
    address: undefined,
    dob: undefined,
    ssn: undefined,
    mrn: undefined,
    // Keep only aggregated/de-identified data
    age_bucket: properties.age_bucket,
    sex: properties.sex,
    patient_id: properties.patient_id, // This is pseudonymous
    analysis_id: properties.analysis_id,
    lab_count: properties.lab_count,
    timestamp: properties.timestamp
  };

  console.log(`Analytics Event: ${eventName}`, safeProperties);
  
  // Here you would send to your analytics service (e.g., Mixpanel, Amplitude)
  // Make sure the analytics service only receives the safeProperties
}
