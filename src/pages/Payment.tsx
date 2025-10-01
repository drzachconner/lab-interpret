import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Payment = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const orderId = searchParams.get('orderId');

  const handlePayment = async () => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "No order ID found",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create Stripe checkout session for $19 interpretation fee
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          orderId,
          priceId: import.meta.env.VITE_STRIPE_INTERPRETATION_PRICE_ID,
          mode: 'payment',
          successUrl: `${window.location.origin}/analysis?orderId=${orderId}`,
          cancelUrl: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe && data?.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Lab Analysis</h2>
              <p className="text-4xl font-bold text-blue-600">$19</p>
              <p className="text-gray-600">One-time payment</p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold mb-2">What's Included:</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✓ Complete AI analysis of your lab results</li>
                <li>✓ Personalized health insights</li>
                <li>✓ Supplement recommendations</li>
                <li>✓ 25% discount on all supplements</li>
                <li>✓ Downloadable PDF report</li>
              </ul>
            </div>

            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay $19 with Stripe"
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Secure payment powered by Stripe. Your information is encrypted and safe.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;