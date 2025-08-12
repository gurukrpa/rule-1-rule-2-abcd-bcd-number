-- Check the actual schema of tables to see what columns exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('excel_data', 'hour_entries', 'users')
ORDER BY table_name, ordinal_position;
