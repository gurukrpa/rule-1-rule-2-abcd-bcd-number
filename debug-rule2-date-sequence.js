// Rule2CompactPage Date Sequence Debug Tool
// Run this in browser console to debug date ordering issues

console.log('🔍 Rule2CompactPage Date Sequence Debug Tool');
console.log('='.repeat(60));

// Function to simulate Rule2CompactPage date logic
function debugDateSequence(datesList, clickedDate) {
  console.log('\n📅 INPUT DATA:');
  console.log('Original datesList:', datesList);
  console.log('Clicked date:', clickedDate);
  
  // Sort dates in ascending order (oldest to newest)
  const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
  console.log('\n📊 SORTED DATES (oldest → newest):');
  sortedDates.forEach((date, index) => {
    const isClicked = date === clickedDate;
    console.log(`${index + 1}. ${date} ${isClicked ? '← CLICKED' : ''}`);
  });
  
  // Find the clicked date position
  const clickedIndex = sortedDates.findIndex(d => d === clickedDate);
  console.log(`\n🎯 CLICKED DATE POSITION: ${clickedIndex + 1} (index ${clickedIndex})`);
  
  if (clickedIndex < 4) {
    console.log(`❌ ERROR: Rule-2 requires 5th+ date. Current position: ${clickedIndex + 1}`);
    return null;
  }
  
  // Take the 4 dates BEFORE the clicked date as ABCD sequence
  const aDay = sortedDates[clickedIndex - 4]; // 4 days before clicked date
  const bDay = sortedDates[clickedIndex - 3]; // 3 days before clicked date
  const cDay = sortedDates[clickedIndex - 2]; // 2 days before clicked date
  const dDay = sortedDates[clickedIndex - 1]; // 1 day before clicked date (D-day source)
  
  console.log('\n🔗 ABCD SEQUENCE CALCULATION:');
  console.log(`A-day: sortedDates[${clickedIndex - 4}] = ${aDay}`);
  console.log(`B-day: sortedDates[${clickedIndex - 3}] = ${bDay}`);
  console.log(`C-day: sortedDates[${clickedIndex - 2}] = ${cDay}`);
  console.log(`D-day: sortedDates[${clickedIndex - 1}] = ${dDay}`);
  console.log(`Trigger: sortedDates[${clickedIndex}] = ${clickedDate}`);
  
  console.log('\n📋 EXPECTED SEQUENCE:');
  console.log(`A-day (oldest): ${aDay}`);
  console.log(`B-day: ${bDay}`);
  console.log(`C-day: ${cDay}`);
  console.log(`D-day (analysis source): ${dDay}`);
  console.log(`Trigger Date (Rule-2 clicked): ${clickedDate}`);
  
  // Verify chronological order
  console.log('\n✅ CHRONOLOGICAL VERIFICATION:');
  const sequence = [aDay, bDay, cDay, dDay, clickedDate];
  let isCorrectOrder = true;
  
  for (let i = 1; i < sequence.length; i++) {
    const prev = new Date(sequence[i-1]);
    const curr = new Date(sequence[i]);
    const isValid = prev < curr;
    console.log(`${sequence[i-1]} → ${sequence[i]}: ${isValid ? '✅' : '❌'}`);
    if (!isValid) isCorrectOrder = false;
  }
  
  if (isCorrectOrder) {
    console.log('🎉 Date sequence is chronologically correct!');
  } else {
    console.log('🚨 Date sequence has chronological errors!');
  }
  
  return {
    aDay, bDay, cDay, dDay, 
    triggerDate: clickedDate,
    clickedIndex,
    sortedDates,
    isValidSequence: isCorrectOrder
  };
}

// Test with your actual data
console.log('\n🧪 TESTING YOUR SCENARIO:');
const yourDates = ['2025-06-01', '2025-06-02', '2025-06-03', '2025-06-04', '2025-06-05', '2025-06-06'];
const yourClickedDate = '2025-06-05'; // What you clicked

const result = debugDateSequence(yourDates, yourClickedDate);

if (result) {
  console.log('\n📊 ANALYSIS RESULT:');
  console.log(`When you click "${yourClickedDate}", Rule2 should analyze:`);
  console.log(`• A-day: ${result.aDay}`);
  console.log(`• B-day: ${result.bDay}`);
  console.log(`• C-day: ${result.cDay}`);
  console.log(`• D-day: ${result.dDay} ← Data source for ABCD/BCD analysis`);
  
  if (result.dDay !== '2025-06-04') {
    console.log('🚨 PROBLEM DETECTED: D-day should be 2025-06-04 but got:', result.dDay);
  }
}

// Test the reverse scenario
console.log('\n🔄 TESTING REVERSE SCENARIO:');
const reverseClickedDate = '2025-06-06'; // If you click 6th date
const reverseResult = debugDateSequence(yourDates, reverseClickedDate);

if (reverseResult) {
  console.log('\n📊 REVERSE ANALYSIS:');
  console.log(`When you click "${reverseClickedDate}", Rule2 should analyze:`);
  console.log(`• A-day: ${reverseResult.aDay}`);
  console.log(`• B-day: ${reverseResult.bDay}`);
  console.log(`• C-day: ${reverseResult.cDay}`);
  console.log(`• D-day: ${reverseResult.dDay} ← Data source for ABCD/BCD analysis`);
}

console.log('\n🎯 DEBUGGING CHECKLIST:');
console.log('1. ✅ Check if datesList is in correct order when passed to Rule2CompactPage');
console.log('2. ✅ Verify the clicked date parameter is correct');
console.log('3. ✅ Confirm data is being extracted from the right D-day');
console.log('4. ✅ Check if there\'s any date formatting inconsistency');

console.log('\n💡 COMMON ISSUES:');
console.log('• Date strings vs Date objects comparison');
console.log('• Timezone differences causing wrong sorting');
console.log('• Cached results from previous analysis');
console.log('• Wrong date being passed from ABCDBCDNumber.jsx');

console.log('\n🚀 Ready for debugging! Run this script and check the results.');
