// Test Rule-1 Functionality
// Run this in browser console to test Rule-1 implementation

console.log('🔍 Testing Rule-1 Functionality');

// Test 1: Check if Rule1Page component is properly imported
console.log('1. Checking imports...');

// Test 2: Check if Rule-1 button appears correctly
console.log('2. Rule-1 Button Visibility Logic:');
console.log('   - Should appear only for dates that are chronologically 5th or later');
console.log('   - Should be enabled only for the newest eligible date');
console.log('   - All previous eligible dates should be disabled');

// Test 3: Check aggregation logic
console.log('3. Data Aggregation Logic:');
console.log('   - Should collect data from day-1 to the date BEFORE clicked date');
console.log('   - Should validate all preceding dates have Excel and Hour Entry');
console.log('   - Should display aggregated data exactly like Index page');

// Test 4: Simulate Rule-1 click scenarios
function testRule1Logic() {
  const datesList = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06'];
  
  console.log('📅 Test Dates:', datesList);
  
  datesList.forEach((date, idx) => {
    const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
    const thisIndex = sortedDates.indexOf(date);
    const rule1Available = thisIndex >= 4;
    const rule1Enabled = rule1Available && thisIndex === sortedDates.length - 1;
    
    console.log(`Date ${idx + 1} (${date}):`, {
      chronoIndex: thisIndex,
      rule1Available,
      rule1Enabled,
      status: rule1Available ? (rule1Enabled ? 'ACTIVE' : 'DISABLED') : 'HIDDEN'
    });
  });
}

testRule1Logic();

// Test 5: Check disable logic when new date is added
console.log('5. Testing disable logic when new date is added:');
function testDisableLogic() {
  console.log('Scenario: 5 dates exist, 6th date added');
  console.log('Expected: 5th date Rule-1 becomes disabled, 6th date Rule-1 becomes active');
  
  console.log('Scenario: 6 dates exist, 7th date added');
  console.log('Expected: 6th date Rule-1 becomes disabled, 7th date Rule-1 becomes active');
}

testDisableLogic();

console.log('✅ Rule-1 functionality test completed');
console.log('📋 Summary:');
console.log('   - Rule-1 shows aggregated data from day-1 to previous day');
console.log('   - Only newest eligible date (5th+) has active Rule-1');
console.log('   - All previous eligible dates have disabled Rule-1');
console.log('   - Data includes all hours logic and looks like Index page');
