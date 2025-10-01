import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  FileText, 
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Patient {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  reportCount: number;
  lastReport?: string;
  status: 'active' | 'inactive';
}

interface PatientReport {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface PatientManagementProps {
  clinicId: string;
}

const PatientManagement = ({ clinicId }: PatientManagementProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientReports, setPatientReports] = useState<PatientReport[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, [clinicId]);

  const fetchPatients = async () => {
    try {
      // Get all users who have reports in this clinic
      const { data: reports, error } = await supabase
        .from('lab_reports')
        .select(`
          user_id,
          created_at
        `)
        .eq('clinic_id', clinicId);

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set(reports?.map(r => r.user_id) || [])];
      
      // Fetch profile data for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Group by user and count reports
      const patientMap = new Map<string, Patient>();
      
      reports?.forEach((report) => {
        const profile = profiles?.find(p => p.id === report.user_id);
        if (!profile) return;

        const patientId = profile.id;
        if (patientMap.has(patientId)) {
          const patient = patientMap.get(patientId)!;
          patient.reportCount += 1;
          patient.lastReport = report.created_at;
        } else {
          patientMap.set(patientId, {
            id: patientId,
            full_name: `Patient ${patientId.slice(0, 8)}`, // Generate display name from ID
            email: '', // We don't have email in profiles
            created_at: profile.created_at,
            reportCount: 1,
            lastReport: report.created_at,
            status: 'active'
          });
        }
      });

      setPatients(Array.from(patientMap.values()));
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientReports = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('lab_reports')
        .select('id, title, status, created_at')
        .eq('user_id', patientId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatientReports(data || []);
    } catch (error) {
      console.error('Error fetching patient reports:', error);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    fetchPatientReports(patient.id);
  };

  const sendInvite = async () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // For now, just show success message - in production you'd send an actual invite
    toast({
      title: "Invite Sent",
      description: `Invitation sent to ${inviteEmail}`,
    });
    
    setInviteEmail("");
    setIsInviteDialogOpen(false);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading patients...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Patient Management
              </CardTitle>
              <CardDescription>
                Manage your clinic's patients and their lab reports
              </CardDescription>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New Patient</DialogTitle>
                  <DialogDescription>
                    Send an invitation to a patient to join your clinic portal
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Patient Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="patient@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={sendInvite}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invite
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold">{patients.length}</div>
              <div className="text-sm text-muted-foreground">Total Patients</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold">
                {patients.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Patients</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold">
                {patients.reduce((sum, p) => sum + p.reportCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </div>
          </div>

          {/* Patient List */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Last Report</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{patient.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Joined {format(new Date(patient.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{patient.reportCount}</Badge>
                    </TableCell>
                    <TableCell>
                      {patient.lastReport ? (
                        format(new Date(patient.lastReport), 'MMM d, yyyy')
                      ) : (
                        'No reports'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No patients found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPatient.full_name}</DialogTitle>
              <DialogDescription>
                Patient details and report history
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="reports" className="w-full">
              <TabsList>
                <TabsTrigger value="reports">Reports ({patientReports.length})</TabsTrigger>
                <TabsTrigger value="info">Patient Info</TabsTrigger>
              </TabsList>
              <TabsContent value="reports" className="space-y-4">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>
                            <Badge variant={report.status === 'analyzed' ? 'default' : 'secondary'}>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(report.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <div className="mt-1 p-2 bg-muted rounded">{selectedPatient.full_name}</div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      <Badge variant={selectedPatient.status === 'active' ? 'default' : 'secondary'}>
                        {selectedPatient.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Member Since</Label>
                    <div className="mt-1 p-2 bg-muted rounded">
                      {format(new Date(selectedPatient.created_at), 'MMMM d, yyyy')}
                    </div>
                  </div>
                  <div>
                    <Label>Total Reports</Label>
                    <div className="mt-1 p-2 bg-muted rounded">{selectedPatient.reportCount}</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PatientManagement;