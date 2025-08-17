-- Enhanced ABCD/BCD Analysis Results Table
-- This stores the actual calculated ABCD/BCD numbers for each topic, date, and HR

CREATE TABLE IF NOT EXISTS topic_analysis_results (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    date_key DATE NOT NULL,
    hour VARCHAR(10) NOT NULL, -- 'HR1', 'HR2', etc.
    abcd_numbers INTEGER[] DEFAULT '{}',
    bcd_numbers INTEGER[] DEFAULT '{}',
    analysis_source VARCHAR(50) DEFAULT 'rule2_analysis', -- 'rule2_analysis', 'manual', 'default'
    analysis_date DATE, -- Which date was used for analysis (N-1 pattern)
    pattern_type VARCHAR(20) DEFAULT 'N-1', -- 'N-1', 'current', etc.
    metadata JSONB DEFAULT '{}', -- Store additional analysis metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(user_id, topic_name, date_key, hour)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_topic_analysis_user_date ON topic_analysis_results(user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_topic_analysis_topic ON topic_analysis_results(topic_name);
CREATE INDEX IF NOT EXISTS idx_topic_analysis_hour ON topic_analysis_results(hour);

-- Enable RLS
ALTER TABLE topic_analysis_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop existing if they exist, then recreate)
DROP POLICY IF EXISTS "Users can view their own analysis results" ON topic_analysis_results;
DROP POLICY IF EXISTS "Users can insert their own analysis results" ON topic_analysis_results;
DROP POLICY IF EXISTS "Users can update their own analysis results" ON topic_analysis_results;

CREATE POLICY "Users can view their own analysis results" 
ON topic_analysis_results FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own analysis results" 
ON topic_analysis_results FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own analysis results" 
ON topic_analysis_results FOR UPDATE 
USING (auth.uid()::text = user_id);

COMMENT ON TABLE topic_analysis_results IS 'Stores calculated ABCD/BCD analysis results for each user, topic, date, and hour to ensure consistent highlighting after page refresh';
