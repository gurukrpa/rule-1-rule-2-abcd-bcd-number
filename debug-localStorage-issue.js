// Enhanced debug script to check localStorage and find the root cause
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function debugLocalStorageIssue() {
  console.log('🔍 ENHANCED DEBUG: Auto-Upload Status Issue Investigation');
  console.log('=======================================================\n');

  // Get all users
  const { data: users } = await supabase.from('users').select('*');
  if (!users?.length) {
    console.log('❌ No users found');
    return;
  }

  const testUser = users.find(u => u.username === 'june2025') || users[0];
  console.log(`👤 Testing with User: ${testUser.username} (ID: ${testUser.id})`);

  // Test dates - including one that doesn't exist and one that does
  const testDates = [
    '2025-06-30', // Non-existent test date
    '2025-06-16', // Date that exists in data
    '2025-06-19', // Date that exists in data
    '2025-07-01', // Another non-existent date
  ];

  for (const testDate of testDates) {
    console.log(`\n📅 Testing Date: ${testDate}`);
    console.log('=' .repeat(40));

    // 1. Check Supabase Excel data
    const { data: excelData } = await supabase
      .from('excel_data')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('date', testDate)
      .single();

    console.log(`📊 Supabase Excel Data: ${excelData ? '✅ EXISTS' : '❌ NOT FOUND'}`);

    // 2. Check Supabase Hour Entry data
    const { data: hourData } = await supabase
      .from('hour_entries')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('date_key', testDate)
      .single();

    console.log(`⏰ Supabase Hour Data: ${hourData ? '✅ EXISTS' : '❌ NOT FOUND'}`);

    // 3. Check what localStorage keys would be created
    const excelKey = `abcd_excel_${testUser.id}_${testDate}`;
    const hourKey = `abcd_hourEntry_${testUser.id}_${testDate}`;

    console.log(`🗂️ Expected localStorage keys:`);
    console.log(`   Excel: ${excelKey}`);
    console.log(`   Hour:  ${hourKey}`);

    // 4. Simulate the hasExcelData logic
    console.log(`\n🧩 Simulating hasExcelData() logic:`);
    console.log(`   1. Supabase check: ${excelData ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   2. localStorage fallback would check: ${excelKey}`);
    console.log(`   3. Result would be: ${excelData ? 'true (from Supabase)' : 'depends on localStorage'}`);

    // 5. Simulate the hasHourEntry logic
    console.log(`\n⏰ Simulating hasHourEntry() logic:`);
    console.log(`   1. Supabase check: ${hourData ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   2. localStorage fallback would check: ${hourKey}`);
    console.log(`   3. Result would be: ${hourData ? 'true (from Supabase)' : 'depends on localStorage'}`);
  }

  // 6. Check for potential localStorage pollution
  console.log(`\n🧹 Potential localStorage Pollution Check`);
  console.log('=========================================');
  console.log('🚨 WARNING: In the browser, check these keys exist:');
  
  for (const testDate of testDates.filter(d => d === '2025-06-30' || d === '2025-07-01')) {
    const excelKey = `abcd_excel_${testUser.id}_${testDate}`;
    const hourKey = `abcd_hourEntry_${testUser.id}_${testDate}`;
    console.log(`   ${excelKey}`);
    console.log(`   ${hourKey}`);
  }

  console.log('\n💡 DIAGNOSIS:');
  console.log('==============');
  console.log('1. If new dates show "uploaded" status immediately, it means:');
  console.log('   - localStorage has cached data for dates that should be empty');
  console.log('   - The DataService useLocalStorageFallback=true is finding old cached data');
  console.log('   - This causes hasExcelData() and hasHourEntry() to return true falsely');
  console.log('');
  console.log('2. SOLUTION OPTIONS:');
  console.log('   A. Clear localStorage pollution (temporary fix)');
  console.log('   B. Modify hasExcelData/hasHourEntry to ignore localStorage for new dates');
  console.log('   C. Disable localStorage fallback entirely (cleanest solution)');
  console.log('   D. Add date validation to localStorage checks');

  console.log('\n📋 NEXT STEPS:');
  console.log('===============');
  console.log('1. Open browser dev tools and check localStorage for the keys above');
  console.log('2. If they exist with data, that\'s the source of false positives');
  console.log('3. Consider implementing solution C or D for permanent fix');
}

debugLocalStorageIssue().then(() => {
  console.log('\n✅ Enhanced debug complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Debug failed:', err);
  process.exit(1);
});
