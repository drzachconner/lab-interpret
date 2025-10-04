// LabCorp lab report parser
// Handles LabCorp-specific formatting and layout

import { LabMarker, LabSection, ParsedLabReport, PatientInfo } from '../types.ts';

export function parseLabCorpReport(text: string): ParsedLabReport {
  const sections: LabSection[] = [];
  const warnings: string[] = [];

  // Verify this is a LabCorp report
  if (!isLabCorpReport(text)) {
    warnings.push('Document does not appear to be a LabCorp report');
  }

  // Extract patient info
  const patient = extractLabCorpPatientInfo(text);

  // Extract lab sections and markers
  const extractedSections = extractLabCorpSections(text);

  return {
    success: true,
    provider: {
      name: 'LabCorp',
      labNumber: extractLabNumber(text),
    },
    patient,
    sections: extractedSections,
    rawText: text,
    metadata: {
      totalMarkers: extractedSections.reduce((sum, s) => sum + s.markers.length, 0),
      confidence: 'high',
      parserUsed: 'labcorp',
      extractionMethod: 'pdf-text',
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  };
}

function isLabCorpReport(text: string): boolean {
  const labcorpIndicators = [
    /labcorp/i,
    /laboratory corporation/i,
    /labcorp\.com/i,
  ];

  return labcorpIndicators.some(pattern => pattern.test(text));
}

function extractLabNumber(text: string): string | undefined {
  // LabCorp typically has: "Specimen ID: 12345678"
  const match = text.match(/specimen\s+id[:\s]+([A-Z0-9\-]+)/i);
  return match ? match[1] : undefined;
}

function extractLabCorpPatientInfo(text: string): PatientInfo {
  const info: PatientInfo = {};

  const dobMatch = text.match(/(?:DOB|birth date)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (dobMatch) {
    info.dateOfBirth = dobMatch[1];
  }

  const ageMatch = text.match(/age[:\s]+(\d+)/i);
  if (ageMatch) {
    info.age = parseInt(ageMatch[1]);
  }

  const sexMatch = text.match(/(?:sex|gender)[:\s]+(male|female|m|f)/i);
  if (sexMatch) {
    const sex = sexMatch[1].toUpperCase();
    info.sex = sex === 'M' || sex === 'MALE' ? 'M' : 'F';
  }

  const collectedMatch = text.match(/(?:collected?|draw date)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (collectedMatch) {
    info.specimenDate = collectedMatch[1];
  }

  const reportedMatch = text.match(/(?:reported?|result date)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (reportedMatch) {
    info.reportDate = reportedMatch[1];
  }

  return info;
}

function extractLabCorpSections(text: string): LabSection[] {
  const sections: LabSection[] = [];
  const lines = text.split('\n');

  let currentSection: LabSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // LabCorp often uses specific keywords
    if (isSectionHeader(line)) {
      if (currentSection && currentSection.markers.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        sectionName: line.replace(/[:\s]+$/, ''),
        markers: [],
      };
      continue;
    }

    // Try to parse as a lab marker
    if (currentSection) {
      const marker = parseLabCorpMarker(line);
      if (marker) {
        currentSection.markers.push(marker);
      }
    }
  }

  // Add the last section
  if (currentSection && currentSection.markers.length > 0) {
    sections.push(currentSection);
  }

  // If no sections found, create a default one
  if (sections.length === 0) {
    sections.push({
      sectionName: 'Lab Results',
      markers: [],
    });
  }

  return sections;
}

function isSectionHeader(line: string): boolean {
  const sectionPatterns = [
    /^[A-Z\s]{10,}$/,
    /^(COMPLETE BLOOD COUNT|CBC|COMPREHENSIVE METABOLIC|CMP|BASIC METABOLIC|BMP)/i,
    /PANEL$/i,
    /PROFILE$/i,
    /^LIPID/i,
    /^THYROID/i,
  ];

  return sectionPatterns.some(pattern => pattern.test(line));
}

function parseLabCorpMarker(line: string): LabMarker | null {
  // LabCorp format typically:
  // Test Name    Result    Flag    Units    Reference Interval

  const pattern = /^([A-Za-z0-9\s\-\(\),\.]+?)\s+([\d\.<>]+)\s*([HL\*]*)\s+([a-zA-Z\/\%\*]+)\s+([\d\.\-\s<>]+)/;
  const match = line.match(pattern);

  if (match) {
    const [, name, value, flag, unit, range] = match;

    const marker: LabMarker = {
      name: name.trim(),
      value: parseValue(value),
      unit: unit.trim(),
      referenceRange: parseReferenceRange(range.trim()),
    };

    if (flag && flag.trim()) {
      marker.flags = [flag.trim()];
      marker.status = flag.includes('H') ? 'high' : flag.includes('L') ? 'low' : 'normal';
    } else {
      // Determine status from value vs range
      if (typeof marker.value === 'number') {
        marker.status = determineStatus(marker.value, marker.referenceRange);
      }
    }

    return marker;
  }

  return null;
}

function parseValue(valueStr: string): number | string {
  if (valueStr.startsWith('<') || valueStr.startsWith('>')) {
    return valueStr;
  }

  const num = parseFloat(valueStr);
  return isNaN(num) ? valueStr : num;
}

function parseReferenceRange(rangeText: string): LabMarker['referenceRange'] {
  const range: LabMarker['referenceRange'] = { text: rangeText };

  const dashMatch = rangeText.match(/([\d\.]+)\s*\-\s*([\d\.]+)/);
  if (dashMatch) {
    range.min = parseFloat(dashMatch[1]);
    range.max = parseFloat(dashMatch[2]);
    return range;
  }

  const lessThanMatch = rangeText.match(/[<]\s*([\d\.]+)/);
  if (lessThanMatch) {
    range.max = parseFloat(lessThanMatch[1]);
    return range;
  }

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
