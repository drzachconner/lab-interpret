import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, ArrowLeft } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const { plans, formatPrice, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  const handleUpgrade = (planTier: string) => {
    // This would integrate with Stripe when ready
    console.log('Upgrade to plan:', planTier);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
            <span className="text-gray-500">Biohack</span><span className="text-blue-600">Labs</span><span className="text-gray-500">.ai</span>
          </div>

          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Button>
        </div>
      </nav>

      <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="px-6 py-3 text-base mb-6">
            💰 Why Clinics Save Their Patients Money
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Clinic Partnership Program</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join LabPilot and offer your patients comprehensive lab analysis for just $29 instead of $89. 
            Earn supplement commissions while providing exceptional value.
          </p>
          
          {/* Consumer vs Clinic Comparison */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12 p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border">
            <div className="text-center">
              <div className="text-2xl mb-2">🏥 Direct Consumer</div>
              <div className="text-3xl font-bold text-orange-600 mb-2">$89</div>
              <div className="text-sm text-muted-foreground">per analysis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">👩‍⚕️ Through Your Clinic</div>
              <div className="text-3xl font-bold text-green-600 mb-2">$29</div>
              <div className="text-sm text-green-600">per analysis • 67% savings!</div>
            </div>
          </div>
          
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'outline'}
              onClick={() => setBillingCycle('monthly')}
              className="px-6"
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === 'annual' ? 'default' : 'outline'}
              onClick={() => setBillingCycle('annual')}
              className="px-6"
            >
              Annual
              <Badge variant="secondary" className="ml-2">Save 16%</Badge>
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const price = billingCycle === 'monthly' ? plan.monthly_price : plan.annual_price;
            const monthlyEquivalent = billingCycle === 'annual' ? Math.round(price / 12) : price;
            const isPopular = plan.tier === 'growth';
            
            return (
              <Card 
                key={plan.id} 
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                  isPopular && "border-primary shadow-lg scale-105"
                )}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    <Crown className="inline w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={cn("text-center", isPopular && "pt-12")}>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-lg">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(monthlyEquivalent)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {billingCycle === 'annual' && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Billed annually ({formatPrice(price)}/year)
                      </div>
                    )}
                  </CardDescription>
                  
                  <div className="text-sm text-muted-foreground">
                    Up to {plan.monthly_reports} AI reports/month
                  </div>
                  {plan.overage_price > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Overage: {formatPrice(plan.overage_price)}/report
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant={isPopular ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(plan.tier)}
                  >
                    {index === 0 ? 'Start Free Trial' : 'Upgrade Now'}
                  </Button>
                  
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.staff_seats && (
                      <div className="flex items-start space-x-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          {plan.staff_seats === 1 ? '1 staff seat' : `${plan.staff_seats} staff seats`}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enterprise Section */}
        <div className="text-center bg-gradient-to-br from-primary/10 to-secondary/5 rounded-lg p-8 border border-primary/20">
          <h3 className="text-2xl font-bold mb-4">Start Saving Your Patients Money Today</h3>
          <p className="text-muted-foreground mb-6 max-w-3xl mx-auto">
            Your patients are already seeking lab interpretation. Offer them professional analysis 
            at $29 instead of forcing them to pay $89 elsewhere. Generate revenue through supplement 
            commissions while providing exceptional patient value.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary">
              Start 14-Day Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Schedule Demo Call
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No setup fees • Cancel anytime • Full support included
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}