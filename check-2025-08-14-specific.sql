-- Check specifically for 2025-08-14 data
-- Run this in Supabase SQL editor

-- 1. Check for any data on 2025-08-14
SELECT 
    user_id,
    topic_name,
    date_key,
    clicked_number,
    created_at
FROM topic_clicks 
WHERE date_key = '2025-08-14'
ORDER BY created_at DESC;

-- 2. Check for D-1 Set-1 related topics on any date
SELECT 
    user_id,
    topic_name,
    date_key,
    clicked_number,
    created_at
FROM topic_clicks 
WHERE topic_name LIKE '%D-1%'
ORDER BY created_at DESC;

-- 3. Check for numbers 7 and 8 on any date around August 14
SELECT 
    user_id,
    topic_name,
    date_key,
    clicked_number,
    created_at
FROM topic_clicks 
WHERE (clicked_number = 7 OR clicked_number = 8)
  AND date_key BETWEEN '2025-08-10' AND '2025-08-18'
ORDER BY date_key DESC, created_at DESC;

-- 4. Check what dates exist in August 2025
SELECT DISTINCT date_key
FROM topic_clicks 
WHERE date_key BETWEEN '2025-08-01' AND '2025-08-31'
ORDER BY date_key;
