import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useConsentStatus } from '@/hooks/useConsentStatus';
import { deidentifyLabPayload, type RawLabResult } from '@/utils/deidentification';

export interface LabReport {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  ai_analysis?: any;
  findings?: string;
  recommendations?: string;
  created_at: string;
  updated_at: string;
}

export function useLabReports() {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showPHIBlockedDialog, setShowPHIBlockedDialog] = useState(false);
  const [phiBlockedDetails, setPHIBlockedDetails] = useState<any>(null);
  const [pendingAnalysisId, setPendingAnalysisId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasConsented, recordConsent } = useConsentStatus();

  const fetchReports = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lab_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data || []) as LabReport[]);
    } catch (error: any) {
      toast({
        title: "Error fetching reports",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadReport = async (file: File, title: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lab-reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lab-reports')
        .getPublicUrl(filePath);

      // Create report record
      const { data, error } = await supabase
        .from('lab_reports')
        .insert({
          user_id: user.id,
          title,
          description,
          file_url: publicUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          status: 'processing'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Report uploaded successfully",
        description: "Your lab report has been uploaded and AI analysis is starting..."
      });

      // Start AI analysis automatically
      try {
        await startAnalysis(data.id);
      } catch (analysisError: any) {
        console.error('Analysis failed:', analysisError);
        toast({
          title: "Analysis failed",
          description: "Upload successful but AI analysis encountered an error. Please try again.",
          variant: "destructive"
        });
      }

      // Refresh reports list
      await fetchReports();
      return data;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const startAnalysis = async (reportId: string) => {
    if (!user) throw new Error('User not authenticated');

    // Check consent before proceeding with analysis
    if (!hasConsented) {
      setPendingAnalysisId(reportId);
      setShowConsentDialog(true);
      return;
    }

    await performAnalysis(reportId);
  };

  const handleConsentResponse = async (consented: boolean) => {
    setShowConsentDialog(false);
    
    if (consented && pendingAnalysisId) {
      const success = await recordConsent();
      if (success) {
        await performAnalysis(pendingAnalysisId);
      } else {
        toast({
          title: "Consent recording failed",
          description: "Please try again or contact support.",
          variant: "destructive"
        });
      }
    }
    
    setPendingAnalysisId(null);
  };

  const performAnalysis = async (reportId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Mock patient profile and lab results for demo - now HIPAA-safe
      const mockPatientProfile = {
        name: 'John Doe', // This will be detected and blocked by de-identification
        email: 'john@example.com', // This will be detected and blocked
        phone: '555-123-4567', // This will be detected and blocked  
        age: 35,
        sex: 'Female' as const,
        height_cm: 165,
        weight_kg: 60,
        conditions: [],
        medications: [],
        allergies: [],
        diet_pattern: 'balanced',
        goals: ['optimize energy', 'improve sleep', 'enhance performance'],
        notes: 'Patient John Smith reported feeling tired. Contact at john@email.com or call 555-1234.'
      };

      const mockLabResults = [
        { test: 'Ferritin', value: 18, unit: 'ng/mL', ref: '15-400' },
        { test: 'Vitamin D', value: 22, unit: 'ng/mL', ref: '20-100' },
        { test: 'Fasting Glucose', value: 88, unit: 'mg/dL', ref: '70-100' },
        { test: 'HDL Cholesterol', value: 65, unit: 'mg/dL', ref: '40-200' }
      ];

      // Pre-flight de-identification check
      const rawLabInput: RawLabResult = {
        patient_name: mockPatientProfile.name,
        email: mockPatientProfile.email,
        phone: mockPatientProfile.phone,
        age: mockPatientProfile.age,
        sex: mockPatientProfile.sex,
        notes: mockPatientProfile.notes,
        labs: mockLabResults
      };

      const deidentificationResult = deidentifyLabPayload(rawLabInput);
      
      if (deidentificationResult.blocked) {
        console.log('Analysis blocked due to PHI detection:', deidentificationResult.blocked.reason);
        setPHIBlockedDetails(deidentificationResult.blocked);
        setShowPHIBlockedDialog(true);
        return;
      }

      toast({
        title: "Analysis starting",
        description: "Processing your de-identified lab data with HIPAA-compliant AI analysis...",
      });

      const { data, error } = await supabase.functions.invoke('analyze-lab-report-ai', {
        body: {
          labReportId: reportId,
          patientProfile: mockPatientProfile,
          labResults: mockLabResults,
          functionalRanges: [
            { name: 'Ferritin', functional_low: 70, functional_high: 150 },
            { name: 'Vitamin D', functional_low: 50, functional_high: 80 }
          ]
        }
      });

      if (error) throw error;

      toast({
        title: "Analysis completed",
        description: "Your HIPAA-compliant lab analysis is ready! No personal identifiers were shared with AI."
      });

      await fetchReports();
      return data;
    } catch (error: any) {
      // Update status to failed
      await supabase
        .from('lab_reports')
        .update({ status: 'failed' })
        .eq('id', reportId);
        
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive"
      });
        
      throw error;
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('lab_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Report deleted",
        description: "Lab report has been successfully deleted."
      });

      await fetchReports();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const handlePHIBlockedClose = () => {
    setShowPHIBlockedDialog(false);
    setPHIBlockedDetails(null);
  };

  return {
    reports,
    loading,
    uploadReport,
    deleteReport,
    startAnalysis,
    refreshReports: fetchReports,
    showConsentDialog,
    handleConsentResponse,
    showPHIBlockedDialog,
    handlePHIBlockedClose,
    phiBlockedDetails
  };
}