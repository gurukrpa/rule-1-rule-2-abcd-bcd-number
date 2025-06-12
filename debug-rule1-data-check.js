// Debug script to check Rule-1 data availability
// Run this in browser console to debug Rule-1 data issues

console.log('🔍 RULE-1 DATA DEBUG CHECKER');
console.log('===============================');

// Check localStorage data
function checkLocalStorageData() {
  console.log('📊 Checking localStorage data...');
  
  const userKeys = Object.keys(localStorage).filter(key => key.startsWith('dates_')).map(key => key.replace('dates_', ''));
  console.log('👥 Found users:', userKeys);
  
  if (userKeys.length === 0) {
    console.log('❌ No user data found');
    return null;
  }
  
  const testUser = userKeys[0];
  console.log(`🎯 Testing with user: ${testUser}`);
  
  const datesKey = `dates_${testUser}`;
  const dates = JSON.parse(localStorage.getItem(datesKey) || '[]');
  console.log('📅 Available dates:', dates);
  
  if (dates.length < 5) {
    console.log(`❌ Not enough dates for Rule-1 (${dates.length}/5 minimum)`);
    return { testUser, dates, insufficient: true };
  }
  
  // Check data for each date
  console.log('🔍 Checking data completeness:');
  const dataStatus = [];
  
  dates.forEach((date, index) => {
    const excelKey = `abcd_excelData_${testUser}_${date}`;
    const hourKey = `abcd_hourEntry_${testUser}_${date}`;
    
    const excelData = localStorage.getItem(excelKey);
    const hourData = localStorage.getItem(hourKey);
    
    const status = {
      date,
      index: index + 1,
      hasExcel: !!excelData,
      hasHour: !!hourData,
      complete: !!(excelData && hourData)
    };
    
    if (hourData) {
      try {
        const parsed = JSON.parse(hourData);
        status.hrCount = parsed.planetSelections ? Object.keys(parsed.planetSelections).length : 0;
        status.hrNumbers = parsed.planetSelections ? Object.keys(parsed.planetSelections) : [];
      } catch (e) {
        status.hourParseError = e.message;
      }
    }
    
    dataStatus.push(status);
    
    console.log(`${status.index}. ${date}: Excel=${status.hasExcel ? '✅' : '❌'} Hour=${status.hasHour ? '✅' : '❌'} HRs=${status.hrNumbers?.join(',') || 'none'}`);
  });
  
  return { testUser, dates, dataStatus, insufficient: false };
}

// Test DataService functionality
async function testDataService(testUser, dates) {
  console.log('🔧 Testing DataService...');
  
  // Check if DataService is available
  if (!window.DataService) {
    console.log('❌ DataService not available in window');
    return false;
  }
  
  const dataService = new DataService();
  
  // Test with the 5th date (index 4)
  if (dates.length >= 5) {
    const testDate = dates[4];
    console.log(`🎯 Testing DataService with 5th date: ${testDate}`);
    
    try {
      const excelData = await dataService.getExcelData(testUser, testDate);
      const hourData = await dataService.getHourEntry(testUser, testDate);
      
      console.log('📊 DataService results:', {
        hasExcel: !!excelData,
        hasHour: !!hourData,
        excelSets: excelData?.data?.sets ? Object.keys(excelData.data.sets) : [],
        hourSelections: hourData?.planetSelections ? Object.keys(hourData.planetSelections) : []
      });
      
      return { excelData, hourData };
    } catch (error) {
      console.error('❌ DataService error:', error);
      return false;
    }
  }
  
  return false;
}

// Simulate Rule-1 navigation
function simulateRule1Navigation(testUser, dates) {
  console.log('🚀 Simulating Rule-1 navigation...');
  
  if (dates.length < 5) {
    console.log('❌ Cannot navigate to Rule-1 - insufficient dates');
    return false;
  }
  
  const targetDate = dates[4]; // 5th date
  const baseUrl = window.location.origin;
  const rule1Url = `${baseUrl}/user/${testUser}/rule1/${targetDate}`;
  
  console.log(`🔗 Rule-1 URL: ${rule1Url}`);
  
  // Check if we're already on Rule-1 page
  if (window.location.href === rule1Url) {
    console.log('✅ Already on Rule-1 page');
    return true;
  }
  
  console.log('🧭 Navigate to Rule-1 page manually or use:');
  console.log(`window.location.href = "${rule1Url}"`);
  
  return false;
}

// Main debug function
async function debugRule1Data() {
  const dataCheck = checkLocalStorageData();
  
  if (!dataCheck) {
    console.log('❌ Debug aborted - no data available');
    return;
  }
  
  const { testUser, dates, dataStatus, insufficient } = dataCheck;
  
  if (insufficient) {
    console.log('❌ Cannot test Rule-1 - need at least 5 dates');
    console.log('💡 Add more dates with Excel and Hour Entry data first');
    return;
  }
  
  // Test DataService
  const serviceTest = await testDataService(testUser, dates);
  
  // Check Rule-1 requirements
  console.log('🎯 Rule-1 Requirements Check:');
  console.log(`   • Need: 5+ dates (Have: ${dates.length}) ${dates.length >= 5 ? '✅' : '❌'}`);
  console.log(`   • 5th date: ${dates[4]} ${dataStatus[4]?.complete ? '✅' : '❌'}`);
  
  if (dates.length >= 6) {
    console.log(`   • 6th date: ${dates[5]} ${dataStatus[5]?.complete ? '✅' : '❌'}`);
  }
  
  // Provide navigation suggestion
  if (dates.length >= 5 && dataStatus[4]?.complete) {
    console.log('🎉 Rule-1 should work!');
    simulateRule1Navigation(testUser, dates);
  } else {
    console.log('⚠️ Rule-1 may have issues');
    console.log('📝 Fix missing data first');
  }
}

// Run the debug
debugRule1Data().catch(console.error);
