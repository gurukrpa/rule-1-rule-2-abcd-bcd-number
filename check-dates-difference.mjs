import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gpspllqfvwxegucaxlhc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc3BsbHFmdnd4ZWd1Y2F4bGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNzQwMzIsImV4cCI6MjA0ODc1MDAzMn0.C6-1A6M1q6MNmUyiS9VIFkK0CcfOpcxbPYkVKBAcNGY'
);

async function checkDates() {
  console.log('🔍 Checking Rule-1 vs Rule-2 date differences...\n');
  
  // Get all available dates
  const { data: dateData, error: dateError } = await supabase
    .from('topic_analysis_results')
    .select('analysis_date')
    .eq('user_id', 'sing-maya')
    .order('analysis_date', { ascending: true });
    
  if (dateError || !dateData) {
    console.error('❌ Error fetching dates:', dateError);
    return;
  }
  
  const uniqueDates = [...new Set(dateData.map(d => d.analysis_date))].sort();
  console.log('📅 Available dates:', uniqueDates);
  console.log('📊 Total dates:', uniqueDates.length);
  
  if (uniqueDates.length < 2) {
    console.log('❌ Need at least 2 dates to compare Rule-1 vs Rule-2');
    return;
  }
  
  const rule1Date = uniqueDates[uniqueDates.length - 1];  // Last date (Rule-1 target)
  const rule2Date = uniqueDates[uniqueDates.length - 2];  // Second-to-last (Rule-2)
  
  console.log(`\n🎯 Rule-1 Date (target): ${rule1Date}`);
  console.log(`🎯 Rule-2 Date (analysis): ${rule2Date}`);
  
  // Sample comparison: Topic 1, Hour 2
  const { data: rule1Sample } = await supabase
    .from('topic_analysis_results')
    .select('*')
    .eq('user_id', 'sing-maya')
    .eq('analysis_date', rule1Date)
    .eq('topic', 1)
    .eq('hour', 2)
    .single();
    
  const { data: rule2Sample } = await supabase
    .from('topic_analysis_results')
    .select('*')
    .eq('user_id', 'sing-maya')
    .eq('analysis_date', rule2Date)
    .eq('topic', 1)
    .eq('hour', 2)
    .single();
    
  console.log('\n📊 Sample Data (Topic 1, Hour 2):');
  
  if (rule1Sample) {
    console.log(`Rule-1: A=${rule1Sample.a_number}, B=${rule1Sample.b_number}, C=${rule1Sample.c_number}, D=${rule1Sample.d_number}`);
  } else {
    console.log('Rule-1: NO DATA');
  }
  
  if (rule2Sample) {
    console.log(`Rule-2: A=${rule2Sample.a_number}, B=${rule2Sample.b_number}, C=${rule2Sample.c_number}, D=${rule2Sample.d_number}`);
  } else {
    console.log('Rule-2: NO DATA');
  }
  
  if (rule1Sample && rule2Sample) {
    const sameABCD = rule1Sample.a_number === rule2Sample.a_number && 
                     rule1Sample.b_number === rule2Sample.b_number && 
                     rule1Sample.c_number === rule2Sample.c_number && 
                     rule1Sample.d_number === rule2Sample.d_number;
    console.log(`\n✅ ABCD Numbers are: ${sameABCD ? '🟢 IDENTICAL' : '🔴 DIFFERENT'}`);
    
    if (sameABCD) {
      console.log('💡 This explains why changing the date doesn\'t fix the display issue!');
      console.log('💡 The problem is likely in how the data is being processed or displayed.');
    }
  }
  
  // Check total records for each date
  const { data: rule1Count } = await supabase
    .from('topic_analysis_results')
    .select('*', { count: 'exact' })
    .eq('user_id', 'sing-maya')
    .eq('analysis_date', rule1Date);
    
  const { data: rule2Count } = await supabase
    .from('topic_analysis_results')
    .select('*', { count: 'exact' })
    .eq('user_id', 'sing-maya')
    .eq('analysis_date', rule2Date);
    
  console.log(`\n📈 Record counts:`);
  console.log(`Rule-1 (${rule1Date}): ${rule1Count?.length || 0} records`);
  console.log(`Rule-2 (${rule2Date}): ${rule2Count?.length || 0} records`);
}

checkDates().catch(console.error);
