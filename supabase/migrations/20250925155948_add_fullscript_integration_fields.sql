-- Add Fullscript integration fields to support lab ordering
-- This migration adds necessary fields for Fullscript API integration

-- Add Fullscript dispensary ID to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  fullscript_dispensary_id TEXT;

-- Add index for better performance on Fullscript account lookups
CREATE INDEX IF NOT EXISTS idx_profiles_fullscript_account_id 
  ON profiles(fullscript_account_id);

-- Add Fullscript order tracking to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS
  fullscript_order_id TEXT,
  ADD COLUMN IF NOT EXISTS
  fullscript_checkout_url TEXT,
  ADD COLUMN IF NOT EXISTS
  fullscript_treatment_plan_id TEXT,
  ADD COLUMN IF NOT EXISTS
  notes TEXT;

-- Add indexes for Fullscript order lookups
CREATE INDEX IF NOT EXISTS idx_orders_fullscript_order_id 
  ON orders(fullscript_order_id);

CREATE INDEX IF NOT EXISTS idx_orders_fullscript_treatment_plan_id 
  ON orders(fullscript_treatment_plan_id);

-- Add patient interaction tracking to lab_to_supplement_protocols
ALTER TABLE lab_to_supplement_protocols ADD COLUMN IF NOT EXISTS
  patient_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS
  patient_declined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS
  decline_reason TEXT;

-- Add Fullscript product tracking to supplement_recommendations
ALTER TABLE supplement_recommendations ADD COLUMN IF NOT EXISTS
  fullscript_product_id TEXT,
  ADD COLUMN IF NOT EXISTS
  fullscript_dispensary_url TEXT,
  ADD COLUMN IF NOT EXISTS
  fullscript_available BOOLEAN DEFAULT true;

-- Add index for Fullscript product lookups
CREATE INDEX IF NOT EXISTS idx_supplement_recommendations_fullscript_product_id 
  ON supplement_recommendations(fullscript_product_id);

-- Add Fullscript integration status to lab_panels
ALTER TABLE lab_panels ADD COLUMN IF NOT EXISTS
  fullscript_id TEXT,
  ADD COLUMN IF NOT EXISTS
  fullscript_available BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS
  fullscript_last_synced_at TIMESTAMPTZ;

-- Add index for Fullscript lab panel lookups
CREATE INDEX IF NOT EXISTS idx_lab_panels_fullscript_id 
  ON lab_panels(fullscript_id);

-- Add Fullscript webhook tracking
CREATE TABLE IF NOT EXISTS fullscript_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for webhook processing
CREATE INDEX IF NOT EXISTS idx_fullscript_webhooks_processed 
  ON fullscript_webhooks(processed, created_at);

-- Add Fullscript sync status tracking
CREATE TABLE IF NOT EXISTS fullscript_sync_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL, -- 'labs', 'products', 'patients'
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT NOT NULL, -- 'success', 'error', 'in_progress'
  error_message TEXT,
  records_processed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for sync status lookups
CREATE INDEX IF NOT EXISTS idx_fullscript_sync_status_type 
  ON fullscript_sync_status(sync_type, last_sync_at);

-- Update existing orders to have default values for new fields
UPDATE orders 
SET 
  fullscript_order_id = NULL,
  fullscript_checkout_url = NULL,
  fullscript_treatment_plan_id = NULL,
  notes = NULL
WHERE fullscript_order_id IS NULL;

-- Add comment explaining the integration
COMMENT ON TABLE orders IS 'Lab orders with Fullscript integration support';
COMMENT ON COLUMN orders.fullscript_order_id IS 'Fullscript treatment plan ID for this order';
COMMENT ON COLUMN orders.fullscript_checkout_url IS 'Fullscript checkout URL for payment processing';
COMMENT ON COLUMN orders.fullscript_treatment_plan_id IS 'Fullscript treatment plan ID (same as fullscript_order_id)';
COMMENT ON COLUMN orders.notes IS 'Additional notes about the order, including Fullscript integration status';
