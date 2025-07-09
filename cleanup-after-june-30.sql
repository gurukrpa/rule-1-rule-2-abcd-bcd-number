-- Comprehensive Script to Delete All Data After June 30, 2025 for User "sing maya"
-- This script will clean up all tables and JSONB arrays to remove future dates

-- WARNING: This will permanently delete data. Make sure you have a backup if needed.

BEGIN;

-- Set variables for the operation
DO $$
DECLARE
    target_user_text TEXT := '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    target_user_uuid UUID := '5019aa9a-a653-49f5-b7da-f5bc9dcde985'::uuid;
    cutoff_date_text TEXT := '2025-06-30';
    cutoff_date_val DATE := '2025-06-30'::date;
    deleted_count INTEGER;
    total_deleted INTEGER := 0;
BEGIN
    RAISE NOTICE '=== STARTING COMPREHENSIVE CLEANUP ===';
    RAISE NOTICE 'Target user: %', target_user_text;
    RAISE NOTICE 'Cutoff date: %', cutoff_date_text;
    RAISE NOTICE '';
    
    -- 1. Delete from excel_data table (TEXT user_id)
    DELETE FROM excel_data 
    WHERE user_id = target_user_text 
    AND date > cutoff_date_text;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from excel_data', deleted_count;
    total_deleted := total_deleted + deleted_count;
    
    -- 2. Delete from hour_entries table (TEXT user_id)
    DELETE FROM hour_entries 
    WHERE user_id = target_user_text
    AND date_key > cutoff_date_text;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from hour_entries', deleted_count;
    total_deleted := total_deleted + deleted_count;
    
    -- 3. Delete from rule2_analysis_results table (TEXT user_id)
    DELETE FROM rule2_analysis_results 
    WHERE user_id = target_user_text 
    AND analysis_date > cutoff_date_val;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from rule2_analysis_results', deleted_count;
    total_deleted := total_deleted + deleted_count;
    
    -- 4. Delete from hr_data table (UUID user_id)
    BEGIN
        DELETE FROM hr_data 
        WHERE user_id = target_user_uuid 
        AND date > cutoff_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from hr_data', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table hr_data does not exist, skipping';
    END;
    
    -- 5. Delete from house table (UUID user_id)
    BEGIN
        DELETE FROM house 
        WHERE user_id = target_user_uuid 
        AND date > cutoff_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from house', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table house does not exist, skipping';
    END;
    
    -- 6. Delete from processed_data table
    BEGIN
        DELETE FROM processed_data 
        WHERE user_id = target_user_text 
        AND date > cutoff_date_val;

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from processed_data', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table processed_data does not exist, skipping';
    END;
    
    -- 7. Delete from abcd_sequences table (multiple date columns)
    BEGIN
        DELETE FROM abcd_sequences 
        WHERE user_id = target_user_text 
        AND (trigger_date > cutoff_date_val 
             OR a_date > cutoff_date_val 
             OR b_date > cutoff_date_val 
             OR c_date > cutoff_date_val 
             OR d_date > cutoff_date_val);

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from abcd_sequences', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table abcd_sequences does not exist, skipping';
    END;
    
    -- 8. Update user_dates table - remove dates after June 30 from JSONB array (TEXT user_id)
    UPDATE user_dates 
    SET dates = (
        SELECT jsonb_agg(date_val)
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date <= cutoff_date_val
    ),
    updated_at = NOW()
    WHERE user_id = target_user_text
    AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date > cutoff_date_val
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % records in user_dates (removed future dates from array)', deleted_count;
    
    -- 9. Update user_dates_abcd table - remove dates after June 30 from JSONB array (UUID user_id)
    UPDATE user_dates_abcd 
    SET dates = (
        SELECT jsonb_agg(date_val)
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date <= cutoff_date_val
    ),
    updated_at = NOW()
    WHERE user_id = target_user_uuid
    AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date > cutoff_date_val
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % records in user_dates_abcd (removed future dates from array)', deleted_count;
    
    -- 10. Clean up any other potential tables with date-based data
    BEGIN
        DELETE FROM excel_uploads 
        WHERE user_id = target_user_text 
        AND date > cutoff_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from excel_uploads', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table excel_uploads does not exist, skipping';
    END;
    
    BEGIN
        DELETE FROM rule2_results 
        WHERE user_id = target_user_text 
        AND date::date > cutoff_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from rule2_results', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table rule2_results does not exist, skipping';
    END;
    
    -- 11. Clean up any additional tables that might have date data
    BEGIN
        DELETE FROM user_planets 
        WHERE user_id = target_user_text 
        AND date > cutoff_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from user_planets', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table user_planets does not exist, skipping';
    END;
    
    BEGIN
        DELETE FROM calculation_cache 
        WHERE user_id = target_user_text 
        AND date > cutoff_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from calculation_cache', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table calculation_cache does not exist, skipping';
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== DELETION SUMMARY ===';
    RAISE NOTICE 'Total records deleted: %', total_deleted;
    RAISE NOTICE 'Cleanup completed successfully for user: %', target_user_text;
    RAISE NOTICE '';
    
END $$;

-- Verify the cleanup by checking remaining dates in all tables
DO $$
DECLARE
    target_user_text TEXT := '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    target_user_uuid UUID := '5019aa9a-a653-49f5-b7da-f5bc9dcde985'::uuid;
    record_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICATION OF CLEANUP ===';
    
    -- Check each table for remaining data after June 30, 2025
    SELECT COUNT(*) INTO record_count FROM excel_data 
    WHERE user_id = target_user_text AND date > '2025-06-30';
    RAISE NOTICE 'excel_data: % records after June 30', record_count;
    
    SELECT COUNT(*) INTO record_count FROM hour_entries 
    WHERE user_id = target_user_text AND date_key > '2025-06-30';
    RAISE NOTICE 'hour_entries: % records after June 30', record_count;
    
    SELECT COUNT(*) INTO record_count FROM rule2_analysis_results 
    WHERE user_id = target_user_text AND analysis_date > '2025-06-30';
    RAISE NOTICE 'rule2_analysis_results: % records after June 30', record_count;
    
    -- Check JSONB arrays
    SELECT COUNT(*) INTO record_count FROM user_dates 
    WHERE user_id = target_user_text AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date > '2025-06-30'
    );
    RAISE NOTICE 'user_dates: % arrays with dates after June 30', record_count;
    
    SELECT COUNT(*) INTO record_count FROM user_dates_abcd 
    WHERE user_id = target_user_uuid AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date > '2025-06-30'
    );
    RAISE NOTICE 'user_dates_abcd: % arrays with dates after June 30', record_count;
    
    RAISE NOTICE '';
    RAISE NOTICE 'If all counts are 0, cleanup was successful!';
    RAISE NOTICE 'You should now be able to add July 3, 2025 and later dates.';
    
END $$;

-- Final summary query
SELECT 'excel_data' as table_name, COUNT(*) as remaining_records, 
       COALESCE(MIN(date), 'No data') as earliest_date, 
       COALESCE(MAX(date), 'No data') as latest_date
FROM excel_data 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
UNION ALL
SELECT 'hour_entries' as table_name, COUNT(*) as remaining_records,
       COALESCE(MIN(date_key), 'No data') as earliest_date, 
       COALESCE(MAX(date_key), 'No data') as latest_date
FROM hour_entries 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
UNION ALL
SELECT 'rule2_analysis_results' as table_name, COUNT(*) as remaining_records,
       COALESCE(MIN(analysis_date)::text, 'No data') as earliest_date, 
       COALESCE(MAX(analysis_date)::text, 'No data') as latest_date
FROM rule2_analysis_results 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
UNION ALL
SELECT 'user_dates' as table_name, 
       COALESCE(jsonb_array_length(dates), 0) as remaining_records,
       COALESCE((SELECT MIN(date_val::date)::text FROM jsonb_array_elements_text(dates) AS date_val), 'No data') as earliest_date,
       COALESCE((SELECT MAX(date_val::date)::text FROM jsonb_array_elements_text(dates) AS date_val), 'No data') as latest_date
FROM user_dates 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
UNION ALL
SELECT 'user_dates_abcd' as table_name,
       COALESCE(jsonb_array_length(dates), 0) as remaining_records,
       COALESCE((SELECT MIN(date_val::date)::text FROM jsonb_array_elements_text(dates) AS date_val), 'No data') as earliest_date,
       COALESCE((SELECT MAX(date_val::date)::text FROM jsonb_array_elements_text(dates) AS date_val), 'No data') as latest_date
FROM user_dates_abcd 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'::uuid;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CLEANUP COMPLETE ===';
    RAISE NOTICE 'All data after June 30, 2025 has been removed for user "sing maya"';
    RAISE NOTICE 'You can now safely add July 3, 2025 and any future dates';
    RAISE NOTICE '';
END $$;
