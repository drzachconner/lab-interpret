import fs from 'fs';
import path from 'path';
import type { Panel, CatalogData, PanelValidationError, ValidationResult } from '../src/types/panel';

const CATALOG_PATH = path.join(process.cwd(), 'src/config/fullscript-catalog.json');

/**
 * Validates required fields for each panel in the catalog
 */
function validatePanel(panel: any, index: number): PanelValidationError | null {
  const errors: string[] = [];
  
  // Required fields
  if (!panel.id || typeof panel.id !== 'string') {
    errors.push('id (string)');
  }
  
  if (!panel.display_name && !panel.name) {
    errors.push('display_name or name (string)');
  }
  
  if (!panel.category || typeof panel.category !== 'string') {
    errors.push('category (string)');
  }
  
  if (!panel.specimen || typeof panel.specimen !== 'string') {
    errors.push('specimen (string)');
  }
  
  // Type validation for optional fields
  if (panel.fasting_required !== undefined && typeof panel.fasting_required !== 'boolean') {
    errors.push('fasting_required (boolean)');
  }
  
  if (panel.turnaround_days !== undefined && typeof panel.turnaround_days !== 'string') {
    errors.push('turnaround_days (string)');
  }
  
  if (panel.popular !== undefined && typeof panel.popular !== 'boolean') {
    errors.push('popular (boolean)');
  }
  
  if (panel.reference_price_usd !== undefined && 
      panel.reference_price_usd !== null && 
      typeof panel.reference_price_usd !== 'number') {
    errors.push('reference_price_usd (number|null)');
  }
  
  // Validate providers array
  if (panel.providers !== undefined) {
    if (!Array.isArray(panel.providers)) {
      errors.push('providers (array)');
    } else {
      panel.providers.forEach((provider: any, i: number) => {
        if (!provider.name || typeof provider.name !== 'string') {
          errors.push(`providers[${i}].name (string)`);
        }
        if (typeof provider.price !== 'number') {
          errors.push(`providers[${i}].price (number)`);
        }
      });
    }
  }
  
  // Validate arrays
  if (panel.aliases !== undefined && !Array.isArray(panel.aliases)) {
    errors.push('aliases (array)');
  }
  
  if (panel.biomarkers !== undefined && !Array.isArray(panel.biomarkers)) {
    errors.push('biomarkers (array)');
  }
  
  if (errors.length > 0) {
    return {
      index,
      id: panel.id,
      errors
    };
  }
  
  return null;
}

/**
 * Validates the entire catalog structure
 */
function validateCatalog(): ValidationResult {
  try {
    console.log('📋 Validating catalog structure...');
    
    if (!fs.existsSync(CATALOG_PATH)) {
      throw new Error(`Catalog file not found: ${CATALOG_PATH}`);
    }
    
    const rawData = fs.readFileSync(CATALOG_PATH, 'utf8');
    const catalogData: CatalogData = JSON.parse(rawData);
    
    // Validate top-level structure
    if (!catalogData.panels || !Array.isArray(catalogData.panels)) {
      throw new Error('Catalog must have a "panels" array');
    }
    
    if (!catalogData.providers || !Array.isArray(catalogData.providers)) {
      throw new Error('Catalog must have a "providers" array');
    }
    
    // Validate each panel
    const errors: PanelValidationError[] = [];
    catalogData.panels.forEach((panel: any, index: number) => {
      const error = validatePanel(panel, index);
      if (error) {
        errors.push(error);
      }
    });
    
    const totalPanels = catalogData.panels.length;
    const validPanels = totalPanels - errors.length;
    
    return {
      isValid: errors.length === 0,
      errors,
      totalPanels,
      validPanels
    };
    
  } catch (error) {
    console.error('❌ Catalog validation failed:', error);
    process.exit(1);
  }
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Starting catalog validation...');
  
  const result = validateCatalog();
  
  console.log(`\n📊 Validation Results:`);
  console.log(`   • Total panels: ${result.totalPanels}`);
  console.log(`   • Valid panels: ${result.validPanels}`);
  console.log(`   • Invalid panels: ${result.errors.length}`);
  
  if (result.isValid) {
    console.log('\n✅ All panels validated successfully!');
    console.log('🎉 Catalog is ready for production use.');
  } else {
    console.log('\n❌ Validation errors found:');
    
    // Group errors by type
    const errorsByType: Record<string, PanelValidationError[]> = {};
    result.errors.forEach(error => {
      error.errors.forEach(errorType => {
        if (!errorsByType[errorType]) {
          errorsByType[errorType] = [];
        }
        errorsByType[errorType].push(error);
      });
    });
    
    // Display grouped errors
    Object.entries(errorsByType).forEach(([errorType, panelErrors]) => {
      console.log(`\n🔸 ${errorType}:`);
      panelErrors.slice(0, 5).forEach(error => {
        console.log(`   Panel ${error.index}: ${error.id || 'unnamed'}`);
      });
      if (panelErrors.length > 5) {
        console.log(`   ... and ${panelErrors.length - 5} more`);
      }
    });
    
    console.log('\n💡 Fix these errors and run validation again.');
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  main();
}

export { validateCatalog, validatePanel };