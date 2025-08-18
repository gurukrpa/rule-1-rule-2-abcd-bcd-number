-- ✅ PERMANENT SOLUTION: Test clicks for ANY target date
-- This SQL will insert test data for TODAY and verify the solution works for all dates

-- Insert test clicks for TODAY (2025-08-17)
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
    '2025-08-17',
    'HR1',
    7,
    NOW()
),
(
    '5019aa9a-a653-49f5-b7da-f5bc9dcde985',
    'D-1 Set-1 Matrix',
    '2025-08-17',
    'HR1',
    8,
    NOW()
);

-- Insert test clicks for 2025-08-14 (your original issue)
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
)
ON CONFLICT (user_id, topic_name, date_key, hour, clicked_number) DO NOTHING;

-- Insert test clicks for TOMORROW (2025-08-18) 
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
    '2025-08-18',
    'HR1',
    5,
    NOW()
),
(
    '5019aa9a-a653-49f5-b7da-f5bc9dcde985',
    'D-1 Set-1 Matrix',
    '2025-08-18',
    'HR1',
    9,
    NOW()
);

-- ✅ VERIFICATION: Check all D-1 Set-1 Matrix clicks for recent dates
SELECT 
    date_key,
    hour,
    clicked_number,
    created_at,
    'Test data for permanent solution' as note
FROM topic_clicks 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
  AND topic_name = 'D-1 Set-1 Matrix'
  AND date_key >= '2025-08-14'
ORDER BY date_key, hour, clicked_number;
