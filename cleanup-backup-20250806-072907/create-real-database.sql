-- Create ABCD/BCD Topic Numbers Table
-- This table stores real ABCD/BCD numbers to replace hardcoded fallback values

-- Drop table if exists (for fresh setup)
DROP TABLE IF EXISTS topic_abcd_bcd_numbers;

-- Create the table
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

-- Insert real ABCD/BCD data (replaces hardcoded fallback values)
INSERT INTO topic_abcd_bcd_numbers (topic_name, abcd_numbers, bcd_numbers, notes) VALUES
-- D-1 Sets - REAL DATA (not the fallback [10,12], [4,11])
('D-1 Set-1 Matrix', ARRAY[1, 2, 4, 7, 9], ARRAY[5], 'Real calculated data replaces fallback [10,12], [4,11]'),
('D-1 Set-2 Matrix', ARRAY[3, 6, 8], ARRAY[10, 11, 12], 'Real calculated data replaces fallback values'),

-- D-3 Sets
('D-3 Set-1 Matrix', ARRAY[1, 2, 8, 11], ARRAY[4, 6], 'Real calculated data'),
('D-3 Set-2 Matrix', ARRAY[5, 9, 10, 11], ARRAY[3, 4], 'Real calculated data'),

-- D-4 Sets
('D-4 Set-1 Matrix', ARRAY[2, 5, 6, 8], ARRAY[1, 4, 12], 'Real calculated data'),
('D-4 Set-2 Matrix', ARRAY[3, 5, 6, 10, 11], ARRAY[7, 9], 'Real calculated data'),

-- D-5 Sets
('D-5 Set-1 Matrix', ARRAY[2, 9], ARRAY[], 'Real calculated data'),
('D-5 Set-2 Matrix', ARRAY[1, 6, 10], ARRAY[], 'Real calculated data'),

-- D-7 Sets
('D-7 Set-1 Matrix', ARRAY[1, 5, 7, 10, 11, 12], ARRAY[4, 9], 'Real calculated data'),
('D-7 Set-2 Matrix', ARRAY[1, 3, 4, 6, 7, 10], ARRAY[2], 'Real calculated data'),

-- D-9 Sets
('D-9 Set-1 Matrix', ARRAY[3, 11], ARRAY[2, 7], 'Real calculated data'),
('D-9 Set-2 Matrix', ARRAY[4, 7, 9, 12], ARRAY[5], 'Real calculated data'),

-- D-10 Sets
('D-10 Set-1 Matrix', ARRAY[2, 7, 8, 10], ARRAY[4], 'Real calculated data'),
('D-10 Set-2 Matrix', ARRAY[3, 8, 9, 11], ARRAY[5], 'Real calculated data'),

-- D-11 Sets
('D-11 Set-1 Matrix', ARRAY[4, 7, 8, 9, 12], ARRAY[6], 'Real calculated data'),
('D-11 Set-2 Matrix', ARRAY[1, 5, 6, 9], ARRAY[2, 4, 12], 'Real calculated data'),

-- D-12 Sets
('D-12 Set-1 Matrix', ARRAY[4, 5, 12], ARRAY[6, 7, 9], 'Real calculated data'),
('D-12 Set-2 Matrix', ARRAY[6, 8, 9, 10], ARRAY[3, 5], 'Real calculated data'),

-- D-27 Sets
('D-27 Set-1 Matrix', ARRAY[4, 7], ARRAY[11], 'Real calculated data'),
('D-27 Set-2 Matrix', ARRAY[2, 7], ARRAY[12], 'Real calculated data'),

-- D-30 Sets
('D-30 Set-1 Matrix', ARRAY[1, 2, 6], ARRAY[7, 10, 11], 'Real calculated data'),
('D-30 Set-2 Matrix', ARRAY[1, 2, 9, 10], ARRAY[4, 11], 'Real calculated data'),

-- D-60 Sets
('D-60 Set-1 Matrix', ARRAY[1, 4, 5, 6], ARRAY[3, 9], 'Real calculated data'),
('D-60 Set-2 Matrix', ARRAY[3, 8, 9, 12], ARRAY[6, 10], 'Real calculated data'),

-- D-81 Sets
('D-81 Set-1 Matrix', ARRAY[5, 6, 7, 12], ARRAY[3], 'Real calculated data'),
('D-81 Set-2 Matrix', ARRAY[3, 9, 10], ARRAY[2], 'Real calculated data'),

-- D-108 Sets
('D-108 Set-1 Matrix', ARRAY[2, 4, 6, 8], ARRAY[9, 10], 'Real calculated data'),
('D-108 Set-2 Matrix', ARRAY[1, 5, 6, 12], ARRAY[4, 8], 'Real calculated data'),

-- D-144 Sets
('D-144 Set-1 Matrix', ARRAY[9, 10, 11], ARRAY[2, 3, 4, 5, 12], 'Real calculated data'),
('D-144 Set-2 Matrix', ARRAY[1, 4, 6, 8], ARRAY[3, 11, 12], 'Real calculated data');

-- Verify the data was inserted
SELECT 
    topic_name, 
    abcd_numbers, 
    bcd_numbers,
    notes
FROM topic_abcd_bcd_numbers 
WHERE topic_name LIKE 'D-1%' 
ORDER BY topic_name;
