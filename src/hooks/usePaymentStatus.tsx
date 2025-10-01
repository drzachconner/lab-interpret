import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PaymentStatus {
  hasPaidAnalysis: boolean;
  hasDispensaryAccess: boolean;
  loading: boolean;
}

export function usePaymentStatus() {
  const [status, setStatus] = useState<PaymentStatus>({
    hasPaidAnalysis: false,
    hasDispensaryAccess: false,
    loading: true
  });
  
  const { user } = useAuth();

  const checkPaymentStatus = async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      // Check if user has any completed lab reports (indicating paid analysis)
      const { data: reports, error } = await supabase
        .from('lab_reports')
        .select('id, status')
        .eq('user_id', user.id);

      if (error) throw error;

      const hasPaidAnalysis = reports && reports.length > 0;
      const hasDispensaryAccess = true; // Dispensary access available to all authenticated users

      setStatus({
        hasPaidAnalysis: !!hasPaidAnalysis,
        hasDispensaryAccess: !!hasDispensaryAccess,
        loading: false
      });

    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus({
        hasPaidAnalysis: false,
        hasDispensaryAccess: false,
        loading: false
      });
    }
  };

  useEffect(() => {
    if (user) {
      checkPaymentStatus();
    }
  }, [user]);

  return {
    ...status,
    refreshPaymentStatus: checkPaymentStatus
  };
}