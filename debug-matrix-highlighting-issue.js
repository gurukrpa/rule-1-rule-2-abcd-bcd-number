// Debug Matrix Highlighting Issue
// This script analyzes the data flow between Rule-1 clicked numbers and Matrix highlighting

console.log('🔍 Starting Matrix Highlighting Debug Analysis...');

// Test case: User clicked 8, 10 in Rule-1 but matrix shows 5, 12, 9 highlighted

const testCases = {
  rule1ClickedNumbers: [8, 10], // From Rule-1 page
  expectedMatrixHighlight: [8, 10], // What should be highlighted in matrix
  actualMatrixHighlight: [5, 12, 9], // What is currently highlighted (WRONG)
  targetDate: '2025-08-18',
  targetHour: 1,
  targetTopic: 'D-1 Set-1'
};

console.log('📊 Test Case Analysis:', testCases);

// Simulate the data flow to identify the issue
const simulateDataFlow = () => {
  console.log('\n🔄 Simulating Data Flow...');
  
  // Step 1: Rule-1 page saves clicked numbers to database
  console.log('Step 1: Rule-1 saves to database');
  const databaseSave = {
    user_id: 'sing maya',
    topic_name: testCases.targetTopic,
    date_key: testCases.targetDate,
    clicked_number: testCases.rule1ClickedNumbers, // Should save [8, 10]
    hour: testCases.targetHour
  };
  console.log('  Database save operation:', databaseSave);
  
  // Step 2: CrossPageSyncService retrieves data
  console.log('\nStep 2: CrossPageSyncService retrieves data');
  const mockDatabaseData = [
    {
      user_id: 'sing maya',
      topic_name: 'D-1 Set-1',
      date_key: '2025-08-18',
      clicked_number: 8, // Individual records
      hour: 1,
      created_at: '2025-08-18T10:00:00Z'
    },
    {
      user_id: 'sing maya', 
      topic_name: 'D-1 Set-1',
      date_key: '2025-08-18',
      clicked_number: 10, // Individual records
      hour: 1,
      created_at: '2025-08-18T10:01:00Z'
    }
  ];
  console.log('  Retrieved from database:', mockDatabaseData);
  
  // Step 3: Organize data in CrossPageSyncService
  console.log('\nStep 3: CrossPageSyncService organizes data');
  const organizedData = {
    '2025-08-18': {
      'D-1 Set-1': {
        clickedNumbers: [8, 10], // Should be correct
        abcdNumbers: [3, 6, 8, 10], // From analysis
        bcdNumbers: [2], // From analysis
        hour: 1
      }
    }
  };
  console.log('  Organized sync data:', organizedData);
  
  // Step 4: PlanetsAnalysis receives sync data
  console.log('\nStep 4: PlanetsAnalysis applies sync data');
  const planetsAnalysisSync = {
    syncData: organizedData,
    selectedDate: '2025-08-18',
    selectedHour: 1
  };
  console.log('  PlanetsAnalysis sync state:', planetsAnalysisSync);
  
  // Step 5: Matrix highlighting logic
  console.log('\nStep 5: Matrix highlighting logic');
  const matrixCells = [
    { topicName: 'D-1 Set-1', rawData: 'as-5-Cp', planetName: 'Su' },
    { topicName: 'D-1 Set-1', rawData: 'mo-12-Ge', planetName: 'Mo' },
    { topicName: 'D-1 Set-1', rawData: 'hl-9-Cn', planetName: 'Ra' },
    { topicName: 'D-1 Set-1', rawData: 'as-8-Cp', planetName: 'Ve' }, // Should highlight
    { topicName: 'D-1 Set-1', rawData: 'mo-10-Ge', planetName: 'Sa' } // Should highlight
  ];
  
  console.log('  Matrix cells to check:');
  matrixCells.forEach(cell => {
    const extractedNumber = extractElementNumber(cell.rawData);
    const isInSyncData = organizedData['2025-08-18']['D-1 Set-1'].clickedNumbers.includes(extractedNumber);
    const shouldHighlight = isInSyncData;
    
    console.log(`    ${cell.planetName}: ${cell.rawData} → number ${extractedNumber} → highlight: ${shouldHighlight}`);
  });
  
  return {
    organizedData,
    matrixCells
  };
};

// Extract number function (same as in PlanetsAnalysisPage)
const extractElementNumber = (str) => {
  if (typeof str !== 'string') return null;
  const match = str.match(/^[a-z]+-(\d+)/);
  return match ? Number(match[1]) : null;
};

// Run the simulation
const simulation = simulateDataFlow();

console.log('\n🎯 ISSUE ANALYSIS:');
console.log('Expected: Numbers 8, 10 should be highlighted');
console.log('Actual: Numbers 5, 12, 9 are highlighted');
console.log('\nPOSSIBLE CAUSES:');
console.log('1. Wrong data being saved to database from Rule-1');
console.log('2. CrossPageSyncService organizing data incorrectly');
console.log('3. Date/Hour mismatch between Rule-1 and PlanetsAnalysis');
console.log('4. Local clicking state interfering with sync state');
console.log('5. Multiple records with different numbers for same topic/date');

console.log('\n🔧 DEBUGGING STEPS:');
console.log('1. Check database records for user "sing maya" on 2025-08-18');
console.log('2. Verify CrossPageSyncService.getAllClickedNumbers() output');
console.log('3. Check PlanetsAnalysis sync state and local click state');
console.log('4. Verify extractElementNumber() works correctly');
console.log('5. Check if multiple hours or topics are mixing data');

console.log('\n✅ Debug analysis complete!');
