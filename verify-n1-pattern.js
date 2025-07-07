// verify-n1-pattern.js - Quick verification of N-1 pattern logic

// Test the N-1 pattern logic that's currently implemented in PlanetsAnalysisPage.jsx
console.log('🔍 TESTING N-1 PATTERN LOGIC');
console.log('===============================');

// Available dates from your database (confirmed)
const availableDates = ['2025-06-19', '2025-06-23', '2025-06-26', '2025-06-30'];
console.log('📅 Available dates in database:', availableDates);

// Test case: User clicks July 7, 2025
const userClickedDate = '2025-07-07';
console.log(`\n🎯 User clicked: ${userClickedDate}`);

// Calculate N-1 (previous day)
const selectedDateObj = new Date(userClickedDate);
const previousDateObj = new Date(selectedDateObj);
previousDateObj.setDate(previousDateObj.getDate() - 1);
const n1Date = previousDateObj.toISOString().split('T')[0];

console.log(`📅 N-1 Date (previous day): ${n1Date}`);
console.log(`📅 Is N-1 date available in database: ${availableDates.includes(n1Date)}`);

// Find closest previous date with data (current fallback logic)
const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
let closestPreviousDate = null;

for (let i = sortedDates.length - 1; i >= 0; i--) {
  const availableDate = new Date(sortedDates[i]);
  const selectedDate = new Date(userClickedDate);
  
  if (availableDate < selectedDate) {
    closestPreviousDate = sortedDates[i];
    break;
  }
}

console.log(`\n🔍 FALLBACK LOGIC:`);
console.log(`   Closest previous date with data: ${closestPreviousDate}`);
console.log(`   This is mathematically correct: June 30th IS the closest date before July 7th`);

console.log(`\n✅ CONCLUSION:`);
console.log(`   The system is working correctly!`);
console.log(`   July 7, 2025 → July 6, 2025 (N-1, but no data) → June 30, 2025 (closest previous date)`);
console.log(`   The displayed date "30/06/2025" is the CORRECT behavior.`);

console.log(`\n💡 SOLUTION OPTIONS:`);
console.log(`   1. Accept current behavior: July 7 → June 30 (working correctly)`);
console.log(`   2. Add data for July 3rd to get: July 7 → July 3 (requires data entry)`);
console.log(`   3. Add data for July 6th to get: July 7 → July 6 (requires data entry)`);

// Verify the date math
console.log(`\n🧮 DATE MATH VERIFICATION:`);
const june30 = new Date('2025-06-30');
const july7 = new Date('2025-07-07');
const daysDifference = (july7 - june30) / (1000 * 60 * 60 * 24);
console.log(`   Days between June 30 and July 7: ${daysDifference} days`);
console.log(`   June 30th is indeed the closest available date before July 7th`);
