-- 🔧 FINAL SCHEMA FIX for Automation Database
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/oqbusqbsmvwkwhggzvhl/sql

-- Step 1: Add the missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS hr INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS days INTEGER DEFAULT 0;

-- Step 2: Add some test data
INSERT INTO users (username, hr, days) VALUES 
    ('test_user_1', 100, 30),
    ('test_user_2', 150, 45),
    ('demo_user', 120, 35)
ON CONFLICT (username) DO NOTHING;

-- Step 3: Verify the fix
SELECT 
    'Schema fix successful!' as status,
    COUNT(*) as total_users,
    STRING_AGG(username, ', ') as usernames
FROM users;

-- Step 4: Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
