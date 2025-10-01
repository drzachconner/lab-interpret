-- DIAGNOSTIC: Check what tables and columns actually exist

-- 1. Check if our tables exist
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.tables t
LEFT JOIN information_schema.columns c USING (table_schema, table_name)
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'lab_analyses', 'profiles')
GROUP BY table_name;

-- 2. Check columns in orders table specifically
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- 3. Check if user_id column exists in orders
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders' 
      AND column_name = 'user_id'
    ) THEN 'YES - user_id exists in orders table'
    ELSE 'NO - user_id NOT found in orders table'
  END as user_id_check;

-- 4. List ALL tables in public schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;