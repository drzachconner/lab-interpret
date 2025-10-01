import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { processAndReplaceCatalog } from '@/utils/processFullCatalogReplacement';
import { catalogService } from '@/lib/catalogService';

interface ProcessCatalogButtonProps {
  onCatalogUpdated?: () => void;
}

export const ProcessCatalogButton = ({ onCatalogUpdated }: ProcessCatalogButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessCatalog = async () => {
    setIsProcessing(true);
    try {
      // Read the uploaded text file content
      const response = await fetch('/src/temp/fullscript_lab_catalog_text.txt');
      const textContent = await response.text();
      
      console.log(`Starting to process ${textContent.length} characters of catalog text...`);
      
      // Process with AI/local parser and replace catalog
      const result = await processAndReplaceCatalog(textContent);
      
      if (result.success && result.catalog) {
        // Update the catalog service with new data
        catalogService.setFullscriptData(result.catalog);

        // Broadcast update so consumers refresh
        window.dispatchEvent(new CustomEvent('catalog-updated'));
        
        toast.success(`${result.message} - Marketplace updated with ${result.catalog.panels.length} tests!`);
        
        // Call callback to refresh UI if provided
        onCatalogUpdated?.();
      } else {
        toast.error(result.error || 'Failed to process catalog');
      }
    } catch (error) {
      console.error('Error processing catalog:', error);
      toast.error('Failed to process catalog');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleProcessCatalog}
      disabled={isProcessing}
      className="mb-4"
    >
      {isProcessing ? 'Processing Full Catalog...' : 'Process Full Catalog Now'}
    </Button>
  );
};