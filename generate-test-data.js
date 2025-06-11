// Generate test data for ABCD/BCD analysis testing
// Run this in browser console to create sample data if none exists

console.log('🏗️ GENERATING TEST DATA FOR ABCD/BCD ANALYSIS');
console.log('==============================================');

// Check if we already have data
const existingKeys = Object.keys(localStorage).filter(k => k.startsWith('dates_'));
if (existingKeys.length > 0) {
  console.log('✅ Data already exists:', existingKeys);
  console.log('💡 Run quick-data-check.js to verify your data');
  // Don't generate new data if it already exists
} else {
  console.log('🚀 Creating sample test data...');
  
  const testUserId = 'test-user-001';
  const testDates = ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04'];
  
  // Create dates list
  localStorage.setItem(`dates_${testUserId}`, JSON.stringify(testDates));
  
  // Sample Excel data structure
  const sampleExcelData = {
    data: {
      sets: {
        'Set1': {
          'Lagna': {
            'Su': 'as-7/su-12',
            'Mo': 'as-3/mo-8',
            'Ma': 'as-9/ma-4',
            'Me': 'as-2/me-7',
            'Ju': 'as-11/ju-1',
            'Ve': 'as-5/ve-10',
            'Sa': 'as-8/sa-3',
            'Ra': 'as-6/ra-11',
            'Ke': 'as-12/ke-5'
          },
          'Moon': {
            'Su': 'mo-4/su-9',
            'Mo': 'mo-1/mo-6',
            'Ma': 'mo-7/ma-2',
            'Me': 'mo-10/me-5',
            'Ju': 'mo-3/ju-8',
            'Ve': 'mo-12/ve-7',
            'Sa': 'mo-6/sa-11',
            'Ra': 'mo-9/ra-4',
            'Ke': 'mo-2/ke-7'
          }
        },
        'Set2': {
          'Lagna': {
            'Su': 'as-5/su-10',
            'Mo': 'as-1/mo-6',
            'Ma': 'as-8/ma-3',
            'Me': 'as-12/me-5',
            'Ju': 'as-4/ju-9',
            'Ve': 'as-7/ve-2',
            'Sa': 'as-11/sa-6',
            'Ra': 'as-3/ra-8',
            'Ke': 'as-9/ke-4'
          }
        }
      }
    }
  };
  
  // Sample Hour Entry data
  const sampleHourData = {
    planetSelections: {
      '1': 'Su',
      '2': 'Mo',
      '3': 'Ma',
      '4': 'Me'
    }
  };
  
  // Create variations for each date to ensure ABCD/BCD patterns
  testDates.forEach((date, index) => {
    // Vary the numbers slightly to create patterns
    const variation = index + 1;
    const modifiedExcelData = JSON.parse(JSON.stringify(sampleExcelData));
    
    // Modify numbers to create ABCD patterns
    // Day A(0): 7, 3, 9 | Day B(1): 7, 4, 9 | Day C(2): 7, 5, 8 | Day D(3): 7, 6, 9
    // This should make 7 and 9 ABCD candidates for Set1/Lagna
    if (date === '2025-01-01') { // A day
      modifiedExcelData.data.sets.Set1.Lagna.Su = 'as-7/su-12';
      modifiedExcelData.data.sets.Set1.Lagna.Mo = 'as-3/mo-8';
      modifiedExcelData.data.sets.Set1.Lagna.Ma = 'as-9/ma-4';
    } else if (date === '2025-01-02') { // B day
      modifiedExcelData.data.sets.Set1.Lagna.Su = 'as-7/su-12';
      modifiedExcelData.data.sets.Set1.Lagna.Mo = 'as-4/mo-8';
      modifiedExcelData.data.sets.Set1.Lagna.Ma = 'as-9/ma-4';
    } else if (date === '2025-01-03') { // C day
      modifiedExcelData.data.sets.Set1.Lagna.Su = 'as-7/su-12';
      modifiedExcelData.data.sets.Set1.Lagna.Mo = 'as-5/mo-8';
      modifiedExcelData.data.sets.Set1.Lagna.Ma = 'as-8/ma-4';
    } else if (date === '2025-01-04') { // D day
      modifiedExcelData.data.sets.Set1.Lagna.Su = 'as-7/su-12'; // Should be ABCD (appears in A, B, C)
      modifiedExcelData.data.sets.Set1.Lagna.Mo = 'as-6/mo-8';
      modifiedExcelData.data.sets.Set1.Lagna.Ma = 'as-9/ma-4';  // Should be ABCD (appears in A, B)
    }
    
    // Store data
    localStorage.setItem(`excelData_${testUserId}_${date}`, JSON.stringify(modifiedExcelData));
    localStorage.setItem(`hourEntry_${testUserId}_${date}`, JSON.stringify(sampleHourData));
    
    console.log(`✅ Created data for ${date}`);
  });
  
  console.log('🎉 Test data generated successfully!');
  console.log(`👤 Test User ID: ${testUserId}`);
  console.log(`📅 Test Dates: ${testDates.join(', ')}`);
  console.log('🎯 Expected ABCD results for Set1/Lagna/HR1:');
  console.log('   - Number 7 should be ABCD (appears in A, B, C, D)');
  console.log('   - Number 9 should be ABCD (appears in A, B, D)');
  console.log(`🔗 Test URL: ${window.location.origin}/user/${testUserId}/index/2025-01-04`);
  
  // Navigate to test page
  const testUrl = `/user/${testUserId}/index/2025-01-04`;
  console.log(`🚀 Navigating to test page: ${testUrl}`);
  window.location.href = testUrl;
}
