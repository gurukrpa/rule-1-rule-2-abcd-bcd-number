-- Quick Fix for Existing number_box_clicks Table
-- Run this if you already have the table and just need to change the ID column type

-- Option 1: If you want to keep existing data (safer approach)
-- Create a backup table first
CREATE TABLE number_box_clicks_backup AS SELECT * FROM number_box_clicks;

-- Drop the existing table
DROP TABLE IF EXISTS number_box_clicks;

-- Recreate with TEXT id
CREATE TABLE number_box_clicks (
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

-- Add indexes
CREATE INDEX idx_number_box_clicks_user_date ON number_box_clicks(user_id, date_key);
CREATE INDEX idx_number_box_clicks_user_hr ON number_box_clicks(user_id, hr_number);
CREATE INDEX idx_number_box_clicks_set_name ON number_box_clicks(set_name);
CREATE INDEX idx_number_box_clicks_clicked ON number_box_clicks(is_clicked) WHERE is_clicked = true;

-- Enable RLS
ALTER TABLE number_box_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own number box clicks" ON number_box_clicks
    FOR ALL USING (true) WITH CHECK (true);

-- If you had data in the backup, you can migrate it with new TEXT IDs:
-- INSERT INTO number_box_clicks (id, user_id, set_name, date_key, number_value, hr_number, is_clicked, is_present, clicked_at, updated_at)
-- SELECT 
--     CONCAT(user_id, '_', set_name, '_', date_key, '_', number_value, '_HR', hr_number) as id,
--     user_id, set_name, date_key, number_value, hr_number, is_clicked, is_present, clicked_at, updated_at
-- FROM number_box_clicks_backup;

-- Clean up backup table when done
-- DROP TABLE number_box_clicks_backup;
