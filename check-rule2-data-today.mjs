import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqqemyahglxnqcdtnxql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcWVteWFoZ2x4bnFjZHRueHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwNjM0NzcsImV4cCI6MjA0NjYzOTQ3N30.pEoXFUxqBZd7VpJvRH3HpyIDqWJUx3JUrHN5yCJR-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking Rule-2 analysis data for today (2025-08-21)...\n');

try {
  // Check what's in topic_analysis_results for today
  const { data: analysisResults, error: analysisError } = await supabase
    .from('topic_analysis_results')
    .select('*')
    .eq('analysis_date', '2025-08-21')
    .order('user_id')
    .order('hr_number')
    .order('set_name');

  if (analysisError) {
    console.error('❌ Database query error:', analysisError);
  } else {
    console.log(`📊 Found ${analysisResults?.length || 0} analysis results for 2025-08-21:`);
    
    if (analysisResults && analysisResults.length > 0) {
      // Group by user and topic
      const byUser = {};
      
      analysisResults.forEach(result => {
        const userId = result.user_id;
        const topicName = result.set_name || result.topic_name;
        const hr = result.hr_number;
        
        if (!byUser[userId]) byUser[userId] = {};
        if (!byUser[userId][topicName]) byUser[userId][topicName] = {};
        
        byUser[userId][topicName][hr] = {
          abcd: result.abcd_numbers || [],
          bcd: result.bcd_numbers || []
        };
      });
      
      // Display organized results
      Object.keys(byUser).forEach(userId => {
        console.log(`\n👤 User ID: ${userId}`);
        Object.keys(byUser[userId]).forEach(topicName => {
          console.log(`  📋 Topic: ${topicName}`);
          Object.keys(byUser[userId][topicName]).forEach(hr => {
            const data = byUser[userId][topicName][hr];
            console.log(`    HR${hr}: ABCD[${data.abcd.join(',')}] BCD[${data.bcd.join(',')}]`);
          });
        });
      });
      
      // Check specifically for D-1 Set-1 Matrix data
      console.log('\n🎯 Specific check for D-1 Set-1 Matrix data:');
      const d1set1Data = analysisResults.filter(r => 
        (r.set_name || r.topic_name || '').includes('D-1') && 
        (r.set_name || r.topic_name || '').includes('Set-1')
      );
      
      if (d1set1Data.length > 0) {
        d1set1Data.forEach(record => {
          console.log(`  ✅ User ${record.user_id}, HR${record.hr_number}: ${record.set_name} - ABCD[${(record.abcd_numbers || []).join(',')}] BCD[${(record.bcd_numbers || []).join(',')}]`);
        });
      } else {
        console.log('  ❌ No D-1 Set-1 Matrix data found');
      }
      
    } else {
      console.log('❌ No analysis results found for 2025-08-21');
    }
  }

} catch (error) {
  console.error('💥 Exception:', error);
}
