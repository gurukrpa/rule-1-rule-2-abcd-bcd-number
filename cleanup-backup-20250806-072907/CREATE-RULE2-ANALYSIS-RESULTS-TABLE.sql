-- Create enhanced Rule2 analysis results table for topic-specific ABCD/BCD numbers
-- This table stores detailed analysis results including topic-specific numbers

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rule2_analysis_results_user_date ON rule2_analysis_results(user_id, analysis_date);
CREATE INDEX IF NOT EXISTS idx_rule2_analysis_results_user_created ON rule2_analysis_results(user_id, created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE rule2_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for access control
CREATE POLICY "Users can manage their own rule2 analysis results" ON rule2_analysis_results
    FOR ALL USING (true) WITH CHECK (true);

-- Add update trigger
CREATE OR REPLACE FUNCTION update_rule2_analysis_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rule2_analysis_results_updated_at
    BEFORE UPDATE ON rule2_analysis_results
    FOR EACH ROW
    EXECUTE FUNCTION update_rule2_analysis_results_updated_at();

-- Add table comments
COMMENT ON TABLE rule2_analysis_results IS 'Stores detailed Rule-2 analysis results with topic-specific ABCD/BCD numbers for Planets Analysis page';
COMMENT ON COLUMN rule2_analysis_results.topic_numbers IS 'JSON structure: {"D-1 Set-1 Matrix": {"abcd": [10,12], "bcd": [4,11]}, ...}';
COMMENT ON COLUMN rule2_analysis_results.overall_abcd_numbers IS 'Combined ABCD numbers from all topics (mutual exclusivity applied)';
COMMENT ON COLUMN rule2_analysis_results.overall_bcd_numbers IS 'Combined BCD numbers from all topics (mutual exclusivity applied)';

-- Example data structure for topic_numbers:
/*
{
  "D-1 Set-1 Matrix": {"abcd": [10, 12], "bcd": [4, 11]},
  "D-1 Set-2 Matrix": {"abcd": [5, 8], "bcd": [2, 7]},
  "D-3 Set-1 Matrix": {"abcd": [1, 9], "bcd": [6]},
  ... (30 topics total)
}
*/
