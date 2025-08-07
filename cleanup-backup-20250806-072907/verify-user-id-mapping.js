// Simple browser test to verify user ID mapping in Rule1Page_Enhanced
// Copy and paste this into your browser console while on the Rule1Page_Enhanced page

console.log('🔍 USER ID MAPPING VERIFICATION TEST');
console.log('===================================');

// Check if dualServiceManager is available
if (window.dualServiceManager) {
  console.log('✅ DualServiceManager found');
  
  // Test direct UUID query
  const correctUUID = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
  console.log('1️⃣ Testing direct UUID query...');
  console.log('UUID:', correctUUID);
  
  window.dualServiceManager.getAllNumberBoxClicksForUserDate(correctUUID, '2025-06-30')
    .then(result => {
      console.log('✅ Direct UUID query result:', result.length, 'clicks found');
      if (result.length > 0) {
        console.log('Sample click:', result[0]);
        console.log('All clicks:', result);
      }
    })
    .catch(error => {
      console.log('❌ Direct UUID query failed:', error.message);
    });

  // Try to intercept any calls to getAllNumberBoxClicksForUserDate
  console.log('2️⃣ Setting up call interception...');
  const originalMethod = window.dualServiceManager.getAllNumberBoxClicksForUserDate;
  
  window.dualServiceManager.getAllNumberBoxClicksForUserDate = function(userId, dateKey) {
    console.log('🎯 INTERCEPTED CALL:', {
      userId: userId,
      userIdType: typeof userId,
      dateKey: dateKey,
      callStack: new Error().stack.split('\n').slice(1, 4)
    });
    
    // Call original method
    return originalMethod.call(this, userId, dateKey);
  };
  
  console.log('✅ Interception set up. Now interact with the page to see what user ID is being used.');
  
} else {
  console.log('❌ DualServiceManager not found globally');
}

// Check current page URL
console.log('3️⃣ Current page info:');
console.log('URL:', window.location.href);
console.log('Path:', window.location.pathname);
console.log('Query:', window.location.search);

// Extract user ID from URL if possible
const pathParts = window.location.pathname.split('/');
const userIdFromUrl = pathParts[pathParts.indexOf('abcd-number') + 1];
if (userIdFromUrl) {
  console.log('User ID from URL:', userIdFromUrl);
}

console.log('4️⃣ Test setup complete. Now try to load number boxes or click them to see the intercepted calls.');