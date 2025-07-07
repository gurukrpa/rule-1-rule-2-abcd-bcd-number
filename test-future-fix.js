// Browser Console Test Script for Future Planets Analysis Fix
// Run this in the browser console on the Future Planets Analysis page

console.log('🔍 Testing Future Planets Analysis fix...');

// Test the getAvailableDates function directly
async function testGetAvailableDates() {
  try {
    // Import the services
    const { cleanSupabaseService } = await import('/src/services/CleanSupabaseService.js');
    const { PAGE_CONTEXTS } = await import('/src/services/CleanSupabaseService.js');
    
    console.log('📦 Services imported successfully');
    
    // Test with a user ID (replace with actual user ID)
    const testUserId = 'testuser'; // Replace with actual user ID from your app
    
    console.log(`🔍 Testing with user ID: ${testUserId}`);
    
    // Try to get dates from ABCD context
    const abcdDates = await cleanSupabaseService.getUserDates(testUserId, PAGE_CONTEXTS.ABCD);
    console.log('📅 ABCD dates:', abcdDates);
    
    // Try other contexts
    const rule2Dates = await cleanSupabaseService.getUserDates(testUserId, PAGE_CONTEXTS.RULE2);
    console.log('📅 Rule2 dates:', rule2Dates);
    
    const pastDaysDates = await cleanSupabaseService.getUserDates(testUserId, PAGE_CONTEXTS.PAST_DAYS);
    console.log('📅 Past Days dates:', pastDaysDates);
    
    const indexDates = await cleanSupabaseService.getUserDates(testUserId, PAGE_CONTEXTS.INDEX);
    console.log('📅 Index dates:', indexDates);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test the PlanetsAnalysisDataService
async function testPlanetsAnalysisDataService() {
  try {
    const { PlanetsAnalysisDataService } = await import('/src/services/planetsAnalysisDataService.js');
    
    console.log('📦 PlanetsAnalysisDataService imported successfully');
    
    // Test with sample data
    const testUserId = 'testuser';
    const testDates = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'];
    const testHR = 1;
    
    console.log(`🔍 Testing analysis with ${testDates.length} dates`);
    
    const result = await PlanetsAnalysisDataService.getLatestAnalysisNumbers(
      testUserId,
      testDates,
      testHR
    );
    
    console.log('📊 Analysis result:', result);
    
  } catch (error) {
    console.error('❌ Analysis test failed:', error);
  }
}

// Run tests
console.log('🚀 Starting tests...');
testGetAvailableDates();
testPlanetsAnalysisDataService();

console.log('✅ Test script loaded. Check console output for results.');
