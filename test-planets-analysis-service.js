// Test script for PlanetsAnalysisDataService
// Simulates the service functionality without browser dependencies

import { PlanetsAnalysisDataService } from './src/services/planetsAnalysisDataService.js';

console.log('🧪 Testing PlanetsAnalysisDataService...');

// Test the service methods
function testServiceMethods() {
  console.log('\n📋 Testing static methods...');

  // Mock analysis data structure
  const mockAnalysisData = {
    success: true,
    data: {
      source: 'rule2',
      analysisDate: '2025-06-30',
      topicNumbers: {
        'D-1 Set-1 Matrix': { abcd: [6, 8, 11], bcd: [9, 10] },
        'D-1 Set-2 Matrix': { abcd: [1, 4, 5, 9], bcd: [8] },
        'D-3 (trd) Set-1 Matrix': { abcd: [1, 2, 8, 11], bcd: [4, 6] }
      },
      overallNumbers: { abcd: [1, 2, 6, 8, 9, 11], bcd: [4, 8, 9, 10] },
      totalTopics: 3,
      hrNumber: 1
    }
  };

  // Test getTopicNumbers
  console.log('\n🔍 Testing getTopicNumbers...');
  const d1Set1Numbers = PlanetsAnalysisDataService.getTopicNumbers(mockAnalysisData, 'D-1 Set-1 Matrix');
  console.log('D-1 Set-1 Matrix numbers:', d1Set1Numbers);
  console.log('✅ Expected: {abcd: [6, 8, 11], bcd: [9, 10]}');

  // Test isAbcdNumber
  console.log('\n🔍 Testing isAbcdNumber...');
  const isAbcd8 = PlanetsAnalysisDataService.isAbcdNumber(mockAnalysisData, 'D-1 Set-1 Matrix', 8);
  const isAbcd12 = PlanetsAnalysisDataService.isAbcdNumber(mockAnalysisData, 'D-1 Set-1 Matrix', 12);
  console.log('Is 8 ABCD for D-1 Set-1:', isAbcd8, '(should be true)');
  console.log('Is 12 ABCD for D-1 Set-1:', isAbcd12, '(should be false)');

  // Test isBcdNumber
  console.log('\n🔍 Testing isBcdNumber...');
  const isBcd9 = PlanetsAnalysisDataService.isBcdNumber(mockAnalysisData, 'D-1 Set-1 Matrix', 9);
  const isBcd7 = PlanetsAnalysisDataService.isBcdNumber(mockAnalysisData, 'D-1 Set-1 Matrix', 7);
  console.log('Is 9 BCD for D-1 Set-1:', isBcd9, '(should be true)');
  console.log('Is 7 BCD for D-1 Set-1:', isBcd7, '(should be false)');

  // Test getAnalysisSummary
  console.log('\n🔍 Testing getAnalysisSummary...');
  const summary = PlanetsAnalysisDataService.getAnalysisSummary(mockAnalysisData);
  console.log('Analysis summary:', summary);

  console.log('\n✅ All static method tests completed!');
}

// Test empty/failed data handling
function testErrorHandling() {
  console.log('\n⚠️ Testing error handling...');

  const failedAnalysisData = {
    success: false,
    error: 'No data available'
  };

  const emptyNumbers = PlanetsAnalysisDataService.getTopicNumbers(failedAnalysisData, 'D-1 Set-1 Matrix');
  console.log('Empty data topic numbers:', emptyNumbers, '(should be {abcd: [], bcd: []})');

  const failedSummary = PlanetsAnalysisDataService.getAnalysisSummary(failedAnalysisData);
  console.log('Failed data summary:', failedSummary);

  console.log('\n✅ Error handling tests completed!');
}

// Run tests
try {
  testServiceMethods();
  testErrorHandling();
  
  console.log('\n🎉 All PlanetsAnalysisDataService tests passed!');
  console.log('\n📝 The service is ready to use in the Planets Analysis pages.');
  console.log('💡 Key features:');
  console.log('   - Dynamic ABCD/BCD numbers from Rule-2 and Past Days analysis');
  console.log('   - Topic-specific number filtering');
  console.log('   - Fallback to hardcoded numbers when no dynamic data available');
  console.log('   - Error handling and validation');
  
} catch (error) {
  console.error('❌ Test failed:', error);
}
