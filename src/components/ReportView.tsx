import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Download, 
  Share, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Calendar,
  User,
  FileText,
  ExternalLink,
  ChevronDown,
  Info,
  Lock
} from "lucide-react";
import { useSupplementRecommendations } from "@/hooks/useSupplementRecommendations";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";

const ReportView = ({ clinicContext }: { clinicContext?: any } = {}) => {
  const { openSupplementLink, supplementNote } = useSupplementRecommendations({ 
    clinicContext 
  });
  const { hasDispensaryAccess } = usePaymentStatus();

  const handleSupplementClick = (supplementName: string) => {
    if (!hasDispensaryAccess) {
      // Show alert or redirect to purchase
      alert('Please purchase a lab analysis to unlock dispensary access with 15% discount');
      return;
    }
    
    const mockUrl = clinicContext?.fullscripts_dispensary_url 
      ? `${clinicContext.fullscripts_dispensary_url}?product=${encodeURIComponent(supplementName)}&ref=clinic`
      : `https://supplements.labpilot.com/products/${encodeURIComponent(supplementName)}?ref=platform`;
    
    openSupplementLink(mockUrl);
  };
  return (
    <div className="min-h-screen bg-gradient-clinical">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold">Comprehensive Metabolic Panel</h1>
                <p className="text-sm text-muted-foreground">December 15, 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary View</TabsTrigger>
            <TabsTrigger value="clinical">Clinical Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {/* Executive Summary */}
            <Card className="card-medical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 border border-border/60 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">78%</div>
                    <div className="text-sm text-muted-foreground">Optimization Score</div>
                  </div>
                  <div className="text-center p-4 border border-border/60 rounded-lg">
                    <div className="text-2xl font-bold text-warning">2</div>
                    <div className="text-sm text-muted-foreground">Priority Areas</div>
                  </div>
                  <div className="text-center p-4 border border-border/60 rounded-lg">
                    <div className="text-2xl font-bold text-primary">8 weeks</div>
                    <div className="text-sm text-muted-foreground">Retest Window</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Key Findings:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Ferritin levels (18 ng/mL) are significantly below functional range, suggesting iron deficiency despite normal hemoglobin.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingDown className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Vitamin D (22 ng/mL) is suboptimal for immune function and hormone optimization.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Metabolic markers show good glucose control and kidney function within optimal ranges.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Biomarkers */}
            <Card className="card-medical">
              <CardHeader>
                <CardTitle>Key Biomarkers</CardTitle>
                <CardDescription>
                  Your results compared to functional optimization ranges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      name: "Ferritin",
                      value: "18",
                      unit: "ng/mL",
                      status: "below_functional",
                      reference: "30-400",
                      functional: "70-150",
                      progress: 25,
                      trend: "down"
                    },
                    {
                      name: "Vitamin D",
                      value: "22",
                      unit: "ng/mL", 
                      status: "suboptimal",
                      reference: "20-100",
                      functional: "50-80",
                      progress: 44,
                      trend: "stable"
                    },
                    {
                      name: "Fasting Glucose",
                      value: "88", 
                      unit: "mg/dL",
                      status: "optimal",
                      reference: "70-100",
                      functional: "80-95",
                      progress: 80,
                      trend: "up"
                    },
                    {
                      name: "HDL Cholesterol",
                      value: "65",
                      unit: "mg/dL",
                      status: "optimal", 
                      reference: ">40",
                      functional: ">60",
                      progress: 85,
                      trend: "up"
                    }
                  ].map((marker, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{marker.name}</h4>
                          <Badge 
                            variant={marker.status === "optimal" ? "default" : 
                                   marker.status === "suboptimal" ? "secondary" : "destructive"}
                          >
                            {marker.status.replace("_", " ")}
                          </Badge>
                          {marker.trend === "up" && <TrendingUp className="h-4 w-4 text-secondary" />}
                          {marker.trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
                          {marker.trend === "stable" && <Minus className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{marker.value} {marker.unit}</div>
                          <div className="text-xs text-muted-foreground">Functional: {marker.functional}</div>
                        </div>
                      </div>
                      <Progress 
                        value={marker.progress} 
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        Reference Range: {marker.reference} {marker.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Phased Protocol */}
            <Card className="card-medical">
              <CardHeader>
                <CardTitle>Optimization Protocol</CardTitle>
                <CardDescription>
                  Personalized phased approach to address your specific needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Phase 1 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Phase 1: Foundation (Weeks 1-4)</h4>
                        <p className="text-sm text-muted-foreground">Address iron deficiency and vitamin D optimization</p>
                      </div>
                    </div>
                    
                    <div className="ml-11 space-y-3">
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Supplement Protocol:</h5>
                        <div className="space-y-2">
                          {[
                            { name: "Iron Bisglycinate", dose: "25mg daily", timing: "with breakfast", link: true },
                            { name: "Vitamin C", dose: "500mg", timing: "with iron", link: true },
                            { name: "Vitamin D3", dose: "4000 IU daily", timing: "with fat-containing meal", link: true }
                          ].map((supp, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <div className="font-medium text-sm">{supp.name}</div>
                                <div className="text-xs text-muted-foreground">{supp.dose} - {supp.timing}</div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`text-xs ${!hasDispensaryAccess ? 'opacity-50' : ''}`}
                                onClick={() => handleSupplementClick(supp.name)}
                                disabled={!hasDispensaryAccess}
                              >
                                {hasDispensaryAccess ? (
                                  <>
                                    Add to Cart
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-3 w-3 mr-1" />
                                    Locked
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Lifestyle Modifications:</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Include iron-rich foods: grass-fed beef, spinach, lentils</li>
                          <li>• Avoid coffee/tea within 2 hours of iron supplementation</li>
                          <li>• Daily sun exposure (10-15 minutes) when possible</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Phase 2 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Phase 2: Optimization (Weeks 5-8)</h4>
                        <p className="text-sm text-muted-foreground">Advanced metabolic support and monitoring</p>
                      </div>
                    </div>
                    
                    <div className="ml-11 space-y-3">
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Additional Supplements:</h5>
                        <div className="space-y-2">
                          {[
                            { name: "B-Complex", dose: "1 capsule daily", timing: "with breakfast", link: true },
                            { name: "Magnesium Glycinate", dose: "400mg", timing: "before bed", link: true }
                          ].map((supp, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <div className="font-medium text-sm">{supp.name}</div>
                                <div className="text-xs text-muted-foreground">{supp.dose} - {supp.timing}</div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`text-xs ${!hasDispensaryAccess ? 'opacity-50' : ''}`}
                                onClick={() => handleSupplementClick(supp.name)}
                                disabled={!hasDispensaryAccess}
                              >
                                {hasDispensaryAccess ? (
                                  <>
                                    Add to Cart
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-3 w-3 mr-1" />
                                    Locked
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Monitoring:</h5>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Track energy levels and sleep quality</li>
                          <li>• Monitor any digestive changes from iron supplementation</li>
                          <li>• Schedule retest at 8-week mark</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Follow-up */}
            <Card className="card-medical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Follow-up Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Retest Recommended</h4>
                      <p className="text-sm text-muted-foreground">February 15, 2025 (8 weeks)</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Schedule Retest
                    </Button>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Priority Labs for Retest:</h5>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Ferritin</Badge>
                      <Badge variant="outline">Vitamin D</Badge>
                      <Badge variant="outline">Iron Panel</Badge>
                      <Badge variant="outline">CBC w/ Diff</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clinical" className="space-y-6">
            <Card className="card-medical">
              <CardHeader>
                <CardTitle>Clinical Analysis Details</CardTitle>
                <CardDescription>
                  Comprehensive biomarker analysis and functional medicine interpretation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4">Root Cause Analysis</h4>
                    <div className="space-y-4">
                      <div className="border border-border/60 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-destructive rounded-full mt-2" />
                          <div className="flex-1">
                            <h5 className="font-medium">Iron Deficiency (High Confidence: 95%)</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              Low ferritin with normal hemoglobin suggests early iron deficiency without anemia. 
                              This pattern is common in individuals with increased iron demands, poor absorption, 
                              or inadequate dietary intake.
                            </p>
                            <div className="mt-3">
                              <Button variant="ghost" size="sm" className="text-xs">
                                <Info className="h-3 w-3 mr-1" />
                                Why this matters
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-border/60 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                          <div className="flex-1">
                            <h5 className="font-medium">Vitamin D Insufficiency (Confidence: 85%)</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              Suboptimal vitamin D levels may impact immune function, hormone production, 
                              and calcium absorption. Consider seasonal variations and supplementation history.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-4">Evidence & Citations</h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="font-medium">Iron Deficiency Without Anemia</p>
                        <p className="text-muted-foreground mt-1">
                          Ferritin &lt;30 ng/mL indicates depleted iron stores. Functional medicine targets 70-150 ng/mL 
                          for optimal energy and cognitive function.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Ref: Pasricha et al. "Iron deficiency" Lancet 2021
                        </p>
                      </div>
                      
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="font-medium">Vitamin D Optimization</p>
                        <p className="text-muted-foreground mt-1">
                          25-OH Vitamin D levels 50-80 ng/mL associated with optimal immune function 
                          and reduced inflammation markers.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Ref: Holick MF. "Vitamin D deficiency" NEJM 2007
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportView;