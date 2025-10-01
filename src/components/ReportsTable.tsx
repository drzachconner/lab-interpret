import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye,
  Download,
  Trash2,
  Calendar,
  FileText,
  Brain,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useLabReports } from "@/hooks/useLabReports";
import LabAnalysisView from "@/components/LabAnalysisView";

const ReportsTable = ({ clinicContext }: { clinicContext?: any } = {}) => {
  const { reports, loading, deleteReport, startAnalysis } = useLabReports();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  if (selectedReport) {
    return (
      <LabAnalysisView 
        reportId={selectedReport}
        onBack={() => setSelectedReport(null)}
        clinicContext={clinicContext}
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Brain className="h-4 w-4" />;
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleRetryAnalysis = async (reportId: string) => {
    try {
      await startAnalysis(reportId);
    } catch (error) {
      console.error('Failed to retry analysis:', error);
    }
  };

  if (loading) {
    return (
      <Card className="card-medical">
        <CardHeader>
          <CardTitle>Lab Reports</CardTitle>
          <CardDescription>Your uploaded lab reports and AI analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-medical">
      <CardHeader>
        <CardTitle>Lab Reports</CardTitle>
        <CardDescription>
          Your uploaded lab reports and AI analyses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
            <p className="text-muted-foreground">
              Upload your first lab report to get started with AI analysis
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-border/60 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getStatusIcon(report.status)}
                  </div>
                  <div>
                    <h4 className="font-medium">{report.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.created_at).toLocaleDateString()}
                      <Badge 
                        variant={getStatusColor(report.status)}
                        className="text-xs"
                      >
                        {report.status}
                      </Badge>
                    </div>
                    {report.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {report.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {report.status === 'failed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRetryAnalysis(report.id)}
                      className="text-xs"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                  
                  {report.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRetryAnalysis(report.id)}
                      className="text-xs"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      Analyze
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReport(report.id)}
                    disabled={report.status === 'processing'}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {report.file_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(report.file_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteReport(report.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsTable;