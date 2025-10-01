import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import { useFullscriptIntegration } from "@/hooks/useFullscriptIntegration";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface FullscriptAccountSetupProps {
  onComplete?: (dispensaryUrl: string) => void;
}

export function FullscriptAccountSetup({ onComplete }: FullscriptAccountSetupProps) {
  const [accountStatus, setAccountStatus] = useState<'checking' | 'needed' | 'creating' | 'completed' | 'error'>('checking');
  const [dispensaryUrl, setDispensaryUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { createFullscriptAccount, creatingAccount, openDispensary } = useFullscriptIntegration();
  const { user } = useAuth();

  // Check if user already has Fullscript account
  useEffect(() => {
    const checkExistingAccount = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('fs_token')
          .eq('auth_id', user.id)
          .single();

        if (error) {
          console.error('Error checking profile:', error);
          setAccountStatus('needed');
          return;
        }

        if (profile?.fs_token) {
          // For now, assume if they have a token, they have access
          const mockUrl = 'https://supplements.labpilot.com';
          setDispensaryUrl(mockUrl);
          setAccountStatus('completed');
          onComplete?.(mockUrl);
        } else {
          setAccountStatus('needed');
        }
      } catch (err) {
        console.error('Error checking Fullscript account:', err);
        setAccountStatus('needed');
      }
    };

    checkExistingAccount();
  }, [user, onComplete]);

  const handleCreateAccount = async () => {
    if (!user) return;

    setAccountStatus('creating');
    setError(null);

    try {
      const account = await createFullscriptAccount('analysis');
      
      if (account) {
        setDispensaryUrl(account.dispensaryUrl);
        setAccountStatus('completed');
        onComplete?.(account.dispensaryUrl);
      }
    } catch (err: any) {
      console.error('Failed to create Fullscript account:', err);
      setError(err.message || 'Failed to create dispensary account');
      setAccountStatus('error');
    }
  };

  if (accountStatus === 'checking') {
    return (
      <Card className="card-medical">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-muted-foreground">Setting up your dispensary access...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accountStatus === 'completed' && dispensaryUrl) {
    return (
      <Card className="card-medical border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Dispensary Account Ready!</CardTitle>
          </div>
          <CardDescription className="text-green-700">
            Your professional supplement dispensary account has been activated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white/60 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800">15% Discount Active</Badge>
                <span className="text-sm text-green-700">Professional pricing applied</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-green-800 font-medium">Benefits Unlocked:</div>
                  <ul className="text-green-700 mt-1 space-y-1">
                    <li>• Practitioner-grade formulations</li>
                    <li>• 15% storewide discount</li>
                    <li>• Free shipping on $50+</li>
                  </ul>
                </div>
                <div>
                  <div className="text-green-800 font-medium">Account Features:</div>
                  <ul className="text-green-700 mt-1 space-y-1">
                    <li>• Personalized recommendations</li>
                    <li>• Order history tracking</li>
                    <li>• Auto-refill options</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => openDispensary(dispensaryUrl)}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Dispensary
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // Copy dispensary URL to clipboard
                  navigator.clipboard.writeText(dispensaryUrl);
                }}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                Copy Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accountStatus === 'error') {
    return (
      <Card className="card-medical border-red-200 bg-red-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">Account Setup Failed</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            There was an issue setting up your dispensary account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="bg-white/60 rounded-lg p-3 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleCreateAccount}
                disabled={creatingAccount}
                className="bg-red-600 hover:bg-red-700"
              >
                {creatingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
              <Button variant="outline" onClick={() => setAccountStatus('completed')}>
                Skip for Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default state - account needed
  return (
    <Card className="card-medical border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-blue-800">Complete Your Dispensary Setup</CardTitle>
        <CardDescription className="text-blue-700">
          Create your professional supplement dispensary account to access practitioner pricing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">What happens next:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
              <div>
                <div className="font-medium">1. Account Creation</div>
                <div>We'll create your Fullscript dispensary account</div>
              </div>
              <div>
                <div className="font-medium">2. Instant Access</div>
                <div>15% practitioner discount applied immediately</div>
              </div>
              <div>
                <div className="font-medium">3. Personalization</div>
                <div>AI recommendations sync to your account</div>
              </div>
              <div>
                <div className="font-medium">4. Ongoing Benefits</div>
                <div>No recurring fees, permanent access</div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleCreateAccount}
            disabled={creatingAccount}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {creatingAccount ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Dispensary Account'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}