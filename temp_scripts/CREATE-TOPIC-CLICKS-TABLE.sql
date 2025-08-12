-- Create table for storing clickable number box clicks
-- This table stores user clicks on number boxes (1-12) for each topic/date/hour combination

CREATE TABLE IF NOT EXISTS topic_clicks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  date_key TEXT NOT NULL,
  hour TEXT NOT NULL,
  clicked_number INTEGER NOT NULL,
  is_matched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_name, date_key, hour, clicked_number)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_topic_clicks_user_topic ON topic_clicks(user_id, topic_name);
CREATE INDEX IF NOT EXISTS idx_topic_clicks_date ON topic_clicks(date_key);
CREATE INDEX IF NOT EXISTS idx_topic_clicks_hour ON topic_clicks(hour);

-- Example of how data will be stored:
-- user_id: 'sing maya'
-- topic_name: 'D-1 Set-1 Matrix'
-- date_key: '2025-06-26'
-- hour: 'HR1'
-- clicked_number: 7
-- is_matched: TRUE (if number matches ABCD array for that topic/date)