-- Update RLS policies to include lottery columns
-- Run this in your Supabase SQL editor if you encounter permission issues

-- Allow authenticated users to read lottery fields
CREATE POLICY IF NOT EXISTS "Users can read own lottery settings" ON public.users
FOR SELECT USING (true);

-- Allow authenticated users to update lottery fields  
CREATE POLICY IF NOT EXISTS "Users can update own lottery settings" ON public.users
FOR UPDATE USING (true);

-- Verify policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
