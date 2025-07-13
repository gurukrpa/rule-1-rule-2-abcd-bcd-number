// Debug Hour Switching Issue - Planet Headers Not Updating
// ================================================================

console.log('🔍 [DEBUG] Starting Hour Switching Issue Investigation...\n');

// Expected HR-2 Data from Rule-2 Compact Analysis
const expectedHR2 = {
  'D-1 Set-1 Matrix': { abcd: [1,4,5,6], bcd: [2,9] }
};

// Function to check if hour switching properly updates planet headers
function debugHourSwitchingIssue() {
  console.log('📊 [Step 1] Check hourTabsData structure...');
  
  if (window.hourTabsData) {
    console.log('✅ hourTabsData exists');
    console.log('Available hours:', Object.keys(window.hourTabsData));
    
    // Check HR-1 vs HR-2 data
    const hr1Data = window.hourTabsData[1];
    const hr2Data = window.hourTabsData[2];
    
    if (hr1Data && hr2Data) {
      console.log('\n📊 [Step 2] Compare HR-1 vs HR-2 data...');
      
      // Check D-1 Set-1 Matrix specifically
      const hr1_d1s1 = hr1Data.topicNumbers?.['D-1 Set-1 Matrix'];
      const hr2_d1s1 = hr2Data.topicNumbers?.['D-1 Set-1 Matrix'];
      
      console.log('HR-1 D-1 Set-1 Matrix:', hr1_d1s1);
      console.log('HR-2 D-1 Set-1 Matrix:', hr2_d1s1);
      
      if (hr1_d1s1 && hr2_d1s1) {
        const hr1Match = JSON.stringify(hr1_d1s1) === JSON.stringify(hr2_d1s1);
        console.log(`Data identical between hours: ${hr1Match ? '❌ YES (Problem!)' : '✅ NO (Good)'}`);
        
        if (hr1Match) {
          console.log('🔴 [ISSUE FOUND] HR-1 and HR-2 data are identical - this should NOT happen');
          console.log('🔍 [ROOT CAUSE] Hour-specific data is not being loaded correctly');
        } else {
          console.log('✅ [GOOD] HR-1 and HR-2 have different data');
          console.log('🔍 [NEXT] Check if UI is updating when selectedHour changes');
        }
      }
    }
  } else {
    console.log('❌ hourTabsData not found');
  }
  
  console.log('\n📊 [Step 3] Check realAnalysisData vs selectedHour...');
  
  if (window.realAnalysisData && window.selectedHour) {
    const currentRealData = window.realAnalysisData;
    const currentHour = window.selectedHour;
    
    console.log(`Current selected hour: ${currentHour}`);
    console.log('Current realAnalysisData source:', currentRealData.source);
    console.log('Current realAnalysisData hrNumber:', currentRealData.hrNumber);
    
    // Check if realAnalysisData matches the selected hour
    if (currentRealData.hrNumber !== currentHour) {
      console.log('🔴 [ISSUE] realAnalysisData hrNumber does not match selectedHour');
      console.log('This indicates the hour switching is not updating realAnalysisData properly');
    } else {
      console.log('✅ realAnalysisData hrNumber matches selectedHour');
    }
    
    // Check D-1 Set-1 Matrix in current realAnalysisData
    const currentD1S1 = currentRealData.topicNumbers?.['D-1 Set-1 Matrix'];
    if (currentD1S1) {
      console.log(`realAnalysisData D-1 Set-1: ABCD[${currentD1S1.abcd.join(',')}], BCD[${currentD1S1.bcd.join(',')}]`);
      
      // Compare with expected HR-2 data
      if (currentHour === 2) {
        const expected = expectedHR2['D-1 Set-1 Matrix'];
        const abcdMatch = JSON.stringify(currentD1S1.abcd.sort()) === JSON.stringify(expected.abcd.sort());
        const bcdMatch = JSON.stringify(currentD1S1.bcd.sort()) === JSON.stringify(expected.bcd.sort());
        
        console.log(`Expected HR-2: ABCD[${expected.abcd.join(',')}], BCD[${expected.bcd.join(',')}]`);
        console.log(`Data matches expected: ${abcdMatch && bcdMatch ? '✅' : '❌'}`);
        
        if (!abcdMatch || !bcdMatch) {
          console.log('🔴 [ISSUE] Real analysis data does not match expected HR-2 data');
        }
      }
    }
  }
  
  console.log('\n📊 [Step 4] Test getTopicNumbersWithNormalization function...');
  
  if (window.getTopicNumbersWithNormalization) {
    const testTopic = 'D-1 Set-1 Matrix';
    const result = window.getTopicNumbersWithNormalization(testTopic);
    
    console.log(`getTopicNumbersWithNormalization("${testTopic}"):`, result);
    
    if (window.selectedHour === 2) {
      const expected = expectedHR2[testTopic];
      const matches = JSON.stringify(result.abcd.sort()) === JSON.stringify(expected.abcd.sort()) &&
                     JSON.stringify(result.bcd.sort()) === JSON.stringify(expected.bcd.sort());
      
      console.log(`Function returns expected HR-2 data: ${matches ? '✅' : '❌'}`);
      
      if (!matches) {
        console.log('🔴 [ISSUE] getTopicNumbersWithNormalization is not returning hour-specific data');
        console.log('This explains why planet headers show the same data for all hours');
      }
    }
  } else {
    console.log('❌ getTopicNumbersWithNormalization function not available');
  }
  
  console.log('\n📊 [Step 5] Manual hour switch test...');
  
  if (window.handleHourChange) {
    console.log('🔧 [Test] Manually switching to HR-2...');
    
    // Store current state
    const beforeSwitch = {
      selectedHour: window.selectedHour,
      realAnalysisData: window.realAnalysisData ? {
        hrNumber: window.realAnalysisData.hrNumber,
        d1s1: window.realAnalysisData.topicNumbers?.['D-1 Set-1 Matrix']
      } : null
    };
    
    console.log('Before switch:', beforeSwitch);
    
    // Perform hour switch
    window.handleHourChange(2).then(() => {
      setTimeout(() => {
        const afterSwitch = {
          selectedHour: window.selectedHour,
          realAnalysisData: window.realAnalysisData ? {
            hrNumber: window.realAnalysisData.hrNumber,
            d1s1: window.realAnalysisData.topicNumbers?.['D-1 Set-1 Matrix']
          } : null
        };
        
        console.log('After switch:', afterSwitch);
        
        // Check if data actually changed
        if (beforeSwitch.realAnalysisData && afterSwitch.realAnalysisData) {
          const dataChanged = JSON.stringify(beforeSwitch.realAnalysisData.d1s1) !== 
                             JSON.stringify(afterSwitch.realAnalysisData.d1s1);
          
          console.log(`Data changed after hour switch: ${dataChanged ? '✅' : '❌'}`);
          
          if (!dataChanged) {
            console.log('🔴 [ROOT CAUSE CONFIRMED] Hour switching does not update the data');
            console.log('🔧 [SOLUTION] Need to fix handleHourChange or data loading mechanism');
          }
        }
      }, 1000); // Wait for async operations to complete
    });
  } else {
    console.log('❌ handleHourChange function not available');
  }
}

// Main diagnostic function
function diagnosePlanetHeaderIssue() {
  console.log('🎯 [PLANETS ANALYSIS] Diagnosing Planet Header Hour Switching Issue\n');
  console.log('=================================================================\n');
  
  console.log('📋 [PROBLEM] Planet headers show same ABCD/BCD numbers for all hours');
  console.log('📋 [EXPECTED] Each hour should show different numbers');
  console.log('📋 [ACTUAL] HR-1 and HR-2 show identical ABCD/BCD numbers\n');
  
  debugHourSwitchingIssue();
}

// Auto-run the diagnostic
diagnosePlanetHeaderIssue();

// Export for manual testing
window.debugHourSwitching = {
  diagnosePlanetHeaderIssue,
  debugHourSwitchingIssue,
  expectedHR2
};

console.log('\n🔧 [NEXT STEPS]');
console.log('1. Fix handleHourChange to properly update realAnalysisData');
console.log('2. Ensure getTopicNumbersWithNormalization uses current hour data');
console.log('3. Force re-render of planet headers when hour changes');
console.log('4. Verify hour-specific data is being loaded correctly');
