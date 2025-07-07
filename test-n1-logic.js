// Quick test to verify the N-1 pattern logic with July 7th data
console.log('🧪 Testing N-1 Pattern Logic for July 7th');

// Sample available dates based on the conversation context
const testAvailableDates = [
  '2025-06-27',
  '2025-06-28', 
  '2025-06-29',
  '2025-06-30',
  '2025-07-01',
  '2025-07-02',
  '2025-07-03'
];

const selectedDate = '2025-07-07';

console.log('📅 Test Data:');
console.log('Available dates:', testAvailableDates);
console.log('Selected date:', selectedDate);

// Calculate N-1 date
const selectedDateObj = new Date(selectedDate);
const n1DateObj = new Date(selectedDateObj);
n1DateObj.setDate(n1DateObj.getDate() - 1);
const n1Date = n1DateObj.toISOString().split('T')[0];

console.log('\n🎯 N-1 Pattern Test:');
console.log('N-1 date (July 6):', n1Date);
console.log('N-1 date available:', testAvailableDates.includes(n1Date));

// Test fallback logic since N-1 (July 6) is not available
console.log('\n🔧 Testing Fallback Logic:');
const sortedDates = [...testAvailableDates].sort((a, b) => new Date(a) - new Date(b));
console.log('Sorted dates:', sortedDates);

let closestPreviousDate = null;
for (let i = sortedDates.length - 1; i >= 0; i--) {
  const availableDate = new Date(sortedDates[i]);
  const isLess = availableDate < selectedDateObj;
  console.log(`Testing ${sortedDates[i]} < ${selectedDate}:`, isLess);
  
  if (isLess) {
    closestPreviousDate = sortedDates[i];
    console.log(`✅ Found closest previous: ${closestPreviousDate}`);
    break;
  }
}

console.log('\n📊 Test Results:');
console.log('Expected closest previous date: 2025-07-03');
console.log('Actual closest previous date:', closestPreviousDate);
console.log('Test PASSED:', closestPreviousDate === '2025-07-03');

if (closestPreviousDate === '2025-07-03') {
  console.log('✅ Logic is correct! The issue must be with data retrieval.');
  console.log('🔍 Next steps: Check why PlanetsAnalysisPage is not getting the correct availableDates');
} else {
  console.log('❌ Logic error found! Need to fix the fallback algorithm.');
}

// Test what would happen if no previous dates exist
console.log('\n🧪 Edge case: No previous dates');
const futureDateTest = '2025-06-26'; // Before all available dates
const futureDateObj = new Date(futureDateTest);

let closestPreviousFuture = null;
for (let i = sortedDates.length - 1; i >= 0; i--) {
  const availableDate = new Date(sortedDates[i]);
  if (availableDate < futureDateObj) {
    closestPreviousFuture = sortedDates[i];
    break;
  }
}

console.log(`For ${futureDateTest}, closest previous:`, closestPreviousFuture || 'none (would use latest available)');
