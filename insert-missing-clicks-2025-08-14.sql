-- Insert the missing clicks for numbers 7 and 8 on 2025-08-14
-- Run this in Supabase SQL editor

INSERT INTO topic_clicks (
    user_id,
    topic_name,
    date_key,
    hour,
    clicked_number,
    created_at
) VALUES 
(
    '5019aa9a-a653-49f5-b7da-f5bc9dcde985',
    'D-1 Set-1 Matrix',
    '2025-08-14',
    'HR1',
    7,
    NOW()
),
(
    '5019aa9a-a653-49f5-b7da-f5bc9dcde985',
    'D-1 Set-1 Matrix',
    '2025-08-14',
    'HR1',
    8,
    NOW()
);

-- Verify the insertion
SELECT 
    user_id,
    topic_name,
    date_key,
    hour,
    clicked_number,
    created_at
FROM topic_clicks 
WHERE date_key = '2025-08-14'
ORDER BY clicked_number;
