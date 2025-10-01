// src/types/db.ts

export type Sex = 'Male' | 'Female' | 'Other' | 'Unknown';
export type OrderStatus = 'created' | 'authorized' | 'collected' | 'resulted' | 'failed';

export interface Profile {
  id: string;          // uuid
  auth_id: string;     // uuid (auth.users.id)
  sex: string | null;  // matches actual DB schema
  age_bucket: string | null; // e.g., "35-44"
  fs_token: string | null;   // encrypted server-side usage only
  created_at: string;  // ISO datetime
  updated_at: string;  // ISO datetime
}

export interface LabOrder {
  id: string;          // uuid
  user_id: string;     // profiles.id
  panel: string;
  status: string;      // matches actual DB schema (not strictly typed)
  fs_order_id: string | null;
  raw_result: any | null;     // JSON from actual schema
  raw_result_enc: string | null; // encrypted column
  created_at: string;
  updated_at: string;
}

export interface Interpretation {
  id: string;            // uuid
  user_id: string;       // profiles.id
  lab_order_id: string;  // lab_orders.id
  analysis: any;         // JSON blob from LLM (no PHI)
  created_at: string;
}