import { useState, useEffect } from 'react';
import { catalogService } from '@/lib/catalogService';
import type { PricedPanel } from '@/types/panel';
import { useToast } from '@/hooks/use-toast';

export function useCatalog() {
  const [panels, setPanels] = useState<PricedPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPanels();

    const onCatalogUpdated = () => {
      loadPanels();
    };

    window.addEventListener('catalog-updated', onCatalogUpdated);
    return () => {
      window.removeEventListener('catalog-updated', onCatalogUpdated);
    };
  }, []);

  const loadPanels = async () => {
    try {
      setLoading(true);
      setError(null);
      const pricedPanels = await catalogService.computeAllPanelPrices();
      setPanels(pricedPanels);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load lab panels';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchPanels = (query: string): PricedPanel[] => {
    if (!query.trim()) return panels;
    
    const lowerQuery = query.toLowerCase();
    return panels.filter(panel => {
      return (
        panel.display_name.toLowerCase().includes(lowerQuery) ||
        panel.aliases.some(alias => alias.toLowerCase().includes(lowerQuery)) ||
        panel.notes.toLowerCase().includes(lowerQuery) ||
        panel.category.toLowerCase().includes(lowerQuery) ||
        panel.subcategory?.toLowerCase().includes(lowerQuery) ||
        panel.biomarkers?.some(marker => marker.toLowerCase().includes(lowerQuery)) ||
        panel.clinical_significance?.toLowerCase().includes(lowerQuery) ||
        panel.lab_provider?.toLowerCase().includes(lowerQuery)
      );
    });
  };

  const getPanelsByCategory = (category: string): PricedPanel[] => {
    if (category === 'all') return panels;
    return panels.filter(panel => panel.category === category);
  };

  const getPanelsBySubcategory = (subcategory: string): PricedPanel[] => {
    return panels.filter(panel => panel.subcategory === subcategory);
  };

  const getCategories = (): string[] => {
    const categories = new Set(panels.map(panel => panel.category));
    return ['all', ...Array.from(categories).sort()];
  };

  const getSubcategories = (category?: string): string[] => {
    let filteredPanels = category && category !== 'all' ? 
      panels.filter(panel => panel.category === category) : 
      panels;
    
    const subcategories = new Set(
      filteredPanels
        .map(panel => panel.subcategory)
        .filter((sub): sub is string => !!sub)
    );
    return Array.from(subcategories).sort();
  };

  const getPopularPanels = (): PricedPanel[] => {
    return panels.filter(panel => panel.popular === true);
  };

  const sortPanels = (panels: PricedPanel[], sortBy: 'name' | 'price' | 'category' | 'turnaround' | 'popular'): PricedPanel[] => {
    return [...panels].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.display_name.localeCompare(b.display_name);
        case 'price':
          return a.computed_price - b.computed_price;
        case 'category':
          return a.category.localeCompare(b.category) || a.display_name.localeCompare(b.display_name);
        case 'turnaround':
          const aTurnaround = parseInt(a.turnaround_days.match(/(\d+)/)?.[1] || '0');
          const bTurnaround = parseInt(b.turnaround_days.match(/(\d+)/)?.[1] || '0');
          return aTurnaround - bTurnaround;
        case 'popular':
          const aPopular = a.popular ? 1 : 0;
          const bPopular = b.popular ? 1 : 0;
          return bPopular - aPopular || a.display_name.localeCompare(b.display_name);
        default:
          return 0;
      }
    });
  };

  const getPanelById = (id: string): PricedPanel | undefined => {
    return panels.find(panel => panel.id === id);
  };

  const refreshPrices = async () => {
    await loadPanels();
  };

  return {
    panels,
    loading,
    error,
    searchPanels,
    getPanelsByCategory,
    getPanelsBySubcategory,
    getCategories,
    getSubcategories,
    getPanelById,
    getPopularPanels,
    sortPanels,
    refreshPrices,
  };
}