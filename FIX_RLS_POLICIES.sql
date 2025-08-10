-- 🔧 Fix RLS Policies for Automation Database
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/oqbusqbsmvwkwhggzvhl/sql

-- Step 1: Create missing tables that the application expects
CREATE TABLE IF NOT EXISTS house (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    house_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hr_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE house ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_data ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_dates') THEN
        ALTER TABLE user_dates ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'excel_data') THEN
        ALTER TABLE excel_data ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'hour_entries') THEN
        ALTER TABLE hour_entries ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 3: Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on users for development" ON users;
DROP POLICY IF EXISTS "Allow all operations on house" ON house;
DROP POLICY IF EXISTS "Allow all operations on hr_data" ON hr_data;

-- Step 4: Create permissive policies for development/testing
CREATE POLICY "Allow all operations on users for development" 
ON users FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on house for development" 
ON house FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on hr_data for development" 
ON hr_data FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- Step 5: Also ensure other tables have permissive policies
DO $$ 
BEGIN
    -- For user_dates table
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_dates') THEN
        DROP POLICY IF EXISTS "Allow all operations on user_dates" ON user_dates;
        CREATE POLICY "Allow all operations on user_dates for development" 
        ON user_dates FOR ALL 
        TO anon, authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;

    -- For excel_data table  
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'excel_data') THEN
        DROP POLICY IF EXISTS "Allow all operations on excel_data" ON excel_data;
        CREATE POLICY "Allow all operations on excel_data for development" 
        ON excel_data FOR ALL 
        TO anon, authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;

    -- For hour_entries table
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'hour_entries') THEN
        DROP POLICY IF EXISTS "Allow all operations on hour_entries" ON hour_entries;
        CREATE POLICY "Allow all operations on hour_entries for development" 
        ON hour_entries FOR ALL 
        TO anon, authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;

    -- For house table
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'house') THEN
        DROP POLICY IF EXISTS "Allow all operations on house" ON house;
        CREATE POLICY "Allow all operations on house for development" 
        ON house FOR ALL 
        TO anon, authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;

    -- For hr_data table
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'hr_data') THEN
        DROP POLICY IF EXISTS "Allow all operations on hr_data" ON hr_data;
        CREATE POLICY "Allow all operations on hr_data for development" 
        ON hr_data FOR ALL 
        TO anon, authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

-- Step 6: Test the fix by inserting a test user
INSERT INTO users (username, hr, days) VALUES 
    ('rls_test_user', 200, 60)
ON CONFLICT (username) DO NOTHING;

-- Step 7: Verify the fix
SELECT 
    'RLS policies fixed!' as status,
    COUNT(*) as total_users,
    STRING_AGG(username, ', ') as usernames
FROM users;

-- Step 8: Show current policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'users';
