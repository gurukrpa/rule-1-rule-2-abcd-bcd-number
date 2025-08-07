// Debug Hour 2 Data Loading Issue - Comprehensive Analysis
// ================================================================

console.log('🔍 [DEBUG] Investigating Hour 2 Data Loading Issue...\n');

// Function to check the data loading process for multiple hours
function debugHour2DataLoading() {
  console.log('📊 [Step 1] Check if hourTabsData is properly populated...');
  
  if (window.hourTabsData) {
    console.log('✅ hourTabsData exists');
    console.log('Available hours in hourTabsData:', Object.keys(window.hourTabsData));
    
    // Check specifically for HR-2
    if (window.hourTabsData[2]) {
      console.log('✅ HR-2 data exists in hourTabsData');
      const hr2Data = window.hourTabsData[2];
      
      console.log('HR-2 data structure:', {
        source: hr2Data.source,
        hrNumber: hr2Data.hrNumber,
        totalTopics: hr2Data.totalTopics,
        hasTopicNumbers: !!hr2Data.topicNumbers,
        topicCount: hr2Data.topicNumbers ? Object.keys(hr2Data.topicNumbers).length : 0
      });
      
      // Check D-1 Set-1 Matrix specifically
      if (hr2Data.topicNumbers && hr2Data.topicNumbers['D-1 Set-1 Matrix']) {
        const d1set1 = hr2Data.topicNumbers['D-1 Set-1 Matrix'];
        console.log('✅ HR-2 D-1 Set-1 Matrix found:', d1set1);
        console.log(`Expected: ABCD [1,4,5,6], BCD [2,9]`);
        console.log(`Actual: ABCD [${d1set1.abcd.join(',')}], BCD [${d1set1.bcd.join(',')}]`);
        
        const matches = JSON.stringify(d1set1.abcd.sort()) === JSON.stringify([1,4,5,6].sort()) &&
                       JSON.stringify(d1set1.bcd.sort()) === JSON.stringify([2,9].sort());
        
        console.log(`Data matches expected: ${matches ? '✅' : '❌'}`);
        
        if (!matches) {
          console.log('🔴 [ISSUE] HR-2 data does not match expected values from Rule-2 Compact Analysis');
        }
      } else {
        console.log('❌ D-1 Set-1 Matrix not found in HR-2 data');
      }
    } else {
      console.log('❌ HR-2 data NOT found in hourTabsData');
      console.log('🔍 This explains the "Hour 2 data not available" error');
    }
  } else {
    console.log('❌ hourTabsData does not exist');
  }
  
  console.log('\n📊 [Step 2] Check user information and HR count...');
  
  if (window.userInfo) {
    console.log('✅ userInfo exists');
    console.log('User HR count:', window.userInfo.hr);
    console.log('User ID:', window.userInfo.id);
    console.log('Username:', window.userInfo.username);
    
    if (window.userInfo.hr >= 2) {
      console.log('✅ User has HR-2 available');
    } else {
      console.log('❌ User only has HR-1 - this explains why HR-2 data is not available');
    }
  } else {
    console.log('❌ userInfo not found');
  }
  
  console.log('\n📊 [Step 3] Check data loading function...');
  
  if (window.loadAllAvailableData) {
    console.log('✅ loadAllAvailableData function exists');
    console.log('🔧 Manually triggering data reload...');
    
    // Try to reload data
    window.loadAllAvailableData().then(() => {
      console.log('✅ Data reload completed - check hourTabsData again');
      setTimeout(() => {
        if (window.hourTabsData[2]) {
          console.log('✅ HR-2 data now available after reload');
        } else {
          console.log('❌ HR-2 data still not available after reload');
          console.log('🔍 This indicates a deeper issue in the data loading process');
        }
      }, 2000);
    }).catch(error => {
      console.log('❌ Data reload failed:', error);
    });
  } else {
    console.log('❌ loadAllAvailableData function not available');
  }
  
  console.log('\n📊 [Step 4] Check PlanetsAnalysisDataService...');
  
  if (window.PlanetsAnalysisDataService) {
    console.log('✅ PlanetsAnalysisDataService available');
    
    // Try to get HR-2 data directly
    if (window.userInfo && window.userInfo.id) {
      console.log('🔧 Attempting to fetch HR-2 data directly...');
      
      const userId = window.userInfo.id;
      const testDates = ['2024-12-28', '2024-12-29', '2024-12-30', '2024-12-31'];
      
      window.PlanetsAnalysisDataService.getLatestAnalysisNumbers(userId, testDates, 2)
        .then(result => {
          console.log('✅ Direct HR-2 fetch result:', result);
          
          if (result.success) {
            console.log('✅ HR-2 data successfully fetched');
            
            if (result.data.topicNumbers && result.data.topicNumbers['D-1 Set-1 Matrix']) {
              const d1set1 = result.data.topicNumbers['D-1 Set-1 Matrix'];
              console.log('✅ HR-2 D-1 Set-1 Matrix from service:', d1set1);
            }
          } else {
            console.log('❌ HR-2 data fetch failed:', result.error);
          }
        })
        .catch(error => {
          console.log('❌ Direct HR-2 fetch error:', error);
        });
    }
  } else {
    console.log('❌ PlanetsAnalysisDataService not available');
  }
}

// Function to check the current state and suggest fixes
function suggestHour2Fixes() {
  console.log('\n🔧 [FIXES] Suggested solutions for Hour 2 data issue:\n');
  
  console.log('1. 📊 Check if user has multiple hours:');
  console.log('   - User must have hr >= 2 in their profile');
  console.log('   - Check database user table for correct hr value');
  
  console.log('\n2. 🔄 Verify data loading process:');
  console.log('   - loadAllAvailableData() should fetch data for all available hours');
  console.log('   - Check if PlanetsAnalysisDataService.getLatestAnalysisNumbers() is called for each hour');
  
  console.log('\n3. 📅 Check available dates:');
  console.log('   - User must have analysis data for multiple dates');
  console.log('   - Check localStorage or CleanSupabaseService for available dates');
  
  console.log('\n4. 🎯 Verify Rule-2 analysis data:');
  console.log('   - Check if Rule-2 Compact Analysis has been run for this user');
  console.log('   - Verify that hour-specific analysis results exist');
  
  console.log('\n5. 🔧 Manual fixes to try:');
  console.log('   - window.loadAllAvailableData() - Reload all data');
  console.log('   - window.handleHourChange(2) - Force switch to HR-2');
  console.log('   - Check browser console for error messages');
}

// Main diagnostic function
function diagnoseHour2Issue() {
  console.log('🎯 [HOUR 2 DATA ISSUE] Comprehensive Diagnosis\n');
  console.log('===========================================\n');
  
  console.log('📋 [PROBLEM] Hour 2 shows "data not available" but planet headers show Hour 1 data');
  console.log('📋 [EXPECTED] Hour 2 should show ABCD [1,4,5,6], BCD [2,9] for D-1 Set-1 Matrix');
  console.log('📋 [ACTUAL] Hour 2 shows ABCD [1,2,4,7,9], BCD [5] (same as Hour 1)\n');
  
  debugHour2DataLoading();
  suggestHour2Fixes();
}

// Auto-run the diagnostic
diagnoseHour2Issue();

// Export for manual testing
window.debugHour2Issue = {
  diagnoseHour2Issue,
  debugHour2DataLoading,
  suggestHour2Fixes
};

console.log('\n🔧 [NEXT STEPS]');
console.log('1. Check if user profile has hr >= 2');
console.log('2. Verify that Rule-2 analysis has been run for multiple hours');
console.log('3. Check data loading logic in loadAllAvailableData()');
console.log('4. Ensure hourTabsData is populated for all available hours');
