import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye } from 'lucide-react';

interface ConsentDialogProps {
  open: boolean;
  onConsent: (consented: boolean) => void;
  onClose: () => void;
}

export function ConsentDialog({ open, onConsent, onClose }: ConsentDialogProps) {
  const [understood, setUnderstood] = useState(false);
  const [agreedToProcessing, setAgreedToProcessing] = useState(false);

  const handleConsent = () => {
    if (understood && agreedToProcessing) {
      onConsent(true);
    }
  };

  const canProceed = understood && agreedToProcessing;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Data Protection Consent
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Your privacy is our top priority. We use advanced de-identification techniques to protect your personal health information.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              How We Protect Your Data
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="border-l-4 border-primary/20 pl-4">
                <h4 className="font-medium">De-Identification Process</h4>
                <p className="text-muted-foreground">
                  Before any AI analysis, we automatically remove all personally identifiable information (PHI) including names, dates of birth, addresses, phone numbers, and other identifiers per HIPAA Safe Harbor standards.
                </p>
              </div>

              <div className="border-l-4 border-primary/20 pl-4">
                <h4 className="font-medium">What Gets Analyzed</h4>
                <p className="text-muted-foreground">
                  Only de-identified lab values, age ranges (e.g., "35-44"), and general demographic categories are sent to our AI analysis system. No personal identifiers are ever transmitted.
                </p>
              </div>

              <div className="border-l-4 border-primary/20 pl-4">
                <h4 className="font-medium">Data Security</h4>
                <p className="text-muted-foreground">
                  Your original data remains encrypted in our secure database. The AI system only receives anonymized lab values and cannot identify you personally.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Your Consent</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="understood" 
                  checked={understood}
                  onCheckedChange={(checked) => setUnderstood(checked === true)}
                />
                <label htmlFor="understood" className="text-sm leading-relaxed">
                  I understand that my data will be <strong>de-identified</strong> before AI analysis, removing all personally identifiable health information per HIPAA Safe Harbor standards.
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="processing" 
                  checked={agreedToProcessing}
                  onCheckedChange={(checked) => setAgreedToProcessing(checked === true)}
                />
                <label htmlFor="processing" className="text-sm leading-relaxed">
                  We de-identify your data before AI analysis. No personally identifiable health information is shared with AI providers.
                </label>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                <strong>Important:</strong> We de-identify your data before AI analysis. No personally identifiable health information is shared with third-party AI providers. 
                This consent only applies to de-identified data processing. You can withdraw consent at any time by contacting support.
                <br /><br />
                <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a> • <a href="/terms-of-service" className="text-primary hover:underline">Terms of Service</a>
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConsent} 
              disabled={!canProceed}
              className="flex-1"
            >
              I Consent to De-Identified Processing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}