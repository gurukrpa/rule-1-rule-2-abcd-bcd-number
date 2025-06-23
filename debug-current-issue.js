// Debug current auto-upload status issue
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Simulate CleanSupabaseService methods
class DebugCleanSupabaseService {
  constructor() {
    this.supabase = supabase;
  }

  async hasExcelData(userId, date) {
    try {
      console.log(`\n🔍 Checking Excel data for user ${userId} on ${date}...`);
      
      const { count, error } = await this.supabase
        .from('excel_data')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date', date);

      console.log(`   📊 Supabase query result:`, { count, error: error?.message });

      if (error) {
        console.log(`   ❌ Supabase error, returning false to prevent false positives`);
        return false;
      }
      
      const exists = count > 0;
      console.log(`   ${exists ? '✅' : '❌'} Excel data ${exists ? 'EXISTS' : 'NOT FOUND'}`);
      return exists;
    } catch (error) {
      console.log(`   ❌ Exception caught:`, error.message);
      return false;
    }
  }

  async hasHourEntry(userId, date) {
    try {
      console.log(`\n⏰ Checking Hour Entry for user ${userId} on ${date}...`);
      
      const { count, error } = await this.supabase
        .from('hour_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date_key', date);

      console.log(`   📊 Supabase query result:`, { count, error: error?.message });

      if (error) {
        console.log(`   ❌ Supabase error, returning false to prevent false positives`);
        return false;
      }
      
      const exists = count > 0;
      console.log(`   ${exists ? '✅' : '❌'} Hour Entry ${exists ? 'EXISTS' : 'NOT FOUND'}`);
      return exists;
    } catch (error) {
      console.log(`   ❌ Exception caught:`, error.message);
      return false;
    }
  }

  async getAllUsers() {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('username');

    if (error) throw error;
    return data || [];
  }
}

async function debugCurrentIssue() {
  console.log('🔍 DEBUGGING CURRENT AUTO-UPLOAD STATUS ISSUE');
  console.log('==============================================\n');

  const service = new DebugCleanSupabaseService();

  try {
    // Get users
    const users = await service.getAllUsers();
    console.log('👥 Available users:', users.map(u => `${u.id}: ${u.username}`).join(', '));

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    // Test with first user and the date mentioned (Jun 3, 2025)
    const testUser = users[0];
    const testDate = '2025-06-03'; // The date the user mentioned

    console.log(`\n🧪 Testing with User ${testUser.id} (${testUser.username}) on ${testDate}`);
    console.log('This is the date user reported as showing green checkmarks incorrectly');

    // Test hasExcelData
    const hasExcel = await service.hasExcelData(testUser.id, testDate);
    
    // Test hasHourEntry  
    const hasHour = await service.hasHourEntry(testUser.id, testDate);

    console.log(`\n📋 FINAL RESULTS for ${testDate}:`);
    console.log(`   Excel Upload Status: ${hasExcel ? '🟢 UPLOADED' : '🔴 NOT UPLOADED'}`);
    console.log(`   Hour Entry Status: ${hasHour ? '🟢 COMPLETED' : '🔴 NOT COMPLETED'}`);

    if (hasExcel || hasHour) {
      console.log(`\n⚠️  BUG REPRODUCED! New date showing as uploaded when it shouldn't be.`);
    } else {
      console.log(`\n✅ Working correctly! New date shows as not uploaded.`);
    }

    // Let's also test some other recent dates
    const testDates = ['2025-06-01', '2025-06-02', '2025-06-04', '2025-06-05'];
    
    for (const date of testDates) {
      console.log(`\n📅 Testing date ${date}:`);
      const excel = await service.hasExcelData(testUser.id, date);
      const hour = await service.hasHourEntry(testUser.id, date);
      console.log(`   Excel: ${excel ? '🟢' : '🔴'}, Hour: ${hour ? '🟢' : '🔴'}`);
    }

    // Check if there's any data in localStorage that might be causing interference
    console.log(`\n🗄️  POTENTIAL LOCALSTORAGE INTERFERENCE CHECK:`);
    console.log('Note: This script runs in Node.js, not browser, so localStorage is not available here.');
    console.log('But in the browser, localStorage might still contain cached data from previous sessions.');
    console.log('');
    console.log('🔍 POSSIBLE CAUSES:');
    console.log('1. Browser localStorage still contains cached status from previous sessions');
    console.log('2. Frontend code is not using the latest CleanSupabaseService');
    console.log('3. Frontend has mixed service usage (dataService vs cleanSupabaseService)');
    console.log('4. Browser cache needs to be cleared');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugCurrentIssue().then(() => {
  console.log('\n✅ Debug complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Debug failed:', err);
  process.exit(1);
});
