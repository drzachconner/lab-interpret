import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AnalyticsData {
  totalPatients: number;
  totalReports: number;
  reportsThisMonth: number;
  reportsToday: number;
  analysisCompletionRate: number;
  avgProcessingTime: number;
  reportsByStatus: { status: string; count: number; color: string }[];
  reportsByDay: { date: string; count: number }[];
  reportsByMonth: { month: string; count: number }[];
}

interface ClinicAnalyticsProps {
  clinicId: string;
}

const ClinicAnalytics = ({ clinicId }: ClinicAnalyticsProps) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7days' | '30days' | '3months'>('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [clinicId, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get all reports for this clinic
      const { data: reports, error } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('clinic_id', clinicId);

      if (error) throw error;

      // Get unique patients
      const { data: patients, error: patientsError } = await supabase
        .from('lab_reports')
        .select('user_id')
        .eq('clinic_id', clinicId);

      if (patientsError) throw patientsError;

      const uniquePatients = new Set(patients?.map(p => p.user_id) || []).size;

      // Calculate date ranges
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfToday = startOfDay(now);
      const endOfToday = endOfDay(now);

      // Filter reports by timeframe
      let timeframeDays = 30;
      if (timeframe === '7days') timeframeDays = 7;
      else if (timeframe === '3months') timeframeDays = 90;
      
      const timeframeStart = subDays(now, timeframeDays);

      const reportsInTimeframe = reports?.filter(r => 
        new Date(r.created_at) >= timeframeStart
      ) || [];

      const reportsThisMonth = reports?.filter(r => 
        new Date(r.created_at) >= startOfMonth
      ).length || 0;

      const reportsToday = reports?.filter(r => {
        const reportDate = new Date(r.created_at);
        return reportDate >= startOfToday && reportDate <= endOfToday;
      }).length || 0;

      // Calculate status distribution
      const statusCounts = reports?.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const reportsByStatus = [
        { status: 'analyzed', count: statusCounts.analyzed || 0, color: '#10b981' },
        { status: 'pending', count: statusCounts.pending || 0, color: '#f59e0b' },
        { status: 'processing', count: statusCounts.processing || 0, color: '#3b82f6' },
        { status: 'error', count: statusCounts.error || 0, color: '#ef4444' },
      ];

      // Calculate reports by day for the timeframe
      const reportsByDay = [];
      for (let i = 0; i < timeframeDays; i++) {
        const date = subDays(now, i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const count = reports?.filter(r => {
          const reportDate = new Date(r.created_at);
          return reportDate >= dayStart && reportDate <= dayEnd;
        }).length || 0;

        reportsByDay.unshift({
          date: format(date, 'MMM dd'),
          count
        });
      }

      // Calculate reports by month (last 12 months)
      const reportsByMonth = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const count = reports?.filter(r => {
          const reportDate = new Date(r.created_at);
          return reportDate >= monthStart && reportDate <= monthEnd;
        }).length || 0;

        reportsByMonth.push({
          month: format(date, 'MMM yyyy'),
          count
        });
      }

      const analyticsData: AnalyticsData = {
        totalPatients: uniquePatients,
        totalReports: reports?.length || 0,
        reportsThisMonth,
        reportsToday,
        analysisCompletionRate: reports?.length ? 
          ((statusCounts.analyzed || 0) / reports.length) * 100 : 0,
        avgProcessingTime: 2.5, // Mock data - would calculate from actual processing times
        reportsByStatus,
        reportsByDay,
        reportsByMonth
      };

      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Active clinic members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              All-time lab reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.reportsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Reports uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.analysisCompletionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Analysis completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Analytics Overview</h3>
            <p className="text-sm text-muted-foreground">Track your clinic's performance and usage patterns</p>
          </div>
          <TabsList>
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="3months">3 Months</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports by Day */}
          <Card>
            <CardHeader>
              <CardTitle>Report Volume</CardTitle>
              <CardDescription>Daily report uploads over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.reportsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Report Status</CardTitle>
              <CardDescription>Distribution of report processing status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.reportsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                  >
                    {data.reportsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {data.reportsByStatus.map((status) => (
                  <div key={status.status} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm capitalize">{status.status} ({status.count})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Report volume over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.reportsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Today's Reports</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.reportsToday}</div>
              <Badge variant="secondary" className="mt-2">
                Today
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.avgProcessingTime}min</div>
              <Badge variant="secondary" className="mt-2">
                Per report
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((data.reportsByStatus.find(s => s.status === 'analyzed')?.count || 0) / 
                  Math.max(data.totalReports, 1) * 100).toFixed(1)}%
              </div>
              <Badge variant="secondary" className="mt-2">
                Analyzed
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.reportsByStatus.find(s => s.status === 'pending')?.count || 0}
              </div>
              <Badge variant="secondary" className="mt-2">
                Queue
              </Badge>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
};

export default ClinicAnalytics;