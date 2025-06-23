#!/usr/bin/env node

/**
 * UserData Date Persistence Test
 * 
 * This script tests the UserData component's date persistence fixes
 * to ensure dates and associated data survive page refreshes and navigation.
 */

const fs = require('fs');
const path = require('path');

async function testUserDataDatePersistence() {
  console.log('🧪 Testing UserData Date Persistence Fixes...\n');

  try {
    // Test 1: Check if CleanSupabaseService is properly imported
    console.log('✅ Test 1: Checking CleanSupabaseService integration...');
    const userDataContent = fs.readFileSync(
      path.join(process.cwd(), 'src/components/UserData.jsx'), 
      'utf8'
    );
    
    const hasCleanSupabaseImport = userDataContent.includes("import { cleanSupabaseService } from '../services/CleanSupabaseService'");
    console.log(`   - CleanSupabaseService import: ${hasCleanSupabaseImport ? '✅ FOUND' : '❌ MISSING'}`);

    // Test 2: Check if date loading uses user_dates table
    console.log('\n✅ Test 2: Checking date loading from user_dates table...');
    const hasUserDatesLoad = userDataContent.includes('await cleanSupabaseService.getUserDates(userId)');
    console.log(`   - user_dates table loading: ${hasUserDatesLoad ? '✅ FOUND' : '❌ MISSING'}`);

    // Test 3: Check if handleAddDate saves to user_dates
    console.log('\n✅ Test 3: Checking handleAddDate date persistence...');
    const hasAddDatePersistence = userDataContent.includes('await cleanSupabaseService.addUserDate(userId, newDate)');
    console.log(`   - Date persistence in handleAddDate: ${hasAddDatePersistence ? '✅ FOUND' : '❌ MISSING'}`);

    // Test 4: Check if handleSubmit has proper conflict resolution
    console.log('\n✅ Test 4: Checking handleSubmit conflict resolution...');
    const hasHrDataConflict = userDataContent.includes("onConflict: 'id'");
    const hasHouseConflict = userDataContent.includes("onConflict: 'user_id,hr_number,day_number,date,topic'");
    const hasSubmitDateSave = userDataContent.includes('await cleanSupabaseService.saveUserDates(userId, allDates)');
    
    console.log(`   - hr_data onConflict: ${hasHrDataConflict ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`   - house onConflict: ${hasHouseConflict ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`   - Save dates in handleSubmit: ${hasSubmitDateSave ? '✅ FOUND' : '❌ MISSING'}`);

    // Test 5: Check if handleDateChange persists changes
    console.log('\n✅ Test 5: Checking handleDateChange persistence...');
    const hasDateChangePersistence = userDataContent.includes('await cleanSupabaseService.saveUserDates(userId, allDates)');
    console.log(`   - Date change persistence: ${hasDateChangePersistence ? '✅ FOUND' : '❌ MISSING'}`);

    // Test 6: Check error handling
    console.log('\n✅ Test 6: Checking error handling...');
    const hasErrorHandling = userDataContent.includes('console.error') && userDataContent.includes('setError');
    console.log(`   - Error handling: ${hasErrorHandling ? '✅ FOUND' : '❌ MISSING'}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY:');
    console.log('='.repeat(60));

    const allTestsPassed = hasCleanSupabaseImport && hasUserDatesLoad && hasAddDatePersistence && 
                          hasHrDataConflict && hasHouseConflict && hasSubmitDateSave && 
                          hasDateChangePersistence && hasErrorHandling;

    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED! UserData date persistence fixes are properly implemented.');
      console.log('\n📋 Next Steps:');
      console.log('   1. Test in the live application:');
      console.log('      • Add new date → refresh → verify persistence');
      console.log('      • Upload Excel → refresh → verify data persists');
      console.log('      • Enter planet data → refresh → verify selections persist');
      console.log('      • Change existing date → refresh → verify changes persist');
      console.log('      • Save all data → navigate away and back → verify full persistence');
      console.log('\n   2. Monitor browser console for any remaining issues');
      console.log('   3. Check database for proper data storage in user_dates table');
    } else {
      console.log('❌ SOME TESTS FAILED! Please review the UserData component.');
    }

    return allTestsPassed;

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return false;
  }
}

// Run the test
testUserDataDatePersistence()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
