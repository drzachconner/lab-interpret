import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  monthly_price: number;
  annual_price: number;
  monthly_reports: number;
  overage_price: number;
  staff_seats: number | null;
  features: string[];
  is_active: boolean;
}

export interface ClinicUsage {
  reports_used: number;
  reports_limit: number;
  overage_reports: number;
  plan_name: string;
  plan_tier: string;
}

export function useSubscription(clinicId?: string) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [usage, setUsage] = useState<ClinicUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });

      if (error) throw error;
      const plansWithFeatures = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features as string[] : []
      }));
      setPlans(plansWithFeatures);
    } catch (error: any) {
      toast({
        title: "Error loading plans",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchUsage = async () => {
    if (!clinicId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_clinic_current_usage', { clinic_uuid: clinicId });

      if (error) throw error;
      if (data && data.length > 0) {
        setUsage(data[0] as ClinicUsage);
      }
    } catch (error: any) {
      toast({
        title: "Error loading usage",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getCurrentPlan = () => {
    if (!usage) return plans.find(p => p.tier === 'starter');
    return plans.find(p => p.tier === usage.plan_tier) || plans.find(p => p.tier === 'starter');
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  const getUsagePercentage = () => {
    if (!usage) return 0;
    return Math.min((usage.reports_used / usage.reports_limit) * 100, 100);
  };

  const isOverLimit = () => {
    return usage ? usage.overage_reports > 0 : false;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchUsage()]);
      setLoading(false);
    };

    fetchData();
  }, [clinicId]);

  return {
    plans,
    usage,
    loading,
    currentPlan: getCurrentPlan(),
    formatPrice,
    getUsagePercentage,
    isOverLimit,
    refreshUsage: fetchUsage,
    refreshPlans: fetchPlans
  };
}