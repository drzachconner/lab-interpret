import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  ArrowRight, 
  Download, 
  Calendar,
  ShoppingBag,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { FullscriptAccountSetup } from "@/components/FullscriptAccountSetup";

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'failed' | 'pending'>('pending');

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (sessionId && orderId) {
      verifyPayment();
    } else {
      setVerificationStatus('failed');
      setIsVerifying(false);
    }
  }, [sessionId, orderId]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          sessionId,
          orderId
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success && data?.payment_status === 'paid') {
        setOrderDetails(data.order);
        setVerificationStatus('success');
        
        toast({
          title: "Payment successful!",
          description: `Your lab order has been confirmed and will be processed shortly.`
        });
      } else {
        setVerificationStatus('failed');
        toast({
          title: "Payment verification failed",
          description: data?.message || "Please contact support if you believe this is an error",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setVerificationStatus('failed');
      toast({
        title: "Verification error", 
        description: "Unable to verify payment. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">✕</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment. If you were charged, please contact our support team.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/lab-marketplace')}
                className="w-full"
              >
                Return to Marketplace
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Payment Successful</h1>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Success Message */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-green-900 mb-2">
                      Order Confirmed!
                    </h2>
                    <p className="text-green-800 mb-4">
                      Thank you for your order. Your lab panels have been successfully ordered 
                      and will be processed within 24 hours.
                    </p>
                    {orderDetails && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-green-900">
                          Order #{orderDetails.orderNumber}
                        </p>
                        <p className="text-sm text-green-800">
                          Total: {formatPrice(orderDetails.totalAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            {orderDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Order Number:</span>
                      <p className="font-medium">{orderDetails.orderNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        {orderDetails.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Lab Panels Ordered:</h4>
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.price)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />
                  
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total Paid:</span>
                    <span>{formatPrice(orderDetails.totalAmount)}</span>
                  </div>
                  
                  {/* Payment Processing Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <div className="text-xs text-blue-800">
                      <div className="font-medium mb-1">Payment Processing:</div>
                      <div>Lab purchases and provider-authorization fees processed by <span className="font-medium">Fullscript</span></div>
                      <div>Analysis fee processed by <span className="font-medium">BiohackLabs.ai</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Next Steps Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Order Processing</p>
                      <p className="text-xs text-gray-600">Your order will be processed within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Lab Kit Delivery</p>
                      <p className="text-xs text-gray-600">Collection kit arrives in 2-3 business days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sample Collection</p>
                      <p className="text-xs text-gray-600">Visit Quest or LabCorp for sample collection</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">AI Analysis</p>
                      <p className="text-xs text-gray-600">Results analyzed and report generated in 3-5 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-green-900 mb-2">🎉 Dispensary Access Unlocked!</h3>
                <p className="text-sm text-green-800 mb-4">
                  Your purchase includes lifetime access to professional-grade supplements at 15% practitioner discount.
                </p>
                <FullscriptAccountSetup 
                  onComplete={(dispensaryUrl) => {
                    console.log('Dispensary account setup complete:', dispensaryUrl);
                  }}
                />
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Track Your Order</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Monitor your order progress and view results in your dashboard.
                </p>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;