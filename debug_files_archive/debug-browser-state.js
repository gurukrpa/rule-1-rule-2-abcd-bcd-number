// Debug script to check current browser state for July 7 N-1 pattern issue
// Paste this in browser console when on ABCD page with user "sing maya"

console.log('🔍 DEBUG: Checking current browser state for July 7 N-1 pattern issue');

// Check localStorage keys
console.log('\n📁 Available localStorage keys:');
const allKeys = Object.keys(localStorage);
const userKeys = allKeys.filter(key => key.includes('sing maya'));
console.log('Keys containing "sing maya":', userKeys);

// Check specific keys we're looking for
const dateKeys = allKeys.filter(key => key.includes('dates'));
console.log('All date-related keys:', dateKeys);

// Try to find the actual dates
let availableDates = [];
const possibleKeys = [
  'abcd_dates_sing maya',
  'dates_sing maya', 
  'user_dates_sing maya',
  'sing maya_dates'
];

console.log('\n📅 Checking for available dates:');
for (const key of possibleKeys) {
  const value = localStorage.getItem(key);
  if (value) {
    try {
      const parsed = JSON.parse(value);
      console.log(`✅ Found dates in "${key}":`, parsed);
      if (Array.isArray(parsed)) {
        availableDates = parsed;
        break;
      }
    } catch (e) {
      console.log(`❌ Error parsing "${key}":`, e);
    }
  } else {
    console.log(`❌ No data in "${key}"`);
  }
}

if (availableDates.length === 0) {
  console.log('\n⚠️ No dates found in localStorage, checking if we can find them elsewhere...');
  
  // Check if there's a React component state or other source
  console.log('Trying to access React component state...');
  
  // Look for any global variables or window properties
  const windowProps = Object.keys(window).filter(key => 
    key.toLowerCase().includes('date') || 
    key.toLowerCase().includes('user') ||
    key.toLowerCase().includes('abcd')
  );
  console.log('Window properties that might contain dates:', windowProps);
} else {
  console.log('\n✅ Available dates found:', availableDates);
  
  // Test the N-1 pattern logic
  const selectedDate = '2025-07-07';
  const selectedDateObj = new Date(selectedDate);
  const n1DateObj = new Date(selectedDateObj);
  n1DateObj.setDate(n1DateObj.getDate() - 1);
  const n1Date = n1DateObj.toISOString().split('T')[0];
  
  console.log('\n🎯 Testing N-1 pattern:');
  console.log('Selected date:', selectedDate);
  console.log('N-1 date:', n1Date);
  console.log('N-1 date available:', availableDates.includes(n1Date));
  
  // Test fallback logic
  const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
  console.log('Sorted dates:', sortedDates);
  
  let closestPreviousDate = null;
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const availableDate = new Date(sortedDates[i]);
    const isLess = availableDate < selectedDateObj;
    console.log(`Checking ${sortedDates[i]} < ${selectedDate}:`, isLess);
    if (isLess) {
      closestPreviousDate = sortedDates[i];
      console.log(`✅ Found closest previous: ${closestPreviousDate}`);
      break;
    }
  }
  
  console.log('\n📊 Expected result:');
  console.log('Should use date:', closestPreviousDate || 'latest available');
  console.log('Expected: 2025-07-03 (closest before July 7)');
  console.log('Actual result:', closestPreviousDate);
  
  if (closestPreviousDate === '2025-07-03') {
    console.log('✅ Fallback logic works correctly!');
    console.log('🔍 The issue must be elsewhere - possibly:');
    console.log('1. PlanetsAnalysisPage is not getting the correct availableDates');
    console.log('2. The dates are not being loaded properly from storage');
    console.log('3. There\'s an issue with the date storage/retrieval system');
  } else {
    console.log('❌ Fallback logic issue found!');
  }
}

// Try to trigger navigation to Planets Analysis to see what happens
console.log('\n🚀 To test: Click on July 7, 2025 and then click "Planets Analysis" button');
console.log('Watch for console logs starting with "[PlanetsAnalysis]"');
