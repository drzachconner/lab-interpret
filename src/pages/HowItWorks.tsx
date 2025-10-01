import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { 
  Upload, 
  Brain, 
  Zap, 
  ShoppingCart, 
  CheckCircle, 
  ArrowRight,
  FileText,
  Microscope,
  Target
} from "lucide-react";
import HeroBackground from "@/components/UnifiedBackground";

export default function HowItWorks() {
  const navigate = useNavigate();
  
  const steps = [
    {
      number: "01",
      icon: <Upload className="h-8 w-8" />,
      title: "Upload Your Labs",
      description: "Upload existing lab reports or order comprehensive panels through our platform",
      details: [
        "Supports all major lab formats (PDF, images)",
        "Quest, LabCorp, and independent lab results accepted", 
        "Secure, HIPAA-compliant file processing",
        "Or order new panels with practitioner authorization"
      ]
    },
    {
      number: "02", 
      icon: <Brain className="h-8 w-8" />,
      title: "AI Analysis",
      description: "Advanced GPT-5 analysis using functional medicine ranges, not just 'normal' values",
      details: [
        "Functional medicine range analysis vs conventional",
        "Pattern recognition across multiple biomarkers",
        "Personalized insights based on your specific results",
        "Analysis completed in under 60 seconds"
      ]
    },
    {
      number: "03",
      icon: <Target className="h-8 w-8" />,  
      title: "Get Protocols",
      description: "Receive personalized supplement and lifestyle protocols to optimize your biomarkers",
      details: [
        "Targeted supplement recommendations with dosages",
        "Lifestyle modification suggestions",
        "Retest timeline recommendations", 
        "Progress tracking and optimization guidance"
      ]
    },
    {
      number: "04",
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "Shop & Track",
      description: "Get 25% off practitioner-grade supplements and track your progress over time",
      details: [
        "Automatic 25% discount on 13,000+ products",
        "Direct access to practitioner-grade supplements",
        "Progress tracking with follow-up testing",
        "Optimization recommendations based on improvements"
      ]
    }
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Results",
      description: "Get comprehensive analysis in under 60 seconds"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Functional Medicine",  
      description: "Analysis beyond conventional 'normal' ranges"
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: "Supplement Access",
      description: "25% off practitioner-grade supplements automatically"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <HeroBackground variant="hero" intensity="medium" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200 animate-fade-in">
            ⚡ Simple Process
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-scale-in">
            How It{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Works
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in">
            From lab upload to optimized health in 4 simple steps. 
            Get AI-powered functional medicine analysis plus practitioner supplements.
          </p>
        </div>
      </section>

      {/* Steps Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                <div className="flex-1 animate-fade-in">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                      {step.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-600 mb-1">Step {step.number}</div>
                      <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                    </div>
                  </div>
                  
                  <p className="text-xl text-gray-600 mb-6">{step.description}</p>
                  
                  <ul className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex-1">
                  <Card className="hover:shadow-lg transition-all hover-scale">
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                        <span className="text-2xl font-bold">{step.number}</span>
                      </div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-gray-600">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BiohackLabs.ai?
            </h2>
            <p className="text-xl text-gray-600">
              The most comprehensive health analysis and supplement platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all hover-scale">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Simple, Transparent Pricing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Upload Analysis</CardTitle>
                <div className="text-3xl font-bold text-blue-600 mt-4">$19</div>
                <p className="text-gray-600">Per analysis, unlimited labs</p>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/auth?type=analysis')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Labs Now
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-blue-200 shadow-lg">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                Popular
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Lab Panels</CardTitle>
                <div className="text-3xl font-bold text-blue-600 mt-4">$89+</div>
                <p className="text-gray-600">Testing + analysis included</p>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/lab-marketplace')}
                >
                  <Microscope className="mr-2 h-4 w-4" />
                  Browse Lab Panels
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            size="lg"
            variant="outline" 
            onClick={() => navigate('/pricing')}
          >
            View Full Pricing Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Optimize Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands using AI-powered analysis to unlock their health potential
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth?type=analysis')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Labs ($19)
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate('/lab-marketplace')}
              className="bg-white text-primary hover:bg-gray-100 border-white"
            >
              <Microscope className="mr-2 h-5 w-5" />
              Order Lab Panels
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}