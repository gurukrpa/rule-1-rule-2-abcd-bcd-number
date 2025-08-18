-- COMPREHENSIVE HOUR FORMAT VALIDATION SQL QUERIES
-- Run these queries to verify the fix works for ALL hours, topics, and dates

-- 1. Get user ID for "sing maya"
SELECT id, username FROM users WHERE username = 'sing maya';

-- 2. Check ALL clicked numbers for all hours, topics, and dates
SELECT 
    tc.topic_name,
    tc.date_key,
    tc.hour,
    tc.clicked_number,
    tc.created_at,
    CASE 
        WHEN tc.hour = 'HR1' THEN '1️⃣'
        WHEN tc.hour = 'HR2' THEN '2️⃣'
        WHEN tc.hour = 'HR3' THEN '3️⃣'
        WHEN tc.hour = 'HR4' THEN '4️⃣'
        WHEN tc.hour = 'HR5' THEN '5️⃣'
        WHEN tc.hour = 'HR6' THEN '6️⃣'
        ELSE '❓'
    END as hour_emoji
FROM topic_clicks tc
JOIN users u ON tc.user_id = u.id
WHERE u.username = 'sing maya'
ORDER BY tc.topic_name, tc.date_key, tc.hour, tc.clicked_number;

-- 3. Summary by hour - verify all hours work
SELECT 
    tc.hour,
    COUNT(*) as total_clicks,
    COUNT(DISTINCT tc.topic_name) as topics_with_clicks,
    COUNT(DISTINCT tc.date_key) as dates_with_clicks,
    MIN(tc.created_at) as first_click,
    MAX(tc.created_at) as latest_click
FROM topic_clicks tc
JOIN users u ON tc.user_id = u.id
WHERE u.username = 'sing maya'
GROUP BY tc.hour
ORDER BY tc.hour;

-- 4. Check hour format consistency (should only show HR1, HR2, etc.)
SELECT DISTINCT hour, COUNT(*) as count
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
GROUP BY hour
ORDER BY hour;

-- 5. Recent clicks for debugging (last 20 clicks)
SELECT 
    topic_name, 
    date_key, 
    hour, 
    clicked_number, 
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_ago
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
ORDER BY created_at DESC 
LIMIT 20;

-- 6. Check for any invalid hour formats (should return no rows)
SELECT 
    hour, 
    COUNT(*) as invalid_count
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
AND hour NOT LIKE 'HR%'
GROUP BY hour;

-- 7. Detailed view for specific date (change date as needed)
SELECT 
    topic_name,
    hour,
    clicked_number,
    created_at
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
AND date_key = '2025-08-14'
ORDER BY topic_name, hour, clicked_number;

-- 8. Count by topic and hour matrix
SELECT 
    topic_name,
    SUM(CASE WHEN hour = 'HR1' THEN 1 ELSE 0 END) as hr1_count,
    SUM(CASE WHEN hour = 'HR2' THEN 1 ELSE 0 END) as hr2_count,
    SUM(CASE WHEN hour = 'HR3' THEN 1 ELSE 0 END) as hr3_count,
    SUM(CASE WHEN hour = 'HR4' THEN 1 ELSE 0 END) as hr4_count,
    SUM(CASE WHEN hour = 'HR5' THEN 1 ELSE 0 END) as hr5_count,
    SUM(CASE WHEN hour = 'HR6' THEN 1 ELSE 0 END) as hr6_count,
    COUNT(*) as total_clicks
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
GROUP BY topic_name
ORDER BY topic_name;

-- 9. Check if any data needs migration (old format without HR prefix)
SELECT 
    'Numbers with incorrect hour format:' as issue,
    COUNT(*) as count
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
AND (hour ~ '^[0-9]+$' OR hour NOT LIKE 'HR%');

-- 10. Full data dump for comprehensive verification
SELECT 
    'sing maya' as user,
    topic_name,
    date_key,
    hour,
    ARRAY_AGG(clicked_number ORDER BY clicked_number) as clicked_numbers
FROM topic_clicks tc
JOIN users u ON tc.user_id = u.id
WHERE u.username = 'sing maya'
GROUP BY topic_name, date_key, hour
ORDER BY topic_name, date_key, hour;
