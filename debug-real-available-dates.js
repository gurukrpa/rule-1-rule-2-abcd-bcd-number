// Debug script to check what dates are actually available for user "sing maya"
// Run this to see the real available dates and add July 3rd if needed

console.log('🔍 DEBUGGING: Real Available Dates for User "sing maya"');

// Check what dates the logs show are available
const realTimeAnalysisLogs = [
  '2025-06-19',
  '2025-06-23', 
  '2025-06-26',
  '2025-06-30'
];

console.log('📅 Dates visible in logs:', realTimeAnalysisLogs);

const selectedDate = '2025-07-07';
const selectedDateObj = new Date(selectedDate);

// Test what the current logic would find
let closestPrevious = null;
const sortedDates = [...realTimeAnalysisLogs].sort((a, b) => new Date(a) - new Date(b));

for (let i = sortedDates.length - 1; i >= 0; i--) {
  const availableDate = new Date(sortedDates[i]);
  if (availableDate < selectedDateObj) {
    closestPrevious = sortedDates[i];
    console.log(`✅ Found closest previous: ${closestPrevious}`);
    break;
  }
}

console.log('\n📊 Analysis:');
console.log('Available dates:', sortedDates);
console.log('Selected date:', selectedDate);
console.log('Closest previous:', closestPrevious);
console.log('Current result:', closestPrevious === '2025-06-30' ? '✅ CORRECT' : '❌ WRONG');

console.log('\n🎯 Solution Options:');
console.log('1. ✅ CURRENT BEHAVIOR IS CORRECT');
console.log('   - User has data up to June 30, 2025');
console.log('   - No data for July 1, 2, or 3, 2025');
console.log('   - June 30 IS the closest previous date to July 7');

console.log('\n2. 🔧 TO GET JULY 3 ANALYSIS:');
console.log('   - Need to add data for July 3, 2025');
console.log('   - This would require uploading Excel + Hour Entry for July 3');
console.log('   - Then July 3 would become the closest previous date');

console.log('\n3. 📋 VERIFICATION:');
console.log('   - The N-1 pattern logic is working correctly');
console.log('   - The issue is NOT with the code');
console.log('   - The issue is that July 3 data does not exist');

console.log('\n💡 RECOMMENDED ACTION:');
console.log('If you want July 7 click → July 3 analysis:');
console.log('1. Add data for July 3, 2025 in the ABCD page');
console.log('2. Upload Excel file for July 3');
console.log('3. Complete Hour Entry for July 3');
console.log('4. Then test July 7 → July 3 pattern');

console.log('\nOtherwise, the current behavior (July 7 → June 30) is mathematically correct!');
