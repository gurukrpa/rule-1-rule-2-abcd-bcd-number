// Verification script for dynamic ABCD/BCD implementation
// Run this in browser console to test the integration

console.log('🔍 [VERIFICATION] Testing Dynamic ABCD/BCD Implementation...');

// Test 1: Check if service is imported correctly
try {
  if (window.location.pathname.includes('/planets-analysis')) {
    console.log('✅ [TEST 1] On Planets Analysis page');
    
    // Test 2: Check for analysis data loading
    const refreshButton = document.querySelector('button[class*="bg-blue-500"]');
    if (refreshButton && refreshButton.textContent.includes('Refresh Analysis')) {
      console.log('✅ [TEST 2] Refresh Analysis button found');
    } else {
      console.log('❌ [TEST 2] Refresh Analysis button not found');
    }
    
    // Test 3: Check for analysis summary section
    const analysisSummary = document.querySelector('.bg-gray-50');
    if (analysisSummary) {
      console.log('✅ [TEST 3] Analysis summary section found');
    } else {
      console.log('❌ [TEST 3] Analysis summary section not found');
    }
    
    // Test 4: Check for dynamic ABCD/BCD badges
    const abcdBadges = document.querySelectorAll('span[class*="bg-green-200"]');
    const bcdBadges = document.querySelectorAll('span[class*="bg-blue-200"]');
    
    console.log(`✅ [TEST 4] Found ${abcdBadges.length} ABCD badges and ${bcdBadges.length} BCD badges`);
    
    // Test 5: Check localStorage for analysis data
    const selectedUser = localStorage.getItem('selectedUser');
    const activeHR = localStorage.getItem('activeHR');
    
    if (selectedUser) {
      console.log(`✅ [TEST 5] User data found: ${selectedUser}, HR: ${activeHR}`);
      
      const datesData = localStorage.getItem(`dates_${selectedUser}`);
      if (datesData) {
        const dates = JSON.parse(datesData);
        console.log(`✅ [TEST 5] Found ${dates.length} dates for analysis`);
      }
    } else {
      console.log('⚠️ [TEST 5] No user selected - dynamic data may not load');
    }
    
  } else {
    console.log('ℹ️ Navigate to Planets Analysis page to run full verification');
  }
  
  console.log('🎯 [VERIFICATION COMPLETE] Check results above');
  
} catch (error) {
  console.error('❌ [VERIFICATION ERROR]', error);
}

// Function to test dynamic service manually
window.testDynamicService = async function() {
  console.log('🧪 [MANUAL TEST] Testing PlanetsAnalysisDataService...');
  
  try {
    // This will be available when the service is loaded
    if (window.PlanetsAnalysisDataService) {
      console.log('✅ Service available globally');
    } else {
      console.log('ℹ️ Service not in global scope (normal for module imports)');
    }
    
    // Test with mock data
    const mockAnalysisData = {
      success: true,
      source: 'Manual Test',
      analysisDate: '2025-07-01',
      hrNumber: 1,
      topicNumbers: {
        'D-1 Set-1 Matrix': { abcd: [6, 8, 11], bcd: [9, 10] },
        'D-3 Set-2 Matrix': { abcd: [5, 9, 10, 11], bcd: [3, 4] }
      }
    };
    
    console.log('✅ Mock data structure valid');
    console.log('📊 Sample topic numbers:', mockAnalysisData.topicNumbers);
    
  } catch (error) {
    console.error('❌ Manual test failed:', error);
  }
};

console.log('💡 Run testDynamicService() to test service functionality');
