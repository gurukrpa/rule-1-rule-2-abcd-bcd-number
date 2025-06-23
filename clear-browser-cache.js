// Clear browser localStorage cache - Run this in browser console
console.log('🧹 CLEARING BROWSER LOCALSTORAGE CACHE');
console.log('======================================');

// Get all localStorage keys
const allKeys = Object.keys(localStorage);
console.log(`📊 Total localStorage keys: ${allKeys.length}`);

// Find ABCD-related keys
const abcdKeys = allKeys.filter(key => 
  key.includes('abcd_') || 
  key.includes('excel') || 
  key.includes('hour') ||
  key.includes('user_dates') ||
  key.includes('status') ||
  key.includes('cache') ||
  key.includes('june') ||
  key.includes('2025') ||
  key.includes('e57d8c46') ||
  key.includes('8db9861a')
);

console.log(`🔍 Found ${abcdKeys.length} ABCD-related keys:`);
abcdKeys.forEach((key, index) => {
  console.log(`   ${index + 1}. ${key}`);
});

// Clear the keys
if (abcdKeys.length > 0) {
  console.log('\n🗑️ Clearing keys...');
  abcdKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   ✅ Cleared: ${key}`);
  });
} else {
  console.log('✅ No ABCD-related keys found to clear');
}

console.log('\n📊 Final localStorage status:');
const remainingKeys = Object.keys(localStorage);
console.log(`   Remaining keys: ${remainingKeys.length}`);

console.log('\n✅ localStorage cleanup complete!');
console.log('💡 Now refresh the page and test adding a new date');
