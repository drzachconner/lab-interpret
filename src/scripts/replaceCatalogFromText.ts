import { extractCatalogFromText, convertToFullscriptFormat } from '@/utils/extractCatalogFromText';

export async function replaceCatalogFromTextFile(textContent: string) {
  try {
    console.log('Starting catalog extraction and replacement...');
    
    // Extract data using AI
    const extractedData = await extractCatalogFromText(textContent);
    
    // Convert to fullscript format
    const fullscriptCatalog = convertToFullscriptFormat(extractedData);
    
    console.log(`Extracted catalog contains ${fullscriptCatalog.panels.length} lab panels`);
    console.log('Available providers:', fullscriptCatalog.providers);
    
    // Return the new catalog structure
    return {
      success: true,
      catalog: fullscriptCatalog,
      stats: {
        totalPanels: fullscriptCatalog.panels.length,
        providers: fullscriptCatalog.providers.length,
        categories: [...new Set(fullscriptCatalog.panels.map(p => p.category))].filter(Boolean),
        popularPanels: fullscriptCatalog.panels.filter(p => p.popular).length
      }
    };
    
  } catch (error) {
    console.error('Error replacing catalog:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      catalog: null,
      stats: null
    };
  }
}