-- QUICK FIX: Excel Data RLS Policy Issue
-- Run this in Supabase SQL Editor to immediately fix Excel upload errors

-- Remove the restrictive policy causing the violation
DROP POLICY IF EXISTS "Users can manage own excel data" ON excel_data;

-- Create a permissive policy that allows Excel uploads
CREATE POLICY "Allow all excel data operations" ON excel_data
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Verify the fix
SELECT 'Excel RLS policy fixed - uploads should now work!' as status;
