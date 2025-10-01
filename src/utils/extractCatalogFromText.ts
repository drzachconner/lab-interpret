import { supabase } from '@/integrations/supabase/client';

export async function extractCatalogFromText(text: string) {
  try {
    console.log(`Starting AI extraction of ${text.length} characters...`);
    
    const { data, error } = await supabase.functions.invoke('catalog-extract-ai', {
      body: { 
        text: text,
        source: 'fullscript_lab_catalog_text.txt'
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`AI extraction failed: ${error.message}`);
    }

    if (!data || !data.panels) {
      throw new Error('Invalid response from AI extraction');
    }

    console.log(`Successfully extracted ${data.panels.length} lab panels`);
    return data;
    
  } catch (error) {
    console.error('Error in extractCatalogFromText:', error);
    throw error;
  }
}

// Convert extracted data to fullscript catalog format
export function convertToFullscriptFormat(extractedData: any) {
  const providers = extractedData.providers || [];
  
  const fullscriptCatalog = {
    providers: providers,
    panels: extractedData.panels.map((panel: any) => ({
      id: panel.id,
      name: panel.name,
      display_name: panel.display_name || panel.name,
      aliases: panel.aliases || [],
      category: panel.category,
      subcategory: panel.subcategory,
      specimen: panel.specimen,
      fasting_required: panel.fasting_required || false,
      turnaround_days: panel.turnaround_days,
      biomarkers: panel.biomarkers || [],
      clinical_significance: panel.clinical_significance || "",
      lab_provider: panel.lab_provider,
      popular: panel.popular || false,
      notes: panel.notes || "",
      providers: panel.providers || []
    }))
  };
  
  return fullscriptCatalog;
}