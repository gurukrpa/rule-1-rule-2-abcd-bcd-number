-- FIXED: Debug service policies (compatible with older Supabase versions)
-- This version handles existing policies gracefully

-- Helper function to check if current connection is service role
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role',
    false
  )
$$;

-- Drop existing debug policies if they exist, then recreate them
DO $$
BEGIN
    -- Drop policies if they exist (ignore errors if they don't exist)
    BEGIN
        DROP POLICY IF EXISTS "debug_read_all_service" ON public.users;
    EXCEPTION WHEN undefined_object THEN
        NULL; -- Policy doesn't exist, that's fine
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "debug_read_all_service" ON public.excel_data;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "debug_read_all_service" ON public.hour_entries;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "debug_read_all_service" ON public.number_box_clicks;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "debug_read_all_service" ON public.rule2_analysis_results;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
END $$;

-- Create new debug policies
CREATE POLICY "debug_read_all_service" ON public.users
    FOR SELECT TO service_role USING (true);

CREATE POLICY "debug_read_all_service" ON public.excel_data
    FOR SELECT TO service_role USING (true);

CREATE POLICY "debug_read_all_service" ON public.hour_entries
    FOR SELECT TO service_role USING (true);

CREATE POLICY "debug_read_all_service" ON public.number_box_clicks
    FOR SELECT TO service_role USING (true);

CREATE POLICY "debug_read_all_service" ON public.rule2_analysis_results
    FOR SELECT TO service_role USING (true);

-- Success message
SELECT 'Debug service policies applied successfully - your app should now see data' as status;
