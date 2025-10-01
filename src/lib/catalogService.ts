import catalogData from '@/config/labs-catalog-expanded.json';
import { computeRetailPrice, type Fees, type PricingDefaults } from './pricing';
import type { Panel, Provider, CatalogData, PricedPanel, PricingStrategy } from '@/types/panel';

export interface CatalogConfig {
  currency: string;
  default_fees: Fees;
  pricing_defaults: PricingDefaults;
  panels: PricedPanel[];
}

class CatalogService {
  private static instance: CatalogService | null = null;
  private config: CatalogConfig;
  private fullscriptData: any = null;
  private initialized = false;
  private version = 'v1';

  constructor() {
    // Load base catalog config synchronously - convert to PricedPanel format
    const baseConfig = catalogData as any;
    this.config = {
      ...baseConfig,
      panels: baseConfig.panels.map((panel: any): PricedPanel => ({
        ...panel,
        fs_sku: panel.fs_sku || panel.id.replace(/^(?!FS-)/, 'FS-'),
        pricing: panel.pricing || { 
          strategy: 'reference_undercut', 
          undercut_percent: 5, 
          min_margin_usd: 10 
        },
        computed_price: null,
        price_breakdown: {
          fs_base_cost_usd: 0,
          absorbed_fees_usd: 0,
          reference_used: null
        },
      }))
    };
  }

  static getInstance(): CatalogService {
    if (!this.instance) {
      this.instance = new CatalogService();
    }
    return this.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('🚀 Loading build-time catalog...');
      
      const { default: fullCatalog } = await import('@/config/fullscript-catalog.json');
      
      if (fullCatalog?.panels?.length) {
        this.fullscriptData = fullCatalog;
        console.log(`✅ Loaded ${fullCatalog.panels.length} panels from build-time catalog`);
      } else {
        console.warn('⚠️ Build-time catalog is empty or invalid, using fallback');
        this.fullscriptData = { providers: [], panels: [] };
      }
      
    } catch (error) {
      console.warn('⚠️ Failed to load build-time catalog:', error);
      this.fullscriptData = { providers: [], panels: [] };
    } finally {
      this.initialized = true;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  setFullscriptData(data: any) {
    this.fullscriptData = data || {};
  }

  async getAllPanels(): Promise<PricedPanel[]> {
    await this.ensureInitialized();
    
    const originalPanels = this.config.panels;
    const fullscriptPanels = this.convertFullscriptPanels();
    return [...originalPanels, ...fullscriptPanels];
  }

  private convertFullscriptPanels(): PricedPanel[] {
    if (!this.fullscriptData?.panels) return [];
    
    return this.fullscriptData.panels.map((fsPanel: Panel): PricedPanel => ({
      // Base panel fields
      id: fsPanel.id,
      display_name: fsPanel.display_name || fsPanel.name || 'Unnamed Test',
      category: fsPanel.category || 'Laboratory Tests',
      specimen: fsPanel.specimen || 'Serum',
      subcategory: fsPanel.subcategory,
      fasting_required: fsPanel.fasting_required || false,
      turnaround_days: fsPanel.turnaround_days || '1-3 business days',
      aliases: fsPanel.aliases || [fsPanel.name || fsPanel.display_name || 'Unnamed Test'],
      biomarkers: fsPanel.biomarkers || [],
      clinical_significance: fsPanel.clinical_significance || `Lab panel with multiple biomarkers.`,
      lab_provider: fsPanel.lab_provider || fsPanel.providers?.[0]?.name || 'Multiple Providers',
      popular: fsPanel.popular || ['Basic Metabolic Panel', 'CBC', 'Lipid Panel', 'DUTCH', 'Thyroid'].some(popular => 
        (fsPanel.name || fsPanel.display_name || '').toLowerCase().includes(popular.toLowerCase())
      ),
      notes: fsPanel.notes || `Available from ${fsPanel.providers?.length || 1} provider(s).`,
      reference_price_usd: fsPanel.providers?.[0]?.price || fsPanel.reference_price_usd || null,
      
      // Lab-specific fields
      fs_sku: fsPanel.id.replace('fs-', 'FS-'),
      pricing: { 
        strategy: 'reference_undercut', 
        undercut_percent: 5, 
        min_margin_usd: 10 
      } as PricingStrategy,
      
      // Computed fields
      computed_price: null,
      price_breakdown: {
        fs_base_cost_usd: 0,
        absorbed_fees_usd: 0,
        reference_used: null
      },
    }));
  }

  async getPanelById(id: string): Promise<PricedPanel | null> {
    await this.ensureInitialized();
    
    const originalPanel = this.config.panels.find(panel => panel.id === id);
    if (originalPanel) return originalPanel;
    
    const allPanels = await this.getAllPanels();
    return allPanels.find(panel => panel.id === id) || null;
  }

  async getPanelsByCategory(category: string): Promise<PricedPanel[]> {
    const allPanels = await this.getAllPanels();
    return allPanels.filter(panel => panel.category === category);
  }

  async getCategories(): Promise<string[]> {
    const allPanels = await this.getAllPanels();
    const categories = new Set(allPanels.map(panel => panel.category));
    return Array.from(categories).sort();
  }

  async searchPanels(query: string): Promise<PricedPanel[]> {
    const allPanels = await this.getAllPanels();
    const lowerQuery = query.toLowerCase();
    return allPanels.filter(panel => {
      return (
        panel.display_name.toLowerCase().includes(lowerQuery) ||
        panel.aliases?.some(alias => alias.toLowerCase().includes(lowerQuery)) ||
        panel.notes?.toLowerCase().includes(lowerQuery) ||
        panel.category.toLowerCase().includes(lowerQuery) ||
        panel.subcategory?.toLowerCase().includes(lowerQuery) ||
        panel.biomarkers?.some(marker => marker.toLowerCase().includes(lowerQuery)) ||
        panel.clinical_significance?.toLowerCase().includes(lowerQuery) ||
        panel.lab_provider?.toLowerCase().includes(lowerQuery)
      );
    });
  }

  async getSubcategories(category?: string): Promise<string[]> {
    const allPanels = await this.getAllPanels();
    let panels = category && category !== 'all' ? 
      allPanels.filter(panel => panel.category === category) : 
      allPanels;
    
    const subcategories = new Set(
      panels
        .map(panel => panel.subcategory)
        .filter((sub): sub is string => !!sub)
    );
    return Array.from(subcategories).sort();
  }

  async getPanelsBySubcategory(subcategory: string): Promise<PricedPanel[]> {
    const allPanels = await this.getAllPanels();
    return allPanels.filter(panel => panel.subcategory === subcategory);
  }

  async getPopularPanels(): Promise<PricedPanel[]> {
    const allPanels = await this.getAllPanels();
    return allPanels.filter(panel => panel.popular === true);
  }

  async getPanelsBySpecimen(specimen: string): Promise<PricedPanel[]> {
    const allPanels = await this.getAllPanels();
    return allPanels.filter(panel => 
      panel.specimen.toLowerCase().includes(specimen.toLowerCase())
    );
  }

  async getPanelsByFastingRequirement(fastingRequired: boolean): Promise<PricedPanel[]> {
    const allPanels = await this.getAllPanels();
    return allPanels.filter(panel => panel.fasting_required === fastingRequired);
  }

  async getPanelsByTurnaroundTime(maxDays: number): Promise<PricedPanel[]> {
    const allPanels = await this.getAllPanels();
    return allPanels.filter(panel => {
      const turnaround = panel.turnaround_days;
      if (!turnaround) return false;
      const matches = turnaround.match(/(\d+)/);
      if (matches) {
        const days = parseInt(matches[1]);
        return days <= maxDays;
      }
      return false;
    });
  }

  async sortPanels(panels: PricedPanel[], sortBy: 'name' | 'price' | 'category' | 'turnaround' | 'popular'): Promise<PricedPanel[]> {
    return [...panels].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.display_name.localeCompare(b.display_name);
        case 'category':
          return a.category.localeCompare(b.category) || a.display_name.localeCompare(b.display_name);
        case 'turnaround':
          const aTurnaround = parseInt(a.turnaround_days?.match(/(\d+)/)?.[1] || '0');
          const bTurnaround = parseInt(b.turnaround_days?.match(/(\d+)/)?.[1] || '0');
          return aTurnaround - bTurnaround;
        case 'popular':
          const aPopular = a.popular ? 1 : 0;
          const bPopular = b.popular ? 1 : 0;
          return bPopular - aPopular || a.display_name.localeCompare(b.display_name);
        default:
          return 0;
      }
    });
  }

  private async getFullscriptBaseCost(fs_sku: string): Promise<number> {
    const mockPricing: Record<string, number> = {
      'FS-LAB-CBC': 45,
      'FS-LAB-CMP': 55,
      'FS-LAB-LIPID': 35,
      'FS-LAB-HBA1C': 25,
      'FS-LAB-THY-CORE': 85,
      'FS-LAB-VITD25': 30,
      'FS-LAB-HSCRP': 20,
      'FS-LAB-INSULIN': 40,
      'FS-LAB-HCY': 45,
      'FS-LAB-OM3-RBC': 120,
      'FS-LAB-B12': 25,
      'FS-LAB-FOLATE': 30,
    };
    
    return mockPricing[fs_sku] || 50;
  }

  async computePanelPrice(panelId: string): Promise<PricedPanel | null> {
    const panel = await this.getPanelById(panelId);
    if (!panel) return null;

    const fs_base_cost = await this.getFullscriptBaseCost(panel.fs_sku);
    
    const result = computeRetailPrice({
      fs_base_cost_usd: fs_base_cost,
      reference_price_usd: panel.reference_price_usd,
      strategy: panel.pricing,
      defaults: this.config.pricing_defaults,
      fees: this.config.default_fees,
    });

    if (result === null) {
      return {
        ...panel,
        computed_price: null,
        price_breakdown: {
          fs_base_cost_usd: fs_base_cost,
          absorbed_fees_usd: 0,
          reference_used: panel.reference_price_usd ?? null
        },
        is_higher_than_reference: false,
      };
    }

    const is_higher_than_reference = panel.reference_price_usd ? 
      result.price_usd > panel.reference_price_usd : false;

    return {
      ...panel,
      computed_price: result.price_usd,
      price_breakdown: result.breakdown,
      is_higher_than_reference,
    };
  }

  async computeAllPanelPrices(): Promise<PricedPanel[]> {
    const allPanels = await this.getAllPanels();
    const pricedPanels: PricedPanel[] = [];
    
    for (const panel of allPanels) {
      const pricedPanel = await this.computePanelPrice(panel.id);
      if (pricedPanel) {
        pricedPanels.push(pricedPanel);
      }
    }
    
    return pricedPanels;
  }

  getConfig(): CatalogConfig {
    return this.config;
  }
}

export const catalogService = CatalogService.getInstance();