// Test Lab Data for BiohackLabs.ai
// Use this to test the AI analysis system

export const sampleLabData = {
  userProfile: {
    age: 45,
    biologicalSex: "male",
    healthGoals: ["longevity", "cognitive_optimization", "energy"],
    currentMedications: [],
    healthConditions: []
  },
  labResults: {
    // Complete Blood Count (CBC)
    CBC: {
      WBC: { value: 5.2, unit: "10^3/uL", range: "4.5-11.0" },
      RBC: { value: 4.8, unit: "10^6/uL", range: "4.5-5.9" },
      Hemoglobin: { value: 14.5, unit: "g/dL", range: "13.5-17.5" },
      Hematocrit: { value: 42, unit: "%", range: "39-49" },
      MCV: { value: 88, unit: "fL", range: "80-100" },
      MCH: { value: 30, unit: "pg", range: "26-34" },
      MCHC: { value: 34, unit: "g/dL", range: "31-37" },
      Platelets: { value: 220, unit: "10^3/uL", range: "150-400" }
    },
    
    // Comprehensive Metabolic Panel
    metabolicPanel: {
      glucose: { value: 95, unit: "mg/dL", range: "70-99" },
      BUN: { value: 18, unit: "mg/dL", range: "7-20" },
      creatinine: { value: 1.1, unit: "mg/dL", range: "0.7-1.3" },
      eGFR: { value: 85, unit: "mL/min", range: ">60" },
      sodium: { value: 140, unit: "mmol/L", range: "136-145" },
      potassium: { value: 4.2, unit: "mmol/L", range: "3.5-5.1" },
      chloride: { value: 102, unit: "mmol/L", range: "98-107" },
      CO2: { value: 24, unit: "mmol/L", range: "22-29" },
      calcium: { value: 9.8, unit: "mg/dL", range: "8.5-10.5" },
      totalProtein: { value: 7.2, unit: "g/dL", range: "6.3-8.2" },
      albumin: { value: 4.3, unit: "g/dL", range: "3.5-5.0" },
      bilirubin: { value: 0.8, unit: "mg/dL", range: "0.1-1.2" },
      ALT: { value: 28, unit: "U/L", range: "7-56" },
      AST: { value: 25, unit: "U/L", range: "10-40" }
    },
    
    // Lipid Panel
    lipids: {
      totalCholesterol: { value: 195, unit: "mg/dL", range: "<200" },
      LDLCholesterol: { value: 120, unit: "mg/dL", range: "<100" },
      HDLCholesterol: { value: 48, unit: "mg/dL", range: ">40" },
      triglycerides: { value: 135, unit: "mg/dL", range: "<150" },
      nonHDLCholesterol: { value: 147, unit: "mg/dL", range: "<130" }
    },
    
    // Hormones
    hormones: {
      testosteroneTotal: { value: 450, unit: "ng/dL", range: "300-1000" },
      testosteroneFree: { value: 12, unit: "pg/mL", range: "9-30" },
      estradiol: { value: 28, unit: "pg/mL", range: "10-40" },
      DHEAS: { value: 180, unit: "ug/dL", range: "80-560" },
      cortisol: { value: 14, unit: "ug/dL", range: "6-23" },
      TSH: { value: 2.8, unit: "mIU/L", range: "0.4-4.5" },
      freeT3: { value: 3.1, unit: "pg/mL", range: "2.3-4.2" },
      freeT4: { value: 1.2, unit: "ng/dL", range: "0.8-1.8" },
      IGF1: { value: 165, unit: "ng/mL", range: "88-246" }
    },
    
    // Inflammation Markers
    inflammation: {
      hsCRP: { value: 2.1, unit: "mg/L", range: "<3.0" },
      homocysteine: { value: 11, unit: "umol/L", range: "<15" },
      fibrinogen: { value: 320, unit: "mg/dL", range: "200-400" },
      ESR: { value: 12, unit: "mm/hr", range: "0-20" }
    },
    
    // Vitamins & Minerals
    nutrients: {
      vitaminD: { value: 35, unit: "ng/mL", range: "30-100" },
      vitaminB12: { value: 420, unit: "pg/mL", range: "200-900" },
      folate: { value: 12, unit: "ng/mL", range: "3-20" },
      ferritin: { value: 85, unit: "ng/mL", range: "30-400" },
      iron: { value: 90, unit: "ug/dL", range: "60-170" },
      TIBC: { value: 340, unit: "ug/dL", range: "250-450" },
      magnesium: { value: 1.9, unit: "mg/dL", range: "1.7-2.2" },
      zinc: { value: 75, unit: "ug/dL", range: "70-120" }
    }
  }
};

// Test function to send to API
export async function testAnalysis() {
  const response = await fetch('/api/analyze-labs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
    },
    body: JSON.stringify({
      orderId: 'test-order-123',
      labContent: JSON.stringify(sampleLabData.labResults),
      userProfile: sampleLabData.userProfile
    })
  });
  
  const result = await response.json();
  console.log('Analysis Result:', result);
  return result;
}