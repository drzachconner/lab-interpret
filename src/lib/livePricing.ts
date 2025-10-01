// Live pricing service for lab panels
import { supabase } from '@/integrations/supabase/client';

export interface LivePriceResult {
  panel_id: string;
  current_price: number;
  price_timestamp: Date;
  price_variance_pct?: number;
  external_url?: string;
}

export interface CheckoutPricing {
  items: LivePriceResult[];
  total_price_difference: number;
  requires_price_confirmation: boolean;
  checkout_url?: string;
}

class LivePricingService {
  private static readonly PRICE_VARIANCE_THRESHOLD = 5; // 5% variance threshold
  
  /**
   * Fetch live prices at checkout time
   */
  async getLivePricesForCheckout(panelIds: string[]): Promise<CheckoutPricing> {
    try {
      // In a real implementation, this would call external APIs like Quest/LabCorp
      // For now, we'll simulate price variations and create external checkout URLs
      const livePrices = await this.fetchLivePrices(panelIds);
      
      // Calculate if prices have drifted significantly
      const originalPrices = await this.getOriginalPrices(panelIds);
      const priceDrift = this.calculatePriceDrift(originalPrices, livePrices);
      
      const requiresConfirmation = priceDrift.some(
        drift => Math.abs(drift.price_variance_pct || 0) > LivePricingService.PRICE_VARIANCE_THRESHOLD
      );
      
      const totalDifference = priceDrift.reduce((sum, item) => {
        const original = originalPrices.find(p => p.id === item.panel_id);
        return sum + (item.current_price - (original?.computed_price || 0));
      }, 0);

      return {
        items: livePrices,
        total_price_difference: totalDifference,
        requires_price_confirmation: requiresConfirmation,
        checkout_url: this.generateExternalCheckoutUrl(panelIds)
      };
    } catch (error) {
      console.error('Error fetching live prices:', error);
      throw new Error('Unable to fetch current pricing. Please try again.');
    }
  }

  /**
   * Simulate fetching live prices from external lab providers
   */
  private async fetchLivePrices(panelIds: string[]): Promise<LivePriceResult[]> {
    // Simulate API calls to Quest/LabCorp/other providers
    // In reality, this might call their APIs or scrape pricing pages
    
    const livePrices: LivePriceResult[] = [];
    
    for (const panelId of panelIds) {
      // Simulate price variance (+/- 10%)
      const basePrice = await this.getBasePriceForPanel(panelId);
      const variance = (Math.random() - 0.5) * 0.2; // -10% to +10%
      const currentPrice = Math.round(basePrice * (1 + variance));
      const variancePct = Math.round(variance * 100);
      
      livePrices.push({
        panel_id: panelId,
        current_price: currentPrice,
        price_timestamp: new Date(),
        price_variance_pct: variancePct,
        external_url: this.generateLabProviderUrl(panelId)
      });
    }
    
    return livePrices;
  }

  /**
   * Get original catalog prices for comparison
   */
  private async getOriginalPrices(panelIds: string[]) {
    // This would normally fetch from the catalog service
    const { catalogService } = await import('./catalogService');
    const prices = [];
    
    for (const panelId of panelIds) {
      const panel = await catalogService.computePanelPrice(panelId);
      if (panel) {
        prices.push(panel);
      }
    }
    
    return prices;
  }

  /**
   * Calculate price drift between original and live prices
   */
  private calculatePriceDrift(originalPrices: any[], livePrices: LivePriceResult[]): LivePriceResult[] {
    return livePrices.map(livePrice => {
      const original = originalPrices.find(p => p.id === livePrice.panel_id);
      if (original) {
        const variancePct = ((livePrice.current_price - original.computed_price) / original.computed_price) * 100;
        return {
          ...livePrice,
          price_variance_pct: Math.round(variancePct)
        };
      }
      return livePrice;
    });
  }

  /**
   * Generate external lab provider checkout URL with preselected tests
   */
  private generateExternalCheckoutUrl(panelIds: string[]): string {
    // This would generate URLs for Quest/LabCorp with preselected tests
    const testCodes = panelIds.join(',');
    return `https://questdirect.questdiagnostics.com/cart?tests=${encodeURIComponent(testCodes)}&ref=labpilot`;
  }

  /**
   * Generate individual lab provider URLs
   */
  private generateLabProviderUrl(panelId: string): string {
    return `https://questdirect.questdiagnostics.com/test/${panelId}?ref=labpilot`;
  }

  /**
   * Get base price for a panel (mock implementation)
   */
  private async getBasePriceForPanel(panelId: string): Promise<number> {
    // Mock prices - in reality this would come from your catalog
    const mockPrices: Record<string, number> = {
      'CBC_DIFF': 45,
      'CMP': 55,
      'LIPID_PANEL': 35,
      'HBA1C': 25,
      'THYROID_CORE': 85,
      'VITAMIN_D': 30,
      'HS_CRP': 20,
      'INSULIN_FASTING': 40,
      'HOMOCYSTEINE': 45,
      'OMEGA3_RBC': 120,
      'B12': 25,
      'FOLATE': 30,
    };
    
    return mockPrices[panelId] || 50;
  }
}

export const livePricingService = new LivePricingService();