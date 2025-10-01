-- Add consent fields to profiles table for HIPAA-compliant de-identification
ALTER TABLE public.profiles 
ADD COLUMN consent_deidentified_processing BOOLEAN DEFAULT FALSE,
ADD COLUMN consent_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN consent_version TEXT DEFAULT '1.0';

-- Create index for efficient consent queries
CREATE INDEX idx_profiles_consent ON public.profiles(consent_deidentified_processing, consent_timestamp);

-- Add updated trigger for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();