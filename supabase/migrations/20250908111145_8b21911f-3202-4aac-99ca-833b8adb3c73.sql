-- Create clinics table for multi-tenant architecture
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0ea5e9',
  secondary_color TEXT DEFAULT '#1e293b',
  website_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  fullscripts_dispensary_url TEXT,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
  subscription_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on clinics table
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Create clinic_users table to link users to clinics
CREATE TABLE public.clinic_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'patient' CHECK (role IN ('admin', 'staff', 'patient')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, user_id)
);

-- Enable RLS on clinic_users table
ALTER TABLE public.clinic_users ENABLE ROW LEVEL SECURITY;

-- Add clinic_id to existing tables
ALTER TABLE public.lab_reports ADD COLUMN clinic_id UUID REFERENCES public.clinics(id);
ALTER TABLE public.profiles ADD COLUMN clinic_id UUID REFERENCES public.clinics(id);

-- Create RLS policies for clinics table
CREATE POLICY "Clinic admins can manage their clinic" ON public.clinics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.clinic_users 
    WHERE clinic_id = clinics.id 
    AND user_id = auth.uid() 
    AND role IN ('admin')
  )
);

-- Create RLS policies for clinic_users table  
CREATE POLICY "Users can view their clinic memberships" ON public.clinic_users
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Clinic admins can manage clinic users" ON public.clinic_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.clinic_users cu
    WHERE cu.clinic_id = clinic_users.clinic_id 
    AND cu.user_id = auth.uid() 
    AND cu.role = 'admin'
  )
);

-- Update existing RLS policies to include clinic context
DROP POLICY "Users can view their own lab reports" ON public.lab_reports;
DROP POLICY "Users can create their own lab reports" ON public.lab_reports;
DROP POLICY "Users can update their own lab reports" ON public.lab_reports;  
DROP POLICY "Users can delete their own lab reports" ON public.lab_reports;

CREATE POLICY "Users can view lab reports in their clinic" ON public.lab_reports
FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.clinic_users cu
    WHERE cu.clinic_id = lab_reports.clinic_id 
    AND cu.user_id = auth.uid() 
    AND cu.role IN ('admin', 'staff')
  )
);

CREATE POLICY "Users can create lab reports in their clinic" ON public.lab_reports
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  (clinic_id IS NULL OR EXISTS (
    SELECT 1 FROM public.clinic_users cu
    WHERE cu.clinic_id = lab_reports.clinic_id 
    AND cu.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can update their own lab reports" ON public.lab_reports
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own lab reports" ON public.lab_reports
FOR DELETE
USING (user_id = auth.uid());

-- Create trigger to update clinic updated_at
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get user's clinic
CREATE OR REPLACE FUNCTION public.get_user_clinic(user_uuid UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id 
  FROM public.clinic_users 
  WHERE user_id = user_uuid 
  LIMIT 1;
$$;