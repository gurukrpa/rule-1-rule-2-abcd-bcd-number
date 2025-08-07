/**
 * Test Script for Number Box Click Persistence
 * Run this in the browser console to test the number box functionality
 */

console.log('🧪 Starting Number Box Click Persistence Test');

// Step 1: Test the loader function
async function testNumberBoxLoader() {
  console.log('🔍 Step 1: Testing number box loader...');
  
  // Check if DualServiceManager is available
  if (typeof window.dualServiceManager === 'undefined') {
    console.error('❌ DualServiceManager not found in window. Import it first.');
    return false;
  }
  
  // Test with sample data
  const testUserId = 'sing-maya';
  const testDate = '2024-07-08';
  
  try {
    const result = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(testUserId, testDate);
    console.log('✅ Loader test result:', result);
    return true;
  } catch (error) {
    console.error('❌ Loader test failed:', error);
    return false;
  }
}

// Step 2: Test the saver function
async function testNumberBoxSaver() {
  console.log('🔍 Step 2: Testing number box saver...');
  
  if (typeof window.dualServiceManager === 'undefined') {
    console.error('❌ DualServiceManager not found in window. Import it first.');
    return false;
  }
  
  // Test with sample data
  const testData = {
    userId: 'sing-maya',
    setName: 'D-1 Set-1 Matrix',
    dateKey: '2024-07-08',
    numberValue: 5,
    hrNumber: 1,
    isClicked: true,
    isPresent: true
  };
  
  try {
    const result = await window.dualServiceManager.saveNumberBoxClick(
      testData.userId,
      testData.setName,
      testData.dateKey,
      testData.numberValue,
      testData.hrNumber,
      testData.isClicked,
      testData.isPresent
    );
    console.log('✅ Saver test result:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Saver test failed:', error);
    return false;
  }
}

// Step 3: Test the React state
function testReactState() {
  console.log('🔍 Step 3: Testing React state...');
  
  // Try to find the React component instance
  const componentDiv = document.querySelector('[data-reactroot], #root');
  if (!componentDiv) {
    console.error('❌ Could not find React root');
    return false;
  }
  
  // Look for number box buttons
  const numberBoxButtons = document.querySelectorAll('button').filter(btn => {
    const text = btn.textContent?.trim();
    return text && /^(1[0-2]|[1-9])$/.test(text);
  });
  
  console.log(`✅ Found ${numberBoxButtons.length} number box buttons`);
  
  // Check if any are styled (indicating persistence is working)
  const styledButtons = numberBoxButtons.filter(btn => {
    return btn.className.includes('bg-orange') || btn.className.includes('bg-green');
  });
  
  console.log(`✅ Found ${styledButtons.length} styled buttons (indicating persistence)`);
  
  return {
    totalButtons: numberBoxButtons.length,
    styledButtons: styledButtons.length,
    working: styledButtons.length > 0
  };
}

// Step 4: Run complete test
async function runCompleteTest() {
  console.log('🚀 Running Complete Number Box Click Persistence Test');
  console.log('==================================================');
  
  const loaderTest = await testNumberBoxLoader();
  const saverTest = await testNumberBoxSaver();
  const stateTest = testReactState();
  
  console.log('📊 Test Results Summary:');
  console.log('========================');
  console.log('Loader Test:', loaderTest ? '✅ PASS' : '❌ FAIL');
  console.log('Saver Test:', saverTest ? '✅ PASS' : '❌ FAIL');
  console.log('State Test:', stateTest.working ? '✅ PASS' : '❌ FAIL');
  console.log('Total Buttons Found:', stateTest.totalButtons);
  console.log('Styled Buttons Found:', stateTest.styledButtons);
  
  if (loaderTest && saverTest && stateTest.working) {
    console.log('🎉 ALL TESTS PASS - Number box click persistence is working!');
  } else {
    console.log('❌ SOME TESTS FAILED - Number box click persistence has issues');
    
    if (!loaderTest) console.log('   - Check database connection and table structure');
    if (!saverTest) console.log('   - Check save functionality and permissions');
    if (!stateTest.working) console.log('   - Check React state management and render logic');
  }
}

// Export functions to window for easy access
window.testNumberBoxLoader = testNumberBoxLoader;
window.testNumberBoxSaver = testNumberBoxSaver;
window.testReactState = testReactState;
window.runCompleteTest = runCompleteTest;

console.log('🧪 Test functions loaded. Run window.runCompleteTest() to start testing.');
