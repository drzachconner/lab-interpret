import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Eye,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Brain,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import HeroBackground from "@/components/UnifiedBackground";

export default function SampleReports() {
  const navigate = useNavigate();
  
  const sampleReports = [
    {
      id: "comprehensive",
      title: "Comprehensive Metabolic Panel Analysis",
      type: "Full Blood Panel",
      markers: 47,
      highlights: [
        "Functional B12 deficiency detected",
        "Suboptimal thyroid function patterns", 
        "Inflammatory markers elevated",
        "Mineral deficiency patterns"
      ],
      recommendations: 8,
      supplements: 6
    },
    {
      id: "thyroid",
      title: "Advanced Thyroid Function Analysis", 
      type: "Thyroid Panel",
      markers: 8,
      highlights: [
        "Subclinical hypothyroid pattern",
        "Reverse T3 elevation",
        "Low T3/rT3 ratio",
        "Selenium deficiency indicated"
      ],
      recommendations: 5,
      supplements: 4
    },
    {
      id: "hormonal",
      title: "Hormonal Balance Assessment",
      type: "Hormone Panel", 
      markers: 12,
      highlights: [
        "Cortisol dysregulation pattern",
        "DHEA-S suboptimal",
        "Testosterone/Estrogen imbalance",
        "Stress response dysfunction"
      ],
      recommendations: 7,
      supplements: 5
    }
  ];

  const reportFeatures = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Functional Analysis",
      description: "Advanced GPT-5 analysis using functional medicine ranges, not conventional 'normal' values"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Protocol Generation", 
      description: "Personalized supplement and lifestyle protocols generated in under 60 seconds"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Optimization Tracking",
      description: "Retest recommendations and progress monitoring to track improvements"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BiohackLabs.ai
              </span>
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <HeroBackground variant="hero" intensity="medium" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200 animate-fade-in">
            📊 Real Analysis Examples
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-scale-in">
            Sample AI{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analysis Reports
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in">
            See exactly what you'll receive with our AI-powered functional medicine analysis. 
            Real examples from anonymized patient data.
          </p>
        </div>
      </section>

      {/* Report Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What's Included in Every Report
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reportFeatures.map((feature, index) => (
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

      {/* Sample Reports */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sample Analysis Reports
            </h2>
            <p className="text-xl text-gray-600">
              Real examples of our AI functional medicine analysis
            </p>
          </div>

          <Tabs defaultValue="comprehensive" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger>
              <TabsTrigger value="thyroid">Thyroid Focus</TabsTrigger>
              <TabsTrigger value="hormonal">Hormonal</TabsTrigger>
            </TabsList>

            {sampleReports.map((report) => (
              <TabsContent key={report.id} value={report.id} className="mt-8">
                <Card className="animate-fade-in">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl mb-2">{report.title}</CardTitle>
                        <Badge variant="secondary" className="mb-4">{report.type}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{report.markers}</div>
                        <div className="text-sm text-gray-600">Biomarkers Analyzed</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Key Findings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                        Key Functional Medicine Findings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {report.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{report.recommendations}</div>
                        <div className="text-sm text-blue-800">Lifestyle Recommendations</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{report.supplements}</div>
                        <div className="text-sm text-green-800">Targeted Supplements</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">3-6</div>
                        <div className="text-sm text-purple-800">Month Retest Window</div>
                      </div>
                    </div>

                    {/* Sample Analysis Preview */}
                    <div className="border rounded-lg p-6 bg-white">
                      <h4 className="font-semibold mb-3">Sample Analysis Excerpt:</h4>
                      <div className="text-sm text-gray-700 space-y-2 italic">
                        <p>"Based on your B12 level of 425 pg/mL, while technically within the conventional range (200-900), functional medicine targets indicate suboptimal status. Optimal B12 levels should be above 500 pg/mL for proper methylation and neurological function..."</p>
                        
                        <p>"Your TSH of 3.2 mIU/L, combined with free T3 of 2.8 pg/mL, suggests subclinical hypothyroid patterns. The T3/reverse T3 ratio indicates conversion issues, likely related to selenium deficiency and chronic stress patterns..."</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t">
                      <Button 
                        onClick={() => navigate('/auth')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Get Your Analysis ($19)
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/lab-marketplace')}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Order Lab Panel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready for Your Personalized Analysis?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Upload your existing labs or order comprehensive panels to get started
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Upload Existing Labs ($19)
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate('/lab-marketplace')}
              className="bg-white text-primary hover:bg-gray-100 border-white"
            >
              Order Lab Panels
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}