// PDF Lab Report Parser - Edge Function
// Extracts structured data from lab PDFs (Quest, LabCorp, generic)
// BiohackLabs.ai - lab-interpret

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { parseQuestLabReport } from './parsers/quest.ts';
import { parseLabCorpReport } from './parsers/labcorp.ts';
import { parseGenericLabReport } from './parsers/generic.ts';
import type { PDFParseRequest, PDFParseResponse, ParsedLabReport } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileUrl, storageBucket = 'lab-results', orderId }: PDFParseRequest = await req.json();

    if (!fileUrl) {
      throw new Error('fileUrl is required');
    }

    console.log('[PDF Parser] Processing:', { fileUrl, storageBucket, orderId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the file from storage
    console.log('[PDF Parser] Downloading file from storage...');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(storageBucket)
      .download(fileUrl);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Extract text from PDF
    console.log('[PDF Parser] Extracting text from PDF...');
    const pdfText = await extractTextFromPDF(fileData);

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('No text could be extracted from PDF. File may be scanned or corrupted.');
    }

    console.log('[PDF Parser] Extracted text length:', pdfText.length);

    // Detect lab provider and parse accordingly
    console.log('[PDF Parser] Detecting lab provider...');
    const labProvider = detectLabProvider(pdfText);
    console.log('[PDF Parser] Detected provider:', labProvider);

    let parsedReport: ParsedLabReport;

    switch (labProvider) {
      case 'quest':
        parsedReport = parseQuestLabReport(pdfText);
        break;
      case 'labcorp':
        parsedReport = parseLabCorpReport(pdfText);
        break;
      default:
        parsedReport = parseGenericLabReport(pdfText);
        break;
    }

    console.log('[PDF Parser] Parsing complete:', {
      provider: parsedReport.provider.name,
      totalMarkers: parsedReport.metadata.totalMarkers,
      sections: parsedReport.sections.length,
      confidence: parsedReport.metadata.confidence,
    });

    // Return the parsed data
    const response: PDFParseResponse = parsedReport;

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[PDF Parser] Error:', error);

    const errorResponse: PDFParseResponse = {
      success: false,
      error: error.message,
      details: error.stack,
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/**
 * Extract text from PDF blob
 *
 * NOTE: For Deno environment, we have a few options:
 * 1. Use pdf-parse via npm: import (not ideal, needs npm compatibility)
 * 2. Use pdfjs-dist via esm.sh (better for Deno)
 * 3. Call external service (Google Cloud Document AI, AWS Textract)
 * 4. Simple approach: If PDF is text-based, use pdfjs
 *
 * For now, implementing a basic text extraction that works with most lab PDFs.
 * For scanned PDFs, we'll need OCR in Phase 2.
 */
async function extractTextFromPDF(pdfBlob: Blob): Promise<string> {
  try {
    // TEMPORARY: For initial testing, try to read as text
    // This will work if the PDF has extractable text layers
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Try to extract text streams from PDF
    // PDFs store text in streams between "BT" and "ET" markers
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);

    // Extract text between BT (Begin Text) and ET (End Text) markers
    const textMatches = text.match(/BT\s+(.*?)\s+ET/gs);

    if (textMatches && textMatches.length > 0) {
      // Clean up the extracted text
      let extractedText = textMatches
        .map(match => {
          // Remove PDF operators and extract actual text
          return match
            .replace(/BT|ET/g, '')
            .replace(/\/[A-Z][A-Za-z0-9]*\s+/g, '') // Remove font definitions
            .replace(/[0-9]+\.?[0-9]*\s+[0-9]+\.?[0-9]*\s+Td/g, '') // Remove positioning
            .replace(/[0-9]+\.?[0-9]*\s+TL/g, '') // Remove line spacing
            .replace(/\(([^)]+)\)\s*Tj/g, '$1') // Extract text from Tj operators
            .replace(/\[([^\]]+)\]\s*TJ/g, '$1') // Extract text from TJ operators
            .trim();
        })
        .filter(t => t.length > 0)
        .join('\n');

      return extractedText;
    }

    // Fallback: Try direct text decode (works for some simple PDFs)
    const fallbackText = text
      .replace(/[^\x20-\x7E\n]/g, '') // Keep only printable ASCII and newlines
      .split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n');

    return fallbackText;

  } catch (error) {
    console.error('[PDF Parser] Text extraction error:', error);
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
}

/**
 * Detect which lab provider generated this report
 */
function detectLabProvider(text: string): 'quest' | 'labcorp' | 'generic' {
  const lowerText = text.toLowerCase();

  // Check for Quest Diagnostics
  if (
    lowerText.includes('quest diagnostics') ||
    lowerText.includes('questdiagnostics.com') ||
    /quest\s+diagnostics/i.test(text)
  ) {
    return 'quest';
  }

  // Check for LabCorp
  if (
    lowerText.includes('labcorp') ||
    lowerText.includes('laboratory corporation') ||
    lowerText.includes('labcorp.com')
  ) {
    return 'labcorp';
  }

  // Default to generic parser
  return 'generic';
}
