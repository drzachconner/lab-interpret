-- Fix signup failures caused by old handle_new_user inserting into non-existent profiles.full_name
-- Update function to match current profiles schema and ensure trigger exists.

-- 1) Replace handle_new_user to insert only auth_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create minimal profile row linked to the auth user id
  INSERT INTO public.profiles (auth_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

-- 2) Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();