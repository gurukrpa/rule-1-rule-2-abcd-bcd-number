// 🧪 Test Data Generator for ABCD/BCD Analysis
// This creates realistic test data to demonstrate the enhanced ABCD/BCD logic

console.log('🧪 CREATING TEST DATA FOR ABCD/BCD ANALYSIS');
console.log('============================================\n');

// Function to create test data
function createTestData() {
  const userId = 'test-user-' + Date.now();
  localStorage.setItem('userId', userId);
  
  console.log('👤 Created user ID:', userId);
  
  // Create test dates (4 consecutive days for A, B, C, D sequence)
  const today = new Date();
  const dates = [];
  for (let i = 3; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  const [aDay, bDay, cDay, dDay] = dates;
  console.log('📅 Test dates:', { aDay, bDay, cDay, dDay });
  
  // Create realistic Excel data for each day
  const createExcelData = (dayNumbers) => ({
    data: {
      sets: {
        'D-1 Set-1 Matrix': {
          'element1': { 'Sun': `as-${dayNumbers[0]}/su-20`, 'Moon': `mo-${dayNumbers[1]}/ve-25` },
          'element2': { 'Sun': `li-${dayNumbers[2]}/ma-30`, 'Moon': `ar-${dayNumbers[3]}/ju-35` },
          'element3': { 'Sun': `vi-${dayNumbers[4]}/sa-40`, 'Moon': `le-${dayNumbers[5]}/me-45` }
        },
        'D-1 Set-2 Matrix': {
          'element1': { 'Sun': `sc-${dayNumbers[6]}/ur-50`, 'Moon': `sg-${dayNumbers[7]}/ne-55` },
          'element2': { 'Sun': `cp-${dayNumbers[8]}/pl-60`, 'Moon': `aq-${dayNumbers[9]}/ra-65` }
        },
        'D-3 (trd) Set-1 Matrix': {
          'element1': { 'Sun': `pi-${dayNumbers[10]}/ke-70`, 'Moon': `ta-${dayNumbers[11]}/su-75` },
          'element2': { 'Sun': `ge-${dayNumbers[12]}/mo-80`, 'Moon': `ca-${dayNumbers[13]}/ma-85` }
        }
      }
    }
  });
  
  // Create hour data
  const createHourData = () => ({
    planetSelections: { 
      '1': 'Sun', 
      '2': 'Moon',
      '3': 'Sun',
      '4': 'Moon' 
    }
  });
  
  // Test scenario: Design data to produce specific ABCD/BCD results
  const testScenarios = {
    [aDay]: [1, 2, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],  // A-day numbers
    [bDay]: [1, 3, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71],  // B-day numbers  
    [cDay]: [2, 4, 17, 22, 27, 32, 37, 42, 47, 52, 57, 62, 67, 72],  // C-day numbers
    [dDay]: [1, 2, 3, 4, 5, 18, 23, 28, 33, 38, 43, 48, 53, 58]     // D-day numbers
  };
  
  // Store test data for each day
  dates.forEach(date => {
    const excelKey = `${userId}_excel_${date}`;
    const hourKey = `${userId}_hour_${date}`;
    
    const excelData = createExcelData(testScenarios[date]);
    const hourData = createHourData();
    
    localStorage.setItem(excelKey, JSON.stringify(excelData));
    localStorage.setItem(hourKey, JSON.stringify(hourData));
    
    console.log(`✅ Created data for ${date}`);
  });
  
  // Analyze what ABCD/BCD results we should expect
  console.log('\n🎯 EXPECTED ABCD/BCD RESULTS:');
  console.log('=============================');
  
  const dDayNumbers = testScenarios[dDay];
  const aDayNumbers = testScenarios[aDay];
  const bDayNumbers = testScenarios[bDay];
  const cDayNumbers = testScenarios[cDay];
  
  console.log('Input numbers:');
  console.log(`D-day: [${dDayNumbers.join(', ')}]`);
  console.log(`A-day: [${aDayNumbers.join(', ')}]`);
  console.log(`B-day: [${bDayNumbers.join(', ')}]`);
  console.log(`C-day: [${cDayNumbers.join(', ')}]`);
  
  // Manual calculation for verification
  const expectedABCD = [];
  const expectedBCD = [];
  
  dDayNumbers.forEach(num => {
    const inA = aDayNumbers.includes(num);
    const inB = bDayNumbers.includes(num);
    const inC = cDayNumbers.includes(num);
    
    const abcCount = [inA, inB, inC].filter(Boolean).length;
    
    if (abcCount >= 2) {
      expectedABCD.push(num);
    } else {
      const bdPairOnly = inB && !inC;
      const cdPairOnly = inC && !inB;
      if (bdPairOnly || cdPairOnly) {
        expectedBCD.push(num);
      }
    }
  });
  
  console.log('\nExpected results:');
  console.log(`✅ ABCD: [${expectedABCD.join(', ')}]`);
  console.log(`✅ BCD: [${expectedBCD.join(', ')}]`);
  
  console.log('\n🚀 TEST DATA READY!');
  console.log('===================');
  console.log('1. Refresh the page');
  console.log('2. Try Rule2CompactPage analysis');
  console.log('3. You should see the expected ABCD/BCD results above');
  console.log(`4. Use dates: A=${aDay}, B=${bDay}, C=${cDay}, D=${dDay}`);
  
  return { userId, dates: { aDay, bDay, cDay, dDay }, expected: { abcd: expectedABCD, bcd: expectedBCD } };
}

// Create the test data
const result = createTestData();
console.log('\n📋 Test data creation complete:', result);
