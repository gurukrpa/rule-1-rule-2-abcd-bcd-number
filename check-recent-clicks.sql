-- Check for YOUR recent clicks (last 24 hours)
-- Run this in Supabase SQL editor

SELECT 
    user_id,
    topic_name,
    date_key,
    clicked_number,
    created_at
FROM topic_clicks 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Also check for any D-1 Set-1 data specifically
SELECT 
    user_id,
    topic_name,
    date_key,
    clicked_number,
    created_at
FROM topic_clicks 
WHERE topic_name LIKE '%D-1%'
ORDER BY created_at DESC;
