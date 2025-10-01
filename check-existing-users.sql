-- Check for existing users and test data
-- Run this in Supabase SQL Editor to see what users exist

-- Check existing users
SELECT 
  id,
  email,
  created_at,
  updated_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are any existing orders
SELECT 
  id,
  order_number,
  user_id,
  status,
  total_amount,
  created_at
FROM orders
WHERE order_type = 'lab_panel_fullscript'
ORDER BY created_at DESC
LIMIT 10;

-- Check lab panels availability
SELECT 
  COUNT(*) as total_panels,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_panels,
  COUNT(CASE WHEN base_price > 0 THEN 1 END) as panels_with_pricing
FROM lab_panels;

-- Check system health
SELECT 
  'Users' as metric,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
  'Orders',
  COUNT(*)
FROM orders
WHERE order_type = 'lab_panel_fullscript'
UNION ALL
SELECT 
  'Lab Panels',
  COUNT(*)
FROM lab_panels
WHERE is_active = true;
