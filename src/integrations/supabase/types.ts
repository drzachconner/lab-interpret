export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_lab_interactions: {
        Row: {
          action: string | null
          created_at: string | null
          id: string
          lab_id: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id?: string
          lab_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: string
          lab_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_lab_interactions_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "lab_panels"
            referencedColumns: ["id"]
          },
        ]
      }
      bundleable_labs: {
        Row: {
          draw_fee: number | null
          id: string
          lab_ids: string[] | null
          lab_provider: string
          sample_type: string
        }
        Insert: {
          draw_fee?: number | null
          id?: string
          lab_ids?: string[] | null
          lab_provider: string
          sample_type: string
        }
        Update: {
          draw_fee?: number | null
          id?: string
          lab_ids?: string[] | null
          lab_provider?: string
          sample_type?: string
        }
        Relationships: []
      }
      clinic_usage: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          month_year: string
          overage_reports: number
          reports_limit: number
          reports_used: number
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          month_year: string
          overage_reports?: number
          reports_limit?: number
          reports_used?: number
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          month_year?: string
          overage_reports?: number
          reports_limit?: number
          reports_used?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_usage_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_users: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_users_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          billing_cycle: string | null
          billing_email: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          current_plan_id: string | null
          fullscripts_dispensary_url: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          slug: string
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          billing_cycle?: string | null
          billing_email?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          current_plan_id?: string | null
          fullscripts_dispensary_url?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          billing_cycle?: string | null
          billing_email?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          current_plan_id?: string | null
          fullscripts_dispensary_url?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_current_plan_id_fkey"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      email_reminders: {
        Row: {
          body: string
          created_at: string
          email_type: string
          id: string
          reference_id: string
          scheduled_for: string
          sent_at: string | null
          status: string | null
          subject: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          email_type: string
          id?: string
          reference_id: string
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          subject: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          email_type?: string
          id?: string
          reference_id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      functional_ranges: {
        Row: {
          biomarker_name: string
          category: string | null
          created_at: string | null
          display_name: string | null
          female_optimal_max: number | null
          female_optimal_min: number | null
          high_supplement_recs: Json | null
          id: string
          longevity_target: number | null
          low_supplement_recs: Json | null
          male_optimal_max: number | null
          male_optimal_min: number | null
          optimal_max: number | null
          optimal_min: number | null
          performance_target: number | null
          standard_max: number | null
          standard_min: number | null
          unit: string
        }
        Insert: {
          biomarker_name: string
          category?: string | null
          created_at?: string | null
          display_name?: string | null
          female_optimal_max?: number | null
          female_optimal_min?: number | null
          high_supplement_recs?: Json | null
          id?: string
          longevity_target?: number | null
          low_supplement_recs?: Json | null
          male_optimal_max?: number | null
          male_optimal_min?: number | null
          optimal_max?: number | null
          optimal_min?: number | null
          performance_target?: number | null
          standard_max?: number | null
          standard_min?: number | null
          unit: string
        }
        Update: {
          biomarker_name?: string
          category?: string | null
          created_at?: string | null
          display_name?: string | null
          female_optimal_max?: number | null
          female_optimal_min?: number | null
          high_supplement_recs?: Json | null
          id?: string
          longevity_target?: number | null
          low_supplement_recs?: Json | null
          male_optimal_max?: number | null
          male_optimal_min?: number | null
          optimal_max?: number | null
          optimal_min?: number | null
          performance_target?: number | null
          standard_max?: number | null
          standard_min?: number | null
          unit?: string
        }
        Relationships: []
      }
      future_test_recommendations: {
        Row: {
          created_at: string
          id: string
          lab_panel_id: string
          last_reminder_sent: string | null
          reason: string | null
          recommended_date: string
          reminder_sent: boolean | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lab_panel_id: string
          last_reminder_sent?: string | null
          reason?: string | null
          recommended_date: string
          reminder_sent?: boolean | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lab_panel_id?: string
          last_reminder_sent?: string | null
          reason?: string | null
          recommended_date?: string
          reminder_sent?: boolean | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interpretations: {
        Row: {
          analysis: Json
          created_at: string
          id: string
          lab_order_id: string
          user_id: string
        }
        Insert: {
          analysis: Json
          created_at?: string
          id?: string
          lab_order_id: string
          user_id: string
        }
        Update: {
          analysis?: Json
          created_at?: string
          id?: string
          lab_order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interpretations_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpretations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          created_at: string
          fs_order_id: string | null
          id: string
          panel: string
          raw_result: Json | null
          raw_result_enc: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fs_order_id?: string | null
          id?: string
          panel: string
          raw_result?: Json | null
          raw_result_enc?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fs_order_id?: string | null
          id?: string
          panel?: string
          raw_result?: Json | null
          raw_result_enc?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_panels: {
        Row: {
          age_minimum: number | null
          base_price: number
          biomarkers: string[]
          category: string
          collection_instructions: string | null
          created_at: string
          description: string | null
          draw_fee: number | null
          fasting_required: boolean | null
          fee_justification: string | null
          fullscript_lab_id: string | null
          fullscript_sku: string | null
          id: string
          is_active: boolean | null
          lab_provider: string
          name: string
          optimization_tags: string[] | null
          practitioner_price: number | null
          preparation_instructions: string | null
          retail_price: number | null
          sample_type: string
          states_available: string[] | null
          suggested_service_fee: number | null
          turnaround_days: number | null
          updated_at: string
        }
        Insert: {
          age_minimum?: number | null
          base_price: number
          biomarkers: string[]
          category: string
          collection_instructions?: string | null
          created_at?: string
          description?: string | null
          draw_fee?: number | null
          fasting_required?: boolean | null
          fee_justification?: string | null
          fullscript_lab_id?: string | null
          fullscript_sku?: string | null
          id?: string
          is_active?: boolean | null
          lab_provider?: string
          name: string
          optimization_tags?: string[] | null
          practitioner_price?: number | null
          preparation_instructions?: string | null
          retail_price?: number | null
          sample_type?: string
          states_available?: string[] | null
          suggested_service_fee?: number | null
          turnaround_days?: number | null
          updated_at?: string
        }
        Update: {
          age_minimum?: number | null
          base_price?: number
          biomarkers?: string[]
          category?: string
          collection_instructions?: string | null
          created_at?: string
          description?: string | null
          draw_fee?: number | null
          fasting_required?: boolean | null
          fee_justification?: string | null
          fullscript_lab_id?: string | null
          fullscript_sku?: string | null
          id?: string
          is_active?: boolean | null
          lab_provider?: string
          name?: string
          optimization_tags?: string[] | null
          practitioner_price?: number | null
          preparation_instructions?: string | null
          retail_price?: number | null
          sample_type?: string
          states_available?: string[] | null
          suggested_service_fee?: number | null
          turnaround_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      lab_reports: {
        Row: {
          ai_analysis: Json | null
          biohacking_score: number | null
          clinic_id: string | null
          created_at: string
          description: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          findings: string | null
          functional_analysis: Json | null
          id: string
          optimization_priorities: Json | null
          recommendations: string | null
          status: string
          supplement_protocol_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          biohacking_score?: number | null
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          findings?: string | null
          functional_analysis?: Json | null
          id?: string
          optimization_priorities?: Json | null
          recommendations?: string | null
          status?: string
          supplement_protocol_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          biohacking_score?: number | null
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          findings?: string | null
          functional_analysis?: Json | null
          id?: string
          optimization_priorities?: Json | null
          recommendations?: string | null
          status?: string
          supplement_protocol_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_reports_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_reports_supplement_protocol_id_fkey"
            columns: ["supplement_protocol_id"]
            isOneToOne: false
            referencedRelation: "lab_to_supplement_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_to_supplement_protocols: {
        Row: {
          created_at: string | null
          fullscript_plan_id: string | null
          fullscript_plan_url: string | null
          id: string
          interpretation_id: string | null
          lab_order_id: string | null
          patient_purchased: boolean | null
          patient_viewed_at: string | null
          protocol_description: string | null
          protocol_name: string | null
          purchase_amount: number | null
          sent_to_patient: boolean | null
          supplements: Json | null
        }
        Insert: {
          created_at?: string | null
          fullscript_plan_id?: string | null
          fullscript_plan_url?: string | null
          id?: string
          interpretation_id?: string | null
          lab_order_id?: string | null
          patient_purchased?: boolean | null
          patient_viewed_at?: string | null
          protocol_description?: string | null
          protocol_name?: string | null
          purchase_amount?: number | null
          sent_to_patient?: boolean | null
          supplements?: Json | null
        }
        Update: {
          created_at?: string | null
          fullscript_plan_id?: string | null
          fullscript_plan_url?: string | null
          id?: string
          interpretation_id?: string | null
          lab_order_id?: string | null
          patient_purchased?: boolean | null
          patient_viewed_at?: string | null
          protocol_description?: string | null
          protocol_name?: string | null
          purchase_amount?: number | null
          sent_to_patient?: boolean | null
          supplements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_to_supplement_protocols_interpretation_id_fkey"
            columns: ["interpretation_id"]
            isOneToOne: false
            referencedRelation: "interpretations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_to_supplement_protocols_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          lab_panel_id: string | null
          lab_report_id: string | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          lab_panel_id?: string | null
          lab_report_id?: string | null
          order_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          lab_panel_id?: string | null
          lab_report_id?: string | null
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_lab_panel_id_fkey"
            columns: ["lab_panel_id"]
            isOneToOne: false
            referencedRelation: "lab_panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_lab_report_id_fkey"
            columns: ["lab_report_id"]
            isOneToOne: false
            referencedRelation: "lab_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          authorization_fee: number | null
          clinic_id: string | null
          created_at: string
          draw_fee: number | null
          fullscript_order_id: string | null
          id: string
          lab_fee: number | null
          order_number: string
          order_type: string
          processing_fee: number | null
          status: string
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          authorization_fee?: number | null
          clinic_id?: string | null
          created_at?: string
          draw_fee?: number | null
          fullscript_order_id?: string | null
          id?: string
          lab_fee?: number | null
          order_number: string
          order_type?: string
          processing_fee?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          authorization_fee?: number | null
          clinic_id?: string | null
          created_at?: string
          draw_fee?: number | null
          fullscript_order_id?: string | null
          id?: string
          lab_fee?: number | null
          order_number?: string
          order_type?: string
          processing_fee?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          age_bucket: string | null
          auth_id: string
          created_at: string
          default_discount: number | null
          dispensary_access: boolean | null
          dispensary_url: string | null
          fs_token: string | null
          fullscript_account_id: string | null
          fullscript_patient_id: string | null
          health_goals: Json | null
          id: string
          sex: string | null
          updated_at: string
        }
        Insert: {
          account_type?: string | null
          age_bucket?: string | null
          auth_id: string
          created_at?: string
          default_discount?: number | null
          dispensary_access?: boolean | null
          dispensary_url?: string | null
          fs_token?: string | null
          fullscript_account_id?: string | null
          fullscript_patient_id?: string | null
          health_goals?: Json | null
          id?: string
          sex?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string | null
          age_bucket?: string | null
          auth_id?: string
          created_at?: string
          default_discount?: number | null
          dispensary_access?: boolean | null
          dispensary_url?: string | null
          fs_token?: string | null
          fullscript_account_id?: string | null
          fullscript_patient_id?: string | null
          health_goals?: Json | null
          id?: string
          sex?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          annual_price: number
          created_at: string
          features: Json
          id: string
          is_active: boolean
          monthly_price: number
          monthly_reports: number
          name: string
          overage_price: number
          staff_seats: number | null
          tier: string
        }
        Insert: {
          annual_price: number
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          monthly_price: number
          monthly_reports: number
          name: string
          overage_price: number
          staff_seats?: number | null
          tier: string
        }
        Update: {
          annual_price?: number
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          monthly_price?: number
          monthly_reports?: number
          name?: string
          overage_price?: number
          staff_seats?: number | null
          tier?: string
        }
        Relationships: []
      }
      supplement_orders: {
        Row: {
          created_at: string
          dosage_per_day: string | null
          id: string
          last_reminder_sent: string | null
          order_date: string
          status: string | null
          supplement_name: string
          supply_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage_per_day?: string | null
          id?: string
          last_reminder_sent?: string | null
          order_date?: string
          status?: string | null
          supplement_name: string
          supply_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage_per_day?: string | null
          id?: string
          last_reminder_sent?: string | null
          order_date?: string
          status?: string | null
          supplement_name?: string
          supply_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplement_products: {
        Row: {
          brand: string
          category: string | null
          contraindications: string[] | null
          created_at: string
          deep_link_url: string | null
          description: string | null
          form: string | null
          fullscript_id: string
          id: string
          ingredients: Json | null
          is_active: boolean | null
          name: string
          price_cents: number | null
          size_info: string | null
          updated_at: string
        }
        Insert: {
          brand: string
          category?: string | null
          contraindications?: string[] | null
          created_at?: string
          deep_link_url?: string | null
          description?: string | null
          form?: string | null
          fullscript_id: string
          id?: string
          ingredients?: Json | null
          is_active?: boolean | null
          name: string
          price_cents?: number | null
          size_info?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string
          category?: string | null
          contraindications?: string[] | null
          created_at?: string
          deep_link_url?: string | null
          description?: string | null
          form?: string | null
          fullscript_id?: string
          id?: string
          ingredients?: Json | null
          is_active?: boolean | null
          name?: string
          price_cents?: number | null
          size_info?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      revenue_summary: {
        Row: {
          avg_service_fee: number | null
          month: string | null
          service_fees_earned: number | null
          total_orders: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      extract_catalog_from_text: {
        Args: { input_text: string }
        Returns: Json
      }
      get_clinic_current_usage: {
        Args: { clinic_uuid: string }
        Returns: {
          overage_reports: number
          plan_name: string
          plan_tier: string
          reports_limit: number
          reports_used: number
        }[]
      }
      get_user_clinic: {
        Args: { user_uuid?: string }
        Returns: string
      }
      is_clinic_admin: {
        Args: { clinic_id_param: string }
        Returns: boolean
      }
      lab_orders_get_raw_result: {
        Args: { _key: string; _order_id: string }
        Returns: Json
      }
      lab_orders_set_raw_result: {
        Args: { _json: Json; _key: string; _order_id: string }
        Returns: undefined
      }
      process_email_reminders: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      schedule_future_test_reminder: {
        Args: {
          p_lab_panel_id: string
          p_reason: string
          p_recommended_date: string
          p_user_id: string
        }
        Returns: string
      }
      schedule_supplement_refill_reminder: {
        Args: {
          p_supplement_name: string
          p_supplement_order_id: string
          p_supply_days: number
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
