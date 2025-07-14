// Debug script to check what dates are being used by PlanetsAnalysisPage
// Run this in browser console on the Planets Analysis page

console.log('🔍 DEBUGGING: Available Dates for July 8th Click');
console.log('==============================================');

// Check localStorage for dates
const userId = 'sing maya';
const localStorageKey = `abcd_dates_${userId}`;
const storedDates = localStorage.getItem(localStorageKey);

console.log('📅 Checking localStorage:');
console.log(`Key: ${localStorageKey}`);
console.log(`Value: ${storedDates}`);

if (storedDates) {
  const dates = JSON.parse(storedDates);
  console.log('Parsed dates:', dates);
  
  // Test the fallback logic with these dates
  const selectedDate = '2025-07-08';
  const selectedDateObj = new Date(selectedDate);
  
  console.log('\n🎯 Testing closest previous logic:');
  console.log('Selected date:', selectedDate);
  console.log('Available dates:', dates);
  
  const sortedDates = [...dates].sort((a, b) => new Date(a) - new Date(b));
  console.log('Sorted dates:', sortedDates);
  
  let closestPreviousDate = null;
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const availableDate = new Date(sortedDates[i]);
    const isLess = availableDate < selectedDateObj;
    console.log(`  ${sortedDates[i]} < ${selectedDate}: ${isLess}`);
    if (isLess) {
      closestPreviousDate = sortedDates[i];
      console.log(`  ✅ Found closest previous: ${closestPreviousDate}`);
      break;
    }
  }
  
  console.log('\n📊 Result:');
  console.log(`Expected for July 8th: July 7th (if exists) or closest previous`);
  console.log(`Actual closest previous: ${closestPreviousDate}`);
  
  // Check if July 7 exists
  if (dates.includes('2025-07-07')) {
    console.log('✅ July 7th exists in available dates');
  } else {
    console.log('❌ July 7th NOT in available dates');
    console.log('💡 This explains why June 30th is being used');
  }
  
} else {
  console.log('❌ No dates found in localStorage');
  console.log('💡 This could be why the fallback to June 30th is happening');
}

// Check all possible localStorage keys
console.log('\n🔍 Checking all localStorage keys for user data:');
const allKeys = Object.keys(localStorage);
const userKeys = allKeys.filter(key => key.includes('sing') || key.includes('maya') || key.includes('abcd'));
console.log('User-related keys found:', userKeys);

userKeys.forEach(key => {
  const value = localStorage.getItem(key);
  console.log(`${key}: ${value}`);
});
