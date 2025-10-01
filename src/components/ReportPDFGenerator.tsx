import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText } from 'lucide-react';

interface ReportPDFGeneratorProps {
  interpretationId: string;
  open: boolean;
  onClose: () => void;
}

interface PatientContext {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  mrn?: string;
}

export function ReportPDFGenerator({ interpretationId, open, onClose }: ReportPDFGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [patientContext, setPatientContext] = useState<PatientContext>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    mrn: ''
  });
  
  const { toast } = useToast();

  const handleGeneratePDF = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-report-pdf', {
        body: {
          interpretationId,
          patientContext
        }
      });

      if (error) throw error;

      if (data.success) {
        // Create a blob from the HTML content and trigger download
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lab-report-${interpretationId.slice(0, 8)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Report generated successfully",
          description: "Your HIPAA-compliant lab report has been downloaded."
        });

        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Report generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate PDF Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">🔒 HIPAA-Compliant Process</h3>
            <p className="text-sm text-blue-800">
              Your AI analysis was performed on de-identified data. This form allows you to re-attach 
              patient context for the final report generation. The AI never saw any personal identifiers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Patient Name</Label>
              <Input
                id="name"
                value={patientContext.name}
                onChange={(e) => setPatientContext(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter patient name"
              />
            </div>
            
            <div>
              <Label htmlFor="mrn">Medical Record Number</Label>
              <Input
                id="mrn"
                value={patientContext.mrn}
                onChange={(e) => setPatientContext(prev => ({ ...prev, mrn: e.target.value }))}
                placeholder="Enter MRN"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={patientContext.email}
                onChange={(e) => setPatientContext(prev => ({ ...prev, email: e.target.value }))}
                placeholder="patient@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={patientContext.phone}
                onChange={(e) => setPatientContext(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={patientContext.dateOfBirth}
                onChange={(e) => setPatientContext(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={patientContext.address}
              onChange={(e) => setPatientContext(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter patient address"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleGeneratePDF} 
              disabled={loading}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Generating...' : 'Generate PDF Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}