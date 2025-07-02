-- ==========================================
-- MANUAL DATABASE MIGRATION
-- Copy and paste this entire SQL into Supabase SQL Editor
-- ==========================================

-- Step 1: Create separate table for UserData page dates
CREATE TABLE IF NOT EXISTS user_dates_userdata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT user_dates_userdata_user_id_unique UNIQUE (user_id)
);

-- Step 2: Create separate table for ABCD page dates  
CREATE TABLE IF NOT EXISTS user_dates_abcd (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT user_dates_abcd_user_id_unique UNIQUE (user_id)
);

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_dates_userdata_user_id ON user_dates_userdata(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dates_abcd_user_id ON user_dates_abcd(user_id);

-- Step 4: Enable RLS (Row Level Security)
ALTER TABLE user_dates_userdata ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dates_abcd ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
DROP POLICY IF EXISTS "Users can manage their own userdata dates" ON user_dates_userdata;
CREATE POLICY "Users can manage their own userdata dates" ON user_dates_userdata
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage their own abcd dates" ON user_dates_abcd;  
CREATE POLICY "Users can manage their own abcd dates" ON user_dates_abcd
  FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Migrate existing data from user_dates to user_dates_userdata
-- (Preserves existing dates, assumes they belong to UserData page)
INSERT INTO user_dates_userdata (user_id, dates, created_at, updated_at)
SELECT user_id::uuid, dates, created_at, updated_at 
FROM user_dates
ON CONFLICT (user_id) DO UPDATE SET 
  dates = EXCLUDED.dates,
  updated_at = EXCLUDED.updated_at;

-- Step 7: Initialize ABCD table with empty arrays for all users
INSERT INTO user_dates_abcd (user_id, dates)
SELECT id::uuid, '[]'::jsonb
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Step 8: Create function to automatically initialize date records for new users
CREATE OR REPLACE FUNCTION initialize_user_date_records()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize UserData dates record
  INSERT INTO user_dates_userdata (user_id, dates)
  VALUES (NEW.id, '[]'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Initialize ABCD dates record  
  INSERT INTO user_dates_abcd (user_id, dates)
  VALUES (NEW.id, '[]'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger to auto-initialize date records for new users
DROP TRIGGER IF EXISTS trigger_initialize_user_date_records ON users;
CREATE TRIGGER trigger_initialize_user_date_records
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_date_records();

-- Step 10: Add comments for documentation
COMMENT ON TABLE user_dates_userdata IS 'Stores date arrays specifically for UserData page - ensures independence from ABCD page';
COMMENT ON TABLE user_dates_abcd IS 'Stores date arrays specifically for ABCD page - ensures independence from UserData page';
COMMENT ON FUNCTION initialize_user_date_records() IS 'Automatically creates empty date records for new users in both page-specific tables';

-- ==========================================
-- VERIFICATION QUERIES (optional)
-- ==========================================

-- Check if tables were created successfully
SELECT 'user_dates_userdata' as table_name, COUNT(*) as record_count FROM user_dates_userdata
UNION ALL
SELECT 'user_dates_abcd' as table_name, COUNT(*) as record_count FROM user_dates_abcd
UNION ALL  
SELECT 'users' as table_name, COUNT(*) as record_count FROM users;

-- Check data migration
SELECT 
  u.username,
  ud_userdata.dates as userdata_dates,
  ud_abcd.dates as abcd_dates
FROM users u
LEFT JOIN user_dates_userdata ud_userdata ON u.id = ud_userdata.user_id
LEFT JOIN user_dates_abcd ud_abcd ON u.id = ud_abcd.user_id
ORDER BY u.username;
