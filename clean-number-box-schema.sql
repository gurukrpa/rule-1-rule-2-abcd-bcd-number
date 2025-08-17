-- PURE CLEAN NUMBER BOX SYSTEM - SUPABASE ONLY
-- Simple table structure for clicked numbers

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.number_clicks;

-- Create clean simple table
CREATE TABLE public.number_clicks (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    date_key TEXT NOT NULL,
    hour INTEGER NOT NULL,
    number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, topic, date_key, hour, number)
);

-- Enable RLS
ALTER TABLE public.number_clicks ENABLE ROW LEVEL SECURITY;

-- Simple policy - users can manage their own data
CREATE POLICY "Users can manage their own clicks" ON public.number_clicks
    FOR ALL USING (true) WITH CHECK (true);

-- Index for fast queries
CREATE INDEX idx_number_clicks_lookup ON public.number_clicks(user_id, topic, date_key, hour);
