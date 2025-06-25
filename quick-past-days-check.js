// Quick Past Days Verification Script
// Run this in browser console to check current state

console.log('🔍 PAST DAYS STATE VERIFICATION');
console.log('='.repeat(40));

// Check if we're on Past Days
const title = document.querySelector('h1')?.textContent;
console.log('📄 Page Title:', title);

if (title && title.includes('Past Days')) {
  console.log('✅ On Past Days page');
  
  // Check for any ABCD/BCD indicators
  const abcdElements = document.querySelectorAll('span:contains("ABCD")');
  const bcdElements = document.querySelectorAll('span:contains("BCD")');
  
  console.log(`📊 Visual indicators found: ${abcdElements.length} ABCD, ${bcdElements.length} BCD`);
  
  // Check console for our debug messages
  console.log('🔍 Check above for these key messages:');
  console.log('- "[Rule1Page] Loading Rule-2 ABCD/BCD analysis results using real-time analysis..."');
  console.log('- "[Rule1Page] Processing Past Days: [date] shows ABCD/BCD from [previous_date]"');
  console.log('- "[Rule2Analysis] Starting analysis for [date]"');
  console.log('- "✅ [Rule1Page] Real-time analysis SUCCESS"');
  console.log('- "🎨 [Rule1Page] Color coding attempt"');
  
} else {
  console.log('❌ Not on Past Days page - navigate there first');
}

// Helper to check React component state (if possible)
console.log('🎯 NEXT STEPS:');
console.log('1. If no debug messages appear, check for JavaScript errors');
console.log('2. If analysis fails, check data availability');
console.log('3. If analysis succeeds but no colors, check color coding function');
console.log('4. Look for the specific ABCD/BCD numbers from Rule2 Compact page');
