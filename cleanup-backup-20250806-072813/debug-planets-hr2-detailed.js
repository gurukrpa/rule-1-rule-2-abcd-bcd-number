// Detailed debug for HR-2 mismatch in Planets Analysis Page
// Run this in the browser console when on the Planets Analysis page

console.log('🔍 DETAILED HR-2 PLANETS ANALYSIS DEBUG');
console.log('=====================================');

// Expected HR-2 data from Rule-2 Compact Analysis
const expectedHR2 = {
  'D-1 Set-1 Matrix': { abcd: [1,4,5,6], bcd: [2,9] },
  'D-1 Set-2 Matrix': { abcd: [3,5,7,9,10], bcd: [12] },
  'D-3 Set-1 Matrix': { abcd: [1,2,5,7,9], bcd: [8,10] },
  'D-3 Set-2 Matrix': { abcd: [2,3,6,7,8,10], bcd: [5] },
  'D-4 Set-1 Matrix': { abcd: [2,4,7,8,12], bcd: [] },
  'D-4 Set-2 Matrix': { abcd: [2,10], bcd: [4] }
};

// Test functions to run in browser console
function debugPlanetsHR2() {
  console.log('\n1. 🔍 Checking React component state...');
  
  // Try to access React component state through dev tools
  const reactRoot = document.querySelector('#root')?._reactInternalInstance 
    || document.querySelector('#root')?._reactInternals;
  
  if (reactRoot) {
    console.log('React root found, trying to access component state...');
  } else {
    console.log('React root not found, checking for global variables...');
  }
  
  console.log('\n2. 📊 Current page data:');
  console.log('Selected hour:', window.selectedHour || 'Not available');
  console.log('Hour tabs data keys:', Object.keys(window.hourTabsData || {}));
  console.log('Real analysis data source:', window.realAnalysisData?.source || 'Not available');
  
  console.log('\n3. 🎯 Checking HR-2 specific data:');
  if (window.hourTabsData && window.hourTabsData[2]) {
    const hr2Data = window.hourTabsData[2];
    console.log('HR-2 data structure:', {
      source: hr2Data.source,
      analysisDate: hr2Data.analysisDate,
      totalTopics: hr2Data.totalTopics,
      topicCount: Object.keys(hr2Data.topicNumbers || {}).length
    });
    
    console.log('\n4. 📋 Comparing specific topics:');
    Object.entries(expectedHR2).forEach(([topic, expected]) => {
      const actual = hr2Data.topicNumbers?.[topic];
      const match = actual && 
        JSON.stringify(actual.abcd.sort()) === JSON.stringify(expected.abcd.sort()) &&
        JSON.stringify(actual.bcd.sort()) === JSON.stringify(expected.bcd.sort());
      
      console.log(`${topic}:`);
      console.log(`  Expected: ABCD [${expected.abcd.join(',')}], BCD [${expected.bcd.join(',')}]`);
      console.log(`  Actual: ABCD [${actual?.abcd?.join(',') || 'N/A'}], BCD [${actual?.bcd?.join(',') || 'N/A'}]`);
      console.log(`  Match: ${match ? '✅' : '❌'}`);
    });
  } else {
    console.log('❌ HR-2 data not found in hourTabsData');
  }
  
  console.log('\n5. 🔧 Manual topic lookup test:');
  // Test the topic lookup function manually
  if (window.getTopicNumbersWithNormalization) {
    const testTopic = 'D-1 Set-1 Matrix';
    const result = window.getTopicNumbersWithNormalization(testTopic);
    console.log(`Manual lookup for "${testTopic}":`, result);
  } else {
    console.log('getTopicNumbersWithNormalization function not available');
  }
}

// Call the debug function
console.log('Run debugPlanetsHR2() in the console to start debugging');

// Auto-run if this is being executed in the browser
if (typeof window !== 'undefined') {
  debugPlanetsHR2();
}

// Instructions for manual debugging
console.log('\n🛠️ MANUAL DEBUG STEPS:');
console.log('1. Navigate to Planets Analysis page');
console.log('2. Switch to HR-2 tab');
console.log('3. Open browser console');
console.log('4. Run: debugPlanetsHR2()');
console.log('5. Check the output for mismatches');

console.log('\n🔍 KEY THINGS TO CHECK:');
console.log('1. Is hourTabsData[2] populated?');
console.log('2. Do the topic names match exactly?');
console.log('3. Is the hour switching updating realAnalysisData?');
console.log('4. Are topic names being normalized correctly?');

console.log('\n⚡ QUICK FIX TEST:');
console.log('// Try switching hours manually');
console.log('if (window.handleHourChange) {');
console.log('  window.handleHourChange(2);');
console.log('  console.log("Switched to HR-2, check data now");');
console.log('}');
