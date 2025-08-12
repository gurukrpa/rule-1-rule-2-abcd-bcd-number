-- Create Number Box Clicks Table in Supabase
DROP TABLE IF EXISTS number_box_clicks;

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

CREATE INDEX idx_number_box_clicks_user_date ON number_box_clicks(user_id, date_key);
CREATE INDEX idx_number_box_clicks_user_hr ON number_box_clicks(user_id, hr_number);
CREATE INDEX idx_number_box_clicks_set_name ON number_box_clicks(set_name);
CREATE INDEX idx_number_box_clicks_clicked ON number_box_clicks(is_clicked) WHERE is_clicked = true;

ALTER TABLE number_box_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own number box clicks" ON number_box_clicks
    FOR ALL USING (true) WITH CHECK (true);

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
