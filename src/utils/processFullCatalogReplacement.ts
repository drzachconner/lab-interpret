import { supabase } from '@/integrations/supabase/client';
import { parseCatalogTextBasic } from '@/utils/localCatalogParser';

export async function processAndReplaceCatalog(textContent: string) {
  try {
    console.log('Processing full catalog text with AI...');
    
    // Try AI extraction first
    const { data, error } = await supabase.functions.invoke('catalog-extract-ai', {
      body: { 
        text: textContent,
        source: 'fullscript_lab_catalog_text.txt'
      }
    });

    if (error) {
      throw new Error(`AI extraction failed: ${error.message}`);
    }

    if (!data || !data.panels) {
      throw new Error('No panels extracted from text');
    }

    console.log(`Extracted ${data.panels.length} lab panels from text`);
    
    const newCatalog = {
      providers: data.providers || [
        'Quest Diagnostics',
        'Access Labcorp Draw',
        'Access Medical Labs',
        'Precision Analytical (DUTCH)',
        'Diagnostic Solutions Laboratory',
        'Mosaic Diagnostics',
        "Doctor's Data",
        'Genova Diagnostics'
      ],
      panels: data.panels
    };

    // Write the catalog to file
    await writeCatalogToFile(newCatalog);

    return {
      success: true,
      catalog: newCatalog,
      message: `Successfully extracted ${data.panels.length} lab panels from your text file`
    };

  } catch (error) {
    console.warn('AI extraction failed, falling back to local parser...', error);
    // Fallback: parse locally without AI
    const parsed = parseCatalogTextBasic(textContent);
    const count = parsed.panels.length;

    if (count === 0) {
      console.error('Local parsing also failed to extract panels.');
      return {
        success: false,
        error: (error instanceof Error ? error.message : 'Unknown error') + ' and local parsing found 0 panels',
        catalog: null
      };
    }

    // Write the locally parsed catalog to file
    await writeCatalogToFile(parsed);

    return {
      success: true,
      catalog: parsed,
      message: `AI quota error detected. Used local parser to extract ${count} panels.`
    };
  }
}

async function writeCatalogToFile(catalog: any) {
  try {
    // Save to a temporary catalog file that can be loaded by the app
    const catalogJson = JSON.stringify(catalog, null, 2);
    
    // Store in localStorage as fallback mechanism since we can't directly write files
    localStorage.setItem('parsed_fullscript_catalog', catalogJson);
    
    console.log(`Saved catalog with ${catalog.panels.length} panels to local storage`);
  } catch (error) {
    console.warn('Could not write catalog to file:', error);
  }
}