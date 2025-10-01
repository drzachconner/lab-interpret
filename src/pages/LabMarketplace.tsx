import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  ArrowLeft, 
  Trash2, 
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  ExternalLink,
  Upload,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdvancedLabPanelBrowser } from "@/components/AdvancedLabPanelBrowser";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import { supabase } from "@/integrations/supabase/client";
import { calculateLabFees, type FeeCalculationParams } from "@/utils/labFees";
import UnifiedBackground from "@/components/UnifiedBackground";
import { LivePriceCheckout } from "@/components/LivePriceCheckout";
import { PriceDisclaimer } from "@/components/PriceDisclaimer";

import type { PricedPanel } from "@/types/panel";

export function LabMarketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<PricedPanel[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showLivePricing, setShowLivePricing] = useState(false);
  

  const handleAddToCart = (panel: PricedPanel) => {
    if (!cartItems.some(item => item.id === panel.id)) {
      setCartItems([...cartItems, panel]);
      toast({
        title: "Added to cart",
        description: `${panel.display_name} has been added to your cart`
      });
    }
  };

  const handleRemoveFromCart = (panelId: string) => {
    setCartItems(cartItems.filter(item => item.id !== panelId));
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth?type=analysis');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add lab panels to your cart first",
        variant: "destructive"
      });
      return;
    }

    // Show live pricing component instead of immediate checkout
    setShowLivePricing(true);
  };

  const handleConfirmCheckout = (checkoutUrl: string) => {
    // Clear cart
    setCartItems([]);
    
    // Open external lab provider checkout
    window.open(checkoutUrl, '_blank');
    
    // Navigate to waiting page
    navigate('/dashboard?order_pending=true');

    toast({
      title: "Redirected to lab provider",
      description: "Complete your order on the lab provider's website."
    });
  };

  const handleCancelLivePricing = () => {
    setShowLivePricing(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateTotal = () => {
    // Since PricedPanel.computed_price already includes absorbed fees, we just sum them up
    const labTotal = cartItems.reduce((sum, item) => sum + item.computed_price, 0);
    
    // No additional fees needed since they're already absorbed in computed_price
    return {
      labTotal,
      authFee: 0, // Absorbed in computed_price
      drawFee: 0, // Absorbed in computed_price
      processingFee: 0, // Absorbed in computed_price
      total: labTotal
    };
  };

  const totals = calculateTotal();

  // Show live pricing checkout if triggered
  if (showLivePricing) {
    return (
      <div className="min-h-screen bg-gray-50 relative page-enter">
        <UnifiedBackground variant="minimal" intensity="low" />
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleCancelLivePricing}
              className="flex items-center mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout Confirmation</h1>
            <p className="text-gray-600">Confirming live prices from lab providers...</p>
          </div>
          
          <LivePriceCheckout
            cartItems={cartItems}
            onConfirmCheckout={handleConfirmCheckout}
            onCancel={handleCancelLivePricing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative page-enter">
      <UnifiedBackground variant="minimal" intensity="low" />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b relative z-20 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center button-bounce"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="animate-fade-in">
                <h1 className="text-2xl font-bold text-gray-900">Lab Marketplace</h1>
                <p className="text-gray-600">Order comprehensive lab testing with AI analysis included</p>
              </div>
            </div>
            
            {cartItems.length > 0 && (
              <div className="flex items-center space-x-4 animate-scale-in">
                <Badge variant="outline" className="text-blue-600 border-blue-200 hover-scale">
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  {cartItems.length} item{cartItems.length > 1 ? 's' : ''}
                </Badge>
                <span className="text-lg font-semibold animate-bounce-gentle">
                  Total: {formatPrice(totals.total)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Lab Panels */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Lab Panels</h2>
              <p className="text-gray-600 mb-4">
                All panels include practitioner authorization, AI functional medicine analysis, and supplement protocols.
              </p>
              
              {/* Insurance & Payment Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-100 rounded-full p-1">
                    <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-amber-800 mb-1">Insurance & Payment</h3>
                    <p className="text-sm text-amber-700">
                      Labs are <strong>cash-pay via Fullscript</strong> and not reimbursable by insurance (no superbills). 
                      HSA/FSA eligibility varies by plan—please check with your administrator.
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative for Insurance Users */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-1">
                    <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Have Insurance Coverage?</h3>
                    <p className="text-sm text-blue-700 mb-2">
                      Use your insurance through your clinician/lab, then upload the PDF results here for $19 AI interpretation.
                    </p>
                    <button 
                      onClick={() => navigate('/auth?type=analysis')}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Upload Labs for $19 Analysis
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Disclaimer */}
              <PriceDisclaimer className="mb-4" />
              

            </div>
            
              <AdvancedLabPanelBrowser 
                onAddToCart={handleAddToCart}
                cartItems={cartItems}
              />
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Cart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Cart ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <>
                      {/* Cart Items */}
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {item.display_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.computed_price)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Pricing Breakdown */}
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lab panels (fees included):</span>
                          <span>{formatPrice(totals.labTotal)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{formatPrice(totals.total)}</span>
                        </div>
                      </div>

                      {/* Payment Processor Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-xs text-blue-800 space-y-1">
                          <div className="font-medium">External Lab Checkout:</div>
                          <div>• Order directly through lab provider (Quest/LabCorp)</div>
                          <div>• Live pricing confirmed at checkout</div>
                          <div>• Authorization & draw fees included</div>
                          <div className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-200">
                            <strong>Cash-pay pricing.</strong> Final amounts may vary slightly from estimates.
                          </div>
                        </div>
                      </div>

                      {/* Checkout Button */}
                      <Button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="w-full button-bounce hover-glow"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {isCheckingOut ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </span>
                        ) : (
                          'Check Live Prices & Checkout'
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's Included</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">Lab Testing</div>
                      <div className="text-gray-600">Quest or LabCorp collection</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">AI Analysis</div>
                      <div className="text-gray-600">GPT-5 functional medicine interpretation</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">Supplement Protocol</div>
                      <div className="text-gray-600">Personalized recommendations with 25% discount</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badge */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-blue-900">HIPAA Compliant</div>
                  <div className="text-xs text-blue-700">Secure, encrypted processing</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabMarketplace;