import fs from 'fs';
import path from 'path';
// If your parser export name differs, update here:
import { parseCatalogTextBasic } from '../src/utils/localCatalogParser';

const INPUT  = path.join(process.cwd(), 'data/fullscript_lab_catalog_text.txt');
const OUTPUT = path.join(process.cwd(), 'src/config/fullscript-catalog.json');

function requireFile(p: string) {
  if (!fs.existsSync(p)) {
    throw new Error(`Missing required file: ${p}\nPlace your raw catalog text at data/fullscript_lab_catalog_text.txt`);
  }
}

function normalizePanel(p: any, i: number) {
  return {
    id: p.id ?? `panel_${i}`,
    display_name: p.display_name ?? p.name ?? 'Unnamed Panel',
    category: p.category ?? 'General',
    specimen: p.specimen ?? 'Blood',
    fasting_required: Boolean(p.fasting_required),
    turnaround_days: typeof p.turnaround_days === 'string' ? p.turnaround_days : 'Varies',
    providers: Array.isArray(p.providers) ? p.providers : [],
    reference_price_usd: typeof p.reference_price_usd === 'number' ? p.reference_price_usd : undefined,
    ...p
  };
}

(async () => {
  requireFile(INPUT);
  const text = fs.readFileSync(INPUT, 'utf8');
  const parsed = parseCatalogTextBasic(text);

  if (!parsed || !Array.isArray(parsed.panels) || parsed.panels.length === 0) {
    throw new Error('Parser produced 0 panels — check raw input format or parser rules.');
  }

  const normalized = {
    ...parsed,
    panels: parsed.panels.map(normalizePanel),
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(normalized, null, 2), 'utf8');
  console.log(`✅ Wrote ${normalized.panels.length} panels to ${OUTPUT}`);
})();