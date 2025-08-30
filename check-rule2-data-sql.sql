-- Check Rule-2 analysis data for 2025-08-21
-- This will show us what ABCD/BCD data exists for today

SELECT 
  user_id,
  hr_number,
  set_name,
  topic_name,
  abcd_numbers,
  bcd_numbers,
  created_at
FROM topic_analysis_results 
WHERE analysis_date = '2025-08-21'
  AND (set_name LIKE '%D-1%Set-1%' OR topic_name LIKE '%D-1%Set-1%')
ORDER BY user_id, hr_number, set_name;

-- Also check all data for today
SELECT 
  user_id,
  hr_number,
  set_name,
  COUNT(*) as record_count
FROM topic_analysis_results 
WHERE analysis_date = '2025-08-21'
GROUP BY user_id, hr_number, set_name
ORDER BY user_id, hr_number, set_name;
