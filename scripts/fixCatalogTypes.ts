import fs from 'fs';
import path from 'path';
import type { Panel, CatalogData } from '../src/types/panel';

const CATALOG_PATH = path.join(process.cwd(), 'src/config/fullscript-catalog.json');

/**
 * Automatically fixes common type issues in catalog panels
 */
function fixPanel(panel: any): Panel {
  // Ensure required fields have proper types
  const fixed: Panel = {
    id: String(panel.id || `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
    display_name: String(panel.display_name || panel.name || 'Unnamed Test'),
    category: String(panel.category || 'Laboratory Tests'),
    specimen: String(panel.specimen || 'Serum'),
  };
  
  // Fix optional fields with proper types
  if (panel.name && typeof panel.name === 'string') {
    fixed.name = panel.name;
  }
  
  if (panel.subcategory && typeof panel.subcategory === 'string') {
    fixed.subcategory = panel.subcategory;
  }
  
  if (typeof panel.fasting_required === 'boolean') {
    fixed.fasting_required = panel.fasting_required;
  } else if (panel.fasting_required) {
    fixed.fasting_required = Boolean(panel.fasting_required);
  }
  
  if (panel.turnaround_days && typeof panel.turnaround_days === 'string') {
    fixed.turnaround_days = panel.turnaround_days;
  } else if (panel.turnaround_days) {
    fixed.turnaround_days = String(panel.turnaround_days);
  }
  
  if (typeof panel.popular === 'boolean') {
    fixed.popular = panel.popular;
  }
  
  if (panel.clinical_significance && typeof panel.clinical_significance === 'string') {
    fixed.clinical_significance = panel.clinical_significance;
  }
  
  if (panel.lab_provider && typeof panel.lab_provider === 'string') {
    fixed.lab_provider = panel.lab_provider;
  }
  
  if (panel.notes && typeof panel.notes === 'string') {
    fixed.notes = panel.notes;
  }
  
  // Fix arrays
  if (Array.isArray(panel.aliases)) {
    fixed.aliases = panel.aliases.filter((alias: any) => typeof alias === 'string');
  }
  
  if (Array.isArray(panel.biomarkers)) {
    fixed.biomarkers = panel.biomarkers.filter((marker: any) => typeof marker === 'string');
  }
  
  // Fix providers array
  if (Array.isArray(panel.providers)) {
    fixed.providers = panel.providers
      .filter((p: any) => p && typeof p.name === 'string' && typeof p.price === 'number')
      .map((p: any) => ({
        name: String(p.name),
        price: Number(p.price),
        phlebotomy_required: Boolean(p.phlebotomy_required),
        handling_fee: Boolean(p.handling_fee),
        notes: p.notes ? String(p.notes) : undefined
      }));
  }
  
  // Fix reference price
  if (typeof panel.reference_price_usd === 'number') {
    fixed.reference_price_usd = panel.reference_price_usd;
  } else if (panel.reference_price_usd === null) {
    fixed.reference_price_usd = null;
  } else if (panel.providers && Array.isArray(panel.providers) && panel.providers[0]?.price) {
    fixed.reference_price_usd = Number(panel.providers[0].price);
  }
  
  return fixed;
}

/**
 * Fix the entire catalog
 */
function fixCatalog(): void {
  try {
    console.log('🔧 Fixing catalog types...');
    
    if (!fs.existsSync(CATALOG_PATH)) {
      throw new Error(`Catalog file not found: ${CATALOG_PATH}`);
    }
    
    const rawData = fs.readFileSync(CATALOG_PATH, 'utf8');
    const catalogData: any = JSON.parse(rawData);
    
    // Fix structure
    const fixedCatalog: CatalogData = {
      providers: Array.isArray(catalogData.providers) 
        ? catalogData.providers.filter((p: any) => typeof p === 'string')
        : [],
      panels: []
    };
    
    // Fix each panel
    if (Array.isArray(catalogData.panels)) {
      fixedCatalog.panels = catalogData.panels.map((panel: any) => fixPanel(panel));
    }
    
    // Write fixed catalog
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(fixedCatalog, null, 2), 'utf8');
    
    console.log(`✅ Fixed catalog with ${fixedCatalog.panels.length} panels`);
    console.log('🔍 Run validation to check for remaining issues');
    
  } catch (error) {
    console.error('❌ Failed to fix catalog:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fixCatalog();
}

export { fixCatalog, fixPanel };