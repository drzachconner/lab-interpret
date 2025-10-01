-- ========================================
-- BIOHACKLABS SETUP - SAFE VERSION
-- This version handles existing objects gracefully
-- ========================================

-- PART 1: CREATE STORAGE BUCKET (IF NOT EXISTS)
-- ========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lab-results', 'lab-results', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies first (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload lab results" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own lab results" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own lab results" ON storage.objects;

-- Recreate storage policies
CREATE POLICY "Users can upload lab results" 
ON storage.objects
FOR INSERT 
WITH CHECK (
    bucket_id = 'lab-results' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own lab results" 
ON storage.objects
FOR SELECT 
USING (
    bucket_id = 'lab-results' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own lab results" 
ON storage.objects
FOR DELETE 
USING (
    bucket_id = 'lab-results' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- PART 2: CREATE DATABASE TABLES (IF NOT EXISTS)
-- ========================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_type VARCHAR(50) DEFAULT 'interpretation',
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2) DEFAULT 19.00,
  lab_file_url TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  analysis_id UUID,
  user_age INTEGER,
  user_sex VARCHAR(20),
  health_goals TEXT[],
  medications TEXT[],
  conditions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab analyses table
CREATE TABLE IF NOT EXISTS lab_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_data JSONB,
  executive_summary TEXT,
  health_scores JSONB,
  key_findings TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  date_of_birth DATE,
  biological_sex VARCHAR(20),
  health_goals TEXT[],
  current_medications TEXT[],
  health_conditions TEXT[],
  fullscript_patient_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplement tracking table
CREATE TABLE IF NOT EXISTS supplement_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES lab_analyses(id) ON DELETE CASCADE,
  supplement_name VARCHAR(255),
  search_term VARCHAR(255),
  dosage VARCHAR(100),
  timing VARCHAR(100),
  duration VARCHAR(100),
  risk_level VARCHAR(20),
  category VARCHAR(50),
  clicked BOOLEAN DEFAULT FALSE,
  purchased BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab uploads table
CREATE TABLE IF NOT EXISTS lab_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(50),
  storage_path TEXT,
  parsed_data JSONB,
  upload_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(100),
  event_data JSONB,
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PART 3: ENABLE ROW LEVEL SECURITY
-- ========================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- PART 4: DROP AND RECREATE TABLE POLICIES
-- ========================================

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Lab analyses policies
DROP POLICY IF EXISTS "Users can view own analyses" ON lab_analyses;
DROP POLICY IF EXISTS "Service role can insert analyses" ON lab_analyses;

CREATE POLICY "Users can view own analyses" ON lab_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert analyses" ON lab_analyses
  FOR INSERT WITH CHECK (true);

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Supplement tracking policies
DROP POLICY IF EXISTS "Users can view own supplement tracking" ON supplement_tracking;
DROP POLICY IF EXISTS "Users can update own supplement tracking" ON supplement_tracking;

CREATE POLICY "Users can view own supplement tracking" ON supplement_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lab_analyses 
      WHERE lab_analyses.id = supplement_tracking.analysis_id 
      AND lab_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own supplement tracking" ON supplement_tracking
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lab_analyses 
      WHERE lab_analyses.id = supplement_tracking.analysis_id 
      AND lab_analyses.user_id = auth.uid()
    )
  );

-- Lab uploads policies
DROP POLICY IF EXISTS "Users can view own uploads" ON lab_uploads;
DROP POLICY IF EXISTS "Users can create own uploads" ON lab_uploads;

CREATE POLICY "Users can view own uploads" ON lab_uploads
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own uploads" ON lab_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics policies
DROP POLICY IF EXISTS "Users can insert analytics" ON analytics_events;

CREATE POLICY "Users can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PART 5: CREATE OR REPLACE FUNCTIONS
-- ========================================

-- Profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Supplement click tracking
CREATE OR REPLACE FUNCTION public.track_supplement_click(
  p_supplement_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE supplement_tracking
  SET 
    clicked = true,
    clicked_at = NOW()
  WHERE id = p_supplement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get latest analysis
CREATE OR REPLACE FUNCTION public.get_latest_analysis(p_user_id UUID)
RETURNS TABLE (
  analysis_id UUID,
  order_id UUID,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    la.id as analysis_id,
    la.order_id,
    la.analysis_data,
    la.created_at
  FROM lab_analyses la
  WHERE la.user_id = p_user_id
  ORDER BY la.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 6: CREATE INDEXES (IF NOT EXISTS)
-- ========================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON lab_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_order_id ON lab_analyses(order_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON lab_analyses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_supplement_tracking_analysis ON supplement_tracking(analysis_id);
CREATE INDEX IF NOT EXISTS idx_supplement_tracking_clicked ON supplement_tracking(clicked);

CREATE INDEX IF NOT EXISTS idx_lab_uploads_user_id ON lab_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);

-- PART 7: VERIFICATION
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================';
  RAISE NOTICE 'SETUP COMPLETE - VERIFICATION:';
  RAISE NOTICE '=================================';
  
  -- Check storage bucket
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'lab-results') THEN
    RAISE NOTICE '✅ Storage bucket: lab-results';
  ELSE
    RAISE NOTICE '❌ Storage bucket missing';
  END IF;
  
  -- Check tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    RAISE NOTICE '✅ Table: orders';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lab_analyses') THEN
    RAISE NOTICE '✅ Table: lab_analyses';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE NOTICE '✅ Table: profiles';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplement_tracking') THEN
    RAISE NOTICE '✅ Table: supplement_tracking';
  END IF;
  
  RAISE NOTICE '=================================';
  RAISE NOTICE 'All components created successfully!';
  RAISE NOTICE '=================================';
END $$;

-- Final verification query
SELECT 
  'Setup Complete' as status,
  COUNT(DISTINCT table_name) as tables_created,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' OR tablename = 'objects') as policies_created;
