-- CRITICAL DIAGNOSTIC: Find the actual user ID being used in the system
-- Run these queries to identify all possible user IDs

-- 1. Check if there are ANY records in topic_clicks table
SELECT COUNT(*) as total_records FROM topic_clicks;

-- 2. If there are records, find all unique user IDs
SELECT 
  user_id,
  COUNT(*) as record_count,
  MIN(created_at) as first_record,
  MAX(created_at) as last_record
FROM topic_clicks 
GROUP BY user_id 
ORDER BY record_count DESC;

-- 3. Check recent activity (last 24 hours)
SELECT 
  user_id,
  topic_name,
  date_key,
  hour,
  clicked_number,
  created_at
FROM topic_clicks 
WHERE created_at >= NOW() - INTERVAL '24 HOURS'
ORDER BY created_at DESC
LIMIT 20;

-- 4. Search for user IDs containing "sing" or "maya"
SELECT 
  user_id,
  COUNT(*) as record_count
FROM topic_clicks 
WHERE LOWER(user_id) LIKE '%sing%' 
   OR LOWER(user_id) LIKE '%maya%'
GROUP BY user_id;

-- 5. Check if there are other tables with user data
-- (You might need to adjust table names based on your schema)

-- Check users table if it exists
SELECT user_id, email, name FROM users 
WHERE LOWER(email) LIKE '%sing%' 
   OR LOWER(email) LIKE '%maya%'
   OR LOWER(name) LIKE '%sing%'
   OR LOWER(name) LIKE '%maya%'
LIMIT 10;

-- Alternative: Check profiles table if it exists
SELECT id, email, full_name FROM profiles 
WHERE LOWER(email) LIKE '%sing%' 
   OR LOWER(email) LIKE '%maya%'
   OR LOWER(full_name) LIKE '%sing%'
   OR LOWER(full_name) LIKE '%maya%'
LIMIT 10;

-- 6. Check table structure to understand the schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 7. Check if there are any records with NULL user_id
SELECT COUNT(*) as null_user_records 
FROM topic_clicks 
WHERE user_id IS NULL;

-- 8. Check the most recent 10 records regardless of user
SELECT 
  user_id,
  topic_name,
  date_key,
  hour,
  clicked_number,
  created_at
FROM topic_clicks 
ORDER BY created_at DESC 
LIMIT 10;

-- 9. Check for today's date specifically (2025-08-18)
SELECT 
  user_id,
  topic_name,
  hour,
  clicked_number,
  created_at
FROM topic_clicks 
WHERE date_key = '2025-08-18'
ORDER BY created_at DESC;

-- 10. Check if the issue is with the specific date (2025-08-14 from screenshot)
SELECT 
  user_id,
  topic_name,
  hour,
  clicked_number,
  created_at
FROM topic_clicks 
WHERE date_key = '2025-08-14'
ORDER BY topic_name, hour, clicked_number;
