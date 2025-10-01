import { supabase } from '@/integrations/supabase/client';

export async function processFullCatalogText(text: string) {
  try {
    console.log('Processing full catalog text with AI extraction...');
    
    const { data, error } = await supabase.functions.invoke('catalog-extract-ai', {
      body: { text, source: 'fullscript_lab_catalog_text.txt' }
    });

    if (error) {
      console.error('Error calling edge function:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }

    console.log('AI extraction completed successfully');
    return data;
  } catch (error) {
    console.error('Error processing catalog text:', error);
    throw error;
  }
}