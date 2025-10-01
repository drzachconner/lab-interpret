// Script to add hundreds more panels to reach 1000+ total
const fs = require('fs');
const path = require('path');

// Read current catalog
const catalogPath = path.join(process.cwd(), 'src/config/fullscript-catalog.json');
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Generate hundreds more panels based on patterns from the text
const additionalPanels = [
  // Allergy Testing - IgE panels (from text data)
  { name: "Cat Dander (e1) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Dog Dander (e5) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Dust Mite (d1) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Peanut (f13) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Milk (f2) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Egg White (f1) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Wheat (f4) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Soy (f14) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Sesame Seed (f10) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Shrimp (f24) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Salmon (f41) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Codfish (f3) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Apple (f49) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Orange (f33) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Strawberry (f44) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Timothy Grass (g6) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Ragweed (w1) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Birch (t3) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Oak (t7) IgE", price: 7.25, category: "Allergy Testing" },
  { name: "Alternaria (m6) IgE", price: 7.25, category: "Allergy Testing" },

  // Hormone Tests
  { name: "Testosterone, Total", price: 20.83, category: "Hormones" },
  { name: "Testosterone, Free", price: 55.56, category: "Hormones" },
  { name: "Estradiol, Ultrasensitive", price: 23.61, category: "Hormones" },
  { name: "Progesterone", price: 18.75, category: "Hormones" },
  { name: "DHEA Sulfate", price: 10.42, category: "Hormones" },
  { name: "Cortisol, AM", price: 11.28, category: "Hormones" },
  { name: "FSH (Follicle Stimulating Hormone)", price: 6.25, category: "Hormones" },
  { name: "LH (Luteinizing Hormone)", price: 8.50, category: "Hormones" },
  { name: "Prolactin", price: 12.75, category: "Hormones" },
  { name: "Growth Hormone", price: 22.13, category: "Hormones" },

  // Thyroid Complete Panel
  { name: "T3, Free", price: 8.33, category: "Endocrinology" },
  { name: "T4 Free (FT4)", price: 4.86, category: "Endocrinology" },
  { name: "T3, Total", price: 5.35, category: "Endocrinology" },
  { name: "T4, Total", price: 4.86, category: "Endocrinology" },
  { name: "T3 Reverse", price: 23.69, category: "Endocrinology" },
  { name: "Thyroid Peroxidase Antibody", price: 17.50, category: "Endocrinology" },
  { name: "Thyroglobulin Antibody", price: 16.25, category: "Endocrinology" },

  // Cardiology Extended
  { name: "HDL Cholesterol", price: 2.78, category: "Cardiology" },
  { name: "LDL Cholesterol", price: 10.54, category: "Cardiology" },
  { name: "Triglycerides", price: 2.78, category: "Cardiology" },
  { name: "Apolipoprotein B", price: 21.96, category: "Cardiology" },
  { name: "Homocysteine", price: 19.44, category: "Cardiology" },
  { name: "Lipoprotein(a)", price: 22.22, category: "Cardiology" },
  { name: "C-Reactive Protein", price: 6.94, category: "Cardiology" },
  { name: "hs-CRP", price: 12.26, category: "Cardiology" },

  // Vitamin/Mineral Complete
  { name: "Folate, Serum", price: 4.64, category: "Vitamins & Minerals" },
  { name: "Vitamin B1 (Thiamine)", price: 38.42, category: "Vitamins & Minerals" },
  { name: "Vitamin B6", price: 36.71, category: "Vitamins & Minerals" },
  { name: "Vitamin C", price: 33.51, category: "Vitamins & Minerals" },
  { name: "Vitamin E", price: 30.07, category: "Vitamins & Minerals" },
  { name: "Vitamin A", price: 29.83, category: "Vitamins & Minerals" },
  { name: "Iron, Total", price: 3.54, category: "Vitamins & Minerals" },
  { name: "Magnesium, RBC", price: 12.68, category: "Vitamins & Minerals" },
  { name: "Zinc", price: 14.25, category: "Vitamins & Minerals" },
  { name: "Copper", price: 16.21, category: "Vitamins & Minerals" },
  { name: "Selenium", price: 35.46, category: "Vitamins & Minerals" },

  // Diabetes/Glucose
  { name: "Glucose", price: 6.29, category: "Diabetes" },
  { name: "Insulin, Fasting", price: 6.60, category: "Diabetes" },
  { name: "C-Peptide", price: 22.50, category: "Diabetes" },
  { name: "Fructosamine", price: 15.25, category: "Diabetes" },

  // Immunology
  { name: "ANA Screen", price: 6.94, category: "Immunology" },
  { name: "Rheumatoid Factor", price: 6.88, category: "Immunology" },
  { name: "Immunoglobulin A", price: 7.15, category: "Immunology" },
  { name: "Immunoglobulin G", price: 8.25, category: "Immunology" },
  { name: "Immunoglobulin M", price: 9.15, category: "Immunology" },
  { name: "Complement C3", price: 14.58, category: "Immunology" },
  { name: "Complement C4", price: 14.58, category: "Immunology" },

  // Hepatitis/Infectious Disease
  { name: "Hepatitis A Ab Total", price: 15.03, category: "Infectious Disease" },
  { name: "Hepatitis B Surface Ag", price: 16.05, category: "Infectious Disease" },
  { name: "Hepatitis C Ab", price: 17.10, category: "Infectious Disease" },
  { name: "HIV Ab-Ag Panel", price: 11.56, category: "Infectious Disease" },
  { name: "Epstein-Barr Evaluation", price: 103.36, category: "Infectious Disease" },
  { name: "Cytomegalovirus IgG", price: 196.88, category: "Infectious Disease" },
  { name: "Rubella IgG", price: 16.05, category: "Infectious Disease" },

  // Kidney Function
  { name: "Creatinine", price: 6.29, category: "Nephrology" },
  { name: "BUN", price: 4.28, category: "Nephrology" },
  { name: "Albumin/Creatinine Ratio", price: 15.50, category: "Nephrology" },
  { name: "Urinalysis Complete", price: 3.96, category: "Nephrology" },

  // Liver Function  
  { name: "ALT", price: 6.29, category: "Chemistry" },
  { name: "AST", price: 6.50, category: "Chemistry" },
  { name: "Alkaline Phosphatase", price: 4.28, category: "Chemistry" },
  { name: "Bilirubin, Total", price: 6.29, category: "Chemistry" },
  { name: "Bilirubin, Direct", price: 6.29, category: "Chemistry" },

  // Electrolytes
  { name: "Sodium", price: 6.29, category: "Chemistry" },
  { name: "Potassium", price: 6.29, category: "Chemistry" },
  { name: "Chloride", price: 6.29, category: "Chemistry" },
  { name: "Carbon Dioxide", price: 6.29, category: "Chemistry" },

  // Specialty Tests from Doctor's Data
  { name: "Hair Elements", price: 79.00, category: "Toxicology", lab: "Doctor's Data" },
  { name: "Plasma Amino Acids", price: 239.00, category: "Metabolomics", lab: "Doctor's Data" },
  { name: "Secretory IgA", price: 89.00, category: "Immunology", lab: "Doctor's Data" },
  { name: "Zonulin Family Protein", price: 79.00, category: "Gastroenterology", lab: "Doctor's Data" },
  { name: "Comprehensive Adrenal Function", price: 132.00, category: "Hormones", lab: "Doctor's Data" },
  { name: "Sex Hormones Profile", price: 169.00, category: "Hormones", lab: "Doctor's Data" },
  { name: "Estrogen Metabolites Profile", price: 139.00, category: "Hormones", lab: "Doctor's Data" },

  // Specialty Tests from Genova Diagnostics
  { name: "NutrEval FMV", price: 439.00, category: "Nutritional Assessment", lab: "Genova Diagnostics" },
  { name: "Adrenocortex Stress Profile", price: 135.00, category: "Hormones", lab: "Genova Diagnostics" },

  // Specialty Tests from Mosaic Diagnostics  
  { name: "Organic Acids Test (OAT)", price: 280.00, category: "Metabolomics", lab: "Mosaic Diagnostics" },
  { name: "MycoTOX", price: 275.00, category: "Toxicology", lab: "Mosaic Diagnostics" },
  { name: "IgG Food MAP", price: 225.00, category: "Allergy Testing", lab: "Mosaic Diagnostics" },
  { name: "Amino Acids Plasma", price: 285.00, category: "Metabolomics", lab: "Mosaic Diagnostics" },
  { name: "Comprehensive Stool Analysis", price: 340.00, category: "Gastroenterology", lab: "Mosaic Diagnostics" },

  // More DUTCH Tests
  { name: "DUTCH Complete", price: 300.00, category: "Hormones", lab: "Precision Analytical (DUTCH)" },
  { name: "DUTCH Adrenals Only", price: 180.00, category: "Hormones", lab: "Precision Analytical (DUTCH)" },
  { name: "DUTCH Cortisol Awakening Response", price: 175.00, category: "Hormones", lab: "Precision Analytical (DUTCH)" },

  // More Diagnostic Solutions Tests
  { name: "OMX Organic Metabolomics", price: 228.78, category: "Metabolomics", lab: "Diagnostic Solutions Laboratory" },
  { name: "Zonulin Profile", price: 105.78, category: "Gastroenterology", lab: "Diagnostic Solutions Laboratory" },
  { name: "Calprotectin", price: 81.18, category: "Gastroenterology", lab: "Diagnostic Solutions Laboratory" },
  { name: "Amino Acids Profile", price: 146.78, category: "Metabolomics", lab: "Diagnostic Solutions Laboratory" }
];

// Add each panel to the catalog
additionalPanels.forEach((panelData, index) => {
  const labProvider = panelData.lab || "Quest Diagnostics";
  const panel = {
    id: `fs-${panelData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: panelData.name,
    display_name: panelData.name,
    aliases: [panelData.name],
    category: "Laboratory Tests",
    subcategory: panelData.category,
    specimen: panelData.category === "Hematology" ? "Whole Blood" : 
              panelData.category === "Hormones" && panelData.lab === "Precision Analytical (DUTCH)" ? "Urine" :
              panelData.category === "Gastroenterology" ? "Stool" :
              panelData.category === "Toxicology" && panelData.name.includes("Hair") ? "Hair" :
              "Serum",
    fasting_required: ["Glucose", "Insulin", "Lipid", "Cholesterol", "Triglycerides"].some(term => 
      panelData.name.toLowerCase().includes(term.toLowerCase())
    ),
    turnaround_days: panelData.lab ? "7-10 business days" : "1-3 business days",
    biomarkers: [],
    clinical_significance: `Laboratory assessment: ${panelData.name}`,
    lab_provider: labProvider,
    popular: ["TSH", "CBC", "Lipid", "Metabolic", "Vitamin D", "B12"].some(popular => 
      panelData.name.toLowerCase().includes(popular.toLowerCase())
    ),
    notes: panelData.lab ? `Specialty testing from ${panelData.lab}` : "Available from multiple providers",
    providers: [
      {
        name: labProvider,
        price: panelData.price,
        phlebotomy_required: !["Urine", "Stool", "Hair"].includes(panelData.specimen || "Serum"),
        handling_fee: labProvider === "Access Medical Labs",
        notes: labProvider === "Access Medical Labs" ? "Handling fee may apply" : ""
      }
    ]
  };

  catalog.panels.push(panel);
});

// Write updated catalog
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log(`✅ Added ${additionalPanels.length} more panels!`);
console.log(`📋 Total panels now: ${catalog.panels.length}`);