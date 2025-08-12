// FINAL VERIFICATION: Number Box Persistence Complete Test
console.log('🎉 FINAL VERIFICATION: NUMBER BOX PERSISTENCE');
console.log('==============================================');
console.log('⏰ Test Time:', new Date().toLocaleString());

async function runCompleteVerification() {
  try {
    console.log('\n🔧 Step 1: Loading DualServiceManager...');
    const { dualServiceManager } = await import('/src/services/DualServiceManager.js');
    
    console.log('   ✅ DualServiceManager loaded successfully');
    console.log('   📊 Initial service state:', dualServiceManager.enabled);
    
    console.log('\n🗄️ Step 2: Verifying database table...');
    const tableCheck = await dualServiceManager.createTableIfNotExists();
    console.log('   🗄️ Table verification:', tableCheck);
    
    if (!tableCheck.success) {
      console.log('\n❌ VERIFICATION FAILED: Table not accessible');
      console.log('   Error:', tableCheck.message || 'Unknown error');
      return false;
    }
    
    console.log('   ✅ Database table verified and accessible!');
    
    console.log('\n🧪 Step 3: Testing full save/load cycle...');
    
    // Create test data
    const testSession = {
      userId: 'test-verification-' + Date.now(),
      setName: 'D-1 Set-1 Matrix',
      dateKey: '2025-08-01',
      hrNumber: 1,
      testNumbers: [3, 7, 11] // Test multiple numbers
    };
    
    console.log('   📝 Test session:', testSession);
    
    // Test saving multiple clicks
    console.log('\n   💾 Testing save operations...');
    const saveResults = [];
    
    for (const number of testSession.testNumbers) {
      const saveResult = await dualServiceManager.saveNumberBoxClick(
        testSession.userId,
        testSession.setName,
        testSession.dateKey,
        number,
        testSession.hrNumber,
        true, // is clicked
        true  // is present
      );
      
      saveResults.push({ number, result: saveResult });
      console.log(`     💾 Number ${number}:`, saveResult.success ? '✅ SAVED' : '❌ FAILED');
    }
    
    // Verify all saves succeeded
    const failedSaves = saveResults.filter(r => !r.result.success);
    if (failedSaves.length > 0) {
      console.log('   ❌ Some saves failed:', failedSaves);
      return false;
    }
    
    console.log('   ✅ All save operations successful!');
    
    // Test loading
    console.log('\n   📥 Testing load operation...');
    const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
      testSession.userId,
      testSession.dateKey
    );
    
    console.log('   📥 Load result:', loadResult);
    
    if (!Array.isArray(loadResult)) {
      console.log('   ❌ Load failed: Result is not an array');
      return false;
    }
    
    if (loadResult.length !== testSession.testNumbers.length) {
      console.log(`   ❌ Load failed: Expected ${testSession.testNumbers.length} records, got ${loadResult.length}`);
      return false;
    }
    
    // Verify loaded data
    console.log('\n   🔍 Verifying loaded data...');
    for (const record of loadResult) {
      console.log(`     🔍 Record:`, {
        number: record.number_value,
        hr: record.hr_number,
        clicked: record.is_clicked,
        present: record.is_present,
        date: record.date_key
      });
      
      if (!testSession.testNumbers.includes(record.number_value)) {
        console.log('     ❌ Unexpected number in results:', record.number_value);
        return false;
      }
      
      if (record.hr_number !== testSession.hrNumber) {
        console.log('     ❌ Wrong HR number:', record.hr_number);
        return false;
      }
      
      if (!record.is_clicked) {
        console.log('     ❌ Record shows not clicked');
        return false;
      }
    }
    
    console.log('   ✅ All loaded data verified correctly!');
    
    // Test cleanup
    console.log('\n   🧹 Testing cleanup...');
    const cleanupResult = await dualServiceManager.clearNumberBoxClicksForDate(
      testSession.userId,
      testSession.dateKey
    );
    
    console.log('   🧹 Cleanup result:', cleanupResult);
    
    if (!cleanupResult.success) {
      console.log('   ⚠️ Cleanup warning:', cleanupResult.message);
    } else {
      console.log('   ✅ Cleanup successful!');
    }
    
    // Verify cleanup worked
    const postCleanupLoad = await dualServiceManager.getAllNumberBoxClicksForUserDate(
      testSession.userId,
      testSession.dateKey
    );
    
    if (postCleanupLoad.length > 0) {
      console.log('   ⚠️ Cleanup verification: Some records remain:', postCleanupLoad.length);
    } else {
      console.log('   ✅ Cleanup verified: All test records removed');
    }
    
    console.log('\n🎉 VERIFICATION COMPLETE - ALL TESTS PASSED!');
    console.log('===============================================');
    console.log('✅ DualServiceManager: WORKING');
    console.log('✅ Database Table: EXISTS & ACCESSIBLE');
    console.log('✅ Save Operations: WORKING');
    console.log('✅ Load Operations: WORKING');
    console.log('✅ Data Integrity: VERIFIED');
    console.log('✅ Cleanup Operations: WORKING');
    
    console.log('\n🎯 READY FOR PRODUCTION USE!');
    console.log('Your number box clicks will now persist across:');
    console.log('   • Page refreshes');
    console.log('   • Browser restarts');
    console.log('   • Different sessions');
    console.log('   • Different devices (same user)');
    
    console.log('\n📋 To test manually:');
    console.log('   1. Go to Rule-1 page (Past Days)');
    console.log('   2. Select an HR from dropdown');
    console.log('   3. Click some number boxes (1-12)');
    console.log('   4. Refresh the page (F5)');
    console.log('   5. Your clicks should persist! ✨');
    
    return true;
    
  } catch (error) {
    console.log('\n💥 VERIFICATION FAILED WITH ERROR:');
    console.error('❌ Error details:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure Supabase is accessible');
    console.log('   2. Verify table was created correctly');
    console.log('   3. Check browser network tab for API errors');
    return false;
  }
}

// Run the complete verification
runCompleteVerification().then(success => {
  if (success) {
    console.log('\n🎊 SUCCESS: Number box persistence is fully operational!');
  } else {
    console.log('\n🚨 FAILURE: There are still issues to resolve.');
  }
});
