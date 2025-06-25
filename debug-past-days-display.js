// Debug Past Days ABCD/BCD Display Issue
// Run this in browser console to debug why ABCD/BCD numbers aren't showing in Past Days

console.log('🔍 DEBUGGING PAST DAYS ABCD/BCD DISPLAY');
console.log('='.repeat(50));

// Check if the Past Days page is loaded
console.log('🔍 Checking if we are on Past Days page...');
const header = document.querySelector('h1');
if (header && header.textContent.includes('Past Days')) {
  console.log('✅ We are on Past Days page');
  
  // Check for ABCD/BCD indicators in the matrix
  console.log('🔍 Looking for ABCD/BCD indicators in matrix...');
  const abcdTags = document.querySelectorAll('.bg-green-200');
  const bcdTags = document.querySelectorAll('.bg-blue-200');
  
  console.log(`📊 Found ${abcdTags.length} ABCD tags and ${bcdTags.length} BCD tags`);
  
  if (abcdTags.length > 0) {
    console.log('✅ ABCD numbers found:');
    abcdTags.forEach((tag, index) => {
      const numberElement = tag.parentElement.querySelector('.text-data-value');
      const number = numberElement ? numberElement.textContent : 'unknown';
      console.log(`  ${index + 1}. ABCD: ${number}`);
    });
  } else {
    console.log('❌ No ABCD numbers found in matrix');
  }
  
  if (bcdTags.length > 0) {
    console.log('✅ BCD numbers found:');
    bcdTags.forEach((tag, index) => {
      const numberElement = tag.parentElement.querySelector('.text-data-value');
      const number = numberElement ? numberElement.textContent : 'unknown';
      console.log(`  ${index + 1}. BCD: ${number}`);
    });
  } else {
    console.log('❌ No BCD numbers found in matrix');
  }
  
  // Check React component state
  console.log('🔍 Checking React component for abcdBcdAnalysis state...');
  const reactRoot = document.querySelector('#root');
  if (reactRoot && reactRoot._reactInternalFiber) {
    console.log('⚠️ React DevTools needed to check component state');
  }
  
} else {
  console.log('❌ Not on Past Days page - navigate to Past Days first');
}

// Check for console logs from our implementation
console.log('🔍 Looking for Past Days implementation logs...');
console.log('Look for these messages in console:');
console.log('- "[Rule1Page] Loading Rule-2 ABCD/BCD analysis results using real-time analysis..."');
console.log('- "[Rule1Page] Processing Past Days: [date] shows ABCD/BCD from [previous_date]"');
console.log('- "[Rule2Analysis] Starting analysis for [date]"');
console.log('- "Rule2Analysis Final Overall Results:"');

// Check if rule2AnalysisService is available
if (typeof window !== 'undefined') {
  console.log('🔍 Checking if rule2AnalysisService is available...');
  // This won't work directly as it's a module, but we can check for errors
}

console.log('🎯 DEBUGGING STEPS:');
console.log('1. Navigate to user data and click "Past Days" on any date after the 4th');
console.log('2. Check browser console for the log messages mentioned above');
console.log('3. Look for ABCD/BCD colored indicators in the matrix');
console.log('4. If no indicators, check if data is being loaded correctly');

console.log('💡 EXPECTED BEHAVIOR:');
console.log('- 5th date Past Days should show 4th date ABCD/BCD numbers');
console.log('- 6th date Past Days should show 5th date ABCD/BCD numbers');
console.log('- Numbers should appear with green "ABCD" or blue "BCD" tags');

// Helper function to manually trigger Past Days analysis
window.debugPastDays = function() {
  console.log('🔧 Manual Past Days debug triggered');
  // This would need to be called from React component context
  console.log('This function can be enhanced to manually trigger the analysis');
};

console.log('🚀 Debug setup complete. Navigate to Past Days and check results.');
