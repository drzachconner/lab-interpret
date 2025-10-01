-- Drop the existing view and recreate with proper security
DROP VIEW IF EXISTS revenue_summary;

-- Create a secure view that respects RLS policies
CREATE VIEW revenue_summary 
WITH (security_invoker = true)
AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_orders,
  SUM(authorization_fee) / 100.0 as service_fees_earned,
  AVG(authorization_fee) / 100.0 as avg_service_fee
FROM orders
WHERE order_type = 'lab_panel'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;