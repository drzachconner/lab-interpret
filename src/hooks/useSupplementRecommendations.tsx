import { useState, useEffect } from 'react';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { useFullscriptIntegration } from '@/hooks/useFullscriptIntegration';

interface SupplementRecommendation {
  name: string;
  brand?: string;
  dosage?: string;
  timing?: string;
  url: string;
  price?: number;
  clinicCommission: boolean;
  priority: 'high' | 'medium' | 'low';
  reasoning?: string;
}

interface UseSupplementRecommendationsProps {
  clinicContext?: {
    fullscripts_dispensary_url?: string;
    name: string;
    id: string;
  };
  labAnalysis?: any;
}

export const useSupplementRecommendations = ({ 
  clinicContext, 
  labAnalysis 
}: UseSupplementRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<SupplementRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const { hasDispensaryAccess } = usePaymentStatus();
  const { getSupplementRecommendations } = useFullscriptIntegration();

  // Extract supplement names from AI analysis
  const extractSupplementsFromAnalysis = (analysis: any): string[] => {
    if (!analysis || !analysis.raw_response) return [];
    
    // Parse common supplement names from AI analysis
    const text = analysis.raw_response.toLowerCase();
    const commonSupplements = [
      'vitamin d', 'vitamin d3', 'magnesium', 'iron', 'b12', 'b-complex',
      'omega-3', 'fish oil', 'zinc', 'vitamin c', 'probiotics', 'folate',
      'calcium', 'biotin', 'coq10', 'turmeric', 'ashwagandha'
    ];
    
    return commonSupplements.filter(supplement => 
      text.includes(supplement) || 
      text.includes(supplement.replace(/[- ]/g, ''))
    );
  };

  // Generate contextual supplement recommendations
  const generateRecommendations = async (analysis: any) => {
    if (!analysis) return [];

    setLoading(true);
    
    try {
      // Extract supplements mentioned in AI analysis
      const mentionedSupplements = extractSupplementsFromAnalysis(analysis);
      
      // Add default recommendations if analysis doesn't mention specific ones
      const defaultSupplements = ['Vitamin D3', 'Magnesium Glycinate', 'Omega-3'];
      const supplementsToLookup = mentionedSupplements.length > 0 
        ? mentionedSupplements 
        : defaultSupplements;

      console.log('Looking up supplements:', supplementsToLookup);

      // Get real product recommendations from Fullscript
      const products = await getSupplementRecommendations(supplementsToLookup);
      
      return products.map((product: any, index: number) => {
        const isClinicDispensary = !!clinicContext?.fullscripts_dispensary_url;
        
        return {
          name: product.name,
          brand: product.brand,
          dosage: getContextualDosage(product.name, analysis),
          timing: getContextualTiming(product.name),
          url: isClinicDispensary 
            ? `${clinicContext.fullscripts_dispensary_url}?product=${encodeURIComponent(product.name)}&ref=clinic`
            : product.url,
          price: product.price,
          clinicCommission: isClinicDispensary,
          priority: index < 2 ? 'high' : 'medium' as const,
          reasoning: getSupplementReasoning(product.name, analysis)
        };
      });
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get contextual dosage based on analysis
  const getContextualDosage = (supplementName: string, analysis: any): string | undefined => {
    const name = supplementName.toLowerCase();
    
    // Extract dosage information from AI analysis if available
    if (analysis?.raw_response) {
      const text = analysis.raw_response.toLowerCase();
      
      // Look for dosage patterns near supplement mentions
      const dosagePatterns = [
        /(\d+,?\d*)\s*(mg|iu|mcg|g)\s*(?:daily|per day)?/i,
        /(\d+)\s*(thousand|k)\s*(mg|iu)/i
      ];
      
      for (const pattern of dosagePatterns) {
        const match = text.match(new RegExp(`${name}.*?${pattern.source}`, 'i'));
        if (match) {
          return `${match[1]}${match[2]} daily`;
        }
      }
    }
    
    // Default dosages for common supplements
    const defaultDosages: Record<string, string> = {
      'vitamin d3': '4000 IU daily',
      'vitamin d': '4000 IU daily',
      'magnesium': '400mg before bed',
      'magnesium glycinate': '400mg before bed',
      'iron': '25mg daily',
      'omega-3': '2000mg EPA/DHA daily',
      'fish oil': '2000mg EPA/DHA daily',
      'b12': '1000mcg daily',
      'zinc': '15mg daily',
      'vitamin c': '1000mg daily'
    };
    
    return defaultDosages[name];
  };

  // Get contextual timing recommendations
  const getContextualTiming = (supplementName: string): string | undefined => {
    const name = supplementName.toLowerCase();
    
    const timingMap: Record<string, string> = {
      'iron': 'with breakfast, away from coffee/tea',
      'magnesium': 'before bed',
      'vitamin d': 'with fat-containing meal',
      'omega-3': 'with meals',
      'fish oil': 'with meals',
      'probiotics': 'on empty stomach',
      'b12': 'morning, sublingual',
      'zinc': 'on empty stomach or with meals if upset'
    };
    
    for (const [key, timing] of Object.entries(timingMap)) {
      if (name.includes(key)) {
        return timing;
      }
    }
    
    return 'with meals';
  };

  // Generate reasoning for supplement recommendation
  const getSupplementReasoning = (supplementName: string, analysis: any): string | undefined => {
    const name = supplementName.toLowerCase();
    
    // Extract reasoning from AI analysis
    if (analysis?.raw_response) {
      const text = analysis.raw_response;
      
      // Look for reasoning patterns
      const reasoningKeywords = [
        'deficiency', 'low levels', 'suboptimal', 'insufficient',
        'support', 'optimize', 'improve', 'enhance', 'boost'
      ];
      
      for (const keyword of reasoningKeywords) {
        const pattern = new RegExp(`${name}.*?${keyword}[^.]*\\.`, 'i');
        const match = text.match(pattern);
        if (match) {
          return match[0].trim();
        }
      }
    }
    
    // Default reasoning
    const defaultReasoning: Record<string, string> = {
      'vitamin d': 'Support immune function and bone health',
      'magnesium': 'Improve sleep quality and muscle relaxation',
      'iron': 'Address potential iron deficiency',
      'omega-3': 'Support cardiovascular and brain health',
      'b12': 'Support energy metabolism and nervous system'
    };
    
    for (const [key, reasoning] of Object.entries(defaultReasoning)) {
      if (name.includes(key)) {
        return reasoning;
      }
    }
    
    return undefined;
  };

  const refreshRecommendations = () => {
    generateRecommendations(labAnalysis).then(setRecommendations);
  };

  useEffect(() => {
    if (labAnalysis) {
      refreshRecommendations();
    }
  }, [labAnalysis, clinicContext]);

  const openSupplementLink = (url: string) => {
    if (!hasDispensaryAccess) {
      // Could redirect to purchase analysis
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getSupplementNote = () => {
    if (!hasDispensaryAccess) {
      return "Purchase a lab analysis to unlock access to professional-grade supplements at 15% discount through our Fullscript dispensary.";
    }
    if (clinicContext?.fullscripts_dispensary_url) {
      return `Supplements purchased through ${clinicContext.name}'s dispensary support your healthcare provider and include practitioner pricing.`;
    }
    return "You have active dispensary access to professional-grade supplements at practitioner pricing.";
  };

  // Feature access based on context
  const features = {
    fullSupplementProtocols: !!clinicContext,
    practitionerGradeSupplements: hasDispensaryAccess,
    detailedDosageRecommendations: !!clinicContext,
    progressTracking: true,
    basicAnalysis: true,
    advancedBiomarkers: !!clinicContext,
    personalizedTimeline: !!clinicContext,
    brandedExperience: !!clinicContext,
    clinicCommissions: !!clinicContext,
    practitionerSupport: !!clinicContext,
    customProtocols: !!clinicContext
  };

  return {
    recommendations,
    loading,
    features,
    refreshRecommendations,
    openSupplementLink,
    supplementNote: getSupplementNote(),
    hasClinicDispensary: !!clinicContext?.fullscripts_dispensary_url,
    hasDispensaryAccess
  };
};