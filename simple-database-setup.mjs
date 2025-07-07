import { createClient } from '@supabase/supabase-js';

// Supabase configuration (from .env file)
const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

console.log('🔧 Testing Supabase connection and attempting to insert data...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection first
try {
  console.log('📡 Testing Supabase connection...');
  const { data, error } = await supabase.from('users').select('count').limit(1);
  if (error) {
    console.log('❌ Connection test failed:', error.message);
  } else {
    console.log('✅ Supabase connection successful');
  }
} catch (err) {
  console.log('❌ Connection error:', err.message);
}

// Real ABCD/BCD data for key topics (starting with the most important ones)
const keyTopicData = [
  { topic_name: 'D-1 Set-1 Matrix', abcd_numbers: [1, 2, 4, 7, 9], bcd_numbers: [5] },
  { topic_name: 'D-1 Set-2 Matrix', abcd_numbers: [3, 6, 8], bcd_numbers: [10, 11, 12] },
  { topic_name: 'Current Analysis Matrix', abcd_numbers: [1, 3, 5, 7, 9, 11], bcd_numbers: [2, 4, 6, 8, 10, 12] }
];

console.log('📊 Attempting to insert key topic data...');

// Try to insert each topic
for (const topic of keyTopicData) {
  try {
    console.log(`📋 Inserting ${topic.topic_name}...`);
    
    const { data, error } = await supabase
      .from('topic_abcd_bcd_numbers')
      .upsert(topic, { 
        onConflict: 'topic_name',
        ignoreDuplicates: false 
      });
      
    if (error) {
      console.log(`❌ Error inserting ${topic.topic_name}:`, error.message);
      
      // If table doesn't exist, show SQL to create it
      if (error.message.includes('does not exist')) {
        console.log('\n🔧 Table does not exist. Please create it manually in Supabase Dashboard:');
        console.log('\n📋 SQL to run in Supabase SQL Editor:');
        console.log(`
CREATE TABLE topic_abcd_bcd_numbers (
  id SERIAL PRIMARY KEY,
  topic_name TEXT UNIQUE NOT NULL,
  abcd_numbers INTEGER[] NOT NULL,
  bcd_numbers INTEGER[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
        console.log('\n📊 Then insert this data:');
        keyTopicData.forEach(t => {
          console.log(`INSERT INTO topic_abcd_bcd_numbers (topic_name, abcd_numbers, bcd_numbers) VALUES ('${t.topic_name}', '{${t.abcd_numbers.join(',')}}', '{${t.bcd_numbers.join(',')}}');`);
        });
        break;
      }
    } else {
      console.log(`✅ ${topic.topic_name}: ABCD[${topic.abcd_numbers.join(',')}] BCD[${topic.bcd_numbers.join(',')}]`);
    }
  } catch (err) {
    console.log(`❌ Exception inserting ${topic.topic_name}:`, err.message);
  }
}

// Verify data was inserted
try {
  console.log('\n🔍 Verifying database contains data...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('topic_abcd_bcd_numbers')
    .select('*')
    .limit(3);

  if (verifyError) {
    console.log('❌ Error verifying data:', verifyError.message);
  } else if (verifyData && verifyData.length > 0) {
    console.log('✅ Database verification successful. Found', verifyData.length, 'records:');
    verifyData.forEach(row => {
      console.log(`  📋 ${row.topic_name}: ABCD[${row.abcd_numbers.join(',')}] BCD[${row.bcd_numbers.join(',')}]`);
    });
    console.log('\n🎉 Database setup complete! Real data is now available.');
  } else {
    console.log('⚠️  No data found in database.');
  }
} catch (err) {
  console.log('❌ Verification error:', err.message);
}

console.log('\n👉 Next: Test the application by refreshing and clicking "🔄 Refresh Database" button.');

process.exit(0);
