-- Create ABCD/BCD Numbers Table in Supabase
-- This table stores the ABCD and BCD numbers for each topic

DROP TABLE IF EXISTS topic_abcd_bcd_numbers;

CREATE TABLE topic_abcd_bcd_numbers (
    id SERIAL PRIMARY KEY,
    topic_name VARCHAR(255) NOT NULL UNIQUE,
    abcd_numbers INTEGER[] DEFAULT '{}',
    bcd_numbers INTEGER[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT 'system',
    notes TEXT
);

-- Add indexes for better performance
CREATE INDEX idx_topic_abcd_bcd_topic_name ON topic_abcd_bcd_numbers(topic_name);

-- Add RLS (Row Level Security) policies
ALTER TABLE topic_abcd_bcd_numbers ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all users" ON topic_abcd_bcd_numbers
    FOR SELECT USING (true);

-- Allow insert/update access to authenticated users
CREATE POLICY "Allow insert/update to authenticated users" ON topic_abcd_bcd_numbers
    FOR ALL USING (true);

-- Insert default ABCD/BCD numbers for all 30 topics
INSERT INTO topic_abcd_bcd_numbers (topic_name, abcd_numbers, bcd_numbers, notes) VALUES
('D-1 Set-1 Matrix', ARRAY[10, 12], ARRAY[4, 11], 'Updated with dynamic numbers from analysis'),
('D-1 Set-2 Matrix', ARRAY[10, 12], ARRAY[4, 11], 'Updated with dynamic numbers from analysis'),
('D-3 (trd) Set-1 Matrix', ARRAY[1, 2, 8, 11], ARRAY[4, 6], 'Default configuration'),
('D-3 (trd) Set-2 Matrix', ARRAY[5, 9, 10, 11], ARRAY[3, 4], 'Default configuration'),
('D-4 Set-1 Matrix', ARRAY[2, 5, 6, 8], ARRAY[1, 4, 12], 'Default configuration'),
('D-4 Set-2 Matrix', ARRAY[3, 5, 6, 10, 11], ARRAY[7, 9], 'Default configuration'),
('D-5 (pv) Set-1 Matrix', ARRAY[2, 9], ARRAY[], 'Default configuration'),
('D-5 (pv) Set-2 Matrix', ARRAY[1, 6, 10], ARRAY[], 'Default configuration'),
('D-7 (trd) Set-1 Matrix', ARRAY[1, 5, 7, 10, 11, 12], ARRAY[4, 9], 'Default configuration'),
('D-7 (trd) Set-2 Matrix', ARRAY[1, 3, 4, 6, 7, 10], ARRAY[2], 'Default configuration'),
('D-9 Set-1 Matrix', ARRAY[3, 11], ARRAY[2, 7], 'Default configuration'),
('D-9 Set-2 Matrix', ARRAY[4, 7, 9, 12], ARRAY[5], 'Default configuration'),
('D-10 (trd) Set-1 Matrix', ARRAY[2, 7, 8, 10], ARRAY[4], 'Default configuration'),
('D-10 (trd) Set-2 Matrix', ARRAY[3, 8, 9, 11], ARRAY[5], 'Default configuration'),
('D-11 Set-1 Matrix', ARRAY[4, 7, 8, 9, 12], ARRAY[6], 'Default configuration'),
('D-11 Set-2 Matrix', ARRAY[1, 5, 6, 9], ARRAY[2, 4, 12], 'Default configuration'),
('D-12 (trd) Set-1 Matrix', ARRAY[4, 5, 12], ARRAY[6, 7, 9], 'Default configuration'),
('D-12 (trd) Set-2 Matrix', ARRAY[6, 8, 9, 10], ARRAY[3, 5], 'Default configuration'),
('D-27 (trd) Set-1 Matrix', ARRAY[4, 7], ARRAY[11], 'Default configuration'),
('D-27 (trd) Set-2 Matrix', ARRAY[2, 7], ARRAY[12], 'Default configuration'),
('D-30 (sh) Set-1 Matrix', ARRAY[1, 2, 6], ARRAY[7, 10, 11], 'Default configuration'),
('D-30 (sh) Set-2 Matrix', ARRAY[1, 2, 9, 10], ARRAY[4, 11], 'Default configuration'),
('D-60 (Trd) Set-1 Matrix', ARRAY[1, 4, 5, 6], ARRAY[3, 9], 'Default configuration'),
('D-60 (Trd) Set-2 Matrix', ARRAY[3, 8, 9, 12], ARRAY[6, 10], 'Default configuration'),
('D-81 Set-1 Matrix', ARRAY[5, 6, 7, 12], ARRAY[3], 'Default configuration'),
('D-81 Set-2 Matrix', ARRAY[3, 9, 10], ARRAY[2], 'Default configuration'),
('D-108 Set-1 Matrix', ARRAY[2, 4, 6, 8], ARRAY[9, 10], 'Default configuration'),
('D-108 Set-2 Matrix', ARRAY[1, 5, 6, 12], ARRAY[4, 8], 'Default configuration'),
('D-144 Set-1 Matrix', ARRAY[9, 10, 11], ARRAY[2, 3, 4, 5, 12], 'Default configuration'),
('D-144 Set-2 Matrix', ARRAY[1, 4, 6, 8], ARRAY[3, 11, 12], 'Default configuration');

-- Update function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_topic_abcd_bcd_numbers_updated_at
    BEFORE UPDATE ON topic_abcd_bcd_numbers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the data was inserted correctly
SELECT 
    topic_name,
    abcd_numbers,
    bcd_numbers,
    notes
FROM topic_abcd_bcd_numbers 
ORDER BY topic_name;
