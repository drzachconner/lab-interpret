import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, X } from 'lucide-react';

interface PHIBlockedDialogProps {
  open: boolean;
  onClose: () => void;
  blockedDetails?: {
    reason: string;
    details?: any;
  };
}

export function PHIBlockedDialog({ open, onClose, blockedDetails }: PHIBlockedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Personal Information Detected
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              We detected personal identifiers in your notes. Please remove names, phone numbers, addresses, emails, or exact dates.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              To comply with HIPAA Safe Harbor standards, we cannot process data containing:
            </p>
            
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Names (first, last, or initials)</li>
              <li>Phone numbers or email addresses</li>
              <li>Street addresses or ZIP codes</li>
              <li>Exact dates of birth or test dates</li>
              <li>Social Security or medical record numbers</li>
              <li>Any other identifying information</li>
            </ul>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-1">What you can include:</p>
              <p className="text-xs text-muted-foreground">
                • Age ranges (e.g., "35-year-old")
                • General conditions or symptoms
                • Lab values and reference ranges
                • Medical history without specific dates
              </p>
            </div>
          </div>

          {blockedDetails?.details && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                <strong>Detected identifiers:</strong> {Object.keys(blockedDetails.details).join(', ')}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              I'll Remove Identifiers
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}