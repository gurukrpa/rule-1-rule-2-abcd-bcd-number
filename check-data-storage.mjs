#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 CHECKING DATA STORAGE LOCATION');
console.log('================================');

async function checkDataStorage() {
  try {
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    console.log(`👥 Supabase users: ${users?.length || 0}`);
    
    // Check excel_data table
    const { data: excel, error: excelError } = await supabase
      .from('excel_data')
      .select('*');
    
    console.log(`📊 Supabase excel_data: ${excel?.length || 0} records`);
    
    // Check possible alternative table names
    const possibleTables = [
      'excel_uploads', 'file_uploads', 'uploaded_files', 
      'user_data', 'excel_files', 'documents'
    ];
    
    console.log('\n🔎 Checking alternative table names...');
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          console.log(`✅ Found table: ${tableName}`);
        }
      } catch (e) {
        // Table doesn't exist, ignore
      }
    }
    
    console.log('\n💡 CONCLUSION:');
    console.log('==============');
    console.log('The discrepancy between 18 uploaded files vs 0 in database suggests:');
    console.log('1. ❓ Data might be stored in Firebase instead of Supabase');
    console.log('2. ❓ Data might be in localStorage only');
    console.log('3. ❓ User might be using a different application instance');
    console.log('4. ❓ Database was cleared/reset recently');
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Check browser localStorage for cached data');
    console.log('2. Check Firebase database if configured');
    console.log('3. Verify which database the application is actually using');
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkDataStorage();
