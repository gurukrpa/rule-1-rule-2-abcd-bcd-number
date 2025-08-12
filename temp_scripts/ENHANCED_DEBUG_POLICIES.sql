-- Add additional debug policies to ensure all access works
-- This ensures the new columns are accessible

-- Add all CRUD policies for excel_data table
DROP POLICY IF EXISTS "debug_read_all_service" ON public.excel_data;
CREATE POLICY "debug_all_service" ON public.excel_data
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Add all CRUD policies for hour_entries table  
DROP POLICY IF EXISTS "debug_read_all_service" ON public.hour_entries;
CREATE POLICY "debug_all_service" ON public.hour_entries
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Test the data access
SELECT 
    'Testing data access after enhanced policies' as test_name,
    count(*) as excel_records,
    count(DISTINCT user_id) as unique_users
FROM excel_data;

-- Show sample data to verify access
SELECT 
    user_id,
    date_key,
    file_name,
    'Has Excel Data' as status
FROM excel_data
LIMIT 3;
