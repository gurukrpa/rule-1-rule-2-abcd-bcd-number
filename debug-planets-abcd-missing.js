#!/usr/bin/env node
/**
 * DEBUG: Check what topics are missing ABCD/BCD numbers in PlanetsAnalysisPage
 * This script will help identify which topics are not in the TOPIC_NUMBERS object
 */

// Extract the TOPIC_NUMBERS from PlanetsAnalysisPage.jsx
const TOPIC_NUMBERS = {
  'D-1 Set-1 Matrix': { abcd: [10, 12], bcd: [4, 11] },
  'D-1 Set-2 Matrix': { abcd: [1], bcd: [3, 4, 9] },
  'D-3 Set-1 Matrix': { abcd: [1, 2, 8, 11], bcd: [4, 6] },
  'D-3 Set-2 Matrix': { abcd: [5, 9, 10, 11], bcd: [3, 4] },
  'D-4 Set-1 Matrix': { abcd: [2, 5, 6, 8], bcd: [1, 4, 12] },
  'D-4 Set-2 Matrix': { abcd: [3, 5, 6, 10, 11], bcd: [7, 9] },
  'D-5 Set-1 Matrix': { abcd: [2, 9], bcd: [] },
  'D-5 Set-2 Matrix': { abcd: [1, 6, 10], bcd: [] },
  'D-7 Set-1 Matrix': { abcd: [1, 5, 7, 10, 11, 12], bcd: [4, 9] },
  'D-7 Set-2 Matrix': { abcd: [1, 3, 4, 6, 7, 10], bcd: [2] },
  'D-9 Set-1 Matrix': { abcd: [3, 11], bcd: [2, 7] },
  'D-9 Set-2 Matrix': { abcd: [4, 7, 9, 12], bcd: [5] },
  'D-10 Set-1 Matrix': { abcd: [2, 7, 8, 10], bcd: [4] },
  'D-10 Set-2 Matrix': { abcd: [3, 8, 9, 11], bcd: [5] },
  'D-11 Set-1 Matrix': { abcd: [4, 7, 8, 9, 12], bcd: [6] },
  'D-11 Set-2 Matrix': { abcd: [1, 5, 6, 9], bcd: [2, 4, 12] },
  'D-12 Set-1 Matrix': { abcd: [4, 5, 12], bcd: [6, 7, 9] },
  'D-12 Set-2 Matrix': { abcd: [6, 8, 9, 10], bcd: [3, 5] },
  'D-27 Set-1 Matrix': { abcd: [4, 7], bcd: [11] },
  'D-27 Set-2 Matrix': { abcd: [2, 7], bcd: [12] },
  'D-30 Set-1 Matrix': { abcd: [1, 2, 6], bcd: [7, 10, 11] },
  'D-30 Set-2 Matrix': { abcd: [1, 2, 9, 10], bcd: [4, 11] },
  'D-60 Set-1 Matrix': { abcd: [1, 4, 5, 6], bcd: [3, 9] },
  'D-60 Set-2 Matrix': { abcd: [3, 8, 9, 12], bcd: [6, 10] },
  'D-81 Set-1 Matrix': { abcd: [5, 6, 7, 12], bcd: [3] },
  'D-81 Set-2 Matrix': { abcd: [3, 9, 10], bcd: [2] },
  'D-108 Set-1 Matrix': { abcd: [2, 4, 6, 8], bcd: [9, 10] },
  'D-108 Set-2 Matrix': { abcd: [1, 5, 6, 12], bcd: [4, 8] },
  'D-144 Set-1 Matrix': { abcd: [9, 10, 11], bcd: [2, 3, 4, 5, 12] },
  'D-144 Set-2 Matrix': { abcd: [1, 4, 6, 8], bcd: [3, 11, 12] }
};

// Standard TOPIC_ORDER from IndexPage (30 topics)
const TOPIC_ORDER = [
  'D-1 Set-1 Matrix',
  'D-1 Set-2 Matrix',
  'D-3 Set-1 Matrix',
  'D-3 Set-2 Matrix',
  'D-4 Set-1 Matrix',
  'D-4 Set-2 Matrix',
  'D-5 Set-1 Matrix',
  'D-5 Set-2 Matrix',
  'D-7 Set-1 Matrix',
  'D-7 Set-2 Matrix',
  'D-9 Set-1 Matrix',
  'D-9 Set-2 Matrix',
  'D-10 Set-1 Matrix',
  'D-10 Set-2 Matrix',
  'D-11 Set-1 Matrix',
  'D-11 Set-2 Matrix',
  'D-12 Set-1 Matrix',
  'D-12 Set-2 Matrix',
  'D-27 Set-1 Matrix',
  'D-27 Set-2 Matrix',
  'D-30 Set-1 Matrix',
  'D-30 Set-2 Matrix',
  'D-60 Set-1 Matrix',
  'D-60 Set-2 Matrix',
  'D-81 Set-1 Matrix',
  'D-81 Set-2 Matrix',
  'D-108 Set-1 Matrix',
  'D-108 Set-2 Matrix',
  'D-144 Set-1 Matrix',
  'D-144 Set-2 Matrix'
];

// Simulate what happens in your Excel upload - topics might have annotations
const POSSIBLE_EXCEL_TOPICS = [
  // Standard clean names
  ...TOPIC_ORDER,
  
  // Potential annotated names from database
  'D-1 (trd) Set-1 Matrix',
  'D-1 (pv) Set-2 Matrix',
  'D-3 (trd) Set-1 Matrix',
  'D-3 (pv) Set-2 Matrix',
  'D-150 Set-1 Matrix',      // New topic not in TOPIC_ORDER
  'D-150 Set-2 Matrix',      // New topic not in TOPIC_ORDER
  'D-300 Set-1 Matrix',      // New topic not in TOPIC_ORDER
  'D-300 Set-2 Matrix',      // New topic not in TOPIC_ORDER
  'D-2 Set-1 Matrix',        // Potential new topic
  'D-2 Set-2 Matrix',        // Potential new topic
  'D-6 Set-1 Matrix',        // Potential new topic
  'D-6 Set-2 Matrix',        // Potential new topic
  'D-8 Set-1 Matrix',        // Potential new topic
  'D-8 Set-2 Matrix'         // Potential new topic
];

console.log('🔍 ANALYZING: PlanetsAnalysisPage ABCD/BCD Topic Coverage');
console.log('='.repeat(65));

// Test 1: Check if all TOPIC_ORDER topics have ABCD/BCD numbers
console.log('\n✅ TEST 1: Standard TOPIC_ORDER Coverage');
const missingInTopicNumbers = [];
const coveredTopics = [];

TOPIC_ORDER.forEach(topic => {
  if (TOPIC_NUMBERS[topic]) {
    const { abcd, bcd } = TOPIC_NUMBERS[topic];
    coveredTopics.push(topic);
    console.log(`  ✅ ${topic}: ABCD[${abcd.length}] BCD[${bcd.length}]`);
  } else {
    missingInTopicNumbers.push(topic);
    console.log(`  ❌ ${topic}: NO ABCD/BCD NUMBERS`);
  }
});

console.log(`\n📊 TOPIC_ORDER Coverage: ${coveredTopics.length}/${TOPIC_ORDER.length} topics`);
if (missingInTopicNumbers.length > 0) {
  console.log(`❌ Missing: ${missingInTopicNumbers.join(', ')}`);
} else {
  console.log(`✅ All TOPIC_ORDER topics have ABCD/BCD numbers`);
}

// Test 2: Check for extra topics in TOPIC_NUMBERS not in TOPIC_ORDER
console.log('\n📋 TEST 2: Extra Topics in TOPIC_NUMBERS');
const extraTopics = Object.keys(TOPIC_NUMBERS).filter(topic => !TOPIC_ORDER.includes(topic));
if (extraTopics.length > 0) {
  console.log('Extra topics found in TOPIC_NUMBERS but not in TOPIC_ORDER:');
  extraTopics.forEach(topic => {
    const { abcd, bcd } = TOPIC_NUMBERS[topic];
    console.log(`  📄 ${topic}: ABCD[${abcd.length}] BCD[${bcd.length}]`);
  });
} else {
  console.log('✅ No extra topics - TOPIC_NUMBERS matches TOPIC_ORDER perfectly');
}

// Test 3: Simulate what would happen with new Excel topics
console.log('\n🧪 TEST 3: Simulated Excel Upload with New Topics');
const newTopicsFromExcel = [
  'D-150 Set-1 Matrix',
  'D-150 Set-2 Matrix', 
  'D-300 Set-1 Matrix',
  'D-300 Set-2 Matrix',
  'D-2 Set-1 Matrix',
  'D-6 Set-1 Matrix'
];

const getTopicNumbers = (setName) => {
  if (TOPIC_NUMBERS[setName]) {
    return TOPIC_NUMBERS[setName];
  }
  // Fallback logic from PlanetsAnalysisPage.jsx
  return { abcd: [], bcd: [] };
};

console.log('Simulating getTopicNumbers() for new topics:');
newTopicsFromExcel.forEach(topic => {
  const numbers = getTopicNumbers(topic);
  const hasNumbers = numbers.abcd.length > 0 || numbers.bcd.length > 0;
  console.log(`  ${hasNumbers ? '✅' : '❌'} ${topic}: ABCD[${numbers.abcd.length}] BCD[${numbers.bcd.length}]`);
});

// Solution recommendations
console.log('\n🎯 ANALYSIS RESULTS:');
if (missingInTopicNumbers.length > 0) {
  console.log('❌ ISSUE: Some TOPIC_ORDER topics missing from TOPIC_NUMBERS');
  console.log('🔧 SOLUTION: Add missing topics to TOPIC_NUMBERS object');
} else if (extraTopics.length > 0) {
  console.log('⚠️  ISSUE: Extra topics in TOPIC_NUMBERS not in TOPIC_ORDER');
  console.log('🔧 SOLUTION: Either add to TOPIC_ORDER or remove from TOPIC_NUMBERS');
} else {
  console.log('✅ PERFECT: TOPIC_NUMBERS covers all TOPIC_ORDER topics');
}

console.log('\n💡 RECOMMENDATIONS:');
console.log('1. If you see "❌" for any topic, those topics will have no ABCD/BCD badges');
console.log('2. New topics from Excel upload (not in TOPIC_NUMBERS) will have empty ABCD/BCD arrays');
console.log('3. To fix: Add the missing topics to TOPIC_NUMBERS with their ABCD/BCD values');
console.log('4. Check console logs in browser for messages like "⚠️ [Topic: xxx] Using FALLBACK numbers"');

console.log('\n🔧 DEBUGGING TIPS:');
console.log('- Upload your Excel file and check browser console');
console.log('- Look for log messages: "🗄️ [Topic: xxx] Using DATABASE numbers" vs "⚠️ [Topic: xxx] Using FALLBACK numbers"');
console.log('- Topics using FALLBACK with empty arrays will have no ABCD/BCD badges');
console.log('- Add the missing topic to TOPIC_NUMBERS or implement database integration');
