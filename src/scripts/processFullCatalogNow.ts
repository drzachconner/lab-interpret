import { supabase } from '@/integrations/supabase/client';

// Representative sample of the comprehensive text patterns from your file
const comprehensiveTextSample = `Quest Diagnostics
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

Access Medical Labs
CBC
Phlebotomy required
$3.47+
handling fee may apply

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

Quest Diagnostics
Apple (f49) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Peanut (f13) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Milk (f2) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Egg White (f1) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Wheat (f4) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Shrimp (f24) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Cat Dander (e1) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Dog Dander (e5) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Dust Mite (d1) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Timothy Grass (g6) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Ragweed (w1) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Birch Tree (t3) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Oak Tree (t7) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Penicillin (c1) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Bee Venom (i1) IgE
Phlebotomy required
$7.25

Quest Diagnostics
Wasp Venom (i3) IgE
Phlebotomy required
$7.25

Doctor's Data
Comprehensive Stool Analysis
$168.00

Doctor's Data
Hair Toxic Element Exposure Profile
$79.00

Doctor's Data
Comprehensive Urine Element Profile
$185.00

Doctor's Data
Plasma Amino Acids
Phlebotomy required
$239.00

Doctor's Data
Basic Hormone Profile
$110.00

Doctor's Data
Comprehensive Adrenal Function Profile
$132.00

Doctor's Data
Diurnal Cortisol Profile
$88.00

Doctor's Data
Cortisol Awakening Response (CAR)
$66.00

Doctor's Data
Melatonin Profile
$66.00

Doctor's Data
Sex Hormones Profile
$169.00

Doctor's Data
Estrogen Metabolites Profile
$139.00

Doctor's Data
Androgens & Progesterones Profile
$139.00

Doctor's Data
Adrenal Corticoids Profile
$129.00

Doctor's Data
NeuroHormone Complete Plus Profile
$334.00

Doctor's Data
NeuroHormone Complete Profile
$300.00

Doctor's Data
Comprehensive Neurotransmitter Profile
$264.00

Doctor's Data
NeuroBasic Profile
$179.00

Doctor's Data
Hair Elements
$79.00

Doctor's Data
Secretory IgA
$89.00

Doctor's Data
Zonulin Family Protein (stool)
$79.00

Doctor's Data
Zonulin Family Protein (Serum)
Phlebotomy required
$79.00

Doctor's Data
Celiac & Gluten Sensitivity (serum)
Phlebotomy required
$109.00

Doctor's Data
Celiac & Gluten Sensitivity (blood spot)
$79.00

Doctor's Data
Vaginosis Profile
$109.00

Doctor's Data
Women's Health & Breast Profile
$210.00

Mosaic Diagnostics
Amino Acids Plasma Test
Phlebotomy required
$285.00

Mosaic Diagnostics
Amino Acids Urine Test - 24-hr
$285.00

Mosaic Diagnostics
Amino Acids Urine Test - Random
$285.00

Mosaic Diagnostics
Comprehensive Stool Analysis
$340.00

Mosaic Diagnostics
Copper + Zinc Profile
Phlebotomy required
$160.00

Mosaic Diagnostics
DNA Methylation Pathway Profile
$475.00

Genova Diagnostics
NutrEval® FMV
$439.00

Genova Diagnostics
Adrenocortex Stress Profile
$135.00

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
OMX | Organic Metabolomics - Urine/Plasma
Phlebotomy required
$228.78

Diagnostic Solutions Laboratory
OMX | Organic Metabolomics - Urine/Urine
$228.78

Diagnostic Solutions Laboratory
Amino Acids Profile (AAp – Plasma)
Phlebotomy required
$146.78

Diagnostic Solutions Laboratory
Calprotectin (Stand-Alone)
$81.18

Diagnostic Solutions Laboratory
Fecal Gluten Peptide (Stand-Alone)
$81.18

Quest Diagnostics
Southern Plains Allergy Panel (AR, OK, TX)
Phlebotomy required
$112.22

Quest Diagnostics
Southern Regional Allergy Panel (AL, FL, GA, LA, MS, SC)
Phlebotomy required
$72.50

Quest Diagnostics
Allergy Panel, Region 4, Trees
Phlebotomy required
$36.25

Quest Diagnostics
Allergy Insect Venom Panel
Phlebotomy required
$36.25

Quest Diagnostics
B-Type Natriuretic Peptide (BNP)
Phlebotomy required
$63.00

Quest Diagnostics
sdLDL
Phlebotomy required
$29.79

Quest Diagnostics
Candida albicans Antibodies (IgG, IgA, IgM)
Phlebotomy required
$51.32

Access Labcorp Draw
Complete Metabolic Panel + Lipids + CBC
Phlebotomy required
$22.50

Access Labcorp Draw
Thyroid Panel (TSH, Free T4, Free T3)
Phlebotomy required
$25.50

Access Labcorp Draw
Comprehensive Nutrient Panel
Phlebotomy required
$189.50

Access Labcorp Draw
Food Allergy Panel
Phlebotomy required
$245.00

Access Labcorp Draw
Environmental Allergy Panel
Phlebotomy required
$189.00

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

Access Medical Labs
Complete Thyroid Panel
Phlebotomy required
$35.50+
handling fee may apply

Access Medical Labs
Essential Fatty Acids Panel
Phlebotomy required
$145.50+
handling fee may apply`;

export async function processFullCatalogNow() {
  try {
    console.log('Starting comprehensive catalog extraction...');
    
    const { data, error } = await supabase.functions.invoke('catalog-extract-ai', {
      body: { 
        text: comprehensiveTextSample,
        source: 'fullscript_comprehensive_catalog'
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
    
    // Return the comprehensive catalog
    return {
      providers: data.providers || [
        "Quest Diagnostics",
        "Access Labcorp Draw",
        "Access Medical Labs",
        "Precision Analytical (DUTCH)",
        "Diagnostic Solutions Laboratory",
        "Mosaic Diagnostics",
        "Doctor's Data",
        "Genova Diagnostics"
      ],
      panels: data.panels
    };

  } catch (error) {
    console.error('Error processing full catalog:', error);
    throw error;
  }
}