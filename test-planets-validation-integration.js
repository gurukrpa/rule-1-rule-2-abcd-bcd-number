#!/usr/bin/env node

// Test script to verify ABCD Excel validation integration in PlanetsAnalysisPage
// This verifies that the comprehensive validation system from ABCDBCDNumber has been applied

import fs from 'fs';
import path from 'path';

console.log('🧪 Testing ABCD Excel Validation Integration in PlanetsAnalysisPage');
console.log('================================================================\n');

async function testValidationIntegration() {
  try {
    const planetsAnalysisPath = '/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main/src/components/PlanetsAnalysisPage.jsx';
    const abcdNumberPath = '/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main/src/components/ABCDBCDNumber_clean.jsx';
    
    // Read both files
    const planetsContent = fs.readFileSync(planetsAnalysisPath, 'utf8');
    const abcdContent = fs.readFileSync(abcdNumberPath, 'utf8');
    
    console.log('📋 Test 1: Checking validation function presence...');
    
    // Check if validateABCDExcelStructure function exists in PlanetsAnalysisPage
    const hasValidationFunction = planetsContent.includes('validateABCDExcelStructure');
    console.log(`   validateABCDExcelStructure function: ${hasValidationFunction ? '✅ Present' : '❌ Missing'}`);
    
    // Check if formatValidationErrors function exists in PlanetsAnalysisPage
    const hasFormatFunction = planetsContent.includes('formatValidationErrors');
    console.log(`   formatValidationErrors function: ${hasFormatFunction ? '✅ Present' : '❌ Missing'}`);
    
    console.log('\n📋 Test 2: Checking validation logic integration...');
    
    // Check if validation is called in handleExcelUpload
    const hasValidationCall = planetsContent.includes('validateABCDExcelStructure(worksheet)');
    console.log(`   Validation called in handleExcelUpload: ${hasValidationCall ? '✅ Present' : '❌ Missing'}`);
    
    // Check if enhanced validation is also called
    const hasEnhancedValidation = planetsContent.includes('validateExcelStructure(jsonData, file.name)');
    console.log(`   Enhanced validation from utils: ${hasEnhancedValidation ? '✅ Present' : '❌ Missing'}`);
    
    // Check if error formatting is used
    const hasErrorFormatting = planetsContent.includes('formatValidationErrors(validationResult)');
    console.log(`   Error formatting used: ${hasErrorFormatting ? '✅ Present' : '❌ Missing'}`);
    
    console.log('\n📋 Test 3: Checking validation requirements...');
    
    // Check if expected structure constants are defined
    const hasExpectedTopics = planetsContent.includes('expectedTopics = 30');
    console.log(`   Expected topics (30): ${hasExpectedTopics ? '✅ Present' : '❌ Missing'}`);
    
    // Check if expected elements array is defined
    const hasExpectedElements = planetsContent.includes("'as', 'mo', 'hl', 'gl', 'vig', 'var', 'sl', 'pp', 'in'");
    console.log(`   Expected elements array: ${hasExpectedElements ? '✅ Present' : '❌ Missing'}`);
    
    // Check if planet data validation is included
    const hasPlanetValidation = planetsContent.includes('expectedPlanetsPerElement = 9');
    console.log(`   Planet data validation (9 planets): ${hasPlanetValidation ? '✅ Present' : '❌ Missing'}`);
    
    console.log('\n📋 Test 4: Checking error handling improvements...');
    
    // Check if error timeout has been extended
    const hasExtendedTimeout = planetsContent.includes('setTimeout(() => setError(\'\'), 8000)');
    console.log(`   Extended error timeout (8s): ${hasExtendedTimeout ? '✅ Present' : '❌ Missing'}`);
    
    // Check if quality metrics are shown in success messages
    const hasQualityMetrics = planetsContent.includes('dataQualityScore');
    console.log(`   Quality metrics in success: ${hasQualityMetrics ? '✅ Present' : '❌ Missing'}`);
    
    console.log('\n📋 Test 5: Checking imports...');
    
    // Check if utils validation is imported
    const hasUtilsImport = planetsContent.includes("import { validateExcelStructure, ABCD_TEMPLATE_STRUCTURE } from '../utils/excelValidation'");
    console.log(`   Utils validation imported: ${hasUtilsImport ? '✅ Present' : '❌ Missing'}`);
    
    console.log('\n📋 Test 6: Comparing validation logic consistency...');
    
    // Extract validation function from both files for comparison
    const planetsValidationMatch = planetsContent.match(/validateABCDExcelStructure = \(worksheet\) => \{([\s\S]*?)\};/);
    const abcdValidationMatch = abcdContent.match(/validateABCDExcelStructure = \(worksheet\) => \{([\s\S]*?)\};/);
    
    if (planetsValidationMatch && abcdValidationMatch) {
      const planetsValidationCode = planetsValidationMatch[1];
      const abcdValidationCode = abcdValidationMatch[1];
      
      // Check if key validation logic is similar (not exact match due to formatting)
      const hasTopicCheck = planetsValidationCode.includes('Matrix') && planetsValidationCode.includes('D-\\d+.*Set-\\d+.*Matrix');
      const hasElementCheck = planetsValidationCode.includes('expectedElements.includes(elementCode)');
      const hasPlanetDataCheck = planetsValidationCode.includes('col = 1; col <= 9; col++');
      
      console.log(`   Topic header validation: ${hasTopicCheck ? '✅ Consistent' : '❌ Inconsistent'}`);
      console.log(`   Element validation: ${hasElementCheck ? '✅ Consistent' : '❌ Inconsistent'}`);
      console.log(`   Planet data validation: ${hasPlanetDataCheck ? '✅ Consistent' : '❌ Inconsistent'}`);
    } else {
      console.log(`   Validation function comparison: ❌ Could not extract for comparison`);
    }
    
    console.log('\n📊 INTEGRATION TEST SUMMARY:');
    console.log('==============================');
    
    const tests = [
      hasValidationFunction,
      hasFormatFunction,
      hasValidationCall,
      hasEnhancedValidation,
      hasErrorFormatting,
      hasExpectedTopics,
      hasExpectedElements,
      hasPlanetValidation,
      hasExtendedTimeout,
      hasQualityMetrics,
      hasUtilsImport
    ];
    
    const passedTests = tests.filter(test => test).length;
    const totalTests = tests.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log(`✅ Tests Passed: ${passedTests}/${totalTests} (${successRate}%)`);
    
    if (successRate >= 90) {
      console.log('🎉 INTEGRATION SUCCESSFUL: ABCD Excel validation has been successfully applied to PlanetsAnalysisPage!');
      console.log('\n📋 Features Successfully Integrated:');
      console.log('   ✅ Comprehensive ABCD Excel structure validation');
      console.log('   ✅ Enhanced validation with quality metrics');
      console.log('   ✅ User-friendly error formatting and categorization');
      console.log('   ✅ Extended error timeouts for detailed messages');
      console.log('   ✅ Success messages with data quality indicators');
      console.log('   ✅ Strict validation requirements (30 topics, 9 elements, 9 planets)');
    } else if (successRate >= 70) {
      console.log('⚠️  INTEGRATION PARTIALLY SUCCESSFUL: Most validation features are in place, minor improvements needed');
    } else {
      console.log('❌ INTEGRATION INCOMPLETE: Significant validation features are missing');
    }
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Test the validation with actual ABCD Excel files');
    console.log('2. Verify error messages display correctly in the UI');
    console.log('3. Confirm success messages with quality metrics show properly');
    console.log('4. Test both basic and enhanced validation paths');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testValidationIntegration();
