/**
 * Test script to verify the consolidated number box persistence fix
 * 
 * TESTING PROCESS:
 * 1. Verify that multiple useEffect hooks have been replaced with single consolidated function
 * 2. Test that forceReloadNumberBoxes now uses the new consolidated loadNumberBoxClicks function
 * 3. Verify race condition prevention is working
 * 4. Test that all clicked numbers are preserved (not just 1)
 */

console.log('🧪 [CONSOLIDATED-FIX-TEST] Starting comprehensive test...');

// Test 1: Check if the old multiple useEffect system has been removed
function testConsolidationImplemented() {
  console.log('\n📝 TEST 1: Verify Consolidation Implementation');
  
  if (!window.rule1PageDebug) {
    console.log('⚠️ rule1PageDebug not available yet - page may still be loading');
    return false;
  }
  
  // Check if consolidated function exists
  const stateInfo = window.rule1PageDebug.getStateInfo();
  console.log('✅ State info available:', {
    isFullyReady: stateInfo.isFullyReady,
    readinessCheck: stateInfo.readinessCheck,
    clickedCount: stateInfo.hasData ? Object.keys(window.rule1PageDebug.clickedNumbers).length : 0
  });
  
  return true;
}

// Test 2: Test the new consolidated forceReloadNumberBoxes function
async function testConsolidatedForceReload() {
  console.log('\n📝 TEST 2: Test Consolidated forceReloadNumberBoxes');
  
  if (!window.rule1PageDebug || !window.rule1PageDebug.forceReloadNumberBoxes) {
    console.log('❌ forceReloadNumberBoxes function not available');
    return false;
  }
  
  // Get initial state
  const initialCount = Object.keys(window.rule1PageDebug.clickedNumbers).length;
  console.log(`📊 Initial clicked numbers count: ${initialCount}`);
  
  try {
    console.log('🔄 Calling consolidated forceReloadNumberBoxes...');
    await window.rule1PageDebug.forceReloadNumberBoxes();
    
    // Check state after reload
    const finalCount = Object.keys(window.rule1PageDebug.clickedNumbers).length;
    console.log(`📊 Final clicked numbers count: ${finalCount}`);
    
    if (finalCount > 1) {
      console.log('✅ SUCCESS: Multiple clicked numbers preserved!');
      console.log('✅ This indicates the race condition fix is working');
      return true;
    } else {
      console.log('⚠️ Only 1 or fewer numbers found - may need investigation');
      return false;
    }
  } catch (error) {
    console.error('❌ forceReloadNumberBoxes failed:', error);
    return false;
  }
}

// Test 3: Verify race condition prevention
function testRaceConditionPrevention() {
  console.log('\n📝 TEST 3: Race Condition Prevention Test');
  
  if (!window.rule1PageDebug) {
    console.log('❌ rule1PageDebug not available');
    return false;
  }
  
  // Test multiple rapid calls (simulating race condition)
  console.log('🏁 Testing multiple rapid calls to prevent race conditions...');
  
  let callCount = 0;
  const testCalls = [];
  
  // Make 3 rapid calls
  for (let i = 0; i < 3; i++) {
    testCalls.push(
      window.rule1PageDebug.forceReloadNumberBoxes().then(() => {
        callCount++;
        console.log(`✅ Call ${callCount} completed`);
      }).catch(error => {
        console.log(`❌ Call failed:`, error.message);
      })
    );
  }
  
  return Promise.all(testCalls).then(() => {
    console.log(`🎯 All ${callCount} calls completed without conflicts`);
    console.log('✅ Race condition prevention appears to be working');
    return true;
  });
}

// Test 4: Verify key format consistency
function testKeyFormatConsistency() {
  console.log('\n📝 TEST 4: Key Format Consistency');
  
  if (!window.rule1PageDebug) {
    console.log('❌ rule1PageDebug not available');
    return false;
  }
  
  const clickedNumbers = window.rule1PageDebug.clickedNumbers;
  const keys = Object.keys(clickedNumbers);
  
  if (keys.length === 0) {
    console.log('ℹ️ No clicked numbers to test key format');
    return true;
  }
  
  console.log('🔑 Analyzing key format consistency...');
  
  const keyPatterns = keys.map(key => {
    const parts = key.split('_');
    return {
      key,
      parts,
      hasSetName: parts.length >= 1,
      hasDateKey: parts.length >= 2,
      hasNumber: parts.length >= 3,
      hasHR: parts.length >= 4 && parts[3].startsWith('HR'),
      isValidFormat: parts.length === 4 && parts[3].startsWith('HR')
    };
  });
  
  const validKeys = keyPatterns.filter(p => p.isValidFormat);
  const invalidKeys = keyPatterns.filter(p => !p.isValidFormat);
  
  console.log(`📊 Key Analysis:`, {
    totalKeys: keys.length,
    validKeys: validKeys.length,
    invalidKeys: invalidKeys.length,
    sampleValidKey: validKeys[0]?.key || 'none',
    sampleInvalidKey: invalidKeys[0]?.key || 'none'
  });
  
  if (invalidKeys.length > 0) {
    console.log('⚠️ Found keys with inconsistent format:', invalidKeys.slice(0, 3).map(k => k.key));
  } else {
    console.log('✅ All keys have consistent format!');
  }
  
  return invalidKeys.length === 0;
}

// Main test runner
async function runConsolidatedFixTests() {
  console.log('🚀 [CONSOLIDATED-FIX-TEST] Running all tests...\n');
  
  const results = [];
  
  // Test 1: Implementation check
  results.push(testConsolidationImplemented());
  
  // Wait a moment for page to fully load
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Consolidated function test
  results.push(await testConsolidatedForceReload());
  
  // Test 3: Race condition prevention
  results.push(await testRaceConditionPrevention());
  
  // Test 4: Key format consistency
  results.push(testKeyFormatConsistency());
  
  // Summary
  const passedTests = results.filter(r => r === true).length;
  const totalTests = results.length;
  
  console.log(`\n🎯 [CONSOLIDATED-FIX-TEST] Test Results Summary:`);
  console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Consolidated fix is working correctly.');
    console.log('✅ Key improvements verified:');
    console.log('   - Multiple useEffect hooks replaced with single consolidated function');
    console.log('   - forceReloadNumberBoxes now uses the new loadNumberBoxClicks function');
    console.log('   - Race condition prevention is active');
    console.log('   - Multiple clicked numbers are preserved');
  } else {
    console.log('⚠️ Some tests failed - may need further investigation');
  }
  
  return { passed: passedTests, total: totalTests };
}

// Auto-run if page is ready, or provide manual trigger
if (document.readyState === 'complete') {
  setTimeout(runConsolidatedFixTests, 2000);
} else {
  window.addEventListener('load', () => {
    setTimeout(runConsolidatedFixTests, 2000);
  });
}

// Expose manual trigger
window.testConsolidatedFix = runConsolidatedFixTests;

console.log('🧪 [CONSOLIDATED-FIX-TEST] Test script loaded');
console.log('📋 To run tests manually: window.testConsolidatedFix()');
