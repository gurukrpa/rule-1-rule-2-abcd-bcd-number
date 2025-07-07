// Quick script to check available dates for user "sing maya"
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lgbcbqaqdsgwkcgvqlsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYmNicWFxZHNnd2tjZ3ZxbHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMDgyNTcsImV4cCI6MjA0NzY4NDI1N30.tKZgapYNcJOgXYbF8BhJJNKpI5WuEw6oc3vJYHhBFD0';

const supabase = createClient(supabaseUrl, supabaseKey);
const USER_ID = 'sing maya';

console.log('🔍 CHECKING AVAILABLE DATES FOR USER:', USER_ID);
console.log('=======================================');

try {
  // Check Excel Data
  const { data: excelData, error: excelError } = await supabase
    .from('excel_data')
    .select('date')
    .eq('user_id', USER_ID)
    .order('date', { ascending: true });
  
  if (excelError) {
    console.log('❌ Excel data error:', excelError.message);
  } else {
    const excelDates = excelData.map(row => row.date);
    console.log('📊 Excel Data Dates:', excelDates);
  }
  
  // Check Hour Entries
  const { data: hourData, error: hourError } = await supabase
    .from('hour_entries')
    .select('date_key')
    .eq('user_id', USER_ID)
    .order('date_key', { ascending: true });
  
  if (hourError) {
    console.log('❌ Hour data error:', hourError.message);
  } else {
    const hourDates = hourData.map(row => row.date_key);
    console.log('🕒 Hour Entry Dates:', hourDates);
  }
  
  // Find common dates (both Excel and Hour data exist)
  if (!excelError && !hourError) {
    const excelDates = excelData.map(row => row.date);
    const hourDates = hourData.map(row => row.date_key);
    const commonDates = excelDates.filter(date => hourDates.includes(date));
    console.log('✅ Common Dates (Excel + Hour):', commonDates);
    console.log('📅 Total available dates:', commonDates.length);
    
    if (commonDates.includes('2025-07-03')) {
      console.log('🎯 July 3rd data EXISTS!');
    } else {
      console.log('❌ July 3rd data NOT found');
    }
    
    if (commonDates.includes('2025-07-06')) {
      console.log('🎯 July 6th data EXISTS!');
    } else {
      console.log('❌ July 6th data NOT found');
    }
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
