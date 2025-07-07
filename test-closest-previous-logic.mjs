#!/usr/bin/env node

/**
 * Test script to verify the "always closest previous date" logic
 * This script tests the expected behavior:
 * - July 8th click → Use July 7th data (closest previous)
 * - July 7th click → Use July 3rd data (closest previous) 
 * - July 22nd click → Use July 8th data (closest previous)
 */

console.log('🧪 Testing "Always Closest Previous Date" Logic');
console.log('==============================================');

// Simulate the dates that exist in the database
const availableDates = ['2025-07-03', '2025-07-07', '2025-07-08'];
console.log('📅 Available dates:', availableDates);

function findClosestPreviousDate(selectedDate, availableDates) {
  const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
  const selectedDateObj = new Date(selectedDate);
  let closestPreviousDate = null;
  
  console.log(`\n🔍 Finding closest available date BEFORE ${selectedDate}...`);
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const availableDate = new Date(sortedDates[i]);
    const isLess = availableDate < selectedDateObj;
    console.log(`  📅 Checking: ${sortedDates[i]} < ${selectedDate} = ${isLess}`);
    if (isLess) {
      closestPreviousDate = sortedDates[i];
      console.log(`  ✅ Found closest previous date: ${closestPreviousDate}`);
      break;
    }
  }
  
  return closestPreviousDate;
}

// Test cases
const testCases = [
  { clicked: '2025-07-08', expected: '2025-07-07' },
  { clicked: '2025-07-07', expected: '2025-07-03' },
  { clicked: '2025-07-22', expected: '2025-07-08' },
  { clicked: '2025-07-05', expected: '2025-07-03' },
  { clicked: '2025-07-03', expected: null }, // No previous date
];

console.log('\n🎯 Running Test Cases:');
console.log('====================');

let allTestsPassed = true;

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: Clicking ${testCase.clicked}`);
  const result = findClosestPreviousDate(testCase.clicked, availableDates);
  
  if (result === testCase.expected) {
    console.log(`✅ PASS: ${testCase.clicked} → ${result || 'null'}`);
  } else {
    console.log(`❌ FAIL: ${testCase.clicked} → Expected: ${testCase.expected || 'null'}, Got: ${result || 'null'}`);
    allTestsPassed = false;
  }
});

console.log('\n📊 Test Results:');
console.log('================');
if (allTestsPassed) {
  console.log('✅ All tests passed! The "always closest previous date" logic is working correctly.');
} else {
  console.log('❌ Some tests failed. The logic needs to be reviewed.');
}

console.log('\n📝 Expected Behavior Summary:');
console.log('- July 8th click → July 7th data ✅');
console.log('- July 7th click → July 3rd data ✅');  
console.log('- July 22nd click → July 8th data ✅');
console.log('- July 5th click → July 3rd data ✅');
console.log('- July 3rd click → No previous data (null) ✅');
