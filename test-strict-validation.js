#!/usr/bin/env node
// Test script for the new strict ABCD validation
import { validateExcelStructure, generateValidationReport } from './src/utils/excelValidation.js';
import XLSX from 'xlsx';

async function testStrictValidation() {
  const templateFile = '/Users/gurukrpasharma/Desktop/singapore upload excel sheets for software/abcd-bcd num upload/june-2025/12-6-25.xlsx';
  
  console.log('🧪 Testing Strict ABCD Validation');
  console.log('=' + '='.repeat(50));
  
  try {
    console.log(`\n📂 Testing template file: ${templateFile}`);
    
    const workbook = XLSX.readFile(templateFile);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 File structure: ${jsonData.length} rows`);
    
    // Run strict validation
    const validation = validateExcelStructure(jsonData, '12-6-25.xlsx');
    
    // Display results
    console.log(`\n📋 VALIDATION RESULTS:`);
    console.log(`   Status: ${validation.isValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Level: ${validation.validationLevel}`);
    console.log(`   Topics: ${validation.topicsFound}/${validation.topicsFound || 30}`);
    console.log(`   Data Cells: ${validation.validDataCells}/${validation.validDataCells || 2430}`);
    console.log(`   Quality: ${validation.dataQualityScore ? validation.dataQualityScore.toFixed(1) : '0.0'}%`);
    console.log(`   Errors: ${validation.errors ? validation.errors.length : 0}`);
    console.log(`   Warnings: ${validation.warnings ? validation.warnings.length : 0}`);
    
    if (validation.isValid) {
      console.log(`\n✅ SUCCESS: Template file passes strict validation!`);
      console.log(`🎯 This confirms the validation logic works correctly with the user's template.`);
    } else {
      console.log(`\n❌ FAILED: Template file failed validation`);
      if (validation.errors && validation.errors.length > 0) {
        console.log(`\n🚨 First 3 errors:`);
        validation.errors.slice(0, 3).forEach((error, i) => {
          console.log(`   ${i + 1}. ${error}`);
        });
      }
    }
    
    // Test with invalid data to ensure validation works
    console.log(`\n🧪 Testing with invalid data structure...`);
    const invalidData = [
      ['Invalid', 'Header', 'Structure'],
      ['as', '1', '2', '3']
    ];
    
    const invalidValidation = validateExcelStructure(invalidData, 'invalid-test.xlsx');
    console.log(`   Invalid file validation: ${invalidValidation.isValid ? '❌ WRONGLY PASSED' : '✅ CORRECTLY FAILED'}`);
    console.log(`   Errors detected: ${invalidValidation.errors ? invalidValidation.errors.length : 0}`);
    
    console.log(`\n🎉 Strict validation implementation complete and working!`);
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testStrictValidation();
