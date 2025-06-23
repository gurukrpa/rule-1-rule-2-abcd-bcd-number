// Diagnostic Tool for Rule2CompactPage Date Sequence Issue
// This tool checks why clicking the 5th date shows 6th date data and vice versa

console.log('🔍 Rule2CompactPage Date Sequence Issue Diagnostic');
console.log('='.repeat(60));

// Test scenario based on user report
const userScenario = {
  dates: ['2025-06-01', '2025-06-02', '2025-06-03', '2025-06-04', '2025-06-05', '2025-06-06'],
  problem: 'Clicking 5th date shows 6th date data, clicking 6th date shows 5th date data'
};

console.log('\n📋 USER SCENARIO:');
console.log('Dates:', userScenario.dates);
console.log('Problem:', userScenario.problem);

// Function to debug ABCDBCDNumber.jsx handleRule2Click logic
function debugHandleRule2Click(datesList, clickedDate) {
  console.log('\n🔍 DEBUG ABCDBCDNumber.jsx handleRule2Click:');
  console.log('Input datesList:', datesList);
  console.log('Input clickedDate:', clickedDate);
  
  // This matches the logic in ABCDBCDNumber.jsx
  const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
  const idx = sortedDates.indexOf(clickedDate);
  
  console.log('Sorted dates:', sortedDates);
  console.log(`Clicked date "${clickedDate}" is at index ${idx} (position ${idx + 1})`);
  
  if (idx < 4) {
    console.log(`❌ Rule-2 requires at least 5 dates. This is only the ${idx + 1} date.`);
    return null;
  }
  
  // Get the four preceding dates (A, B, C, D)
  const A = sortedDates[idx - 4];
  const B = sortedDates[idx - 3];  
  const C = sortedDates[idx - 2];
  const D = sortedDates[idx - 1];
  
  console.log('\n📅 ABCDBCDNumber.jsx passes to Rule2CompactPage:');
  console.log(`  date: "${clickedDate}" (trigger date)`);
  console.log(`  datesList: [${datesList.join(', ')}]`);
  
  console.log('\n🔗 Expected ABCD sequence in Rule2CompactPage:');
  console.log(`  A-day: ${A}`);
  console.log(`  B-day: ${B}`);
  console.log(`  C-day: ${C}`);
  console.log(`  D-day: ${D} ← Analysis source`);
  console.log(`  Trigger: ${clickedDate} ← What you clicked`);
  
  return {
    passedDate: clickedDate,
    passedDatesList: datesList,
    expectedABCD: { A, B, C, D },
    triggerDate: clickedDate
  };
}

// Function to debug Rule2CompactPage date processing
function debugRule2CompactPageLogic(date, datesList) {
  console.log('\n🔍 DEBUG Rule2CompactPage date processing:');
  console.log('Received date:', date);
  console.log('Received datesList:', datesList);
  
  // This matches the logic in Rule2CompactPage.jsx
  const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
  const clickedIndex = sortedDates.findIndex(d => d === date);
  
  console.log('Sorted dates in Rule2CompactPage:', sortedDates);
  console.log(`Rule2CompactPage finds "${date}" at index ${clickedIndex}`);
  
  if (clickedIndex < 4) {
    console.log(`❌ Rule-2 can only be triggered from the 5th date onwards. Current position: ${clickedIndex + 1}`);
    return null;
  }
  
  // Take the 4 dates BEFORE the clicked date as ABCD sequence
  const aDay = sortedDates[clickedIndex - 4];
  const bDay = sortedDates[clickedIndex - 3];
  const cDay = sortedDates[clickedIndex - 2];
  const dDay = sortedDates[clickedIndex - 1];
  
  console.log('\n📊 Rule2CompactPage calculates ABCD sequence:');
  console.log(`  A-day: sortedDates[${clickedIndex - 4}] = ${aDay}`);
  console.log(`  B-day: sortedDates[${clickedIndex - 3}] = ${bDay}`);
  console.log(`  C-day: sortedDates[${clickedIndex - 2}] = ${cDay}`);
  console.log(`  D-day: sortedDates[${clickedIndex - 1}] = ${dDay} ← Analysis source`);
  
  return {
    aDay, bDay, cDay, dDay,
    triggerDate: date,
    clickedIndex
  };
}

console.log('\n🧪 TESTING SCENARIO 1: Click 5th date (2025-06-05)');
console.log('='.repeat(50));

const test1ABCDNumber = debugHandleRule2Click(userScenario.dates, '2025-06-05');
if (test1ABCDNumber) {
  const test1Rule2Compact = debugRule2CompactPageLogic(test1ABCDNumber.passedDate, test1ABCDNumber.passedDatesList);
  
  if (test1Rule2Compact) {
    console.log('\n✅ COMPARISON:');
    console.log(`Expected D-day: ${test1ABCDNumber.expectedABCD.D}`);
    console.log(`Actual D-day: ${test1Rule2Compact.dDay}`);
    console.log(`Match: ${test1ABCDNumber.expectedABCD.D === test1Rule2Compact.dDay ? '✅' : '❌'}`);
    
    if (test1ABCDNumber.expectedABCD.D !== test1Rule2Compact.dDay) {
      console.log('🚨 MISMATCH DETECTED! This explains the wrong data issue.');
    }
  }
}

console.log('\n🧪 TESTING SCENARIO 2: Click 6th date (2025-06-06)');
console.log('='.repeat(50));

const test2ABCDNumber = debugHandleRule2Click(userScenario.dates, '2025-06-06');
if (test2ABCDNumber) {
  const test2Rule2Compact = debugRule2CompactPageLogic(test2ABCDNumber.passedDate, test2ABCDNumber.passedDatesList);
  
  if (test2Rule2Compact) {
    console.log('\n✅ COMPARISON:');
    console.log(`Expected D-day: ${test2ABCDNumber.expectedABCD.D}`);
    console.log(`Actual D-day: ${test2Rule2Compact.dDay}`);
    console.log(`Match: ${test2ABCDNumber.expectedABCD.D === test2Rule2Compact.dDay ? '✅' : '❌'}`);
    
    if (test2ABCDNumber.expectedABCD.D !== test2Rule2Compact.dDay) {
      console.log('🚨 MISMATCH DETECTED! This explains the wrong data issue.');
    }
  }
}

console.log('\n🔍 POTENTIAL CAUSES:');
console.log('1. ❌ datesList order inconsistency between components');
console.log('2. ❌ Date string format differences');
console.log('3. ❌ Caching issues with old date data');
console.log('4. ❌ React state update timing issues');
console.log('5. ❌ Date timezone differences affecting sorting');

console.log('\n💡 DEBUGGING STEPS:');
console.log('1. Check datesList order in browser console when clicking Rule-2');
console.log('2. Verify date format consistency (YYYY-MM-DD vs other formats)');
console.log('3. Clear localStorage cache and test again');
console.log('4. Add console.log to both handleRule2Click and Rule2CompactPage useEffect');
console.log('5. Check if datesList is the same object reference or a copy');

console.log('\n🚀 To use this diagnostic:');
console.log('1. Copy this script into browser console');
console.log('2. Run it when experiencing the date sequence issue');
console.log('3. Compare the expected vs actual D-day results');
console.log('4. Look for mismatches to identify the root cause');

// Additional debugging for real-time use
if (typeof window !== 'undefined') {
  console.log('\n🔧 REAL-TIME DEBUGGING AVAILABLE:');
  console.log('Use these functions in console:');
  console.log('- debugHandleRule2Click(datesList, clickedDate)');
  console.log('- debugRule2CompactPageLogic(date, datesList)');
  
  window.debugHandleRule2Click = debugHandleRule2Click;
  window.debugRule2CompactPageLogic = debugRule2CompactPageLogic;
}
