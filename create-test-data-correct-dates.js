// 🎯 Create Test Data for ACTUAL Application Dates
// Based on the ABCD sequence: A(02/06/2025) → B(03/06/2025) → C(04/06/2025) → D(05/06/2025)

console.log('🎯 Creating Test Data for ACTUAL Application Dates');
console.log('=================================================');

function createTestDataForActualDates() {
  // Check for existing user ID or create a new one
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'test-user-' + Date.now();
    localStorage.setItem('userId', userId);
    console.log('👤 Created new user ID:', userId);
  } else {
    console.log('👤 Using existing user ID:', userId);
  }
  
  // ACTUAL dates from the application 
  const aDay = '2025-06-02';  // A-day: 02/06/2025
  const bDay = '2025-06-03';  // B-day: 03/06/2025  
  const cDay = '2025-06-04';  // C-day: 04/06/2025
  const dDay = '2025-06-05';  // D-day: 05/06/2025
  
  console.log('📅 Creating data for ACTUAL application dates:');
  console.log(`   A-day: ${aDay}`);
  console.log(`   B-day: ${bDay}`);
  console.log(`   C-day: ${cDay}`);
  console.log(`   D-day: ${dDay}`);
  
  // Create realistic Excel data structure
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
        },
        'D-3 (trd) Set-2 Matrix': {
          'element1': { 'Sun': `ar-${dayNumbers[14]}/ve-90`, 'Moon': `le-${dayNumbers[15]}/ju-95` },
          'element2': { 'Sun': `sg-${dayNumbers[16]}/sa-100`, 'Moon': `aq-${dayNumbers[17]}/me-105` }
        },
        'D-4 Set-1 Matrix': {
          'element1': { 'Sun': `ta-${dayNumbers[18]}/ma-110`, 'Moon': `vi-${dayNumbers[19]}/ur-115` },
          'element2': { 'Sun': `cp-${dayNumbers[20]}/ne-120`, 'Moon': `pi-${dayNumbers[21]}/pl-125` }
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
    [aDay]: [1, 2, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110],  // A-day numbers
    [bDay]: [1, 3, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96, 101, 106, 111],  // B-day numbers  
    [cDay]: [2, 4, 17, 22, 27, 32, 37, 42, 47, 52, 57, 62, 67, 72, 77, 82, 87, 92, 97, 102, 107, 112],  // C-day numbers
    [dDay]: [1, 2, 3, 4, 5, 18, 23, 28, 33, 38, 43, 48, 53, 58, 63, 68, 73, 78, 83, 88, 93, 98]       // D-day numbers
  };
  
  // Store test data for each day
  const dates = [aDay, bDay, cDay, dDay];
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
  
  console.log('\n🚀 TEST DATA READY FOR ACTUAL APPLICATION DATES!');
  console.log('=================================================');
  console.log('1. Refresh the Rule2CompactPage');
  console.log('2. Try Rule2 analysis with these dates');
  console.log('3. You should now see ABCD/BCD results instead of "No D-day numbers found"');
  console.log(`4. Analysis dates: A=${aDay}, B=${bDay}, C=${cDay}, D=${dDay}`);
  
  return { 
    userId, 
    dates: { aDay, bDay, cDay, dDay }, 
    expected: { abcd: expectedABCD, bcd: expectedBCD }
  };
}

// Run the function
createTestDataForActualDates();
