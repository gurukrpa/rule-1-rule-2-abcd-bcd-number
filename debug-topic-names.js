#!/usr/bin/env node

/**
 * DEBUG SCRIPT: Topic Name Investigation
 * 
 * This script investigates the topic name mismatch issue by:
 * 1. Examining the database key format: "D-1 Set-1 Matrix_2025-07-21_6_HR1"
 * 2. Understanding how topic names are processed and formatted
 * 3. Identifying any formatting inconsistencies
 */

console.log('🔍 TOPIC NAME INVESTIGATION SCRIPT');
console.log('=====================================');

// The problematic state key from the database
const savedStateKey = "D-1 Set-1 Matrix_2025-07-21_6_HR1";

console.log('📊 SAVED STATE KEY ANALYSIS:');
console.log('  Full key:', savedStateKey);

// Parse the key components
const keyParts = savedStateKey.split('_');
console.log('  Key parts:', keyParts);

if (keyParts.length >= 4) {
  const topicName = keyParts[0]; // "D-1 Set-1 Matrix"
  const dateKey = keyParts[1];   // "2025-07-21" 
  const numberValue = keyParts[2]; // "6"
  const hrPart = keyParts[3];    // "HR1"
  
  console.log('  Topic Name:', topicName);
  console.log('  Date Key:', dateKey);
  console.log('  Number Value:', numberValue);
  console.log('  HR Part:', hrPart);
}

console.log('\n🎯 EXPECTED KEY GENERATION:');
console.log('  For renderNumberBoxes to match the state, it needs:');
console.log('  - setName parameter = "D-1 Set-1 Matrix"');
console.log('  - dateKey parameter = "2025-07-21"');
console.log('  - number parameter = 6');
console.log('  - activeHR parameter = 1');

console.log('\n🧪 POSSIBLE TOPIC NAME VARIATIONS:');
const possibleVariations = [
  "D-1 Set-1 Matrix",
  "D-1(trd) Set-1 Matrix",
  "D-3 Set-1 Matrix", 
  "D-3(trd) Set-1 Matrix",
  "D Set-1 Matrix",
  "D-1 Matrix",
  "Set-1 Matrix",
  "Matrix"
];

possibleVariations.forEach(variation => {
  const testKey = `${variation}_2025-07-21_6_HR1`;
  const matches = testKey === savedStateKey;
  console.log(`  ${matches ? '✅' : '❌'} "${variation}" → "${testKey}"`);
});

console.log('\n🔑 KEY GENERATION PATTERN:');
console.log('  Expected pattern: {setName}_{dateKey}_{number}_HR{activeHR}');
console.log('  Actual state key:', savedStateKey);
console.log('  This suggests the setName parameter being passed is:', keyParts[0]);

console.log('\n💡 INVESTIGATION SUMMARY:');
console.log('  The database contains a key with topic name: "D-1 Set-1 Matrix"');
console.log('  If number boxes (6) are not getting styled, it means:');
console.log('  1. The setName parameter in renderNumberBoxes ≠ "D-1 Set-1 Matrix", OR');
console.log('  2. The dateKey parameter ≠ "2025-07-21", OR');
console.log('  3. The activeHR parameter ≠ 1');
console.log('  4. The key generation logic has a bug');

console.log('\n🎯 NEXT STEPS:');
console.log('  1. Check what setName values are actually being passed to renderNumberBoxes');  
console.log('  2. Check what dateKey values are being used');
console.log('  3. Verify activeHR value');
console.log('  4. Add debug logging in renderNumberBoxes to capture actual parameter values');
