-- Add missing columns to profiles table for Fullscript integration
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fullscript_account_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dispensary_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dispensary_access boolean DEFAULT false;