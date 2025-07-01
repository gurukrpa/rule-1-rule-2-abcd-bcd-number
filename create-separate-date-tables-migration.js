/**
 * Database Migration: Create Separate Date Tables for True Independence
 * 
 * This script creates separate tables for UserData and ABCD page dates
 * to ensure complete independence between the two pages.
 */

// Run this in Supabase SQL Editor or via API
const MIGRATION_SQL = `
-- Create separate table for UserData page dates
CREATE TABLE IF NOT EXISTS user_dates_userdata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT user_dates_userdata_user_id_unique UNIQUE (user_id)
);

-- Create separate table for ABCD page dates  
CREATE TABLE IF NOT EXISTS user_dates_abcd (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT user_dates_abcd_user_id_unique UNIQUE (user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_dates_userdata_user_id ON user_dates_userdata(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dates_abcd_user_id ON user_dates_abcd(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_dates_userdata ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dates_abcd ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust as needed for your auth setup)
CREATE POLICY "Users can manage their own userdata dates" ON user_dates_userdata
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage their own abcd dates" ON user_dates_abcd
  FOR ALL USING (true) WITH CHECK (true);

-- Migrate existing data from user_dates to appropriate tables
-- (This preserves existing data while creating separation)

-- Migrate to UserData table (assumes current data belongs to UserData page)
INSERT INTO user_dates_userdata (user_id, dates, created_at, updated_at)
SELECT user_id, dates, created_at, updated_at 
FROM user_dates
ON CONFLICT (user_id) DO UPDATE SET 
  dates = EXCLUDED.dates,
  updated_at = EXCLUDED.updated_at;

-- Initialize ABCD table with empty arrays for all users
INSERT INTO user_dates_abcd (user_id, dates)
SELECT id, '[]'::jsonb
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Create function to automatically initialize date records for new users
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

-- Create trigger to auto-initialize date records for new users
DROP TRIGGER IF EXISTS trigger_initialize_user_date_records ON users;
CREATE TRIGGER trigger_initialize_user_date_records
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_date_records();

-- Add comments for documentation
COMMENT ON TABLE user_dates_userdata IS 'Stores date arrays specifically for UserData page - ensures independence from ABCD page';
COMMENT ON TABLE user_dates_abcd IS 'Stores date arrays specifically for ABCD page - ensures independence from UserData page';
COMMENT ON FUNCTION initialize_user_date_records() IS 'Automatically creates empty date records for new users in both page-specific tables';
`;

console.log('📋 MIGRATION SQL FOR SEPARATE DATE STORAGE:');
console.log('=============================================');
console.log(MIGRATION_SQL);
console.log('\n📝 INSTRUCTIONS:');
console.log('1. Copy the SQL above');
console.log('2. Run it in Supabase SQL Editor');
console.log('3. Verify tables are created: user_dates_userdata, user_dates_abcd');
console.log('4. Update components to use the new service');

// Export for potential automated execution
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MIGRATION_SQL,
    description: 'Creates separate date storage tables for UserData and ABCD pages'
  };
}
