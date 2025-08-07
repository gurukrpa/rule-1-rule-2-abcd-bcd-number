// Debug HR-2 mismatch between Rule-2 Compact Analysis and Planets Analysis Page
// This script will check what's happening with hour-specific data loading

console.log('🔍 HR-2 ABCD/BCD Data Mismatch Debug');
console.log('====================================');

console.log('\n📊 Expected HR-2 data from Rule-2 Compact Analysis:');
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

Object.entries(expectedHR2Data).forEach(([topic, numbers]) => {
  console.log(`  ${topic}:`);
  console.log(`    ABCD: [${numbers.abcd.join(',')}]`);
  console.log(`    BCD: [${numbers.bcd.join(',')}]`);
});

console.log('\n🔍 To check actual Planets Analysis data:');
console.log('1. Open browser console on Planets Analysis page');
console.log('2. Switch to HR-2 tab');
console.log('3. Look for these console messages:');
console.log('   - "🎯 [Topic: D-1 Set-1 Matrix] Using REAL ANALYSIS numbers for HR 2"');
console.log('   - "✅ [PlanetsAnalysis] Hour 2 data loaded"');
console.log('   - Check if hourTabsData[2] exists and has the correct data');

console.log('\n🧩 Debug steps to run in browser:');
console.log('');
console.log('// Check if hour tabs data is loaded correctly');
console.log('console.log("Current hourTabsData:", window.hourTabsData || "Not available");');
console.log('');
console.log('// Check selected hour');
console.log('console.log("Selected hour:", window.selectedHour || "Not available");');
console.log('');
console.log('// Check real analysis data');
console.log('console.log("Real analysis data:", window.realAnalysisData || "Not available");');
console.log('');
console.log('// Manual check for D-1 Set-1 Matrix HR-2 data');
console.log('if (window.hourTabsData && window.hourTabsData[2]) {');
console.log('  const hr2Data = window.hourTabsData[2];');
console.log('  console.log("HR-2 D-1 Set-1 Matrix:", hr2Data.topicNumbers?.["D-1 Set-1 Matrix"]);');
console.log('  console.log("Expected: ABCD [1,4,5,6], BCD [2,9]");');
console.log('}');

console.log('\n⚠️ Possible issues to check:');
console.log('1. Hour switching not updating realAnalysisData correctly');
console.log('2. PlanetsAnalysisDataService returning wrong hour data');
console.log('3. handleHourChange function not working properly');
console.log('4. Data loading happening before hour tabs are set up');

