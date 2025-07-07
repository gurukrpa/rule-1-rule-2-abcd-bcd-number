// Test script to debug date comparison issue
// Run in browser console: copy and paste this entire script

console.log('🔍 Testing Date Comparison Logic for July 7th N-1 Pattern');

// Sample data based on the user's available dates
const availableDates = [
  '2025-06-27',
  '2025-06-28', 
  '2025-06-29',
  '2025-06-30',
  '2025-07-01',
  '2025-07-02',
  '2025-07-03'
];

const selectedDate = '2025-07-07';

console.log('📅 Available dates:', availableDates);
console.log('🎯 Selected date:', selectedDate);

// Calculate N-1 date
const selectedDateObj = new Date(selectedDate);
const n1DateObj = new Date(selectedDateObj);
n1DateObj.setDate(n1DateObj.getDate() - 1);
const n1Date = n1DateObj.toISOString().split('T')[0];

console.log('📅 N-1 date:', n1Date);
console.log('📅 N-1 date available:', availableDates.includes(n1Date));

// Test fallback logic
const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
console.log('📅 Sorted dates:', sortedDates);

console.log('\n🔍 Testing date comparison logic:');
console.log('selectedDateObj:', selectedDateObj);
console.log('selectedDateObj ISO:', selectedDateObj.toISOString());

let closestPreviousDate = null;
for (let i = sortedDates.length - 1; i >= 0; i--) {
  const availableDate = new Date(sortedDates[i]);
  const isLess = availableDate < selectedDateObj;
  
  console.log(`  Testing ${sortedDates[i]}:`);
  console.log(`    availableDate: ${availableDate}`);
  console.log(`    availableDate ISO: ${availableDate.toISOString()}`);
  console.log(`    ${availableDate} < ${selectedDateObj}? ${isLess}`);
  console.log(`    milliseconds: ${availableDate.getTime()} < ${selectedDateObj.getTime()}? ${availableDate.getTime() < selectedDateObj.getTime()}`);
  
  if (isLess) {
    closestPreviousDate = sortedDates[i];
    console.log(`  ✅ Found closest previous: ${closestPreviousDate}`);
    break;
  }
}

console.log('\n📊 RESULT:');
console.log(`Expected closest previous date: 2025-07-03`);
console.log(`Actual closest previous date: ${closestPreviousDate}`);

// Test with different date creation methods
console.log('\n🧪 Testing different date creation methods:');

function testDateMethod(dateStr, methodName, createFn) {
  const testDate = createFn(dateStr);
  const comp = testDate < selectedDateObj;
  console.log(`  ${methodName}(${dateStr}): ${testDate} < ${selectedDateObj}? ${comp}`);
}

testDateMethod('2025-07-03', 'new Date', d => new Date(d));
testDateMethod('2025-07-03', 'new Date + T00:00:00', d => new Date(d + 'T00:00:00'));
testDateMethod('2025-07-03', 'new Date + time zone', d => new Date(d + 'T00:00:00Z'));

// Check if there are timezone issues
console.log('\n🌍 Timezone debug:');
console.log('Browser timezone offset (minutes):', new Date().getTimezoneOffset());
console.log('Selected date parts:', {
  year: selectedDateObj.getFullYear(),
  month: selectedDateObj.getMonth() + 1,
  date: selectedDateObj.getDate(),
  hours: selectedDateObj.getHours()
});

// Try a more explicit comparison
console.log('\n📅 Explicit date part comparison:');
const jul3 = new Date('2025-07-03');
console.log(`July 3: ${jul3}, parts: ${jul3.getFullYear()}-${jul3.getMonth()+1}-${jul3.getDate()}`);
console.log(`July 7: ${selectedDateObj}, parts: ${selectedDateObj.getFullYear()}-${selectedDateObj.getMonth()+1}-${selectedDateObj.getDate()}`);
console.log(`July 3 < July 7? ${jul3 < selectedDateObj}`);
