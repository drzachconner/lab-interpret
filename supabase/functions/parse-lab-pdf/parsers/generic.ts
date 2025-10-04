// Generic lab report parser
// Handles common lab report formats when specific provider isn't detected

import { LabMarker, LabSection, ParsedLabReport, PatientInfo } from '../types.ts';

export function parseGenericLabReport(text: string): ParsedLabReport {
  const sections: LabSection[] = [];
  const warnings: string[] = [];

  // Extract patient info
  const patient = extractPatientInfo(text);

  // Find all potential lab markers
  const markers = extractMarkers(text);

  if (markers.length === 0) {
    warnings.push('No lab markers detected in document');
  }

  // Group markers into sections
  const groupedMarkers = groupMarkersBySection(markers, text);

  return {
    success: true,
    provider: {
      name: 'Generic',
    },
    patient,
    sections: groupedMarkers,
    rawText: text,
    metadata: {
      totalMarkers: markers.length,
      confidence: markers.length > 0 ? 'medium' : 'low',
      parserUsed: 'generic',
      extractionMethod: 'pdf-text',
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  };
}

function extractPatientInfo(text: string): PatientInfo {
  const info: PatientInfo = {};

  // Try to find age
  const ageMatch = text.match(/age[:\s]+(\d+)/i) || text.match(/(\d+)\s*y(?:ea)?r(?:s)?(?:\s+old)?/i);
  if (ageMatch) {
    info.age = parseInt(ageMatch[1]);
  }

  // Try to find sex
  const sexMatch = text.match(/sex[:\s]+(male|female|m|f)/i);
  if (sexMatch) {
    const sex = sexMatch[1].toUpperCase();
    info.sex = sex === 'M' || sex === 'MALE' ? 'M' : 'F';
  }

  // Try to find collection date
  const dateMatch = text.match(/(?:collected?|specimen|draw)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (dateMatch) {
    info.specimenDate = dateMatch[1];
  }

  return info;
}

function extractMarkers(text: string): LabMarker[] {
  const markers: LabMarker[] = [];
  const lines = text.split('\n');

  // Common lab marker patterns
  // Example: "Glucose    95    mg/dL    70-100"
  // Example: "TSH    2.5    mIU/L    0.4-4.5"
  const markerPattern = /^([A-Za-z0-9\s\-\(\)]+?)\s+([\d\.]+)\s+([a-zA-Z\/\%]+)\s+([\d\.\-\s<>]+)/;

  for (const line of lines) {
    const match = line.trim().match(markerPattern);
    if (match) {
      const [, name, value, unit, range] = match;

      const marker: LabMarker = {
        name: name.trim(),
        value: parseFloat(value),
        unit: unit.trim(),
        referenceRange: parseReferenceRange(range.trim()),
      };

      // Determine status
      marker.status = determineStatus(marker.value as number, marker.referenceRange);

      markers.push(marker);
    }
  }

  return markers;
}

function parseReferenceRange(rangeText: string): LabMarker['referenceRange'] {
  // Handle various formats:
  // "70-100", "< 5", "> 10", "0.4 - 4.5"

  const range: LabMarker['referenceRange'] = { text: rangeText };

  // Check for range with dash
  const dashMatch = rangeText.match(/([\d\.]+)\s*\-\s*([\d\.]+)/);
  if (dashMatch) {
    range.min = parseFloat(dashMatch[1]);
    range.max = parseFloat(dashMatch[2]);
    return range;
  }

  // Check for less than
  const lessThanMatch = rangeText.match(/[<]\s*([\d\.]+)/);
  if (lessThanMatch) {
    range.max = parseFloat(lessThanMatch[1]);
    return range;
  }

  // Check for greater than
  const greaterThanMatch = rangeText.match(/[>]\s*([\d\.]+)/);
  if (greaterThanMatch) {
    range.min = parseFloat(greaterThanMatch[1]);
    return range;
  }

  return range;
}

function determineStatus(
  value: number,
  range: LabMarker['referenceRange']
): LabMarker['status'] {
  if (range.min !== undefined && value < range.min) {
    return 'low';
  }
  if (range.max !== undefined && value > range.max) {
    return 'high';
  }
  if (range.min !== undefined && range.max !== undefined) {
    return 'normal';
  }
  return undefined;
}

function groupMarkersBySection(markers: LabMarker[], text: string): LabSection[] {
  // Try to find section headers in the text
  const sections: LabSection[] = [];

  // Common section names
  const sectionNames = [
    'Complete Blood Count',
    'CBC',
    'Comprehensive Metabolic Panel',
    'CMP',
    'Basic Metabolic Panel',
    'BMP',
    'Lipid Panel',
    'Thyroid Panel',
    'Liver Function',
    'Kidney Function',
    'Electrolytes',
    'Vitamins',
    'Hormones',
  ];

  // If we can't find sections, put everything in "General"
  if (markers.length > 0) {
    sections.push({
      sectionName: 'Lab Results',
      markers,
    });
  }

  return sections;
}
