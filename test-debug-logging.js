/**
 * COMPREHENSIVE DEBUG LOGGING TEST SCRIPT
 * Tests all the debug logging we added to identify the root cause
 */

console.log('🔍 COMPREHENSIVE DEBUG LOGGING TEST - Starting investigation...');

// Test function to check for debug information
function runDebugInvestigation() {
  console.log('\n🚀 RUNNING COMPREHENSIVE DEBUG INVESTIGATION');
  console.log('=' .repeat(60));
  
  // Check 1: UI Debug Information
  function checkUIDebugInfo() {
    console.log('\n📝 CHECK 1: UI Debug Information');
    
    const debugSection = Array.from(document.querySelectorAll('div')).find(div => 
      div.textContent.includes('🧪 Selected User:')
    );
    
    if (debugSection) {
      console.log('✅ Found UI debug information section');
      console.log('Debug info:', debugSection.textContent);
      return true;
    } else {
      console.log('❌ UI debug information section not found');
      return false;
    }
  }
  
  // Check 2: Restore Button
  function checkRestoreButton() {
    console.log('\n📝 CHECK 2: Manual Restore Button');
    
    const restoreButton = document.querySelector('button[title*="Manually restore clicked number box states"]');
    if (restoreButton) {
      console.log('✅ Restore button found');
      console.log('Button text:', restoreButton.textContent);
      return true;
    } else {
      console.log('❌ Restore button not found');
      return false;
    }
  }
  
  // Check 3: Debug Functions Available
  function checkDebugFunctions() {
    console.log('\n📝 CHECK 3: Debug Functions Available');
    
    if (window.rule1PageDebug) {
      console.log('✅ window.rule1PageDebug available');
      console.log('Available functions:', Object.keys(window.rule1PageDebug));
      
      if (window.rule1PageDebug.forceReloadNumberBoxes) {
        console.log('✅ forceReloadNumberBoxes function available');
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
  
  // Check 4: Current Page Context
  function checkPageContext() {
    console.log('\n📝 CHECK 4: Current Page Context');
    
    const pageTitle = document.querySelector('h1');
    if (pageTitle && pageTitle.textContent.includes('Past Days')) {
      console.log('✅ On Rule1Page (Past Days)');
      
      // Extract debug info from UI
      const debugInfo = {};
      const debugElements = document.querySelectorAll('div[class*="text-sm text-gray-700"] div');
      debugElements.forEach(el => {
        if (el.textContent.includes('🧪')) {
          const parts = el.textContent.split(':');
          if (parts.length === 2) {
            debugInfo[parts[0].trim()] = parts[1].trim();
          }
        }
      });
      
      console.log('UI Debug Information:', debugInfo);
      return true;
    } else {
      console.log('❌ Not on Rule1Page');
      console.log('Current page title:', pageTitle ? pageTitle.textContent : 'No title found');
      return false;
    }
  }
  
  // Check 5: Number Boxes Present
  function checkNumberBoxes() {
    console.log('\n📝 CHECK 5: Number Boxes Present');
    
    const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
      const text = btn.textContent?.trim();
      return text && /^(1[0-2]|[1-9])$/.test(text);
    });
    
    console.log(`Found ${numberBoxes.length} number boxes`);
    if (numberBoxes.length > 0) {
      console.log('Sample number boxes:', numberBoxes.slice(0, 5).map(box => ({
        text: box.textContent,
        classes: box.className
      })));
      return true;
    } else {
      console.log('❌ No number boxes found');
      return false;
    }
  }
  
  // Run all checks
  const results = {
    uiDebugInfo: checkUIDebugInfo(),
    restoreButton: checkRestoreButton(),
    debugFunctions: checkDebugFunctions(),
    pageContext: checkPageContext(),
    numberBoxes: checkNumberBoxes()
  };
  
  console.log('\n🏁 DEBUG INVESTIGATION RESULTS');
  console.log('=' .repeat(60));
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 Overall: ${passedTests}/${totalTests} checks passed`);
  
  return results;
}

// Test function to simulate clicking the restore button
function testRestoreButtonClick() {
  console.log('\n🔁 TESTING RESTORE BUTTON CLICK');
  console.log('=' .repeat(40);
  
  const restoreButton = document.querySelector('button[title*="Manually restore clicked number box states"]');
  
  if (restoreButton) {
    console.log('✅ Clicking restore button...');
    console.log('⏰ Watch for these expected logs:');
    console.log('   - [🧪 FORCE RELOAD DEBUG] with input parameters');
    console.log('   - [📦 Fetched Clicks] with database results');
    console.log('   - [VERIFY] Setting clicked state with restoration data');
    console.log('   - Success/failure alert popup');
    
    // Add temporary listener for button click
    const handleClick = () => {
      console.log('🔁 Manual restore button click detected!');
    };
    
    restoreButton.addEventListener('click', handleClick, { once: true });
    
    // Simulate click
    restoreButton.click();
    
    console.log('✅ Restore button clicked - check console for debug logs and alert popup');
  } else {
    console.log('❌ Restore button not found - cannot test');
  }
}

// Test function to simulate number box click
function testNumberBoxClick() {
  console.log('\n🔢 TESTING NUMBER BOX CLICK');
  console.log('=' .repeat(40));
  
  const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent?.trim();
    return text && /^(1[0-2]|[1-9])$/.test(text);
  });
  
  if (numberBoxes.length > 0) {
    const testBox = numberBoxes[0];
    console.log(`✅ Testing click on number box: ${testBox.textContent}`);
    console.log('⏰ Watch for these expected logs:');
    console.log('   - [🧪 SAVE CLICK DEBUG] with click parameters');
    console.log('   - [🧪 SAVE TO DB] with database save parameters');
    console.log('   - [🧪 SAVE TO DB RESULT] with save results');
    
    // Add temporary listener for number box click
    const handleClick = () => {
      console.log(`🔢 Number box ${testBox.textContent} click detected!`);
    };
    
    testBox.addEventListener('click', handleClick, { once: true });
    
    // Simulate click
    testBox.click();
    
    console.log(`✅ Number box ${testBox.textContent} clicked - check console for debug logs`);
  } else {
    console.log('❌ No number boxes found - cannot test');
  }
}

// Main test execution
function runAllDebugTests() {
  console.log('🚀 RUNNING ALL DEBUG TESTS');
  console.log('=' .repeat(50));
  
  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const results = runDebugInvestigation();
        
        if (results.pageContext && results.restoreButton) {
          console.log('\n🧪 READY FOR MANUAL TESTING');
          console.log('1. Click the "🔁 Restore Clicked Numbers" button');
          console.log('2. Click any number box (1-12)');
          console.log('3. Monitor console for comprehensive debug logs');
          console.log('4. Check alert popups for user feedback');
        }
      }, 1000);
    });
  } else {
    setTimeout(() => {
      const results = runDebugInvestigation();
      
      if (results.pageContext && results.restoreButton) {
        console.log('\n🧪 READY FOR MANUAL TESTING');
        console.log('1. Click the "🔁 Restore Clicked Numbers" button');
        console.log('2. Click any number box (1-12)');
        console.log('3. Monitor console for comprehensive debug logs');
        console.log('4. Check alert popups for user feedback');
      }
    }, 1000);
  }
}

// Auto-run the tests
runAllDebugTests();

// Expose test functions
window.debugLogTest = {
  runAll: runAllDebugTests,
  investigation: runDebugInvestigation,
  testRestore: testRestoreButtonClick,
  testNumberBox: testNumberBoxClick
};

console.log('\n🛠️ Debug log test functions exposed to window.debugLogTest');
console.log('Available functions: runAll, investigation, testRestore, testNumberBox');
