export type Fees = {
  network_authorization: number; // 12.5
  phlebotomy_draw: number;       // 10
  card_rate_percent: number;     // 2.9
  card_fixed: number;            // 0.3
};

export type PricingDefaults = {
  strategy: "reference_undercut";
  undercut_percent: number;   // e.g., 3
  min_margin_usd: number;     // e.g., 8
  absorb_network_fee: boolean;
  absorb_phleb_fee: boolean;
  absorb_card_fees: boolean;
};

type RefStrategy = { strategy: "reference_undercut"; undercut_percent?: number; min_margin_usd?: number; };
type FixedStrategy = { strategy: "fixed"; our_price_usd: number; };
type BundleStrategy = { strategy: "bundle_sum_less"; bundle_discount_percent: number; min_margin_usd?: number; };

export type PricingStrategy = RefStrategy | FixedStrategy | BundleStrategy;

export function computeRetailPrice(opts: {
  fs_base_cost_usd: number;          // your Fullscript lab cost (what FS bills the patient)
  reference_price_usd?: number | null; // competitor price if known (Jason Health)
  strategy: PricingStrategy;
  defaults: PricingDefaults;
  fees: Fees;
}) {
  const { fs_base_cost_usd, reference_price_usd, strategy, defaults, fees } = opts;

  // Enhanced price fallback logic - handle multiple candidate prices
  const candidates = [
    reference_price_usd,
    fs_base_cost_usd
  ].filter((v): v is number => typeof v === 'number' && !Number.isNaN(v) && v > 0);
  
  if (candidates.length === 0) {
    // No valid price found - return null to indicate "Contact for Price"
    return null;
  }

  // Fees that you choose to absorb inside retail
  const absorbed =
    (defaults.absorb_network_fee ? fees.network_authorization : 0) +
    (defaults.absorb_phleb_fee   ? fees.phlebotomy_draw       : 0);

  // Start from a target "tag" price based on strategy
  let tag: number;

  if (strategy.strategy === "fixed") {
    tag = strategy.our_price_usd;
  } else if (strategy.strategy === "bundle_sum_less") {
    // call this from a bundle aggregator that already summed component "fs_base_cost_usd"
    const pct = strategy.bundle_discount_percent / 100;
    tag = fs_base_cost_usd * (1 - pct);
    const minMargin = strategy.min_margin_usd ?? defaults.min_margin_usd;
    if (tag < fs_base_cost_usd + absorbed + minMargin) {
      tag = fs_base_cost_usd + absorbed + minMargin;
    }
  } else {
    // reference_undercut
    const undercut = (strategy.undercut_percent ?? defaults.undercut_percent) / 100;
    if (reference_price_usd && reference_price_usd > 0) {
      tag = reference_price_usd * (1 - undercut);
    } else {
      // If no reference price yet, fall back to cost-plus
      tag = fs_base_cost_usd + absorbed + (defaults.min_margin_usd);
    }
  }

  // Include absorbed fees inside tag
  let retailBeforeCard = tag;

  // If you want to "true up" for card fees so net margin holds, gross-up:
  if (defaults.absorb_card_fees) {
    const r = fees.card_rate_percent / 100; // 0.029
    const f = fees.card_fixed;              // 0.30
    // Solve: net = retailBeforeCard - (retail * r + f)
    // Usually we gross-up so that after fees we still land near retailBeforeCard:
    // retailGross = (retailBeforeCard + f) / (1 - r)
    const retailGross = (retailBeforeCard + f) / (1 - r);
    retailBeforeCard = retailGross;
  }

  // Ensure we're not below cost + absorbed fees + min margin
  const floor = fs_base_cost_usd + absorbed + defaults.min_margin_usd;
  const final = Math.max(retailBeforeCard, floor);

  // Round to whole dollars (or .99)
  const rounded = Math.round(final); // or: Math.ceil(final - 0.01) + 0.99

  return {
    price_usd: rounded,
    breakdown: {
      fs_base_cost_usd,
      absorbed_fees_usd: absorbed,
      reference_used: reference_price_usd ?? null
    }
  };
}