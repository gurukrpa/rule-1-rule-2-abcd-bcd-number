// Clear localStorage cache that might be causing auto-upload status bug
// This script clears all potentially interfering localStorage data

console.log('🧹 CLEARING LOCALSTORAGE CACHE TO FIX AUTO-UPLOAD STATUS BUG');
console.log('===============================================================\n');

// Get all localStorage keys
const allKeys = Object.keys(localStorage);
console.log(`📊 Total localStorage keys found: ${allKeys.length}`);

if (allKeys.length === 0) {
  console.log('✅ localStorage is already empty - no cache to clear');
} else {
  console.log('\n🔍 All localStorage keys:');
  allKeys.forEach((key, index) => {
    console.log(`   ${index + 1}. ${key}`);
  });

  // Find keys that might be causing the auto-upload status issue
  const problematicKeys = allKeys.filter(key => 
    key.includes('abcd_excel_') || 
    key.includes('abcd_hourEntry_') ||
    key.includes('abcd_status_') ||
    key.includes('abcd_cached_') ||
    key.includes('excel_data_') ||
    key.includes('hour_entry_') ||
    key.includes('upload_status_') ||
    key.includes('date_status_') ||
    key.toLowerCase().includes('june') ||
    key.toLowerCase().includes('2025')
  );

  if (problematicKeys.length > 0) {
    console.log('\n⚠️  Found potentially problematic keys:');
    problematicKeys.forEach((key, index) => {
      const value = localStorage.getItem(key);
      console.log(`   ${index + 1}. ${key}`);
      try {
        const parsed = JSON.parse(value);
        console.log(`      Value: ${JSON.stringify(parsed, null, 2).substring(0, 200)}...`);
      } catch {
        console.log(`      Value: ${value?.substring(0, 100)}...`);
      }
    });

    console.log('\n🗑️  Clearing problematic keys...');
    problematicKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`   ✅ Cleared: ${key}`);
    });
  }

  // Also clear any keys related to specific users mentioned in the debug
  const userKeys = allKeys.filter(key => 
    key.includes('e57d8c46-0186-4749-b18d-9e170aaa5fce') || // june2025 user
    key.includes('8db9861a-76ce-4ae3-81b0-7a8b82314ef2')    // test original user
  );

  if (userKeys.length > 0) {
    console.log('\n👤 Found user-specific keys:');
    userKeys.forEach((key, index) => {
      console.log(`   ${index + 1}. ${key}`);
    });

    console.log('\n🗑️  Clearing user-specific keys...');
    userKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`   ✅ Cleared: ${key}`);
    });
  }

  // Finally, clear any remaining keys that might be cache-related
  const cacheKeys = allKeys.filter(key => 
    key.includes('cache') || 
    key.includes('Cache') ||
    key.includes('CACHE')
  );

  if (cacheKeys.length > 0) {
    console.log('\n💾 Found cache-related keys:');
    cacheKeys.forEach((key, index) => {
      console.log(`   ${index + 1}. ${key}`);
    });

    console.log('\n🗑️  Clearing cache keys...');
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`   ✅ Cleared: ${key}`);
    });
  }
}

console.log('\n📊 Final localStorage status:');
const remainingKeys = Object.keys(localStorage);
console.log(`   Remaining keys: ${remainingKeys.length}`);

if (remainingKeys.length > 0) {
  console.log('   Remaining keys:');
  remainingKeys.forEach((key, index) => {
    console.log(`     ${index + 1}. ${key}`);
  });
} else {
  console.log('   ✅ localStorage is now completely clean!');
}

console.log('\n🔧 RECOMMENDATIONS:');
console.log('1. After running this script, refresh the ABCD page');
console.log('2. Try adding a new date (like Jun 3, 2025) and check if it shows red status');
console.log('3. If the issue persists, check browser dev tools Network tab for API calls');
console.log('4. Look for any console errors or warnings in the browser');

console.log('\n✅ Cache clearing complete!');
