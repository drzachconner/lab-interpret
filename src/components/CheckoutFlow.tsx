import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { PricedPanel } from '@/types/panel';

interface CheckoutFlowProps {
  cartItems: PricedPanel[];
  onSuccess: () => void;
  onCancel?: () => void;
}

export function CheckoutFlow({ cartItems, onSuccess, onCancel }: CheckoutFlowProps) {
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [orderData, setOrderData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalAmount = cartItems.reduce((sum, item) => sum + item.computed_price, 0);

  const handleCheckout = async () => {
    setLoading(true);
    setOrderStatus('creating');
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Please sign in to continue');
      }

      // Create lab order
      const { data, error } = await supabase.functions.invoke('create-lab-order-fullscript', {
        body: {
          labPanelIds: cartItems.map(item => item.id),
          userId: user.id
        }
      });

      if (error) throw error;

      setOrderData(data);
      setOrderStatus('success');

      toast({
        title: "Order Created Successfully!",
        description: `Order #${data.order.orderNumber} has been created. You'll receive an email with next steps.`,
      });

      // Clear cart and redirect after a short delay
      setTimeout(() => {
        onSuccess();
        navigate(`/dashboard/orders/${data.order.id}`);
      }, 2000);
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      setOrderStatus('error');
      
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFullscriptCheckout = () => {
    if (orderData?.order?.checkoutUrl) {
      window.open(orderData.order.checkoutUrl, '_blank');
    }
  };

  if (orderStatus === 'success' && orderData) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Order Created Successfully!</h3>
            </div>
            <p className="mt-2 text-green-700">
              Order #{orderData.order.orderNumber} has been created and you'll receive an email with next steps.
            </p>
            
            {orderData.order.checkoutUrl && (
              <div className="mt-4">
                <Button 
                  onClick={handleFullscriptCheckout}
                  className="w-full"
                  size="lg"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Complete Payment on Fullscript
                </Button>
                <p className="mt-2 text-sm text-gray-600">
                  You'll be redirected to Fullscript to complete your payment and lab order.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderStatus === 'error') {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Order Failed</h3>
            </div>
            <p className="mt-2 text-red-700">
              There was an error creating your order. Please try again or contact support.
            </p>
            <div className="mt-4 flex space-x-2">
              <Button onClick={handleCheckout} variant="outline">
                Try Again
              </Button>
              {onCancel && (
                <Button onClick={onCancel} variant="ghost">
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
              <div className="flex-1">
                <h4 className="font-medium">{item.display_name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {item.provider || 'Lab Provider'}
                  </Badge>
                  {item.sample_type && (
                    <Badge variant="outline" className="text-xs">
                      {item.sample_type}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${item.computed_price.toFixed(2)}</div>
                {item.base_price !== item.computed_price && (
                  <div className="text-sm text-gray-500 line-through">
                    ${item.base_price.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Payment will be processed through Fullscript's secure checkout.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button 
          onClick={handleCheckout}
          disabled={loading || cartItems.length === 0}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {orderStatus === 'creating' ? 'Creating Order...' : 'Processing...'}
            </>
          ) : (
            'Complete Order'
          )}
        </Button>
        
        {onCancel && (
          <Button 
            onClick={onCancel}
            variant="outline" 
            className="w-full"
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>• You'll be redirected to Fullscript for secure payment processing</p>
        <p>• Fullscript handles all pricing, discounts, and fulfillment</p>
        <p>• You'll receive email updates about your lab order status</p>
      </div>
    </div>
  );
}
