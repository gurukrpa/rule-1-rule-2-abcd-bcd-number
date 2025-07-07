// Quick diagnostic script to check available dates for user "1"
console.log('🔍 Checking available dates for user "1"...');

// Check localStorage
const userId = '1';
const localStorageKey = `abcd_dates_${userId}`;
const localStorageDates = localStorage.getItem(localStorageKey);

if (localStorageDates) {
  try {
    const dates = JSON.parse(localStorageDates);
    console.log('📅 LocalStorage dates found:', dates);
    console.log('📅 Total dates:', dates.length);
    console.log('📅 Latest date:', dates.sort((a,b) => new Date(b) - new Date(a))[0]);
    
    // Check for July 2025 dates
    const july2025 = dates.filter(d => d.startsWith('2025-07'));
    console.log('🗓️ July 2025 dates:', july2025);
    
    // Check if July 7, 2025 exists
    const july7 = dates.includes('2025-07-07');
    console.log('✅ July 7, 2025 available:', july7);
    
    // Check if July 6, 2025 exists (N-1 pattern)
    const july6 = dates.includes('2025-07-06');
    console.log('✅ July 6, 2025 available (N-1):', july6);
    
  } catch (e) {
    console.log('❌ Error parsing localStorage dates:', e);
  }
} else {
  console.log('❌ No localStorage dates found for user "1"');
}

// Also check if we can see the issue in the browser
console.log('\n🎯 SUMMARY:');
console.log('If July 7, 2025 data is not available, the system will:');
console.log('1. Try July 7, 2025 → NOT FOUND');
console.log('2. Try July 6, 2025 (N-1) → CHECK RESULT ABOVE');
console.log('3. Fallback to latest available date');
console.log('\n📊 To fix this issue:');
console.log('- Add July 7, 2025 data via ABCD-number page');
console.log('- OR add July 6, 2025 data for N-1 pattern');
console.log('- OR use a date that exists in the dataset');
