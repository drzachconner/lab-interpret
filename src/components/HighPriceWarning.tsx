import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, X, DollarSign, Users, ArrowRight } from "lucide-react";

interface HighPriceWarningProps {
  onProceed: () => void;
  onFindClinic: () => void;
}

const HighPriceWarning = ({ onProceed, onFindClinic }: HighPriceWarningProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-orange-600 text-white">💰 Save $60</Badge>
                <Badge variant="outline" className="text-orange-700 border-orange-200">Price Alert</Badge>
              </div>
              <h3 className="text-xl font-bold text-orange-900 mb-2">
                You're About to Pay $89 for Direct Access
              </h3>
              <p className="text-orange-800">
                The same comprehensive analysis costs only <span className="font-bold">$29 through participating clinics</span> - 
                that's a 67% savings! Plus you get professional support and better protocols.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/60 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800">Direct Access</span>
                </div>
                <div className="text-2xl font-bold text-red-600 mb-1">$89</div>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Immediate access</li>
                  <li>• Basic support</li>
                  <li>• Standard protocols</li>
                </ul>
              </div>

              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Through Clinic</span>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">$29</div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Professional support</li>
                  <li>• Enhanced protocols</li>
                  <li>• Practitioner guidance</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={onFindClinic}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                <Users className="mr-2 h-4 w-4" />
                Find Participating Clinics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={onProceed}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Continue with $89 Payment
              </Button>
            </div>

            <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>💡 Pro Tip:</strong> Ask your healthcare provider to join LabPilot. They can offer you these savings while earning supplement commissions and providing better patient care.
              </p>
              <div className="mt-2 pt-2 border-t border-orange-200">
                <p className="text-xs text-orange-700">
                  <strong>Payment Processing:</strong> Lab purchases and provider-authorization fees are processed by Fullscript; analysis fee is processed by BiohackLabs.ai.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HighPriceWarning;