-- 🔧 Quick Fix: Add Missing Columns to Users Table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/oqbusqbsmvwkwhggzvhl/sql

-- Add the missing hr and days columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS hr INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS days INTEGER DEFAULT 0;

-- Add sample test data
INSERT INTO users (username, hr, days) VALUES 
    ('test_user', 100, 30),
    ('demo_user', 150, 45)
ON CONFLICT (username) DO NOTHING;

-- Verify the fix
SELECT 'Fix applied successfully!' as status, count(*) as user_count FROM users;
