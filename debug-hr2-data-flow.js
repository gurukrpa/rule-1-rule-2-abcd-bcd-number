// 🔍 HR-2 Data Flow Debug Script - Identify Exact Mismatch
// This script traces where the HR-2 data diverges from Rule-2 Compact Analysis

console.log('🚀 Starting HR-2 Data Flow Analysis...');

// Expected data from Rule-2 Compact Analysis HR-2
const expectedHR2Data = {
  'D-1 Set-1 Matrix': { abcd: [1,4,5,6], bcd: [2,9] },
  'D-1 Set-2 Matrix': { abcd: [3,5,7,9,10], bcd: [12] },
  'D-3 Set-1 Matrix': { abcd: [1,2,5,7,9], bcd: [8,10] },
  'D-3 Set-2 Matrix': { abcd: [2,3,6,7,8,10], bcd: [5] },
  'D-4 Set-1 Matrix': { abcd: [2,4,7,8,12], bcd: [] },
  'D-4 Set-2 Matrix': { abcd: [2,10], bcd: [4] },
  'D-5 Set-1 Matrix': { abcd: [1,4,7,8], bcd: [11,12] },
  'D-5 Set-2 Matrix': { abcd: [2,4,8,10,12], bcd: [5,7] }
};

// Function to check PlanetsAnalysisDataService.getLatestAnalysisNumbers output
async function checkPlanetsAnalysisService() {
  console.log('🔍 [Debug] Checking PlanetsAnalysisDataService HR-2 output...');
  
  try {
    // Try to access the service that Planets Analysis page uses
    if (window.PlanetsAnalysisDataService) {
      console.log('✅ [Debug] PlanetsAnalysisDataService found');
      
      // This is what the Planets Analysis page calls to get HR-2 data
      // We need to check if this returns the same data as Rule-2 Compact Analysis
      console.log('🎯 [Debug] The issue is likely in PlanetsAnalysisDataService.getLatestAnalysisNumbers()');
      console.log('📊 [Debug] This service should return the same data as Rule-2 Compact Analysis but for specific hours');
      
    } else {
      console.log('❌ [Debug] PlanetsAnalysisDataService not available in window');
    }
  } catch (error) {
    console.error('❌ [Debug] Error checking PlanetsAnalysisDataService:', error);
  }
}

// Function to compare actual vs expected for a specific topic
function compareTopicData(topicName, actual, expected) {
  console.log(`\n🔍 [${topicName}] Comparison:`);
  console.log(`Expected ABCD: [${expected.abcd.join(',')}]`);
  console.log(`Actual ABCD:   [${actual.abcd.join(',')}]`);
  console.log(`Expected BCD:  [${expected.bcd.join(',')}]`);
  console.log(`Actual BCD:    [${actual.bcd.join(',')}]`);
  
  const abcdMatch = JSON.stringify(actual.abcd) === JSON.stringify(expected.abcd);
  const bcdMatch = JSON.stringify(actual.bcd) === JSON.stringify(expected.bcd);
  
  if (abcdMatch && bcdMatch) {
    console.log(`✅ [${topicName}] MATCH - Data is correct`);
    return true;
  } else {
    console.log(`❌ [${topicName}] MISMATCH - Data differs from Rule-2 Compact Analysis`);
    if (!abcdMatch) console.log(`   🔴 ABCD mismatch`);
    if (!bcdMatch) console.log(`   🔴 BCD mismatch`);
    return false;
  }
}

// Function to check hourTabsData specifically
function checkHourTabsData() {
  console.log('\n🔍 [Debug] Checking hourTabsData for HR-2...');
  
  if (window.hourTabsData && window.hourTabsData[2]) {
    const hr2Data = window.hourTabsData[2];
    console.log('✅ [Debug] HR-2 data found in hourTabsData');
    console.log('📊 [Debug] HR-2 hourTabsData structure:', {
      hasTopicNumbers: !!hr2Data.topicNumbers,
      topicCount: hr2Data.topicNumbers ? Object.keys(hr2Data.topicNumbers).length : 0,
      sampleTopic: hr2Data.topicNumbers ? Object.keys(hr2Data.topicNumbers)[0] : 'none'
    });
    
    if (hr2Data.topicNumbers) {
      console.log('\n📊 [Debug] Comparing all topics in HR-2 data...');
      let matches = 0;
      let total = 0;
      
      Object.keys(expectedHR2Data).forEach(topicName => {
        if (hr2Data.topicNumbers[topicName]) {
          total++;
          const isMatch = compareTopicData(topicName, hr2Data.topicNumbers[topicName], expectedHR2Data[topicName]);
          if (isMatch) matches++;
        } else {
          console.log(`❌ [${topicName}] NOT FOUND in HR-2 hourTabsData`);
        }
      });
      
      console.log(`\n📊 [Summary] ${matches}/${total} topics match expected HR-2 data`);
      
      if (matches < total) {
        console.log('🎯 [Root Cause] HR-2 data in hourTabsData does NOT match Rule-2 Compact Analysis');
        console.log('🔍 [Next Step] Check how PlanetsAnalysisDataService.getLatestAnalysisNumbers() is called for HR-2');
      }
    }
  } else {
    console.log('❌ [Debug] HR-2 data NOT found in hourTabsData');
    console.log('🔍 [Debug] Available hours:', window.hourTabsData ? Object.keys(window.hourTabsData) : 'none');
  }
}

// Function to check the data loading process
function checkDataLoadingProcess() {
  console.log('\n🔍 [Debug] Checking data loading process...');
  
  // Check if loadAllAvailableData was called
  console.log('🎯 [Debug] The Planets Analysis page calls loadAllAvailableData() which:');
  console.log('   1. Gets available dates from localStorage or CleanSupabaseService');
  console.log('   2. Calls PlanetsAnalysisDataService.getLatestAnalysisNumbers() for each HR');
  console.log('   3. Stores results in hourTabsData state');
  console.log('   4. When user switches to HR-2, it uses hourTabsData[2]');
  
  console.log('\n🎯 [Key Question] What does PlanetsAnalysisDataService.getLatestAnalysisNumbers() return for HR-2?');
  console.log('❓ [Investigation] Does it return the same data as Rule-2 Compact Analysis HR-2?');
}

// Main debug function
function debugHR2Mismatch() {
  console.log('\n🎯 HR-2 DATA MISMATCH ANALYSIS');
  console.log('================================');
  
  checkHourTabsData();
  checkPlanetsAnalysisService();
  checkDataLoadingProcess();
  
  console.log('\n🔍 [Debug Instructions]');
  console.log('1. Open Rule-2 Compact Analysis page');
  console.log('2. Switch to HR-2 tab and note the ABCD/BCD numbers shown');
  console.log('3. Open Planets Analysis page');
  console.log('4. Switch to HR-2 tab and check if numbers match');
  console.log('5. If they don\'t match, the issue is in PlanetsAnalysisDataService.getLatestAnalysisNumbers()');
  
  console.log('\n🎯 [Expected Fix Location]');
  console.log('File: src/services/planetsAnalysisDataService.js');
  console.log('Function: getLatestAnalysisNumbers() or formatAnalysisResult()');
  console.log('Issue: HR-specific data not being formatted correctly');
}

// Run the debug analysis
debugHR2Mismatch();

// Export functions for manual testing
window.debugHR2 = {
  checkHourTabsData,
  compareTopicData,
  checkPlanetsAnalysisService,
  expectedHR2Data
};

console.log('\n✅ Debug script loaded. Use window.debugHR2 for manual testing.');
