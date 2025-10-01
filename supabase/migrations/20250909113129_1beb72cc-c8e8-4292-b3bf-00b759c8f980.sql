-- Fix search_path security warning for is_clinic_admin function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;