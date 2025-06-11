// Comprehensive test script to debug IndexPage ABCD/BCD color coding
// Run this in browser console after loading the application

console.log('🚀 COMPREHENSIVE INDEXPAGE DEBUG TEST');
console.log('=====================================');

// 1. Check localStorage for test data
function checkLocalStorageData() {
  console.log('📊 Step 1: Checking localStorage data...');
  
  const allKeys = Object.keys(localStorage);
  const userKeys = allKeys.filter(key => key.startsWith('dates_')).map(key => key.replace('dates_', ''));
  
  console.log('👥 Found users:', userKeys);
  
  if (userKeys.length === 0) {
    console.log('❌ No user data found in localStorage');
    console.log('💡 You need to:');
    console.log('   1. Navigate to the main page');
    console.log('   2. Select/create a user');
    console.log('   3. Upload Excel data for at least 4 dates');
    console.log('   4. Complete Hour Entry for those dates');
    return null;
  }
  
  // Use first user for testing
  const testUser = userKeys[0];
  console.log(`🎯 Testing with user: ${testUser}`);
  
  const datesKey = `dates_${testUser}`;
  const dates = JSON.parse(localStorage.getItem(datesKey) || '[]');
  console.log('📅 Available dates:', dates);
  
  if (dates.length < 4) {
    console.log(`❌ Not enough dates (${dates.length}/4 minimum needed)`);
    return null;
  }
  
  // Check data completeness for each date
  let completeDataDates = [];
  dates.forEach(date => {
    const excelKey = `excelData_${testUser}_${date}`;
    const hourKey = `hourEntry_${testUser}_${date}`;
    
    const excelData = localStorage.getItem(excelKey);
    const hourData = localStorage.getItem(hourKey);
    
    if (excelData && hourData) {
      completeDataDates.push(date);
      console.log(`✅ Complete data for ${date}`);
    } else {
      console.log(`❌ Incomplete data for ${date}`, {
        hasExcel: !!excelData,
        hasHour: !!hourData
      });
    }
  });
  
  if (completeDataDates.length < 4) {
    console.log(`❌ Not enough complete dates (${completeDataDates.length}/4)`);
    return null;
  }
  
  return { testUser, dates: completeDataDates };
}

// 2. Simulate navigation to IndexPage
function simulateIndexPageNavigation(testUser, dates) {
  console.log('🧭 Step 2: Simulating IndexPage navigation...');
  
  // Sort dates and pick the 4th one (so we have A, B, C, D)
  const sortedDates = dates.sort((a, b) => new Date(a) - new Date(b));
  const targetDate = sortedDates[3]; // 4th date (index 3)
  
  console.log(`🎯 Target date for IndexPage: ${targetDate}`);
  console.log(`📊 Window will be: A=${sortedDates[0]}, B=${sortedDates[1]}, C=${sortedDates[2]}, D=${sortedDates[3]}`);
  
  // Try to navigate programmatically
  const baseUrl = window.location.origin;
  const indexUrl = `${baseUrl}/user/${testUser}/index/${targetDate}`;
  
  console.log(`🔗 IndexPage URL: ${indexUrl}`);
  
  // Check if we're already on the right page
  if (window.location.href === indexUrl) {
    console.log('✅ Already on IndexPage');
    return true;
  }
  
  console.log('🚀 Navigating to IndexPage...');
  window.location.href = indexUrl;
  return false; // Will reload, so script will stop here
}

// 3. Test the DataService directly
async function testDataService(testUser, dates) {
  console.log('🔧 Step 3: Testing DataService directly...');
  
  // Try to access DataService from window (if available)
  if (window.DataService) {
    const dataService = new window.DataService();
    
    // Test data retrieval
    for (const date of dates.slice(0, 4)) {
      try {
        const excelData = await dataService.getExcelData(testUser, date);
        const hourData = await dataService.getHourEntry(testUser, date);
        
        console.log(`📊 DataService test for ${date}:`, {
          hasExcel: !!excelData,
          hasHour: !!hourData,
          excelSets: excelData?.data?.sets ? Object.keys(excelData.data.sets) : [],
          hourPlanets: hourData?.planetSelections ? Object.keys(hourData.planetSelections) : []
        });
      } catch (error) {
        console.error(`❌ DataService error for ${date}:`, error);
      }
    }
  } else {
    console.log('❌ DataService not available on window object');
  }
}

// 4. Run the comprehensive test
async function runComprehensiveTest() {
  const testData = checkLocalStorageData();
  
  if (!testData) {
    console.log('❌ Test aborted - insufficient data');
    return;
  }
  
  const { testUser, dates } = testData;
  
  // Test DataService if available
  await testDataService(testUser, dates);
  
  // Navigate to IndexPage
  const alreadyOnPage = simulateIndexPageNavigation(testUser, dates);
  
  if (alreadyOnPage) {
    console.log('🎉 Ready to test IndexPage functionality');
    console.log('👀 Watch console for ABCD-BCD analysis debug logs');
    console.log('📝 Look for logs starting with 🔍, 🧮, 🎯, 🎨');
  }
}

// Run the test
runComprehensiveTest().catch(console.error);
