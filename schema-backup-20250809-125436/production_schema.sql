-- Production Schema Export for Automation Project
-- This is a template based on typical app structure

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User dates table  
CREATE TABLE IF NOT EXISTS user_dates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date_key)
);

-- Excel data table
CREATE TABLE IF NOT EXISTS excel_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_key TEXT NOT NULL,
    file_name TEXT,
    file_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date_key)
);

-- Hour entries table
CREATE TABLE IF NOT EXISTS hour_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_key TEXT NOT NULL,
    hour_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date_key)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE excel_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE hour_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
    -- Users policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read own data') THEN
        CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
    END IF;
    
    -- User dates policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_dates' AND policyname = 'Users can manage own dates') THEN
        CREATE POLICY "Users can manage own dates" ON user_dates FOR ALL USING (auth.uid()::text = user_id::text);
    END IF;
    
    -- Excel data policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'excel_data' AND policyname = 'Users can manage own excel data') THEN
        CREATE POLICY "Users can manage own excel data" ON excel_data FOR ALL USING (auth.uid()::text = user_id::text);
    END IF;
    
    -- Hour entries policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hour_entries' AND policyname = 'Users can manage own hour entries') THEN
        CREATE POLICY "Users can manage own hour entries" ON hour_entries FOR ALL USING (auth.uid()::text = user_id::text);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_dates_user_id ON user_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dates_date_key ON user_dates(date_key);
CREATE INDEX IF NOT EXISTS idx_excel_data_user_id ON excel_data(user_id);
CREATE INDEX IF NOT EXISTS idx_excel_data_date_key ON excel_data(date_key);
CREATE INDEX IF NOT EXISTS idx_hour_entries_user_id ON hour_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_hour_entries_date_key ON hour_entries(date_key);

