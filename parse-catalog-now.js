const fs = require('fs');
const path = require('path');

// Read the text file and parse it
const textFilePath = path.join(process.cwd(), 'src/temp/fullscript_lab_catalog_text.txt');
const outputPath = path.join(process.cwd(), 'src/config/fullscript-catalog.json');

try {
  const text = fs.readFileSync(textFilePath, 'utf8');
  console.log(`Read ${text.length} characters from text file`);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log(`Processing ${lines.length} lines...`);
  
  const providers = [];
  const panelsMap = new Map();
  
  let currentProvider = '';
  let currentPanelName = '';
  let lineIndex = 0;
  
  const KNOWN_PROVIDERS = [
    'Quest Diagnostics', 'Access Labcorp Draw', 'Access Medical Labs',
    'Dutch Test', 'Diagnostic Solutions Laboratory', "Doctor's Data",
    'Genova Diagnostics', '3X4 Genetics', 'Cyrex Laboratories',
    'Great Plains Laboratory', 'Mosaic Diagnostics', 'Vibrant Wellness',
    'ZRT Laboratory', 'Precision Analytical', 'Metabolomix',
    'Cell Science Systems', 'Alletess Medical Laboratory',
    'Precision Analytical (DUTCH)', 'Diagnostic Solutions Laboratory'
  ];
  
  const PRICE_REGEX = /^\$?(\d+(?:\.\d{2})?)\+?$/;
  
  const toKebabCase = (str) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };
  
  const isSkippable = (line) => {
    const skipPatterns = [
      /^https?:\/\//,
      /^\d+\/\d+$/,
      /^Fullscript$/i,
      /^Labs$/i,
      /^Add to plan$/i,
      /^Compare$/i,
      /^Phlebotomy required$/i,
      /^handling fee may apply$/i,
      /^\+$/,
      /^Get started with labs$/i,
      /^Affordable pricing$/i,
      /^Learn more$/i,
      /^Search labs$/i,
      /^Build template$/i,
      /^Build custom panel$/i,
      /^Lab companies$/i,
      /^Health categories$/i,
      /^Sample types$/i,
      /^Phlebotomy$/i,
      /^Favorites$/i,
      /^Popular labs$/i,
      /Cole Egger/i,
      /Review plan/i,
      /^Starts at \$/i,
      /^\d+\/567/i
    ];
    return skipPatterns.some(pattern => pattern.test(line));
  };
  
  const isLikelyPanelName = (line) => {
    if (line.length < 3 || line.length > 150) return false;
    if (PRICE_REGEX.test(line)) return false;
    if (isSkippable(line)) return false;
    if (KNOWN_PROVIDERS.includes(line)) return false;
    
    // Skip single letters or numbers
    if (/^[A-Z]$/.test(line) || /^\d+$/.test(line)) return false;
    
    const panelIndicators = [
      /\bPanel\b/i, /\bProfile\b/i, /\bTest\b/i, /\bAnalysis\b/i,
      /\bScreen\b/i, /\bAssay\b/i, /\bMarker\b/i, /\bLevel\b/i,
      /\bComplete\b/i, /\bBasic\b/i, /\bComprehensive\b/i,
      /\bMetabolic\b/i, /\bLipid\b/i, /\bThyroid\b/i, /\bHormone\b/i,
      /\bVitamin\b/i, /\bMineral\b/i, /\bAllergy\b/i, /\bFood\b/i,
      /\bBlood\b/i, /\bUrine\b/i, /\bSaliva\b/i, /\bStool\b/i,
      /CBC/i, /CMP/i, /BMP/i, /TSH/i, /T3/i, /T4/i, /PSA/i,
      /\bDUTCH\b/i, /\bGI\b/i, /\bIgG\b/i, /\bIgE\b/i, /\bIgA\b/i,
      /Antibody/i, /Cholesterol/i, /Glucose/i, /Iron/i, /Calcium/i,
      /Sodium/i, /Potassium/i, /Albumin/i, /Creatinine/i, /Hemoglobin/i
    ];
    
    return panelIndicators.some(pattern => pattern.test(line)) ||
           (line.includes(' ') && !line.includes('$') && !/^\d/.test(line));
  };
  
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    
    if (isSkippable(line)) {
      lineIndex++;
      continue;
    }
    
    if (KNOWN_PROVIDERS.includes(line)) {
      currentProvider = line;
      if (!providers.includes(currentProvider)) {
        providers.push(currentProvider);
      }
      lineIndex++;
      continue;
    }
    
    if (isLikelyPanelName(line)) {
      currentPanelName = line;
      lineIndex++;
      
      let price = null;
      let phlebotomyRequired = false;
      let handlingFee = false;
      
      // Look ahead for price and attributes
      let lookahead = 0;
      while (lineIndex + lookahead < lines.length && lookahead < 10) {
        const nextLine = lines[lineIndex + lookahead];
        
        if (nextLine === 'Phlebotomy required') {
          phlebotomyRequired = true;
          lookahead++;
        } else if (nextLine === 'handling fee may apply') {
          handlingFee = true;
          lookahead++;
        } else if (PRICE_REGEX.test(nextLine) || nextLine.startsWith('Starts at $')) {
          const match = nextLine.match(/\$?(\d+(?:\.\d{2})?)/);
          if (match) {
            price = parseFloat(match[1]);
          }
          lineIndex += lookahead + 1;
          break;
        } else if (isSkippable(nextLine)) {
          lookahead++;
        } else if (KNOWN_PROVIDERS.includes(nextLine) || isLikelyPanelName(nextLine)) {
          lineIndex += lookahead;
          break;
        } else {
          lookahead++;
        }
      }
      
      if (currentPanelName && currentProvider) {
        const panelId = `fs-${toKebabCase(currentPanelName)}`;
        
        if (!panelsMap.has(panelId)) {
          panelsMap.set(panelId, {
            id: panelId,
            name: currentPanelName,
            display_name: currentPanelName,
            aliases: [currentPanelName],
            category: 'Laboratory Tests',
            subcategory: '',
            specimen: 'Serum',
            fasting_required: false,
            turnaround_days: '1-3 business days',
            biomarkers: [],
            clinical_significance: `Laboratory panel: ${currentPanelName}`,
            lab_provider: currentProvider,
            popular: ['Basic Metabolic Panel', 'CBC', 'Lipid Panel', 'DUTCH', 'Thyroid', 'Complete', 'Comprehensive']
              .some(popular => currentPanelName.toLowerCase().includes(popular.toLowerCase())),
            notes: `Available from multiple providers.`,
            providers: []
          });
        }
        
        const panel = panelsMap.get(panelId);
        panel.providers.push({
          name: currentProvider,
          price: price,
          phlebotomy_required: phlebotomyRequired,
          handling_fee: handlingFee,
          notes: handlingFee ? 'Handling fee may apply' : ''
        });
      }
      continue;
    }
    
    lineIndex++;
  }
  
  const result = {
    providers: providers,
    panels: Array.from(panelsMap.values())
  };
  
  console.log(`✅ Successfully parsed ${result.panels.length} panels from ${result.providers.length} providers`);
  
  // Write the JSON file
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`📁 Wrote complete catalog to ${outputPath}`);
  
} catch (error) {
  console.error('❌ Failed to parse catalog:', error);
  process.exit(1);
}