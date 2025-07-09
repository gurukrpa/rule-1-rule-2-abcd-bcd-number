-- Simplified SQL Script to Delete All Data for User "sing maya" After June 30, 2025
-- This version uses string comparison to avoid type casting issues

-- WARNING: This will permanently delete data. Make sure you have a backup if needed.

BEGIN;

-- Set variables for the operation
DO $$
DECLARE
    target_user TEXT := '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    cutoff_date_text TEXT := '2025-06-30';
    cutoff_date_val DATE := '2025-06-30'::date;
    deleted_count INTEGER;
    total_deleted INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting deletion for user: % after date: %', target_user, cutoff_date_text;
    
    -- 1. Delete from excel_data table
    DELETE FROM excel_data 
    WHERE user_id = target_user 
    AND date > cutoff_date_text;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from excel_data', deleted_count;
    total_deleted := total_deleted + deleted_count;
    
    -- 2. Delete from hour_entries table
    DELETE FROM hour_entries 
    WHERE user_id = target_user
    AND date_key > cutoff_date_text;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from hour_entries', deleted_count;
    total_deleted := total_deleted + deleted_count;
    
    -- 3. Delete from rule2_analysis_results table
    DELETE FROM rule2_analysis_results 
    WHERE user_id = target_user 
    AND analysis_date > cutoff_date_val;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from rule2_analysis_results', deleted_count;
    total_deleted := total_deleted + deleted_count;
    
    -- 4. Delete from hr_data table (UserData component)
    DELETE FROM hr_data 
    WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985' 
    AND date > cutoff_date_val;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from hr_data', deleted_count;
    total_deleted := total_deleted + deleted_count;
    
    -- 5. Delete from house table (UserData component)
    DELETE FROM house 
    WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985' 
    AND date > cutoff_date_val;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from house', deleted_count;
    total_deleted := total_deleted + deleted_count;
    
    -- 6. Delete from processed_data table
    BEGIN
        DELETE FROM processed_data 
        WHERE user_id = target_user 
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
        WHERE user_id = target_user 
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
    
    -- 8. Update user_dates table - remove dates after June 30 from JSONB array
    UPDATE user_dates 
    SET dates = (
        SELECT jsonb_agg(date_val)
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date <= cutoff_date_val
    ),
    updated_at = NOW()
    WHERE user_id = target_user
    AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date > cutoff_date_val
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % records in user_dates (removed future dates from array)', deleted_count;
    
    -- 9. Update user_dates_abcd table - remove dates after June 30 from JSONB array
    UPDATE user_dates_abcd 
    SET dates = (
        SELECT jsonb_agg(date_val)
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date <= cutoff_date_val
    ),
    updated_at = NOW()
    WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
    AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date > cutoff_date_val
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % records in user_dates_abcd (removed future dates from array)', deleted_count;
    
    -- 10. Clean up any other potential tables with date-based data
    -- These may not exist, so we ignore errors
    BEGIN
        DELETE FROM excel_uploads 
        WHERE user_id = target_user 
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
        WHERE user_id = target_user 
        AND date::date > cutoff_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from rule2_results', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table rule2_results does not exist, skipping';
    END;
    
    RAISE NOTICE '=== DELETION SUMMARY ===';
    RAISE NOTICE 'Total records deleted: %', total_deleted;
    RAISE NOTICE 'Deletion completed successfully for user: %', target_user;
    
END $$;

-- Verify the cleanup by checking remaining dates
SELECT 'excel_data' as table_name, COUNT(*) as remaining_records, 
       MIN(date)::text as earliest_date, MAX(date)::text as latest_date
FROM excel_data 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
UNION ALL
SELECT 'hour_entries' as table_name, COUNT(*) as remaining_records,
       MIN(date_key)::text as earliest_date, MAX(date_key)::text as latest_date
FROM hour_entries 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
UNION ALL
SELECT 'rule2_analysis_results' as table_name, COUNT(*) as remaining_records,
       MIN(analysis_date)::text as earliest_date, MAX(analysis_date)::text as latest_date
FROM rule2_analysis_results 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
UNION ALL
SELECT 'user_dates' as table_name, 
       jsonb_array_length(dates) as remaining_records,
       (SELECT MIN(date_val::date)::text FROM jsonb_array_elements_text(dates) AS date_val) as earliest_date,
       (SELECT MAX(date_val::date)::text FROM jsonb_array_elements_text(dates) AS date_val) as latest_date
FROM user_dates 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
UNION ALL
SELECT 'user_dates_abcd' as table_name,
       jsonb_array_length(dates) as remaining_records,
       (SELECT MIN(date_val::date)::text FROM jsonb_array_elements_text(dates) AS date_val) as earliest_date,
       (SELECT MAX(date_val::date)::text FROM jsonb_array_elements_text(dates) AS date_val) as latest_date
FROM user_dates_abcd 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';

COMMIT;

-- Final verification query to check if any data after June 30, 2025 still exists
DO $$
DECLARE
    found_excel INTEGER;
    found_hour INTEGER;
    found_analysis INTEGER;
    total_found INTEGER := 0;
BEGIN
    RAISE NOTICE '=== FINAL VERIFICATION ===';
    RAISE NOTICE 'Checking for any remaining data after 2025-06-30 for user: sing maya';
    
    -- Check excel_data
    SELECT COUNT(*) INTO found_excel 
    FROM excel_data 
    WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985' AND date > '2025-06-30';
    
    -- Check hour_entries
    SELECT COUNT(*) INTO found_hour 
    FROM hour_entries 
    WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985' AND date_key > '2025-06-30';
    
    -- Check rule2_analysis_results
    SELECT COUNT(*) INTO found_analysis 
    FROM rule2_analysis_results 
    WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985' AND analysis_date > '2025-06-30';
    
    total_found := found_excel + found_hour + found_analysis;
    
    IF found_excel > 0 THEN
        RAISE NOTICE 'WARNING: Found % records in excel_data after June 30, 2025', found_excel;
    END IF;
    
    IF found_hour > 0 THEN
        RAISE NOTICE 'WARNING: Found % records in hour_entries after June 30, 2025', found_hour;
    END IF;
    
    IF found_analysis > 0 THEN
        RAISE NOTICE 'WARNING: Found % records in rule2_analysis_results after June 30, 2025', found_analysis;
    END IF;
    
    IF total_found = 0 THEN
        RAISE NOTICE 'SUCCESS: No data found after June 30, 2025 for user sing maya';
        RAISE NOTICE 'You should now be able to add new dates after June 30, 2025';
    ELSE
        RAISE NOTICE 'WARNING: Total of % records still exist after June 30, 2025', total_found;
    END IF;
END $$;

-- Check for the presence of the date '3 July 2025' in all relevant tables for the user '5019aa9a-a653-49f5-b7da-f5bc9dcde985'
DO $$
DECLARE
    target_user TEXT := '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    specific_date DATE := '2025-07-03';
    found_count INTEGER;
BEGIN
    RAISE NOTICE '=== CHECKING FOR RESIDUAL DATA ===';

    -- Check excel_data
    SELECT COUNT(*) INTO found_count
    FROM excel_data
    WHERE user_id = target_user AND date = specific_date::text;
    IF found_count > 0 THEN
        RAISE NOTICE 'Found % records in excel_data for 3 July 2025', found_count;
    END IF;

    -- Check hour_entries
    SELECT COUNT(*) INTO found_count
    FROM hour_entries
    WHERE user_id = target_user AND date_key = specific_date::text;
    IF found_count > 0 THEN
        RAISE NOTICE 'Found % records in hour_entries for 3 July 2025', found_count;
    END IF;

    -- Check rule2_analysis_results
    SELECT COUNT(*) INTO found_count
    FROM rule2_analysis_results
    WHERE user_id = target_user AND analysis_date = specific_date;
    IF found_count > 0 THEN
        RAISE NOTICE 'Found % records in rule2_analysis_results for 3 July 2025', found_count;
    END IF;

    -- Check user_dates JSONB array
    SELECT COUNT(*) INTO found_count
    FROM user_dates
    WHERE user_id = target_user AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date = specific_date
    );
    IF found_count > 0 THEN
        RAISE NOTICE 'Found % records in user_dates JSONB array for 3 July 2025', found_count;
    END IF;

    -- Check user_dates_abcd JSONB array
    SELECT COUNT(*) INTO found_count
    FROM user_dates_abcd
    WHERE user_id = target_user::uuid AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date = specific_date
    );
    IF found_count > 0 THEN
        RAISE NOTICE 'Found % records in user_dates_abcd JSONB array for 3 July 2025', found_count;
    END IF;

    RAISE NOTICE '=== CHECK COMPLETE ===';
END $$;
