import fs from 'fs';
import path from 'path';
import { supabase } from '@/integrations/supabase/client';

export async function processFullTextCatalog(): Promise<any> {
  try {
    // Read the complete text file
    console.log('Reading complete text file...');
    const filePath = path.join(process.cwd(), 'src/temp/fullscript_lab_catalog_text.txt');
    const textContent = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Processing ${textContent.length} characters of text...`);
    
    // Process through AI extraction in chunks if needed (due to token limits)
    const maxChunkSize = 100000; // ~100k characters per chunk
    const chunks: string[] = [];
    
    if (textContent.length > maxChunkSize) {
      for (let i = 0; i < textContent.length; i += maxChunkSize) {
        chunks.push(textContent.slice(i, i + maxChunkSize));
      }
    } else {
      chunks.push(textContent);
    }
    
    console.log(`Split into ${chunks.length} chunks for processing...`);
    
    let allPanels: any[] = [];
    let allProviders = new Set<string>();
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
      
      const { data, error } = await supabase.functions.invoke('catalog-extract-ai', {
        body: { 
          text: chunks[i],
          source: `fullscript_lab_catalog_text.txt_chunk_${i + 1}`
        }
      });

      if (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        continue;
      }

      if (data && data.panels) {
        allPanels.push(...data.panels);
        if (data.providers) {
          data.providers.forEach((provider: string) => allProviders.add(provider));
        }
      }
      
      // Small delay between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Extracted ${allPanels.length} total panels from ${chunks.length} chunks`);
    
    // Deduplicate panels by name and merge provider data
    const panelMap = new Map<string, any>();
    
    allPanels.forEach(panel => {
      const key = panel.name?.toLowerCase().trim();
      if (!key) return;
      
      if (panelMap.has(key)) {
        // Merge providers
        const existing = panelMap.get(key);
        if (panel.providers) {
          existing.providers = existing.providers || [];
          panel.providers.forEach((newProvider: any) => {
            const existingProvider = existing.providers.find((p: any) => 
              p.name === newProvider.name
            );
            if (!existingProvider) {
              existing.providers.push(newProvider);
            }
          });
        }
      } else {
        panelMap.set(key, panel);
      }
    });
    
    const uniquePanels = Array.from(panelMap.values());
    
    console.log(`After deduplication: ${uniquePanels.length} unique panels`);
    
    return {
      providers: Array.from(allProviders),
      panels: uniquePanels,
      stats: {
        totalChunks: chunks.length,
        totalPanelsExtracted: allPanels.length,
        uniquePanels: uniquePanels.length
      }
    };
    
  } catch (error) {
    console.error('Error processing full text catalog:', error);
    throw error;
  }
}