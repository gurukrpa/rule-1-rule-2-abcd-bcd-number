-- Check what data exists in topic_clicks table for recent dates
-- Run this in Supabase SQL editor

-- First, let's check the table schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'topic_clicks';

-- 1. Check all data (simplified)
SELECT 
    user_id,
    topic_name,
    date_key,
    clicked_number,
    created_at
FROM topic_clicks 
ORDER BY created_at DESC 
LIMIT 20;

-- 2. Check all unique date values
SELECT DISTINCT date_key, COUNT(*) as count
FROM topic_clicks 
GROUP BY date_key 
ORDER BY date_key DESC 
LIMIT 20;

-- 3. Check data for specific numbers 7 and 8
SELECT 
    user_id,
    topic_name,
    date_key,
    clicked_number,
    created_at
FROM topic_clicks 
WHERE clicked_number = 7 
   OR clicked_number = 8
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check all user IDs to see what users exist
SELECT DISTINCT user_id, COUNT(*) as click_count
FROM topic_clicks 
GROUP BY user_id 
ORDER BY click_count DESC;

-- 5. Check most recent data entries
SELECT 
    user_id,
    topic_name,
    date_key,
    clicked_number,
    created_at
FROM topic_clicks 
ORDER BY created_at DESC 
LIMIT 10;
