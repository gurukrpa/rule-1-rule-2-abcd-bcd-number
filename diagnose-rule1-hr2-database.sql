-- SQL Diagnostic: Rule-1 HR2 Number Box Click Issues
-- Run these queries in your Supabase SQL editor to diagnose HR2 issues

-- STEP 1: Find all available users in the system
SELECT 
  DISTINCT user_id,
  COUNT(*) as total_records,
  MIN(created_at) as first_record,
  MAX(created_at) as latest_record
FROM topic_clicks 
GROUP BY user_id
ORDER BY total_records DESC;

-- STEP 2: Check all topic_clicks records for a specific user (replace with actual user ID from Step 1)
-- Look for any HR2 records and verify the data structure
SELECT 
  date_key,
  topic_name,
  hour,
  clicked_number,
  is_matched,
  created_at
FROM topic_clicks 
WHERE user_id = 'YOUR_ACTUAL_USER_ID'  -- Replace with actual user ID from Step 1
  AND date_key = '2025-08-14'           -- Replace with problematic date
ORDER BY topic_name, hour, clicked_number;

-- 3. Check hour format consistency - look for any non-standard hour formats
SELECT 
  DISTINCT hour,
  COUNT(*) as record_count
FROM topic_clicks 
WHERE user_id = 'YOUR_ACTUAL_USER_ID'  -- Replace with actual user ID from Step 1
GROUP BY hour 
ORDER BY hour;

-- 4. Check specifically for HR2 records across all dates
SELECT 
  date_key,
  topic_name,
  clicked_number,
  created_at
FROM topic_clicks 
WHERE user_id = 'YOUR_ACTUAL_USER_ID'  -- Replace with actual user ID from Step 1
  AND hour = 'HR2'
ORDER BY date_key DESC, topic_name, clicked_number;

-- 5. Compare HR1 vs HR2 record counts to identify missing HR2 data
SELECT 
  date_key,
  topic_name,
  hour,
  COUNT(*) as click_count
FROM topic_clicks 
WHERE user_id = 'YOUR_ACTUAL_USER_ID'  -- Replace with actual user ID from Step 1
  AND hour IN ('HR1', 'HR2')
GROUP BY date_key, topic_name, hour
ORDER BY date_key DESC, topic_name, hour;

-- 6. Check for any records with NULL or empty hour values
SELECT 
  date_key,
  topic_name,
  hour,
  clicked_number,
  created_at
FROM topic_clicks 
WHERE user_id = 'YOUR_ACTUAL_USER_ID'  -- Replace with actual user ID from Step 1
  AND (hour IS NULL OR hour = '' OR hour NOT LIKE 'HR%')
ORDER BY created_at DESC;

-- 6. Check table schema to ensure correct field types
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'topic_clicks'
ORDER BY ordinal_position;

-- 7. Test insert/update functionality for HR2 (run this as a test)
-- This will insert a test record and then delete it
INSERT INTO topic_clicks (
  user_id, 
  topic_name, 
  date_key, 
  hour, 
  clicked_number, 
  is_matched
) VALUES (
  'test_user_hr2',    -- Test user ID
  'TEST_TOPIC',       -- Test topic
  '2025-08-18',       -- Test date
  'HR2',              -- Test HR2 specifically
  999,                -- Test number
  false
);

-- Verify the test insert
SELECT * FROM topic_clicks 
WHERE user_id = 'test_user_hr2' AND hour = 'HR2';

-- Clean up test data
DELETE FROM topic_clicks 
WHERE user_id = 'test_user_hr2';

-- 8. Check for any constraints or triggers that might affect HR2 saves
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'topic_clicks';

-- 9. Advanced: Check for any recent failed operations (if you have logging)
-- This query might not work if you don't have audit logging enabled
SELECT 
  *
FROM pg_stat_user_tables 
WHERE relname = 'topic_clicks';

-- 10. Check indexes that might affect query performance
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'topic_clicks';

-- 11. Diagnostic summary query - overall health check
SELECT 
  'Total Records' as metric,
  COUNT(*) as value
FROM topic_clicks
WHERE user_id = 'YOUR_ACTUAL_USER_ID'  -- Replace with actual user ID from Step 1

UNION ALL

SELECT 
  'HR2 Records' as metric,
  COUNT(*) as value
FROM topic_clicks
WHERE user_id = 'YOUR_ACTUAL_USER_ID'  -- Replace with actual user ID from Step 1
  AND hour = 'HR2'

UNION ALL

SELECT 
  'Recent Records (Last 7 days)' as metric,
  COUNT(*) as value
FROM topic_clicks
WHERE user_id = 'YOUR_ACTUAL_USER_ID'  -- Replace with actual user ID from Step 1
  AND created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'Unique Dates' as metric,
  COUNT(DISTINCT date_key) as value
FROM topic_clicks
WHERE user_id = 'YOUR_ACTUAL_USER_ID'  -- Replace with actual user ID from Step 1

UNION ALL

SELECT 
  'Unique Topics' as metric,
  COUNT(DISTINCT topic_name) as value
FROM topic_clicks
WHERE user_id = 'YOUR_ACTUAL_USER_ID'; -- Replace with actual user ID from Step 1
