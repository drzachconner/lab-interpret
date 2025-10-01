-- Add consent fields to profiles table for HIPAA-compliant de-identification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS consent_deidentified_processing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS consent_version TEXT DEFAULT '1.0';

-- Create index for efficient consent queries (skip if exists)
CREATE INDEX IF NOT EXISTS idx_profiles_consent ON public.profiles(consent_deidentified_processing, consent_timestamp);