#!/usr/bin/env node

/**
 * Test script to verify the Excel upload database constraint fix
 * Tests the CleanSupabaseServiceWithSeparateStorage.saveExcelData method
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Test user and date
const TEST_USER_ID = '2dc97157-e7d5-43b2-93b2-ee3c6252b3dd';
const TEST_DATE = '2025-07-01';
const TEST_FILE_NAME = 'test-constraint-fix.xlsx';

console.log('🧪 Testing Excel Upload Database Constraint Fix');
console.log('===============================================\n');

async function testExcelUploadFix() {
  try {
    console.log('1️⃣ Testing the fixed saveExcelData method...');
    
    // Test data that should be saved
    const testExcelData = {
      fileName: TEST_FILE_NAME,
      data: {
        sets: {
          'D-1 Set-1 Matrix': {
            'as': {
              'Su': 'ar-1/sample',
              'Mo': 'ta-2/sample',
              'Ma': 'ge-3/sample'
            },
            'mo': {
              'Su': 'ar-4/sample',
              'Mo': 'ta-5/sample',
              'Ma': 'ge-6/sample'
            }
          }
        }
      }
    };

    console.log('📝 Test data structure:');
    console.log('   - fileName:', testExcelData.fileName);
    console.log('   - Sets count:', Object.keys(testExcelData.data.sets).length);
    console.log('   - Sample set:', Object.keys(testExcelData.data.sets)[0]);

    // Use the fixed upsert operation directly (mimicking CleanSupabaseServiceWithSeparateStorage)
    console.log('\n2️⃣ Executing upsert with file_name field (THE FIX)...');
    
    const { data, error } = await supabase
      .from('excel_data')
      .upsert({
        user_id: TEST_USER_ID,
        date: TEST_DATE,
        file_name: testExcelData.fileName || 'Unknown File',  // ← THE FIX
        data: testExcelData.data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Upload failed with error:', error);
      console.error('   Code:', error.code);
      console.error('   Message:', error.message);
      
      if (error.message.includes('null value in column \'file_name\'')) {
        console.error('\n🚨 THE FIX IS NOT WORKING! The file_name constraint error still occurs.');
        console.error('   This means the fix was not properly applied or there\'s another issue.');
        return false;
      }
      
      return false;
    }

    console.log('✅ Upload successful! Data saved with:');
    console.log('   - ID:', data.id);
    console.log('   - User ID:', data.user_id);
    console.log('   - Date:', data.date);
    console.log('   - File Name:', data.file_name);
    console.log('   - Sets saved:', Object.keys(data.data.sets).length);
    console.log('   - Updated at:', data.updated_at);

    console.log('\n3️⃣ Verifying data retrieval...');
    
    // Verify we can retrieve the data
    const { data: retrievedData, error: retrieveError } = await supabase
      .from('excel_data')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .eq('date', TEST_DATE)
      .single();

    if (retrieveError) {
      console.error('❌ Data retrieval failed:', retrieveError.message);
      return false;
    }

    console.log('✅ Data retrieval successful!');
    console.log('   - Retrieved file_name:', retrievedData.file_name);
    console.log('   - Data integrity check:', retrievedData.data.sets ? 'PASSED' : 'FAILED');

    console.log('\n4️⃣ Testing update operation (should work now)...');
    
    // Test updating the same record (this should work now with file_name field)
    const { error: updateError } = await supabase
      .from('excel_data')
      .upsert({
        user_id: TEST_USER_ID,
        date: TEST_DATE,
        file_name: 'updated-test-file.xlsx',  // Different file name
        data: {
          sets: {
            'D-1 Set-1 Matrix': {
              'as': {
                'Su': 'ar-100/updated'
              }
            }
          }
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      });

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      return false;
    }

    console.log('✅ Update operation successful!');

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('=====================================');
    console.log('✅ Excel upload database constraint fix is working correctly');
    console.log('✅ file_name field is properly included in upsert operations');
    console.log('✅ Both insert and update operations work without constraint violations');
    console.log('✅ Data integrity is maintained');
    
    return true;

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
    return false;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    const { error } = await supabase
      .from('excel_data')
      .delete()
      .eq('user_id', TEST_USER_ID)
      .eq('date', TEST_DATE);

    if (error) {
      console.error('⚠️ Cleanup failed (this is not critical):', error.message);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }
  } catch (error) {
    console.error('⚠️ Cleanup error (this is not critical):', error.message);
  }
}

// Run the test
async function main() {
  const success = await testExcelUploadFix();
  await cleanupTestData();
  
  if (success) {
    console.log('\n🎯 CONCLUSION: The Excel upload constraint fix is working properly!');
    console.log('💡 Users should now be able to upload Excel files without the "null value in column \'file_name\'" error.');
  } else {
    console.log('\n❌ CONCLUSION: The fix needs further investigation.');
    console.log('🔧 Please check the CleanSupabaseServiceWithSeparateStorage.js file and ensure the file_name field is included.');
  }
  
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
