// Debug script to test planets navigation issue

// Test the DateValidationService behavior
console.log('🔍 Testing DateValidationService for planets navigation...');

// Simulate the current scenario
const today = '2025-07-07';
const userId = '1';

// Calculate N-1 date
const targetDateObj = new Date(today);
const analysisDateObj = new Date(targetDateObj);
analysisDateObj.setDate(analysisDateObj.getDate() - 1);
const n1Date = analysisDateObj.toISOString().split('T')[0];

console.log(`📅 Target date (today): ${today}`);
console.log(`📅 N-1 date (required): ${n1Date}`);

// Check if this is the validation issue
console.log(`🎯 Issue: If no data exists for ${n1Date}, navigation to planets analysis will be blocked`);
console.log(`💡 Solution: Either add ${n1Date} data or modify validation to allow fallback`);

// Test different dates
const testDates = [
    '2025-07-07', // Today
    '2025-07-06', // Yesterday
    '2025-07-05', // Day before yesterday
    '2025-07-08'  // Tomorrow
];

console.log('\n🧪 Testing validation for different dates:');
testDates.forEach(testDate => {
    const testDateObj = new Date(testDate);
    const requiredDateObj = new Date(testDateObj);
    requiredDateObj.setDate(requiredDateObj.getDate() - 1);
    const requiredDate = requiredDateObj.toISOString().split('T')[0];
    
    console.log(`${testDate} → requires ${requiredDate} data`);
});

console.log('\n🔧 Quick fixes to test:');
console.log('1. Temporarily disable validation in handlePlanetsAnalysisClick');
console.log('2. Add fallback behavior when validation fails');
console.log('3. Check what dates are actually available in the database');
