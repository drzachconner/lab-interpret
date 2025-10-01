import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FullscriptAccount {
  fullscriptAccountId: string;
  dispensaryUrl: string;
  accountType: string;
  demo?: boolean;
}

export function useFullscriptIntegration() {
  const [loading, setLoading] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createFullscriptAccount = async (
    accountType: 'analysis' | 'dispensary' = 'analysis'
  ): Promise<FullscriptAccount | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setCreatingAccount(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-fullscript-account', {
        body: {
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          accountType
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create Fullscript account');
      }

      toast({
        title: "Dispensary Access Activated!",
        description: data.demo 
          ? "Demo dispensary access has been activated for testing"
          : "Your Fullscript dispensary account has been created successfully",
      });

      return {
        fullscriptAccountId: data.fullscriptAccountId,
        dispensaryUrl: data.dispensaryUrl,
        accountType,
        demo: data.demo
      };
      
    } catch (error: any) {
      console.error('Error creating Fullscript account:', error);
      toast({
        title: "Account creation failed",
        description: error.message || "Failed to create dispensary account",
        variant: "destructive"
      });
      throw error;
    } finally {
      setCreatingAccount(false);
    }
  };

  const getSupplementRecommendations = async (supplementNames: string[]) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-supplement-recommendations', {
        body: {
          supplementNames,
          patientId: user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to get supplement recommendations');
      }

      return data.recommendations || [];
      
    } catch (error: any) {
      console.error('Error getting supplement recommendations:', error);
      toast({
        title: "Recommendation error",
        description: error.message || "Failed to load supplement recommendations",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const openDispensary = async (dispensaryUrl?: string) => {
    if (!dispensaryUrl) {
      const url = 'https://supplements.labpilot.com';
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      // Try to get auto-login URL with SSO token
      const { data, error } = await supabase.functions.invoke('fullscript-auto-login', {
        body: { dispensaryUrl }
      });

      if (error) {
        console.error('Auto-login failed:', error);
        // Fallback to direct URL
        window.open(dispensaryUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      if (data?.success && data?.loginUrl) {
        // Open the auto-login URL
        window.open(data.loginUrl, '_blank', 'noopener,noreferrer');
        
        if (data.autoLogin) {
          toast({
            title: "Dispensary Access",
            description: "You've been automatically logged into your dispensary account",
          });
        }
      } else {
        // Fallback to direct URL
        window.open(dispensaryUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      // Fallback to direct URL
      window.open(dispensaryUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return {
    loading,
    creatingAccount,
    createFullscriptAccount,
    getSupplementRecommendations,
    openDispensary
  };
}