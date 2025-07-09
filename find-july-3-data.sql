-- Comprehensive Diagnostic Script to Find ALL July 3, 2025 Data
-- This script will search every possible location where the date might exist

-- Check all tables that might contain the problematic date
DO $$
DECLARE
    target_user_text TEXT := '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    target_user_uuid UUID := '5019aa9a-a653-49f5-b7da-f5bc9dcde985'::uuid;
    target_date_variants TEXT[] := ARRAY['2025-07-03', '2025-7-3', '2025-7-03', '2025-07-3', '03/07/2025', '3/7/2025', '07/03/2025', '7/3/2025'];
    target_date_val DATE := '2025-07-03'::date;
    record_count INTEGER;
    total_found INTEGER := 0;
    variant TEXT;
BEGIN
    RAISE NOTICE '=== COMPREHENSIVE SEARCH FOR JULY 3, 2025 DATA ===';
    RAISE NOTICE 'Target user: %', target_user_text;
    RAISE NOTICE 'Searching for date variants: %', target_date_variants;
    RAISE NOTICE '';
    
    -- Search excel_data table with all date variants
    FOREACH variant IN ARRAY target_date_variants
    LOOP
        BEGIN
            SELECT COUNT(*) INTO record_count FROM excel_data 
            WHERE user_id = target_user_text AND date = variant;
            IF record_count > 0 THEN
                RAISE NOTICE 'FOUND: % records in excel_data with date format: %', record_count, variant;
                total_found := total_found + record_count;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Skip invalid date formats
        END;
    END LOOP;
    
    -- Search hour_entries table with all date variants
    FOREACH variant IN ARRAY target_date_variants
    LOOP
        BEGIN
            SELECT COUNT(*) INTO record_count FROM hour_entries 
            WHERE user_id = target_user_text AND date_key = variant;
            IF record_count > 0 THEN
                RAISE NOTICE 'FOUND: % records in hour_entries with date_key format: %', record_count, variant;
                total_found := total_found + record_count;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Skip invalid date formats
        END;
    END LOOP;
    
    -- Search rule2_analysis_results with DATE comparison
    SELECT COUNT(*) INTO record_count FROM rule2_analysis_results 
    WHERE user_id = target_user_text AND analysis_date = target_date_val;
    IF record_count > 0 THEN
        RAISE NOTICE 'FOUND: % records in rule2_analysis_results with analysis_date: %', record_count, target_date_val;
        total_found := total_found + record_count;
    END IF;
    
    -- Search user_dates JSONB arrays with all variants
    FOREACH variant IN ARRAY target_date_variants
    LOOP
        BEGIN
            SELECT COUNT(*) INTO record_count FROM user_dates 
            WHERE user_id = target_user_text AND dates::text LIKE '%' || variant || '%';
            IF record_count > 0 THEN
                RAISE NOTICE 'FOUND: % records in user_dates JSONB containing: %', record_count, variant;
                total_found := total_found + record_count;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Skip invalid searches
        END;
    END LOOP;
    
    -- Search user_dates_abcd JSONB arrays with all variants
    FOREACH variant IN ARRAY target_date_variants
    LOOP
        BEGIN
            SELECT COUNT(*) INTO record_count FROM user_dates_abcd 
            WHERE user_id = target_user_uuid AND dates::text LIKE '%' || variant || '%';
            IF record_count > 0 THEN
                RAISE NOTICE 'FOUND: % records in user_dates_abcd JSONB containing: %', record_count, variant;
                total_found := total_found + record_count;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Skip invalid searches
        END;
    END LOOP;
    
    -- Check for any tables with similar patterns
    BEGIN
        SELECT COUNT(*) INTO record_count FROM abcd_sequences 
        WHERE user_id = target_user_text AND (
            trigger_date = target_date_val OR
            a_date = target_date_val OR
            b_date = target_date_val OR
            c_date = target_date_val OR
            d_date = target_date_val
        );
        IF record_count > 0 THEN
            RAISE NOTICE 'FOUND: % records in abcd_sequences with July 3, 2025', record_count;
            total_found := total_found + record_count;
        END IF;
    EXCEPTION 
        WHEN undefined_table THEN
            RAISE NOTICE 'Table abcd_sequences does not exist';
    END;
    
    -- Check for any constraint violations or unique indexes
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING CONSTRAINTS AND INDEXES ===';
    
    -- List all constraints that might involve dates
    FOR record_count IN 
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'UNIQUE' 
        AND ccu.column_name LIKE '%date%'
        AND tc.table_name IN ('excel_data', 'hour_entries', 'rule2_analysis_results', 'user_dates', 'user_dates_abcd', 'abcd_sequences')
    LOOP
        RAISE NOTICE 'Found date-related unique constraint in database';
        EXIT;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== SUMMARY ===';
    IF total_found > 0 THEN
        RAISE NOTICE 'TOTAL FOUND: % records containing July 3, 2025 data', total_found;
        RAISE NOTICE 'The conflict is caused by existing data in the database';
    ELSE
        RAISE NOTICE 'NO RECORDS FOUND: This suggests the conflict might be:';
        RAISE NOTICE '1. In application cache/session storage';
        RAISE NOTICE '2. In a table we have not checked';
        RAISE NOTICE '3. In a different date format/encoding';
        RAISE NOTICE '4. A constraint or trigger issue';
    END IF;
    
END $$;

-- Show actual data for verification
SELECT 'excel_data - Raw Data' as source, user_id, date, created_at::text as timestamp_info
FROM excel_data 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985' 
AND (date LIKE '%2025-07-03%' OR date LIKE '%07/03/2025%' OR date LIKE '%7/3/2025%')
UNION ALL
SELECT 'hour_entries - Raw Data' as source, user_id, date_key, created_at::text 
FROM hour_entries 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985' 
AND (date_key LIKE '%2025-07-03%' OR date_key LIKE '%07/03/2025%' OR date_key LIKE '%7/3/2025%')
UNION ALL
SELECT 'user_dates - JSONB Content' as source, user_id, dates::text, updated_at::text 
FROM user_dates 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985' 
AND (dates::text LIKE '%2025-07-03%' OR dates::text LIKE '%07/03/2025%' OR dates::text LIKE '%7/3/2025%')
UNION ALL
SELECT 'user_dates_abcd - JSONB Content' as source, user_id::text, dates::text, updated_at::text 
FROM user_dates_abcd 
WHERE user_id = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'::uuid 
AND (dates::text LIKE '%2025-07-03%' OR dates::text LIKE '%07/03/2025%' OR dates::text LIKE '%7/3/2025%');

-- List all tables that might contain user or date data
SELECT 'All Tables with Potential Date Columns' as info, 
       table_name, 
       column_name, 
       data_type
FROM information_schema.columns 
WHERE (column_name LIKE '%date%' OR column_name LIKE '%user%')
AND table_schema = 'public'
ORDER BY table_name, column_name;
