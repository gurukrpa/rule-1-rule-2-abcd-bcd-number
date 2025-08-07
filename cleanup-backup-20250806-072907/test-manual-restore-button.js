/**
 * MANUAL RESTORE BUTTON TEST SCRIPT
 * Use this in browser console to test the new restore button functionality
 */

console.log('🔁 MANUAL RESTORE BUTTON TEST - Starting verification...');

// Test 1: Check if button exists in DOM
function testButtonExists() {
  console.log('\n📝 TEST 1: Check if Restore Button Exists');
  
  const restoreButton = document.querySelector('button[title*="Manually restore clicked number box states"]');
  if (restoreButton) {
    console.log('✅ Restore button found in DOM');
    console.log('Button text:', restoreButton.textContent);
    console.log('Button classes:', restoreButton.className);
    return true;
  } else {
    console.log('❌ Restore button not found in DOM');
    console.log('Available buttons:', Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()));
    return false;
  }
}

// Test 2: Check debug tools section
function testDebugToolsSection() {
  console.log('\n📝 TEST 2: Check Debug Tools Section');
  
  const debugSection = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('🔧 Debug Tools'));
  if (debugSection) {
    console.log('✅ Debug Tools section found');
    const container = debugSection.closest('div');
    console.log('Section content:', container ? container.textContent : 'Container not found');
    return true;
  } else {
    console.log('❌ Debug Tools section not found');
    return false;
  }
}

// Test 3: Check if forceReloadNumberBoxes is available
function testForceReloadFunction() {
  console.log('\n📝 TEST 3: Check forceReloadNumberBoxes Availability');
  
  if (window.rule1PageDebug) {
    console.log('✅ window.rule1PageDebug exists');
    console.log('Available functions:', Object.keys(window.rule1PageDebug));
    
    if (window.rule1PageDebug.forceReloadNumberBoxes) {
      console.log('✅ forceReloadNumberBoxes function available');
      console.log('Function type:', typeof window.rule1PageDebug.forceReloadNumberBoxes);
      return true;
    } else {
      console.log('❌ forceReloadNumberBoxes function not available');
      return false;
    }
  } else {
    console.log('❌ window.rule1PageDebug not available');
    return false;
  }
}

// Test 4: Simulate button click
function testButtonClick() {
  console.log('\n📝 TEST 4: Simulate Button Click');
  
  const restoreButton = document.querySelector('button[title*="Manually restore clicked number box states"]');
  if (restoreButton) {
    console.log('✅ Simulating button click...');
    
    // Add event listener to capture click
    const originalOnClick = restoreButton.onclick;
    let clickCaptured = false;
    
    restoreButton.addEventListener('click', () => {
      clickCaptured = true;
      console.log('✅ Button click event captured');
    }, { once: true });
    
    // Simulate click
    restoreButton.click();
    
    setTimeout(() => {
      if (clickCaptured) {
        console.log('✅ Button click simulation successful');
      } else {
        console.log('❌ Button click simulation failed');
      }
    }, 100);
    
    return true;
  } else {
    console.log('❌ Cannot simulate click - button not found');
    return false;
  }
}

// Test 5: Check if we're on Rule1Page
function testRule1PageLocation() {
  console.log('\n📝 TEST 5: Check if on Rule1Page');
  
  const pageTitle = document.querySelector('h1');
  if (pageTitle && pageTitle.textContent.includes('Past Days')) {
    console.log('✅ On Rule1Page (Past Days)');
    return true;
  } else {
    console.log('❌ Not on Rule1Page');
    console.log('Current page title:', pageTitle ? pageTitle.textContent : 'No h1 found');
    console.log('💡 Navigate to Rule1Page to test the restore button');
    return false;
  }
}

// Main test runner
function runManualRestoreButtonTest() {
  console.log('🚀 RUNNING MANUAL RESTORE BUTTON TEST');
  console.log('=' .repeat(50));
  
  const results = {
    buttonExists: testButtonExists(),
    debugSection: testDebugToolsSection(),
    functionAvailable: testForceReloadFunction(),
    onRule1Page: testRule1PageLocation()
  };
  
  // Only test button click if other tests pass
  if (results.buttonExists && results.onRule1Page) {
    results.buttonClick = testButtonClick();
  }
  
  console.log('\n🏁 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (results.buttonExists && results.onRule1Page) {
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Click the "🔁 Restore Clicked Numbers" button in the UI');
    console.log('2. Check for alert popup with restoration results');
    console.log('3. Monitor console for detailed logs');
    console.log('4. Verify number box states update in the UI');
  } else if (!results.onRule1Page) {
    console.log('\n💡 Navigate to Rule1Page to see and test the restore button');
  }
  
  return results;
}

// Auto-run when script loads
const testResults = runManualRestoreButtonTest();

// Expose test functions for manual use
window.manualRestoreButtonTest = {
  runAll: runManualRestoreButtonTest,
  testButtonExists,
  testDebugToolsSection,
  testForceReloadFunction,
  testButtonClick,
  testRule1PageLocation,
  results: testResults
};

console.log('\n🛠️ Manual restore button test functions exposed to window.manualRestoreButtonTest');
