-- ========================================
-- COMPLETE BIOHACKLABS SETUP SCRIPT
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

-- Orders table for tracking purchases
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_type VARCHAR(50) DEFAULT 'interpretation',
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, completed
  total_amount DECIMAL(10,2) DEFAULT 19.00,
  lab_file_url TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab analyses table for storing AI results
CREATE TABLE IF NOT EXISTS lab_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PART 3: ENABLE ROW LEVEL SECURITY
-- ========================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- PART 4: CREATE PROFILE TRIGGER
-- ========================================
-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- PART 5: VERIFICATION QUERIES
-- ========================================
-- Check if everything was created successfully
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

SELECT 'Profiles Table' as component,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
            THEN '✅ Created' 
            ELSE '❌ Missing' 
       END as status;

-- Show all created policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' OR tablename = 'objects'
ORDER BY tablename, policyname;