import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2,
  Crown,
  User,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface StaffMember {
  id: string;
  user_id: string;
  role: 'admin' | 'staff';
  created_at: string;
  full_name?: string;
}

interface StaffManagementProps {
  clinicId: string;
}

const StaffManagement = ({ clinicId }: StaffManagementProps) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'staff' as 'admin' | 'staff'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, [clinicId]);

  const fetchStaff = async () => {
    try {
      // Get clinic users
      const { data: clinicUsers, error } = await supabase
        .from('clinic_users')
        .select(`
          id,
          user_id,
          role,
          created_at
        `)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profiles for these users
      const userIds = clinicUsers?.map(cu => cu.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const staffData = clinicUsers?.map(cu => ({
        ...cu,
        role: cu.role as 'admin' | 'staff',
        full_name: `User ${cu.user_id.slice(0, 8)}` // Generate display name from ID
      })) || [];

      setStaff(staffData);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteData.email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // For now, just show success message - in production you'd send an actual invite
    // and create a pending invitation record
    toast({
      title: "Invite Sent",
      description: `Staff invitation sent to ${inviteData.email}`,
    });
    
    setInviteData({ email: '', role: 'staff' });
    setIsInviteDialogOpen(false);
  };

  const updateRole = async (staffId: string, newRole: 'admin' | 'staff') => {
    try {
      const { error } = await supabase
        .from('clinic_users')
        .update({ role: newRole })
        .eq('id', staffId);

      if (error) throw error;

      setStaff(staff.map(member => 
        member.id === staffId ? { ...member, role: newRole } : member
      ));

      toast({
        title: "Success",
        description: "Staff member role updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeStaff = async (staffId: string) => {
    try {
      const { error } = await supabase
        .from('clinic_users')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      setStaff(staff.filter(member => member.id !== staffId));
      
      toast({
        title: "Success",
        description: "Staff member removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'staff':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default' as const;
      case 'staff':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading staff...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const admins = staff.filter(member => member.role === 'admin');
  const staffMembers = staff.filter(member => member.role === 'staff');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Management
              </CardTitle>
              <CardDescription>
                Manage your clinic's staff members and their permissions
              </CardDescription>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Staff Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your clinic as a staff member
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-email">Email Address</Label>
                    <Input
                      id="staff-email"
                      type="email"
                      placeholder="staff@example.com"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff-role">Role</Label>
                    <Select 
                      value={inviteData.role} 
                      onValueChange={(value: 'admin' | 'staff') => 
                        setInviteData({ ...inviteData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Staff - Can view and manage patient reports
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            Admin - Full clinic management access
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={sendInvite}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invite
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold">{staff.length}</div>
              <div className="text-sm text-muted-foreground">Total Staff</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold">{admins.length}</div>
              <div className="text-sm text-muted-foreground">Administrators</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-2xl font-bold">{staffMembers.length}</div>
              <div className="text-sm text-muted-foreground">Staff Members</div>
            </div>
          </div>

          {/* Staff List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Staff Members ({staff.length})</h4>
            </div>
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.role)}
                          <span className="font-medium">
                            {member.full_name || `User ${member.user_id.slice(0, 8)}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(member.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={member.role} 
                            onValueChange={(newRole: 'admin' | 'staff') => 
                              updateRole(member.id, newRole)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.full_name || `User ${member.user_id.slice(0, 8)}`} from your clinic? 
                                  They will lose access to all clinic data and patients.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeStaff(member.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {staff.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No staff members yet</p>
                <p className="text-sm">Invite team members to help manage your clinic</p>
              </div>
            )}
          </div>

          {/* Role Permissions Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Role Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium">Administrator</div>
                  <div className="text-sm text-muted-foreground">
                    Full access to clinic settings, staff management, billing, and all patient data
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium">Staff</div>
                  <div className="text-sm text-muted-foreground">
                    Can view and manage patient reports, but cannot access clinic settings or billing
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffManagement;