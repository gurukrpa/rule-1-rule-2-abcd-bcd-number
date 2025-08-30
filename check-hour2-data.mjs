import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsryhmytdkbyjpqsmmtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcnloemV0ZGtieWpwcXNtbXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4NTE1NjMsImV4cCI6MjA0NTQyNzU2M30.QdFhQ3aYMo5L_XMvJOzLvJUrdjI3_bTqkmRQwzXzwuo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRule2Data() {
  console.log('🔍 Checking rule2_analysis_results for 2025-08-21...');
  
  const { data, error } = await supabase
    .from('rule2_analysis_results')
    .select('*')
    .eq('date', '2025-08-21')
    .order('hour', { ascending: true });
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📊 Found', data.length, 'records for 2025-08-21:');
  data.forEach(record => {
    console.log(`  Hour ${record.hour}:`, Object.keys(record.topic_numbers || {}).length, 'topics');
    if (record.hour === 2) {
      console.log('    Hour 2 topics:', Object.keys(record.topic_numbers || {}));
    }
  });
  
  // Check specifically for hour 2
  const hour2Data = data.find(record => record.hour === 2);
  if (hour2Data) {
    console.log('✅ Hour 2 data found:', JSON.stringify(hour2Data.topic_numbers, null, 2));
  } else {
    console.log('❌ No data found for hour 2');
    console.log('Available hours:', data.map(r => r.hour).join(', '));
  }
}

checkRule2Data().catch(console.error);
