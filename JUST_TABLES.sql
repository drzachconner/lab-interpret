-- JUST TABLES - NO POLICIES
-- This creates only the tables, nothing else
-- Run this to test if tables work

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  status text DEFAULT 'pending',
  payment_intent_id text,
  stripe_session_id text,
  amount integer DEFAULT 1900,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lab Analyses table
CREATE TABLE IF NOT EXISTS public.lab_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_data jsonb NOT NULL,
  ai_provider text,
  model_used text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name text,
  date_of_birth date,
  health_conditions text[],
  medications text[],
  allergies text[],
  health_goals text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Verify what we created
SELECT 'Tables created:' as status, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'lab_analyses', 'profiles');