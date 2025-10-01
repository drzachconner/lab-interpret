-- Fix search path security issue
DROP FUNCTION IF EXISTS public.extract_catalog_from_text(TEXT);

-- Create proper function with search path
CREATE OR REPLACE FUNCTION public.extract_catalog_from_text(input_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function will be used to call our edge function for AI extraction
  RETURN '{"extracted": true}'::jsonb;
END;
$$;