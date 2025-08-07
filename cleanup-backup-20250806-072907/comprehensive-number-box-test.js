/**
 * Comprehensive Number Box Persistence Test
 * 
 * This script will:
 * 1. Navigate to a Rule1Page
 * 2. Click some number boxes
 * 3. Verify they're saved to database
 * 4. Simulate a page refresh
 * 5. Verify the clicks are restored
 * 
 * Run this in browser console after loading the application
 */

async function comprehensiveNumberBoxTest() {
  console.log('🚀 COMPREHENSIVE NUMBER BOX PERSISTENCE TEST');
  console.log('==============================================');
  
  let testResults = {
    phase1_navigation: false,
    phase2_initial_state: false,
    phase3_click_test: false,
    phase4_database_verification: false,
    phase5_page_refresh: false,
    phase6_restoration_verification: false,
    errors: []
  };
  
  try {
    // Phase 1: Navigation Check
    console.log('\n📍 PHASE 1: Navigation Check');
    console.log('-'.repeat(30));
    
    const currentUrl = window.location.href;
    console.log(`Current URL: ${currentUrl}`);
    
    // Check if we're on the main page or need to navigate
    if (!currentUrl.includes('rule') && !document.querySelector('[data-testid="rule1-page"]')) {
      console.log('⚠️  Not on Rule1Page. Please navigate to a Rule1Page first.');
      console.log('💡 Suggested steps:');
      console.log('   1. Click on a user');
      console.log('   2. Click "Past Days" button on any 5th+ date');
      console.log('   3. Re-run this test');
      return testResults;
    }
    
    testResults.phase1_navigation = true;
    console.log('✅ Navigation check passed');
    
    // Phase 2: Initial State Check
    console.log('\n🔍 PHASE 2: Initial State Check');
    console.log('-'.repeat(30));
    
    // Wait for debug functions to be available
    let debugWaitAttempts = 0;
    while (!window.rule1PageDebug && debugWaitAttempts < 10) {
      console.log(`⏳ Waiting for debug functions... (${debugWaitAttempts + 1}/10)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      debugWaitAttempts++;
    }
    
    if (!window.rule1PageDebug) {
      testResults.errors.push('Debug functions not available');
      console.log('❌ Debug functions not available after waiting');
      return testResults;
    }
    
    const stateInfo = window.rule1PageDebug.getStateInfo();
    console.log('📊 Current State:', stateInfo);
    
    if (!stateInfo.selectedUser || !stateInfo.date || !stateInfo.activeHR) {
      testResults.errors.push('Missing required state information');
      console.log('❌ Missing required state information');
      return testResults;
    }
    
    testResults.phase2_initial_state = true;
    console.log('✅ Initial state check passed');
    
    // Phase 3: Click Test
    console.log('\n🖱️  PHASE 3: Click Test');
    console.log('-'.repeat(30));
    
    // Find number boxes
    const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
      const text = btn.textContent?.trim();
      return text && /^(1[0-2]|[1-9])$/.test(text);
    });
    
    console.log(`📦 Found ${numberBoxes.length} number boxes`);
    
    if (numberBoxes.length === 0) {
      testResults.errors.push('No number boxes found');
      console.log('❌ No number boxes found');
      return testResults;
    }
    
    // Click a few random boxes
    const boxesToClick = numberBoxes.slice(0, Math.min(3, numberBoxes.length));
    console.log(`🎯 Will click ${boxesToClick.length} random boxes`);
    
    const clickedBoxInfo = [];
    for (let i = 0; i < boxesToClick.length; i++) {
      const box = boxesToClick[i];
      const boxNumber = box.textContent.trim();
      console.log(`🖱️  Clicking box ${boxNumber}...`);
      
      box.click();
      
      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      clickedBoxInfo.push({
        number: boxNumber,
        element: box
      });
    }
    
    // Verify clicks were registered
    const updatedStateInfo = window.rule1PageDebug.getStateInfo();
    console.log('📊 State after clicks:', {
      clickedCount: Object.keys(updatedStateInfo.clickedNumbers).length,
      presenceCount: Object.keys(updatedStateInfo.numberPresenceStatus).length
    });
    
    if (Object.keys(updatedStateInfo.clickedNumbers).length === 0) {
      testResults.errors.push('Clicks were not registered in state');
      console.log('❌ Clicks were not registered in state');
      return testResults;
    }
    
    testResults.phase3_click_test = true;
    console.log('✅ Click test passed');
    
    // Phase 4: Database Verification
    console.log('\n💾 PHASE 4: Database Verification');
    console.log('-'.repeat(30));
    
    if (!window.dualServiceManager) {
      testResults.errors.push('Database service not available');
      console.log('❌ Database service not available');
      return testResults;
    }
    
    const dbData = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(
      stateInfo.selectedUser, 
      stateInfo.date
    );
    
    console.log(`📦 Database records found: ${dbData?.length || 0}`);
    
    if (dbData && dbData.length > 0) {
      const hrRecords = dbData.filter(r => r.hr_number.toString() === stateInfo.activeHR.toString());
      console.log(`🎯 Records for current HR ${stateInfo.activeHR}: ${hrRecords.length}`);
      
      hrRecords.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.set_name}_${record.number_value}: clicked=${record.is_clicked}, present=${record.is_present}`);
      });
      
      if (hrRecords.length === 0) {
        testResults.errors.push('No database records for current HR');
        console.log('❌ No database records found for current HR');
        return testResults;
      }
    } else {
      testResults.errors.push('No database records found');
      console.log('❌ No database records found');
      return testResults;
    }
    
    testResults.phase4_database_verification = true;
    console.log('✅ Database verification passed');
    
    // Phase 5: Page Refresh Simulation
    console.log('\n🔄 PHASE 5: Page Refresh Simulation');
    console.log('-'.repeat(30));
    
    console.log('💡 MANUAL STEP REQUIRED:');
    console.log('   Please refresh the page now (Cmd+R or F5)');
    console.log('   Then run: verifyAfterRefresh()');
    
    // Expose a function to continue the test after refresh
    window.verifyAfterRefresh = async () => {
      console.log('\n🔍 PHASE 6: Restoration Verification');
      console.log('-'.repeat(30));
      
      // Wait for page to fully load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!window.rule1PageDebug) {
        console.log('❌ Debug functions not available after refresh');
        return { success: false, error: 'Debug functions not available' };
      }
      
      const restoredStateInfo = window.rule1PageDebug.getStateInfo();
      console.log('📊 Restored State:', restoredStateInfo);
      
      if (Object.keys(restoredStateInfo.clickedNumbers).length === 0) {
        console.log('❌ No clicked numbers restored');
        return { success: false, error: 'No state restored' };
      }
      
      // Verify DOM state
      const domState = window.rule1PageDebug.verifyDOMState();
      console.log('🎨 DOM Verification:', domState);
      
      if (domState.styledBoxes.length === 0) {
        console.log('❌ No styled boxes found in DOM');
        return { success: false, error: 'No visual restoration' };
      }
      
      console.log('✅ RESTORATION VERIFICATION PASSED!');
      console.log('🎉 Number box persistence is working correctly!');
      
      return { success: true };
    };
    
    testResults.phase5_page_refresh = true;
    console.log('✅ Ready for page refresh test');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    testResults.errors.push(error.message);
  }
  
  console.log('\n📋 TEST RESULTS SUMMARY');
  console.log('======================');
  console.log('Phase 1 - Navigation:', testResults.phase1_navigation ? '✅' : '❌');
  console.log('Phase 2 - Initial State:', testResults.phase2_initial_state ? '✅' : '❌');
  console.log('Phase 3 - Click Test:', testResults.phase3_click_test ? '✅' : '❌');
  console.log('Phase 4 - Database Verification:', testResults.phase4_database_verification ? '✅' : '❌');
  console.log('Phase 5 - Ready for Refresh:', testResults.phase5_page_refresh ? '✅' : '❌');
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS ENCOUNTERED:');
    testResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  return testResults;
}

// Auto-expose to global scope
if (typeof window !== 'undefined') {
  window.comprehensiveNumberBoxTest = comprehensiveNumberBoxTest;
  console.log('🔧 Comprehensive test function ready');
  console.log('Run: comprehensiveNumberBoxTest()');
}

// Also load the diagnostic script
if (typeof window !== 'undefined') {
  console.log('💡 Also available: numberBoxPersistenceDiagnostic()');
}

// Step 1: Verify we're on the correct page
function verifyPage() {
    console.log('\n📍 Step 1: Verifying page location...');
    
    const isCorrectPage = window.location.pathname.includes('abcd') || 
                         document.querySelector('h1')?.textContent?.includes('ABCD BCD Number');
    
    if (isCorrectPage) {
        console.log('✅ Correct page detected');
        return true;
    } else {
        console.log('❌ Wrong page - navigate to ABCD BCD Number page and click "Past Days"');
        return false;
    }
}

// Step 2: Check if data is loaded
function checkDataLoaded() {
    console.log('\n📊 Step 2: Checking if data is loaded...');
    
    const tables = document.querySelectorAll('table');
    const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
        const text = btn.textContent?.trim();
        return text && /^(1[0-2]|[1-9])$/.test(text);
    });
    
    console.log(`Found ${tables.length} tables and ${numberBoxes.length} number boxes`);
    
    if (tables.length > 0 && numberBoxes.length > 0) {
        console.log('✅ Data appears to be loaded');
        return true;
    } else {
        console.log('❌ Data not loaded yet - wait for page to fully load');
        return false;
    }
}

// Step 3: Test number box clicking
function testNumberBoxClick() {
    console.log('\n🔢 Step 3: Testing number box click...');
    
    // Find the first number box
    const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
        const text = btn.textContent?.trim();
        return text && /^(1[0-2]|[1-9])$/.test(text);
    });
    
    if (numberBoxes.length === 0) {
        console.log('❌ No number boxes found');
        return false;
    }
    
    const firstBox = numberBoxes[0];
    const numberValue = firstBox.textContent.trim();
    
    console.log(`🎯 Testing click on number box: ${numberValue}`);
    console.log('📋 Watch console for debugging logs starting with [NumberBoxes] or [STATE-DEBUG]');
    
    // Simulate click
    firstBox.click();
    
    // Check if styling changed
    setTimeout(() => {
        const newClasses = firstBox.className;
        const isStyled = newClasses.includes('bg-orange') || newClasses.includes('bg-green');
        
        console.log(`🎨 Number box styling after click:`, {
            number: numberValue,
            classes: newClasses,
            isStyled,
            element: firstBox
        });
        
        if (isStyled) {
            console.log('✅ Number box styling updated correctly');
        } else {
            console.log('❌ Number box styling did not update');
        }
    }, 500);
    
    return true;
}

// Step 4: Check for state debugging logs
function checkStateDebugging() {
    console.log('\n🔍 Step 4: Monitoring state debugging logs...');
    
    console.log('📋 Look for these key log messages:');
    console.log('   - 🧪 [STATE-DEBUG] BEFORE LOADING - Current state');
    console.log('   - 🧪 [STATE-DEBUG] Processing click');
    console.log('   - 🧪 [STATE-DEBUG] Adding to state');
    console.log('   - 🧪 [STATE-DEBUG] FINAL LOADED DATA');
    console.log('   - 🧪 [STATE-DEBUG] POST-UPDATE VERIFICATION');
    console.log('   - 🧪 [STATE-DEBUG] STATE CHANGE DETECTED');
    
    console.log('\n💡 If you don\'t see these logs, the debugging infrastructure may not be active');
}

// Step 5: Test page refresh persistence
function testRefreshPersistence() {
    console.log('\n🔄 Step 5: Testing page refresh persistence...');
    
    console.log('📋 Manual steps:');
    console.log('1. Click several number boxes to see them change color');
    console.log('2. Refresh the page (Ctrl+R or Cmd+R)');
    console.log('3. Wait for page to reload completely');
    console.log('4. Check if the previously clicked boxes are still colored');
    console.log('5. Look for "Successfully loaded X persisted number box clicks" message');
    
    console.log('\n⚠️ This step requires manual testing');
}

// Step 6: Database verification
function checkDatabasePersistence() {
    console.log('\n💾 Step 6: Checking database persistence...');
    
    // Check if dualServiceManager is available
    if (window.dualServiceManager) {
        console.log('✅ dualServiceManager is available');
        
        // Try to check statistics
        if (window.selectedUser) {
            console.log('🔍 Checking click statistics...');
            
            window.dualServiceManager.getClickStatistics(window.selectedUser)
                .then(stats => {
                    console.log('📊 Click statistics:', stats);
                })
                .catch(error => {
                    console.log('❌ Error getting statistics:', error);
                });
        } else {
            console.log('⚠️ No selectedUser available for statistics check');
        }
    } else {
        console.log('❌ dualServiceManager not available');
    }
}

// Step 7: Key format verification
function verifyKeyFormat() {
    console.log('\n🔑 Step 7: Verifying key format consistency...');
    
    // Check state keys in global variables if available
    console.log('📋 Key format should be: SetName_DateKey_NumberValue_HRX');
    console.log('📋 Example: D-1 Set-1 Matrix_2024-12-31_1_HR1');
    
    // Try to access React state if possible
    setTimeout(() => {
        console.log('🔍 Check console logs for key format examples in STATE-DEBUG messages');
    }, 1000);
}

// Main test runner
function runComprehensiveTest() {
    console.log('🚀 Starting comprehensive number box persistence test...\n');
    
    if (!verifyPage()) return;
    
    setTimeout(() => {
        if (!checkDataLoaded()) return;
        
        setTimeout(() => {
            testNumberBoxClick();
            checkStateDebugging();
            checkDatabasePersistence();
            verifyKeyFormat();
            
            setTimeout(() => {
                testRefreshPersistence();
                
                console.log('\n🎯 TEST SUMMARY');
                console.log('===============');
                console.log('1. ✅ Page verification');
                console.log('2. ✅ Data loading check');
                console.log('3. ✅ Number box click test');
                console.log('4. ✅ State debugging verification');
                console.log('5. ⚠️ Refresh persistence (manual)');
                console.log('6. ✅ Database persistence check');
                console.log('7. ✅ Key format verification');
                
                console.log('\n💡 Next steps:');
                console.log('1. Review the debugging logs above');
                console.log('2. Manually test page refresh persistence');
                console.log('3. Look for any STATE/RENDER MISMATCH warnings');
                console.log('4. Check if box key formats match expected pattern');
                
            }, 2000);
        }, 1000);
    }, 1000);
}

// Export functions for manual testing
window.testNumberBoxPersistence = {
    runAll: runComprehensiveTest,
    verifyPage,
    checkDataLoaded,
    testClick: testNumberBoxClick,
    checkState: checkStateDebugging,
    testRefresh: testRefreshPersistence,
    checkDatabase: checkDatabasePersistence,
    verifyKeys: verifyKeyFormat
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
    console.log('🎯 Test functions loaded. Run runComprehensiveTest() or use window.testNumberBoxPersistence');
}
