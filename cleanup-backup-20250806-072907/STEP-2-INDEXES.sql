-- Step 2: Add indexes and security (run after Step 1 succeeds)
CREATE INDEX idx_number_box_clicks_user_date ON number_box_clicks(user_id, date_key);
CREATE INDEX idx_number_box_clicks_user_hr ON number_box_clicks(user_id, hr_number);
CREATE INDEX idx_number_box_clicks_set_name ON number_box_clicks(set_name);
CREATE INDEX idx_number_box_clicks_clicked ON number_box_clicks(is_clicked) WHERE is_clicked = true;

ALTER TABLE number_box_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own number box clicks" ON number_box_clicks
    FOR ALL USING (true) WITH CHECK (true);
