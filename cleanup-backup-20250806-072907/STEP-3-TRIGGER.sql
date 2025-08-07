-- Step 3: Add trigger function (run after Step 2 succeeds)
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
