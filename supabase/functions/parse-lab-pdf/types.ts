// TypeScript types for structured lab data
// lab-interpret - BiohackLabs.ai

export interface LabMarker {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: {
    min?: number;
    max?: number;
    text?: string; // For non-numeric ranges like "Negative" or "Normal"
  };
  optimalRange?: {
    min?: number;
    max?: number;
    text?: string;
  };
  status?: 'low' | 'normal' | 'high' | 'optimal' | 'suboptimal' | 'critical';
  flags?: string[]; // e.g., ['H', 'L', '*']
}

export interface LabSection {
  sectionName: string;
  markers: LabMarker[];
}

export interface PatientInfo {
  patientId?: string;
  age?: number;
  sex?: 'M' | 'F' | 'Male' | 'Female';
  dateOfBirth?: string;
  specimenDate?: string;
  reportDate?: string;
}

export interface LabProvider {
  name: string; // 'Quest', 'LabCorp', 'Generic'
  labNumber?: string;
  physicianName?: string;
  orderingFacility?: string;
}

export interface ParsedLabReport {
  success: boolean;
  provider: LabProvider;
  patient?: PatientInfo;
  sections: LabSection[];
  rawText?: string;
  metadata: {
    totalMarkers: number;
    confidence: 'high' | 'medium' | 'low';
    parserUsed: 'quest' | 'labcorp' | 'generic';
    extractionMethod: 'pdf-text' | 'ocr' | 'manual';
    warnings?: string[];
  };
}

export interface PDFParseRequest {
  fileUrl: string;
  storageBucket?: string;
  orderId?: string;
}

export interface PDFParseError {
  success: false;
  error: string;
  details?: string;
}

export type PDFParseResponse = ParsedLabReport | PDFParseError;
