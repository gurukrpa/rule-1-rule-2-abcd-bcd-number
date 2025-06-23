// 🔍 Quick Database Check for Rule2CompactPage Issue
// Run this to check if data exists for the user/dates in question

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pqxomdlxrhemtimxmhbw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxeG9tZGx4cmhlbXRpbXhtaGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwNDMzOTYsImV4cCI6MjA0NDYxOTM5Nn0.z_0Mec3VpKvOb_0rlAdJ7xGAMuKR1QJEXhJfkXfbdXM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserData() {
  const userId = '8db9861a-76ce-4ae3-81b0-7a8b82314ef2';
  const dates = ['2025-06-01', '2025-06-02', '2025-06-03', '2025-06-04', '2025-06-05'];
  
  console.log('🔍 CHECKING USER DATA FOR RULE2COMPACT');
  console.log('=====================================');
  console.log('User ID:', userId);
  console.log('Date Range:', dates);
  console.log('');

  // Check Excel data
  console.log('📊 EXCEL DATA CHECK:');
  for (const date of dates) {
    const { data: excelData, error } = await supabase
      .from('excel_data')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      console.log(`❌ ${date}: Error -`, error.message);
    } else if (excelData && excelData.length > 0) {
      const sets = Object.keys(excelData[0].data?.sets || {});
      console.log(`✅ ${date}: Found ${sets.length} sets`);
    } else {
      console.log(`❌ ${date}: No Excel data found`);
    }
  }

  // Check Hour data
  console.log('\n⏰ HOUR DATA CHECK:');
  for (const date of dates) {
    const { data: hourData, error } = await supabase
      .from('hour_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date_key', date);

    if (error) {
      console.log(`❌ ${date}: Error -`, error.message);
    } else if (hourData && hourData.length > 0) {
      const planetCount = Object.keys(hourData[0].hour_data?.planetSelections || {}).length;
      console.log(`✅ ${date}: Found ${planetCount} planet selections`);
    } else {
      console.log(`❌ ${date}: No Hour data found`);
    }
  }

  console.log('\n🎯 SUMMARY:');
  console.log('If you see missing data above, that explains why 0 topics are analyzed.');
  console.log('The Rule2CompactPage needs BOTH Excel and Hour data for all 4 dates (A,B,C,D).');
}

checkUserData().catch(console.error);
