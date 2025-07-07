#!/usr/bin/env node

import { supabase } from './src/supabaseClient.js';

async function checkData() {
  console.log('🔍 Checking current database state...');
  
  try {
    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
      
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log('👥 Users found:', users?.length || 0);
      users?.forEach(user => {
        console.log(`  - ${user.id}: ${user.username} (HR: ${user.hr})`);
      });
    }
    
    // Check user dates from ABCD context
    const { data: abcdDates, error: abcdError } = await supabase
      .from('user_dates_abcd')
      .select('*')
      .limit(10);
      
    if (abcdError) {
      console.error('❌ Error fetching ABCD dates:', abcdError);
    } else {
      console.log('📅 ABCD dates found:', abcdDates?.length || 0);
      abcdDates?.forEach(entry => {
        console.log(`  - User ${entry.user_id}: ${entry.dates?.length || 0} dates`);
      });
    }
    
    // Check if any Excel data exists
    const { data: excelData, error: excelError } = await supabase
      .from('excel_data')
      .select('user_id, date')
      .limit(5);
      
    if (excelError) {
      console.error('❌ Error fetching Excel data:', excelError);
    } else {
      console.log('📊 Excel data entries found:', excelData?.length || 0);
      excelData?.forEach(entry => {
        console.log(`  - User ${entry.user_id}, Date: ${entry.date}`);
      });
    }
    
    // Check if any hour entries exist
    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')
      .select('user_id, date')
      .limit(5);
      
    if (hourError) {
      console.error('❌ Error fetching Hour entries:', hourError);
    } else {
      console.log('⏰ Hour entries found:', hourData?.length || 0);
      hourData?.forEach(entry => {
        console.log(`  - User ${entry.user_id}, Date: ${entry.date}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
  
  process.exit(0);
}

checkData().catch(console.error);
