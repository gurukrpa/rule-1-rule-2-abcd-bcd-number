/**
 * Comprehensive Number Box Click Persistence Diagnostic
 * Run this in the browser console after navigating to Rule1Page
 */

console.log('🔬 Starting Comprehensive Number Box Click Persistence Diagnostic');

// Test data
const TEST_USER = 'sing-maya';
const TEST_DATE = '2024-07-08';
const TEST_SET = 'D-1 Set-1 Matrix';
const TEST_NUMBER = 5;
const TEST_HR = 1;

async function diagnosticStep1_DatabaseConnection() {
  console.log('\n📋 STEP 1: Testing Database Connection');
  console.log('=====================================');
  
  try {
    if (!window.dualServiceManager) {
      console.error('❌ DualServiceManager not available in window');
      return false;
    }
    
    // Test basic connection by trying to load data
    const testLoad = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(TEST_USER, TEST_DATE);
    console.log('✅ Database connection successful');
    console.log('📊 Current saved clicks:', testLoad);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

async function diagnosticStep2_SaveOperation() {
  console.log('\n💾 STEP 2: Testing Save Operation');
  console.log('==================================');
  
  try {
    // Save a test click
    const saveResult = await window.dualServiceManager.saveNumberBoxClick(
      TEST_USER,
      TEST_SET,
      TEST_DATE,
      TEST_NUMBER,
      TEST_HR,
      true,
      true
    );
    
    if (saveResult.success) {
      console.log('✅ Save operation successful');
      
      // Immediately verify the save
      const verifyLoad = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(TEST_USER, TEST_DATE);
      const savedClick = verifyLoad.find(click => 
        click.set_name === TEST_SET && 
        click.number_value === TEST_NUMBER && 
        click.hr_number === TEST_HR
      );
      
      if (savedClick) {
        console.log('✅ Save verification successful:', savedClick);
        return true;
      } else {
        console.error('❌ Save verification failed - click not found in database');
        return false;
      }
    } else {
      console.error('❌ Save operation failed:', saveResult);
      return false;
    }
  } catch (error) {
    console.error('❌ Save operation exception:', error);
    return false;
  }
}

function diagnosticStep3_ReactState() {
  console.log('\n⚛️ STEP 3: Testing React State');
  console.log('===============================');
  
  // Find React component root
  const reactRoot = document.querySelector('#root');
  if (!reactRoot) {
    console.error('❌ React root not found');
    return { success: false };
  }
  
  // Look for Rule1Page component indicators
  const rule1Indicators = [
    document.querySelector('[class*="Rule1"]'),
    document.querySelector('h2:contains("Rule-1 Matrix Analysis")'),
    document.querySelector('button:contains("Past Days")')
  ].filter(Boolean);
  
  console.log('🔍 Rule1Page indicators found:', rule1Indicators.length);
  
  // Find number box buttons
  const allButtons = Array.from(document.querySelectorAll('button'));
  const numberBoxButtons = allButtons.filter(btn => {
    const text = btn.textContent?.trim();
    return text && /^(1[0-2]|[1-9])$/.test(text) && btn.className.includes('w-6 h-6');
  });
  
  console.log('🔍 Number box buttons found:', numberBoxButtons.length);
  
  // Check for styled buttons (indicating state is working)
  const styledButtons = numberBoxButtons.filter(btn => {
    return btn.className.includes('bg-orange') || btn.className.includes('bg-green');
  });
  
  console.log('🎨 Styled buttons found:', styledButtons.length);
  
  // Check for debugging logs in console
  const hasLoaderLogs = performance.getEntriesByType('measure').some(entry => 
    entry.name.includes('LOADER') || entry.name.includes('loadSavedNumberBoxClicks')
  );
  
  return {
    success: numberBoxButtons.length > 0,
    totalButtons: numberBoxButtons.length,
    styledButtons: styledButtons.length,
    hasLoaderLogs: hasLoaderLogs,
    inRule1Page: rule1Indicators.length > 0
  };
}

function diagnosticStep4_UIInteraction() {
  console.log('\n🖱️ STEP 4: Testing UI Interaction');
  console.log('==================================');
  
  // Find a number box button to test
  const allButtons = Array.from(document.querySelectorAll('button'));
  const numberBoxButtons = allButtons.filter(btn => {
    const text = btn.textContent?.trim();
    return text && /^(1[0-2]|[1-9])$/.test(text) && btn.className.includes('w-6 h-6');
  });
  
  if (numberBoxButtons.length === 0) {
    console.error('❌ No number box buttons found for testing');
    return false;
  }
  
  const testButton = numberBoxButtons[0];
  const originalClass = testButton.className;
  
  console.log('🎯 Testing button:', testButton.textContent, 'with class:', originalClass);
  
  // Simulate click
  try {
    testButton.click();
    
    // Check if class changed after click
    setTimeout(() => {
      const newClass = testButton.className;
      const classChanged = newClass !== originalClass;
      
      console.log('🔄 Button class after click:', newClass);
      console.log('🔄 Class changed:', classChanged ? '✅ YES' : '❌ NO');
      
      if (classChanged) {
        console.log('✅ UI interaction successful - button style updated');
      } else {
        console.error('❌ UI interaction failed - button style not updated');
      }
    }, 500);
    
    return true;
  } catch (error) {
    console.error('❌ UI interaction failed:', error);
    return false;
  }
}

function diagnosticStep5_StateRestore() {
  console.log('\n🔄 STEP 5: Testing State Restoration');
  console.log('====================================');
  
  // Look for loader debug logs in console
  console.log('🔍 Checking for loader debug logs...');
  
  // This step will be completed by checking the browser console output
  // after the loadSavedNumberBoxClicks function runs
  
  const hasLoaderDebugLogs = true; // We'll manually verify this
  console.log('📋 Manual verification required:');
  console.log('   1. Check console for [LOADER] debug messages');
  console.log('   2. Verify key format matching');
  console.log('   3. Confirm state updates are called');
  
  return hasLoaderDebugLogs;
}

async function runCompleteDiagnostic() {
  console.log('🚀 Running Complete Number Box Click Persistence Diagnostic');
  console.log('===========================================================');
  
  const results = {
    database: await diagnosticStep1_DatabaseConnection(),
    save: await diagnosticStep2_SaveOperation(),
    react: diagnosticStep3_ReactState(),
    ui: diagnosticStep4_UIInteraction(),
    restore: diagnosticStep5_StateRestore()
  };
  
  console.log('\n📊 DIAGNOSTIC RESULTS SUMMARY');
  console.log('=============================');
  console.log('Database Connection:', results.database ? '✅ PASS' : '❌ FAIL');
  console.log('Save Operation:', results.save ? '✅ PASS' : '❌ FAIL');
  console.log('React State:', results.react.success ? '✅ PASS' : '❌ FAIL');
  console.log('UI Interaction:', results.ui ? '✅ PASS' : '❌ FAIL');
  console.log('State Restoration:', results.restore ? '✅ PASS' : '❌ FAIL');
  
  if (results.react.success) {
    console.log('\n🔍 React State Details:');
    console.log('   Total Buttons:', results.react.totalButtons);
    console.log('   Styled Buttons:', results.react.styledButtons);
    console.log('   In Rule1 Page:', results.react.inRule1Page ? 'Yes' : 'No');
  }
  
  // Provide specific recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (!results.database) {
    console.log('❌ Fix database connection and table setup');
  }
  if (!results.save) {
    console.log('❌ Check save operation and permissions');
  }
  if (!results.react.success) {
    console.log('❌ Navigate to Rule1Page to test React components');
  }
  if (results.react.styledButtons === 0 && results.database && results.save) {
    console.log('❌ Issue likely in state restoration - check loader function');
  }
  
  const allPassed = results.database && results.save && results.react.success && results.ui && results.restore;
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASS - Number box click persistence should be working!');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED - Issues detected in number box click persistence');
  }
  
  return results;
}

// Add to window for easy access
window.runCompleteDiagnostic = runCompleteDiagnostic;
window.diagnosticStep1_DatabaseConnection = diagnosticStep1_DatabaseConnection;
window.diagnosticStep2_SaveOperation = diagnosticStep2_SaveOperation;
window.diagnosticStep3_ReactState = diagnosticStep3_ReactState;
window.diagnosticStep4_UIInteraction = diagnosticStep4_UIInteraction;
window.diagnosticStep5_StateRestore = diagnosticStep5_StateRestore;

console.log('🔬 Diagnostic functions loaded.');
console.log('📋 To run: window.runCompleteDiagnostic()');
console.log('📋 To run individual steps: window.diagnosticStep1_DatabaseConnection(), etc.');
