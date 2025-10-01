-- ========================================
-- COMPLETE BIOHACKLABS SETUP SCRIPT V2
-- Includes supplement tracking and enhanced analytics
-- Run this entire script in Supabase SQL Editor
-- https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf/sql/new
-- ========================================

-- PART 1: CREATE STORAGE BUCKET
-- ========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lab-results', 'lab-results', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user access
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

-- PART 2: CREATE DATABASE TABLES
-- ========================================

-- Enhanced orders table with user profile fields
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_type VARCHAR(50) DEFAULT 'interpretation',
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, analyzing, completed, failed
  total_amount DECIMAL(10,2) DEFAULT 19.00,
  lab_file_url TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  analysis_id UUID,
  -- User profile data for analysis
  user_age INTEGER,
  user_sex VARCHAR(20),
  health_goals TEXT[],
  medications TEXT[],
  conditions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced lab analyses table
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

-- User profiles with health information
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

-- Lab uploads tracking
CREATE TABLE IF NOT EXISTS lab_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(50),
  storage_path TEXT,
  parsed_data JSONB,
  upload_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
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

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Lab analyses policies
CREATE POLICY "Users can view own analyses" ON lab_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert analyses" ON lab_analyses
  FOR INSERT WITH CHECK (true);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Supplement tracking policies
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
CREATE POLICY "Users can view own uploads" ON lab_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own uploads" ON lab_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics policies (write-only for users)
CREATE POLICY "Users can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PART 4: CREATE FUNCTIONS & TRIGGERS
-- ========================================

-- Function to automatically create profile on signup
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

-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to track supplement clicks
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

-- Function to get user's latest analysis
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

-- PART 5: CREATE INDEXES FOR PERFORMANCE
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

-- PART 6: VERIFICATION QUERIES
-- ========================================
SELECT 'Storage Bucket' as component, 
       CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'lab-results') 
            THEN '✅ Created' 
            ELSE '❌ Missing' 
       END as status;

SELECT 'Orders Table' as component,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders')
            THEN '✅ Created' 
            ELSE '❌ Missing' 
       END as status;

SELECT 'Lab Analyses Table' as component,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lab_analyses')
            THEN '✅ Created' 
            ELSE '❌ Missing' 
       END as status;

SELECT 'Supplement Tracking' as component,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplement_tracking')
            THEN '✅ Created' 
            ELSE '❌ Missing' 
       END as status;

-- Count all tables and policies
SELECT 
  'Total Tables: ' || COUNT(DISTINCT table_name) as summary
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT 
  'Total Policies: ' || COUNT(*) as summary
FROM pg_policies 
WHERE schemaname = 'public' OR tablename = 'objects';