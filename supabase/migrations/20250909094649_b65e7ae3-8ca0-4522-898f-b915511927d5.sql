-- Create usage tracking table for monthly report limits
CREATE TABLE public.clinic_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: "2024-01"
  reports_used INTEGER NOT NULL DEFAULT 0,
  reports_limit INTEGER NOT NULL DEFAULT 10,
  overage_reports INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, month_year)
);

-- Enable RLS
ALTER TABLE public.clinic_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for clinic usage
CREATE POLICY "Clinic admins can view their usage" ON public.clinic_usage
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM clinic_users cu 
  WHERE cu.clinic_id = clinic_usage.clinic_id 
  AND cu.user_id = auth.uid() 
  AND cu.role = 'admin'
));

CREATE POLICY "System can manage usage" ON public.clinic_usage
FOR ALL
USING (true);

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL UNIQUE,
  monthly_price INTEGER NOT NULL, -- in cents
  annual_price INTEGER NOT NULL, -- in cents
  monthly_reports INTEGER NOT NULL,
  overage_price INTEGER NOT NULL, -- price per extra report in cents
  staff_seats INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert pricing tiers
INSERT INTO public.subscription_plans (name, tier, monthly_price, annual_price, monthly_reports, overage_price, staff_seats, features) VALUES
('Starter', 'starter', 14900, 149000, 10, 900, 1, '["Clinic branding", "Fullscript integration", "Email retest reminders", "PDF export", "Basic support"]'::jsonb),
('Growth', 'growth', 24900, 249000, 40, 700, 3, ["Starter features", "Subdomain (clinic.yourapp.com)", "Custom disclaimers", "Referral QR codes", "Priority support"]'::jsonb),
('Pro', 'pro', 49900, 499000, 120, 500, 10, '["Growth features", "API integrations", "Webhook support", "Custom protocols", "SSO for multi-location", "White-label mobile app"]'::jsonb);

-- Enable RLS for subscription plans (public read)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- Add billing fields to clinics table
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS billing_email TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS current_plan_id UUID REFERENCES public.subscription_plans(id),
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual'));

-- Function to get current usage for a clinic
CREATE OR REPLACE FUNCTION get_clinic_current_usage(clinic_uuid UUID)
RETURNS TABLE (
  reports_used INTEGER,
  reports_limit INTEGER,
  overage_reports INTEGER,
  plan_name TEXT,
  plan_tier TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month TEXT := to_char(now(), 'YYYY-MM');
  usage_record RECORD;
  plan_record RECORD;
BEGIN
  -- Get current usage
  SELECT cu.reports_used, cu.reports_limit, cu.overage_reports 
  INTO usage_record
  FROM clinic_usage cu 
  WHERE cu.clinic_id = clinic_uuid AND cu.month_year = current_month;
  
  -- Get plan info
  SELECT sp.name, sp.tier, sp.monthly_reports
  INTO plan_record
  FROM clinics c
  LEFT JOIN subscription_plans sp ON c.current_plan_id = sp.id
  WHERE c.id = clinic_uuid;
  
  -- Return results
  reports_used := COALESCE(usage_record.reports_used, 0);
  reports_limit := COALESCE(plan_record.monthly_reports, 10); -- Default to starter
  overage_reports := COALESCE(usage_record.overage_reports, 0);
  plan_name := COALESCE(plan_record.name, 'Starter');
  plan_tier := COALESCE(plan_record.tier, 'starter');
  
  RETURN NEXT;
END;
$$;

-- Function to increment usage when a report is processed
CREATE OR REPLACE FUNCTION increment_clinic_usage()
RETURNS TRIGGER AS $$
DECLARE
  current_month TEXT := to_char(now(), 'YYYY-MM');
  clinic_uuid UUID;
  current_limit INTEGER;
BEGIN
  -- Get clinic_id from the new lab report
  clinic_uuid := NEW.clinic_id;
  
  IF clinic_uuid IS NULL THEN
    RETURN NEW; -- Skip if no clinic association
  END IF;
  
  -- Get current plan limit
  SELECT sp.monthly_reports INTO current_limit
  FROM clinics c
  LEFT JOIN subscription_plans sp ON c.current_plan_id = sp.id
  WHERE c.id = clinic_uuid;
  
  current_limit := COALESCE(current_limit, 10); -- Default to starter limit
  
  -- Upsert usage record
  INSERT INTO clinic_usage (clinic_id, month_year, reports_used, reports_limit)
  VALUES (clinic_uuid, current_month, 1, current_limit)
  ON CONFLICT (clinic_id, month_year)
  DO UPDATE SET
    reports_used = clinic_usage.reports_used + 1,
    reports_limit = current_limit,
    overage_reports = GREATEST(0, clinic_usage.reports_used + 1 - current_limit),
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically track usage when lab reports are processed
CREATE TRIGGER track_lab_report_usage
  AFTER UPDATE ON lab_reports
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION increment_clinic_usage();