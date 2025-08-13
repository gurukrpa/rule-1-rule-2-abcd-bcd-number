/**
 * TIMING FIX VERIFICATION SCRIPT
 * 
 * This script verifies that the D-4 Set-1 number 8 persistence issue is resolved.
 * Run this in browser console on Rule1Page_Enhanced to test the timing fix.
 */

console.log('🧪 TIMING FIX VERIFICATION - D-4 Set-1 Number 8 Issue');
console.log('=' .repeat(60));

// Test configuration for the specific reported issue
const TEST_CONFIG = {
  problemNumber: 8,
  problemTopic: 'D-4 Set-1',
  testUser: 'sing-maya', // Adjust if needed
  testDate: '2025-08-01', // Adjust if needed
  maxWaitTime: 3000 // 3 seconds max wait for save operations
};

let testResults = {
  initialState: null,
  clickTest: null,
  persistenceTest: null,
  refreshTest: null
};

// Utility function to wait for conditions
const waitFor = (conditionFn, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    
    const check = () => {
      if (conditionFn()) {
        resolve(true);
      } else if (Date.now() - start > timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
      } else {
        setTimeout(check, 100);
      }
    };
    
    check();
  });
};

// Step 1: Verify we're on the right page and environment
async function verifyEnvironment() {
  console.log('\n📍 STEP 1: Environment Verification');
  console.log('-'.repeat(40));
  
  // Check if we're on Rule1Page
  const isRule1Page = window.location.pathname.includes('abcd') || 
                      document.title.includes('Past Days') ||
                      window.rule1PageDebug;
  
  if (!isRule1Page) {
    throw new Error('❌ Must run on Rule1Page_Enhanced. Navigate to Past Days page first.');
  }
  
  console.log('✅ Rule1Page environment detected');
  
  // Check for required dependencies
  if (!window.rule1PageDebug) {
    throw new Error('❌ rule1PageDebug not available. Page may not be fully loaded.');
  }
  
  if (!window.dualServiceManager && !window.cleanSupabaseService) {
    throw new Error('❌ Database service not available. Check service initialization.');
  }
  
  console.log('✅ Debug interface and services available');
  
  // Get current state info
  const stateInfo = window.rule1PageDebug.getStateInfo();
  testResults.initialState = {
    selectedUser: stateInfo.selectedUser,
    date: stateInfo.date,
    activeHR: stateInfo.activeHR,
    initialClickedCount: Object.keys(stateInfo.clickedNumbers).length
  };
  
  console.log('✅ Initial state captured:', testResults.initialState);
  
  return true;
}

// Step 2: Test clicking number 8 in D-4 Set-1
async function testNumberBoxClick() {
  console.log('\n🖱️ STEP 2: Number Box Click Test');
  console.log('-'.repeat(40));
  
  // Find the number 8 button for D-4 Set-1
  const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent?.trim();
    return text === TEST_CONFIG.problemNumber.toString();
  });
  
  if (numberBoxes.length === 0) {
    throw new Error(`❌ Number ${TEST_CONFIG.problemNumber} button not found on page`);
  }
  
  console.log(`✅ Found ${numberBoxes.length} number ${TEST_CONFIG.problemNumber} button(s)`);
  
  // Get initial state before click
  const beforeState = window.rule1PageDebug.getStateInfo();
  const beforeCount = Object.keys(beforeState.clickedNumbers).length;
  
  console.log(`📊 State before click: ${beforeCount} numbers clicked`);
  
  // Click the first number 8 button (assuming D-4 Set-1 is visible)
  const targetButton = numberBoxes[0];
  console.log(`🎯 Clicking number ${TEST_CONFIG.problemNumber}...`);
  
  // Record click start time
  const clickStartTime = Date.now();
  targetButton.click();
  
  // Wait for loading state to clear (indicating save completion)
  try {
    console.log('⏳ Waiting for save operation to complete...');
    
    await waitFor(() => {
      // Check if loading state is cleared and state has updated
      const currentState = window.rule1PageDebug.getStateInfo();
      const hasNewClick = Object.keys(currentState.clickedNumbers).length > beforeCount;
      const isNotLoading = !document.querySelector('button[disabled]'); // Check if buttons are not disabled
      
      return hasNewClick || isNotLoading;
    }, TEST_CONFIG.maxWaitTime);
    
    const clickEndTime = Date.now();
    const clickDuration = clickEndTime - clickStartTime;
    
    // Check final state
    const afterState = window.rule1PageDebug.getStateInfo();
    const afterCount = Object.keys(afterState.clickedNumbers).length;
    
    testResults.clickTest = {
      success: afterCount > beforeCount,
      duration: clickDuration,
      beforeCount,
      afterCount,
      stateChanged: afterCount !== beforeCount
    };
    
    console.log(`✅ Click test completed in ${clickDuration}ms`);
    console.log(`📊 State after click: ${afterCount} numbers clicked (change: ${afterCount - beforeCount})`);
    
    if (testResults.clickTest.success) {
      console.log('✅ Number 8 successfully clicked and state updated');
    } else {
      console.log('❌ Number 8 click may have failed - no state change detected');
    }
    
  } catch (error) {
    testResults.clickTest = {
      success: false,
      error: error.message,
      duration: Date.now() - clickStartTime
    };
    
    console.error(`❌ Click test failed: ${error.message}`);
  }
}

// Step 3: Test database persistence
async function testDatabasePersistence() {
  console.log('\n💾 STEP 3: Database Persistence Test');
  console.log('-'.repeat(40));
  
  try {
    // Give a small buffer for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check what's in the database
    const stateInfo = window.rule1PageDebug.getStateInfo();
    const { selectedUser, date } = stateInfo;
    
    // Try to load from database
    let savedData = [];
    
    if (window.dualServiceManager && window.dualServiceManager.getAllNumberBoxClicksForUserDate) {
      savedData = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(selectedUser, date);
    } else if (window.cleanSupabaseService && window.cleanSupabaseService.getTopicClicks) {
      savedData = await window.cleanSupabaseService.getTopicClicks(selectedUser);
    }
    
    console.log(`📥 Loaded ${savedData.length} records from database`);
    
    // Look for our test number
    const testRecord = savedData.find(record => {
      const matchesNumber = record.clicked_number === TEST_CONFIG.problemNumber || 
                           record.number_value === TEST_CONFIG.problemNumber;
      const matchesTopic = record.topic_name && record.topic_name.includes('D-4');
      
      return matchesNumber && matchesTopic;
    });
    
    testResults.persistenceTest = {
      success: !!testRecord,
      totalRecords: savedData.length,
      foundTestRecord: !!testRecord,
      testRecord: testRecord || null
    };
    
    if (testRecord) {
      console.log('✅ Number 8 found in database:', testRecord);
    } else {
      console.log('❌ Number 8 not found in database');
      console.log('🔍 Available records:', savedData.map(r => ({
        number: r.clicked_number || r.number_value,
        topic: r.topic_name || r.set_name
      })));
    }
    
  } catch (error) {
    testResults.persistenceTest = {
      success: false,
      error: error.message
    };
    
    console.error(`❌ Database persistence test failed: ${error.message}`);
  }
}

// Step 4: Simulate refresh test
async function testRefreshPersistence() {
  console.log('\n🔄 STEP 4: Refresh Persistence Test');
  console.log('-'.repeat(40));
  
  try {
    // Force reload the state from database
    if (window.rule1PageDebug && window.rule1PageDebug.forceReloadNumberBoxes) {
      console.log('🔄 Triggering state reload from database...');
      
      await window.rule1PageDebug.forceReloadNumberBoxes();
      
      // Wait for reload to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if our number is still there
      const reloadedState = window.rule1PageDebug.getStateInfo();
      const reloadedCount = Object.keys(reloadedState.clickedNumbers).length;
      
      // Look for our specific number in the state
      const hasTestNumber = Object.values(reloadedState.clickedNumbers).some(topicData => {
        return Object.values(topicData || {}).some(dateData => {
          return Object.values(dateData || {}).some(hrData => {
            return Array.isArray(hrData) && hrData.includes(TEST_CONFIG.problemNumber);
          });
        });
      });
      
      testResults.refreshTest = {
        success: hasTestNumber,
        reloadedCount,
        foundTestNumber: hasTestNumber
      };
      
      if (hasTestNumber) {
        console.log('✅ Number 8 persisted after reload - timing fix successful!');
      } else {
        console.log('❌ Number 8 lost after reload - timing issue may still exist');
      }
      
    } else {
      testResults.refreshTest = {
        success: false,
        error: 'Reload function not available'
      };
      
      console.log('❌ Cannot test refresh - reload function not available');
    }
    
  } catch (error) {
    testResults.refreshTest = {
      success: false,
      error: error.message
    };
    
    console.error(`❌ Refresh persistence test failed: ${error.message}`);
  }
}

// Main test execution
async function runTimingFixVerification() {
  try {
    console.log('🚀 Starting timing fix verification for D-4 Set-1 number 8 issue...\n');
    
    await verifyEnvironment();
    await testNumberBoxClick();
    await testDatabasePersistence(); 
    await testRefreshPersistence();
    
    // Final results
    console.log('\n📋 TIMING FIX VERIFICATION RESULTS');
    console.log('=' .repeat(60));
    
    const allPassed = testResults.clickTest?.success && 
                     testResults.persistenceTest?.success && 
                     testResults.refreshTest?.success;
    
    console.log(`🖱️ Click Test: ${testResults.clickTest?.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`💾 Persistence Test: ${testResults.persistenceTest?.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🔄 Refresh Test: ${testResults.refreshTest?.success ? '✅ PASSED' : '❌ FAILED'}`);
    
    console.log('\n📊 Summary:');
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED - Timing fix is working correctly!');
      console.log('✅ Number 8 clicks should now persist after page refresh');
    } else {
      console.log('⚠️ Some tests failed - timing issue may still exist');
      console.log('🔍 Check the detailed results above for debugging information');
    }
    
    console.log('\n📈 Test Details:', testResults);
    
    return testResults;
    
  } catch (error) {
    console.error('💥 Verification failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you\'re on the Rule1Page (Past Days)');
    console.log('2. Select a user and make sure data is loaded');
    console.log('3. Ensure D-4 Set-1 topic is visible on the page');
    console.log('4. Check that number 8 is in the ABCD/BCD arrays for the date');
    
    return { error: error.message, testResults };
  }
}

// Auto-execute and expose functions
if (typeof window !== 'undefined') {
  window.runTimingFixVerification = runTimingFixVerification;
  window.testTimingFix = runTimingFixVerification; // Shorter alias
  
  console.log('🔧 Timing fix verification ready!');
  console.log('📞 Run: runTimingFixVerification() or testTimingFix()');
  
  // Auto-run after a short delay if page is ready
  setTimeout(() => {
    if (document.readyState === 'complete' && window.rule1PageDebug) {
      console.log('🚀 Auto-running timing fix verification...');
      runTimingFixVerification();
    } else {
      console.log('⏳ Page not ready for auto-run. Call testTimingFix() manually when ready.');
    }
  }, 2000);
}
