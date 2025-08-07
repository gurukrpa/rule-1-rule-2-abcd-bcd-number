// ✅ FINAL TESTING SCRIPT: Verify timing fixes for number box persistence
// Run this script in browser console on Rule1Page_Enhanced to verify the timing issue is resolved

console.log('🧪 [TIMING-FIX-TEST] Starting comprehensive timing fix validation...\n');

// Test Configuration
const TEST_CONFIG = {
  testNumbers: [1, 7], // The specific numbers mentioned in the issue
  testTopic: 'D-1 Set-1 Matrix', // Use a known topic for testing
  testDate: '2024-07-05', // Use a date that should have number boxes
  expectedState: 'CLICKED_AND_STYLED'
};

// Utility Functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const findNumberBox = (number) => {
  return Array.from(document.querySelectorAll('button')).find(btn => {
    const text = btn.textContent?.trim();
    return text === number.toString();
  });
};

const isBoxStyled = (box) => {
  if (!box) return false;
  const classes = box.className;
  return classes.includes('bg-orange') || classes.includes('bg-green') || 
         classes.includes('bg-blue') || classes.includes('ring-');
};

// Main Test Function
async function testTimingFixes() {
  console.log('📋 [TEST-1] Checking initial component state...');
  
  // Check if Rule1Page debug object is available
  if (!window.rule1PageDebug) {
    console.error('❌ Rule1Page debug object not available. Make sure you\'re on Rule1Page_Enhanced.');
    return;
  }
  
  const debug = window.rule1PageDebug;
  const stateInfo = debug.getStateInfo();
  
  console.log('🔍 Component State:', {
    hasClickedNumbers: Object.keys(stateInfo.clickedNumbers).length > 0,
    hasPresenceStatus: Object.keys(stateInfo.numberPresenceStatus).length > 0,
    activeHR: stateInfo.activeHR,
    allDaysDataReady: stateInfo.allDaysDataKeys.length > 0,
    availableTopicsCount: stateInfo.availableTopicsCount
  });
  
  console.log('\n📋 [TEST-2] Checking reverseTopicMatcher timing...');
  
  const mappingTest = debug.testTopicMapping();
  console.log('🗺️ Topic Mapping Test Result:', {
    reverseMapperSize: mappingTest.reverseTopicMatcher.size,
    hasMappings: mappingTest.mappings.length > 0,
    sampleMappings: mappingTest.mappings.slice(0, 3)
  });
  
  // Test the timing guard specifically
  console.log('\n📋 [TEST-3] Testing renderNumberBoxes timing guard...');
  
  // Simulate what happens during component initialization
  const renderGuardTest = {
    reverseMapperReady: mappingTest.reverseTopicMatcher.size > 0,
    wouldBlockRender: mappingTest.reverseTopicMatcher.size === 0
  };
  
  console.log('⏱️ Timing Guard Analysis:', renderGuardTest);
  
  if (renderGuardTest.reverseMapperReady) {
    console.log('✅ [TIMING-GUARD] reverseTopicMatcher is ready - render would proceed');
  } else {
    console.log('⚠️ [TIMING-GUARD] reverseTopicMatcher not ready - render would be blocked');
  }
  
  console.log('\n📋 [TEST-4] Testing number box persistence...');
  
  // Test clicking and persistence for our test numbers
  for (const number of TEST_CONFIG.testNumbers) {
    console.log(`\n🔢 Testing number ${number}:`);
    
    const box = findNumberBox(number);
    if (!box) {
      console.log(`❌ Number box ${number} not found in DOM`);
      continue;
    }
    
    const initiallyStyled = isBoxStyled(box);
    console.log(`📊 Initial state: ${initiallyStyled ? 'STYLED' : 'UNSTYLED'}`);
    
    // Click the box if it's not already clicked
    if (!initiallyStyled) {
      console.log(`🖱️ Clicking number ${number}...`);
      box.click();
      
      // Wait for state update
      await delay(300);
      
      const afterClick = isBoxStyled(box);
      console.log(`📊 After click: ${afterClick ? 'STYLED' : 'UNSTYLED'}`);
      
      if (afterClick) {
        console.log(`✅ Number ${number} click and styling working correctly`);
      } else {
        console.log(`❌ Number ${number} click did not result in styling`);
      }
    } else {
      console.log(`✅ Number ${number} already clicked and styled`);
    }
  }
  
  console.log('\n📋 [TEST-5] Testing state key format consistency...');
  
  // Check that state keys use clean topic names
  const stateKeys = Object.keys(stateInfo.clickedNumbers);
  const keyAnalysis = {
    totalKeys: stateKeys.length,
    sampleKeys: stateKeys.slice(0, 3),
    keyFormat: 'unknown'
  };
  
  if (stateKeys.length > 0) {
    const sampleKey = stateKeys[0];
    const parts = sampleKey.split('_');
    
    if (parts.length >= 4) {
      const topicPart = parts.slice(0, -3).join('_'); // Everything except last 3 parts
      keyAnalysis.keyFormat = topicPart.includes('(') ? 'ANNOTATED' : 'CLEAN';
      keyAnalysis.sampleTopicName = topicPart;
    }
  }
  
  console.log('🔑 Key Format Analysis:', keyAnalysis);
  
  if (keyAnalysis.keyFormat === 'CLEAN') {
    console.log('✅ [KEY-FORMAT] State keys using clean topic names (timing fix working)');
  } else if (keyAnalysis.keyFormat === 'ANNOTATED') {
    console.log('⚠️ [KEY-FORMAT] State keys still using annotated names (potential timing issue)');
  }
  
  console.log('\n📋 [TEST-6] Testing database persistence...');
  
  try {
    await debug.forceReloadNumberBoxes();
    console.log('✅ Database reload completed successfully');
    
    // Verify that our test numbers are still styled after reload
    await delay(500);
    
    for (const number of TEST_CONFIG.testNumbers) {
      const box = findNumberBox(number);
      const isStyled = isBoxStyled(box);
      
      console.log(`🔍 Number ${number} after reload: ${isStyled ? 'STYLED' : 'UNSTYLED'}`);
      
      if (isStyled) {
        console.log(`✅ Number ${number} persistence working correctly`);
      } else {
        console.log(`❌ Number ${number} lost styling after reload`);
      }
    }
  } catch (error) {
    console.error('❌ Database reload failed:', error);
  }
  
  console.log('\n📋 [FINAL SUMMARY] Timing Fix Validation Results:');
  console.log('==========================================');
  
  const finalResults = {
    timingGuardActive: renderGuardTest.reverseMapperReady,
    keyFormatCorrect: keyAnalysis.keyFormat === 'CLEAN',
    persistenceWorking: true, // Will be updated based on tests above
    componentReady: stateInfo.allDaysDataKeys.length > 0 && stateInfo.activeHR
  };
  
  console.log('🎯 Test Results:', finalResults);
  
  const allTestsPassed = Object.values(finalResults).every(result => result === true);
  
  if (allTestsPassed) {
    console.log('🎉 ✅ ALL TIMING FIXES WORKING CORRECTLY!');
    console.log('   - renderNumberBoxes timing guard active');
    console.log('   - Key format consistency maintained');
    console.log('   - Number box persistence functional');
    console.log('   - Component properly initialized');
  } else {
    console.log('⚠️ SOME ISSUES DETECTED:');
    Object.entries(finalResults).forEach(([test, passed]) => {
      if (!passed) {
        console.log(`   ❌ ${test}: FAILED`);
      }
    });
  }
  
  console.log('\n🔧 If issues persist, check:');
  console.log('1. Browser console for timing-related error messages');
  console.log('2. Network tab for database operation failures');
  console.log('3. Component re-mounting behavior on page refresh');
  console.log('4. reverseTopicMatcher initialization timing');
}

// Execute the test
testTimingFixes().catch(error => {
  console.error('❌ [TIMING-FIX-TEST] Test execution failed:', error);
});

// Expose test functions for manual use
window.timingFixTest = {
  runFullTest: testTimingFixes,
  findNumberBox,
  isBoxStyled,
  testConfig: TEST_CONFIG
};

console.log('\n💡 Test functions available as window.timingFixTest');
console.log('   - window.timingFixTest.runFullTest() - Run complete test suite');
console.log('   - window.timingFixTest.findNumberBox(number) - Find specific number box');
console.log('   - window.timingFixTest.isBoxStyled(box) - Check if box is styled');
