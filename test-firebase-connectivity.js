// Quick Firebase connectivity test
// Run this in browser console to verify Firebase is working

console.log('🔥 Quick Firebase Connectivity Test');
console.log('===================================');

async function quickFirebaseTest() {
  try {
    console.log('1. Testing Firebase import...');
    
    // Try to access Firebase app
    if (typeof window !== 'undefined') {
      console.log('   ✅ Window available');
      
      // Check if Firebase is loaded
      const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src);
      const firebaseScripts = scripts.filter(src => src.includes('firebase'));
      
      console.log(`   Firebase scripts: ${firebaseScripts.length}`);
      
      if (firebaseScripts.length > 0) {
        console.log('   ✅ Firebase scripts loaded');
        firebaseScripts.forEach(script => {
          console.log(`     - ${script}`);
        });
      }
    }
    
    console.log('\n2. Testing service accessibility...');
    
    // Try to detect React components that might have the service
    const reactElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el._reactInternalFiber || el._reactInternals
    );
    
    if (reactElements.length > 0) {
      console.log(`   ✅ React components found: ${reactElements.length}`);
      console.log('   Firebase service should be accessible through React');
    } else {
      console.log('   ❌ No React components found');
    }
    
    console.log('\n3. Checking network activity...');
    
    // Check for Firebase network requests
    if (window.performance) {
      const entries = window.performance.getEntriesByType('resource');
      const firebaseRequests = entries.filter(entry => 
        entry.name.includes('firebase') || 
        entry.name.includes('firestore') ||
        entry.name.includes('googleapis')
      );
      
      console.log(`   Firebase network requests: ${firebaseRequests.length}`);
      
      if (firebaseRequests.length > 0) {
        console.log('   ✅ Firebase network activity detected');
        firebaseRequests.slice(-3).forEach(req => {
          console.log(`     - ${req.name} (${req.responseEnd - req.requestStart}ms)`);
        });
      } else {
        console.log('   ⚠️ No Firebase network requests found');
        console.log('   This could mean:');
        console.log('     - Firebase not initialized');
        console.log('     - No data requests made yet');
        console.log('     - Service not working');
      }
    }
    
    console.log('\n4. Expected behavior after fix...');
    console.log('   If Firebase config is fixed:');
    console.log('   - User "sing maya" should auto-select');
    console.log('   - Dates should load automatically');
    console.log('   - Display should show "📅 Dates: 13"');
    console.log('   - Network tab should show Firebase API calls');
    
    return {
      status: 'completed',
      message: 'Firebase connectivity test completed'
    };
    
  } catch (error) {
    console.error('❌ Firebase test error:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
}

// Run the test
quickFirebaseTest().then(result => {
  console.log('\n🎯 FIREBASE TEST COMPLETE');
  console.log('=========================');
  console.log('Result:', result);
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Refresh the ABCD page');
  console.log('2. Check if dates count is now 13');
  console.log('3. If still 0, check browser console for errors');
  console.log('4. Check Network tab for Firebase requests');
});

// Provide refresh suggestion
console.log('\n💡 TIP: After fixing Firebase config, you may need to:');
console.log('   1. Refresh the page (Ctrl+R / Cmd+R)');
console.log('   2. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)');
console.log('   3. Clear cache if necessary');
