-- Real-time Order Monitoring for Demo Mode Testing
-- Run these queries in your Supabase SQL Editor to monitor orders

-- 1. Recent Orders (Last 24 hours)
SELECT 
  order_number,
  status,
  total_amount,
  notes,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_ago
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 2. Order Status Summary
SELECT 
  status,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
GROUP BY status
ORDER BY order_count DESC;

-- 3. Hourly Order Volume (Last 24 hours)
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as orders,
  SUM(total_amount) as revenue
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- 4. Failed Fullscript Integrations
SELECT 
  order_number,
  status,
  notes,
  created_at
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
  AND (notes LIKE '%Fullscript%error%' OR notes LIKE '%No Fullscript account%')
ORDER BY created_at DESC
LIMIT 10;

-- 5. User Activity (Orders per user)
SELECT 
  user_id,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_spent,
  MAX(created_at) as last_order
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
GROUP BY user_id
ORDER BY total_orders DESC
LIMIT 10;

-- 6. Lab Panel Popularity
SELECT 
  oi.lab_panel_id,
  lp.display_name,
  COUNT(*) as times_ordered,
  SUM(oi.quantity) as total_quantity
FROM order_items oi
JOIN lab_panels lp ON oi.lab_panel_id = lp.id
JOIN orders o ON oi.order_id = o.id
WHERE o.order_type = 'lab_panel_fullscript'
GROUP BY oi.lab_panel_id, lp.display_name
ORDER BY times_ordered DESC
LIMIT 10;

-- 7. System Health Check
SELECT 
  'Total Orders' as metric,
  COUNT(*) as value
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
UNION ALL
SELECT 
  'Successful Orders',
  COUNT(*)
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
  AND status = 'pending_manual'
UNION ALL
SELECT 
  'Failed Orders',
  COUNT(*)
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
  AND status = 'failed'
UNION ALL
SELECT 
  'Total Revenue',
  SUM(total_amount)
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
  AND status = 'pending_manual';

-- 8. Recent User Registrations
SELECT 
  p.id,
  p.email,
  p.created_at,
  COUNT(o.id) as order_count
FROM profiles p
LEFT JOIN orders o ON p.id = o.user_id AND o.order_type = 'lab_panel_fullscript'
WHERE p.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY p.id, p.email, p.created_at
ORDER BY p.created_at DESC;

-- 9. Fullscript Integration Status
SELECT 
  'Migration Applied' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name LIKE 'fullscript%'
UNION ALL
SELECT 
  'Webhook Tables Created',
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END
FROM information_schema.tables 
WHERE table_name IN ('fullscript_webhooks', 'fullscript_sync_status')
UNION ALL
SELECT 
  'Edge Functions Deployed',
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END
FROM supabase_functions.functions 
WHERE name IN ('create-lab-order-fullscript', 'sync-fullscript-catalog', 'fullscript-webhook');

-- 10. Demo Mode Verification
SELECT 
  'Demo Mode Working' as test_name,
  CASE 
    WHEN COUNT(*) > 0 AND 
         COUNT(CASE WHEN status = 'pending_manual' THEN 1 END) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as result
FROM orders 
WHERE order_type = 'lab_panel_fullscript'
  AND created_at >= NOW() - INTERVAL '1 hour';
