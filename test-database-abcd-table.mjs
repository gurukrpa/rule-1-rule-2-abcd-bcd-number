// Test script to check if the topic_abcd_bcd_numbers table exists and is accessible
import { createClient } from '@supabase/supabase-js';

// These should match your actual Supabase configuration
const supabaseUrl = 'https://ehxszmgzjqrjpkpwvwfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoeHN6bWd6anFyanBrcHd2d2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NDcyMjksImV4cCI6MjA1MTIyMzIyOX0.C6iOD7P3ALqgAIVHQO6mqkRG5DF2Q93Jl1zK__9hGl0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing topic_abcd_bcd_numbers table...');
  
  try {
    // Test if table exists and is accessible
    const { data, error } = await supabase
      .from('topic_abcd_bcd_numbers')
      .select('topic_name, abcd_numbers, bcd_numbers')
      .limit(5);
    
    if (error) {
      console.error('❌ Table access error:', error);
      
      if (error.message.includes('relation "topic_abcd_bcd_numbers" does not exist')) {
        console.log('\n🛠️ TABLE DOES NOT EXIST!');
        console.log('📋 You need to create the table. Here\'s the SQL to run in Supabase Dashboard:');
        console.log('\n--- RUN THIS SQL IN SUPABASE DASHBOARD ---');
        console.log(`
CREATE TABLE IF NOT EXISTS topic_abcd_bcd_numbers (
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
CREATE INDEX IF NOT EXISTS idx_topic_abcd_bcd_topic_name ON topic_abcd_bcd_numbers(topic_name);

-- Add RLS (Row Level Security) policies
ALTER TABLE topic_abcd_bcd_numbers ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY IF NOT EXISTS "Allow read access to all users" ON topic_abcd_bcd_numbers
    FOR SELECT USING (true);

-- Allow insert/update access to authenticated users
CREATE POLICY IF NOT EXISTS "Allow insert/update access to all users" ON topic_abcd_bcd_numbers
    FOR ALL USING (true);
`);
        console.log('--- END SQL ---\n');
        return false;
      }
      
      return false;
    }
    
    if (data) {
      console.log('✅ Table exists and is accessible!');
      console.log(`📊 Found ${data.length} existing records:`);
      data.forEach(row => {
        console.log(`   ${row.topic_name}: ABCD[${row.abcd_numbers?.join(', ') || 'none'}] BCD[${row.bcd_numbers?.join(', ') || 'none'}]`);
      });
      return true;
    } else {
      console.log('✅ Table exists but is empty');
      return true;
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return false;
  }
}

// Run the test
testDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Database is ready for ABCD/BCD number storage!');
  } else {
    console.log('\n🔧 Database table needs to be created first.');
  }
  process.exit(0);
});
