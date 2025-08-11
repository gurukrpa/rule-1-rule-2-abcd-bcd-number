-- 🔧 QUICK FIX: Add missing email column to users table
-- Copy and paste this into Supabase SQL Editor and run it

-- Add the missing email column to the users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Update the users table to ensure it has all needed columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Insert a test user to verify everything works
INSERT INTO users (username, email, hr, days) 
VALUES ('test_user', 'test@example.com', 12, 365)
ON CONFLICT (username) DO UPDATE SET 
    email = EXCLUDED.email,
    hr = EXCLUDED.hr,
    days = EXCLUDED.days;

-- Success message
SELECT 
    'QUICK FIX COMPLETE! ✅' as status,
    'email column added to users table' as fix_applied,
    'Your application should now work properly' as result;
