-- Create Storage Bucket for Lab Results
-- Run this in Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/zhdjvfylxgtiphldjtqf/sql/new

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lab-results', 'lab-results', false);

-- 2. Create storage policies for user access
-- Policy: Users can upload their own lab results
CREATE POLICY "Users can upload lab results" 
ON storage.objects
FOR INSERT 
WITH CHECK (
    bucket_id = 'lab-results' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own lab results
CREATE POLICY "Users can view own lab results" 
ON storage.objects
FOR SELECT 
USING (
    bucket_id = 'lab-results' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own lab results
CREATE POLICY "Users can delete own lab results" 
ON storage.objects
FOR DELETE 
USING (
    bucket_id = 'lab-results' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify bucket was created
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'lab-results';

-- Verify policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%lab results%';