/**
 * Utility for managing supplement recommendation links based on context
 * Ensures proper revenue sharing between main platform and clinics
 */

import { getSubdomain } from "./subdomain";

interface SupplementLink {
  name: string;
  url: string;
  clinicCommission?: boolean;
}

export const generateSupplementLink = (
  supplementName: string,
  clinicDispensaryUrl?: string
): SupplementLink => {
  const subdomain = getSubdomain();
  
  // If on clinic subdomain and clinic has dispensary URL, use clinic link
  if (subdomain && clinicDispensaryUrl) {
    return {
      name: supplementName,
      url: `${clinicDispensaryUrl}?product=${encodeURIComponent(supplementName)}&ref=clinic`,
      clinicCommission: true
    };
  }
  
  // Default to main platform dispensary
  return {
    name: supplementName,
    url: `https://supplements.labpilot.com/products/${encodeURIComponent(supplementName)}?ref=platform`,
    clinicCommission: false
  };
};

export const getRecommendationContext = () => {
  const subdomain = getSubdomain();
  
  return {
    isClinicPortal: !!subdomain,
    isPlatformDirect: !subdomain,
    clinicSlug: subdomain
  };
};

/**
 * Determines feature availability based on context
 */
export const getFeatureAccess = (clinicContext?: any) => {
  const context = getRecommendationContext();
  
  return {
    // Public platform has limited features to drive clinic adoption
    fullSupplementProtocols: context.isClinicPortal || false,
    practitionerGradeSupplements: context.isClinicPortal || false,
    detailedDosageRecommendations: context.isClinicPortal || false,
    progressTracking: true, // Available to all
    basicAnalysis: true, // Available to all
    advancedBiomarkers: context.isClinicPortal || false,
    personalizedTimeline: context.isClinicPortal || false,
    
    // Clinic-specific features
    brandedExperience: context.isClinicPortal,
    clinicCommissions: context.isClinicPortal,
    practitionerSupport: context.isClinicPortal,
    customProtocols: context.isClinicPortal
  };
};