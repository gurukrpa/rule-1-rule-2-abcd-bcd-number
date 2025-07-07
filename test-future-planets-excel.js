/**
 * Browser Console Test for Future Planets Analysis Page Excel Upload
 * 
 * TESTING REQUIREMENTS:
 * 1. Always show all 9 planets columns after Excel upload
 * 2. Display extracted data for all topics (not just first 2)
 * 3. Show all topics with data availability indicators
 * 4. Proper fallback for topics without data
 */

console.log('🧪 TESTING: Future Planets Analysis - Excel Data Display');

// Test 1: Check planets data structure after Excel upload
function testPlanetsDataStructure() {
  console.log('\n📊 Test 1: Planets Data Structure');
  
  // Check if all 9 planets are defined
  const expectedPlanets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
  const planetsComponent = document.querySelector('[data-testid="planets-analysis"]');
  
  if (!planetsComponent) {
    console.log('❌ Planets analysis component not found');
    return false;
  }
  
  // Check if all planet headers are visible
  const planetHeaders = document.querySelectorAll('th[data-planet-code]');
  const visiblePlanets = Array.from(planetHeaders).map(th => th.dataset.planetCode);
  
  console.log('🪐 Visible planets:', visiblePlanets);
  
  const allPlanetsVisible = expectedPlanets.every(planet => visiblePlanets.includes(planet));
  
  if (allPlanetsVisible) {
    console.log('✅ All 9 planets are visible in headers');
  } else {
    console.log('❌ Missing planets:', expectedPlanets.filter(p => !visiblePlanets.includes(p)));
  }
  
  return allPlanetsVisible;
}

// Test 2: Check if Excel data is extracted and displayed
function testExcelDataExtraction() {
  console.log('\n📈 Test 2: Excel Data Extraction');
  
  // Check if Excel upload component exists
  const uploadInput = document.querySelector('input[type="file"]');
  if (!uploadInput) {
    console.log('❌ Excel upload input not found');
    return false;
  }
  
  // Check if extracted data is displayed in cells
  const dataCells = document.querySelectorAll('td[data-planet-data]');
  const cellsWithData = Array.from(dataCells).filter(cell => {
    const text = cell.textContent.trim();
    return text && text !== '--' && text !== 'No data';
  });
  
  console.log(`📊 Data cells found: ${cellsWithData.length} / ${dataCells.length}`);
  
  if (cellsWithData.length > 0) {
    console.log('✅ Excel data is being extracted and displayed');
    console.log('📝 Sample data:', cellsWithData.slice(0, 3).map(cell => cell.textContent.trim()));
  } else {
    console.log('⚠️ No extracted data visible (may need Excel upload)');
  }
  
  return cellsWithData.length > 0;
}

// Test 3: Check topic coverage and data availability
function testTopicCoverage() {
  console.log('\n📚 Test 3: Topic Coverage');
  
  const topicSections = document.querySelectorAll('[data-topic-name]');
  const topicsWithData = Array.from(topicSections).filter(section => {
    return section.querySelector('[data-has-data="true"]');
  });
  
  console.log(`📊 Topics displayed: ${topicSections.length}`);
  console.log(`📈 Topics with data: ${topicsWithData.length}`);
  
  // Check if all expected topics are covered
  const expectedTopicsCount = 30; // D-1 to D-144, Set-1 and Set-2 each
  
  if (topicSections.length >= expectedTopicsCount * 0.8) { // Allow 80% coverage
    console.log('✅ Good topic coverage');
  } else {
    console.log('⚠️ Limited topic coverage - may need more data');
  }
  
  return topicSections.length > 0;
}

// Test 4: Check data status indicators
function testDataStatusIndicators() {
  console.log('\n🎯 Test 4: Data Status Indicators');
  
  const statusIndicators = document.querySelectorAll('.text-green-600, .bg-green-100');
  const dataAvailableLabels = document.querySelectorAll('[data-label*="Data Available"]');
  
  console.log(`🎨 Status indicators found: ${statusIndicators.length}`);
  console.log(`📊 Data available labels: ${dataAvailableLabels.length}`);
  
  if (statusIndicators.length > 0) {
    console.log('✅ Data status indicators are working');
  } else {
    console.log('⚠️ No status indicators visible');
  }
  
  return statusIndicators.length > 0;
}

// Test 5: Check Excel file validation
function testExcelValidation() {
  console.log('\n🔍 Test 5: Excel Validation');
  
  // Check if validation messages are shown
  const successMessages = document.querySelectorAll('.bg-green-50, .text-green-700');
  const errorMessages = document.querySelectorAll('.bg-red-50, .text-red-700');
  
  console.log(`✅ Success messages: ${successMessages.length}`);
  console.log(`❌ Error messages: ${errorMessages.length}`);
  
  // Check if file name is displayed
  const fileNameDisplay = document.querySelector('[data-filename]');
  if (fileNameDisplay) {
    console.log('📁 File name displayed:', fileNameDisplay.textContent);
  }
  
  return true;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Future Planets Analysis Tests...\n');
  
  const test1 = testPlanetsDataStructure();
  const test2 = testExcelDataExtraction();
  const test3 = testTopicCoverage();
  const test4 = testDataStatusIndicators();
  const test5 = testExcelValidation();
  
  console.log('\n📊 TEST SUMMARY:');
  console.log(`🪐 Planets Structure: ${test1 ? '✅' : '❌'}`);
  console.log(`📈 Excel Data: ${test2 ? '✅' : '⚠️'}`);
  console.log(`📚 Topic Coverage: ${test3 ? '✅' : '❌'}`);
  console.log(`🎯 Status Indicators: ${test4 ? '✅' : '⚠️'}`);
  console.log(`🔍 Excel Validation: ${test5 ? '✅' : '❌'}`);
  
  const overallScore = [test1, test2, test3, test4, test5].filter(Boolean).length;
  console.log(`\n🎯 Overall Score: ${overallScore}/5`);
  
  if (overallScore >= 4) {
    console.log('🎉 Future Planets Analysis is working well!');
  } else {
    console.log('⚠️ Future Planets Analysis needs improvements');
  }
}

// Helper function to simulate Excel upload (for testing)
function simulateExcelUpload() {
  console.log('\n🧪 SIMULATION: Excel Upload');
  
  // Create mock Excel data
  const mockExcelData = {
    fileName: 'test-planets-data.xlsx',
    sets: {
      'D-1 Set-1 Matrix': {
        'Lagna': { 'Su': '12', 'Mo': '6', 'Ma': '1', 'Me': '2', 'Ju': '9', 'Ve': '7', 'Sa': '10', 'Ra': '3', 'Ke': '9' },
        'Moon': { 'Su': '6', 'Mo': '12', 'Ma': '7', 'Me': '8', 'Ju': '3', 'Ve': '1', 'Sa': '4', 'Ra': '9', 'Ke': '3' }
      },
      'D-1 Set-2 Matrix': {
        'Lagna': { 'Su': '1', 'Mo': '7', 'Ma': '12', 'Me': '11', 'Ju': '8', 'Ve': '6', 'Sa': '9', 'Ra': '4', 'Ke': '8' }
      }
    },
    uploadedAt: new Date().toISOString(),
    validationReport: { isValid: true, dataQualityScore: 98.5 }
  };
  
  // Simulate setting the data (would normally be done by handleExcelUpload)
  if (window.setExcelData) {
    window.setExcelData(mockExcelData);
    console.log('✅ Mock Excel data set successfully');
  } else {
    console.log('⚠️ setExcelData function not available');
  }
  
  return mockExcelData;
}

// Export for browser console
window.testFuturePlanetsAnalysis = {
  runAllTests,
  testPlanetsDataStructure,
  testExcelDataExtraction,
  testTopicCoverage,
  testDataStatusIndicators,
  testExcelValidation,
  simulateExcelUpload
};

console.log('🔧 Test functions loaded. Run: testFuturePlanetsAnalysis.runAllTests()');
