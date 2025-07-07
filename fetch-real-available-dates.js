// Script to fetch actual available dates from database for user "sing maya"
// This will show the REAL dates available in the database
// Then implement proper N-1 pattern with accurate date lookup

import { supabase } from './src/supabaseClient.js';

console.log('🔍 FETCHING REAL AVAILABLE DATES FOR USER "sing maya"');

const USER_ID = 'sing maya';

async function fetchAllAvailableDates() {
  console.log('\n📊 CHECKING ALL DATA SOURCES...');
  
  const allDates = new Set();
  
  try {
    // 1. Check Excel Data
    console.log('\n1️⃣ CHECKING EXCEL DATA...');
    const { data: excelData, error: excelError } = await supabase
      .from('excel_data')
      .select('date, file_name')
      .eq('user_id', USER_ID)
      .order('date', { ascending: true });
    
    if (excelError) {
      console.log('❌ Excel data error:', excelError.message);
    } else {
      console.log(`✅ Found ${excelData.length} Excel records:`);
      excelData.forEach(record => {
        console.log(`   📊 ${record.date} - ${record.file_name}`);
        allDates.add(record.date);
      });
    }
    
    // 2. Check Hour Entries
    console.log('\n2️⃣ CHECKING HOUR ENTRIES...');
    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')
      .select('date_key, hour_data')
      .eq('user_id', USER_ID)
      .order('date_key', { ascending: true });
    
    if (hourError) {
      console.log('❌ Hour entries error:', hourError.message);
    } else {
      console.log(`✅ Found ${hourData.length} Hour Entry records:`);
      hourData.forEach(record => {
        console.log(`   ⏰ ${record.date_key} - ${Object.keys(record.hour_data?.planetSelections || {}).length} hours`);
        allDates.add(record.date_key);
      });
    }
    
    // 3. Check User Dates
    console.log('\n3️⃣ CHECKING USER DATES...');
    const { data: userData, error: userError } = await supabase
      .from('user_dates')
      .select('dates')
      .eq('user_id', USER_ID)
      .single();
    
    if (userError) {
      console.log('❌ User dates error:', userError.message);
    } else if (userData?.dates) {
      console.log(`✅ Found ${userData.dates.length} User Date records:`);
      userData.dates.forEach(date => {
        console.log(`   📅 ${date}`);
        allDates.add(date);
      });
    }
    
    // 4. Check ABCD User Dates
    console.log('\n4️⃣ CHECKING ABCD USER DATES...');
    const { data: abcdUserData, error: abcdUserError } = await supabase
      .from('user_dates_abcd')
      .select('dates')
      .eq('user_id', USER_ID)
      .single();
    
    if (abcdUserError) {
      console.log('❌ ABCD user dates error:', abcdUserError.message);
    } else if (abcdUserData?.dates) {
      console.log(`✅ Found ${abcdUserData.dates.length} ABCD User Date records:`);
      abcdUserData.dates.forEach(date => {
        console.log(`   📅 ${date}`);
        allDates.add(date);
      });
    }
    
    // Combine and analyze all dates
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
    
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log('==================');
    console.log(`Total unique dates found: ${sortedDates.length}`);
    console.log('All available dates:', sortedDates);
    
    // Test N-1 pattern for July 7
    const july7 = '2025-07-07';
    const july7Date = new Date(july7);
    
    console.log('\n🧮 N-1 PATTERN ANALYSIS FOR JULY 7:');
    console.log('===================================');
    console.log(`Target date: ${july7}`);
    
    // Find closest previous date
    let closestPrevious = null;
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const availableDate = new Date(sortedDates[i]);
      if (availableDate < july7Date) {
        closestPrevious = sortedDates[i];
        console.log(`✅ Found closest previous date: ${closestPrevious}`);
        break;
      }
    }
    
    if (!closestPrevious) {
      console.log('❌ No previous date found for July 7, 2025');
    }
    
    // Dates that have BOTH Excel and Hour Entry data
    console.log('\n🔄 DATES WITH COMPLETE DATA (Excel + Hour Entry):');
    console.log('==============================================');
    
    const completeDates = [];
    for (const date of sortedDates) {
      const hasExcel = excelData.some(record => record.date === date);
      const hasHour = hourData.some(record => record.date_key === date);
      
      if (hasExcel && hasHour) {
        completeDates.push(date);
        console.log(`✅ ${date} - COMPLETE (Excel ✓ + Hour Entry ✓)`);
      } else {
        console.log(`⚠️  ${date} - INCOMPLETE (Excel ${hasExcel ? '✓' : '❌'} + Hour Entry ${hasHour ? '✓' : '❌'})`);
      }
    }
    
    console.log('\n📋 SUMMARY FOR N-1 PATTERN:');
    console.log('===========================');
    console.log(`Available dates: ${sortedDates}`);
    console.log(`Complete dates: ${completeDates}`);
    console.log(`July 7 → Previous date: ${closestPrevious}`);
    console.log(`Is closest previous complete?: ${completeDates.includes(closestPrevious)}`);
    
    return {
      allDates: sortedDates,
      completeDates,
      closestPreviousToJuly7: closestPrevious
    };
    
  } catch (error) {
    console.error('❌ Error fetching dates:', error);
    return null;
  }
}

// Run the analysis
fetchAllAvailableDates().then(result => {
  if (result) {
    console.log('\n🎉 REAL DATE FETCHING COMPLETE!');
    console.log('================================');
    console.log('Use this data to implement proper N-1 pattern logic.');
    console.log('Available dates for "sing maya":', result.allDates);
    console.log('Complete dates (Excel + Hour):', result.completeDates);
    console.log('N-1 result for July 7:', result.closestPreviousToJuly7);
  }
});
