-- Verify Fullscript Integration Migration
-- Run this in your Supabase SQL Editor to check if migration was applied

-- Check if Fullscript columns exist in orders table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name LIKE 'fullscript%'
ORDER BY column_name;

-- Check if new tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('fullscript_webhooks', 'fullscript_sync_status')
ORDER BY table_name;

-- Check if indexes were created
SELECT indexname, tablename, indexdef
FROM pg_indexes 
WHERE tablename = 'orders' 
AND indexname LIKE '%fullscript%'
ORDER BY indexname;

-- Check migration history
SELECT version, name, executed_at
FROM supabase_migrations.schema_migrations 
WHERE name LIKE '%fullscript%'
ORDER BY executed_at DESC;
