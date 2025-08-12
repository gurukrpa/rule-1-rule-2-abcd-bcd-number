-- SCHEMA ALIGNMENT FIX: Make database match application expectations
-- This adds the missing columns that your application expects

-- Fix excel_data table to match application expectations
ALTER TABLE excel_data 
ADD COLUMN IF NOT EXISTS date_key TEXT;

ALTER TABLE excel_data 
ADD COLUMN IF NOT EXISTS file_data JSONB;

-- Populate the new columns with data from existing columns
UPDATE excel_data 
SET date_key = date::text 
WHERE date_key IS NULL;

UPDATE excel_data 
SET file_data = data 
WHERE file_data IS NULL;

-- Verify the fix worked
SELECT 
    'excel_data schema fix complete' as status,
    count(*) as total_records,
    count(*) FILTER (WHERE date_key IS NOT NULL) as records_with_date_key,
    count(*) FILTER (WHERE file_data IS NOT NULL) as records_with_file_data
FROM excel_data;

-- Test query to ensure app can now read the data
SELECT 
    user_id,
    date_key,
    file_name,
    CASE 
        WHEN file_data IS NOT NULL THEN 'Has Excel Data' 
        ELSE 'No Excel Data' 
    END as data_status
FROM excel_data 
WHERE user_id = 'sing maya'
LIMIT 5;
