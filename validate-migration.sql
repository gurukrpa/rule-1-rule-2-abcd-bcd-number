-- Validation script to check data migration to topic_clicks table
-- Run this after migration to verify data integrity

-- 1. Check total records in each table
SELECT 'topic_clicks' as table_name, COUNT(*) as total_records FROM topic_clicks
UNION ALL
SELECT 'number_clicks' as table_name, COUNT(*) as total_records FROM number_clicks  
UNION ALL
SELECT 'number_box_clicks' as table_name, COUNT(*) as total_records FROM number_box_clicks;

-- 2. Check records for specific user (sing maya)
SELECT 'topic_clicks' as table_name, COUNT(*) as records_for_sing_maya 
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
UNION ALL
SELECT 'number_clicks' as table_name, COUNT(*) as records_for_sing_maya 
FROM number_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
UNION ALL
SELECT 'number_box_clicks (clicked only)' as table_name, COUNT(*) as records_for_sing_maya 
FROM number_box_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985' AND is_clicked = true;

-- 3. Sample data comparison (first 5 records from each table for user 'sing maya')
SELECT 'TOPIC_CLICKS' as source, topic_name, date_key, hour, clicked_number, is_matched, created_at
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check for any potential duplicates in topic_clicks after migration
SELECT topic_name, date_key, hour, clicked_number, COUNT(*) as duplicate_count
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
GROUP BY user_id, topic_name, date_key, hour, clicked_number
HAVING COUNT(*) > 1;

-- 5. Verify hour format consistency (should all be HRx format)
SELECT DISTINCT hour, COUNT(*) as count
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
GROUP BY hour
ORDER BY hour;
