-- Fix infinite recursion in clinic_users RLS policies

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Clinic admins can manage clinic users" ON public.clinic_users;

-- Create a safe policy that allows users to view their own memberships
-- and allows system-level operations without recursion
CREATE POLICY "Users can view their own clinic memberships" 
ON public.clinic_users 
FOR SELECT 
USING (user_id = auth.uid());

-- Create a policy for inserting new clinic users (for clinic creation)
CREATE POLICY "Users can insert clinic memberships" 
ON public.clinic_users 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create a function to safely check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_clinic_admin(clinic_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN := FALSE;
BEGIN
  -- Use a direct query with proper isolation to prevent recursion
  SELECT EXISTS(
    SELECT 1 FROM public.clinic_users 
    WHERE clinic_id = clinic_id_param 
    AND user_id = auth.uid() 
    AND role = 'admin'
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a safe policy for clinic admins to manage users using the function
CREATE POLICY "Clinic admins can manage users via function" 
ON public.clinic_users 
FOR ALL 
USING (public.is_clinic_admin(clinic_id));

-- Fix the clinics policy to use the same safe function
DROP POLICY IF EXISTS "Clinic admins can manage their clinic" ON public.clinics;

CREATE POLICY "Clinic admins can manage their clinic" 
ON public.clinics 
FOR ALL 
USING (public.is_clinic_admin(id));

-- Fix the clinic_usage policy 
DROP POLICY IF EXISTS "Clinic admins can view their usage" ON public.clinic_usage;

CREATE POLICY "Clinic admins can view their usage" 
ON public.clinic_usage 
FOR SELECT 
USING (public.is_clinic_admin(clinic_id));