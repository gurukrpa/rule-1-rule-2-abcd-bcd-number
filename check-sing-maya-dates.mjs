// Check available dates for user "sing maya" in Supabase database
import { createClient } from '@supabase/supabase-js';

// Use your actual Supabase credentials from the project
const supabaseUrl = 'https://kqfkebcqrspffwcrkkid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZmtlYmNxcnNwZmZ3Y3Jra2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2OTg5NzAsImV4cCI6MjA0OTI3NDk3MH0.yGCy2Vu0Y-8jSJ1D6lVJODPJN6_VuPqHdWKPPy3jyDw';

const supabase = createClient(supabaseUrl, supabaseKey);
const USER_ID = 'sing maya';

console.log('🔍 CHECKING AVAILABLE DATES FOR USER:', USER_ID);
console.log('=======================================\n');

async function checkAllTables() {
  try {
    console.log('📅 1. CHECKING USER_DATES TABLE...');
    const { data: userDates, error: userDatesError } = await supabase
      .from('user_dates')
      .select('dates')
      .eq('user_id', USER_ID)
      .single();
    
    if (userDatesError) {
      console.log('❌ User dates error:', userDatesError.message);
    } else if (userDates?.dates) {
      console.log(`✅ Found ${userDates.dates.length} dates in user_dates:`);
      userDates.dates.forEach(date => console.log(`   📅 ${date}`));
    } else {
      console.log('⚠️ No user_dates found');
    }

    console.log('\n📅 2. CHECKING USER_DATES_ABCD TABLE...');
    const { data: abcdDates, error: abcdDatesError } = await supabase
      .from('user_dates_abcd')
      .select('dates')
      .eq('user_id', USER_ID)
      .single();
    
    if (abcdDatesError) {
      console.log('❌ ABCD dates error:', abcdDatesError.message);
    } else if (abcdDates?.dates) {
      console.log(`✅ Found ${abcdDates.dates.length} dates in user_dates_abcd:`);
      abcdDates.dates.forEach(date => console.log(`   📅 ${date}`));
    } else {
      console.log('⚠️ No user_dates_abcd found');
    }

    console.log('\n📊 3. CHECKING EXCEL_DATA TABLE...');
    const { data: excelData, error: excelError } = await supabase
      .from('excel_data')
      .select('date, created_at')
      .eq('user_id', USER_ID)
      .order('date', { ascending: true });
    
    if (excelError) {
      console.log('❌ Excel data error:', excelError.message);
    } else if (excelData && excelData.length > 0) {
      console.log(`✅ Found ${excelData.length} Excel entries:`);
      excelData.forEach(record => console.log(`   📊 ${record.date} (created: ${new Date(record.created_at).toLocaleDateString()})`));
    } else {
      console.log('⚠️ No Excel data found');
    }

    console.log('\n⏰ 4. CHECKING HOUR_ENTRIES TABLE...');
    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')
      .select('date_key, created_at')
      .eq('user_id', USER_ID)
      .order('date_key', { ascending: true });
    
    if (hourError) {
      console.log('❌ Hour entries error:', hourError.message);
    } else if (hourData && hourData.length > 0) {
      console.log(`✅ Found ${hourData.length} Hour entries:`);
      hourData.forEach(record => console.log(`   ⏰ ${record.date_key} (created: ${new Date(record.created_at).toLocaleDateString()})`));
    } else {
      console.log('⚠️ No Hour entries found');
    }

    // Find common dates (complete data)
    if (excelData && hourData && excelData.length > 0 && hourData.length > 0) {
      const excelDates = excelData.map(d => d.date);
      const hourDates = hourData.map(d => d.date_key);
      const completeDates = excelDates.filter(date => hourDates.includes(date));
      
      console.log('\n✅ COMPLETE DATES (Excel + Hour):');
      if (completeDates.length > 0) {
        completeDates.forEach(date => console.log(`   🎯 ${date}`));
        console.log(`\n📊 Total complete dates: ${completeDates.length}`);
      } else {
        console.log('   ❌ No complete dates found');
      }
    }

    console.log('\n🎯 SUMMARY:');
    console.log('===========');
    const allFoundDates = new Set();
    
    if (userDates?.dates) userDates.dates.forEach(d => allFoundDates.add(d));
    if (abcdDates?.dates) abcdDates.dates.forEach(d => allFoundDates.add(d));
    if (excelData) excelData.forEach(d => allFoundDates.add(d.date));
    if (hourData) hourData.forEach(d => allFoundDates.add(d.date_key));
    
    const sortedDates = Array.from(allFoundDates).sort();
    console.log(`📅 All unique dates found: ${sortedDates.length}`);
    sortedDates.forEach(date => console.log(`   📅 ${date}`));

  } catch (error) {
    console.error('❌ Error checking dates:', error);
  }
}

checkAllTables();
