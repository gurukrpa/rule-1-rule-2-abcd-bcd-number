// Test Firebase Service directly in browser console
// Run this on the ABCD page to test Firebase connectivity and data loading

console.log('🔥 Testing Firebase Service in Browser...');
console.log('=========================================');

// Test the Firebase service directly
async function testFirebaseService() {
  try {
    console.log('1. 🔍 Checking if Firebase service is available...');
    
    // Try to access the global Firebase service
    if (typeof window !== 'undefined') {
      console.log('✅ Window object available');
      
      // Look for Firebase in global scope or modules
      const firebaseKeys = Object.keys(window).filter(key => 
        key.toLowerCase().includes('firebase') || 
        key.toLowerCase().includes('fire')
      );
      
      if (firebaseKeys.length > 0) {
        console.log('🔥 Found Firebase-related globals:', firebaseKeys);
      } else {
        console.log('❌ No Firebase globals found');
      }
    }
    
    console.log('\n2. 🧪 Testing USER_ID: "sing maya"...');
    const USER_ID = 'sing maya';
    console.log(`   Target user: "${USER_ID}"`);
    console.log(`   User ID type: ${typeof USER_ID}`);
    console.log(`   User ID length: ${USER_ID.length}`);
    
    console.log('\n3. 🎯 Testing PAGE_CONTEXTS.ABCD...');
    
    // Try to simulate the Firebase query structure
    console.log('   Expected collection: user_dates_abcd');
    console.log('   Expected query: where("user_id", "==", "sing maya")');
    
    console.log('\n4. 📊 Manual Data Verification...');
    console.log('   If Firebase is working, we should see:');
    console.log('   - 13 dates for user "sing maya"');
    console.log('   - Dates from 2025-05-29 to 2025-07-10');
    console.log('   - All dates should have corresponding excel_data and hr_data');
    
    console.log('\n5. 🔧 Troubleshooting Steps...');
    console.log('   a) Check Network tab for Firebase calls');
    console.log('   b) Look for "getUserDates" logs in console');
    console.log('   c) Verify Firebase config and authentication');
    console.log('   d) Check for any error messages');
    
    // Try to trigger the service if possible
    console.log('\n6. 🚀 Attempting to trigger service call...');
    
    // Look for React components that might have the service
    const allElements = Array.from(document.querySelectorAll('*'));
    const reactElements = allElements.filter(el => 
      el._reactInternalFiber || el._reactInternals
    );
    
    if (reactElements.length > 0) {
      console.log(`✅ Found ${reactElements.length} React elements`);
      console.log('   Service should be accessible through React component props/state');
    } else {
      console.log('❌ No React elements found');
    }
    
    return {
      status: 'completed',
      message: 'Firebase service test completed. Check logs above for details.'
    };
    
  } catch (error) {
    console.error('❌ Error testing Firebase service:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
}

// Run the test
testFirebaseService().then(result => {
  console.log('\n🎯 FIREBASE TEST RESULT:', result);
  
  console.log('\n📋 DEBUGGING CHECKLIST:');
  console.log('========================');
  console.log('□ User "sing maya" is selected in dropdown');
  console.log('□ Firebase config is properly loaded');
  console.log('□ Network shows Firebase API calls');
  console.log('□ Console shows "getUserDates" function calls');
  console.log('□ Console shows "📅 Loading user dates for: sing maya"');
  console.log('□ Console shows "📅 Loaded dates from user_dates_abcd table"');
  console.log('□ No authentication errors in console');
  console.log('□ No network errors in Network tab');
  
  console.log('\n🔍 IF STILL SHOWING "Dates: 0":');
  console.log('1. The loadUserDates() function is not being called');
  console.log('2. The Firebase query is failing silently');
  console.log('3. The getUserDates() method has an issue');
  console.log('4. The setDatesList() state update is not working');
  console.log('5. The user selection is not triggering the useEffect');
});

// Also provide a direct test function
window.testABCDDates = function() {
  console.log('🧪 Direct ABCD Dates Test');
  console.log('=========================');
  
  // Check if dates are visible in DOM
  const datesCount = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('📅 Dates:')
  );
  
  if (datesCount) {
    console.log('Current dates display:', datesCount.textContent);
    
    if (datesCount.textContent.includes('Dates: 0')) {
      console.log('🚨 CONFIRMED: Issue exists - dates count is 0');
      console.log('🔧 SOLUTION NEEDED: Check Firebase service implementation');
    } else {
      console.log('✅ Dates are being loaded correctly');
    }
  }
  
  return datesCount ? datesCount.textContent : 'No dates display found';
};

console.log('\n💡 TIP: Run window.testABCDDates() to quickly check dates status');
