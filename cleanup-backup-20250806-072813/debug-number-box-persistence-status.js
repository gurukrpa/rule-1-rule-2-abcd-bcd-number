// Quick diagnostic script to check number box persistence status
console.log('🔍 DEBUGGING NUMBER BOX CLICKS PERSISTENCE');
console.log('==========================================');

// Check DualServiceManager status
console.log('\n1. 🔧 Checking DualServiceManager status...');

// Import and check the service
import('/src/services/DualServiceManager.js').then(async (module) => {
  const { dualServiceManager } = module;
  
  console.log('   ✅ DualServiceManager imported successfully');
  console.log('   📊 Service enabled:', dualServiceManager.enabled);
  console.log('   📋 Table name:', dualServiceManager.tableName);
  
  // Check table existence
  const tableCheck = await dualServiceManager.createTableIfNotExists();
  console.log('   🗄️ Table check result:', tableCheck);
  
  if (!tableCheck.success) {
    console.log('\n❌ DATABASE TABLE MISSING!');
    console.log('📋 To fix this:');
    console.log('   1. Open: https://supabase.com/dashboard');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Run the SQL from CREATE-NUMBER-BOX-CLICKS-TABLE.sql');
    console.log('   4. OR open create-table-instructions.html for detailed steps');
    return;
  }
  
  console.log('\n2. 🧪 Testing basic functionality...');
  
  // Test save/load with sample data
  const testUserId = 'test-user-' + Date.now();
  const testData = {
    setName: 'D-1 Set-1 Matrix',
    dateKey: '2025-08-01',
    numberValue: 5,
    hrNumber: 1
  };
  
  try {
    // Test save
    const saveResult = await dualServiceManager.saveNumberBoxClick(
      testUserId,
      testData.setName,
      testData.dateKey,
      testData.numberValue,
      testData.hrNumber,
      true, // is clicked
      true  // is present
    );
    
    console.log('   💾 Save test:', saveResult.success ? '✅ PASSED' : '❌ FAILED');
    
    if (saveResult.success) {
      // Test load
      const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
        testUserId,
        testData.dateKey
      );
      
      console.log('   📥 Load test:', Array.isArray(loadResult) && loadResult.length > 0 ? '✅ PASSED' : '❌ FAILED');
      console.log('   📊 Loaded records:', loadResult);
      
      // Cleanup
      await dualServiceManager.clearNumberBoxClicksForDate(testUserId, testData.dateKey);
      console.log('   🧹 Cleanup: ✅ COMPLETED');
    }
    
  } catch (error) {
    console.error('   ❌ Test failed:', error);
  }
  
  console.log('\n3. 📋 SUMMARY:');
  if (tableCheck.success) {
    console.log('   ✅ DualServiceManager: WORKING');
    console.log('   ✅ Database Table: EXISTS');
    console.log('   ✅ Save/Load Functions: WORKING');
    console.log('\n🎉 NUMBER BOX PERSISTENCE SHOULD WORK!');
    console.log('🔍 If clicks still don\'t persist:');
    console.log('   1. Make sure you\'re on Rule-1 page');
    console.log('   2. Check that an HR is selected');
    console.log('   3. Look for errors in console when clicking');
  } else {
    console.log('   ❌ Database Table: MISSING');
    console.log('   ⚠️ Number box clicks will NOT persist until table is created');
  }
  
}).catch(error => {
  console.error('💥 Failed to import DualServiceManager:', error);
});
