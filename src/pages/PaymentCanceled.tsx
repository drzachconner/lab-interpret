import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Home } from "lucide-react";

export function PaymentCanceled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-yellow-600 text-xl">⚠</span>
            </div>
            <CardTitle className="text-xl">Payment Canceled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your payment was canceled. No charges have been made to your account.
            </p>
            <p className="text-sm text-gray-500">
              Your items are still in your cart if you'd like to try again.
            </p>
            
            <div className="space-y-2 pt-4">
              <Button 
                onClick={() => navigate('/lab-marketplace')}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Marketplace
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PaymentCanceled;