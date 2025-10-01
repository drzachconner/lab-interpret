import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Download, 
  ExternalLink, 
  Pill, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Heart,
  Brain,
  Zap,
  Shield,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Your Fullscript dispensary URL - UPDATE THIS with your actual URL
const FULLSCRIPT_DISPENSARY_URL = "https://us.fullscript.com/welcome/drzachconner";

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch(status) {
    case 'optimal': return 'text-green-600 bg-green-50 border-green-200';
    case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'borderline': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// Helper function to get health score color
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

// Component for visual biomarker display
const BiomarkerCard = ({ biomarker }: any) => {
  const percentage = ((biomarker.value - biomarker.min) / (biomarker.max - biomarker.min)) * 100;
  const optimalPercentageStart = ((biomarker.optimalMin - biomarker.min) / (biomarker.max - biomarker.min)) * 100;
  const optimalPercentageEnd = ((biomarker.optimalMax - biomarker.min) / (biomarker.max - biomarker.min)) * 100;

  return (
    <Card className={`border-2 ${getStatusColor(biomarker.status).split(' ')[2]}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{biomarker.name}</CardTitle>
          <Badge className={getStatusColor(biomarker.status)}>
            {biomarker.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-2xl font-bold">
          <span>{biomarker.value}</span>
          <span className="text-sm font-normal text-gray-500">{biomarker.unit}</span>
        </div>
        
        {/* Visual Range Indicator */}
        <div className="relative">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            {/* Optimal range highlight */}
            <div 
              className="absolute h-3 bg-green-200 opacity-50"
              style={{
                left: `${optimalPercentageStart}%`,
                width: `${optimalPercentageEnd - optimalPercentageStart}%`
              }}
            />
            {/* Current value indicator */}
            <div 
              className="absolute h-3 w-1 bg-blue-600"
              style={{ left: `${Math.min(Math.max(percentage, 0), 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{biomarker.min}</span>
            <span className="text-green-600 font-medium">Optimal: {biomarker.optimalMin}-{biomarker.optimalMax}</span>
            <span>{biomarker.max}</span>
          </div>
        </div>

        {biomarker.trend && (
          <div className="flex items-center gap-2">
            {biomarker.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm text-gray-600">Trending {biomarker.trend}</span>
          </div>
        )}

        <p className="text-sm text-gray-600">{biomarker.notes}</p>
      </CardContent>
    </Card>
  );
};

// Health Score Component
const HealthScoreCard = ({ score, category }: { score: number; category: string }) => {
  const icon = {
    overall: Heart,
    metabolic: Zap,
    inflammation: Shield,
    hormonal: Brain,
    nutritional: Activity
  }[category] || Heart;

  const Icon = icon;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium capitalize">{category}</h3>
          </div>
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </span>
        </div>
        <Progress value={score} className="h-2" />
      </CardContent>
    </Card>
  );
};

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [supplements, setSupplements] = useState<any[]>([]);
  const { toast } = useToast();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      fetchAnalysis();
    }
  }, [orderId]);

  const fetchAnalysis = async () => {
    try {
      // Trigger AI analysis
      const { data: analysis, error } = await supabase.functions.invoke('analyze-labs', {
        body: { orderId }
      });

      if (error) throw error;

      // For demo purposes, using mock data structure
      // Replace this with actual analysis data
      const mockAnalysis = {
        healthScores: {
          overall: 72,
          metabolic: 68,
          inflammation: 85,
          hormonal: 70,
          nutritional: 65
        },
        summary: "Your lab results show good overall health with opportunities for optimization in metabolic and nutritional markers. Focus areas include vitamin D optimization, B-vitamin support, and inflammation management.",
        keyFindings: [
          "Vitamin D levels are suboptimal for peak performance",
          "B12 levels indicate potential absorption issues",
          "Inflammatory markers slightly elevated - consider anti-inflammatory support",
          "Thyroid function within normal range but could benefit from optimization"
        ],
        biomarkers: {
          vitaminD: {
            name: "Vitamin D (25-OH)",
            value: 28,
            unit: "ng/mL",
            min: 20,
            max: 100,
            optimalMin: 50,
            optimalMax: 80,
            status: "low",
            trend: "down",
            notes: "Below optimal range. Supplementation recommended for immune and bone health."
          },
          b12: {
            name: "Vitamin B12",
            value: 380,
            unit: "pg/mL",
            min: 200,
            max: 1100,
            optimalMin: 500,
            optimalMax: 900,
            status: "borderline",
            notes: "Consider methylated B12 supplementation for optimal energy and neurological function."
          },
          crp: {
            name: "C-Reactive Protein",
            value: 2.8,
            unit: "mg/L",
            min: 0,
            max: 10,
            optimalMin: 0,
            optimalMax: 1,
            status: "high",
            trend: "up",
            notes: "Mild elevation suggests low-grade inflammation. Consider omega-3 and curcumin."
          },
          tsh: {
            name: "TSH",
            value: 2.5,
            unit: "mIU/L",
            min: 0.4,
            max: 4.5,
            optimalMin: 1.0,
            optimalMax: 2.0,
            status: "borderline",
            notes: "Within normal range but above optimal. Monitor thyroid function."
          },
          magnesium: {
            name: "Magnesium RBC",
            value: 4.8,
            unit: "mg/dL",
            min: 4.2,
            max: 6.8,
            optimalMin: 5.5,
            optimalMax: 6.5,
            status: "low",
            notes: "Below optimal range. Important for energy production and sleep quality."
          }
        }
      };

      setAnalysisData(mockAnalysis);
      
      // Generate supplement recommendations based on analysis
      const supplementList = generateSupplementRecommendations(mockAnalysis);
      setSupplements(supplementList);
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis in Progress",
        description: "Using demo data for preview. Full analysis available after setup.",
      });
      // Use demo data for now
      setAnalysisData({
        healthScores: {
          overall: 72,
          metabolic: 68,
          inflammation: 85,
          hormonal: 70,
          nutritional: 65
        },
        summary: "Your lab results show good overall health with opportunities for optimization.",
        keyFindings: [
          "Vitamin D levels are suboptimal",
          "B12 could be optimized",
          "Inflammatory markers slightly elevated"
        ],
        biomarkers: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSupplementRecommendations = (analysis: any) => {
    const recommendations = [];

    // Generate recommendations based on biomarker status
    if (analysis?.biomarkers?.vitaminD?.status === 'low') {
      recommendations.push({
        name: "Vitamin D3 + K2",
        reason: "Your Vitamin D levels are below optimal range for peak performance",
        dosage: "5000 IU D3 + 100mcg K2 daily with food",
        benefits: ["Immune support", "Bone health", "Mood regulation", "Athletic performance"],
        searchTerm: "vitamin-d3-k2",
        priority: "high"
      });
    }

    if (analysis?.biomarkers?.b12?.status === 'borderline' || analysis?.biomarkers?.b12?.status === 'low') {
      recommendations.push({
        name: "Methylcobalamin B12",
        reason: "B12 levels indicate need for methylated supplementation",
        dosage: "1000 mcg sublingual daily",
        benefits: ["Energy production", "Cognitive function", "Nerve health", "Red blood cell formation"],
        searchTerm: "methylcobalamin-b12",
        priority: "high"
      });
    }

    if (analysis?.biomarkers?.magnesium?.status === 'low') {
      recommendations.push({
        name: "Magnesium Glycinate",
        reason: "Magnesium levels are below optimal for cellular function",
        dosage: "400mg before bed",
        benefits: ["Better sleep", "Muscle recovery", "Stress management", "Energy production"],
        searchTerm: "magnesium-glycinate",
        priority: "medium"
      });
    }

    if (analysis?.biomarkers?.crp?.status === 'high') {
      recommendations.push({
        name: "Omega-3 Fish Oil (High EPA)",
        reason: "To support healthy inflammation response",
        dosage: "2-3g EPA/DHA daily with meals",
        benefits: ["Reduce inflammation", "Heart health", "Brain function", "Joint support"],
        searchTerm: "omega-3-epa-dha",
        priority: "high"
      });

      recommendations.push({
        name: "Curcumin Complex",
        reason: "Natural anti-inflammatory support",
        dosage: "500mg twice daily with black pepper",
        benefits: ["Anti-inflammatory", "Antioxidant", "Joint health", "Recovery"],
        searchTerm: "curcumin-turmeric",
        priority: "medium"
      });
    }

    return recommendations;
  };

  const downloadReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: { orderId }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lab-analysis-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Download available after full setup",
        description: "PDF download will be available once the system is configured",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-lg font-medium">Analyzing your lab results...</p>
          <p className="text-sm text-gray-500 mt-2">Our AI is evaluating your biomarkers against functional ranges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Functional Lab Analysis</h1>
              <p className="opacity-90">Personalized insights based on optimal health ranges</p>
            </div>
            <Button onClick={downloadReport} variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
      </div>

      {/* Health Scores */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {analysisData?.healthScores && Object.entries(analysisData.healthScores).map(([category, score]: [string, any]) => (
            <HealthScoreCard key={category} category={category} score={score} />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="biomarkers">Biomarkers</TabsTrigger>
            <TabsTrigger value="supplements">Supplements</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-2xl">Health Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-lg leading-relaxed mb-6">{analysisData?.summary}</p>
                
                {analysisData?.keyFindings && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      Key Findings
                    </h3>
                    <div className="space-y-2">
                      {analysisData.keyFindings.map((finding: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-gray-400 mt-0.5" />
                          <p className="text-gray-700">{finding}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <Pill className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold mb-1">View Supplements</h3>
                  <p className="text-sm text-gray-600">Personalized recommendations ready</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <Activity className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-semibold mb-1">Lifestyle Tips</h3>
                  <p className="text-sm text-gray-600">Diet and exercise guidance</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 bg-purple-50">
                <CardContent className="pt-6">
                  <Brain className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold mb-1">Track Progress</h3>
                  <p className="text-sm text-gray-600">Retest in 3 months</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="biomarkers">
            <div className="grid gap-4 md:grid-cols-2">
              {analysisData?.biomarkers && Object.entries(analysisData.biomarkers).map(([key, biomarker]: [string, any]) => (
                <BiomarkerCard key={key} biomarker={biomarker} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="supplements">
            <Card className="border-0 shadow-lg mb-6">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle>Your Personalized Supplement Protocol</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Click any supplement to purchase with your exclusive 25% practitioner discount
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {supplements.map((supp, idx) => (
                    <Card 
                      key={idx} 
                      className={`border-2 hover:shadow-lg transition-all ${
                        supp.priority === 'high' 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <Pill className="h-6 w-6 text-blue-600" />
                              <h3 className="font-bold text-lg">{supp.name}</h3>
                              {supp.priority === 'high' && (
                                <Badge variant="destructive">Priority</Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-700">{supp.reason}</p>
                            
                            <div className="bg-white rounded-lg p-3 border">
                              <p className="font-medium text-sm mb-1">Suggested Dosage:</p>
                              <p className="text-blue-600">{supp.dosage}</p>
                            </div>

                            {supp.benefits && (
                              <div className="flex flex-wrap gap-2">
                                {supp.benefits.map((benefit: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {benefit}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          className="w-full mt-4"
                          onClick={() => {
                            window.open(
                              `${FULLSCRIPT_DISPENSARY_URL}/search?q=${supp.searchTerm}`,
                              '_blank'
                            );
                          }}
                        >
                          Shop with 25% Discount
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Dispensary CTA */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Shield className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">Professional-Grade Supplements</h3>
                      <p className="opacity-90 mb-4">
                        As our patient, you get automatic access to practitioner-only brands 
                        and 25% off all supplements. Your discount is automatically applied at checkout.
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() => window.open(FULLSCRIPT_DISPENSARY_URL, '_blank')}
                        className="w-full sm:w-auto"
                      >
                        Browse Full Dispensary
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lifestyle">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Personalized Lifestyle Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Nutrition Focus
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Increase vitamin D-rich foods (fatty fish, egg yolks)</li>
                      <li>• Add anti-inflammatory foods (berries, leafy greens, nuts)</li>
                      <li>• Include magnesium sources (dark chocolate, avocados)</li>
                      <li>• Optimize protein intake for your body weight</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      Lifestyle Optimization
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Get 15-20 minutes of morning sunlight daily</li>
                      <li>• Implement stress management techniques</li>
                      <li>• Aim for 7-9 hours of quality sleep</li>
                      <li>• Consider strength training 3x per week</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Next Steps:</strong> Implement these recommendations for 3 months, 
                    then retest to track your progress. Most patients see significant improvements 
                    in their biomarkers within this timeframe.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analysis;