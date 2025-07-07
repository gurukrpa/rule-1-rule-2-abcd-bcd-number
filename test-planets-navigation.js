// Script to test direct navigation to Planets Analysis page
// Run this in the browser console when on the ABCD page

console.log('🚀 Testing direct navigation to Planets Analysis with July 7th');

// Get the current user ID from the URL or local context
const currentUserId = 'sing maya';
const testDate = '2025-07-07';

// Construct the URL for Planets Analysis
const planetsAnalysisUrl = `/planets-analysis/${currentUserId}?date=${testDate}`;

console.log('🎯 Target URL:', planetsAnalysisUrl);
console.log('📅 Selected date:', testDate);

// Check if we can access React Router to navigate
if (window.location) {
  console.log('Current location:', window.location.href);
  console.log('To test: Navigate to:', window.location.origin + planetsAnalysisUrl);
  
  // Try to navigate programmatically
  try {
    window.history.pushState({}, '', planetsAnalysisUrl);
    console.log('✅ Navigation attempted - check browser URL and console for PlanetsAnalysis logs');
    console.log('🔍 Look for logs starting with "[PlanetsAnalysis]" to see what dates are loaded');
  } catch (e) {
    console.log('❌ Navigation failed:', e);
    console.log('💡 Manual navigation: Click on July 7th in the calendar, then click "Planets Analysis"');
  }
}

// Also test the localStorage key format issue
console.log('\n🔍 Testing localStorage key formats:');
const testKeys = [
  'abcd_dates_sing maya',
  'abcd_dates_' + currentUserId,
  `abcd_dates_${currentUserId}`
];

testKeys.forEach(key => {
  const value = localStorage.getItem(key);
  if (value) {
    console.log(`✅ Found data in "${key}":`, JSON.parse(value));
  } else {
    console.log(`❌ No data in "${key}"`);
  }
});

console.log('\n🎯 Expected flow:');
console.log('1. PlanetsAnalysisPage should load dates from CleanSupabaseServiceWithSeparateStorage');
console.log('2. Should find dates: [2025-06-27, 2025-06-28, 2025-06-29, 2025-06-30, 2025-07-01, 2025-07-02, 2025-07-03]');
console.log('3. Should calculate N-1 for July 7 → July 6 (not available)');
console.log('4. Should find closest previous → July 3, 2025');
console.log('5. Should show: "🎯 N-1 Pattern: Clicked 07/07/2025 → Analyzing data from 03/07/2025"');
