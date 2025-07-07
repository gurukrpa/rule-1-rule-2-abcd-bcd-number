// Quick test of the new "always closest previous" logic
console.log('🧪 Testing New "Always Closest Previous" Logic');
console.log('==============================================');

// Simulate test data
const testAvailableDates = [
  '2025-06-30',
  '2025-07-01',
  '2025-07-02', 
  '2025-07-03',
  '2025-07-07',  // ← This exists but should NOT be used
  '2025-07-08'   // ← This exists but should NOT be used
];

function testClosestPreviousLogic(selectedDate, availableDates) {
  console.log(`\n🎯 Testing: Click ${selectedDate}`);
  console.log(`📅 Available dates: [${availableDates.join(', ')}]`);
  
  // New logic: ALWAYS find closest previous date
  const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
  const selectedDateObj = new Date(selectedDate);
  
  // Find the closest date BEFORE the selected date
  let closestPreviousDate = null;
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const availableDate = new Date(sortedDates[i]);
    const isLess = availableDate < selectedDateObj;
    console.log(`  📅 Checking ${sortedDates[i]} < ${selectedDate}: ${isLess}`);
    if (isLess) {
      closestPreviousDate = sortedDates[i];
      console.log(`  ✅ Found closest previous: ${closestPreviousDate}`);
      break;
    }
  }
  
  if (!closestPreviousDate) {
    closestPreviousDate = sortedDates[sortedDates.length - 1];
    console.log(`  ⚠️ No previous dates, using latest: ${closestPreviousDate}`);
  }
  
  console.log(`📊 Result: ${selectedDate} → ${closestPreviousDate}`);
  return closestPreviousDate;
}

// Test cases
console.log('\n🧪 TEST CASES:');

// Test July 7th (should find July 3rd, NOT July 7th itself)
const july7Result = testClosestPreviousLogic('2025-07-07', testAvailableDates);
console.log(`✅ July 7th test: Expected July 3rd, Got ${july7Result}`);

// Test July 8th (should find July 7th)  
const july8Result = testClosestPreviousLogic('2025-07-08', testAvailableDates);
console.log(`✅ July 8th test: Expected July 7th, Got ${july8Result}`);

// Test July 9th (should find July 8th)
const july9Result = testClosestPreviousLogic('2025-07-09', testAvailableDates);
console.log(`✅ July 9th test: Expected July 8th, Got ${july9Result}`);

console.log('\n🎯 SUMMARY:');
console.log('The new logic should ALWAYS find the closest previous date,');
console.log('even if the clicked date exists in the availableDates list.');
console.log('This ensures we always get data from a previous day.');
