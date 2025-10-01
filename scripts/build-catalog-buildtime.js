const fs = require('fs');
const path = require('path');

// Build-time catalog parser that reads from data/ and writes to src/config/
const RAW_TEXT_PATH = path.join(process.cwd(), 'data/fullscript_lab_catalog_text.txt');
const OUTPUT_PATH = path.join(process.cwd(), 'src/config/fullscript-catalog.json');

function parseCatalogTextBasic(text) {
  console.log('🔄 Parsing catalog text...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const providers = [];
  const panels = [];
  
  let currentProvider = '';
  let panelCount = 0;
  
  const KNOWN_PROVIDERS = [
    'Quest Diagnostics', 'Access Labcorp Draw', 'Access Medical Labs',
    'Precision Analytical (DUTCH)', 'Diagnostic Solutions Laboratory', 
    "Doctor's Data", 'Genova Diagnostics', '3X4 Genetics', 
    'Cyrex Laboratories', 'Great Plains Laboratory', 'Mosaic Diagnostics', 
    'Vibrant Wellness', 'ZRT Laboratory', 'Precision Analytical', 'Metabolomix',
    'Cell Science Systems', 'Alletess Medical Laboratory'
  ];
  
  const PRICE_REGEX = /^\$?(\d+(?:\.\d{2})?)\+?$/;
  
  const toKebabCase = (str) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  };
  
  const isSkippable = (line) => {
    const skipPatterns = [
      /^https?:\/\//, /^\d+\/\d+/, /^Fullscript$/i, /^Labs$/i, /^Add to plan$/i,
      /^Compare$/i, /^Phlebotomy required$/i, /^handling fee may apply$/i, /^\+$/,
      /^Get started with labs$/i, /^Affordable pricing$/i, /^Learn more$/i
    ];
    return skipPatterns.some(pattern => pattern.test(line));
  };
  
  const isLikelyPanelName = (line) => {
    if (line.length < 3 || line.length > 200) return false;
    if (PRICE_REGEX.test(line)) return false;
    if (isSkippable(line)) return false;
    if (KNOWN_PROVIDERS.includes(line)) return false;
    
    const medicalTerms = [
      /\b(Panel|Profile|Test|Analysis|Screen|Assay|Marker|Level|Complete|Basic|Comprehensive)\b/i,
      /\b(Metabolic|Lipid|Thyroid|Hormone|Vitamin|Mineral|Allergy|Food|Blood|Urine|Saliva|Stool)\b/i,
      /\b(CBC|CMP|BMP|TSH|T3|T4|PSA|DUTCH|GI|IgG|IgE|IgA|Antibody|Cholesterol|Glucose)\b/i,
      /\b(Iron|Calcium|Sodium|Potassium|Albumin|Creatinine|Hemoglobin|Ferritin|B12|Folate)\b/i,
      /\b(Cortisol|Insulin|Estrogen|Testosterone|Progesterone|DHEA|Aldosterone)\b/i
    ];
    
    const hasValidMedicalTerm = medicalTerms.some(pattern => pattern.test(line));
    const looksLikePanelName = line.includes(' ') && !line.includes('$') && 
                              !line.includes('http') && !/^\d/.test(line);
    
    return hasValidMedicalTerm || looksLikePanelName;
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (isSkippable(line)) continue;
    
    if (KNOWN_PROVIDERS.includes(line)) {
      currentProvider = line;
      if (!providers.includes(currentProvider)) {
        providers.push(currentProvider);
      }
      continue;
    }
    
    if (isLikelyPanelName(line)) {
      const panelId = `fs-${toKebabCase(line)}`;
      let price = null;
      let phlebotomyRequired = false;
      
      // Look ahead for price
      for (let j = 1; j <= 10 && i + j < lines.length; j++) {
        const nextLine = lines[i + j];
        if (nextLine === 'Phlebotomy required') {
          phlebotomyRequired = true;
        } else if (PRICE_REGEX.test(nextLine) || nextLine.startsWith('Starts at $')) {
          const match = nextLine.match(/\$?(\d+(?:\.\d{2})?)/);
          if (match) price = parseFloat(match[1]);
          break;
        } else if (KNOWN_PROVIDERS.includes(nextLine) || isLikelyPanelName(nextLine)) {
          break;
        }
      }
      
      // Determine category
      let subcategory = '';
      if (/thyroid|tsh|t3|t4/i.test(line)) subcategory = 'Endocrinology';
      else if (/lipid|cholesterol|hdl|ldl|triglyceride/i.test(line)) subcategory = 'Cardiology';
      else if (/vitamin|mineral|b12|folate|d3/i.test(line)) subcategory = 'Vitamins & Minerals';
      else if (/hormone|estrogen|testosterone|cortisol|dhea/i.test(line)) subcategory = 'Hormones';
      else if (/allergy|igg|ige|food/i.test(line)) subcategory = 'Immunology';
      else if (/cbc|blood|hemoglobin|platelet/i.test(line)) subcategory = 'Hematology';
      else if (/metabolic|glucose|insulin|bmp|cmp/i.test(line)) subcategory = 'Chemistry';
      
      panels.push({
        id: panelId,
        name: line,
        display_name: line,
        aliases: [line],
        category: 'Laboratory Tests',
        subcategory: subcategory,
        specimen: phlebotomyRequired ? 'Serum' : 'Various',
        fasting_required: /glucose|lipid|insulin|metabolic/i.test(line),
        turnaround_days: '1-3 business days',
        biomarkers: [],
        clinical_significance: `Laboratory assessment: ${line}`,
        lab_provider: currentProvider || 'Various',
        popular: ['Basic', 'Complete', 'Comprehensive', 'CBC', 'Lipid', 'Thyroid']
          .some(popular => line.toLowerCase().includes(popular.toLowerCase())),
        notes: `Available from ${currentProvider || 'multiple providers'}`,
        providers: currentProvider && price ? [{
          name: currentProvider,
          price: price,
          phlebotomy_required: phlebotomyRequired,
          handling_fee: false,
          notes: ''
        }] : []
      });
      
      panelCount++;
    }
  }
  
  console.log(`✅ Parsed ${panelCount} panels from ${providers.length} providers`);
  return { providers, panels };
}

function buildCatalog() {
  try {
    console.log('🚀 Starting build-time catalog generation...');
    
    // Check if raw text file exists
    if (!fs.existsSync(RAW_TEXT_PATH)) {
      console.log(`⚠️  Raw text file not found at: ${RAW_TEXT_PATH}`);
      console.log('📝 Using existing catalog as fallback...');
      return;
    }
    
    const rawText = fs.readFileSync(RAW_TEXT_PATH, 'utf8');
    const parsed = parseCatalogTextBasic(rawText);
    
    if (!parsed?.panels?.length) {
      console.error('❌ Parser produced 0 panels');
      return;
    }
    
    // Ensure output directory exists
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    
    // Write the parsed catalog
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsed, null, 2), 'utf8');
    
    console.log(`✅ Successfully generated catalog with ${parsed.panels.length} panels`);
    console.log(`📄 Saved to: ${OUTPUT_PATH}`);
    
  } catch (error) {
    console.error('❌ Failed to build catalog:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  buildCatalog();
}

module.exports = { buildCatalog, parseCatalogTextBasic };