-- BiohackLabs Complete Setup V2 - FULLY FIXED VERSION
-- This fixes the auth.uid() reference errors
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
-- 3. CREATE STORAGE POLICIES (with correct auth syntax)
-- =====================================================

-- Policy for uploading files
CREATE POLICY "Users can upload lab results" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'lab-results' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for viewing files
CREATE POLICY "Users can view their own lab results" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'lab-results' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for updating files
CREATE POLICY "Users can update their own lab results" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'lab-results' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting files
CREATE POLICY "Users can delete their own lab results" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'lab-results' AND
  (storage.foldername(name))[1] = auth.uid()::text
);