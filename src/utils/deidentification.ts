/**
 * De-identification utilities for BiohackLabs.ai
 * Phase 1: Strip HIPAA identifiers (Safe Harbor) before any LLM call.
 *
 * WHAT WE ALLOW OUT TO THE LLM:
 *   - pseudonymous patient_id (e.g., "pt_7a4d9f")
 *   - age_bucket (e.g., "35-44")
 *   - sex ("Male" | "Female" | "Other" | "Unknown")
 *   - labs: [{ test, value, unit, ref }]
 *
 * WHAT WE NEVER SEND:
 *   - any of the 18 HIPAA identifiers (see list below)
 *   - free-text fields that contain potential identifiers
 *
 * 18 HIPAA identifiers (Safe Harbor):
 *  1. Names
 *  2. Geographic subdivisions smaller than a state (street, city, county, precinct; ZIP except first 3 digits with special rule)
 *  3. All elements of dates (except year) directly related to an individual (DOB, admission, discharge, death) & all ages over 89 (aggregate as 90+)
 *  4. Telephone numbers
 *  5. Fax numbers
 *  6. Email addresses
 *  7. Social Security numbers
 *  8. Medical record numbers
 *  9. Health plan beneficiary numbers
 * 10. Account numbers
 * 11. Certificate/license numbers
 * 12. Vehicle identifiers and serial numbers, including license plates
 * 13. Device identifiers and serial numbers
 * 14. Web URLs
 * 15. IP address numbers
 * 16. Biometric identifiers (finger/voice prints)
 * 17. Full-face photos and comparable images
 * 18. Any other unique identifying number, characteristic, or code
 */

export type RawLabResult = {
  // POSSIBLE PHI BELOW – DO NOT FORWARD
  patient_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  dob?: string;                  // ISO date string
  date_of_draw?: string;         // ISO date string
  mrn?: string;                  // medical record number
  account_number?: string;
  health_plan_id?: string;
  ip?: string;
  url?: string;

  // Non-PHI demographics you MAY store internally
  sex?: 'Male' | 'Female' | 'Other' | 'Unknown';
  age?: number;                  // years (if present)
  // or birth_year?: number;

  // Free text fields that may contain PHI (will be scrubbed or blocked)
  notes?: string;

  // The part we want to keep for the model:
  labs: Array<{
    test: string;                // e.g., "Glucose", "Ferritin"
    value: number;               // numeric value
    unit?: string;               // "mg/dL"
    ref?: string;                // "70-100"
  }>;
};

export type DeidentifiedPayload = {
  patient_id: string;           // pseudonymous id (never the auth/user id)
  age_bucket: string;           // e.g., "35-44" or "90+"
  sex: 'Male' | 'Female' | 'Other' | 'Unknown';
  labs: Array<{
    test: string;
    value: number;
    unit?: string;
    ref?: string;
  }>;
  // Optional: include context that is NOT PHI
  context?: Record<string, string | number | boolean>;
};

// ------------------------- CONFIG -------------------------

const AGE_BUCKETS = [
  [0, 1], [2, 5], [6, 12], [13, 17],
  [18, 24], [25, 34], [35, 44], [45, 54],
  [55, 64], [65, 74], [75, 89], // 90+ handled separately
] as const;

export function bucketAge(age?: number): string {
  if (age == null || Number.isNaN(age)) return 'Unknown';
  if (age >= 90) return '90+';
  for (const [lo, hi] of AGE_BUCKETS) {
    if (age >= lo && age <= hi) return `${lo}-${hi}`;
  }
  return 'Unknown';
}

// Regex patterns to detect identifiers in free text
const PATTERNS: Record<string, RegExp> = {
  phone: /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/,
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/,
  ip: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)(?:\.|$)){4}\b/,
  url: /\bhttps?:\/\/[^\s]+/i,
  date: /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/,
  zipcode: /\b\d{5}(?:-\d{4})?\b/,
  license: /\b[A-Z0-9]{5,}\b/, // generic catch-all (over-inclusive on purpose)
  nameLike: /\b(Mr\.|Mrs\.|Ms\.|Dr\.|Patient|DOB|SSN|Address|Name)\b/i,
};

// ---------------------- SCRUB / DETECT --------------------

export function scrubFreeText(input?: string): { text: string; flagged: string[] } {
  if (!input) return { text: '', flagged: [] };
  const flagged: string[] = [];
  let text = input;

  for (const [label, regex] of Object.entries(PATTERNS)) {
    if (regex.test(text)) {
      flagged.push(label);
      // Replace matched tokens with [REDACTED]
      text = text.replace(regex, '[REDACTED]');
    }
  }

  // Remove street-level geo cues (super conservative)
  text = text
    .replace(/\b\d{1,5}\s+[A-Za-z0-9.\-'\s]+(Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr|Ct|Court)\b/gi, '[REDACTED]')
    .replace(/\b(?:Apt|Unit|Suite|Ste)\s+#?\w+\b/gi, '[REDACTED]');

  return { text: text.trim(), flagged };
}

export function containsPHI(obj: unknown): string[] {
  const hits: string[] = [];
  const walker = (val: any) => {
    if (val == null) return;
    if (typeof val === 'string') {
      for (const [label, regex] of Object.entries(PATTERNS)) {
        if (regex.test(val)) hits.push(label);
      }
    } else if (Array.isArray(val)) {
      val.forEach(walker);
    } else if (typeof val === 'object') {
      Object.values(val).forEach(walker);
    }
  };
  walker(obj);
  return Array.from(new Set(hits));
}

// ---------------------- CORE TRANSFORM --------------------

export function deidentifyLabPayload(input: RawLabResult, opts?: {
  pseudoId?: string; // supply your own if you have one; else we generate
  context?: Record<string, string | number | boolean>;
}): { safe: DeidentifiedPayload; blocked?: { reason: string; details?: any } } {
  // Block if analytes are missing or non-numeric
  if (!input?.labs || !Array.isArray(input.labs) || input.labs.length === 0) {
    return { safe: {} as any, blocked: { reason: 'No labs' } };
  }

  // Scan dangerous free-text upfront
  const freeTextHits = containsPHI(input.notes);
  // Also scan top-level (in case someone mapped PHI into unexpected fields)
  const topLevelHits = containsPHI({
    patient_name: input.patient_name, email: input.email, phone: input.phone,
    address_line1: input.address_line1, address_line2: input.address_line2,
    city: input.city, state: input.state, postal_code: input.postal_code,
    dob: input.dob, mrn: input.mrn, account_number: input.account_number,
    url: input.url, ip: input.ip,
  });

  if (freeTextHits.length || topLevelHits.length) {
    // You can choose to hard-block OR just scrub and continue.
    // Safer default for Phase 1: hard-block and ask user to remove identifiers.
    return {
      safe: {} as any,
      blocked: {
        reason: 'PHI detected in free text or top-level fields',
        details: { freeTextHits, topLevelHits },
      },
    };
  }

  // Compute age bucket
  // Prefer explicit numeric age; fallback to DOB year if you have it (but DON'T forward full DOB).
  const ageBucket = bucketAge(input.age);

  // Build safe labs (ignore any weird fields or non-numeric values)
  const labs = input.labs
    .filter(l => typeof l.value === 'number' && Number.isFinite(l.value))
    .map(l => ({
      test: String(l.test || '').slice(0, 120),
      value: Number(l.value),
      unit: l.unit ? String(l.unit).slice(0, 32) : undefined,
      ref: l.ref ? String(l.ref).slice(0, 64) : undefined,
    }));

  // Generate a stable pseudonymous id (do NOT reuse auth_id directly)
  const patient_id = opts?.pseudoId ?? `pt_${Math.random().toString(36).slice(2, 8)}`;

  const safe: DeidentifiedPayload = {
    patient_id,
    age_bucket: ageBucket,
    sex: input.sex ?? 'Unknown',
    labs,
    context: opts?.context,
  };

  return { safe };
}
