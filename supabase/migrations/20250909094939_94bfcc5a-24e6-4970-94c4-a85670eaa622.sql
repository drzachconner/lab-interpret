-- Fix security warnings by setting search_path for functions
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
SET search_path = public
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

CREATE OR REPLACE FUNCTION increment_clinic_usage()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;