// Test script to validate DualServiceManager functionality
// Run this in browser console to test number box persistence

console.log('🧪 Testing DualServiceManager for Number Box Clicks');
console.log('================================================');

async function testDualServiceManager() {
  // Import the service
  const { dualServiceManager } = await import('./src/services/DualServiceManager.js');
  
  console.log('1. Testing service availability...');
  console.log('   Service enabled:', dualServiceManager.enabled);
  
  console.log('2. Testing table existence...');
  const tableCheck = await dualServiceManager.createTableIfNotExists();
  console.log('   Table check result:', tableCheck);
  
  if (!tableCheck.success) {
    console.error('❌ Table does not exist! Number box clicks will not persist.');
    console.log('📋 To fix this:');
    console.log('   1. Open Supabase Dashboard > SQL Editor');
    console.log('   2. Run the SQL from CREATE-NUMBER-BOX-CLICKS-TABLE.sql');
    console.log('   3. Or follow instructions in create-table-instructions.html');
    return false;
  }
  
  console.log('3. Testing save functionality...');
  const testUserId = 'test-user-' + Date.now();
  const testDate = '2025-08-01';
  const testSetName = 'SET1';
  
  // Test saving a click
  const saveResult = await dualServiceManager.saveNumberBoxClick(
    testUserId,
    testSetName, 
    testDate,
    5, // number value
    1, // hr number
    true, // is clicked
    true  // is present
  );
  
  console.log('   Save result:', saveResult);
  
  if (!saveResult.success) {
    console.error('❌ Failed to save number box click');
    return false;
  }
  
  console.log('4. Testing load functionality...');
  const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
    testUserId,
    testDate
  );
  
  console.log('   Load result:', loadResult);
  
  if (!Array.isArray(loadResult) || loadResult.length === 0) {
    console.error('❌ Failed to load saved clicks');
    return false;
  }
  
  console.log('5. Testing cleanup...');
  const cleanupResult = await dualServiceManager.clearNumberBoxClicksForDate(
    testUserId,
    testDate
  );
  
  console.log('   Cleanup result:', cleanupResult);
  
  console.log('✅ All tests passed! DualServiceManager is working correctly.');
  return true;
}

// Auto-run the test
testDualServiceManager().catch(error => {
  console.error('❌ Test failed:', error);
});
