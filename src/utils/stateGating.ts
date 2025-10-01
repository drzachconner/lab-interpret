// State restrictions for lab ordering
export const BLOOD_LAB_RESTRICTED_STATES = ['NY', 'NJ', 'RI'];
export const SPECIALTY_KIT_RESTRICTED_STATES = ['NY', 'NJ', 'RI', 'HI'];

export interface StateRestrictions {
  canOrderBloodLabs: boolean;
  canOrderSpecialtyKits: boolean;
  restrictions: string[];
}

export function getStateRestrictions(stateCode: string): StateRestrictions {
  const upperState = stateCode.toUpperCase();
  
  const canOrderBloodLabs = !BLOOD_LAB_RESTRICTED_STATES.includes(upperState);
  const canOrderSpecialtyKits = !SPECIALTY_KIT_RESTRICTED_STATES.includes(upperState);
  
  const restrictions: string[] = [];
  
  if (!canOrderBloodLabs) {
    restrictions.push('Blood labs not available in your state');
  }
  
  if (!canOrderSpecialtyKits) {
    restrictions.push('Specialty kit shipping not available in your state');
  }
  
  return {
    canOrderBloodLabs,
    canOrderSpecialtyKits,
    restrictions
  };
}

export function getStateMessage(stateCode: string, testType: 'blood' | 'kit'): string | null {
  const upperState = stateCode.toUpperCase();
  
  if (testType === 'blood' && BLOOD_LAB_RESTRICTED_STATES.includes(upperState)) {
    return 'Blood labs are not available in NY, NJ, or RI due to state regulations.';
  }
  
  if (testType === 'kit' && SPECIALTY_KIT_RESTRICTED_STATES.includes(upperState)) {
    return 'Specialty kit shipping is not available in NY, NJ, RI, or HI.';
  }
  
  return null;
}