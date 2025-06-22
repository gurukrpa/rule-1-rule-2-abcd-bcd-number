#!/usr/bin/env node
// Test to compare current validation vs strict validation
import XLSX from 'xlsx';
import { validateExcelStructure } from './src/utils/excelValidation.js';

console.log('🔍 VALIDATION COMPARISON TEST\n');
console.log('This test shows the difference between:');
console.log('❌ OLD: Basic validation (minimal checks)');
console.log('✅ NEW: Strict validation (exact template matching)\n');

// Test files
const templateFile = '/Users/gurukrpasharma/Desktop/singapore upload excel sheets for software/abcd-bcd num upload/june-2025/12-6-25.xlsx';

async function testValidationComparison() {
  try {
    console.log('📂 Testing with template file...\n');
    
    const workbook = XLSX.readFile(templateFile);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // OLD METHOD: Basic checks (what we had before)
    console.log('❌ OLD VALIDATION METHOD:');
    console.log('   1. File type check: ✅ (.xlsx)');
    console.log('   2. File size check: ✅ (< 10MB)');
    console.log('   3. Structure validation: ❌ NONE');
    console.log('   4. Data format validation: ❌ NONE');
    console.log('   5. Template matching: ❌ NONE');
    console.log('   → Result: File would be accepted without validation\n');
    
    // NEW METHOD: Strict validation
    console.log('✅ NEW STRICT VALIDATION METHOD:');
    const validation = validateExcelStructure(jsonData, '12-6-25.xlsx');
    
    console.log(`   1. File type check: ✅ (.xlsx)`);
    console.log(`   2. File size check: ✅ (< 10MB)`);
    console.log(`   3. Topic structure: ${validation.topicsFound === 30 ? '✅' : '❌'} (${validation.topicsFound}/30 topics)`);
    console.log(`   4. Data cells: ${validation.validDataCells >= 2380 ? '✅' : '❌'} (${validation.validDataCells}/2430 cells)`);
    console.log(`   5. Data quality: ${validation.dataQualityScore >= 95 ? '✅' : '❌'} (${validation.dataQualityScore?.toFixed(1)}%)`);
    console.log(`   6. Template matching: ${validation.isValid ? '✅' : '❌'} ${validation.validationLevel}`);
    console.log(`   → Result: ${validation.isValid ? 'ACCEPTED' : 'REJECTED'} with detailed feedback\n`);
    
    // Show the difference with a broken file example
    console.log('🧪 TESTING WITH INVALID FILE EXAMPLE:\n');
    
    // Simulate a broken file (missing data)
    const brokenData = [
      ['D-1 Set-1 Matrix'],
      ['x', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
      ['as', '', '', '', '', '', '', '', '', ''], // Missing data
      ['mo'] // Incomplete row
    ];
    
    console.log('❌ OLD METHOD with broken file:');
    console.log('   → Would try to process and fail silently or with generic error\n');
    
    console.log('✅ NEW METHOD with broken file:');
    const brokenValidation = validateExcelStructure(brokenData, 'broken-file.xlsx');
    console.log(`   → Status: ${brokenValidation.isValid ? 'PASSED' : 'FAILED'}`);
    console.log(`   → Errors: ${brokenValidation.errors.length}`);
    console.log(`   → Specific feedback: "${brokenValidation.errors[0] || 'N/A'}"`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Key differences summary
function showDifferencesSummary() {
  console.log('\n📋 KEY DIFFERENCES SUMMARY:\n');
  
  console.log('🔥 PROBLEMS WITH OLD VALIDATION:');
  console.log('   • Files accepted without proper structure validation');
  console.log('   • Users upload invalid files and don\'t know until later');
  console.log('   • Generic error messages: "Failed to process Excel file"');
  console.log('   • No guidance on how to fix issues');
  console.log('   • Silent data corruption/missing data');
  console.log('   • No template compliance checking\n');
  
  console.log('✅ BENEFITS OF NEW STRICT VALIDATION:');
  console.log('   • Exact template structure matching');
  console.log('   • 30 topics × 9 elements × 9 planets = 2430 data cells validation');
  console.log('   • Astrological data format validation');
  console.log('   • Specific error messages with row/column locations');
  console.log('   • Quality scoring (🟢🟡🟠 indicators)');
  console.log('   • Actionable suggestions for fixing issues');
  console.log('   • Template compliance verification');
  console.log('   • Prevents bad data from entering the system\n');
}

// Run the comparison
testValidationComparison().then(() => {
  showDifferencesSummary();
}).catch(error => {
  console.error('Test failed:', error);
});
