-- STEP 1B: Simple table existence and row count check
-- Run this if the previous script returned "No rows returned"

-- First, let's see what tables actually exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Then check row counts for specific tables we expect
SELECT 'users' as table_name, count(*) as row_count FROM public.users
UNION ALL
SELECT 'excel_data' as table_name, count(*) as row_count FROM public.excel_data
UNION ALL  
SELECT 'hour_entries' as table_name, count(*) as row_count FROM public.hour_entries
UNION ALL
SELECT 'number_box_clicks' as table_name, count(*) as row_count FROM public.number_box_clicks
UNION ALL
SELECT 'rule2_analysis_results' as table_name, count(*) as row_count FROM public.rule2_analysis_results
ORDER BY table_name;
