-- Add Fullscript integration fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN fullscript_account_id TEXT,
ADD COLUMN dispensary_url TEXT,
ADD COLUMN account_type TEXT CHECK (account_type IN ('analysis', 'dispensary')),
ADD COLUMN dispensary_access BOOLEAN DEFAULT FALSE;