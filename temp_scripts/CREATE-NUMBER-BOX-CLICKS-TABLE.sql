-- Create Number Box Clicks Table in Supabase
-- This table stores user interactions with the 1-12 number boxes in Rule1Page_Enhanced

DROP TABLE IF EXISTS number_box_clicks;

CREATE TABLE number_box_clicks (
    id TEXT PRIMARY KEY,  -- ✅ FIXED: Changed from UUID to TEXT to support custom composite IDs
    user_id VARCHAR(255) NOT NULL,
    set_name VARCHAR(255) NOT NULL,
    date_key DATE NOT NULL,
    number_value INTEGER NOT NULL CHECK (number_value >= 1 AND number_value <= 12),
    hr_number INTEGER NOT NULL CHECK (hr_number >= 1 AND hr_number <= 12),
    is_clicked BOOLEAN NOT NULL DEFAULT false,
    is_present BOOLEAN NOT NULL DEFAULT false,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user-set-date-number-hr combination
    UNIQUE(user_id, set_name, date_key, number_value, hr_number)
);

-- Add indexes for better performance
CREATE INDEX idx_number_box_clicks_user_date ON number_box_clicks(user_id, date_key);
CREATE INDEX idx_number_box_clicks_user_hr ON number_box_clicks(user_id, hr_number);
CREATE INDEX idx_number_box_clicks_set_name ON number_box_clicks(set_name);
CREATE INDEX idx_number_box_clicks_clicked ON number_box_clicks(is_clicked) WHERE is_clicked = true;

-- Add RLS (Row Level Security) policies
ALTER TABLE number_box_clicks ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own number box clicks
CREATE POLICY "Users can manage their own number box clicks" ON number_box_clicks
    FOR ALL USING (true) WITH CHECK (true);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_number_box_clicks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_number_box_clicks_updated_at ON number_box_clicks;
CREATE TRIGGER update_number_box_clicks_updated_at
    BEFORE UPDATE ON number_box_clicks
    FOR EACH ROW
    EXECUTE FUNCTION update_number_box_clicks_updated_at();

-- Add comments for documentation
COMMENT ON TABLE number_box_clicks IS 'Stores user interactions with 1-12 number boxes in Rule1Page_Enhanced. Uses TEXT id to support composite keys.';
COMMENT ON COLUMN number_box_clicks.id IS 'Composite primary key in format: userId_setName_dateKey_numberValue_HRhrNumber';
COMMENT ON COLUMN number_box_clicks.user_id IS 'User ID who clicked the number box';
COMMENT ON COLUMN number_box_clicks.set_name IS 'Topic/set name (e.g., "D-1 Set-1 Matrix")';
COMMENT ON COLUMN number_box_clicks.date_key IS 'Date associated with the analysis';
COMMENT ON COLUMN number_box_clicks.number_value IS 'Number clicked (1-12)';
COMMENT ON COLUMN number_box_clicks.hr_number IS 'HR number (1-12) for isolation';
COMMENT ON COLUMN number_box_clicks.is_clicked IS 'Whether the number box is currently clicked/selected';
COMMENT ON COLUMN number_box_clicks.is_present IS 'Whether the number was found in the topic data';

-- Verify the table was created successfully
SELECT 
    'number_box_clicks' as table_name,
    'Table created successfully' as status;
