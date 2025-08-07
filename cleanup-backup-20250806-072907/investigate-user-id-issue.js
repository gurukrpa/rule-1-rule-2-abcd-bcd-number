// Browser console script to investigate user ID mapping issue
// Copy and paste this into your browser console while on the Rule1Page_Enhanced

console.log('🔍 INVESTIGATING USER ID MAPPING ISSUE');
console.log('=====================================');

// Check what selectedUser is being used in Rule1Page_Enhanced
console.log('1️⃣ Checking Rule1Page_Enhanced props...');

// Get the React component instance (this might vary based on React version)
const rule1Elements = document.querySelectorAll('[data-testid="rule1-page"], .rule1-container, h1, h2, h3');

// Check what user ID is being passed to dualServiceManager
console.log('2️⃣ Checking DualServiceManager calls...');

if (window.dualServiceManager) {
  console.log('✅ DualServiceManager is available globally');
  
  // Test with both UUID and username formats
  const testUserId1 = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'; // UUID format (from database)
  const testUserId2 = 'sing maya'; // Username format (potential issue)
  
  console.log('3️⃣ Testing both user ID formats...');
  
  console.log('   Testing UUID format:', testUserId1);
  window.dualServiceManager.getAllNumberBoxClicksForUserDate(testUserId1, '2025-06-30')
    .then(result => {
      console.log('   ✅ UUID format result:', result.length, 'clicks found');
      console.log('   Sample clicks:', result.slice(0, 3));
    })
    .catch(error => {
      console.log('   ❌ UUID format failed:', error.message);
    });
  
  console.log('   Testing username format:', testUserId2);
  window.dualServiceManager.getAllNumberBoxClicksForUserDate(testUserId2, '2025-06-30')
    .then(result => {
      console.log('   ✅ Username format result:', result.length, 'clicks found');
      console.log('   Sample clicks:', result.slice(0, 3));
    })
    .catch(error => {
      console.log('   ❌ Username format failed:', error.message);
    });
    
} else {
  console.log('❌ DualServiceManager not available globally');
}

// Check the current page URL and what user ID is in the route
console.log('4️⃣ Checking current page route...');
console.log('   Current URL:', window.location.href);
console.log('   Route params:', window.location.pathname.split('/'));

// Check React DevTools if available
console.log('5️⃣ Looking for React component props...');
const reactRoot = document.querySelector('#root');
if (reactRoot && reactRoot._reactInternalFiber) {
  console.log('   React fiber found, checking props...');
} else if (reactRoot && reactRoot._reactInternalInstance) {
  console.log('   React instance found, checking props...');
} else {
  console.log('   React internals not accessible through standard methods');
}

// Check localStorage for any user-related data
console.log('6️⃣ Checking localStorage for user data...');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('user') || key.includes('User') || key.includes('selected'))) {
    console.log(`   ${key}:`, localStorage.getItem(key));
  }
}

// Check sessionStorage too
console.log('7️⃣ Checking sessionStorage for user data...');
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && (key.includes('user') || key.includes('User') || key.includes('selected'))) {
    console.log(`   ${key}:`, sessionStorage.getItem(key));
  }
}

console.log('8️⃣ Analysis complete! Check the results above to identify the user ID format mismatch.');