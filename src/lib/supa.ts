// src/lib/supa.ts
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

// Extended Database type with new tables
export type ExtendedDatabase = Database & {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      lab_panels: {
        Row: {
          id: string
          fullscript_lab_id: string | null
          name: string
          description: string | null
          base_price: number
          suggested_service_fee: number
          optimization_tags: string[]
          category: string
          biomarkers: string[]
          fasting_required: boolean
          turnaround_days: number
          sample_type: string
          lab_provider: string
          is_active: boolean
          created_at: string
          updated_at: string
          practitioner_price: number | null
          retail_price: number | null
          age_minimum: number | null
          draw_fee: number | null
          fullscript_sku: string | null
          fee_justification: string | null
          collection_instructions: string | null
          preparation_instructions: string | null
          states_available: string[] | null
        }
      }
      functional_ranges: {
        Row: {
          id: string
          biomarker_name: string
          display_name: string | null
          category: string | null
          unit: string
          standard_min: number | null
          standard_max: number | null
          optimal_min: number | null
          optimal_max: number | null
          male_optimal_min: number | null
          male_optimal_max: number | null
          female_optimal_min: number | null
          female_optimal_max: number | null
          performance_target: number | null
          longevity_target: number | null
          low_supplement_recs: any | null
          high_supplement_recs: any | null
          created_at: string | null
        }
      }
    }
  }
}
import {
  ProfileZ, ProfileT,
  LabOrderZ, LabOrderT,
  InterpretationZ, InterpretationT,
  CreateProfileInputZ, CreateProfileInput,
  CreateLabOrderInputZ, CreateLabOrderInput,
  CreateInterpretationInputZ, CreateInterpretationInput,
} from '@/types/zod';

// Direct types from Supabase for safe operations
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type LabOrderRow = Database['public']['Tables']['lab_orders']['Row'];
type InterpretationRow = Database['public']['Tables']['interpretations']['Row'];

/** Minimal "parse or throw" helper - validates and ensures type safety */
function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const out = schema.safeParse(data);
  if (!out.success) {
    console.error('Validation error:', out.error.format());
    throw new Error('ValidationError: ' + JSON.stringify(out.error.format()));
  }
  return out.data;
}

export const db = {
  // ------ PROFILES ------
  async getMyProfile(): Promise<ProfileT | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data ? parse(ProfileZ, data) : null;
  },

  async createMyProfile(input: CreateProfileInput): Promise<ProfileT> {
    // Ensure current user matches auth_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== input.auth_id) {
      throw new Error('NotAuthenticatedOrMismatchedAuthId');
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        auth_id: input.auth_id,
        sex: input.sex,
        age_bucket: input.age_bucket,
      })
      .select('*')
      .single();

    if (error) throw error;
    return parse(ProfileZ, data);
  },

  async updateMyProfile(updates: Partial<Pick<ProfileRow, 'sex' | 'age_bucket'>>): Promise<ProfileT> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('NotAuthenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('auth_id', user.id)
      .select('*')
      .single();

    if (error) throw error;
    return parse(ProfileZ, data);
  },

  // ------ LAB ORDERS ------
  async listMyOrders(): Promise<LabOrderT[]> {
    const profile = await db.getMyProfile();
    if (!profile) throw new Error('NoProfile');

    const { data, error } = await supabase
      .from('lab_orders')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(d => parse(LabOrderZ, d));
  },

  async getOrder(orderId: string): Promise<LabOrderT | null> {
    const { data, error } = await supabase
      .from('lab_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) throw error;
    return data ? parse(LabOrderZ, data) : null;
  },

  async createOrder(input: CreateLabOrderInput): Promise<LabOrderT> {
    const { data, error } = await supabase
      .from('lab_orders')
      .insert({
        user_id: input.user_id,
        panel: input.panel,
        status: input.status || 'created',
        fs_order_id: input.fs_order_id,
      })
      .select('*')
      .single();
    if (error) throw error;
    return parse(LabOrderZ, data);
  },

  async updateOrderStatus(orderId: string, status: string): Promise<LabOrderT> {
    const { data, error } = await supabase
      .from('lab_orders')
      .update({ status })
      .eq('id', orderId)
      .select('*')
      .single();
    if (error) throw error;
    return parse(LabOrderZ, data);
  },

  // ------ INTERPRETATIONS ------
  async listMyInterpretations(): Promise<InterpretationT[]> {
    const profile = await db.getMyProfile();
    if (!profile) throw new Error('NoProfile');

    const { data, error } = await supabase
      .from('interpretations')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(d => parse(InterpretationZ, d));
  },

  async getInterpretation(id: string): Promise<InterpretationT | null> {
    const { data, error } = await supabase
      .from('interpretations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? parse(InterpretationZ, data) : null;
  },

  async createInterpretation(input: CreateInterpretationInput): Promise<InterpretationT> {
    const { data, error } = await supabase
      .from('interpretations')
      .insert({
        user_id: input.user_id,
        lab_order_id: input.lab_order_id,
        analysis: input.analysis as any, // Cast to any to match Json type
      })
      .select('*')
      .single();
    if (error) throw error;
    return parse(InterpretationZ, data);
  },

  async getInterpretationsByOrder(labOrderId: string): Promise<InterpretationT[]> {
    const { data, error } = await supabase
      .from('interpretations')
      .select('*')
      .eq('lab_order_id', labOrderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(d => parse(InterpretationZ, d));
  },
};