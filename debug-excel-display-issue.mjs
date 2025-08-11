#!/usr/bin/env node

/**
 * Debug script to investigate the Excel file display issue
 * User reports 18 Excel files uploaded but ABCD page shows only 2
 */

import { createClient } from '@supabase/supabase-js';

// Use the correct Supabase configuration from .env.local
const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DEBUGGING EXCEL FILE DISPLAY ISSUE');
console.log('===================================');
console.log('Problem: User uploaded 18 Excel files but ABCD page shows only 2');
console.log('');

async function debugExcelDisplayIssue() {
  try {
    // 1. Check all users in the system
    console.log('1️⃣ Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('id');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }
    
    console.log(`👥 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ID: ${user.id} | Username: "${user.username}" | Email: ${user.email || 'N/A'} | HR: ${user.hr || 'N/A'}`);
    });
    console.log('');

    // 2. Check excel_data table for all records
    console.log('2️⃣ Checking excel_data table...');
    const { data: excelRecords, error: excelError } = await supabase
      .from('excel_data')
      .select('*')
      .order('date', { ascending: false });
    
    if (excelError) {
      console.error('❌ Error fetching excel_data:', excelError.message);
      return;
    }
    
    console.log(`📊 Found ${excelRecords.length} Excel records in database:`);
    
    // Group by user_id
    const recordsByUser = {};
    excelRecords.forEach(record => {
      if (!recordsByUser[record.user_id]) {
        recordsByUser[record.user_id] = [];
      }
      recordsByUser[record.user_id].push(record);
    });
    
    Object.entries(recordsByUser).forEach(([userId, records]) => {
      console.log(`\n   User ID: ${userId} (${records.length} records)`);
      records.forEach((record, index) => {
        console.log(`     ${index + 1}. Date: ${record.date} | File: ${record.file_name} | Uploaded: ${record.uploaded_at || 'N/A'}`);
      });
    });
    console.log('');

    // 3. Check hour_entries table
    console.log('3️⃣ Checking hour_entries table...');
    const { data: hourRecords, error: hourError } = await supabase
      .from('hour_entries')
      .select('*')
      .order('date', { ascending: false });
    
    if (hourError) {
      console.error('❌ Error fetching hour_entries:', hourError.message);
      return;
    }
    
    console.log(`⏰ Found ${hourRecords.length} hour entry records:`);
    
    // Group by user_id
    const hoursByUser = {};
    hourRecords.forEach(record => {
      if (!hoursByUser[record.user_id]) {
        hoursByUser[record.user_id] = [];
      }
      hoursByUser[record.user_id].push(record);
    });
    
    Object.entries(hoursByUser).forEach(([userId, records]) => {
      console.log(`\n   User ID: ${userId} (${records.length} records)`);
      records.forEach((record, index) => {
        console.log(`     ${index + 1}. Date: ${record.date} | Planets: ${Object.keys(record.planet_selections || {}).length} selected`);
      });
    });
    console.log('');

    // 4. Check user_dates tables (both contexts)
    console.log('4️⃣ Checking user_dates tables...');
    
    // Check user_dates_userdata
    const { data: userDataDates, error: userDataError } = await supabase
      .from('user_dates_userdata')
      .select('*');
    
    if (!userDataError && userDataDates) {
      console.log(`📅 UserData page dates: ${userDataDates.length} records`);
      userDataDates.forEach(record => {
        console.log(`   User ${record.user_id}: ${record.dates?.length || 0} dates`);
      });
    }
    
    // Check user_dates_abcd
    const { data: abcdDates, error: abcdError } = await supabase
      .from('user_dates_abcd')
      .select('*');
    
    if (!abcdError && abcdDates) {
      console.log(`📅 ABCD page dates: ${abcdDates.length} records`);
      abcdDates.forEach(record => {
        console.log(`   User ${record.user_id}: ${record.dates?.length || 0} dates - ${record.dates?.join(', ') || 'none'}`);
      });
    }
    console.log('');

    // 5. Simulate the application's hasExcelData check
    console.log('5️⃣ Simulating application hasExcelData checks...');
    
    for (const user of users) {
      console.log(`\n👤 Testing user ${user.id} (${user.username}):`);
      
      // Get their ABCD dates
      const { data: userDatesData } = await supabase
        .from('user_dates_abcd')
        .select('dates')
        .eq('user_id', user.id)
        .single();
      
      const userDates = userDatesData?.dates || [];
      console.log(`   📅 ABCD dates: ${userDates.length} dates`);
      
      // Check each date for Excel data
      for (const date of userDates) {
        const { count: excelCount } = await supabase
          .from('excel_data')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('date', date);
        
        const { count: hourCount } = await supabase
          .from('hour_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('date', date);
        
        console.log(`     ${date}: Excel=${excelCount > 0 ? '✅' : '❌'} Hour=${hourCount > 0 ? '✅' : '❌'}`);
      }
    }
    
    console.log('\n');
    console.log('🎯 ANALYSIS SUMMARY:');
    console.log('===================');
    console.log(`• Total users: ${users.length}`);
    console.log(`• Total Excel records: ${excelRecords.length}`);
    console.log(`• Total hour entries: ${hourRecords.length}`);
    console.log('');
    console.log('🔍 POTENTIAL ISSUES TO CHECK:');
    console.log('1. User ID format mismatch (string vs UUID)');
    console.log('2. Date format inconsistencies');
    console.log('3. ABCD page using different user selection logic');
    console.log('4. Data service layer filtering incorrectly');
    console.log('5. RLS policies blocking data access');

  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
}

debugExcelDisplayIssue();
