import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { livePricingService, type CheckoutPricing } from "@/lib/livePricing";
import { PriceDisclaimer } from "./PriceDisclaimer";
import type { PricedPanel } from "@/types/panel";

interface LivePriceCheckoutProps {
  cartItems: PricedPanel[];
  onConfirmCheckout: (checkoutUrl: string) => void;
  onCancel: () => void;
}

export function LivePriceCheckout({ cartItems, onConfirmCheckout, onCancel }: LivePriceCheckoutProps) {
  const [livePricing, setLivePricing] = useState<CheckoutPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchLivePricing = async (showRefreshToast = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const panelIds = cartItems.map(item => item.id);
      const pricing = await livePricingService.getLivePricesForCheckout(panelIds);
      
      setLivePricing(pricing);
      
      if (showRefreshToast) {
        toast({
          title: "Prices updated",
          description: "Live pricing has been refreshed"
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live pricing');
      toast({
        title: "Pricing error",
        description: err.message || 'Failed to fetch live pricing',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLivePricing();
  }, [cartItems]);

  const handleRefreshPricing = async () => {
    setRefreshing(true);
    await fetchLivePricing(true);
  };

  const handleProceedToCheckout = () => {
    if (livePricing?.checkout_url) {
      onConfirmCheckout(livePricing.checkout_url);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getOriginalTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.computed_price, 0);
  };

  const getLiveTotal = () => {
    return livePricing?.items.reduce((sum, item) => sum + item.current_price, 0) || 0;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 animate-spin" />
            Checking Live Prices...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Fetching current prices from lab providers...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Pricing Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex space-x-2">
            <Button onClick={() => fetchLivePricing()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={onCancel} variant="ghost">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!livePricing) return null;

  const originalTotal = getOriginalTotal();
  const liveTotal = getLiveTotal();
  const priceDifference = liveTotal - originalTotal;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Live Pricing Confirmed
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshPricing}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Comparison */}
        <div className="space-y-3">
          {livePricing.items.map((item) => {
            const originalItem = cartItems.find(c => c.id === item.panel_id);
            if (!originalItem) return null;

            const hasVariance = Math.abs(item.price_variance_pct || 0) > 0;

            return (
              <div key={item.panel_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{originalItem.display_name}</div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <span>Est: {formatPrice(originalItem.computed_price)}</span>
                    <span>→</span>
                    <span className={hasVariance ? 'font-medium' : ''}>
                      Live: {formatPrice(item.current_price)}
                    </span>
                  </div>
                </div>
                {hasVariance && (
                  <Badge 
                    variant="outline" 
                    className={
                      (item.price_variance_pct || 0) > 0 
                        ? 'text-orange-700 border-orange-300' 
                        : 'text-green-700 border-green-300'
                    }
                  >
                    {(item.price_variance_pct || 0) > 0 ? '+' : ''}{item.price_variance_pct}%
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Total Comparison */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Original estimate:</span>
            <span>{formatPrice(originalTotal)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Current live total:</span>
            <span>{formatPrice(liveTotal)}</span>
          </div>
          {Math.abs(priceDifference) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Difference:</span>
              <span className={priceDifference > 0 ? 'text-orange-700' : 'text-green-700'}>
                {priceDifference > 0 ? '+' : ''}{formatPrice(priceDifference)}
              </span>
            </div>
          )}
        </div>

        {/* Price Disclaimer */}
        <PriceDisclaimer 
          showVariation={Math.abs(priceDifference) > 0}
          variationAmount={priceDifference}
        />

        {/* Actions */}
        <div className="flex space-x-2 pt-4">
          <Button 
            onClick={handleProceedToCheckout}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Proceed to Lab Provider
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Next steps:</strong> You'll be redirected to the lab provider's website 
          to complete your order with the confirmed pricing above.
        </div>
      </CardContent>
    </Card>
  );
}