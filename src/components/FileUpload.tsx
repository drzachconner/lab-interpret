import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { useLabReports } from '@/hooks/useLabReports';

interface FileUploadProps {
  onUploadComplete?: () => void;
}

const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const { uploadReport } = useLabReports();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files && files[0]) {
      const file = files[0];
      if (isValidFileType(file)) {
        setSelectedFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      }
    }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFileType(file)) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const isValidFileType = (file: File) => {
    const allowedTypes = ['application/pdf', 'text/csv', 'image/jpeg', 'image/png', 'image/jpg'];
    return allowedTypes.includes(file.type) || file.name.toLowerCase().endsWith('.csv');
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    try {
      setUploading(true);
      await uploadReport(selectedFile, title.trim(), description.trim() || undefined);
      
      // Reset form
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      onUploadComplete?.();
    } catch (error) {
      // Error handling is done in useLabReports
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="card-medical">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Lab Report
        </CardTitle>
        <CardDescription>
          Upload your lab results in PDF, CSV, or image format for AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : selectedFile 
                ? 'border-secondary bg-secondary/5' 
                : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-secondary/20 rounded-full">
                <File className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-muted rounded-full">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">Drop your lab report here</p>
                <p className="text-muted-foreground">or click to browse files</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports PDF, CSV, JPG, PNG (Max 10MB)
                </p>
              </div>
              <Input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.csv,.jpg,.jpeg,.png"
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" className="transition-medical">
                  Browse Files
                </Button>
              </Label>
            </div>
          )}
        </div>

        {/* Report Details */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete Blood Count - January 2024"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional context or notes about this report..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !title.trim() || uploading}
          className="w-full btn-medical"
          size="lg"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload & Analyze Report
            </>
          )}
        </Button>
        
        {/* Privacy Notice */}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          We de-identify your data before AI analysis and never send names, full dates, or contact info to third-party AI providers.
        </p>
      </CardContent>
    </Card>
  );
};

export default FileUpload;