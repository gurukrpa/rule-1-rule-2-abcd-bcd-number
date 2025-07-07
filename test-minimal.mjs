import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing minimal database connection...');

// Try to insert one record into the table
const testData = {
  topic_name: 'D-1 Set-1 Matrix',
  abcd_numbers: [1, 2, 4, 7, 9],
  bcd_numbers: [5]
};

supabase
  .from('topic_abcd_bcd_numbers')
  .upsert(testData)
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Database error:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('\n🔧 Create table manually in Supabase Dashboard with this SQL:');
        console.log(`
CREATE TABLE topic_abcd_bcd_numbers (
  id SERIAL PRIMARY KEY,
  topic_name TEXT UNIQUE NOT NULL,
  abcd_numbers INTEGER[] NOT NULL,
  bcd_numbers INTEGER[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
      }
    } else {
      console.log('✅ Data inserted successfully:', data);
    }
  })
  .catch(err => {
    console.log('❌ Connection error:', err.message);
  });
