/**
 * Core Panel and Provider Types
 * These types ensure strict validation of lab catalog data
 */

export interface Provider {
  name: string;
  price: number;
  phlebotomy_required?: boolean;
  handling_fee?: boolean;
  notes?: string;
}

export interface Panel {
  id: string;
  display_name: string;
  name?: string; // fallback for display_name
  category: string;
  subcategory?: string;
  specimen: string;
  fasting_required?: boolean;
  turnaround_days?: string;
  aliases?: string[];
  biomarkers?: string[];
  clinical_significance?: string;
  lab_provider?: string;
  popular?: boolean;
  notes?: string;
  providers?: Provider[];
  reference_price_usd?: number | null;
}

export interface CatalogData {
  providers: string[];
  panels: Panel[];
}

/**
 * Pricing and Fee Types
 */
export interface PricingFees {
  network_authorization: number;
  phlebotomy_draw: number;
  card_rate_percent: number;
  card_fixed: number;
}

export interface PricingDefaults {
  strategy: "reference_undercut";
  undercut_percent: number;
  min_margin_usd: number;
  absorb_network_fee: boolean;
  absorb_phleb_fee: boolean;
  absorb_card_fees: boolean;
}

/**
 * Pricing Strategy Types
 */
export interface RefStrategy { 
  strategy: "reference_undercut"; 
  undercut_percent?: number; 
  min_margin_usd?: number; 
}

export interface FixedStrategy { 
  strategy: "fixed"; 
  our_price_usd: number; 
}

export interface BundleStrategy { 
  strategy: "bundle_sum_less"; 
  bundle_discount_percent: number; 
  min_margin_usd?: number; 
}

export type PricingStrategy = RefStrategy | FixedStrategy | BundleStrategy;

/**
 * Enhanced Panel type with computed pricing and lab-specific fields
 */
export interface PricedPanel extends Panel {
  // Ensure all Panel properties are explicitly available
  id: string;
  display_name: string;
  category: string;
  specimen: string;
  subcategory?: string;
  fasting_required?: boolean;
  turnaround_days?: string;
  aliases?: string[];
  biomarkers?: string[];
  clinical_significance?: string;
  lab_provider?: string;
  popular?: boolean;
  notes?: string;
  
  // Lab-specific additions
  fs_sku: string;
  pricing: PricingStrategy;
  computed_price: number | null;
  price_breakdown: {
    fs_base_cost_usd: number;
    absorbed_fees_usd: number;
    reference_used: number | null;
  };
  is_higher_than_reference?: boolean;
}

/**
 * Validation Helpers
 */
export interface PanelValidationError {
  index: number;
  id: string | undefined;
  errors: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: PanelValidationError[];
  totalPanels: number;
  validPanels: number;
}