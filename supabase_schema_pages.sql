-- Supabase Database Schema for IndexPage, Rule-1, and Rule-2 Pages
-- This schema supports date-by-date data management and easy D-date addition

-- 1. Main processed data table for all pages
CREATE TABLE processed_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    page_type TEXT NOT NULL CHECK (page_type IN ('index', 'rule1', 'rule2')),
    set_name TEXT NOT NULL,
    element_name TEXT NOT NULL,
    hr_number INTEGER NOT NULL,
    raw_data TEXT,
    formatted_data TEXT,
    extracted_number INTEGER,
    planet_code TEXT,
    sign_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, page_type, set_name, element_name, hr_number)
);

-- 2. ABCD sequences table for Rule-1 and Rule-2 analysis
CREATE TABLE abcd_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    trigger_date DATE NOT NULL, -- The date that triggered the analysis (5th date)
    page_type TEXT NOT NULL CHECK (page_type IN ('rule1', 'rule2')),
    a_date DATE NOT NULL,
    b_date DATE NOT NULL,
    c_date DATE NOT NULL,
    d_date DATE NOT NULL,
    selected_hr INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, trigger_date, page_type)
);

-- 3. ABCD/BCD analysis results
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    sequence_id UUID REFERENCES abcd_sequences(id) ON DELETE CASCADE,
    set_name TEXT NOT NULL,
    element_name TEXT NOT NULL,
    hr_number INTEGER NOT NULL,
    d_day_number INTEGER NOT NULL,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('ABCD', 'BCD')),
    qualification_reason TEXT, -- e.g., "appears in A,B,C", "B-D pair only"
    badge_text TEXT, -- e.g., "abcd-as-7-su-sc"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, sequence_id, set_name, element_name, hr_number, d_day_number, analysis_type)
);

-- 4. IndexPage display cache
CREATE TABLE index_page_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    date_window JSONB NOT NULL, -- [A_date, B_date, C_date, D_date]
    selected_hr INTEGER NOT NULL,
    set_name TEXT NOT NULL,
    display_data JSONB NOT NULL, -- Complete processed table data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
    UNIQUE(user_id, date_window, selected_hr, set_name)
);

-- 5. Create indexes for performance
CREATE INDEX idx_processed_data_user_date ON processed_data(user_id, date);
CREATE INDEX idx_processed_data_page_type ON processed_data(page_type);
CREATE INDEX idx_abcd_sequences_user_trigger ON abcd_sequences(user_id, trigger_date);
CREATE INDEX idx_analysis_results_sequence ON analysis_results(sequence_id);
CREATE INDEX idx_index_page_cache_user ON index_page_cache(user_id);
CREATE INDEX idx_index_page_cache_expires ON index_page_cache(expires_at);

-- 6. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_processed_data_updated_at 
    BEFORE UPDATE ON processed_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM index_page_cache WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- 8. Views for easy data access

-- View for current Rule-1 sequences (ready for new D-date addition)
CREATE VIEW rule1_current_sequences AS
SELECT 
    s.*,
    COUNT(ar.id) as analysis_count,
    MAX(pd.date) as latest_data_date
FROM abcd_sequences s
LEFT JOIN analysis_results ar ON s.id = ar.sequence_id
LEFT JOIN processed_data pd ON s.user_id = pd.user_id 
WHERE s.page_type = 'rule1'
GROUP BY s.id, s.user_id, s.trigger_date, s.page_type, s.a_date, s.b_date, s.c_date, s.d_date, s.selected_hr, s.created_at
ORDER BY s.trigger_date DESC;

-- View for Rule-2 analysis summaries
CREATE VIEW rule2_analysis_summary AS
SELECT 
    s.user_id,
    s.trigger_date,
    s.d_date,
    s.selected_hr,
    COUNT(CASE WHEN ar.analysis_type = 'ABCD' THEN 1 END) as abcd_count,
    COUNT(CASE WHEN ar.analysis_type = 'BCD' THEN 1 END) as bcd_count,
    COUNT(DISTINCT ar.set_name) as sets_analyzed
FROM abcd_sequences s
LEFT JOIN analysis_results ar ON s.id = ar.sequence_id
WHERE s.page_type = 'rule2'
GROUP BY s.user_id, s.trigger_date, s.d_date, s.selected_hr
ORDER BY s.trigger_date DESC;

-- View for IndexPage ready data
CREATE VIEW index_page_ready_data AS
SELECT DISTINCT
    user_id,
    date,
    COUNT(DISTINCT set_name) as sets_count,
    COUNT(DISTINCT element_name) as elements_count,
    COUNT(DISTINCT hr_number) as hr_count
FROM processed_data 
WHERE page_type = 'index'
GROUP BY user_id, date
HAVING COUNT(DISTINCT set_name) >= 1 
   AND COUNT(DISTINCT element_name) >= 9 -- At least 9 elements
   AND COUNT(DISTINCT hr_number) >= 1
ORDER BY date DESC;

-- Comments for documentation
COMMENT ON TABLE processed_data IS 'Main table storing all processed Excel/Hour data for Index, Rule-1, and Rule-2 pages';
COMMENT ON TABLE abcd_sequences IS 'Stores ABCD date sequences for Rule-1 and Rule-2 analysis';
COMMENT ON TABLE analysis_results IS 'Stores ABCD/BCD analysis results with badge information';
COMMENT ON TABLE index_page_cache IS 'Caches IndexPage display data for performance';
COMMENT ON VIEW rule1_current_sequences IS 'Current Rule-1 sequences ready for new D-date addition';
COMMENT ON VIEW rule2_analysis_summary IS 'Summary of Rule-2 analysis results';
COMMENT ON VIEW index_page_ready_data IS 'Dates with complete data ready for IndexPage display';
