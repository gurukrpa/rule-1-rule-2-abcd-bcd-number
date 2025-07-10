// Force Refresh and Check Console
// Paste this in the browser console

console.clear();
console.log('🔄 Force refreshing ABCD page...');

// Force refresh the page
window.location.reload(true);

// After refresh, the console should show the debug logs from loadUserDates function
console.log('📋 Watch for debug logs from loadUserDates function...');
console.log('Expected logs:');
console.log('  📅 Loading user dates for: 5019aa9a-a653-49f5-b7da-f5bc9dcde985');
console.log('  📅 Loaded dates from user_dates_abcd table: [array of 13 dates]');
console.log('  📅 Setting sorted dates in UI: [sorted array]');
