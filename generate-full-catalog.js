const fs = require('fs');
const path = require('path');

// Read the complete text file and parse all panels
const textFilePath = path.join(process.cwd(), 'src/temp/fullscript_lab_catalog_text.txt');
const outputPath = path.join(process.cwd(), 'src/config/fullscript-catalog.json');

try {
  console.log('Reading and parsing complete Fullscript catalog...');
  
  const text = fs.readFileSync(textFilePath, 'utf8');
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  console.log(`Processing ${lines.length} lines from catalog text...`);
  
  const providers = [];
  const panelsMap = new Map();
  
  let currentProvider = '';
  let currentPanelName = '';
  let lineIndex = 0;
  let totalPanelsFound = 0;
  
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
      .substring(0, 100); // Limit length
  };
  
  const isSkippable = (line) => {
    const skipPatterns = [
      /^https?:\/\//,
      /^\d+\/\d+/,
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
      /^Build template/i,
      /^Lab companies$/i,
      /^Health categories$/i,
      /^Sample types$/i,
      /^Phlebotomy$/i,
      /^Favorites$/i,
      /^Popular labs$/i,
      /Cole Egger/i,
      /Review plan/i,
      /^\d+\/567/i,
      /^Leading lab partners/i,
      /^Fast, free shipping/i,
      /^Book a call$/i
    ];
    return skipPatterns.some(pattern => pattern.test(line));
  };
  
  // More aggressive panel name detection
  const isLikelyPanelName = (line) => {
    if (line.length < 3 || line.length > 200) return false;
    if (PRICE_REGEX.test(line)) return false;
    if (isSkippable(line)) return false;
    if (KNOWN_PROVIDERS.includes(line)) return false;
    
    // Skip single letters/numbers and obvious non-panel content
    if (/^[A-Z]$/.test(line) || /^\d+$/.test(line)) return false;
    if (line.startsWith('Starts at')) return false;
    
    // Look for medical/lab terms
    const medicalTerms = [
      /\b(Panel|Profile|Test|Analysis|Screen|Assay|Marker|Level|Complete|Basic|Comprehensive)\b/i,
      /\b(Metabolic|Lipid|Thyroid|Hormone|Vitamin|Mineral|Allergy|Food|Blood|Urine|Saliva|Stool)\b/i,
      /\b(CBC|CMP|BMP|TSH|T3|T4|PSA|DUTCH|GI|IgG|IgE|IgA|Antibody|Cholesterol|Glucose)\b/i,
      /\b(Iron|Calcium|Sodium|Potassium|Albumin|Creatinine|Hemoglobin|Ferritin|B12|Folate)\b/i,
      /\b(Cortisol|Insulin|Estrogen|Testosterone|Progesterone|DHEA|Aldosterone)\b/i,
      /\b(Hepatitis|HIV|Lyme|Epstein|Barr|Cytomegalovirus|Rubella|Measles)\b/i,
      /\b(Homocysteine|CRP|ESR|ANA|RF|Anti|Complement|Immunoglobulin)\b/i,
      /\b(Zinc|Copper|Magnesium|Selenium|Chromium|Manganese|Lead|Mercury|Arsenic)\b/i,
      /\b(Organic|Acids|Amino|Fatty|Porphyrins|Neurotransmitter|Methylation)\b/i
    ];
    
    // Check if line contains medical terms or is a reasonable lab name
    const hasValidMedicalTerm = medicalTerms.some(pattern => pattern.test(line));
    const looksLikePanelName = line.includes(' ') && !line.includes('$') && 
                              !line.includes('http') && 
                              !/^\d/.test(line) &&
                              line.split(' ').length <= 15; // Reasonable word count
    
    return hasValidMedicalTerm || looksLikePanelName;
  };
  
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    
    if (isSkippable(line)) {
      lineIndex++;
      continue;
    }
    
    // Provider detection
    if (KNOWN_PROVIDERS.includes(line)) {
      currentProvider = line;
      if (!providers.includes(currentProvider)) {
        providers.push(currentProvider);
      }
      lineIndex++;
      continue;
    }
    
    // Panel name detection
    if (isLikelyPanelName(line)) {
      currentPanelName = line;
      totalPanelsFound++;
      lineIndex++;
      
      let price = null;
      let phlebotomyRequired = false;
      let handlingFee = false;
      
      // Look ahead for price and attributes (up to 15 lines)
      let lookahead = 0;
      let foundPrice = false;
      
      while (lineIndex + lookahead < lines.length && lookahead < 15 && !foundPrice) {
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
            foundPrice = true;
          }
          lookahead++;
        } else if (isSkippable(nextLine)) {
          lookahead++;
        } else if (KNOWN_PROVIDERS.includes(nextLine) || isLikelyPanelName(nextLine)) {
          // Hit next provider or panel
          break;
        } else {
          lookahead++;
        }
      }
      
      lineIndex += lookahead;
      
      if (currentPanelName && currentProvider) {
        const panelId = `fs-${toKebabCase(currentPanelName)}`;
        
        if (!panelsMap.has(panelId)) {
          // Determine category based on panel name
          let category = 'Laboratory Tests';
          let subcategory = '';
          
          if (/thyroid|tsh|t3|t4/i.test(currentPanelName)) {
            subcategory = 'Endocrinology';
          } else if (/lipid|cholesterol|hdl|ldl|triglyceride/i.test(currentPanelName)) {
            subcategory = 'Cardiology';  
          } else if (/vitamin|mineral|b12|folate|d3/i.test(currentPanelName)) {
            subcategory = 'Vitamins & Minerals';
          } else if (/hormone|estrogen|testosterone|cortisol|dhea/i.test(currentPanelName)) {
            subcategory = 'Hormones';
          } else if (/allergy|igg|ige|food/i.test(currentPanelName)) {
            subcategory = 'Immunology';
          } else if (/cbc|blood|hemoglobin|platelet/i.test(currentPanelName)) {
            subcategory = 'Hematology';
          } else if (/metabolic|glucose|insulin|bmp|cmp/i.test(currentPanelName)) {
            subcategory = 'Chemistry';
          } else if (/stool|gi|parasite/i.test(currentPanelName)) {
            subcategory = 'Gastroenterology';
          } else if (/heavy|metal|toxic|lead|mercury/i.test(currentPanelName)) {
            subcategory = 'Toxicology';
          }
          
          panelsMap.set(panelId, {
            id: panelId,
            name: currentPanelName,
            display_name: currentPanelName,
            aliases: [currentPanelName],
            category: category,
            subcategory: subcategory,
            specimen: phlebotomyRequired ? 'Serum' : 'Various',
            fasting_required: /glucose|lipid|insulin|metabolic/i.test(currentPanelName),
            turnaround_days: '1-3 business days',
            biomarkers: [],
            clinical_significance: `Laboratory assessment: ${currentPanelName}`,
            lab_provider: currentProvider,
            popular: ['Basic', 'Complete', 'Comprehensive', 'CBC', 'Lipid', 'Thyroid', 'Metabolic', 'DUTCH']
              .some(popular => currentPanelName.toLowerCase().includes(popular.toLowerCase())),
            notes: `Available from ${currentProvider}`,
            providers: []
          });
        }
        
        const panel = panelsMap.get(panelId);
        
        // Add provider if not already present
        const existingProvider = panel.providers.find(p => p.name === currentProvider);
        if (!existingProvider) {
          panel.providers.push({
            name: currentProvider,
            price: price,
            phlebotomy_required: phlebotomyRequired,
            handling_fee: handlingFee,
            notes: handlingFee ? 'Handling fee may apply' : ''
          });
        }
      }
      continue;
    }
    
    lineIndex++;
  }
  
  const result = {
    providers: providers,
    panels: Array.from(panelsMap.values())
  };
  
  console.log(`\n📊 PARSING RESULTS:`);
  console.log(`   • Total lines processed: ${lines.length}`);
  console.log(`   • Panel names detected: ${totalPanelsFound}`);
  console.log(`   • Unique panels created: ${result.panels.length}`);
  console.log(`   • Providers found: ${result.providers.length}`);
  console.log(`   • Provider list: ${result.providers.join(', ')}`);
  
  // Write the complete catalog
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n✅ Successfully wrote complete catalog to: ${outputPath}`);
  console.log(`📋 Your lab marketplace will now show ${result.panels.length} lab tests!`);
  
} catch (error) {
  console.error('❌ Failed to generate complete catalog:', error);
  process.exit(1);
}