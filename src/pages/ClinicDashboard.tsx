import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Stethoscope, 
  Users, 
  TrendingUp, 
  Settings, 
  Eye, 
  ExternalLink, 
  Copy,
  Palette,
  LogOut,
  BarChart3,
  UserCheck,
  CreditCard
} from "lucide-react";
import PatientManagement from "@/components/PatientManagement";
import ClinicAnalytics from "@/components/ClinicAnalytics";
import StaffManagement from "@/components/StaffManagement";
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Clinic {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  fullscripts_dispensary_url?: string;
  subscription_status: string;
  subscription_tier: string;
  subscription_end_date?: string;
}

const ClinicDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAnalyses: 0,
    thisMonth: 0,
    revenue: 0
  });

  useEffect(() => {
    if (!user) {
      navigate("/clinic-login");
      return;
    }
    fetchClinicData();
  }, [user]);

  const fetchClinicData = async () => {
    try {
      // Get clinic data where user is admin
      const { data: clinicUser } = await supabase
        .from('clinic_users')
        .select(`
          clinic_id,
          role,
          clinics (*)
        `)
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .single();

      if (clinicUser?.clinics) {
        setClinic(clinicUser.clinics as Clinic);
      }

      // Get stats (mock for now)
      setStats({
        totalPatients: 127,
        totalAnalyses: 342,
        thisMonth: 89,
        revenue: 2840
      });
    } catch (error) {
      console.error('Error fetching clinic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateClinic = async (updates: Partial<Clinic>) => {
    if (!clinic) return;

    try {
      const { error } = await supabase
        .from('clinics')
        .update(updates)
        .eq('id', clinic.id);

      if (error) throw error;

      setClinic({ ...clinic, ...updates });
      toast({
        title: "Success",
        description: "Clinic settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyPatientUrl = () => {
    const url = `${window.location.origin}/${clinic?.slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Patient portal URL copied to clipboard",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/clinic");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Clinic Found</CardTitle>
            <CardDescription>
              You don't have admin access to any clinic. Please contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/clinic")}>
              Back to Landing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">LabPilot Pro</span>
              <span className="text-sm text-muted-foreground ml-2">Admin Dashboard</span>
            </div>
          </div>
          
          <div className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
            <span className="text-gray-500">Biohack</span><span className="text-blue-600">Labs</span><span className="text-gray-500">.ai</span>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant={clinic.subscription_status === 'active' ? 'default' : 'secondary'}>
              {clinic.subscription_tier} Plan
            </Badge>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {clinic.name}!</h1>
          <p className="text-muted-foreground">Manage your clinic settings and monitor patient activity.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Subscription Status */}
            <SubscriptionStatus 
              clinicId={clinic.id} 
              onUpgrade={() => {
                // Scroll to billing tab or switch to it programmatically
                const billingTab = document.querySelector('[data-value="billing"]') as HTMLElement;
                billingTab?.click();
              }}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Patient Portal Access</CardTitle>
                <CardDescription>
                  Share this URL with your patients to access their personalized lab analysis portal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input 
                    value={`${window.location.origin}/${clinic.slug}`}
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={copyPatientUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => window.open(`/${clinic.slug}`, '_blank')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Manage Patients
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <UserCheck className="h-6 w-6 mb-2" />
                  Manage Staff
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  Clinic Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <PatientManagement clinicId={clinic.id} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ClinicAnalytics clinicId={clinic.id} />
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <StaffManagement clinicId={clinic.id} />
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Billing & Subscription</h3>
                  <p className="text-muted-foreground">Manage your subscription and view usage</p>
                </div>
              </div>
              
              <SubscriptionStatus 
                clinicId={clinic.id} 
                onUpgrade={() => {
                  // This would integrate with Stripe when ready
                  console.log('Redirect to pricing/upgrade page');
                }}
              />
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Manage your billing information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      No payment method on file
                    </p>
                    <Button variant="outline" size="sm">
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View past invoices and payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      No billing history available
                    </p>
                    <Button variant="outline" size="sm">
                      View Invoices
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Customization</CardTitle>
                <CardDescription>
                  Customize your patient portal appearance to match your clinic branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={clinic.primary_color}
                        onChange={(e) => updateClinic({ primary_color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={clinic.primary_color}
                        onChange={(e) => updateClinic({ primary_color: e.target.value })}
                        placeholder="#0ea5e9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={clinic.secondary_color}
                        onChange={(e) => updateClinic({ secondary_color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={clinic.secondary_color}
                        onChange={(e) => updateClinic({ secondary_color: e.target.value })}
                        placeholder="#1e293b"
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL (optional)</Label>
                  <Input
                    id="logo-url"
                    value={clinic.logo_url || ""}
                    onChange={(e) => updateClinic({ logo_url: e.target.value })}
                    placeholder="https://your-clinic.com/logo.png"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fullscript Integration</CardTitle>
                <CardDescription>
                  Connect your Fullscript dispensary to automatically link supplement recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dispensary-url">Fullscript Dispensary URL</Label>
                  <Input
                    id="dispensary-url"
                    value={clinic.fullscripts_dispensary_url || ""}
                    onChange={(e) => updateClinic({ fullscripts_dispensary_url: e.target.value })}
                    placeholder="https://us.fullscript.com/welcome/your-dispensary"
                  />
                  <p className="text-sm text-muted-foreground">
                    Patients will be directed to this URL when clicking supplement recommendations
                  </p>
                </div>
                {clinic.fullscripts_dispensary_url && (
                  <Button variant="outline" onClick={() => window.open(clinic.fullscripts_dispensary_url, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test Dispensary Link
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic-name">Clinic Name</Label>
                    <Input
                      id="clinic-name"
                      value={clinic.name}
                      onChange={(e) => updateClinic({ name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={clinic.slug}
                      onChange={(e) => updateClinic({ slug: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={clinic.website_url || ""}
                      onChange={(e) => updateClinic({ website_url: e.target.value })}
                      placeholder="https://your-clinic.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={clinic.contact_phone || ""}
                      onChange={(e) => updateClinic({ contact_phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Plan: {clinic.subscription_tier}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: <Badge variant={clinic.subscription_status === 'active' ? 'default' : 'secondary'}>
                        {clinic.subscription_status}
                      </Badge>
                    </p>
                  </div>
                  <Button variant="outline">
                    Manage Billing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClinicDashboard;