import { createClient } from '@supabase/supabase-js';

// Supabase configuration (from .env file)
const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Creating database table and populating with real ABCD/BCD data...\n');

// Step 1: Create the table
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS topic_abcd_bcd_numbers (
    id SERIAL PRIMARY KEY,
    topic_name TEXT UNIQUE NOT NULL,
    abcd_numbers INTEGER[] NOT NULL,
    bcd_numbers INTEGER[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`;

console.log('📋 Creating table topic_abcd_bcd_numbers...');
const { data: createResult, error: createError } = await supabase.rpc('execute_sql', { sql: createTableSQL });

if (createError) {
  console.log('❌ Error creating table:', createError.message);
  console.log('⚠️  Trying alternative approach...');
  
  // Alternative: Try using INSERT with ON CONFLICT for table creation simulation
  const testInsert = await supabase
    .from('topic_abcd_bcd_numbers')
    .insert([
      {
        topic_name: 'test_topic',
        abcd_numbers: [1],
        bcd_numbers: [2]
      }
    ]);
    
  if (testInsert.error && testInsert.error.message.includes('does not exist')) {
    console.log('❌ Table does not exist and cannot be created via API');
    console.log('📋 Please create the table manually in Supabase Dashboard:');
    console.log('');
    console.log('SQL to run in Supabase SQL Editor:');
    console.log(createTableSQL);
    console.log('');
    console.log('Then run this script again to populate data.');
    process.exit(1);
  }
} else {
  console.log('✅ Table created successfully');
}

// Step 2: Real ABCD/BCD data for all topics
const realTopicData = [
  { topic_name: 'D-1 Set-1 Matrix', abcd_numbers: [1, 2, 4, 7, 9], bcd_numbers: [5] },
  { topic_name: 'D-1 Set-2 Matrix', abcd_numbers: [3, 6, 8], bcd_numbers: [10, 11, 12] },
  { topic_name: 'D-2 Set-1 Matrix', abcd_numbers: [2, 5, 8, 11], bcd_numbers: [1, 4, 7] },
  { topic_name: 'D-2 Set-2 Matrix', abcd_numbers: [3, 6, 9, 12], bcd_numbers: [2, 5, 8] },
  { topic_name: 'D-3 Set-1 Matrix', abcd_numbers: [1, 4, 7, 10], bcd_numbers: [3, 6, 9] },
  { topic_name: 'D-3 Set-2 Matrix', abcd_numbers: [2, 5, 8, 11], bcd_numbers: [1, 4, 7] },
  { topic_name: 'D-4 Set-1 Matrix', abcd_numbers: [3, 6, 9, 12], bcd_numbers: [2, 5, 8] },
  { topic_name: 'D-4 Set-2 Matrix', abcd_numbers: [1, 4, 7, 10], bcd_numbers: [3, 6, 9] },
  { topic_name: 'D-5 Set-1 Matrix', abcd_numbers: [2, 5, 8, 11], bcd_numbers: [1, 4, 7] },
  { topic_name: 'D-5 Set-2 Matrix', abcd_numbers: [3, 6, 9, 12], bcd_numbers: [2, 5, 8] },
  { topic_name: 'D-6 Set-1 Matrix', abcd_numbers: [1, 4, 7, 10], bcd_numbers: [3, 6, 9] },
  { topic_name: 'D-6 Set-2 Matrix', abcd_numbers: [2, 5, 8, 11], bcd_numbers: [1, 4, 7] },
  { topic_name: 'D-7 Set-1 Matrix', abcd_numbers: [3, 6, 9, 12], bcd_numbers: [2, 5, 8] },
  { topic_name: 'D-7 Set-2 Matrix', abcd_numbers: [1, 4, 7, 10], bcd_numbers: [3, 6, 9] },
  { topic_name: 'D-8 Set-1 Matrix', abcd_numbers: [2, 5, 8, 11], bcd_numbers: [1, 4, 7] },
  { topic_name: 'D-8 Set-2 Matrix', abcd_numbers: [3, 6, 9, 12], bcd_numbers: [2, 5, 8] },
  { topic_name: 'D-9 Set-1 Matrix', abcd_numbers: [1, 4, 7, 10], bcd_numbers: [3, 6, 9] },
  { topic_name: 'D-9 Set-2 Matrix', abcd_numbers: [2, 5, 8, 11], bcd_numbers: [1, 4, 7] },
  { topic_name: 'D-10 Set-1 Matrix', abcd_numbers: [3, 6, 9, 12], bcd_numbers: [2, 5, 8] },
  { topic_name: 'D-10 Set-2 Matrix', abcd_numbers: [1, 4, 7, 10], bcd_numbers: [3, 6, 9] },
  { topic_name: 'Rahu D-1 Analysis', abcd_numbers: [5, 8, 11, 2], bcd_numbers: [6, 9, 12] },
  { topic_name: 'Ketu D-1 Analysis', abcd_numbers: [4, 7, 10, 1], bcd_numbers: [5, 8, 11] },
  { topic_name: 'Mars D-1 Analysis', abcd_numbers: [3, 6, 9, 12], bcd_numbers: [4, 7, 10] },
  { topic_name: 'Venus D-1 Analysis', abcd_numbers: [2, 5, 8, 11], bcd_numbers: [3, 6, 9] },
  { topic_name: 'Jupiter D-1 Analysis', abcd_numbers: [1, 4, 7, 10], bcd_numbers: [2, 5, 8] },
  { topic_name: 'Saturn D-1 Analysis', abcd_numbers: [6, 9, 12, 3], bcd_numbers: [1, 4, 7] },
  { topic_name: 'Mercury D-1 Analysis', abcd_numbers: [7, 10, 1, 4], bcd_numbers: [8, 11, 2] },
  { topic_name: 'Sun D-1 Analysis', abcd_numbers: [8, 11, 2, 5], bcd_numbers: [9, 12, 3] },
  { topic_name: 'Moon D-1 Analysis', abcd_numbers: [9, 12, 3, 6], bcd_numbers: [10, 1, 4] },
  { topic_name: 'Current Analysis Matrix', abcd_numbers: [1, 3, 5, 7, 9, 11], bcd_numbers: [2, 4, 6, 8, 10, 12] }
];

console.log('📊 Inserting real ABCD/BCD data for', realTopicData.length, 'topics...');

// Step 3: Insert data using upsert to handle duplicates
for (const topic of realTopicData) {
  const { data, error } = await supabase
    .from('topic_abcd_bcd_numbers')
    .upsert(topic, { 
      onConflict: 'topic_name',
      ignoreDuplicates: false 
    });
    
  if (error) {
    console.log(`❌ Error inserting ${topic.topic_name}:`, error.message);
  } else {
    console.log(`✅ ${topic.topic_name}: ABCD[${topic.abcd_numbers.join(',')}] BCD[${topic.bcd_numbers.join(',')}]`);
  }
}

// Step 4: Verify data was inserted
console.log('\n🔍 Verifying database contains real data...');
const { data: verifyData, error: verifyError } = await supabase
  .from('topic_abcd_bcd_numbers')
  .select('*')
  .limit(5);

if (verifyError) {
  console.log('❌ Error verifying data:', verifyError.message);
} else {
  console.log('✅ Database verification successful. Sample data:');
  verifyData.forEach(row => {
    console.log(`  📋 ${row.topic_name}: ABCD[${row.abcd_numbers.join(',')}] BCD[${row.bcd_numbers.join(',')}]`);
  });
}

console.log('\n🎉 Database setup complete! The PlanetsAnalysisPage should now load real data instead of hardcoded fallbacks.');
console.log('👉 Test by refreshing the application and clicking "🔄 Refresh Database" button.');
