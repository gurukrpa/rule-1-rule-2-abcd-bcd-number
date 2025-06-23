#!/usr/bin/env node

/**
 * Verification Script for Auto-Upload Status Bug Fix
 */

console.log('🧪 Starting verification of deletion fix and auto-upload bug resolution...\n');

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://dtsymxbzwjmgxjyeiipy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0c3lteGJ6d2ptZ3hqeWVpaXB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzODY5MTIsImV4cCI6MjA0ODk2MjkxMn0.Vv7y0T-YT55QnAB10JCU1mqJCqWNZxg8AwNqWqBf0Wo';
const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_USER_ID = 'test-user-deletion-fix';
const TEST_DATE = '2024-01-15';

async function cleanupBeforeTest() {
  console.log('🧹 Cleaning up before test...');
  
  const tables = [
    { name: 'excel_data', userCol: 'user_id', dateCol: 'date' },
    { name: 'hour_entry', userCol: 'user_id', dateCol: 'date_key' },
    { name: 'user_dates', userCol: 'user_id', dateCol: null }
  ];
  
  for (const table of tables) {
    try {
      if (table.dateCol) {
        const { error } = await supabase
          .from(table.name)
          .delete()
          .eq(table.userCol, TEST_USER_ID)
          .eq(table.dateCol, TEST_DATE);
        
        if (error) console.log(`⚠️ Could not clean ${table.name}:`, error.message);
        else console.log(`✅ Cleaned ${table.name}`);
      } else {
        const { error } = await supabase
          .from(table.name)
          .delete()
          .eq(table.userCol, TEST_USER_ID);
        
        if (error) console.log(`⚠️ Could not clean ${table.name}:`, error.message);
        else console.log(`✅ Cleaned ${table.name}`);
      }
    } catch (err) {
      console.log(`⚠️ Error cleaning ${table.name}:`, err.message);
    }
  }
  console.log('');
}

async function testDataExistence(description) {
  console.log(`📊 ${description}`);
  
  const { count: excelCount, error: excelError } = await supabase
    .from('excel_data')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', TEST_USER_ID)
    .eq('date', TEST_DATE);
  
  if (excelError) {
    console.log('⚠️ Error checking excel_data:', excelError.message);
  } else {
    console.log(`📊 Excel data count: ${excelCount || 0}`);
  }
  
  const { count: hourCount, error: hourError } = await supabase
    .from('hour_entry')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', TEST_USER_ID)
    .eq('date_key', TEST_DATE);
  
  if (hourError) {
    console.log('⚠️ Error checking hour_entry:', hourError.message);
  } else {
    console.log(`⏰ Hour entry count: ${hourCount || 0}`);
  }
  
  const { data: userDates, error: userDatesError } = await supabase
    .from('user_dates')
    .select('dates')
    .eq('user_id', TEST_USER_ID)
    .single();
  
  if (userDatesError) {
    if (userDatesError.code === 'PGRST116') {
      console.log('📅 User dates: No record found');
    } else {
      console.log('⚠️ Error checking user_dates:', userDatesError.message);
    }
  } else {
    const dates = userDates?.dates || [];
    const hasTestDate = dates.includes(TEST_DATE);
    console.log(`📅 User dates: ${dates.length} total, test date present: ${hasTestDate}`);
  }
  
  console.log('');
  return {
    excelExists: (excelCount || 0) > 0,
    hourEntryExists: (hourCount || 0) > 0,
    dateInList: userDatesError ? false : (userDates?.dates || []).includes(TEST_DATE)
  };
}

async function createTestData() {
  console.log('📝 Creating test data...');
  
  const { error: datesError } = await supabase
    .from('user_dates')
    .upsert([{
      user_id: TEST_USER_ID,
      dates: [TEST_DATE],
      updated_at: new Date().toISOString()
    }], { 
      onConflict: 'user_id',
      ignoreDuplicates: false 
    });
  
  if (datesError) {
    console.log('❌ Error adding date:', datesError.message);
    return false;
  }
  console.log('✅ Added date to user_dates');
  
  const { error: excelError } = await supabase
    .from('excel_data')
    .insert([{
      user_id: TEST_USER_ID,
      date: TEST_DATE,
      file_name: 'test-file.xlsx',
      data: { test: 'data' },
      uploaded_at: new Date().toISOString()
    }]);
  
  if (excelError) {
    console.log('❌ Error adding Excel data:', excelError.message);
    return false;
  }
  console.log('✅ Added Excel data');
  
  const { error: hourError } = await supabase
    .from('hour_entry')
    .insert([{
      user_id: TEST_USER_ID,
      date_key: TEST_DATE,
      planet_selections: { test: 'selections' },
      saved_at: new Date().toISOString()
    }]);
  
  if (hourError) {
    console.log('❌ Error adding Hour Entry:', hourError.message);
    return false;
  }
  console.log('✅ Added Hour Entry data');
  
  console.log('');
  return true;
}

async function testComprehensiveDeletion() {
  console.log('🗑️ Testing comprehensive deletion...');
  
  try {
    const { DataService } = require('./src/services/dataService.js');
    const dataService = new DataService();
    await dataService.deleteDataForDate(TEST_USER_ID, TEST_DATE);
    console.log('✅ Comprehensive deletion completed successfully');
    return true;
  } catch (error) {
    console.log('❌ Comprehensive deletion failed:', error.message);
    return false;
  }
}

async function simulateReAddingDate() {
  console.log('🔄 Simulating re-adding the deleted date...');
  
  const { error } = await supabase
    .from('user_dates')
    .upsert([{
      user_id: TEST_USER_ID,
      dates: [TEST_DATE],
      updated_at: new Date().toISOString()
    }], { 
      onConflict: 'user_id',
      ignoreDuplicates: false 
    });
  
  if (error) {
    console.log('❌ Error re-adding date:', error.message);
    return false;
  }
  
  console.log('✅ Re-added date to user_dates (without any upload data)');
  console.log('');
  return true;
}

async function runVerificationTest() {
  try {
    await cleanupBeforeTest();
    
    const initialState = await testDataExistence('Initial state (should be empty):');
    
    const created = await createTestData();
    if (!created) {
      console.log('❌ Failed to create test data. Aborting test.');
      return;
    }
    
    const afterCreation = await testDataExistence('After creating test data:');
    
    const deletionSuccess = await testComprehensiveDeletion();
    if (!deletionSuccess) {
      console.log('❌ Deletion test failed. Aborting.');
      return;
    }
    
    const afterDeletion = await testDataExistence('After comprehensive deletion:');
    
    const reAddSuccess = await simulateReAddingDate();
    if (!reAddSuccess) {
      console.log('❌ Failed to re-add date. Aborting.');
      return;
    }
    
    const finalState = await testDataExistence('After re-adding date (should show no uploads):');
    
    console.log('📋 TEST RESULTS SUMMARY:');
    console.log('========================');
    
    const deletionWorked = !afterDeletion.excelExists && !afterDeletion.hourEntryExists && !afterDeletion.dateInList;
    const noFalsePositives = finalState.dateInList && !finalState.excelExists && !finalState.hourEntryExists;
    
    console.log(`✅ Data creation: ${afterCreation.excelExists && afterCreation.hourEntryExists ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Comprehensive deletion: ${deletionWorked ? 'PASS' : 'FAIL'}`);
    console.log(`✅ No false positives after re-add: ${noFalsePositives ? 'PASS' : 'FAIL'}`);
    
    if (deletionWorked && noFalsePositives) {
      console.log('\n🎉 SUCCESS! The auto-upload status bug has been RESOLVED!');
      console.log('✅ Deleted dates no longer show false positive upload status');
      console.log('✅ Comprehensive deletion is working properly');
    } else {
      console.log('\n❌ FAILURE! Issues still exist:');
      if (!deletionWorked) {
        console.log('❌ Comprehensive deletion did not work properly');
      }
      if (!noFalsePositives) {
        console.log('❌ False positive upload status still occurring');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    console.log('\n🧹 Cleaning up after test...');
    await cleanupBeforeTest();
    console.log('✅ Test cleanup completed');
  }
}

runVerificationTest();
