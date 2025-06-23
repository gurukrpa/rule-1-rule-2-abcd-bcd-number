#!/usr/bin/env node

// Test script for Enhanced ABCD/BCD Analysis Logic
// This demonstrates the improved functionality of the centralized utility

import { performAbcdBcdAnalysis, performBatchAnalysis, validateAnalysisInputs } from './src/utils/abcdBcdAnalysis.js';

console.log('🧪 Testing Enhanced ABCD/BCD Analysis Logic\n');

// Test Case 1: Basic ABCD/BCD Analysis
console.log('='.repeat(60));
console.log('📊 TEST CASE 1: Basic ABCD/BCD Analysis');
console.log('='.repeat(60));

const testCase1 = {
  aDayNumbers: [5, 7, 12, 15],
  bDayNumbers: [7, 10, 12, 18],
  cDayNumbers: [12, 15, 20, 25],
  dDayNumbers: [5, 7, 10, 12, 15, 18, 20]
};

const result1 = performAbcdBcdAnalysis(
  testCase1.aDayNumbers,
  testCase1.bDayNumbers,
  testCase1.cDayNumbers,
  testCase1.dDayNumbers,
  {
    includeDetailedAnalysis: true,
    logResults: true,
    setName: 'Test Set 1'
  }
);

console.log('\n📋 Summary for Test Case 1:');
console.log(`   ABCD Numbers: [${result1.abcdNumbers.join(', ')}]`);
console.log(`   BCD Numbers: [${result1.bcdNumbers.join(', ')}]`);
console.log(`   Qualification Rate: ${result1.summary.qualificationRate}%`);

// Test Case 2: Edge Case - Mutual Exclusivity
console.log('\n' + '='.repeat(60));
console.log('📊 TEST CASE 2: Mutual Exclusivity (ABCD Priority)');
console.log('='.repeat(60));

const testCase2 = {
  aDayNumbers: [1, 2],
  bDayNumbers: [1, 3],
  cDayNumbers: [1, 3],  // Number 1 qualifies for both ABCD and BCD
  dDayNumbers: [1, 2, 3]
};

const result2 = performAbcdBcdAnalysis(
  testCase2.aDayNumbers,
  testCase2.bDayNumbers,
  testCase2.cDayNumbers,
  testCase2.dDayNumbers,
  {
    includeDetailedAnalysis: true,
    logResults: true,
    setName: 'Test Set 2 - Mutual Exclusivity'
  }
);

console.log('\n📋 Expected: Number 1 should be ABCD (not BCD due to priority)');
console.log(`   ABCD Numbers: [${result2.abcdNumbers.join(', ')}]`);
console.log(`   BCD Numbers: [${result2.bcdNumbers.join(', ')}]`);

// Test Case 3: Input Validation
console.log('\n' + '='.repeat(60));
console.log('📊 TEST CASE 3: Input Validation');
console.log('='.repeat(60));

const validationTest1 = validateAnalysisInputs([], [1, 2], [3, 4], []);
console.log('🔍 Empty D-day numbers validation:', validationTest1);

const validationTest2 = validateAnalysisInputs([1, 2], ['invalid'], [3, 4], [1, 2, 3]);
console.log('🔍 Invalid numbers validation:', validationTest2);

// Test Case 4: Batch Analysis
console.log('\n' + '='.repeat(60));
console.log('📊 TEST CASE 4: Batch Analysis');
console.log('='.repeat(60));

const batchData = {
  'D-1 Set-1 Matrix': {
    aDayNumbers: [1, 2, 3],
    bDayNumbers: [2, 4, 5],
    cDayNumbers: [3, 5, 6],
    dDayNumbers: [1, 2, 3, 4, 5, 6]
  },
  'D-1 Set-2 Matrix': {
    aDayNumbers: [7, 8],
    bDayNumbers: [8, 9],
    cDayNumbers: [9, 10],
    dDayNumbers: [7, 8, 9, 10]
  }
};

const batchResult = performBatchAnalysis(batchData, {
  logResults: true,
  includeDetailedAnalysis: false
});

console.log('\n📋 Batch Analysis Summary:');
console.log(`   Total Sets Processed: ${batchResult.summary.totalSets}`);
console.log(`   Total ABCD Numbers: ${batchResult.summary.totalAbcdNumbers}`);
console.log(`   Total BCD Numbers: ${batchResult.summary.totalBcdNumbers}`);

// Test Case 5: Error Handling
console.log('\n' + '='.repeat(60));
console.log('📊 TEST CASE 5: Error Handling');
console.log('='.repeat(60));

const errorResult = performAbcdBcdAnalysis(
  [1, 2],
  [3, 4],
  [5, 6],
  [], // Empty D-day numbers
  {
    logResults: true,
    setName: 'Error Test'
  }
);

console.log('\n📋 Error handling result:');
console.log(`   Error: ${errorResult.error}`);
console.log(`   ABCD Numbers: [${errorResult.abcdNumbers.join(', ')}]`);
console.log(`   BCD Numbers: [${errorResult.bcdNumbers.join(', ')}]`);

console.log('\n' + '='.repeat(60));
console.log('✅ Enhanced ABCD/BCD Analysis Testing Complete!');
console.log('🎯 Key Improvements Demonstrated:');
console.log('   ✓ Centralized logic for consistency');
console.log('   ✓ Detailed analysis with explanations');
console.log('   ✓ Input validation and error handling');
console.log('   ✓ Batch processing capabilities');
console.log('   ✓ Proper mutual exclusivity (ABCD priority)');
console.log('   ✓ Comprehensive logging and debugging');
console.log('='.repeat(60));
