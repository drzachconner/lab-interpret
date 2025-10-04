# PDF Lab Report Parser

Supabase Edge Function that extracts structured data from lab PDF reports.

## Features

- ✅ **Multi-Provider Support**: Quest Diagnostics, LabCorp, Generic
- ✅ **Structured Data Extraction**: Markers, values, reference ranges, units
- ✅ **Format Detection**: Automatically detects lab provider format
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Error Handling**: Comprehensive error messages and warnings

## Architecture

```
parse-lab-pdf/
├── index.ts              # Main handler
├── types.ts              # TypeScript type definitions
├── parsers/
│   ├── quest.ts         # Quest Diagnostics parser
│   ├── labcorp.ts       # LabCorp parser
│   └── generic.ts       # Fallback generic parser
└── README.md            # This file
```

## How It Works

1. **Download PDF** - Retrieves PDF from Supabase Storage
2. **Extract Text** - Extracts text from PDF (text-based PDFs only for now)
3. **Detect Provider** - Identifies Quest, LabCorp, or uses generic parser
4. **Parse Markers** - Extracts lab markers, values, units, and reference ranges
5. **Structure Data** - Returns JSON with sections and metadata
6. **Return Results** - Structured data ready for AI analysis

## Input Format

```typescript
{
  "fileUrl": "path/to/file.pdf",
  "storageBucket": "lab-results",  // optional, defaults to "lab-results"
  "orderId": "uuid"                // optional, for logging
}
```

## Output Format

```typescript
{
  "success": true,
  "provider": {
    "name": "Quest" | "LabCorp" | "Generic",
    "labNumber": "12345678"
  },
  "patient": {
    "age": 35,
    "sex": "F",
    "specimenDate": "01/15/2024"
  },
  "sections": [
    {
      "sectionName": "Complete Blood Count",
      "markers": [
        {
          "name": "Hemoglobin",
          "value": 13.5,
          "unit": "g/dL",
          "referenceRange": {
            "min": 12.0,
            "max": 16.0,
            "text": "12.0-16.0"
          },
          "status": "normal",
          "flags": []
        }
      ]
    }
  ],
  "metadata": {
    "totalMarkers": 15,
    "confidence": "high",
    "parserUsed": "quest",
    "extractionMethod": "pdf-text"
  }
}
```

## Supported Lab Formats

### Quest Diagnostics
- Standard lab reports
- Multi-page comprehensive panels
- CBC, CMP, BMP, Lipid Panels, Thyroid, etc.

### LabCorp
- Standard lab reports
- Comprehensive metabolic panels
- All major lab panels

### Generic
- Fallback for unknown providers
- Best-effort extraction
- Works with most standardized lab formats

## Current Limitations

⚠️ **Text-Based PDFs Only** - Currently only works with PDFs that have extractable text layers. Scanned PDFs (images) will fail.

**Planned Enhancements:**
- OCR support for scanned PDFs (Phase 2)
- More lab providers (ARUP, Mayo Clinic, etc.)
- Improved confidence scoring
- Better section detection

## Deployment

```bash
# Deploy this function
supabase functions deploy parse-lab-pdf

# Test locally
supabase functions serve parse-lab-pdf
```

## Testing

```bash
# Test with curl
curl -X POST http://localhost:54321/functions/v1/parse-lab-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrl": "user-id/sample-lab.pdf",
    "storageBucket": "lab-results"
  }'
```

## Error Handling

The function returns structured errors:

```typescript
{
  "success": false,
  "error": "Error message",
  "details": "Stack trace (in dev mode)"
}
```

Common errors:
- `fileUrl is required` - Missing input parameter
- `Failed to download file` - Storage issue
- `No text could be extracted` - Likely a scanned PDF
- `PDF text extraction failed` - Corrupted or encrypted PDF

## Integration

This function is called by `analyze-labs` before sending data to AI:

```typescript
// In analyze-labs/index.ts
const parseResponse = await fetch(`${supabaseUrl}/functions/v1/parse-lab-pdf`, {
  method: 'POST',
  body: JSON.stringify({ fileUrl: order.lab_file_url })
})

const parsedData = await parseResponse.json()
// Now send parsedData to OpenAI/Claude for interpretation
```

## Contributing

To add a new lab provider parser:

1. Create `parsers/provider-name.ts`
2. Implement the parser following existing patterns
3. Add detection logic in `index.ts`
4. Update this README

## License

Part of lab-interpret - BiohackLabs.ai
