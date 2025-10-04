// Quest Diagnostics lab report parser
// Handles Quest-specific formatting and layout

import { LabMarker, LabSection, ParsedLabReport, PatientInfo } from '../types.ts';

export function parseQuestLabReport(text: string): ParsedLabReport {
  const sections: LabSection[] = [];
  const warnings: string[] = [];

  // Verify this is a Quest report
  if (!isQuestReport(text)) {
    warnings.push('Document does not appear to be a Quest Diagnostics report');
  }

  // Extract patient info
  const patient = extractQuestPatientInfo(text);

  // Extract lab sections and markers
  const extractedSections = extractQuestSections(text);

  return {
    success: true,
    provider: {
      name: 'Quest',
      labNumber: extractLabNumber(text),
    },
    patient,
    sections: extractedSections,
    rawText: text,
    metadata: {
      totalMarkers: extractedSections.reduce((sum, s) => sum + s.markers.length, 0),
      confidence: 'high',
      parserUsed: 'quest',
      extractionMethod: 'pdf-text',
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  };
}

function isQuestReport(text: string): boolean {
  const questIndicators = [
    /quest diagnostics/i,
    /quest\s+diagnostics/i,
    /questdiagnostics\.com/i,
  ];

  return questIndicators.some(pattern => pattern.test(text));
}

function extractLabNumber(text: string): string | undefined {
  // Quest typically has: "Lab Number: 12345678"
  const match = text.match(/lab\s+(?:number|#)[:\s]+([A-Z0-9\-]+)/i);
  return match ? match[1] : undefined;
}

function extractQuestPatientInfo(text: string): PatientInfo {
  const info: PatientInfo = {};

  // Quest format often has:
  // DOB: MM/DD/YYYY
  // Age: XX
  // Sex: M/F
  // Collected: MM/DD/YYYY

  const dobMatch = text.match(/(?:DOB|date of birth)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (dobMatch) {
    info.dateOfBirth = dobMatch[1];
  }

  const ageMatch = text.match(/age[:\s]+(\d+)/i);
  if (ageMatch) {
    info.age = parseInt(ageMatch[1]);
  }

  const sexMatch = text.match(/sex[:\s]+(male|female|m|f)/i);
  if (sexMatch) {
    const sex = sexMatch[1].toUpperCase();
    info.sex = sex === 'M' || sex === 'MALE' ? 'M' : 'F';
  }

  const collectedMatch = text.match(/(?:collected?|specimen)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (collectedMatch) {
    info.specimenDate = collectedMatch[1];
  }

  const reportedMatch = text.match(/(?:reported?|result)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  if (reportedMatch) {
    info.reportDate = reportedMatch[1];
  }

  return info;
}

function extractQuestSections(text: string): LabSection[] {
  const sections: LabSection[] = [];
  const lines = text.split('\n');

  let currentSection: LabSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if this is a section header
    // Quest often uses all caps for sections
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
      const marker = parseQuestMarker(line, lines[i + 1]);
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
    /^[A-Z\s]{10,}$/,  // All caps, reasonably long
    /^(CBC|CMP|BMP|LIPID PANEL|THYROID|COMPREHENSIVE|METABOLIC)/i,
    /PANEL$/i,
    /PROFILE$/i,
  ];

  return sectionPatterns.some(pattern => pattern.test(line));
}

function parseQuestMarker(line: string, nextLine?: string): LabMarker | null {
  // Quest format typically:
  // Test Name    Result    Units    Reference Range    Flag
  // or
  // Test Name                     Result      Units
  // Reference Range: XX-YY

  // Pattern 1: Everything on one line
  const pattern1 = /^([A-Za-z0-9\s\-\(\),]+?)\s+([\d\.<>]+)\s+([a-zA-Z\/\%\*]+)\s+([\d\.\-\s<>]+)\s*([HL\*]*)\s*$/;
  const match1 = line.match(pattern1);

  if (match1) {
    const [, name, value, unit, range, flag] = match1;

    const marker: LabMarker = {
      name: name.trim(),
      value: parseValue(value),
      unit: unit.trim(),
      referenceRange: parseReferenceRange(range.trim()),
    };

    if (flag && flag.trim()) {
      marker.flags = [flag.trim()];
      marker.status = flag.includes('H') ? 'high' : flag.includes('L') ? 'low' : 'normal';
    }

    return marker;
  }

  // Pattern 2: Multi-line format
  const nameMatch = line.match(/^([A-Za-z0-9\s\-\(\),]+?)\s+([\d\.<>]+)\s+([a-zA-Z\/\%\*]+)\s*([HL\*]*)\s*$/);
  if (nameMatch && nextLine) {
    const rangeMatch = nextLine.match(/(?:reference|ref)[:\s]+([\d\.\-\s<>]+)/i);
    if (rangeMatch) {
      const [, name, value, unit, flag] = nameMatch;

      const marker: LabMarker = {
        name: name.trim(),
        value: parseValue(value),
        unit: unit.trim(),
        referenceRange: parseReferenceRange(rangeMatch[1].trim()),
      };

      if (flag && flag.trim()) {
        marker.flags = [flag.trim()];
        marker.status = flag.includes('H') ? 'high' : flag.includes('L') ? 'low' : 'normal';
      }

      return marker;
    }
  }

  return null;
}

function parseValue(valueStr: string): number | string {
  // Handle special cases
  if (valueStr.startsWith('<') || valueStr.startsWith('>')) {
    return valueStr;
  }

  const num = parseFloat(valueStr);
  return isNaN(num) ? valueStr : num;
}

function parseReferenceRange(rangeText: string): LabMarker['referenceRange'] {
  const range: LabMarker['referenceRange'] = { text: rangeText };

  // "70-100" or "0.4 - 4.5"
  const dashMatch = rangeText.match(/([\d\.]+)\s*\-\s*([\d\.]+)/);
  if (dashMatch) {
    range.min = parseFloat(dashMatch[1]);
    range.max = parseFloat(dashMatch[2]);
    return range;
  }

  // "< 5" or "<5"
  const lessThanMatch = rangeText.match(/[<]\s*([\d\.]+)/);
  if (lessThanMatch) {
    range.max = parseFloat(lessThanMatch[1]);
    return range;
  }

  // "> 10" or ">10"
  const greaterThanMatch = rangeText.match(/[>]\s*([\d\.]+)/);
  if (greaterThanMatch) {
    range.min = parseFloat(greaterThanMatch[1]);
    return range;
  }

  return range;
}
