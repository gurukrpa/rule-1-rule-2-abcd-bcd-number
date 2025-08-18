-- Check what clicks exist for August 14th, 2025
SELECT 
    topic_name,
    date_key,
    hour,
    clicked_number,
    created_at
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
  AND date_key = '2025-08-14'
ORDER BY clicked_number;
