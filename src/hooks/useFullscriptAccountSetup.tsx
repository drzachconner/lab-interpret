import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useFullscriptAccountSetup() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const setupFullscriptAccount = async () => {
      try {
        // Check if user already has Fullscript account
        const { data: profile } = await supabase
          .from('profiles')
          .select('fullscript_account_id, fullscript_patient_id')
          .eq('auth_id', user.id)
          .single();

        if (profile?.fullscript_account_id) {
          console.log('User already has Fullscript account');
          return;
        }

        // Get user's email from auth
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser?.email) return;

        // Create Fullscript account
        const { data, error } = await supabase.functions.invoke('create-fullscript-account', {
          body: {
            userId: user.id,
            email: authUser.email,
            fullName: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
            accountType: 'dispensary' // Default to dispensary access
          }
        });

        if (error) {
          console.error('Failed to create Fullscript account:', error);
          // Don't show error toast for auto-setup, just log it
          return;
        }

        if (data?.success) {
          console.log('Fullscript account created successfully');
          toast({
            title: "Welcome to BiohackLabs!",
            description: "Your supplement dispensary account has been created. You'll receive 25% off all supplements!",
          });
        }
      } catch (error) {
        console.error('Error in Fullscript account setup:', error);
      }
    };

    // Delay setup to avoid race conditions with profile creation
    const timer = setTimeout(setupFullscriptAccount, 2000);
    return () => clearTimeout(timer);
  }, [user, toast]);
}

// Use this hook in your main App component or after successful signup
export function usePostSignupSetup() {
  useFullscriptAccountSetup();
  
  // Add other post-signup setup here
  // e.g., send welcome email, set up default preferences, etc.
}
