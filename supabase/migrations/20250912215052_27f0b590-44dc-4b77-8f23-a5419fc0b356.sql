-- Add missing column to lab_panels table
ALTER TABLE lab_panels
ADD COLUMN IF NOT EXISTS collection_instructions TEXT;

-- Add functional ranges table (KEY for biohacking interpretation)
CREATE TABLE IF NOT EXISTS functional_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  biomarker_name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  category TEXT,
  standard_min DECIMAL(10,4),
  standard_max DECIMAL(10,4),
  optimal_min DECIMAL(10,4),
  optimal_max DECIMAL(10,4),
  male_optimal_min DECIMAL(10,4),
  male_optimal_max DECIMAL(10,4),
  female_optimal_min DECIMAL(10,4),
  female_optimal_max DECIMAL(10,4),
  unit TEXT NOT NULL,
  performance_target DECIMAL(10,4),
  longevity_target DECIMAL(10,4),
  low_supplement_recs JSONB,
  high_supplement_recs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update profiles table for Fullscript integration
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fullscript_patient_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS default_discount INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS health_goals JSONB;

-- Track what labs can be bundled together (same draw)
CREATE TABLE IF NOT EXISTS bundleable_labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_provider TEXT NOT NULL,
  sample_type TEXT NOT NULL,
  lab_ids UUID[],
  draw_fee INTEGER,
  UNIQUE(lab_provider, sample_type)
);

-- Enable RLS on new tables
ALTER TABLE functional_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundleable_labs ENABLE ROW LEVEL SECURITY;

-- Create policies for functional_ranges (readable by everyone for reference data)
CREATE POLICY "Functional ranges are viewable by everyone" 
ON functional_ranges FOR SELECT 
USING (true);

-- Create policies for bundleable_labs (readable by everyone for reference data)
CREATE POLICY "Bundleable labs are viewable by everyone" 
ON bundleable_labs FOR SELECT 
USING (true);