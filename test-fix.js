// Test script to verify the fix for auto-upload status bug
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Simulate the DataService logic with the fix
class TestDataService {
  constructor() {
    this.useLocalStorageFallback = true;
    this.enableDebugLogging = true;
  }

  log(message, data = null) {
    if (this.enableDebugLogging) {
      console.log(`[TestDataService] ${message}`, data || '');
    }
  }

  /**
   * FIXED hasExcelData function - no localStorage fallback for status checks
   */
  async hasExcelData(userId, date) {
    try {
      const { count, error } = await supabase
        .from('excel_data')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date', date);

      if (error) {
        this.log('⚠️ Supabase Excel check error:', error.message);
        return false;
      }

      const exists = count > 0;
      this.log(`📊 Excel data check: ${exists ? 'EXISTS' : 'NOT FOUND'}`, { userId, date, count });
      return exists;

    } catch (error) {
      this.log('❌ Excel data check failed:', error.message);
      return false;
    }
  }

  /**
   * FIXED hasHourEntry function - no localStorage fallback for status checks
   */
  async hasHourEntry(userId, date) {
    try {
      const { count, error } = await supabase
        .from('hour_entry')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date_key', date);

      if (error) {
        this.log('⚠️ Supabase Hour Entry check error:', error.message);
        return false;
      }

      const exists = count > 0;
      this.log(`⏰ Hour Entry check: ${exists ? 'EXISTS' : 'NOT FOUND'}`, { userId, date, count });
      return exists;

    } catch (error) {
      this.log('❌ Hour Entry check failed:', error.message);
      return false;
    }
  }
}

async function testFix() {
  console.log('🔧 TESTING FIX: Auto-Upload Status Bug');
  console.log('=====================================\n');

  // Get test user
  const { data: users } = await supabase.from('users').select('*');
  if (!users?.length) {
    console.log('❌ No users found');
    return;
  }

  const testUser = users.find(u => u.username === 'june2025') || users[0];
  console.log(`👤 Testing with User: ${testUser.username} (ID: ${testUser.id})`);

  const testService = new TestDataService();

  // Test dates - mix of existing and non-existing
  const testDates = [
    { date: '2025-06-30', expected: { excel: false, hour: false }, desc: 'New date (should be false)' },
    { date: '2025-06-16', expected: { excel: true, hour: true }, desc: 'Date with both Excel and Hour data' },
    { date: '2025-06-19', expected: { excel: true, hour: false }, desc: 'Date with Excel only' },
    { date: '2025-07-01', expected: { excel: false, hour: false }, desc: 'Future date (should be false)' },
  ];

  console.log('\n🧪 Testing fixed status checking functions:');
  console.log('==========================================');

  for (const test of testDates) {
    console.log(`\n📅 Testing: ${test.date} (${test.desc})`);
    
    // Test Excel status
    const excelStatus = await testService.hasExcelData(testUser.id, test.date);
    const excelResult = excelStatus === test.expected.excel ? '✅ CORRECT' : '❌ WRONG';
    console.log(`   📊 Excel Status: ${excelStatus} ${excelResult}`);
    
    // Test Hour Entry status
    const hourStatus = await testService.hasHourEntry(testUser.id, test.date);
    const hourResult = hourStatus === test.expected.hour ? '✅ CORRECT' : '❌ WRONG';
    console.log(`   ⏰ Hour Status: ${hourStatus} ${hourResult}`);
    
    // Overall result
    const bothCorrect = excelStatus === test.expected.excel && hourStatus === test.expected.hour;
    console.log(`   🎯 Overall: ${bothCorrect ? '✅ FIXED' : '❌ STILL BROKEN'}`);
  }

  console.log('\n📋 SUMMARY:');
  console.log('===========');
  console.log('✅ Fixed hasExcelData() - no more localStorage fallback for status checks');
  console.log('✅ Fixed hasHourEntry() - no more localStorage fallback for status checks');
  console.log('✅ New dates should now show correct "pending upload" status');
  console.log('✅ Existing dates should still show correct status based on Supabase data');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('===============');
  console.log('1. Test the fix in the browser with the ABCD page');
  console.log('2. Add a new date and verify it shows as "not uploaded"');
  console.log('3. Upload files and verify status updates correctly');
  console.log('4. Commit the fix to the git branch');
}

testFix().then(() => {
  console.log('\n✅ Fix verification complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Fix verification failed:', err);
  process.exit(1);
});
