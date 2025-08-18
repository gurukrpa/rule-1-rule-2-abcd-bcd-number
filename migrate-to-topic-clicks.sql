-- Migration script to consolidate number box click data into topic_clicks table
-- This script migrates data from number_clicks and number_box_clicks to topic_clicks

-- Step 1: Migrate data from number_clicks table to topic_clicks
INSERT INTO topic_clicks (user_id, topic_name, date_key, hour, clicked_number, is_matched, created_at, updated_at)
SELECT 
    user_id,
    topic as topic_name,
    date_key::date as date_key,  -- <-- cast text to date to match topic_clicks format
    CONCAT('HR', hour) as hour,  -- <-- format hour as HRx to match topic_clicks format
    number as clicked_number,
    true as is_matched,  -- Assume all clicks are matched for migration
    COALESCE(number_clicks.created_at, NOW()) as created_at,
    NOW() as updated_at  -- Set current timestamp as updated_at
FROM number_clicks
WHERE NOT EXISTS (
    SELECT 1 FROM topic_clicks tc 
    WHERE tc.user_id = number_clicks.user_id 
    AND tc.topic_name = number_clicks.topic 
    AND tc.date_key = number_clicks.date_key::date  -- <-- cast text to date for comparison
    AND tc.hour = CONCAT('HR', number_clicks.hour)  -- <-- format hour as HRx to match topic_clicks format
    AND tc.clicked_number = number_clicks.number
);

-- Step 2: Migrate data from number_box_clicks table to topic_clicks
INSERT INTO topic_clicks (user_id, topic_name, date_key, hour, clicked_number, is_matched, created_at, updated_at)
SELECT 
    user_id,
    set_name as topic_name,
    date_key::date as date_key,  -- <-- cast text to date to match topic_clicks format
    CONCAT('HR', hr_number) as hour,
    number_value as clicked_number,
    is_present as is_matched,
    NOW() as created_at,  -- <-- use current timestamp since created_at doesn't exist in number_box_clicks
    COALESCE(number_box_clicks.updated_at, NOW()) as updated_at
FROM number_box_clicks
WHERE is_clicked = true  -- Only migrate clicked numbers
AND NOT EXISTS (
    SELECT 1 FROM topic_clicks tc 
    WHERE tc.user_id = number_box_clicks.user_id 
    AND tc.topic_name = number_box_clicks.set_name 
    AND tc.date_key = number_box_clicks.date_key::date  -- <-- cast text to date for comparison
    AND tc.hour = CONCAT('HR', number_box_clicks.hr_number)
    AND tc.clicked_number = number_box_clicks.number_value
);

-- Step 3: Verify migration (run this to check the data)
-- SELECT 'topic_clicks' as source, COUNT(*) as count FROM topic_clicks
-- UNION ALL
-- SELECT 'number_clicks' as source, COUNT(*) as count FROM number_clicks  
-- UNION ALL
-- SELECT 'number_box_clicks' as source, COUNT(*) as count FROM number_box_clicks WHERE is_clicked = true;

-- Step 4: After verifying data, you can optionally drop the old tables
-- WARNING: Only run these after confirming all data is migrated correctly
-- DROP TABLE IF EXISTS number_clicks;
-- DROP TABLE IF EXISTS number_box_clicks;
