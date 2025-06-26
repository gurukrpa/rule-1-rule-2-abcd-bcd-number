// 🔍 Debug PlanetsAnalysisPage "Latest Data" Issue
// Copy this script into browser console on PlanetsAnalysisPage

console.log('🔍 DEBUGGING PLANETSANALYSISPAGE LATEST DATA ISSUE');
console.log('==================================================');

// Check if we're on the right page
if (window.location.href.includes('planets-analysis')) {
  console.log('✅ On PlanetsAnalysisPage');
} else {
  console.log('❌ Navigate to PlanetsAnalysisPage first');
}

// Check for Rule-1 data in React component state
console.log('\n📊 CHECKING RULE-1 DATA STATE:');
console.log('Look in React DevTools for PlanetsAnalysisPage component');
console.log('Check these state variables:');
console.log('- rule1LatestData: should be an object with targetElements');
console.log('- rule1Loading: should be false when data is loaded');
console.log('- selectedUser: should have a user ID');
console.log('- datesList: should have at least 2 dates');
console.log('- activeHR: should have a number 1-24');

// Check browser console for our debug logs
console.log('\n🔍 EXPECTED DEBUG LOGS TO FIND:');
console.log('1. "🎯 [Rule-1] Target date for display: [date]"');
console.log('2. "📅 [Rule-1] Fetching data from previous date: [date]"');
console.log('3. "🧮 [Rule-1] ABCD analysis sequence: [array of 4 dates]"');
console.log('4. "🧮 [Planets] Performing ABCD-BCD analysis for [setName]..."');
console.log('5. "✅ [Rule-1] Analysis for [setName]: {abcd: [...], bcd: [...]}"');
console.log('6. "✅ [Rule-1] Rule-1 integration complete with [X] sets"');

// Check for error logs
console.log('\n🚨 CHECK FOR THESE ERROR PATTERNS:');
console.log('1. "❌ [Rule-1] Not enough dates for Rule-1 integration"');
console.log('2. "❌ [Rule-1] Missing data for previous date"');
console.log('3. "❌ [Planets] Error performing ABCD-BCD analysis"');
console.log('4. "❌ [Latest Data] No data available for [set]/[element]"');

// Check getLatestAvailableData logs
console.log('\n🔍 LATEST DATA FUNCTION LOGS:');
console.log('For each element, you should see:');
console.log('1. "🔍 [Latest Data] Checking for latest data: [set]/[element]"');
console.log('2. "📊 [Latest Data] Rule-1 data available: true/false"');
console.log('3. "📊 [Latest Data] Rule-1 targetElements: [object]"');
console.log('4. Either:');
console.log('   - "✅ [Latest Data] Found Rule-1 data for [set]/[element]" (GOOD)');
console.log('   - "⚠️ [Latest Data] Rule-1 active but no data for [set]/[element]" (PARTIAL)');
console.log('   - "⚠️ [Latest Data] Using fallback Excel data" (FALLBACK)');

// Test extraction function
console.log('\n🧪 MANUAL TEST - performAbcdBcdAnalysis Function:');
console.log('The utility function should now be used instead of local logic');
console.log('Check if analysis includes "detailedAnalysis" and "error" properties');

// Manual debugging functions
window.debugPlanetsAnalysis = function() {
  console.log('\n🔧 MANUAL DEBUG TRIGGERED');
  console.log('==========================');
  
  // This would need React context to work properly
  console.log('To debug further:');
  console.log('1. Check React DevTools for component state');
  console.log('2. Look for console.log messages during data loading');
  console.log('3. Verify that performAbcdBcdAnalysis is called with correct parameters');
  console.log('4. Check if targetElements object is populated');
};

console.log('\n🎯 DEBUGGING STEPS:');
console.log('===================');
console.log('1. Navigate to PlanetsAnalysisPage');
console.log('2. Select a user with data');
console.log('3. Select a date (should have at least 2 dates available)');
console.log('4. Check console logs for the patterns above');
console.log('5. Look at the "Latest Data" column - should show "Past Days" not "Excel-Me"');

console.log('\n💡 EXPECTED ISSUE:');
console.log('If you see "Excel-Me" instead of "Past Days":');
console.log('- Rule-1 data loading failed or targetElements is empty');
console.log('- Check if performAbcdBcdAnalysis returns expected structure');
console.log('- Verify that the utility function import is working');

console.log('\n🚀 Ready for debugging! Check console logs and React DevTools.');
