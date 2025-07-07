// Browser console script to diagnose the current state
// Run this in the browser console to see what's happening

console.log('🔍 DIAGNOSING: July 7th N-1 Pattern Current Issue');

// Check what's actually in the page
const pageText = document.body.textContent || '';
const analysisDateMatch = pageText.match(/Analysis: (\d{2}\/\d{2}\/\d{4})/);
const currentAnalysisDate = analysisDateMatch ? analysisDateMatch[1] : 'not found';

console.log('📊 Current Page State:');
console.log('  Clicked Date: 07/07/2025');
console.log('  Analysis Date:', currentAnalysisDate);
console.log('  Expected Analysis Date: 03/07/2025');
console.log('  Is Correct:', currentAnalysisDate === '03/07/2025');

// Check browser console logs for clues
console.log('\n🔍 Checking for PlanetsAnalysis logs...');
console.log('Look in the console above for logs containing:');
console.log('  - "[PlanetsAnalysis]"');
console.log('  - "availableDates"');
console.log('  - "closest previous date"');

// Check localStorage for available dates
console.log('\n📅 Checking localStorage for available dates:');
const userId = 'sing maya';
const possibleKeys = [
  `abcd_dates_${userId}`,
  `abcd_dates_sing maya`,
  'abcd_dates_sing maya'
];

let foundDates = [];
possibleKeys.forEach(key => {
  const value = localStorage.getItem(key);
  if (value) {
    try {
      const dates = JSON.parse(value);
      console.log(`✅ Found dates in "${key}":`, dates);
      foundDates = dates;
    } catch (e) {
      console.log(`❌ Error parsing "${key}":`, e);
    }
  } else {
    console.log(`❌ No data in "${key}"`);
  }
});

if (foundDates.length > 0) {
  console.log('\n🧪 Testing fallback logic with found dates:');
  const selectedDate = '2025-07-07';
  const selectedDateObj = new Date(selectedDate);
  
  // Calculate N-1
  const n1DateObj = new Date(selectedDateObj);
  n1DateObj.setDate(n1DateObj.getDate() - 1);
  const n1Date = n1DateObj.toISOString().split('T')[0];
  
  console.log('  N-1 date:', n1Date);
  console.log('  N-1 available:', foundDates.includes(n1Date));
  
  // Test fallback
  const sortedDates = [...foundDates].sort((a, b) => new Date(a) - new Date(b));
  console.log('  Sorted dates:', sortedDates);
  
  let closestPrevious = null;
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const availableDate = new Date(sortedDates[i]);
    if (availableDate < selectedDateObj) {
      closestPrevious = sortedDates[i];
      console.log(`  ✅ Closest previous: ${closestPrevious}`);
      break;
    }
  }
  
  if (closestPrevious === '2025-07-03') {
    console.log('  ✅ Logic would find July 3rd correctly');
    console.log('  🔍 Issue must be elsewhere in the data flow');
  } else {
    console.log(`  ❌ Logic finds: ${closestPrevious} (expected: 2025-07-03)`);
  }
} else {
  console.log('\n❌ No dates found in localStorage');
  console.log('🔍 Issue: PlanetsAnalysisPage might not be loading dates correctly');
}

// Check if we can trigger a refresh to see real-time logs
console.log('\n🔄 To see real-time debugging:');
console.log('1. Open browser console');
console.log('2. Refresh this page');
console.log('3. Watch for [PlanetsAnalysis] logs during page load');

// Suggest manual test
console.log('\n🧪 Manual Test:');
console.log('1. Go back to ABCD page: http://localhost:5173/abcd/sing%20maya');
console.log('2. Click on July 7, 2025 date');
console.log('3. Click "Planets Analysis" button');
console.log('4. Watch console for debugging logs');

// Check if we need to refresh to get updated code
const lastModified = document.lastModified;
console.log('\n📝 Page Info:');
console.log('Last modified:', lastModified);
console.log('💡 If code was recently updated, try refreshing the page');
