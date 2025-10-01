export type ProviderInfo = {
  name: string;
  price: number;
  phlebotomy_required: boolean;
  handling_fee?: boolean;
  notes?: string;
};

export type ParsedPanel = {
  id: string;
  name: string;
  display_name: string;
  category?: string;
  subcategory?: string;
  specimen?: string;
  fasting_required?: boolean;
  turnaround_days?: string | number;
  biomarkers?: string[];
  clinical_significance?: string;
  lab_provider?: string;
  popular?: boolean;
  notes?: string;
  aliases?: string[];
  providers: ProviderInfo[];
};

const KNOWN_PROVIDERS = [
  'Quest Diagnostics',
  'Access Labcorp Draw',
  'Access Medical Labs',
  'Precision Analytical (DUTCH)',
  'Diagnostic Solutions Laboratory',
  "Doctor's Data",
  'Mosaic Diagnostics',
  'Genova Diagnostics'
];

const PRICE_REGEX = /(Starts at\s*)?\$\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i;

function toKebabCase(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function isSkippable(line: string) {
  const l = line.trim();
  if (!l) return true;
  if (l.startsWith('http')) return true;
  const skipPhrases = [
    'Add to plan','Compare','Learn more','Build template','Build custom panel','Favorites',
    'Popular labs','Search labs','Book a call','Get started with labs','Affordable pricing',
    'Lab companies','Health categories','Sample types','Phlebotomy','Review plan'
  ];
  return skipPhrases.some(p => l.toLowerCase().includes(p.toLowerCase()));
}

function isLikelyPanelName(line: string) {
  const l = line.trim();
  if (!l) return false;
  if (PRICE_REGEX.test(l)) return false;
  if (/required/i.test(l)) return false;
  if (/^[A-Z]\s*$/.test(l)) return false; // single stray letter
  if (l.length < 3) return false;
  if (l.includes('/')) return false; // pagination fragments
  return true;
}

export function parseCatalogTextBasic(text: string) {
  const lines = text.split(/\r?\n/);
  const providersSet = new Set<string>();
  const panelMap = new Map<string, ParsedPanel>();

  let currentProvider: string | null = null;
  let currentPanelName: string | null = null;
  let phlebRequired = false;

  const pushPanel = (provider: string, name: string, priceStr: string) => {
    const match = PRICE_REGEX.exec(priceStr);
    if (!match) return;
    const price = parseFloat(match[2].replace(/,/g, ''));
    const id = toKebabCase(name);

    const existing = panelMap.get(id);
    const providerInfo: ProviderInfo = {
      name: provider,
      price,
      phlebotomy_required: phlebRequired,
      handling_fee: /\+/.test(priceStr) || /handling fee/i.test(priceStr) || provider.toLowerCase().includes('medical labs')
    };

    if (existing) {
      if (!existing.providers.find(p => p.name === provider && p.price === price)) {
        existing.providers.push(providerInfo);
      }
    } else {
      panelMap.set(id, {
        id,
        name,
        display_name: name,
        category: 'Laboratory Tests',
        specimen: 'Serum',
        fasting_required: /fast/i.test(name) || phlebRequired,
        turnaround_days: '1-3 business days',
        providers: [providerInfo],
        lab_provider: provider,
        aliases: [name]
      } as any);
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Detect provider switches
    const trimmed = line.trim();
    if (KNOWN_PROVIDERS.includes(trimmed)) {
      currentProvider = trimmed;
      providersSet.add(trimmed);
      currentPanelName = null;
      phlebRequired = false;
      continue;
    }

    if (!currentProvider) continue; // wait until provider appears
    if (isSkippable(trimmed)) continue;

    if (/Phlebotomy required/i.test(trimmed)) {
      phlebRequired = true;
      continue;
    }

    if (isLikelyPanelName(trimmed) && !currentPanelName) {
      currentPanelName = trimmed.replace(/\s+\d+\/\d+.*/, '').trim();
      continue;
    }

    if (currentPanelName && PRICE_REGEX.test(trimmed)) {
      pushPanel(currentProvider, currentPanelName, trimmed);
      // reset to look for next test under same provider
      currentPanelName = null;
      phlebRequired = false;
      continue;
    }
  }

  const panels = Array.from(panelMap.values());
  return {
    providers: Array.from(providersSet.size ? providersSet : new Set(KNOWN_PROVIDERS)),
    panels
  };
}
