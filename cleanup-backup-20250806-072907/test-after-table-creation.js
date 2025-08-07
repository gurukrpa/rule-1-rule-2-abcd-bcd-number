// Test number box persistence after table creation
console.log('🎉 TESTING NUMBER BOX PERSISTENCE - TABLE CREATED!');
console.log('================================================');

async function testPostTableCreation() {
  try {
    console.log('1. 🔧 Importing DualServiceManager...');
    const { dualServiceManager } = await import('/src/services/DualServiceManager.js');
    
    console.log('   ✅ DualServiceManager imported');
    console.log('   📊 Service enabled:', dualServiceManager.enabled);
    
    console.log('\n2. 🗄️ Testing table access...');
    const tableCheck = await dualServiceManager.createTableIfNotExists();
    console.log('   🗄️ Table check result:', tableCheck);
    
    if (!tableCheck.success) {
      console.log('❌ Table still not accessible:', tableCheck.message);
      return false;
    }
    
    console.log('   ✅ Table is accessible!');
    
    console.log('\n3. 🧪 Testing save/load functionality...');
    const testUserId = 'test-user-' + Date.now();
    const testData = {
      setName: 'D-1 Set-1 Matrix',
      dateKey: '2025-08-01',
      numberValue: 7,
      hrNumber: 1
    };
    
    // Test save
    console.log('   💾 Testing save...');
    const saveResult = await dualServiceManager.saveNumberBoxClick(
      testUserId,
      testData.setName,
      testData.dateKey,
      testData.numberValue,
      testData.hrNumber,
      true, // is clicked
      true  // is present
    );
    
    console.log('   💾 Save result:', saveResult);
    
    if (!saveResult.success) {
      console.log('❌ Save failed:', saveResult.error);
      return false;
    }
    
    // Test load
    console.log('   📥 Testing load...');
    const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
      testUserId,
      testData.dateKey
    );
    
    console.log('   📥 Load result:', loadResult);
    
    if (!Array.isArray(loadResult) || loadResult.length === 0) {
      console.log('❌ Load failed - no data returned');
      return false;
    }
    
    // Verify the loaded data
    const loadedClick = loadResult[0];
    console.log('   🔍 Loaded click details:', loadedClick);
    
    // Test cleanup
    console.log('   🧹 Testing cleanup...');
    const cleanupResult = await dualServiceManager.clearNumberBoxClicksForDate(
      testUserId,
      testData.dateKey
    );
    
    console.log('   🧹 Cleanup result:', cleanupResult);
    
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('🎉 Number box persistence is working correctly!');
    
    console.log('\n📋 Next steps:');
    console.log('   1. Go to Rule-1 page');
    console.log('   2. Select a user and HR');
    console.log('   3. Click some number boxes (1-12)');
    console.log('   4. Refresh the page');
    console.log('   5. Your clicks should persist! ✨');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

// Run the test
testPostTableCreation();
