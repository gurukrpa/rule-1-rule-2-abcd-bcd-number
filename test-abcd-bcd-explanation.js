#!/usr/bin/env node

// 📚 ABCD/BCD Logic Explanation with Examples
// This script demonstrates how ABCD/BCD analysis works with sample data

import { performAbcdBcdAnalysis } from './src/utils/abcdBcdAnalysis.js';

console.log('🎯 ABCD/BCD Logic Explanation with Examples\n');

// Example 1: Basic ABCD and BCD scenarios
console.log('📝 Example 1: Basic ABCD and BCD scenarios');
console.log('=====================================');

const example1 = {
  dDayNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  aDayNumbers: [1, 2, 7, 10, 11],      // A-day
  bDayNumbers: [1, 3, 4, 7, 12],       // B-day  
  cDayNumbers: [2, 5, 7, 8, 13]        // C-day
};

console.log('Input Data:');
console.log(`D-day: [${example1.dDayNumbers.join(', ')}]`);
console.log(`A-day: [${example1.aDayNumbers.join(', ')}]`);
console.log(`B-day: [${example1.bDayNumbers.join(', ')}]`);
console.log(`C-day: [${example1.cDayNumbers.join(', ')}]`);
console.log();

const result1 = performAbcdBcdAnalysis(
  example1.aDayNumbers,
  example1.bDayNumbers, 
  example1.cDayNumbers,
  example1.dDayNumbers,
  { 
    includeDetailedAnalysis: true, 
    logResults: false,
    setName: 'Example-1'
  }
);

console.log('📊 Analysis Results:');
console.log(`✅ ABCD Numbers: [${result1.abcdNumbers.join(', ')}]`);
console.log(`✅ BCD Numbers: [${result1.bcdNumbers.join(', ')}]`);
console.log();

console.log('🔍 Detailed Breakdown:');
for (const [num, details] of Object.entries(result1.detailedAnalysis)) {
  const status = details.qualified ? '✅' : '❌';
  console.log(`${status} Number ${num}: ${details.reason}`);
}

console.log('\n' + '='.repeat(50) + '\n');

// Example 2: Edge cases and priority rules
console.log('📝 Example 2: Priority Rules (ABCD takes priority over BCD)');
console.log('=========================================================');

const example2 = {
  dDayNumbers: [10, 20, 30, 40],
  aDayNumbers: [10, 20],          // A-day
  bDayNumbers: [10, 30],          // B-day
  cDayNumbers: [20, 30],          // C-day
};

console.log('Input Data:');
console.log(`D-day: [${example2.dDayNumbers.join(', ')}]`);
console.log(`A-day: [${example2.aDayNumbers.join(', ')}]`);
console.log(`B-day: [${example2.bDayNumbers.join(', ')}]`);
console.log(`C-day: [${example2.cDayNumbers.join(', ')}]`);
console.log();

const result2 = performAbcdBcdAnalysis(
  example2.aDayNumbers,
  example2.bDayNumbers,
  example2.cDayNumbers, 
  example2.dDayNumbers,
  { 
    includeDetailedAnalysis: true,
    logResults: false,
    setName: 'Example-2'
  }
);

console.log('📊 Analysis Results:');
console.log(`✅ ABCD Numbers: [${result2.abcdNumbers.join(', ')}]`);
console.log(`✅ BCD Numbers: [${result2.bcdNumbers.join(', ')}]`);
console.log();

console.log('🔍 Detailed Breakdown:');
for (const [num, details] of Object.entries(result2.detailedAnalysis)) {
  const status = details.qualified ? '✅' : '❌';
  console.log(`${status} Number ${num}: ${details.reason}`);
}

console.log('\n' + '='.repeat(50) + '\n');

// Example 3: Real-world scenario
console.log('📝 Example 3: Real-world Scenario');
console.log('================================');

const example3 = {
  dDayNumbers: [5, 7, 12, 15, 18, 23, 31, 45],
  aDayNumbers: [5, 12, 18, 25, 30],     // A-day
  bDayNumbers: [7, 12, 23, 28, 33],     // B-day
  cDayNumbers: [5, 15, 18, 31, 35]      // C-day
};

console.log('Input Data:');
console.log(`D-day: [${example3.dDayNumbers.join(', ')}]`);
console.log(`A-day: [${example3.aDayNumbers.join(', ')}]`);
console.log(`B-day: [${example3.bDayNumbers.join(', ')}]`);
console.log(`C-day: [${example3.cDayNumbers.join(', ')}]`);
console.log();

const result3 = performAbcdBcdAnalysis(
  example3.aDayNumbers,
  example3.bDayNumbers,
  example3.cDayNumbers,
  example3.dDayNumbers,
  { 
    includeDetailedAnalysis: true,
    logResults: false,
    setName: 'Example-3'
  }
);

console.log('📊 Analysis Results:');
console.log(`✅ ABCD Numbers: [${result3.abcdNumbers.join(', ')}]`);
console.log(`✅ BCD Numbers: [${result3.bcdNumbers.join(', ')}]`);
console.log();

console.log('🔍 Detailed Breakdown:');
for (const [num, details] of Object.entries(result3.detailedAnalysis)) {
  const status = details.qualified ? '✅' : '❌';
  console.log(`${status} Number ${num}: ${details.reason}`);
}

console.log(`\n📈 Summary Statistics: ${result3.summary.qualificationRate}% qualification rate`);

console.log('\n' + '🎯'.repeat(20));
console.log('\n📚 ABCD/BCD Logic Summary:');
console.log('1. ABCD Rule: D-day numbers in ≥2 of A, B, C days');
console.log('2. BCD Rule: D-day numbers in exclusive B-D or C-D pairs');
console.log('3. Priority: ABCD takes precedence over BCD');
console.log('4. Exclusivity: Numbers cannot be in both ABCD and BCD');
console.log('\n' + '🎯'.repeat(20));
