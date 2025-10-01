import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ConsentStatus {
  hasConsented: boolean;
  consentedAt?: string;
  loading: boolean;
}

export function useConsentStatus() {
  const [status, setStatus] = useState<ConsentStatus>({
    hasConsented: false,
    loading: true
  });
  
  const { user } = useAuth();

  const checkConsentStatus = async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      // For now, assume consent is handled elsewhere or always true
      // Since we removed the consent columns from the profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // For now, always return true for consent
      const hasConsented = true;
      const consentedAt = profile?.created_at;

      setStatus({
        hasConsented,
        consentedAt,
        loading: false
      });

    } catch (error) {
      console.error('Error checking consent status:', error);
      setStatus({
        hasConsented: false,
        loading: false
      });
    }
  };

  const recordConsent = async () => {
    if (!user) return false;

    try {
      // Since we removed consent columns, just return true
      // In a real implementation, you might want to create a separate consent table
      await checkConsentStatus();
      return true;
    } catch (error) {
      console.error('Error recording consent:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      checkConsentStatus();
    }
  }, [user]);

  return {
    ...status,
    recordConsent,
    refreshConsentStatus: checkConsentStatus
  };
}