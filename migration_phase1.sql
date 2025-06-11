-- Phase 1: Create new tables for ABCD-BCD data
-- This adds to existing schema without breaking current functionality

-- User dates table
CREATE TABLE IF NOT EXISTS user_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  date date NOT NULL,
  created_at timestamp DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Excel data table (using JSONB for flexibility)
CREATE TABLE IF NOT EXISTS excel_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  date date NOT NULL,
  file_name text,
  data jsonb NOT NULL,
  uploaded_at timestamp DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Hour entries table
CREATE TABLE IF NOT EXISTS hour_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  date date NOT NULL,
  planet_selections jsonb NOT NULL,
  saved_at timestamp DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE user_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE excel_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE hour_entries ENABLE ROW LEVEL SECURITY;

-- Create policies (currently open - can be restricted later)
CREATE POLICY "Allow all operations on user_dates" ON user_dates FOR ALL USING (true);
CREATE POLICY "Allow all operations on excel_data" ON excel_data FOR ALL USING (true);
CREATE POLICY "Allow all operations on hour_entries" ON hour_entries FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_user_dates_user_id ON user_dates(user_id);
CREATE INDEX idx_user_dates_date ON user_dates(date);
CREATE INDEX idx_excel_data_user_date ON excel_data(user_id, date);
CREATE INDEX idx_hour_entries_user_date ON hour_entries(user_id, date);
