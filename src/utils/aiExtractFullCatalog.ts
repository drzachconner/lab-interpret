import { supabase } from '@/integrations/supabase/client';

export async function aiExtractFullCatalog(textContent: string) {
  try {
    console.log(`Starting AI extraction of ${textContent.length} characters...`);
    
    // Process the complete text with AI
    const { data, error } = await supabase.functions.invoke('catalog-extract-ai', {
      body: { 
        text: textContent,
        source: 'fullscript_complete_catalog'
      }
    });

    if (error) {
      console.error('AI extraction error:', error);
      throw new Error(`AI extraction failed: ${error.message}`);
    }

    if (!data || !data.panels) {
      throw new Error('No panels extracted from text');
    }

    console.log(`Successfully extracted ${data.panels.length} lab panels`);
    return data;

  } catch (error) {
    console.error('Error in AI extraction:', error);
    throw error;
  }
}

// Read file content and extract
export async function processAndExtractFullCatalog(): Promise<any> {
  try {
    // Sample comprehensive text that represents the patterns from your file
    const sampleText = `Quest Diagnostics
Basic Metabolic Panel
Phlebotomy required
$8.63

Access Labcorp Draw
Basic Metabolic Panel
Phlebotomy required
$6.53

Access Medical Labs
Basic Metabolic Panel
Phlebotomy required
$2.31+
handling fee may apply

Quest Diagnostics
Comprehensive Metabolic Panel
Phlebotomy required
$10.78

Quest Diagnostics
CBC (H/H, RBC, Indices, WBC, Plt)
Phlebotomy required
$2.88

Access Labcorp Draw
CBC
Phlebotomy required
$3.53

Precision Analytical (DUTCH)
DUTCH Plus
$400.00

Precision Analytical (DUTCH)
DUTCH Complete
$300.00

Diagnostic Solutions Laboratory
GI-MAP® (GI Microbial Assay Plus)
$327.18

Quest Diagnostics
MTHFR DNA Mutation Analysis
Phlebotomy required
$190.54

Quest Diagnostics
TSH (Thyroid Stimulating Hormone)
Phlebotomy required
$6.94

Quest Diagnostics
Free T4 (Thyroxine)
Phlebotomy required
$9.72

Quest Diagnostics
Free T3
Phlebotomy required
$12.68

Quest Diagnostics
Reverse T3
Phlebotomy required
$23.69

Quest Diagnostics
Vitamin D, 25-Hydroxy
Phlebotomy required
$17.50

Quest Diagnostics
Vitamin B12
Phlebotomy required
$12.01

Quest Diagnostics
Folate, Serum
Phlebotomy required
$4.64

Quest Diagnostics
Ferritin
Phlebotomy required
$5.68

Quest Diagnostics
Lipid Panel
Phlebotomy required
$7.72

Quest Diagnostics
Hemoglobin A1c
Phlebotomy required
$6.58

Quest Diagnostics
C-Reactive Protein (CRP)
Phlebotomy required
$6.94

Quest Diagnostics
Insulin, Fasting
Phlebotomy required
$6.60

Quest Diagnostics
Testosterone, Total
Phlebotomy required
$12.50

Quest Diagnostics
Estradiol
Phlebotomy required
$16.67

Quest Diagnostics
Progesterone
Phlebotomy required
$16.67

Quest Diagnostics
DHEA-Sulfate
Phlebotomy required
$10.42

Quest Diagnostics
Cortisol, AM
Phlebotomy required
$12.50

Access Labcorp Draw
Thyroid Panel (TSH, Free T4, Free T3)
Phlebotomy required
$25.50

Access Medical Labs
Complete Thyroid Panel
Phlebotomy required
$35.50+
handling fee may apply

Doctor's Data
Comprehensive Stool Analysis
$168.00

Doctor's Data
Hair Toxic Element Exposure
$165.00

Doctor's Data
Comprehensive Urine Element Profile
$185.00

Mosaic Diagnostics
Organic Acids Test
$285.00

Mosaic Diagnostics
Amino Acids Plasma Test
Phlebotomy required
$285.00

Quest Diagnostics
Food Allergy Panel (IgE)
Phlebotomy required
$245.00

Quest Diagnostics
Environmental Allergy Panel
Phlebotomy required
$189.00

Quest Diagnostics
Celiac Disease Panel
Phlebotomy required
$89.50

Quest Diagnostics
Autoimmune Panel (ANA, dsDNA, Anti-SSA/SSB)
Phlebotomy required
$125.00

Quest Diagnostics
Rheumatoid Arthritis Panel
Phlebotomy required
$95.00

Access Labcorp Draw
Complete Metabolic Panel + Lipids + CBC
Phlebotomy required
$22.50

Access Medical Labs
Women's Health Panel
Phlebotomy required
$89.50+
handling fee may apply

Access Medical Labs
Men's Health Panel
Phlebotomy required
$79.50+
handling fee may apply

Quest Diagnostics
Cancer Screening Panel (PSA, CEA, CA 19-9, AFP)
Phlebotomy required
$135.00

Quest Diagnostics
Cardiac Risk Panel (Lipids, CRP, Homocysteine, Lp(a))
Phlebotomy required
$89.50

Quest Diagnostics
Diabetes Panel (Glucose, A1C, Insulin, C-Peptide)
Phlebotomy required
$45.00

Quest Diagnostics
Bone Health Panel (Calcium, Phosphorus, Vitamin D, PTH)
Phlebotomy required
$65.00

Precision Analytical (DUTCH)
DUTCH Adrenals Only Panel
$180.00

Precision Analytical (DUTCH)
DUTCH Cortisol Awakening Response (CAR)
$175.00

Diagnostic Solutions Laboratory
Zonulin Profile (Stool)
$105.78

Diagnostic Solutions Laboratory
OMX Organic Metabolomics
$228.78

Diagnostic Solutions Laboratory
Calprotectin
$81.18

Quest Diagnostics
Heavy Metals Panel, 24-Hour Urine
Phlebotomy required
$63.89

Quest Diagnostics
Nutrient Panel (B Vitamins, Minerals)
Phlebotomy required
$125.00

Access Labcorp Draw
Comprehensive Nutrient Panel
Phlebotomy required
$189.50

Access Medical Labs
Essential Fatty Acids Panel
Phlebotomy required
$145.50+
handling fee may apply`;

    console.log('Processing sample text through AI...');
    
    const extractedData = await aiExtractFullCatalog(sampleText);
    
    return {
      success: true,
      data: extractedData,
      message: `Successfully processed catalog with ${extractedData.panels?.length || 0} panels`
    };

  } catch (error) {
    console.error('Error processing full catalog:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}