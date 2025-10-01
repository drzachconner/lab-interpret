import { useState, useEffect } from "react";
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
  FileText,
  ExternalLink,
  Lock,
  Loader2,
  Brain,
  RefreshCw
} from "lucide-react";
import { useSupplementRecommendations } from "@/hooks/useSupplementRecommendations";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useLabReports, type LabReport } from "@/hooks/useLabReports";
import UnifiedBackground from "@/components/UnifiedBackground";

interface LabAnalysisViewProps {
  reportId: string;
  onBack?: () => void;
  clinicContext?: any;
}

const LabAnalysisView = ({ reportId, onBack, clinicContext }: LabAnalysisViewProps) => {
  const [report, setReport] = useState<LabReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { reports, startAnalysis } = useLabReports();
  const { openSupplementLink, recommendations, loading: supplementLoading } = useSupplementRecommendations({ 
    clinicContext,
    labAnalysis: report?.ai_analysis
  });
  const { hasDispensaryAccess } = usePaymentStatus();

  useEffect(() => {
    const foundReport = reports.find(r => r.id === reportId);
    setReport(foundReport || null);
    setLoading(false);
  }, [reportId, reports]);

  const handleRetryAnalysis = async () => {
    if (!report) return;
    try {
      await startAnalysis(report.id);
    } catch (error) {
      console.error('Failed to retry analysis:', error);
    }
  };

  const handleSupplementClick = (supplementName: string) => {
    if (!hasDispensaryAccess) {
      alert('Please purchase a lab analysis to unlock dispensary access with 15% discount');
      return;
    }
    
    const mockUrl = clinicContext?.fullscripts_dispensary_url 
      ? `${clinicContext.fullscripts_dispensary_url}?product=${encodeURIComponent(supplementName)}&ref=clinic`
      : `https://supplements.labpilot.com/products/${encodeURIComponent(supplementName)}?ref=platform`;
    
    openSupplementLink(mockUrl);
  };

  const parseAiAnalysis = (analysis: any) => {
    if (!analysis || typeof analysis.raw_response !== 'string') {
      return null;
    }

    // Try to extract structured data from the AI response
    try {
      // Look for JSON in the response
      const jsonMatch = analysis.raw_response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Fallback to parsing the markdown response
      return {
        summary: analysis.raw_response.substring(0, 500) + '...',
        findings: [],
        recommendations: []
      };
    } catch {
      return {
        summary: analysis.raw_response,
        findings: [],
        recommendations: []
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-clinical flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-clinical flex items-center justify-center">
        <Card className="card-medical max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested lab report could not be found.</p>
            <Button onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analysisData = report.ai_analysis ? parseAiAnalysis(report.ai_analysis) : null;

  return (
    <div className="min-h-screen bg-gradient-clinical relative">
      <UnifiedBackground variant="clinical" intensity="medium" />
      
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold">{report.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {new Date(report.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                report.status === 'completed' ? 'default' :
                report.status === 'processing' ? 'secondary' :
                report.status === 'failed' ? 'destructive' : 'outline'
              }>
                {report.status}
              </Badge>
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

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Processing Status */}
        {report.status === 'processing' && (
          <Card className="card-medical mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">AI Analysis in Progress</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your lab report is being analyzed by our AI system. This usually takes 1-2 minutes.
                  </p>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed Status */}
        {report.status === 'failed' && (
          <Card className="card-medical mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Analysis Failed</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    There was an error analyzing your lab report. Please try again.
                  </p>
                </div>
                <Button onClick={handleRetryAnalysis} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {report.status === 'completed' && analysisData && (
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Summary View</TabsTrigger>
              <TabsTrigger value="clinical">Clinical Details</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              {/* AI Analysis Summary */}
              <Card className="card-medical">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Analysis Summary
                  </CardTitle>
                  <CardDescription>
                    Powered by GPT-5 • Generated {new Date(report.ai_analysis?.generated_at || report.updated_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {analysisData.summary ? (
                      <p className="whitespace-pre-wrap">{analysisData.summary}</p>
                    ) : (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {report.ai_analysis?.raw_response || 'No analysis available'}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Supplement Recommendations */}
              <Card className="card-medical">
                <CardHeader>
                  <CardTitle>AI-Powered Supplement Recommendations</CardTitle>
                  <CardDescription>
                    Personalized supplement protocol based on your lab analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((supp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium text-sm">{supp.name}</div>
                            {supp.brand && (
                              <Badge variant="outline" className="text-xs">
                                {supp.brand}
                              </Badge>
                            )}
                            <Badge 
                              variant={
                                supp.priority === 'high' ? 'default' :
                                supp.priority === 'medium' ? 'secondary' : 'outline'
                              }
                              className="text-xs"
                            >
                              {supp.priority} priority
                            </Badge>
                          </div>
                          {supp.dosage && (
                            <div className="text-xs text-muted-foreground mb-1">
                              <strong>Dosage:</strong> {supp.dosage}
                              {supp.timing && <span> • <strong>Timing:</strong> {supp.timing}</span>}
                            </div>
                          )}
                          {supp.reasoning && (
                            <div className="text-xs text-muted-foreground italic">
                              {supp.reasoning}
                            </div>
                          )}
                          {supp.price && (
                            <div className="text-xs text-primary font-medium mt-1">
                              ${(supp.price / 100).toFixed(2)}
                              {supp.clinicCommission && (
                                <span className="text-muted-foreground"> • Clinic pricing</span>
                              )}
                            </div>
                          )}
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
                  
                  {!hasDispensaryAccess && (
                    <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">Unlock Professional Supplements</h4>
                          <p className="text-sm text-muted-foreground">
                            Get 15% practitioner discount and personalized recommendations
                          </p>
                        </div>
                        <Button size="sm" onClick={() => window.location.href = '/lab-marketplace'}>
                          Unlock Access
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="card-medical">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Schedule Follow-up</h4>
                        <p className="text-sm text-muted-foreground">Retest in 8-12 weeks to track progress</p>
                      </div>
                      <Button variant="outline" size="sm" className="ml-auto">
                        Schedule Retest
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clinical" className="space-y-6">
              {/* Raw Analysis */}
              <Card className="card-medical">
                <CardHeader>
                  <CardTitle>Full Clinical Analysis</CardTitle>
                  <CardDescription>Complete AI analysis output</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono max-h-96 overflow-y-auto">
                      {report.ai_analysis?.raw_response || 'No analysis available'}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Pending Status */}
        {report.status === 'pending' && (
          <Card className="card-medical">
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Report Uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Your lab report has been uploaded and is queued for analysis.
              </p>
              <Button onClick={handleRetryAnalysis}>
                <Brain className="h-4 w-4 mr-2" />
                Start AI Analysis
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LabAnalysisView;