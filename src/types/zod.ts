// src/types/zod.ts
import { z } from 'zod';

export const SexZ = z.enum(['Male', 'Female', 'Other', 'Unknown']);
export const OrderStatusZ = z.enum(['created', 'authorized', 'collected', 'resulted', 'failed']);

export const ProfileZ = z.object({
  id: z.string().uuid(),
  auth_id: z.string().uuid(),
  sex: z.string().nullable(), // matches actual DB schema
  age_bucket: z.string().nullable(),
  fs_token: z.string().nullable(),
  fullscript_account_id: z.string().nullable(),
  dispensary_url: z.string().nullable(),
  account_type: z.string().nullable(),
  dispensary_access: z.boolean().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ProfileT = z.infer<typeof ProfileZ>;

export const LabOrderZ = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  panel: z.string().min(1),
  status: z.string(), // matches actual DB schema (not strictly typed)
  fs_order_id: z.string().nullable(),
  raw_result: z.unknown().nullable(),
  raw_result_enc: z.string().nullable(), // encrypted column
  created_at: z.string(),
  updated_at: z.string(),
});
export type LabOrderT = z.infer<typeof LabOrderZ>;

export const InterpretationZ = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  lab_order_id: z.string().uuid(),
  analysis: z.unknown(),
  created_at: z.string(),
});
export type InterpretationT = z.infer<typeof InterpretationZ>;

// Useful payload shapes
export const CreateProfileInputZ = z.object({
  auth_id: z.string().uuid(),
  sex: z.string().optional(),
  age_bucket: z.string().optional(),
});
export type CreateProfileInput = z.infer<typeof CreateProfileInputZ>;

export const CreateLabOrderInputZ = z.object({
  user_id: z.string().uuid(),
  panel: z.string().min(1),
  status: z.string().default('created'),
  fs_order_id: z.string().optional(),
  // raw_result is set by server after parsing/upload
});
export type CreateLabOrderInput = z.infer<typeof CreateLabOrderInputZ>;

export const CreateInterpretationInputZ = z.object({
  user_id: z.string().uuid(),
  lab_order_id: z.string().uuid(),
  analysis: z.unknown(),
});
export type CreateInterpretationInput = z.infer<typeof CreateInterpretationInputZ>;