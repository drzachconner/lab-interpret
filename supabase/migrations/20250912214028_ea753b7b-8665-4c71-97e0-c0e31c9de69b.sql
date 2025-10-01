-- Add Fullscript-specific fields to lab_panels table
ALTER TABLE lab_panels
ADD COLUMN IF NOT EXISTS fullscript_lab_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS fullscript_sku TEXT,
ADD COLUMN IF NOT EXISTS practitioner_price INTEGER, -- in cents
ADD COLUMN IF NOT EXISTS retail_price INTEGER, -- in cents
ADD COLUMN IF NOT EXISTS suggested_service_fee INTEGER DEFAULT 75,
ADD COLUMN IF NOT EXISTS fee_justification TEXT DEFAULT 'AI-Powered Functional Analysis',
ADD COLUMN IF NOT EXISTS collection_instructions TEXT,
ADD COLUMN IF NOT EXISTS preparation_instructions TEXT,
ADD COLUMN IF NOT EXISTS states_available TEXT[],
ADD COLUMN IF NOT EXISTS age_minimum INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS draw_fee INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS optimization_tags TEXT[]; -- ['energy', 'hormones', 'longevity']

-- Add indexes for search
CREATE INDEX IF NOT EXISTS idx_lab_panels_fullscript ON lab_panels(fullscript_lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_panels_category ON lab_panels(category);
CREATE INDEX IF NOT EXISTS idx_lab_panels_search ON lab_panels USING GIN(
  to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(biomarkers::text, ''))
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics_lab_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  lab_id UUID REFERENCES lab_panels(id),
  action TEXT, -- 'viewed', 'added_to_cart', 'removed', 'purchased'
  session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);