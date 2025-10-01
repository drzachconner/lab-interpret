import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Microscope,
  Upload,
  BookOpen,
  Award,
  LineChart
} from "lucide-react";
import HeroBackground from "@/components/UnifiedBackground";

export default function AIAnalysisDescription() {
  const navigate = useNavigate();
  
  const analysisFeatures = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Advanced AI Model",
      description: "Powered by GPT-5 with specialized training on functional medicine research and biohacking protocols"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Functional Ranges", 
      description: "Goes beyond 'normal' ranges to identify optimal levels for peak performance and longevity"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Pattern Recognition",
      description: "Identifies complex biomarker relationships and patterns that traditional analysis might miss"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Optimization Focus",
      description: "Provides actionable recommendations to move from 'normal' to 'optimal' health ranges"
    }
  ];

  const comparisonData = [
    {
      aspect: "Reference Ranges",
      conventional: "Statistical 'normal' (95% of population)",
      functional: "Optimal ranges for peak health performance"
    },
    {
      aspect: "Analysis Focus", 
      conventional: "Disease diagnosis and pathology",
      functional: "Prevention and optimization"
    },
    {
      aspect: "Biomarker Interpretation",
      conventional: "Individual markers in isolation",
      functional: "Interconnected systems and patterns"
    },
    {
      aspect: "Recommendations",
      conventional: "Medication when abnormal",
      functional: "Nutrition, lifestyle, and targeted supplementation"
    }
  ];

  const researchAreas = [
    "Longevity and anti-aging research",
    "Metabolic optimization studies",
    "Cognitive enhancement protocols", 
    "Athletic performance biomarkers",
    "Hormonal optimization research",
    "Nutrient deficiency patterns",
    "Inflammatory cascade analysis",
    "Mitochondrial function markers"
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
              <Button variant="outline" onClick={() => navigate('/auth?tab=signin')}>
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
        <HeroBackground variant="hero" intensity="high" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200 animate-fade-in">
            🧠 Industry-Leading AI Analysis
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-scale-in">
            Advanced AI{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Biohacking Analysis
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto animate-fade-in">
            Our AI has been trained on the most advanced research in biohacking and functional medicine, 
            using functional ranges that go far beyond conventional 'normal' values to identify true optimization opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Upload className="mr-2 h-5 w-5" />
              Get Your Analysis ($19)
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/sample-reports')}
              className="border-blue-200 hover:bg-blue-50 text-blue-600"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              View Sample Reports
            </Button>
          </div>
        </div>
      </section>

      {/* Analysis Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Makes Our AI Different
            </h2>
            <p className="text-xl text-gray-600">
              Specialized training on cutting-edge biohacking and functional medicine research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {analysisFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all hover-scale">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-blue-600">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Conventional vs Functional Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Conventional vs. Functional Analysis
            </h2>
            <p className="text-xl text-gray-600">
              Understanding why functional ranges reveal optimization opportunities
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <tr>
                    <th className="text-left p-6 font-medium text-gray-900">Aspect</th>
                    <th className="text-center p-6 font-medium text-gray-600">Conventional Medicine</th>
                    <th className="text-center p-6 font-medium text-blue-600 bg-blue-50">Functional Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-6 font-medium text-gray-900">{row.aspect}</td>
                      <td className="p-6 text-center text-gray-600">{row.conventional}</td>
                      <td className="p-6 text-center text-blue-600 bg-blue-50/50 font-medium">
                        <CheckCircle className="inline h-4 w-4 mr-1" />
                        {row.functional}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Research Foundation */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-purple-100 text-purple-800 border-purple-200">
                <Award className="h-4 w-4 mr-2" />
                Research-Backed
              </Badge>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Trained on Advanced Research
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                Our AI model has been trained on thousands of research papers and clinical studies 
                from the most advanced practitioners in biohacking and functional medicine.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <LineChart className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">10,000+ research papers analyzed</span>
                </div>
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Continuous learning from new studies</span>
                </div>
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">Optimized for performance outcomes</span>
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Research Areas Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {researchAreas.map((area, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Example Analysis */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Example: B12 Analysis
            </h2>
            <p className="text-xl text-gray-600">
              See how functional analysis reveals optimization opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-gray-300">
              <CardHeader className="bg-gray-100">
                <CardTitle className="text-gray-700">Conventional Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2"><strong>B12 Level:</strong> 425 pg/mL</p>
                    <p className="text-sm text-gray-700 mb-2"><strong>Reference Range:</strong> 200-900 pg/mL</p>
                    <p className="text-green-700 font-medium">✓ Normal - No action needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-300 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-blue-700">Functional Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2"><strong>B12 Level:</strong> 425 pg/mL</p>
                    <p className="text-sm text-gray-700 mb-2"><strong>Functional Optimal:</strong> 500-900 pg/mL</p>
                    <p className="text-amber-700 font-medium">⚠ Suboptimal for methylation</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium">Recommendations:</p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Methylcobalamin 1000mcg daily</li>
                      <li>• Check for MTHFR variants</li>
                      <li>• Retest in 3 months</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Optimize Your Biomarkers?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get industry-leading AI analysis that goes beyond 'normal' to find your optimization opportunities
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
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