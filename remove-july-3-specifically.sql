-- Specific Script to Remove July 3, 2025 Data for User "sing maya"
-- This script targets the exact date causing the conflict

-- WARNING: This will permanently delete data. Make sure you have a backup if needed.

BEGIN;

-- Set variables for the operation
DO $$
DECLARE
    target_user_text TEXT := '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    target_user_uuid UUID := '5019aa9a-a653-49f5-b7da-f5bc9dcde985'::uuid;
    target_date_text TEXT := '2025-07-03';
    target_date_val DATE := '2025-07-03'::date;
    deleted_count INTEGER;
    total_deleted INTEGER := 0;
BEGIN
    RAISE NOTICE '=== REMOVING JULY 3, 2025 DATA ===';
    RAISE NOTICE 'Target user: %', target_user_text;
    RAISE NOTICE 'Target date: %', target_date_text;
    RAISE NOTICE '';
    
    -- 1. Delete from excel_data table (TEXT user_id)
    DELETE FROM excel_data 
    WHERE user_id = target_user_text 
    AND date = target_date_text;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from excel_data for July 3, 2025', deleted_count;
    total_deleted := total_deleted + deleted_count;
    
    -- 2. Delete from hour_entries table (TEXT user_id)
    DELETE FROM hour_entries 
    WHERE user_id = target_user_text
    AND date_key = target_date_text;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from hour_entries for July 3, 2025', deleted_count;
    total_deleted := total_deleted + deleted_count;
    
    -- 3. Delete from rule2_analysis_results table (TEXT user_id)
    DELETE FROM rule2_analysis_results 
    WHERE user_id = target_user_text 
    AND analysis_date = target_date_val;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from rule2_analysis_results for July 3, 2025', deleted_count;
    total_deleted := total_deleted + deleted_count;
    
    -- 4. Delete from hr_data table (UUID user_id)
    BEGIN
        DELETE FROM hr_data 
        WHERE user_id = target_user_uuid 
        AND date = target_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from hr_data for July 3, 2025', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table hr_data does not exist, skipping';
        WHEN others THEN
            RAISE NOTICE 'Error with hr_data table: %', SQLERRM;
    END;
    
    -- 5. Delete from house table (UUID user_id)
    BEGIN
        DELETE FROM house 
        WHERE user_id = target_user_uuid 
        AND date = target_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from house for July 3, 2025', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table house does not exist, skipping';
        WHEN others THEN
            RAISE NOTICE 'Error with house table: %', SQLERRM;
    END;
    
    -- 6. Delete from processed_data table
    BEGIN
        DELETE FROM processed_data 
        WHERE user_id = target_user_text 
        AND date = target_date_val;

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from processed_data for July 3, 2025', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table processed_data does not exist, skipping';
        WHEN others THEN
            RAISE NOTICE 'Error with processed_data table: %', SQLERRM;
    END;
    
    -- 7. Delete from abcd_sequences table (multiple date columns)
    BEGIN
        DELETE FROM abcd_sequences 
        WHERE user_id = target_user_text 
        AND (trigger_date = target_date_val 
             OR a_date = target_date_val 
             OR b_date = target_date_val 
             OR c_date = target_date_val 
             OR d_date = target_date_val);

        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from abcd_sequences for July 3, 2025', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table abcd_sequences does not exist, skipping';
        WHEN others THEN
            RAISE NOTICE 'Error with abcd_sequences table: %', SQLERRM;
    END;
    
    -- 8. Update user_dates table - remove July 3, 2025 from JSONB array (TEXT user_id)
    UPDATE user_dates 
    SET dates = (
        SELECT jsonb_agg(date_val)
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date != target_date_val
    ),
    updated_at = NOW()
    WHERE user_id = target_user_text
    AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date = target_date_val
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % records in user_dates (removed July 3, 2025 from array)', deleted_count;
    
    -- 9. Update user_dates_abcd table - remove July 3, 2025 from JSONB array (UUID user_id)
    UPDATE user_dates_abcd 
    SET dates = (
        SELECT jsonb_agg(date_val)
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date != target_date_val
    ),
    updated_at = NOW()
    WHERE user_id = target_user_uuid
    AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date = target_date_val
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % records in user_dates_abcd (removed July 3, 2025 from array)', deleted_count;
    
    -- 10. Clean up any other potential tables with July 3, 2025 data
    BEGIN
        DELETE FROM excel_uploads 
        WHERE user_id = target_user_text 
        AND date = target_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from excel_uploads for July 3, 2025', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table excel_uploads does not exist, skipping';
        WHEN others THEN
            RAISE NOTICE 'Error with excel_uploads table: %', SQLERRM;
    END;
    
    BEGIN
        DELETE FROM rule2_results 
        WHERE user_id = target_user_text 
        AND date::date = target_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from rule2_results for July 3, 2025', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table rule2_results does not exist, skipping';
        WHEN others THEN
            RAISE NOTICE 'Error with rule2_results table: %', SQLERRM;
    END;
    
    -- 11. Check for any additional tables that might have July 3, 2025 data
    BEGIN
        DELETE FROM user_planets 
        WHERE user_id = target_user_text 
        AND date = target_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from user_planets for July 3, 2025', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table user_planets does not exist, skipping';
        WHEN others THEN
            RAISE NOTICE 'Error with user_planets table: %', SQLERRM;
    END;
    
    BEGIN
        DELETE FROM calculation_cache 
        WHERE user_id = target_user_text 
        AND date = target_date_val;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % records from calculation_cache for July 3, 2025', deleted_count;
        total_deleted := total_deleted + deleted_count;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table calculation_cache does not exist, skipping';
        WHEN others THEN
            RAISE NOTICE 'Error with calculation_cache table: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== DELETION SUMMARY ===';
    RAISE NOTICE 'Total records deleted for July 3, 2025: %', total_deleted;
    RAISE NOTICE 'Cleanup completed successfully for user: %', target_user_text;
    RAISE NOTICE '';
    
END $$;

-- Comprehensive verification to check for any remaining July 3, 2025 data
DO $$
DECLARE
    target_user_text TEXT := '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    target_user_uuid UUID := '5019aa9a-a653-49f5-b7da-f5bc9dcde985'::uuid;
    target_date_val DATE := '2025-07-03'::date;
    record_count INTEGER;
    total_found INTEGER := 0;
BEGIN
    RAISE NOTICE '=== VERIFICATION: CHECKING FOR JULY 3, 2025 DATA ===';
    
    -- Check each table for July 3, 2025 data
    SELECT COUNT(*) INTO record_count FROM excel_data 
    WHERE user_id = target_user_text AND date = '2025-07-03';
    IF record_count > 0 THEN
        RAISE NOTICE 'WARNING: Found % records in excel_data for July 3, 2025', record_count;
        total_found := total_found + record_count;
    ELSE
        RAISE NOTICE 'excel_data: Clean (0 records for July 3, 2025)';
    END IF;
    
    SELECT COUNT(*) INTO record_count FROM hour_entries 
    WHERE user_id = target_user_text AND date_key = '2025-07-03';
    IF record_count > 0 THEN
        RAISE NOTICE 'WARNING: Found % records in hour_entries for July 3, 2025', record_count;
        total_found := total_found + record_count;
    ELSE
        RAISE NOTICE 'hour_entries: Clean (0 records for July 3, 2025)';
    END IF;
    
    SELECT COUNT(*) INTO record_count FROM rule2_analysis_results 
    WHERE user_id = target_user_text AND analysis_date = target_date_val;
    IF record_count > 0 THEN
        RAISE NOTICE 'WARNING: Found % records in rule2_analysis_results for July 3, 2025', record_count;
        total_found := total_found + record_count;
    ELSE
        RAISE NOTICE 'rule2_analysis_results: Clean (0 records for July 3, 2025)';
    END IF;
    
    -- Check JSONB arrays
    SELECT COUNT(*) INTO record_count FROM user_dates 
    WHERE user_id = target_user_text AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date = target_date_val
    );
    IF record_count > 0 THEN
        RAISE NOTICE 'WARNING: Found % arrays in user_dates containing July 3, 2025', record_count;
        total_found := total_found + record_count;
    ELSE
        RAISE NOTICE 'user_dates: Clean (0 arrays contain July 3, 2025)';
    END IF;
    
    SELECT COUNT(*) INTO record_count FROM user_dates_abcd 
    WHERE user_id = target_user_uuid AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(dates) AS date_val
        WHERE date_val::date = target_date_val
    );
    IF record_count > 0 THEN
        RAISE NOTICE 'WARNING: Found % arrays in user_dates_abcd containing July 3, 2025', record_count;
        total_found := total_found + record_count;
    ELSE
        RAISE NOTICE 'user_dates_abcd: Clean (0 arrays contain July 3, 2025)';
    END IF;
    
    RAISE NOTICE '';
    IF total_found = 0 THEN
        RAISE NOTICE 'SUCCESS: No July 3, 2025 data found for user sing maya';
        RAISE NOTICE 'You should now be able to add July 3, 2025 without conflicts!';
    ELSE
        RAISE NOTICE 'WARNING: Total of % July 3, 2025 records still exist', total_found;
        RAISE NOTICE 'Additional manual cleanup may be required.';
    END IF;
    RAISE NOTICE '';
    
END $$;

COMMIT;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== JULY 3, 2025 CLEANUP COMPLETE ===';
    RAISE NOTICE 'Specific cleanup for July 3, 2025 has been completed';
    RAISE NOTICE 'Try adding July 3, 2025 again in your application';
    RAISE NOTICE '';
END $$;
