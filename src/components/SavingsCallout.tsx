import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, DollarSign, Users, Sparkles } from "lucide-react";

interface SavingsCalloutProps {
  clinicContext?: any;
}

const SavingsCallout = ({ clinicContext }: SavingsCalloutProps) => {
  // Don't show on clinic portals - they already have the savings
  if (clinicContext) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-green-200 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Smart Savings Alert
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    Save <span className="text-green-600">$60 Per Analysis</span>
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Ask your healthcare provider to join LabPilot. You'll get the same comprehensive 
                    analysis for just <span className="font-semibold">$29 instead of $89</span> - plus professional support!
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="text-center">
                      <DollarSign className="h-12 w-12 text-red-600 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-red-800 mb-2">Direct Access</h3>
                      <div className="text-3xl font-bold text-red-600 mb-2">$89</div>
                      <p className="text-red-700">Per report • Immediate access • Basic support</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-600 text-white">BEST VALUE</Badge>
                    </div>
                    <div className="text-center">
                      <Users className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-green-800 mb-2">Through Your Clinic</h3>
                      <div className="text-3xl font-bold text-green-600 mb-2">$29</div>
                      <p className="text-green-700">Per report • Professional protocols • Practitioner support</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                    <Users className="mr-2 h-5 w-5" />
                    Find Participating Clinics
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" className="border-green-300 text-green-700 hover:bg-green-50">
                    Share With Your Doctor
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mt-8">
                  <h4 className="font-semibold text-gray-900 mb-3">For Healthcare Providers</h4>
                  <p className="text-gray-600 mb-4">
                    Join LabPilot starting at $149/month. Offer your patients significant savings while earning 
                    supplement commissions and providing enhanced care.
                  </p>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    Learn about our Provider Partnership Program →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SavingsCallout;