/**
 * COMPREHENSIVE CLICKED NUMBER BOX DIAGNOSTIC SCRIPT
 * 
 * This script will help identify why clicked number boxes are not showing
 * in the debug output after clicking the "Show Clicked Numbers" button.
 */

console.log('🔍 [DIAGNOSTIC] Starting comprehensive clicked number box diagnostic...');

// Step 1: Check if debug functions are available
function checkDebugAvailability() {
  console.log('\n🔧 STEP 1: Checking Debug Function Availability');
  console.log('================================================');
  
  if (!window.rule1PageDebug) {
    console.log('❌ CRITICAL: window.rule1PageDebug is not available');
    console.log('   This means the page hasn\'t loaded properly or debug functions aren\'t exposed');
    return false;
  }
  
  console.log('✅ window.rule1PageDebug is available');
  
  const debugFunctions = Object.keys(window.rule1PageDebug);
  console.log('📋 Available debug functions:', debugFunctions);
  
  // Check specific functions
  const requiredFunctions = ['showClickedNumbers', 'showClickHistory', 'getStateInfo', 'forceReloadNumberBoxes'];
  const missingFunctions = requiredFunctions.filter(func => !window.rule1PageDebug[func]);
  
  if (missingFunctions.length > 0) {
    console.log('❌ Missing functions:', missingFunctions);
    return false;
  }
  
  console.log('✅ All required debug functions are available');
  return true;
}

// Step 2: Check current state
function checkCurrentState() {
  console.log('\n🔧 STEP 2: Checking Current Component State');
  console.log('============================================');
  
  const stateInfo = window.rule1PageDebug.getStateInfo();
  
  console.log('📊 Current State Information:');
  console.log('   - User:', stateInfo.selectedUser);
  console.log('   - Date:', stateInfo.date);
  console.log('   - Active HR:', stateInfo.activeHR);
  console.log('   - Clicked Numbers Count:', Object.keys(stateInfo.clickedNumbers).length);
  console.log('   - Available Topics Count:', stateInfo.availableTopicsCount);
  console.log('   - Is Fully Ready:', stateInfo.isFullyReady);
  
  console.log('📋 Readiness Check:', stateInfo.readinessCheck);
  
  if (Object.keys(stateInfo.clickedNumbers).length === 0) {
    console.log('⚠️ WARNING: No clicked numbers found in current state');
    console.log('   This could mean:');
    console.log('   1. No number boxes have been clicked yet');
    console.log('   2. Clicks are not being saved to state properly');
    console.log('   3. State was reset or cleared');
  } else {
    console.log('✅ Found clicked numbers in state');
    console.log('📦 Clicked numbers keys:', Object.keys(stateInfo.clickedNumbers).slice(0, 5));
  }
  
  return stateInfo;
}

// Step 3: Check for number boxes on the page
function checkNumberBoxesOnPage() {
  console.log('\n🔧 STEP 3: Checking Number Boxes on Page');
  console.log('=========================================');
  
  // Find all button elements
  const allButtons = document.querySelectorAll('button');
  console.log(`📊 Total buttons found on page: ${allButtons.length}`);
  
  // Filter for number boxes (1-12)
  const numberBoxes = Array.from(allButtons).filter(btn => {
    const text = btn.textContent?.trim();
    return text && /^(1[0-2]|[1-9])$/.test(text);
  });
  
  console.log(`🔢 Number boxes found: ${numberBoxes.length}`);
  
  if (numberBoxes.length === 0) {
    console.log('❌ CRITICAL: No number boxes found on page');
    console.log('   This could mean:');
    console.log('   1. You\'re not on a date that shows number boxes (need 5th date onwards)');
    console.log('   2. The page hasn\'t loaded properly');
    console.log('   3. Number boxes are not being rendered');
    return { numberBoxes: [], hasNumberBoxes: false };
  }
  
  // Analyze number boxes
  const boxAnalysis = numberBoxes.map(box => ({
    text: box.textContent.trim(),
    classes: box.className,
    hasOrangeStyle: box.className.includes('bg-orange'),
    hasGreenStyle: box.className.includes('bg-green'),
    isClickable: !box.disabled
  }));
  
  console.log('📋 Number box analysis (first 5):');
  boxAnalysis.slice(0, 5).forEach((box, index) => {
    console.log(`   ${index + 1}. Number ${box.text}:`, {
      classes: box.classes,
      styled: box.hasOrangeStyle || box.hasGreenStyle,
      clickable: box.isClickable
    });
  });
  
  const styledBoxes = boxAnalysis.filter(box => box.hasOrangeStyle || box.hasGreenStyle);
  console.log(`🎨 Styled number boxes: ${styledBoxes.length} out of ${numberBoxes.length}`);
  
  return { numberBoxes, hasNumberBoxes: true, styledCount: styledBoxes.length };
}

// Step 4: Test clicking a number box
async function testNumberBoxClick() {
  console.log('\n🔧 STEP 4: Testing Number Box Click');
  console.log('===================================');
  
  const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent?.trim();
    return text && /^(1[0-2]|[1-9])$/.test(text);
  });
  
  if (numberBoxes.length === 0) {
    console.log('❌ No number boxes available for testing');
    return false;
  }
  
  const testBox = numberBoxes[0];
  const testNumber = testBox.textContent.trim();
  
  console.log(`🎯 Testing click on number ${testNumber}...`);
  
  // Get state before click
  const stateBefore = window.rule1PageDebug.getStateInfo();
  const clickedCountBefore = Object.keys(stateBefore.clickedNumbers).length;
  
  console.log(`📊 State before click: ${clickedCountBefore} clicked numbers`);
  
  // Simulate click
  try {
    testBox.click();
    console.log('✅ Click event triggered');
    
    // Wait a moment for state to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check state after click
    const stateAfter = window.rule1PageDebug.getStateInfo();
    const clickedCountAfter = Object.keys(stateAfter.clickedNumbers).length;
    
    console.log(`📊 State after click: ${clickedCountAfter} clicked numbers`);
    
    if (clickedCountAfter > clickedCountBefore) {
      console.log('✅ SUCCESS: Click was registered and state updated');
      return true;
    } else {
      console.log('❌ ISSUE: Click was not registered in state');
      
      // Check if click history was updated
      if (window.numberBoxClickHistory && window.numberBoxClickHistory.length > 0) {
        const lastClick = window.numberBoxClickHistory[window.numberBoxClickHistory.length - 1];
        console.log('📝 Last click in history:', {
          number: lastClick.number,
          topic: lastClick.topic,
          action: lastClick.action,
          timestamp: lastClick.timestamp
        });
        console.log('⚠️ Click was tracked in history but not in state - this indicates a state update issue');
      } else {
        console.log('❌ No click history found - click handler may not be working');
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Error during click test:', error);
    return false;
  }
}

// Step 5: Test the debug output functions
function testDebugOutput() {
  console.log('\n🔧 STEP 5: Testing Debug Output Functions');
  console.log('==========================================');
  
  console.log('🔍 Testing showClickedNumbers()...');
  try {
    const result = window.rule1PageDebug.showClickedNumbers();
    console.log('✅ showClickedNumbers() executed successfully');
    console.log('📊 Result:', {
      clickedCount: result.clickedCount,
      hasDetails: result.details && result.details.length > 0
    });
    
    if (result.clickedCount === 0) {
      console.log('⚠️ No clicked numbers returned by showClickedNumbers()');
    }
  } catch (error) {
    console.log('❌ Error in showClickedNumbers():', error);
  }
  
  console.log('\n🔍 Testing showClickHistory()...');
  try {
    const historyResult = window.rule1PageDebug.showClickHistory();
    console.log('✅ showClickHistory() executed successfully');
    console.log('📊 Result:', {
      historyCount: historyResult.historyCount,
      hasClicks: historyResult.clicks && historyResult.clicks.length > 0
    });
    
    if (historyResult.historyCount === 0) {
      console.log('⚠️ No click history found');
    }
  } catch (error) {
    console.log('❌ Error in showClickHistory():', error);
  }
}

// Step 6: Check for database persistence
async function checkDatabasePersistence() {
  console.log('\n🔧 STEP 6: Checking Database Persistence');
  console.log('=========================================');
  
  if (!window.dualServiceManager) {
    console.log('❌ dualServiceManager not available');
    return false;
  }
  
  console.log('✅ dualServiceManager is available');
  
  const stateInfo = window.rule1PageDebug.getStateInfo();
  
  try {
    console.log('🔍 Checking database for saved clicks...');
    const savedClicks = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(
      stateInfo.selectedUser, 
      stateInfo.date
    );
    
    console.log(`📦 Database returned ${savedClicks?.length || 0} total records`);
    
    if (savedClicks && savedClicks.length > 0) {
      console.log('📋 Sample database records:');
      savedClicks.slice(0, 3).forEach((record, index) => {
        console.log(`   ${index + 1}. Set: ${record.set_name}, Number: ${record.number_value}, HR: ${record.hr_number}, Clicked: ${record.is_clicked}`);
      });
      
      const clickedRecords = savedClicks.filter(r => r.is_clicked === true);
      console.log(`✅ Found ${clickedRecords.length} clicked records in database`);
      
      return clickedRecords.length > 0;
    } else {
      console.log('⚠️ No records found in database');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking database:', error);
    return false;
  }
}

// Main diagnostic function
async function runCompleteDiagnostic() {
  console.log('🚀 [DIAGNOSTIC] Starting Complete Clicked Number Box Diagnostic');
  console.log('================================================================\n');
  
  const results = {
    debugAvailable: false,
    stateInfo: null,
    numberBoxesAvailable: false,
    clickTestPassed: false,
    debugOutputWorking: false,
    databaseHasRecords: false
  };
  
  // Step 1: Check debug availability
  results.debugAvailable = checkDebugAvailability();
  
  if (!results.debugAvailable) {
    console.log('\n🚨 CRITICAL ISSUE: Debug functions not available');
    console.log('🔧 SOLUTION: Refresh the page and wait for it to fully load');
    return results;
  }
  
  // Step 2: Check current state
  results.stateInfo = checkCurrentState();
  
  // Step 3: Check number boxes on page
  const boxCheck = checkNumberBoxesOnPage();
  results.numberBoxesAvailable = boxCheck.hasNumberBoxes;
  
  if (!results.numberBoxesAvailable) {
    console.log('\n🚨 CRITICAL ISSUE: No number boxes found on page');
    console.log('🔧 SOLUTION: Make sure you\'re on a date that shows number boxes (5th date onwards)');
    return results;
  }
  
  // Step 4: Test clicking a number box
  results.clickTestPassed = await testNumberBoxClick();
  
  // Step 5: Test debug output functions
  testDebugOutput();
  results.debugOutputWorking = true;
  
  // Step 6: Check database persistence
  results.databaseHasRecords = await checkDatabasePersistence();
  
  // Final analysis
  console.log('\n🎯 DIAGNOSTIC SUMMARY');
  console.log('====================');
  console.log('✅ Debug Available:', results.debugAvailable);
  console.log('✅ Number Boxes Available:', results.numberBoxesAvailable);
  console.log('✅ Click Test Passed:', results.clickTestPassed);
  console.log('✅ Debug Output Working:', results.debugOutputWorking);
  console.log('✅ Database Has Records:', results.databaseHasRecords);
  
  if (!results.clickTestPassed) {
    console.log('\n🚨 PRIMARY ISSUE IDENTIFIED: Number box clicks are not updating state');
    console.log('🔧 POSSIBLE CAUSES:');
    console.log('   1. Click handler is not attached properly');
    console.log('   2. State update logic has an error');
    console.log('   3. Key generation mismatch between click and display');
    console.log('   4. Race condition preventing state updates');
    
    console.log('\n🛠️ RECOMMENDED SOLUTIONS:');
    console.log('   1. Try window.rule1PageDebug.forceReloadNumberBoxes()');
    console.log('   2. Refresh the page and try again');
    console.log('   3. Check browser console for any JavaScript errors');
  } else if (Object.keys(results.stateInfo.clickedNumbers).length === 0 && results.databaseHasRecords) {
    console.log('\n🚨 ISSUE IDENTIFIED: Database has records but state is empty');
    console.log('🔧 SOLUTION: Try window.rule1PageDebug.forceReloadNumberBoxes()');
  } else if (Object.keys(results.stateInfo.clickedNumbers).length > 0) {
    console.log('\n✅ DIAGNOSIS: Everything appears to be working correctly');
    console.log('📊 Try running window.rule1PageDebug.showClickedNumbers() to see the detailed report');
  }
  
  return results;
}

// Auto-run diagnostic
setTimeout(runCompleteDiagnostic, 1000);

// Expose manual trigger
window.runClickedNumberDiagnostic = runCompleteDiagnostic;

console.log('🔍 [DIAGNOSTIC] Diagnostic script loaded');
console.log('📋 To run manually: window.runClickedNumberDiagnostic()');
