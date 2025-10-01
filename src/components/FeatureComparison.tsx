import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, ArrowRight } from "lucide-react";
import { getFeatureAccess } from "@/utils/supplementLinks";

interface FeatureComparisonProps {
  clinicContext?: any;
  onGetStarted: () => void;
}

const FeatureComparison = ({ clinicContext, onGetStarted }: FeatureComparisonProps) => {
  const features = getFeatureAccess(clinicContext);
  
  const comparisonData = [
    {
      feature: "Next-Gen Functional Analysis",
      public: true,
      clinic: true,
      description: "Premium biohacking-level interpretation"
    },
    {
      feature: "Bleeding-Edge Research Integration",
      public: "Basic",
      clinic: "Advanced",
      description: "Latest biohacking and holistic wellness protocols"
    },
    {
      feature: "Premium Supplement Access",
      public: "Up to 15% off",
      clinic: "Up to 25% off",
      description: "Practitioner-grade supplement discounts for life"
    },
    {
      feature: "Advanced Biomarkers",
      public: false,
      clinic: true,
      description: "Deep analysis of specialized tests"
    },
    {
      feature: "Professional-Grade Formulations",
      public: false,
      clinic: true,
      description: "Access to professional supplement lines"
    },
    {
      feature: "Precise Biohacking Protocols",
      public: false,
      clinic: true,
      description: "Cutting-edge timing and dosage recommendations"
    },
    {
      feature: "Additional Lab Recommendations",
      public: "Basic",
      clinic: "Comprehensive + Affordable Options",
      description: "Suggested follow-up testing with cost-effective options"
    },
    {
      feature: "Holistic Wellness Support",
      public: false,
      clinic: true,
      description: "Comprehensive lifestyle and diet protocols"
    }
  ];

  if (clinicContext) {
    // Don't show comparison on clinic portals, they get full features
    return null;
  }

  return (
    <section className="py-24 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="px-4 py-2 mb-4">
            Choose Your Path
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold">
            Direct Access vs. Clinic Portal
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get started immediately with basic analysis, or access the full platform 
            through your healthcare provider for comprehensive protocols.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Public Platform */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">Direct Access</CardTitle>
                  <CardDescription className="text-base">
                    Start analyzing your labs immediately
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">$89/report</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {comparisonData.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1">
                    {item.public === true ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : item.public === false ? (
                      <X className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.feature}</div>
                    <div className="text-sm text-muted-foreground">
                      {typeof item.public === 'string' ? item.public : item.description}
                    </div>
                  </div>
                </div>
              ))}
              <div className="space-y-3 mt-6">
                <Button 
                  className="w-full btn-medical group" 
                  onClick={onGetStarted}
                >
                  Pay $89 - Start Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  or <span className="font-medium text-primary">save $70</span> through your clinic
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Clinic Portal */}
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">Clinic Portal</CardTitle>
                  <CardDescription className="text-base">
                    Full platform access through your provider
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">$19/report</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {comparisonData.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1">
                    {item.clinic === true ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.feature}</div>
                    <div className="text-sm text-muted-foreground">
                      {typeof item.clinic === 'string' ? item.clinic : item.description}
                    </div>
                  </div>
                </div>
              ))}
              <div className="space-y-3 mt-6">
                <Button 
                  variant="outline" 
                  className="w-full transition-medical hover:shadow-card border-green-200 hover:bg-green-50"
                >
                  Access Through Your Clinic
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="text-center">
                  <p className="text-sm text-green-700 font-medium">Save $70 per report!</p>
                  <p className="text-xs text-muted-foreground">Ask your healthcare provider about LabPilot</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 p-8 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-2xl max-w-4xl mx-auto border border-primary/20">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              💡 Smart Savings Strategy
            </Badge>
            <h3 className="text-2xl font-bold">Ask Your Healthcare Provider About LabPilot</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your clinic can offer you premium biohacking-level analysis for <span className="font-semibold text-green-600">$19 instead of $89</span> - 
              plus you'll get up to 25% off premium supplements and cutting-edge protocols.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button className="btn-medical">
                Find Participating Clinics Near You
              </Button>
              <Button variant="outline">
                Share This With Your Doctor
              </Button>
            </div>
            <div className="pt-4 border-t border-border/40 mt-6">
              <p className="text-muted-foreground text-sm">
                <strong>Healthcare Providers:</strong> Join LabPilot starting at $149/month. 
                Offer patients 79% savings while earning supplement commissions and building loyalty.
              </p>
              <Button variant="link" className="mt-2 text-primary">
                Clinic Partnership Program →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureComparison;