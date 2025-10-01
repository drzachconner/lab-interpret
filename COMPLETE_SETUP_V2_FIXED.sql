-- BiohackLabs Complete Setup V2 - FIXED VERSION
-- This script handles existing objects gracefully
-- Run this entire script in one go

-- =====================================================
-- 1. STORAGE BUCKET SETUP (with existence check)
-- =====================================================

-- Check if bucket exists, if not create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('lab-results', 'Lab Results', false, 52428800, 
   ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. DROP EXISTING POLICIES (to avoid conflicts)
-- =====================================================

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload lab results" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own lab results" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own lab results" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own lab results" ON storage.objects;

-- =====================================================
-- 3. CREATE TABLES (with IF NOT EXISTS)
-- =====================================================

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'completed', 'failed')),
  payment_intent_id text,
  stripe_session_id text,
  amount integer DEFAULT 1900,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lab Analyses table
CREATE TABLE IF NOT EXISTS public.lab_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_data jsonb NOT NULL,
  ai_provider text,
  model_used text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name text,
  date_of_birth date,
  health_conditions text[],
  medications text[],
  allergies text[],
  health_goals text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Supplement tracking table
CREATE TABLE IF NOT EXISTS public.supplement_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id uuid REFERENCES public.lab_analyses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_name text NOT NULL,
  dosage text,
  frequency text,
  duration text,
  priority text CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  category text,
  reason text,
  warnings text,
  fullscript_url text,
  created_at timestamptz DEFAULT now()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- File uploads tracking
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size integer,
  file_type text,
  storage_path text,
  upload_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. CREATE STORAGE POLICIES (fresh)
-- =====================================================

-- Policy for uploading files
CREATE POLICY "Users can upload lab results" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'lab-results' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Policy for viewing files
CREATE POLICY "Users can view their own lab results" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'lab-results' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Policy for updating files
CREATE POLICY "Users can update their own lab results" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'lab-results' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- Policy for deleting files
CREATE POLICY "Users can delete their own lab results" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'lab-results' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- =====================================================
-- 5. DROP AND RECREATE TABLE POLICIES
-- =====================================================

-- Drop existing table policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.lab_analyses;
DROP POLICY IF EXISTS "Users can create analyses for their orders" ON public.lab_analyses;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own recommendations" ON public.supplement_recommendations;
DROP POLICY IF EXISTS "Users can create recommendations" ON public.supplement_recommendations;
DROP POLICY IF EXISTS "Users can track their own analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "Users can create uploads" ON public.file_uploads;

-- Create fresh table policies
-- Orders policies
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own orders" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own orders" 
ON public.orders FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

-- Lab analyses policies
CREATE POLICY "Users can view their own analyses" 
ON public.lab_analyses FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create analyses for their orders" 
ON public.lab_analyses FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Supplement recommendations policies
CREATE POLICY "Users can view their own recommendations" 
ON public.supplement_recommendations FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create recommendations" 
ON public.supplement_recommendations FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Analytics events policies
CREATE POLICY "Users can track their own analytics" 
ON public.analytics_events FOR ALL 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- File uploads policies
CREATE POLICY "Users can view their own uploads" 
ON public.file_uploads FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create uploads" 
ON public.file_uploads FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CREATE TRIGGERS & FUNCTIONS
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Drop and recreate indexes
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_analyses_user_id;
DROP INDEX IF EXISTS idx_analyses_order_id;
DROP INDEX IF EXISTS idx_recommendations_analysis_id;
DROP INDEX IF EXISTS idx_recommendations_user_id;
DROP INDEX IF EXISTS idx_analytics_user_id;
DROP INDEX IF EXISTS idx_analytics_event_type;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.lab_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_order_id ON public.lab_analyses(order_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_analysis_id ON public.supplement_recommendations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.supplement_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Check all components
SELECT 'Setup Complete!' as status;

-- Verify tables
SELECT 
  'Tables Created' as component,
  COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'orders', 'lab_analyses', 'profiles', 
  'supplement_recommendations', 'analytics_events', 
  'file_uploads'
);

-- Verify policies
SELECT 
  'Policies Created' as component,
  COUNT(*) as count 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verify storage bucket
SELECT 
  'Storage Bucket' as component,
  COUNT(*) as count 
FROM storage.buckets 
WHERE id = 'lab-results';

-- Success message
SELECT '✅ BiohackLabs Database Setup V2 Complete!' as message;