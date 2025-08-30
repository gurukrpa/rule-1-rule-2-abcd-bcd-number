-- Check Rule-2 data for 2025-08-21 hour 2
SELECT 
  hour,
  topic_numbers,
  jsonb_object_keys(topic_numbers) as topics
FROM rule2_analysis_results 
WHERE date = '2025-08-21'
ORDER BY hour;

-- Check specifically for hour 2
SELECT 
  'Hour 2 data:' as label,
  topic_numbers
FROM rule2_analysis_results 
WHERE date = '2025-08-21' AND hour = 2;
