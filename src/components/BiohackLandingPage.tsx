import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Zap, 
  Shield, 
  TrendingUp, 
  Upload, 
  ShoppingCart,
  CheckCircle,
  Star,
  ArrowRight,
  Microscope,
  Beaker,
  Activity,
  LogOut,
  User,
  Menu,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import HeroBackground from "./UnifiedBackground";

export function BiohackLandingPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Functional Analysis",
      description: "Advanced AI analysis using functional medicine ranges, not just conventional lab 'normal' values",
      clickable: true,
      link: "/ai-analysis"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Results",
      description: "Upload existing labs and get comprehensive analysis in under 60 seconds with actionable protocols",
      clickable: true,
      link: "/ai-analysis"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Practitioner-Grade Supplements",
      description: "25% off 13,000+ professional supplements through Fullscript with AI-matched recommendations",
      clickable: true,
      link: "/products"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Optimization Tracking",
      description: "Retest recommendations and progress tracking to measure improvements over time"
    }
  ];

  const benefits = [
    "💊 25% Off All Practitioner-Grade Supplements via Fullscript",
    "🧬 Functional Medicine Range Analysis (Not Just 'Normal')",
    "⚡ Same-Day AI Analysis & Protocol Generation",
    "🔄 Automated Retest Reminders & Progress Tracking",
    "🎯 Personalized Supplement Protocols",
    "📊 Trend Analysis Across Multiple Test Dates"
  ];

  const comparisonData = [
    {
      feature: "AI Lab Analysis",
      biohack: "AI Biohacking and Functional Ranges",
      insider: "Basic ranges only",
      jason: "No analysis",
      docusai: "Limited analysis"
    },
    {
      feature: "Supplement Access",
      biohack: "25% off 13,000+ products",
      insider: "No supplements",
      jason: "No supplements", 
      docusai: "No supplements"
    },
    {
      feature: "Analysis Price",
      biohack: "$19 flat fee",
      insider: "$199+ per analysis",
      jason: "Labs only",
      docusai: "$40-99 per analysis"
    },
    {
      feature: "Retest Tracking",
      biohack: "Automated reminders",
      insider: "Manual tracking",
      jason: "No tracking",
      docusai: "No tracking"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BiohackLabs.ai
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" onClick={() => navigate('/how-it-works')} className="text-gray-700 hover:text-blue-600">
                How It Works
              </Button>
              <Button variant="ghost" onClick={() => navigate('/sample-reports')} className="text-gray-700 hover:text-blue-600">
                Sample Reports
              </Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')} className="text-gray-700 hover:text-blue-600">
                Pricing
              </Button>
              <Button variant="ghost" onClick={() => navigate('/faq')} className="text-gray-700 hover:text-blue-600">
                FAQ
              </Button>
              
              {user ? (
                // Logged in user buttons
                <>
                  <div className="text-sm text-gray-600 mr-4">
                    {user.email}
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard')} 
                    className="text-gray-700 hover:text-blue-600"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                // Non-logged in user buttons
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/auth?tab=signin')}
                    className="border-blue-200 hover:bg-blue-50"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth?type=analysis')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-md">
              <div className="px-4 py-3 space-y-3">
                <Button variant="ghost" onClick={() => { navigate('/how-it-works'); setIsMenuOpen(false); }} className="w-full justify-start text-gray-700 hover:text-blue-600">
                  How It Works
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/sample-reports'); setIsMenuOpen(false); }} className="w-full justify-start text-gray-700 hover:text-blue-600">
                  Sample Reports
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/pricing'); setIsMenuOpen(false); }} className="w-full justify-start text-gray-700 hover:text-blue-600">
                  Pricing
                </Button>
                <Button variant="ghost" onClick={() => { navigate('/faq'); setIsMenuOpen(false); }} className="w-full justify-start text-gray-700 hover:text-blue-600">
                  FAQ
                </Button>
                
                {user ? (
                  // Logged in user mobile menu
                  <>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600 font-medium mb-3">
                        {user.email}
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} 
                        className="w-full justify-start text-gray-700 hover:text-blue-600"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                        className="w-full justify-start text-gray-700 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  // Non-logged in user mobile menu
                  <div className="pt-3 border-t border-gray-200 space-y-3">
                    <Button 
                      variant="outline" 
                      onClick={() => { navigate('/auth?tab=signin'); setIsMenuOpen(false); }}
                      className="w-full border-blue-200 hover:bg-blue-50"
                    >
                      Sign In
                    </Button>
                    <Button 
                      onClick={() => { navigate('/auth?type=analysis'); setIsMenuOpen(false); }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <HeroBackground variant="hero" intensity="high" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
            🚀 AI-Powered Functional Medicine Analysis
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Functional Analysis +{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Practitioner Supplements
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your labs for instant AI biohacking analysis using functional medicine ranges, or order comprehensive panels. 
            Get personalized supplement protocols with automatic 25% practitioner discounts.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              Lab purchases and provider-authorization fees processed by Fullscript • Analysis fees processed by BiohackLabs.ai
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth?type=analysis')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Labs for $19
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/lab-marketplace')}
              className="border-blue-200 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
            >
              <Microscope className="mr-2 h-5 w-5" />
              Order Lab Panels
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth?type=dispensary')}
              className="border-purple-200 hover:bg-purple-50 text-purple-600 hover:text-purple-700"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Shop Supplements
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm text-gray-600">HIPAA Compliant</span>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm text-gray-600">Instant Analysis</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="h-8 w-8 text-amber-600 mb-2" />
              <span className="text-sm text-gray-600">13,000+ Products</span>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm text-gray-600">25% Practitioner Discount</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why BiohackLabs.ai?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The only platform combining AI functional medicine analysis with practitioner-grade supplement access
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`text-center hover:shadow-lg transition-shadow ${feature.clickable ? 'cursor-pointer hover-scale' : ''}`}
                onClick={() => feature.clickable && navigate(feature.link)}
              >
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

      {/* Comparison Table */}
      <section id="comparison" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How We Compare
            </h2>
            <p className="text-xl text-gray-600">
              See why BiohackLabs.ai offers the most comprehensive solution
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Feature</th>
                    <th className="text-center p-4 font-medium text-blue-600 bg-blue-50">BiohackLabs.ai</th>
                    <th className="text-center p-4 font-medium text-gray-600">InsideTracker</th>
                    <th className="text-center p-4 font-medium text-gray-600">Jason Health</th>
                    <th className="text-center p-4 font-medium text-gray-600">DocusAI</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                      <td className="p-4 text-center text-blue-600 bg-blue-50 font-medium">
                        <CheckCircle className="inline h-4 w-4 mr-1" />
                        {row.biohack}
                      </td>
                      <td className="p-4 text-center text-gray-600">{row.insider}</td>
                      <td className="p-4 text-center text-gray-600">{row.jason}</td>
                      <td className="p-4 text-center text-gray-600">{row.docusai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              No subscriptions. Pay only for what you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Upload Analysis</CardTitle>
                <div className="text-3xl font-bold text-blue-600 mt-4">$19</div>
                <p className="text-gray-600">Per analysis, any number of labs</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">AI functional medicine analysis</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Supplement protocol generation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">25% supplement discounts</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Retest recommendations</span>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/auth?type=analysis')}
                >
                  Upload Labs Now
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-blue-200 shadow-lg">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                Most Popular
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Lab Panels</CardTitle>
                <div className="text-3xl font-bold text-blue-600 mt-4">$89+</div>
                <p className="text-gray-600">Comprehensive testing + analysis</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Quest/LabCorp lab testing</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Practitioner authorization included</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">AI analysis included</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">25% supplement discounts</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/lab-marketplace')}
                >
                  Browse Lab Panels
                </Button>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Supplements Only</CardTitle>
                <div className="text-3xl font-bold text-purple-600 mt-4">25% Off</div>
                <p className="text-gray-600">Direct supplement access</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">13,000+ practitioner products</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">25% automatic discount</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Free shipping on $50+</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm">Direct from manufacturers</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-purple-200 hover:bg-purple-50"
                  onClick={() => navigate('/products')}
                >
                  Shop Supplements
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Optimize Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands using AI-powered functional medicine analysis to unlock their optimal health potential.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth?type=analysis')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Upload className="mr-2 h-5 w-5" />
              Start with Existing Labs ($19)
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate('/lab-marketplace')}
              className="bg-white text-primary hover:bg-gray-100 border-white"
            >
              <Beaker className="mr-2 h-5 w-5" />
              Order Comprehensive Testing
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">BiohackLabs.ai</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered functional medicine analysis with practitioner-grade supplement access.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button 
                    onClick={() => navigate('/auth?type=analysis')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Lab Analysis ($19)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/lab-marketplace')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Lab Panel Testing
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/products-catalog')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Supplement Catalog
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/dashboard')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Progress Tracking
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button 
                    onClick={() => navigate('/how-it-works')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/sample-reports')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Sample Reports
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/faq')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/contact-us')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button 
                    onClick={() => navigate('/privacy-policy')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/terms-of-service')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/hipaa-compliance')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    HIPAA Compliance
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/medical-disclaimer')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Medical Disclaimer
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-700" />
          
          {/* Lab Availability Notice */}
          <div className="text-center text-sm text-gray-400 mb-4">
            <p className="text-amber-400 mb-2">
              <strong>Lab Availability:</strong> Labs are available for patients located in the US, except NY, NJ, RI and HI
            </p>
          </div>
          
          <div className="text-center text-sm text-gray-400">
            <p>&copy; 2024 BiohackLabs.ai. All rights reserved. Not intended to diagnose, treat, cure or prevent any disease.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}