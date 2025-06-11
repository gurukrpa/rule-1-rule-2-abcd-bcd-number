// Simple test to debug ABCD/BCD analysis directly
// Run this in browser console after navigating to a user page

console.log('🧪 SIMPLE ABCD/BCD ANALYSIS TEST');
console.log('================================');

// Test the DataService and analysis logic directly
async function testAbcdAnalysisDirectly() {
  // Check if we have any user data
  const allKeys = Object.keys(localStorage);
  const userKeys = allKeys.filter(key => key.startsWith('dates_')).map(key => key.replace('dates_', ''));
  
  if (userKeys.length === 0) {
    console.log('❌ No user data found');
    return;
  }
  
  const testUser = userKeys[0];
  const datesKey = `dates_${testUser}`;
  const dates = JSON.parse(localStorage.getItem(datesKey) || '[]');
  
  console.log(`👤 Test user: ${testUser}`);
  console.log(`📅 Available dates: ${dates}`);
  
  if (dates.length < 4) {
    console.log('❌ Need at least 4 dates for analysis');
    return;
  }
  
  // Sort dates and take first 4 as A, B, C, D
  const sortedDates = dates.sort((a, b) => new Date(a) - new Date(b));
  const [aDay, bDay, cDay, dDay] = sortedDates.slice(0, 4);
  
  console.log(`🎯 Test dates: A=${aDay}, B=${bDay}, C=${cDay}, D=${dDay}`);
  
  // Create DataService instance (simulate what IndexPage does)
  class TestDataService {
    async getExcelData(userId, date) {
      const key = `excelData_${userId}_${date}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
    
    async getHourEntry(userId, date) {
      const key = `hourEntry_${userId}_${date}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  }
  
  const dataService = new TestDataService();
  
  // Test data retrieval for each date
  console.log('📊 Testing data retrieval...');
  for (const date of [aDay, bDay, cDay, dDay]) {
    const excelData = await dataService.getExcelData(testUser, date);
    const hourData = await dataService.getHourEntry(testUser, date);
    
    console.log(`Data for ${date}:`, {
      hasExcel: !!excelData,
      hasHour: !!hourData,
      excelSets: excelData?.data?.sets ? Object.keys(excelData.data.sets) : [],
      hourEntries: hourData?.planetSelections ? Object.keys(hourData.planetSelections) : []
    });
  }
  
  // Test element number extraction
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
    return match ? Number(match[1]) : null;
  };
  
  // Test number extraction for one set
  const extractFromDateAndSet = async (targetDate, setName, hrNumber) => {
    try {
      const excelData = await dataService.getExcelData(testUser, targetDate);
      const hourData = await dataService.getHourEntry(testUser, targetDate);
      
      if (!excelData || !hourData) return [];
      
      const sets = excelData.data?.sets || {};
      const planetSelections = hourData.planetSelections || {};
      
      const allNumbers = new Set();
      const setData = sets[setName];
      if (setData) {
        const selectedPlanet = planetSelections[hrNumber];
        if (selectedPlanet) {
          Object.entries(setData).forEach(([elementName, planetData]) => {
            const rawString = planetData[selectedPlanet];
            if (rawString) {
              const elementNumber = extractElementNumber(rawString);
              if (elementNumber !== null) {
                allNumbers.add(elementNumber);
              }
            }
          });
        }
      }
      return Array.from(allNumbers).sort((a, b) => a - b);
    } catch (e) {
      console.error('Error extracting from date and set:', e);
      return [];
    }
  };
  
  // Get first available set and HR
  const dDayExcel = await dataService.getExcelData(testUser, dDay);
  const dDayHour = await dataService.getHourEntry(testUser, dDay);
  
  if (!dDayExcel || !dDayHour) {
    console.log('❌ Missing D-day data');
    return;
  }
  
  const availableSets = Object.keys(dDayExcel.data?.sets || {});
  const availableHRs = Object.keys(dDayHour.planetSelections || {});
  
  if (availableSets.length === 0 || availableHRs.length === 0) {
    console.log('❌ No sets or HRs available');
    return;
  }
  
  const testSet = availableSets[0];
  const testHR = availableHRs[0];
  
  console.log(`🧪 Testing with set="${testSet}" and HR="${testHR}"`);
  
  // Extract numbers for all days
  console.log('🔢 Extracting numbers...');
  const aNums = await extractFromDateAndSet(aDay, testSet, testHR);
  const bNums = await extractFromDateAndSet(bDay, testSet, testHR);
  const cNums = await extractFromDateAndSet(cDay, testSet, testHR);
  const dNums = await extractFromDateAndSet(dDay, testSet, testHR);
  
  console.log('📊 Extracted numbers:', {
    A: aNums,
    B: bNums,
    C: cNums,
    D: dNums
  });
  
  if (dNums.length === 0) {
    console.log('❌ No D-day numbers to analyze');
    return;
  }
  
  // Perform ABCD analysis
  const abcdCandidates = dNums.filter(num => {
    let count = 0;
    if (aNums.includes(num)) count++;
    if (bNums.includes(num)) count++;
    if (cNums.includes(num)) count++;
    return count >= 2;
  });
  
  // Perform BCD analysis
  const bcdCandidates = dNums.filter(num => {
    const inB = bNums.includes(num);
    const inC = cNums.includes(num);
    const bdPairOnly = inB && !inC;
    const cdPairOnly = inC && !inB;
    return bdPairOnly || cdPairOnly;
  });
  
  // Apply mutual exclusivity
  const abcdNumbers = abcdCandidates;
  const bcdNumbers = bcdCandidates.filter(num => !abcdCandidates.includes(num));
  
  console.log('🎯 ANALYSIS RESULTS:');
  console.log('===================');
  console.log(`ABCD candidates: ${abcdCandidates}`);
  console.log(`BCD candidates: ${bcdCandidates}`);
  console.log(`Final ABCD: ${abcdNumbers}`);
  console.log(`Final BCD: ${bcdNumbers}`);
  
  if (abcdNumbers.length > 0 || bcdNumbers.length > 0) {
    console.log('✅ Analysis found matches! The logic is working.');
    console.log('🎨 The issue might be in the rendering or state management.');
  } else {
    console.log('⚠️ No matches found. This could be expected or indicate an issue.');
    console.log('💡 Try with different sets/HRs or check if data has suitable patterns.');
  }
  
  return {
    testSet,
    testHR,
    numbers: { A: aNums, B: bNums, C: cNums, D: dNums },
    results: { abcdNumbers, bcdNumbers }
  };
}

// Run the test
testAbcdAnalysisDirectly().then(result => {
  if (result) {
    console.log('🎉 Test completed successfully');
    console.log('📋 Test result saved to window.testResult');
    window.testResult = result;
  }
}).catch(console.error);
