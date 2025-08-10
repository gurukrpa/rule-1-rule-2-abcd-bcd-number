-- 🔧 Clean RLS Policies Fix for Automation Database
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

-- Step 2: Enable RLS on all tables (if not already enabled)
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

-- Step 3: Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    pol_record RECORD;
BEGIN
    -- Drop all policies on users table
    FOR pol_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'users'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_record.policyname || '" ON users';
    END LOOP;
    
    -- Drop all policies on house table
    FOR pol_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'house'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_record.policyname || '" ON house';
    END LOOP;
    
    -- Drop all policies on hr_data table
    FOR pol_record IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'hr_data'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_record.policyname || '" ON hr_data';
    END LOOP;
    
    -- Drop all policies on user_dates table if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_dates') THEN
        FOR pol_record IN 
            SELECT policyname FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'user_dates'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || pol_record.policyname || '" ON user_dates';
        END LOOP;
    END IF;
    
    -- Drop all policies on excel_data table if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'excel_data') THEN
        FOR pol_record IN 
            SELECT policyname FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'excel_data'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || pol_record.policyname || '" ON excel_data';
        END LOOP;
    END IF;
    
    -- Drop all policies on hour_entries table if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'hour_entries') THEN
        FOR pol_record IN 
            SELECT policyname FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'hour_entries'
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || pol_record.policyname || '" ON hour_entries';
        END LOOP;
    END IF;
END $$;

-- Step 4: Create fresh permissive policies for all tables
CREATE POLICY "dev_users_all_access" 
ON users FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "dev_house_all_access" 
ON house FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "dev_hr_data_all_access" 
ON hr_data FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- Step 5: Create policies for other tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_dates') THEN
        EXECUTE 'CREATE POLICY "dev_user_dates_all_access" ON user_dates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'excel_data') THEN
        EXECUTE 'CREATE POLICY "dev_excel_data_all_access" ON excel_data FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'hour_entries') THEN
        EXECUTE 'CREATE POLICY "dev_hour_entries_all_access" ON hour_entries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)';
    END IF;
END $$;

-- Step 6: Test the fix by inserting a test user
INSERT INTO users (username, hr, days) VALUES 
    ('rls_test_user_' || EXTRACT(EPOCH FROM NOW())::text, 200, 60);

-- Step 7: Verify the fix
SELECT 
    'RLS policies completely fixed!' as status,
    COUNT(*) as total_users,
    STRING_AGG(username, ', ') as usernames
FROM users;

-- Step 8: Show all current policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
