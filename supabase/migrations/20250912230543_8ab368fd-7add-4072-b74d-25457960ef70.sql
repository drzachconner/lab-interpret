-- Create the one missing table for supplement protocols
CREATE TABLE IF NOT EXISTS lab_to_supplement_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id UUID REFERENCES lab_orders(id),
  interpretation_id UUID REFERENCES interpretations(id),
  protocol_name TEXT,
  protocol_description TEXT,
  fullscript_plan_id TEXT,
  fullscript_plan_url TEXT,
  supplements JSONB,
  sent_to_patient BOOLEAN DEFAULT false,
  patient_viewed_at TIMESTAMP WITH TIME ZONE,
  patient_purchased BOOLEAN DEFAULT false,
  purchase_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the new table
ALTER TABLE lab_to_supplement_protocols ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own protocols
CREATE POLICY "Users can view their own supplement protocols" 
ON lab_to_supplement_protocols 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM lab_orders lo 
    WHERE lo.id = lab_to_supplement_protocols.lab_order_id 
    AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = lo.user_id 
      AND p.auth_id = auth.uid()
    )
  )
);

-- Add Fullscript-specific columns to existing tables
ALTER TABLE lab_panels
ADD COLUMN IF NOT EXISTS fullscript_lab_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS suggested_service_fee INTEGER DEFAULT 75,
ADD COLUMN IF NOT EXISTS fee_justification TEXT DEFAULT 'AI-Powered Functional Analysis';

-- Add Fullscript integration to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fullscript_patient_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS default_discount INTEGER DEFAULT 25;

-- Add Fullscript field to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS fullscript_order_id TEXT;

-- Add AI analysis fields to lab_reports
ALTER TABLE lab_reports
ADD COLUMN IF NOT EXISTS functional_analysis JSONB,
ADD COLUMN IF NOT EXISTS supplement_protocol_id UUID REFERENCES lab_to_supplement_protocols(id),
ADD COLUMN IF NOT EXISTS biohacking_score INTEGER,
ADD COLUMN IF NOT EXISTS optimization_priorities JSONB;