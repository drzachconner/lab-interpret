-- BiohackLabs TABLES SETUP (Run after storage setup)
-- This creates all the database tables and policies

-- =====================================================
-- 1. CREATE TABLES (with IF NOT EXISTS)
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
-- 2. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. DROP AND CREATE TABLE POLICIES
-- =====================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.lab_analyses;
DROP POLICY IF EXISTS "Users can create analyses for their orders" ON public.lab_analyses;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

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

-- =====================================================
-- 4. CREATE PROFILE TRIGGER
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
-- 5. VERIFICATION
-- =====================================================

SELECT 'Tables Setup Complete!' as status;

-- Verify tables
SELECT COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'lab_analyses', 'profiles', 'supplement_recommendations', 'analytics_events', 'file_uploads');

-- Verify policies
SELECT COUNT(*) as policies_created
FROM pg_policies 
WHERE schemaname = 'public';

-- Success message
SELECT '✅ BiohackLabs Tables Setup Complete!' as message;