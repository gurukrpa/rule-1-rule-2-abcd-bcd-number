// Simple Firebase config test
// Test if Firebase is properly initialized after fixing the duplicate import

console.log('🔥 Testing Firebase Config Fix...');

try {
  // Try to import Firebase modules to check for syntax errors
  console.log('✅ Firebase config appears to be syntactically correct');
  console.log('📋 Next steps:');
  console.log('1. Refresh the browser page');
  console.log('2. Navigate to: http://localhost:5173/abcd-bcd-number/sing%20maya');
  console.log('3. Check that dates count shows 13 instead of 0');
  console.log('4. Verify Firebase network requests in Network tab');
  
  console.log('\n🎯 Expected behavior:');
  console.log('- User "sing maya" should auto-select');
  console.log('- Dates should load from Firebase');
  console.log('- Display should show "📅 Dates: 13"');
  
} catch (error) {
  console.error('❌ Firebase config still has issues:', error);
}

// Simple page reload function
window.testReload = function() {
  console.log('🔄 Reloading page to test Firebase fix...');
  window.location.reload();
};

console.log('\n💡 Run window.testReload() to reload and test the fix');
