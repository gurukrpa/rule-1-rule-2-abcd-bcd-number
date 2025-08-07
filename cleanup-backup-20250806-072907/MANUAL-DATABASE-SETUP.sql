-- 🚀 Enhanced Rule2 Analysis Results Table Creation Script
-- Copy and paste this SQL into your Supabase SQL Editor

-- Step 1: Create the enhanced table for topic-specific ABCD/BCD numbers
CREATE TABLE IF NOT EXISTS rule2_analysis_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    analysis_date DATE NOT NULL,
    trigger_date DATE NOT NULL,
    selected_hr INTEGER DEFAULT 1,
    
    -- Overall ABCD/BCD numbers (combined from all topics)
    overall_abcd_numbers INTEGER[] DEFAULT '{}',
    overall_bcd_numbers INTEGER[] DEFAULT '{}',
    
    -- Topic-specific ABCD/BCD numbers (JSON structure)
    -- Format: {"D-1 Set-1 Matrix": {"abcd": [1,2,4,7,9], "bcd": [5]}, ...}
    topic_numbers JSONB DEFAULT '{}',
    
    -- Analysis metadata
    total_topics INTEGER DEFAULT 0,
    available_hrs INTEGER[] DEFAULT '{}',
    
    -- ABCD sequence dates used for analysis
    a_day DATE,
    b_day DATE, 
    c_day DATE,
    d_day DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, analysis_date, selected_hr)
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rule2_analysis_results_user_date 
ON rule2_analysis_results(user_id, analysis_date);

CREATE INDEX IF NOT EXISTS idx_rule2_analysis_results_user_created 
ON rule2_analysis_results(user_id, created_at DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE rule2_analysis_results ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policy for access control
DROP POLICY IF EXISTS "Users can manage their own rule2 analysis results" ON rule2_analysis_results;
CREATE POLICY "Users can manage their own rule2 analysis results" ON rule2_analysis_results
    FOR ALL USING (true) WITH CHECK (true);

-- Step 5: Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_rule2_analysis_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_rule2_analysis_results_updated_at ON rule2_analysis_results;
CREATE TRIGGER update_rule2_analysis_results_updated_at
    BEFORE UPDATE ON rule2_analysis_results
    FOR EACH ROW
    EXECUTE FUNCTION update_rule2_analysis_results_updated_at();

-- Step 6: Insert sample data to test the functionality
INSERT INTO rule2_analysis_results (
    user_id,
    analysis_date,
    trigger_date,
    selected_hr,
    overall_abcd_numbers,
    overall_bcd_numbers,
    topic_numbers,
    total_topics,
    a_day,
    b_day,
    c_day,
    d_day
) VALUES (
    'sing maya',
    '2025-07-07',
    '2025-07-07',
    1,
    '{1,2,3,4,5,6,7,8,9,10,11,12}',
    '{}',
    '{
        "D-1 Set-1 Matrix": {"abcd": [1,2,4,7,9], "bcd": [5]},
        "D-1 Set-2 Matrix": {"abcd": [3,6,8,11], "bcd": [10]},
        "D-3 Set-1 Matrix": {"abcd": [2,3,5,12], "bcd": [1]},
        "D-3 Set-2 Matrix": {"abcd": [4,7,9], "bcd": [6,8]},
        "D-4 Set-1 Matrix": {"abcd": [1,5,9,12], "bcd": [3,7]},
        "D-4 Set-2 Matrix": {"abcd": [2,6,10], "bcd": [4,8,11]},
        "D-5 Set-1 Matrix": {"abcd": [3,7,11], "bcd": [1,5,9]},
        "D-5 Set-2 Matrix": {"abcd": [4,8,12], "bcd": [2,6,10]},
        "D-7 Set-1 Matrix": {"abcd": [1,3,5,7], "bcd": [9,11]},
        "D-7 Set-2 Matrix": {"abcd": [2,4,6,8], "bcd": [10,12]},
        "D-9 Set-1 Matrix": {"abcd": [1,9], "bcd": [3,5,7,11]},
        "D-9 Set-2 Matrix": {"abcd": [2,10], "bcd": [4,6,8,12]},
        "D-10 Set-1 Matrix": {"abcd": [1,10], "bcd": [2,5,7]},
        "D-10 Set-2 Matrix": {"abcd": [3,12], "bcd": [4,6,9,11]},
        "D-11 Set-1 Matrix": {"abcd": [1,11], "bcd": [3,7,9]},
        "D-11 Set-2 Matrix": {"abcd": [2,12], "bcd": [4,6,8,10]},
        "D-12 Set-1 Matrix": {"abcd": [1,12], "bcd": [2,3,6]},
        "D-12 Set-2 Matrix": {"abcd": [4,9], "bcd": [5,7,8,10,11]},
        "D-27 Set-1 Matrix": {"abcd": [3,9], "bcd": [1,6,12]},
        "D-27 Set-2 Matrix": {"abcd": [6,12], "bcd": [2,4,7,11]},
        "D-30 Set-1 Matrix": {"abcd": [5,10], "bcd": [1,3,6,12]},
        "D-30 Set-2 Matrix": {"abcd": [2,4], "bcd": [7,8,9,11]},
        "D-60 Set-1 Matrix": {"abcd": [2,5,10], "bcd": [1,4,12]},
        "D-60 Set-2 Matrix": {"abcd": [3,6], "bcd": [7,8,9,11]},
        "D-81 Set-1 Matrix": {"abcd": [3,9], "bcd": [1,2,6,12]},
        "D-81 Set-2 Matrix": {"abcd": [6,12], "bcd": [4,5,7,10,11]},
        "D-108 Set-1 Matrix": {"abcd": [4,9,12], "bcd": [1,3,6]},
        "D-108 Set-2 Matrix": {"abcd": [2,6], "bcd": [5,7,8,10,11]},
        "D-144 Set-1 Matrix": {"abcd": [6,12], "bcd": [1,2,4,9]},
        "D-144 Set-2 Matrix": {"abcd": [3,8], "bcd": [5,7,10,11]}
    }'::jsonb,
    30,
    '2025-07-04',
    '2025-07-05',
    '2025-07-06',
    '2025-07-07'
) ON CONFLICT (user_id, analysis_date, selected_hr) DO UPDATE SET
    topic_numbers = EXCLUDED.topic_numbers,
    overall_abcd_numbers = EXCLUDED.overall_abcd_numbers,
    overall_bcd_numbers = EXCLUDED.overall_bcd_numbers,
    updated_at = NOW();

-- Step 7: Verify the data was inserted
SELECT 
    user_id,
    analysis_date,
    selected_hr,
    overall_abcd_numbers,
    jsonb_pretty(topic_numbers) as topic_numbers_formatted,
    total_topics,
    created_at
FROM rule2_analysis_results 
WHERE user_id = 'sing maya'
ORDER BY created_at DESC;

-- 🎉 Setup complete! The enhanced table is ready with sample topic-specific data.
-- Now the PlanetsAnalysisPage should display specific ABCD/BCD numbers for each topic instead of the same overall numbers.
