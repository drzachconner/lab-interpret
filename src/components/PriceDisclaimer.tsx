import { AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface PriceDisclaimerProps {
  showVariation?: boolean;
  variationAmount?: number;
  className?: string;
}

export function PriceDisclaimer({ 
  showVariation = false, 
  variationAmount = 0,
  className = "" 
}: PriceDisclaimerProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(price));
  };

  if (showVariation && Math.abs(variationAmount) > 0) {
    return (
      <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <strong>Price Update:</strong> Live pricing differs by{' '}
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                {variationAmount > 0 ? '+' : ''}{formatPrice(variationAmount)}
              </Badge>
            </div>
            <ExternalLink className="h-3 w-3" />
          </div>
          <div className="text-xs mt-1 text-amber-700">
            Final price confirmed at external lab provider checkout.
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="text-sm">
          <strong>Pricing Notice:</strong> Displayed prices are estimates.
        </div>
        <div className="text-xs mt-1 text-blue-700">
          Final pricing may vary at checkout and will be confirmed at the external lab provider.
        </div>
      </AlertDescription>
    </Alert>
  );
}