-- 🚀 EMERGENCY DATABASE RESTORATION SCRIPT
-- This script restores the essential tables for your application after v05 revert
-- Copy and paste this entire script into Supabase SQL Editor and run it

-- ========================================
-- CORE APPLICATION TABLES
-- ========================================

-- 1. Users table (essential for authentication and user data)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    hr INTEGER DEFAULT 0,
    days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Excel data table (for file uploads and analysis)
CREATE TABLE IF NOT EXISTS excel_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date_key VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    file_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date_key)
);

-- 3. Hour entries table (for HR data management)
CREATE TABLE IF NOT EXISTS hour_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date_key VARCHAR(255) NOT NULL,
    hour_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date_key)
);

-- ========================================
-- ANALYSIS TABLES
-- ========================================

-- 4. Number box clicks table (for Rule1Page_Enhanced interactions)
CREATE TABLE IF NOT EXISTS number_box_clicks (
    id TEXT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    set_name VARCHAR(255) NOT NULL,
    date_key DATE NOT NULL,
    number_value INTEGER NOT NULL CHECK (number_value >= 1 AND number_value <= 12),
    hr_number INTEGER NOT NULL CHECK (hr_number >= 1 AND hr_number <= 12),
    is_clicked BOOLEAN NOT NULL DEFAULT false,
    is_present BOOLEAN NOT NULL DEFAULT false,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, set_name, date_key, number_value, hr_number)
);

-- 5. Rule2 analysis results table (for enhanced Rule-2 analysis)
CREATE TABLE IF NOT EXISTS rule2_analysis_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    analysis_date DATE NOT NULL,
    trigger_date DATE NOT NULL,
    selected_hr INTEGER DEFAULT 1,
    overall_abcd_numbers INTEGER[] DEFAULT '{}',
    overall_bcd_numbers INTEGER[] DEFAULT '{}',
    topic_numbers JSONB DEFAULT '{}',
    total_topics INTEGER DEFAULT 0,
    available_hrs INTEGER[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, analysis_date, selected_hr)
);

-- 6. Topic ABCD/BCD numbers table
CREATE TABLE IF NOT EXISTS topic_abcd_bcd_numbers (
    id SERIAL PRIMARY KEY,
    topic_name VARCHAR(255) NOT NULL UNIQUE,
    abcd_numbers INTEGER[] DEFAULT '{}',
    bcd_numbers INTEGER[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT 'system',
    notes TEXT
);

-- 7. User dates tables for different pages
CREATE TABLE IF NOT EXISTS user_dates_abcd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    dates JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS user_dates_userdata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    dates JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_excel_data_user_date ON excel_data(user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_hour_entries_user_date ON hour_entries(user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_number_box_clicks_user_date ON number_box_clicks(user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_rule2_analysis_user_date ON rule2_analysis_results(user_id, analysis_date);
CREATE INDEX IF NOT EXISTS idx_topic_abcd_bcd_topic_name ON topic_abcd_bcd_numbers(topic_name);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE excel_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE hour_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE number_box_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule2_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_abcd_bcd_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dates_abcd ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dates_userdata ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES (Allow all access for now)
-- ========================================

-- Users table policies
DROP POLICY IF EXISTS "Allow all access to users" ON users;
CREATE POLICY "Allow all access to users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Excel data policies
DROP POLICY IF EXISTS "Allow all access to excel_data" ON excel_data;
CREATE POLICY "Allow all access to excel_data" ON excel_data FOR ALL USING (true) WITH CHECK (true);

-- Hour entries policies
DROP POLICY IF EXISTS "Allow all access to hour_entries" ON hour_entries;
CREATE POLICY "Allow all access to hour_entries" ON hour_entries FOR ALL USING (true) WITH CHECK (true);

-- Number box clicks policies
DROP POLICY IF EXISTS "Allow all access to number_box_clicks" ON number_box_clicks;
CREATE POLICY "Allow all access to number_box_clicks" ON number_box_clicks FOR ALL USING (true) WITH CHECK (true);

-- Rule2 analysis results policies
DROP POLICY IF EXISTS "Allow all access to rule2_analysis_results" ON rule2_analysis_results;
CREATE POLICY "Allow all access to rule2_analysis_results" ON rule2_analysis_results FOR ALL USING (true) WITH CHECK (true);

-- Topic ABCD/BCD numbers policies
DROP POLICY IF EXISTS "Allow all access to topic_abcd_bcd_numbers" ON topic_abcd_bcd_numbers;
CREATE POLICY "Allow all access to topic_abcd_bcd_numbers" ON topic_abcd_bcd_numbers FOR ALL USING (true) WITH CHECK (true);

-- User dates policies
DROP POLICY IF EXISTS "Allow all access to user_dates_abcd" ON user_dates_abcd;
CREATE POLICY "Allow all access to user_dates_abcd" ON user_dates_abcd FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to user_dates_userdata" ON user_dates_userdata;
CREATE POLICY "Allow all access to user_dates_userdata" ON user_dates_userdata FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT 
    'DATABASE RESTORATION COMPLETE! ✅' as status,
    'All essential tables created and configured' as message,
    'Your application should now work properly' as result;
