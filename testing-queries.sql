-- Comprehensive Testing Queries for Demo Mode
-- Run these queries in your Supabase SQL Editor to verify system functionality

-- ==============================================
-- 1. PRE-TESTING SETUP
-- ==============================================

-- Clean up test data
DELETE FROM orders WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%test%'
) AND order_type = 'lab_panel_fullscript';

DELETE FROM profiles WHERE email LIKE '%test%';

-- ==============================================
-- 2. SYSTEM VERIFICATION
-- ==============================================

-- Check if Fullscript columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name LIKE 'fullscript%'
ORDER BY column_name;

-- Check if new tables exist
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name IN ('fullscript_webhooks', 'fullscript_sync_status')
ORDER BY table_name;

-- Check if indexes were created
SELECT indexname, tablename, indexdef
FROM pg_indexes 
WHERE tablename = 'orders' 
AND indexname LIKE '%fullscript%'
ORDER BY indexname;

-- ==============================================
-- 3. LAB CATALOG VERIFICATION
-- ==============================================

-- Check active lab panels
SELECT 
  id,
  name,
  display_name,
  base_price,
  provider,
  sample_type,
  is_active,
  created_at
FROM lab_panels
WHERE is_active = true
ORDER BY display_name
LIMIT 10;

-- Check for missing pricing
SELECT 
  COUNT(*) as total_panels,
  COUNT(CASE WHEN base_price IS NULL OR base_price = 0 THEN 1 END) as panels_without_price,
  COUNT(CASE WHEN base_price > 0 THEN 1 END) as panels_with_pricing
FROM lab_panels
WHERE is_active = true;

-- Check lab panel distribution by provider
SELECT 
  provider,
  COUNT(*) as panel_count,
  AVG(base_price) as avg_price,
  MIN(base_price) as min_price,
  MAX(base_price) as max_price
FROM lab_panels
WHERE is_active = true
GROUP BY provider
ORDER BY panel_count DESC;

-- ==============================================
-- 4. ORDER CREATION VERIFICATION
-- ==============================================

-- Check recent orders
SELECT 
  id,
  order_number,
  status,
  total_amount,
  LEFT(notes, 100) as notes_preview,
  created_at,
  updated_at
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
ORDER BY created_at DESC
LIMIT 10;

-- Verify order items are being created
SELECT 
  o.id as order_id,
  o.order_number,
  oi.lab_panel_id,
  lp.display_name,
  oi.quantity,
  oi.unit_price,
  (oi.quantity * oi.unit_price) as line_total
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN lab_panels lp ON oi.lab_panel_id = lp.id
WHERE o.order_type = 'lab_panel_fullscript'
ORDER BY o.created_at DESC
LIMIT 10;

-- Check order status distribution
SELECT 
  status,
  COUNT(*) as count,
  AVG(total_amount) as avg_amount,
  SUM(total_amount) as total_revenue,
  MIN(created_at) as first_order,
  MAX(created_at) as last_order
FROM orders
WHERE order_type = 'lab_panel_fullscript'
GROUP BY status
ORDER BY count DESC;

-- ==============================================
-- 5. USER ACTIVITY VERIFICATION
-- ==============================================

-- Check user registration and order activity
SELECT 
  p.id as user_id,
  p.email,
  p.created_at as user_created,
  COUNT(o.id) as total_orders,
  SUM(o.total_amount) as total_spent,
  MAX(o.created_at) as last_order
FROM profiles p
LEFT JOIN orders o ON p.id = o.user_id AND o.order_type = 'lab_panel_fullscript'
WHERE p.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY p.id, p.email, p.created_at
ORDER BY p.created_at DESC;

-- Check order patterns by user
SELECT 
  user_id,
  COUNT(*) as order_count,
  AVG(total_amount) as avg_order_value,
  SUM(total_amount) as total_spent,
  MIN(created_at) as first_order,
  MAX(created_at) as last_order
FROM orders
WHERE order_type = 'lab_panel_fullscript'
GROUP BY user_id
ORDER BY order_count DESC
LIMIT 10;

-- ==============================================
-- 6. PERFORMANCE TESTING
-- ==============================================

-- Check query performance for lab panels
EXPLAIN ANALYZE
SELECT * FROM lab_panels 
WHERE is_active = true;

-- Check order creation performance
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as orders_created,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_processing_seconds
FROM orders
WHERE order_type = 'lab_panel_fullscript'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Check database size and growth
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'order_items', 'lab_panels', 'profiles')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ==============================================
-- 7. ERROR ANALYSIS
-- ==============================================

-- Check for failed orders
SELECT 
  order_number,
  status,
  notes,
  created_at
FROM orders
WHERE order_type = 'lab_panel_fullscript'
  AND (status = 'failed' OR notes LIKE '%error%' OR notes LIKE '%failed%')
ORDER BY created_at DESC
LIMIT 10;

-- Check for orders with missing data
SELECT 
  o.id,
  o.order_number,
  o.status,
  COUNT(oi.id) as item_count,
  o.total_amount
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_type = 'lab_panel_fullscript'
GROUP BY o.id, o.order_number, o.status, o.total_amount
HAVING COUNT(oi.id) = 0
ORDER BY o.created_at DESC;

-- ==============================================
-- 8. DEMO MODE MONITORING VIEW
-- ==============================================

-- Create comprehensive monitoring view
CREATE OR REPLACE VIEW demo_order_stats AS
SELECT 
  DATE(created_at) as order_date,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending_manual' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_orders,
  COUNT(CASE WHEN status = 'fullscript_error' THEN 1 END) as fullscript_error_orders,
  SUM(total_amount) as daily_revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE order_type = 'lab_panel_fullscript'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- Query the monitoring view
SELECT * FROM demo_order_stats LIMIT 7;

-- ==============================================
-- 9. SYSTEM HEALTH CHECK
-- ==============================================

-- Comprehensive system health check
SELECT 
  'Database Migration' as check_name,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status,
  COUNT(*) as fullscript_columns_found
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name LIKE 'fullscript%'
UNION ALL
SELECT 
  'Webhook Tables',
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END,
  COUNT(*)
FROM information_schema.tables 
WHERE table_name IN ('fullscript_webhooks', 'fullscript_sync_status')
UNION ALL
SELECT 
  'Lab Panels Active',
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END,
  COUNT(*)
FROM lab_panels
WHERE is_active = true
UNION ALL
SELECT 
  'Orders Created',
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END,
  COUNT(*)
FROM orders
WHERE order_type = 'lab_panel_fullscript'
UNION ALL
SELECT 
  'Demo Mode Working',
  CASE 
    WHEN COUNT(*) > 0 AND 
         COUNT(CASE WHEN status = 'pending_manual' THEN 1 END) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END,
  COUNT(*)
FROM orders
WHERE order_type = 'lab_panel_fullscript'
  AND created_at >= NOW() - INTERVAL '1 hour';

-- ==============================================
-- 10. CLEANUP (Run after testing)
-- ==============================================

-- Uncomment to clean up test data after testing
-- DELETE FROM orders WHERE user_id IN (
--   SELECT id FROM profiles WHERE email LIKE '%test%'
-- ) AND order_type = 'lab_panel_fullscript';
-- 
-- DELETE FROM profiles WHERE email LIKE '%test%';
