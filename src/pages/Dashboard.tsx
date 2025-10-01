import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUp, FileText, Clock, CheckCircle, Brain, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Check if file is PDF or image
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (validTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or image file",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload your lab results first",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lab-results')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create order and redirect to payment
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a simplified order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_type: 'interpretation',
          status: 'pending',
          total_amount: 19.00,
          lab_file_url: uploadData.path
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Redirect to Stripe payment
      navigate(`/payment?orderId=${order.id}`);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload lab results",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Your Lab Results</h1>
          <p className="text-gray-600">Get functional medicine analysis using optimal health ranges</p>
        </div>
        
        <Card className="border-2 hover:border-blue-200 transition-colors">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Functional Medicine AI Analysis
            </CardTitle>
            <CardDescription>
              Our proprietary AI evaluates your labs against optimal functional ranges, not just disease markers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Upload Section with Drag and Drop */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileUp className={`h-12 w-12 mx-auto mb-4 ${dragActive ? 'text-blue-600' : 'text-blue-500'}`} />
              <p className="text-lg mb-4 font-medium">
                {dragActive ? 'Drop your file here' : 'Drop your lab PDF or image here'}
              </p>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
                type="button"
              >
                Choose File
              </Button>
              {file && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ {file.name} ready for analysis
                  </p>
                </div>
              )}
            </div>

            {/* What You Get - Visual Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Functional Ranges</p>
                  <p className="text-xs text-gray-600">Optimal zones for peak performance</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">AI Insights</p>
                  <p className="text-xs text-gray-600">Personalized health optimization</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Visual Reports</p>
                  <p className="text-xs text-gray-600">Interactive charts & graphs</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">25% Discount</p>
                  <p className="text-xs text-gray-600">On all recommended supplements</p>
                </div>
              </div>
            </div>

            {/* AI Training Badge */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm mb-1">Trained on Functional Medicine</h3>
                  <p className="text-xs text-gray-600">
                    Our AI uses protocols from leading functional medicine experts, 
                    biohacking research, and longevity science to analyze your results.
                  </p>
                </div>
                <Badge className="bg-purple-600">Advanced AI</Badge>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {uploading ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Payment ($19)
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-gray-600">
            <div className="text-2xl font-bold text-blue-600">1000+</div>
            <div className="text-sm">Labs Analyzed</div>
          </div>
          <div className="text-gray-600">
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-sm">User Satisfaction</div>
          </div>
          <div className="text-gray-600">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm">AI Analysis</div>
          </div>
        </div>

        {/* Previous Reports */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Previous Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* This would be populated with actual reports from the database */}
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No reports yet</p>
              <p className="text-sm mt-1">Upload your first lab results above to get started!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;