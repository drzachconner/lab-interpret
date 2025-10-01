// Lab ordering fees and calculations
export const AUTHORIZATION_NETWORK_FEE = 12.50; // Per test/panel
export const BLOOD_DRAW_FEE = 10.00; // Quest/Labcorp draw fee
export const SPECIALTY_KIT_SERVICE_FEE_RATE = 0.03; // 3% service fee
export const AI_INTERPRETATION_FEE = 19.00;

export interface LabFees {
  authorizationFee: number;
  bloodDrawFee: number;
  serviceFeePct: number;
  serviceFeeDollar: number;
  aiInterpretationFee: number;
  total: number;
}

export interface FeeCalculationParams {
  panelPrice: number;
  requiresAuthorization: boolean;
  includesBloodDraw: boolean;
  isSpecialtyKit: boolean;
  includeAiInterpretation: boolean;
}

export function calculateLabFees(params: FeeCalculationParams): LabFees {
  const authorizationFee = params.requiresAuthorization ? AUTHORIZATION_NETWORK_FEE : 0;
  const bloodDrawFee = params.includesBloodDraw ? BLOOD_DRAW_FEE : 0;
  const serviceFeeDollar = params.isSpecialtyKit ? (params.panelPrice * SPECIALTY_KIT_SERVICE_FEE_RATE) : 0;
  const aiInterpretationFee = params.includeAiInterpretation ? AI_INTERPRETATION_FEE : 0;
  
  const total = authorizationFee + bloodDrawFee + serviceFeeDollar + aiInterpretationFee;
  
  return {
    authorizationFee,
    bloodDrawFee,
    serviceFeePct: SPECIALTY_KIT_SERVICE_FEE_RATE * 100,
    serviceFeeDollar,
    aiInterpretationFee,
    total
  };
}