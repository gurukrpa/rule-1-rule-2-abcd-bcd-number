// Complete diagnostic test for ABCD dates issue
// Run this in browser console on the ABCD page (http://localhost:5173/abcd-bcd-number/sing%20maya)

console.log('🔬 COMPLETE DIAGNOSTIC TEST - ABCD DATES ISSUE');
console.log('===============================================');

async function runCompleteDiagnostic() {
  const results = {
    urlCheck: false,
    userSelection: false,
    firebaseService: false,
    dataLoading: false,
    stateUpdate: false,
    rendering: false
  };
  
  try {
    // 1. URL and Parameter Check
    console.log('\n1. 🌐 URL and Parameter Check');
    console.log('   Current URL:', window.location.href);
    console.log('   Expected URL pattern: /abcd-bcd-number/sing%20maya');
    
    const urlMatch = window.location.href.includes('abcd-bcd-number');
    const userInUrl = window.location.href.includes('sing') || window.location.href.includes('maya');
    
    results.urlCheck = urlMatch && userInUrl;
    console.log(`   ✅ URL check: ${results.urlCheck ? 'PASS' : 'FAIL'}`);
    
    // 2. User Selection Check
    console.log('\n2. 👤 User Selection Check');
    
    // Check user dropdown
    const userSelects = document.querySelectorAll('select');
    let selectedUserValue = null;
    
    userSelects.forEach(select => {
      if (select.value && (select.value.includes('sing') || select.value.includes('maya'))) {
        selectedUserValue = select.value;
        results.userSelection = true;
      }
    });
    
    console.log(`   Selected user: ${selectedUserValue || 'None'}`);
    console.log(`   ✅ User selection: ${results.userSelection ? 'PASS' : 'FAIL'}`);
    
    // 3. Check for user display in header
    const userDisplay = Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent && el.textContent.includes('✅ User:')
    );
    
    if (userDisplay) {
      console.log(`   User display: ${userDisplay.textContent}`);
      if (userDisplay.textContent.includes('sing maya')) {
        results.userSelection = true;
      }
    }
    
    // 4. Firebase Service Check
    console.log('\n3. 🔥 Firebase Service Check');
    
    // Look for Firebase-related console logs
    const consoleMessages = [];
    
    // Override console.log temporarily to capture messages
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const messages = [];
    
    // Check for existing React dev tools or service accessibility
    const hasReact = !!document.querySelector('[data-reactroot]') || 
                    Array.from(document.querySelectorAll('*')).some(el => 
                      el._reactInternalFiber || el._reactInternals
                    );
    
    console.log(`   React detected: ${hasReact}`);
    
    // Check network requests
    if (window.performance && window.performance.getEntriesByType) {
      const networkEntries = window.performance.getEntriesByType('resource');
      const firebaseRequests = networkEntries.filter(entry => 
        entry.name.includes('firebase') || 
        entry.name.includes('firestore') ||
        entry.name.includes('googleapis')
      );
      
      console.log(`   Firebase network requests: ${firebaseRequests.length}`);
      if (firebaseRequests.length > 0) {
        results.firebaseService = true;
        firebaseRequests.slice(0, 3).forEach(req => {
          console.log(`     - ${req.name}`);
        });
      }
    }
    
    // 5. Data Loading Check
    console.log('\n4. 📊 Data Loading Check');
    
    const datesDisplay = Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent && el.textContent.includes('📅 Dates:')
    );
    
    if (datesDisplay) {
      console.log(`   Dates display found: ${datesDisplay.textContent}`);
      
      const match = datesDisplay.textContent.match(/Dates: (\d+)/);
      if (match) {
        const count = parseInt(match[1]);
        console.log(`   Dates count: ${count}`);
        
        if (count > 0) {
          results.dataLoading = true;
          results.stateUpdate = true;
          results.rendering = true;
        } else {
          console.log('   🚨 ISSUE: Dates count is 0');
        }
      }
    } else {
      console.log('   ❌ Dates display not found');
    }
    
    // 6. Visual Dates List Check
    console.log('\n5. 📅 Visual Dates List Check');
    
    const datesContainer = Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent && el.textContent.includes('Dates List')
    );
    
    if (datesContainer) {
      console.log('   ✅ Dates List container found');
      
      // Look for actual date elements
      const dateElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && 
        /202[0-9]/.test(el.textContent) && 
        (el.textContent.includes('May') || 
         el.textContent.includes('Jun') || 
         el.textContent.includes('Jul'))
      );
      
      console.log(`   Visible date elements: ${dateElements.length}`);
      
      if (dateElements.length > 0) {
        results.rendering = true;
        console.log('   Sample dates:');
        dateElements.slice(0, 3).forEach((el, i) => {
          console.log(`     ${i + 1}. ${el.textContent.trim().substring(0, 30)}...`);
        });
      }
    } else {
      console.log('   ❌ Dates List container not found');
    }
    
    // 7. Error Detection
    console.log('\n6. ⚠️ Error Detection');
    
    const errorElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && (
        el.textContent.includes('Error') || 
        el.textContent.includes('Failed') ||
        (el.textContent.includes('❌') && !el.textContent.includes('User:'))
      )
    );
    
    if (errorElements.length > 0) {
      console.log('   🚨 Errors found:');
      errorElements.forEach((el, i) => {
        console.log(`     ${i + 1}. ${el.textContent.trim()}`);
      });
    } else {
      console.log('   ✅ No visible errors');
    }
    
    // 8. Loading States
    console.log('\n7. ⏳ Loading States');
    
    const loadingElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && el.textContent.toLowerCase().includes('loading')
    );
    
    if (loadingElements.length > 0) {
      console.log('   ⏳ Active loading states:');
      loadingElements.forEach((el, i) => {
        console.log(`     ${i + 1}. ${el.textContent.trim()}`);
      });
    } else {
      console.log('   ✅ No loading states');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return results;
  }
}

// Run the diagnostic
runCompleteDiagnostic().then(results => {
  console.log('\n🎯 DIAGNOSTIC RESULTS');
  console.log('====================');
  
  const checks = [
    { name: 'URL Check', result: results.urlCheck },
    { name: 'User Selection', result: results.userSelection },
    { name: 'Firebase Service', result: results.firebaseService },
    { name: 'Data Loading', result: results.dataLoading },
    { name: 'State Update', result: results.stateUpdate },
    { name: 'Rendering', result: results.rendering }
  ];
  
  checks.forEach(check => {
    const status = check.result ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${check.name}: ${status}`);
  });
  
  const passCount = checks.filter(c => c.result).length;
  const totalChecks = checks.length;
  
  console.log(`\n📊 Overall Score: ${passCount}/${totalChecks} checks passed`);
  
  if (passCount === totalChecks) {
    console.log('🎉 ALL CHECKS PASSED - Issue should be resolved!');
  } else if (passCount >= 4) {
    console.log('⚠️ Most checks passed - Minor issues remaining');
  } else if (passCount >= 2) {
    console.log('🔧 Some checks passed - Significant issues to resolve');
  } else {
    console.log('🚨 CRITICAL - Major issues detected');
  }
  
  // Specific guidance
  console.log('\n💡 SPECIFIC GUIDANCE');
  console.log('===================');
  
  if (!results.urlCheck) {
    console.log('🌐 Navigate to: http://localhost:5173/abcd-bcd-number/sing%20maya');
  }
  
  if (!results.userSelection) {
    console.log('👤 Manually select "sing maya" from user dropdown');
  }
  
  if (!results.firebaseService) {
    console.log('🔥 Check Firebase config and console for service errors');
  }
  
  if (!results.dataLoading) {
    console.log('📊 Check network tab for Firebase API calls');
    console.log('📊 Look for console logs starting with "📅 Loading user dates"');
  }
  
  if (!results.stateUpdate) {
    console.log('⚛️ React state issue - check component mounting and useEffect');
  }
  
  if (!results.rendering) {
    console.log('🎨 UI rendering issue - check component render method');
  }
});

// Provide manual test function
window.quickTest = function() {
  const datesDisplay = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('📅 Dates:')
  );
  
  if (datesDisplay) {
    const match = datesDisplay.textContent.match(/Dates: (\d+)/);
    const count = match ? parseInt(match[1]) : 0;
    
    console.log(`🎯 Quick Test Result: ${count} dates found`);
    
    if (count === 13) {
      console.log('🎉 SUCCESS - Issue resolved!');
    } else if (count > 0) {
      console.log(`⚠️ PARTIAL - Expected 13, got ${count}`);
    } else {
      console.log('🚨 ISSUE - Still showing 0 dates');
    }
    
    return count;
  } else {
    console.log('❌ Cannot find dates display');
    return -1;
  }
};

console.log('\n💡 Use window.quickTest() for a quick status check');
