import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  User, 
  CreditCard,
  Download,
  Clock,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import FileUpload from "@/components/FileUpload";
import ReportsTable from "@/components/ReportsTable";
import { DispensaryAccess } from "@/components/DispensaryAccess";
import { ConsentDialog } from "@/components/ConsentDialog";
import { PHIBlockedDialog } from "@/components/PHIBlockedDialog";
import { useLabReports } from "@/hooks/useLabReports";
import dashboardImage from "@/assets/dashboard-preview.jpg";
import UnifiedBackground from "@/components/UnifiedBackground";

interface Clinic {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  website_url?: string;
  fullscripts_dispensary_url?: string;
  subscription_status: string;
}

interface DashboardProps {
  clinicContext?: Clinic;
}

const Dashboard = ({ clinicContext }: DashboardProps = {}) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ id?: string; sex?: string } | null>(null);
  const { 
    showConsentDialog, 
    handleConsentResponse,
    showPHIBlockedDialog,
    handlePHIBlockedClose,
    phiBlockedDetails
  } = useLabReports();

  useEffect(() => {
    if (user) {
      // Fetch user profile
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_id', user.id)
          .maybeSingle();
        
        setProfile(data);
      };
      
      fetchProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-clinical relative">
      <UnifiedBackground variant="clinical" intensity="low" />
      
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg" />
                <h1 className="text-xl font-bold">
                  {clinicContext ? clinicContext.name : "LabPilot"}
                </h1>
              </div>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Credits Remaining</div>
                <div className="font-semibold text-primary">5 analyses</div>
              </div>
              <Button variant="outline" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Credits
              </Button>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {user?.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Welcome back
                  </div>
                </div>
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content - Upload and Reports */}
          <div className="lg:col-span-2 space-y-6">
            <FileUpload />
            <ReportsTable clinicContext={clinicContext} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Dispensary Access */}
            <DispensaryAccess 
              clinicContext={clinicContext}
              onPurchaseAnalysis={() => {
                // This would trigger payment flow - integrate with your payment system
                window.location.href = '/payment';
              }}
            />
            
            {/* Quick Stats */}
            <Card className="card-medical">
              <CardHeader>
                <CardTitle className="text-lg">Health Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Optimization Score</span>
                    <span className="font-semibold text-secondary">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Based on latest analysis</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Red Flags</span>
                    <span className="font-semibold text-destructive">2</span>
                  </div>
                  <Progress value={20} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Require attention</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tracking Progress</span>
                    <span className="font-semibold text-primary">5 markers</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Trending positive</p>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Preview */}
            <Card className="card-medical">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  Analysis Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src={dashboardImage} 
                  alt="Lab analysis dashboard preview"
                  className="w-full rounded-lg shadow-card"
                />
                <p className="text-xs text-muted-foreground mt-3">
                  Real-time biomarker visualization and trend analysis
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-medical">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Retest
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Trends
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <ConsentDialog 
        open={showConsentDialog}
        onConsent={handleConsentResponse}
        onClose={() => handleConsentResponse(false)}
      />
      
      <PHIBlockedDialog
        open={showPHIBlockedDialog}
        onClose={handlePHIBlockedClose}
        blockedDetails={phiBlockedDetails}
      />
    </div>
  );
};

export default Dashboard;