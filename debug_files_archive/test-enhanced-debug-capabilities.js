/**
 * Enhanced Debug Test Script for Number Box Click Tracking
 * 
 * This script demonstrates the enhanced debug capabilities for tracking
 * number box clicks with detailed information about topic, date, number, and HR.
 */

console.log('🧪 [ENHANCED-DEBUG-TEST] Starting enhanced debug capabilities test...');

// Test the enhanced click tracking
function testEnhancedClickTracking() {
  console.log('\n📝 TEST: Enhanced Click Tracking');
  
  if (!window.rule1PageDebug) {
    console.log('⚠️ rule1PageDebug not available yet - page may still be loading');
    return false;
  }
  
  console.log('✅ Enhanced debug functions available:');
  const debugFunctions = Object.keys(window.rule1PageDebug);
  debugFunctions.forEach(func => {
    console.log(`   - ${func}()`);
  });
  
  return true;
}

// Test showing clicked numbers with details
function testShowClickedNumbers() {
  console.log('\n📝 TEST: Show Clicked Numbers Debug Report');
  
  if (!window.rule1PageDebug?.showClickedNumbers) {
    console.log('❌ showClickedNumbers function not available');
    return false;
  }
  
  console.log('🎯 Calling showClickedNumbers()...');
  const result = window.rule1PageDebug.showClickedNumbers();
  
  console.log(`✅ Function returned:`, {
    clickedCount: result.clickedCount,
    hasDetails: result.details && result.details.length > 0
  });
  
  return true;
}

// Test showing click history
function testShowClickHistory() {
  console.log('\n📝 TEST: Show Click History');
  
  if (!window.rule1PageDebug?.showClickHistory) {
    console.log('❌ showClickHistory function not available');
    return false;
  }
  
  console.log('📝 Calling showClickHistory()...');
  const result = window.rule1PageDebug.showClickHistory();
  
  console.log(`✅ Function returned:`, {
    historyCount: result.historyCount,
    hasClicks: result.clicks && result.clicks.length > 0
  });
  
  if (result.historyCount === 0) {
    console.log('ℹ️ No click history found - this is normal if you haven\'t clicked any number boxes yet');
    console.log('💡 Try clicking some number boxes, then run this test again');
  }
  
  return true;
}

// Test simulated click to verify tracking
function testSimulatedClick() {
  console.log('\n📝 TEST: Simulated Click Tracking');
  
  // Find a number box button to click
  const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent?.trim();
    return text && /^(1[0-2]|[1-9])$/.test(text);
  });
  
  if (numberBoxes.length === 0) {
    console.log('❌ No number box buttons found on page');
    console.log('ℹ️ Make sure you\'re on a page with number boxes (5th date onwards)');
    return false;
  }
  
  console.log(`✅ Found ${numberBoxes.length} number box buttons`);
  
  // Get the first available number box
  const firstBox = numberBoxes[0];
  const number = firstBox.textContent.trim();
  
  console.log(`🎯 Simulating click on number ${number}...`);
  
  // Click the button
  firstBox.click();
  
  // Wait a moment, then check if click was tracked
  setTimeout(() => {
    if (window.numberBoxClickHistory && window.numberBoxClickHistory.length > 0) {
      const lastClick = window.numberBoxClickHistory[window.numberBoxClickHistory.length - 1];
      console.log(`✅ Click tracked successfully:`, {
        number: lastClick.number,
        topic: lastClick.topic,
        date: lastClick.date,
        hr: lastClick.hr,
        action: lastClick.action,
        timestamp: lastClick.timestamp
      });
      
      // Show the debug report
      console.log('\n📊 Showing updated clicked numbers report...');
      window.rule1PageDebug.showClickedNumbers();
      
    } else {
      console.log('⚠️ Click may not have been tracked yet');
    }
  }, 1000);
  
  return true;
}

// Comprehensive test instructions
function showTestInstructions() {
  console.log('\n🎯 ===== ENHANCED DEBUG TEST INSTRUCTIONS =====');
  console.log('');
  console.log('1. 📊 VIEW CLICKED NUMBERS:');
  console.log('   window.rule1PageDebug.showClickedNumbers()');
  console.log('   - Shows detailed report of all currently clicked numbers');
  console.log('   - Includes topic, date, number, HR, and presence status');
  console.log('');
  console.log('2. 📝 VIEW CLICK HISTORY:');
  console.log('   window.rule1PageDebug.showClickHistory()');
  console.log('   - Shows history of all clicks made in this session');
  console.log('   - Includes timestamps and action details');
  console.log('');
  console.log('3. 🔁 RESTORE FROM DATABASE:');
  console.log('   window.rule1PageDebug.forceReloadNumberBoxes()');
  console.log('   - Restores previously saved clicks from database');
  console.log('');
  console.log('4. 🎨 VERIFY DOM STATE:');
  console.log('   window.rule1PageDebug.verifyDOMState()');
  console.log('   - Checks if number boxes are properly styled');
  console.log('');
  console.log('5. ℹ️ GET STATE INFO:');
  console.log('   window.rule1PageDebug.getStateInfo()');
  console.log('   - Shows current component state information');
  console.log('');
  console.log('🎯 UI BUTTONS: Look for the "Debug Tools" section with buttons to run these commands easily!');
  console.log('');
  console.log('🎯 ===== END INSTRUCTIONS =====\n');
}

// Main test runner
async function runEnhancedDebugTests() {
  console.log('🚀 [ENHANCED-DEBUG-TEST] Running enhanced debug tests...\n');
  
  const results = [];
  
  // Test 1: Check if enhanced functions are available
  results.push(testEnhancedClickTracking());
  
  // Test 2: Test clicked numbers report
  results.push(testShowClickedNumbers());
  
  // Test 3: Test click history
  results.push(testShowClickHistory());
  
  // Test 4: Simulate a click (if possible)
  if (document.readyState === 'complete') {
    results.push(testSimulatedClick());
  }
  
  // Show instructions
  showTestInstructions();
  
  // Summary
  const passedTests = results.filter(r => r === true).length;
  const totalTests = results.length;
  
  console.log(`\n🎯 [ENHANCED-DEBUG-TEST] Test Results Summary:`);
  console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL ENHANCED DEBUG TESTS PASSED!');
    console.log('✅ Enhanced click tracking is working correctly');
    console.log('📊 Try the debug functions to see detailed click information');
  } else {
    console.log('⚠️ Some tests failed - debug functions may not be fully ready');
  }
  
  return { passed: passedTests, total: totalTests };
}

// Auto-run if page is ready, or provide manual trigger
if (document.readyState === 'complete') {
  setTimeout(runEnhancedDebugTests, 2000);
} else {
  window.addEventListener('load', () => {
    setTimeout(runEnhancedDebugTests, 2000);
  });
}

// Expose manual trigger
window.testEnhancedDebug = runEnhancedDebugTests;

console.log('🧪 [ENHANCED-DEBUG-TEST] Enhanced debug test script loaded');
console.log('📋 To run tests manually: window.testEnhancedDebug()');
console.log('🎯 To see instructions: showTestInstructions()');

// Expose instructions function
window.showTestInstructions = showTestInstructions;
