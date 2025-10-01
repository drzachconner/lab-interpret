-- STEP 1: Create Storage Bucket First
-- Run this block first
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lab-results', 'lab-results', false)
ON CONFLICT (id) DO NOTHING;

-- STEP 2: Drop any existing policies
-- Run this block second
DROP POLICY IF EXISTS "Users can upload lab results" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own lab results" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own lab results" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own lab results" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own lab results" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own lab results" ON storage.objects;

-- STEP 3: Create Storage Policies
-- Run this block third
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'lab-results');

CREATE POLICY "Allow users to view their files" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'lab-results');

CREATE POLICY "Allow users to delete their files" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'lab-results');

CREATE POLICY "Allow users to update their files" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'lab-results');

-- Verification
SELECT 'Storage Setup Complete' as status;