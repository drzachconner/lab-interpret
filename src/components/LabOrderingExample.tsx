import { useState } from 'react';
import { CheckoutFlow } from './CheckoutFlow';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { PricedPanel } from '@/types/panel';

// Example component showing how to integrate CheckoutFlow
export function LabOrderingExample() {
  const [cartItems, setCartItems] = useState<PricedPanel[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  // Example lab panels (replace with your actual data)
  const examplePanels: PricedPanel[] = [
    {
      id: '1',
      name: 'Comprehensive Metabolic Panel',
      display_name: 'Comprehensive Metabolic Panel',
      base_price: 89.99,
      computed_price: 89.99,
      provider: 'LabCorp',
      sample_type: 'blood',
      description: 'Complete metabolic assessment',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Lipid Panel',
      display_name: 'Lipid Panel',
      base_price: 45.99,
      computed_price: 45.99,
      provider: 'Quest',
      sample_type: 'blood',
      description: 'Cholesterol and lipid assessment',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const addToCart = (panel: PricedPanel) => {
    setCartItems(prev => [...prev, panel]);
  };

  const removeFromCart = (panelId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== panelId));
  };

  const handleCheckoutSuccess = () => {
    setCartItems([]);
    setShowCheckout(false);
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
  };

  if (showCheckout) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <CheckoutFlow
          cartItems={cartItems}
          onSuccess={handleCheckoutSuccess}
          onCancel={handleCheckoutCancel}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Lab Ordering Example</h1>
        <p className="text-gray-600 mt-2">
          Select lab panels and proceed to checkout with Fullscript integration
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Available Lab Panels */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Lab Panels</h2>
          <div className="space-y-4">
            {examplePanels.map((panel) => (
              <Card key={panel.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{panel.display_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">{panel.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {panel.provider} • {panel.sample_type}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">${panel.computed_price.toFixed(2)}</span>
                      <Button
                        onClick={() => addToCart(panel)}
                        size="sm"
                        disabled={cartItems.some(item => item.id === panel.id)}
                      >
                        {cartItems.some(item => item.id === panel.id) ? 'Added' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Shopping Cart */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
          {cartItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Your cart is empty</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{item.display_name}</h3>
                        <p className="text-sm text-gray-500">{item.provider}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">${item.computed_price.toFixed(2)}</span>
                        <Button
                          onClick={() => removeFromCart(item.id)}
                          variant="outline"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>${cartItems.reduce((sum, item) => sum + item.computed_price, 0).toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={() => setShowCheckout(true)}
                    className="w-full mt-4"
                    size="lg"
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
