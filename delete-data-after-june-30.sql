-- SQL Script to Delete All Data for User "sing maya" After June 30, 2025
-- This script will clean up all tables that contain date-based data
-- Execute this directly in your Supabase SQL editor

-- WARNING: This will permanently delete data. Make sure you have a backup if needed.

BEGIN;

-- Set variables for the operation
DO $$
DECLARE
    target_user TEXT := 'sing maya';
    cutoff_date DATE := '2025-06-30';
    deleted_count INTEGER;
BEGIN
    RAISE NOTICE 'Starting deletion for user: % after date: %', target_user, cutoff_date;
    
    -- 1. Delete from excel_data table
    DELETE FROM excel_data 
    WHERE user_id = target_user 
    AND date::date > cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from excel_data', deleted_count;
    
    -- 2. Delete from hour_entries table
    DELETE FROM hour_entries 
    WHERE user_id = target_user 
    AND date_key::date > cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from hour_entries', deleted_count;
    
    -- 3. Delete from rule2_analysis_results table
    DELETE FROM rule2_analysis_results 
    WHERE user_id = target_user 
    AND analysis_date::date > cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from rule2_analysis_results', deleted_count;
    
    -- 4. Delete from hr_data table (UserData component)
    DELETE FROM hr_data 
    WHERE user_id = target_user 
    AND date::date > cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from hr_data', deleted_count;
    
    -- 5. Delete from house table (UserData component)
    DELETE FROM house 
    WHERE user_id = target_user 
    AND date::date > cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from house', deleted_count;
    
    -- 6. Delete from processed_data table
    DELETE FROM processed_data 
    WHERE user_id = target_user 
    AND date::date > cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from processed_data', deleted_count;
    
    -- 7. Delete from abcd_sequences table (multiple date columns)
    DELETE FROM abcd_sequences 
    WHERE user_id = target_user 
    AND (trigger_date::date > cutoff_date 
         OR a_date::date > cutoff_date 
         OR b_date::date > cutoff_date 
         OR c_date::date > cutoff_date 
         OR d_date::date > cutoff_date);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from abcd_sequences', deleted_count;
    
    -- 8. Update user_dates table - remove dates after June 30 from JSONB array
    UPDATE user_dates 
    SET dates = (
        SELECT jsonb_agg(date_val)
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date <= cutoff_date
    ),
    updated_at = NOW()
    WHERE user_id = target_user
    AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date > cutoff_date
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % records in user_dates (removed future dates from array)', deleted_count;
    
    -- 9. Update user_dates_abcd table - remove dates after June 30 from JSONB array
    UPDATE user_dates_abcd 
    SET dates = (
        SELECT jsonb_agg(date_val)
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date <= cutoff_date
    ),
    updated_at = NOW()
    WHERE user_id = target_user
    AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date > cutoff_date
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % records in user_dates_abcd (removed future dates from array)', deleted_count;
    
    -- 10. Clean up any other potential tables with date-based data
    -- Delete from excel_uploads if it exists
    DELETE FROM excel_uploads 
    WHERE user_id = target_user 
    AND date::date > cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from excel_uploads', deleted_count;
    
    -- Delete from rule2_results if it exists
    DELETE FROM rule2_results 
    WHERE user_id = target_user 
    AND date::date > cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from rule2_results', deleted_count;
    
    RAISE NOTICE 'Deletion completed successfully for user: %', target_user;
    
END $$;

-- Verify the cleanup by checking remaining dates
SELECT 'excel_data' as table_name, COUNT(*) as remaining_records, 
       MIN(date::date) as earliest_date, MAX(date::date) as latest_date
FROM excel_data 
WHERE user_id = 'sing maya'
UNION ALL
SELECT 'hour_entries' as table_name, COUNT(*) as remaining_records,
       MIN(date_key::date) as earliest_date, MAX(date_key::date) as latest_date
FROM hour_entries 
WHERE user_id = 'sing maya'
UNION ALL
SELECT 'rule2_analysis_results' as table_name, COUNT(*) as remaining_records,
       MIN(analysis_date::date) as earliest_date, MAX(analysis_date::date) as latest_date
FROM rule2_analysis_results 
WHERE user_id = 'sing maya'
UNION ALL
SELECT 'user_dates' as table_name, 
       jsonb_array_length(dates) as remaining_records,
       (SELECT MIN(date_val::date) FROM jsonb_array_elements_text(dates) AS date_val) as earliest_date,
       (SELECT MAX(date_val::date) FROM jsonb_array_elements_text(dates) AS date_val) as latest_date
FROM user_dates 
WHERE user_id = 'sing maya'
UNION ALL
SELECT 'user_dates_abcd' as table_name,
       jsonb_array_length(dates) as remaining_records,
       (SELECT MIN(date_val::date) FROM jsonb_array_elements_text(dates) AS date_val) as earliest_date,
       (SELECT MAX(date_val::date) FROM jsonb_array_elements_text(dates) AS date_val) as latest_date
FROM user_dates_abcd 
WHERE user_id = 'sing maya';

COMMIT;

-- Final verification query to check if any data after June 30, 2025 still exists
DO $$
DECLARE
    table_name TEXT;
    found_count INTEGER;
    total_found INTEGER := 0;
BEGIN
    RAISE NOTICE '=== FINAL VERIFICATION ===';
    RAISE NOTICE 'Checking for any remaining data after 2025-06-30 for user: sing maya';
    
    -- Check each table for remaining data after cutoff date
    FOR table_name IN 
        SELECT unnest(ARRAY['excel_data', 'hour_entries', 'rule2_analysis_results', 'hr_data', 'house', 'processed_data'])
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE user_id = $1 AND %s > $2', 
                      table_name, 
                      CASE 
                          WHEN table_name = 'hour_entries' THEN 'date_key::date'
                          WHEN table_name = 'rule2_analysis_results' THEN 'analysis_date::date'
                          ELSE 'date::date'
                      END
                     ) 
        INTO found_count 
        USING 'sing maya', '2025-06-30'::date;
        
        IF found_count > 0 THEN
            RAISE NOTICE 'WARNING: Found % records in % after June 30, 2025', found_count, table_name;
            total_found := total_found + found_count;
        END IF;
    END LOOP;
    
    IF total_found = 0 THEN
        RAISE NOTICE 'SUCCESS: No data found after June 30, 2025 for user sing maya';
    ELSE
        RAISE NOTICE 'WARNING: Total of % records still exist after June 30, 2025', total_found;
    END IF;
END $$;
