-- COMPLETE SETUP WITH POLICY CLEANUP
-- This handles existing policies gracefully

-- Step 1: Storage Bucket (skip if exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lab-results', 'lab-results', false)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Tables are already created, so skip them
-- Just verify they exist
SELECT 'Checking tables...' as status;

-- Step 3: DROP all existing policies first
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own analyses" ON public.lab_analyses;
DROP POLICY IF EXISTS "Users can create analyses" ON public.lab_analyses;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create profile" ON public.profiles;

-- Step 4: Create fresh policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analyses" ON public.lab_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create analyses" ON public.lab_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 5: Create profile trigger (drop first if exists)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Verify everything
SELECT 'Setup Complete!' as status;

SELECT 
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('orders', 'lab_analyses', 'profiles')) as tables_created,
  (SELECT COUNT(*) FROM pg_policies 
   WHERE schemaname = 'public') as policies_created,
  (SELECT COUNT(*) FROM storage.buckets 
   WHERE id = 'lab-results') as storage_bucket;