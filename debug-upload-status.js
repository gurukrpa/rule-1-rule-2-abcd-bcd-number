// Debug script to investigate auto-upload status issue
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function debugUploadStatus() {
  console.log('🔍 DEBUG: Investigating Auto-Upload Status Issue');
  console.log('=' .repeat(50));
  
  // Check current users
  const { data: users } = await supabase.from('users').select('*');
  console.log('\n👥 Available Users:', users?.map(u => `${u.id}: ${u.username}`));
  
  if (!users || users.length === 0) {
    console.log('❌ No users found');
    return;
  }
  
  // Check with first user
  const testUser = users[0];
  console.log(`\n🧪 Testing with User: ${testUser.username} (ID: ${testUser.id})`);
  
  // Test with a new date that shouldn't have data
  const testDate = '2025-06-30'; // Future date that shouldn't exist
  console.log(`📅 Test Date: ${testDate}`);
  
  // Check Supabase Excel data
  console.log('\n📊 Checking Supabase Excel Data...');
  const { data: excelData, error: excelError } = await supabase
    .from('excel_data')
    .select('*')
    .eq('user_id', testUser.id)
    .eq('date', testDate);
    
  console.log(`   Excel Query Result:`, { data: excelData, error: excelError });
  console.log(`   Excel Data Found: ${excelData && excelData.length > 0 ? 'YES' : 'NO'}`);
  
  // Check Supabase Hour Entry data
  console.log('\n⏰ Checking Supabase Hour Entry Data...');
  const { data: hourData, error: hourError } = await supabase
    .from('hour_entry')
    .select('*')
    .eq('user_id', testUser.id)
    .eq('date_key', testDate);
    
  console.log(`   Hour Entry Query Result:`, { data: hourData, error: hourError });
  console.log(`   Hour Entry Data Found: ${hourData && hourData.length > 0 ? 'YES' : 'NO'}`);
  
  // Check localStorage keys that might match
  console.log('\n🗂️ Checking localStorage for potentially conflicting data...');
  
  // This would need to be run in browser console, but let's show what to check
  console.log(`   Keys to check in browser localStorage:`);
  console.log(`   - abcd_excel_${testUser.id}_${testDate}`);
  console.log(`   - abcd_hourEntry_${testUser.id}_${testDate}`);
  
  // Show all Excel data for this user
  console.log('\n📋 All Excel Data for this user:');
  const { data: allExcel } = await supabase
    .from('excel_data')
    .select('date, file_name')
    .eq('user_id', testUser.id)
    .order('date', { ascending: false });
    
  if (allExcel && allExcel.length > 0) {
    allExcel.forEach(item => {
      console.log(`   - ${item.date}: ${item.file_name}`);
    });
  } else {
    console.log('   No Excel data found for this user');
  }
  
  // Show all Hour Entry data for this user
  console.log('\n⏰ All Hour Entry Data for this user:');
  const { data: allHour } = await supabase
    .from('hour_entry')
    .select('date_key')
    .eq('user_id', testUser.id)
    .order('date_key', { ascending: false });
    
  if (allHour && allHour.length > 0) {
    allHour.forEach(item => {
      console.log(`   - ${item.date_key}`);
    });
  } else {
    console.log('   No Hour Entry data found for this user');
  }
  
  console.log('\n💡 Debugging Suggestions:');
  console.log('1. Check browser localStorage for cached data');
  console.log('2. Check if DataService.useLocalStorageFallback is true');
  console.log('3. Verify that hasExcelData/hasHourEntry are checking the right date format');
  console.log('4. Check if there are any wildcard matches in localStorage keys');
}

debugUploadStatus().catch(console.error);
