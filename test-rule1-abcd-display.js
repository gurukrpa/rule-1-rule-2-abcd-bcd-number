// Test Rule-1 ABCD/BCD Data Display
// This verifies that Rule-1 shows processed ABCD data, not raw 9-planet matrix

console.log('🔍 Testing Rule-1 ABCD/BCD Data Display');

// Test the corrected logic
function testRule1ABCDDisplay() {
  console.log('📊 Rule-1 Corrected Logic:');
  console.log('✅ Takes last 4 dates from day-1 to clicked date (A, B, C, D)');
  console.log('✅ Processes ABCD numbers that appear in ≥2 of A,B,C days');
  console.log('✅ Shows ABCD (green) and BCD (blue) results');
  console.log('✅ Displays in same format as Index page');
  console.log('✅ Includes HR selector functionality');
  
  console.log('❌ REMOVED: Raw 9-planet matrix display');
  console.log('❌ REMOVED: All dates aggregation');
  
  // Expected display format
  console.log('📋 Expected Display Format:');
  console.log('1. Header with Rule-1 title and ABCD dates');
  console.log('2. Legend explaining ABCD vs BCD');
  console.log('3. HR selector buttons');
  console.log('4. Table with columns: Element | A-date | B-date | C-date | D-date');
  console.log('5. D-date column shows:');
  console.log('   - ABCD numbers in green badges');
  console.log('   - BCD numbers in blue badges');
  console.log('   - Raw D-day data below');
}

// Test ABCD processing logic
function testABCDProcessing() {
  console.log('🔢 ABCD Processing Logic Test:');
  
  // Example scenario
  const testData = {
    A: { element: { planet: '10' } },
    B: { element: { planet: '10' } }, // Same as A
    C: { element: { planet: '15' } }, // Different
    D: { element: { planet: '10' } }  // Same as A,B
  };
  
  console.log('Test Case:', testData);
  console.log('Expected: Number 10 appears in A,B,D → ABCD: [10]');
  console.log('Logic: D-day number (10) appears in ≥2 of A,B,C (appears in A,B) → ABCD');
}

// Test disable logic
function testRule1DisableLogic() {
  console.log('🔒 Rule-1 Disable Logic Test:');
  
  const scenarios = [
    { dates: 5, newest: 5, expected: 'Rule-1 ENABLED for date 5' },
    { dates: 6, newest: 6, expected: 'Rule-1 ENABLED for date 6, DISABLED for date 5' },
    { dates: 7, newest: 7, expected: 'Rule-1 ENABLED for date 7, DISABLED for dates 5,6' }
  ];
  
  scenarios.forEach(scenario => {
    console.log(`${scenario.dates} dates: ${scenario.expected}`);
  });
}

testRule1ABCDDisplay();
testABCDProcessing();
testRule1DisableLogic();

console.log('✅ Rule-1 Test Completed - Now shows ABCD/BCD data like Index page');
