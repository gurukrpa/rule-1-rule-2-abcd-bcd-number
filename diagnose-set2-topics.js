#!/usr/bin/env node

/**
 * 🔍 SET-2 TOPICS DIAGNOSTIC SCRIPT
 * 
 * This script checks all Set-2 topics in the TOPIC_NUMBERS mapping
 * to identify which ones have empty ABCD/BCD arrays.
 */

console.log('🔍 SET-2 TOPICS DIAGNOSTIC');
console.log('='.repeat(50));

// Hardcoded TOPIC_NUMBERS from PlanetsAnalysisPage.jsx for analysis
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

// Filter all Set-2 topics
const set2Topics = Object.entries(TOPIC_NUMBERS)
  .filter(([topic]) => topic.includes('Set-2'))
  .map(([topic, numbers]) => ({
    topic,
    abcd: numbers.abcd,
    bcd: numbers.bcd,
    isEmpty: numbers.abcd.length === 0 && numbers.bcd.length === 0
  }));

console.log('📊 SET-2 TOPICS ANALYSIS:');
console.log('='.repeat(30));

let emptyCount = 0;
let totalCount = set2Topics.length;

set2Topics.forEach((topicData, index) => {
  const status = topicData.isEmpty ? '❌ EMPTY' : '✅ HAS DATA';
  const abcdDisplay = topicData.abcd.length > 0 ? `[${topicData.abcd.join(', ')}]` : '[]';
  const bcdDisplay = topicData.bcd.length > 0 ? `[${topicData.bcd.join(', ')}]` : '[]';
  
  console.log(`${(index + 1).toString().padStart(2, '0')}. ${topicData.topic.padEnd(25)} ${status}`);
  console.log(`    ABCD: ${abcdDisplay.padEnd(25)} BCD: ${bcdDisplay}`);
  
  if (topicData.isEmpty) {
    emptyCount++;
  }
});

console.log('\n🎯 SUMMARY:');
console.log('='.repeat(20));
console.log(`Total Set-2 topics: ${totalCount}`);
console.log(`Topics with data: ${totalCount - emptyCount}`);
console.log(`Empty topics: ${emptyCount}`);

if (emptyCount > 0) {
  console.log('\n⚠️ ISSUES FOUND:');
  console.log(`${emptyCount} Set-2 topics have empty ABCD/BCD arrays`);
  
  // List empty topics
  const emptyTopics = set2Topics.filter(t => t.isEmpty);
  emptyTopics.forEach(topic => {
    console.log(`   - ${topic.topic}`);
  });
  
  console.log('\n🔧 SUGGESTED ACTION:');
  console.log('1. Get correct ABCD/BCD numbers for the empty Set-2 topics above');
  console.log('2. Update TOPIC_NUMBERS mapping in PlanetsAnalysisPage.jsx');
} else {
  console.log('\n✅ ALL SET-2 TOPICS HAVE DATA IN FALLBACK MAPPING');
  console.log('\n❓ If numbers still not showing in browser, possible causes:');
  console.log('1. Database mode is active and overriding fallback values');
  console.log('2. Excel data does not contain the expected Set-2 topics');
  console.log('3. Logic error in getTopicNumbers() or renderABCDBadges()');
  console.log('4. Browser cache needs clearing');
}

// Check for topics with only ABCD or only BCD
console.log('\n🔍 DETAILED ANALYSIS:');
console.log('='.repeat(25));

const onlyAbcd = set2Topics.filter(t => t.abcd.length > 0 && t.bcd.length === 0);
const onlyBcd = set2Topics.filter(t => t.abcd.length === 0 && t.bcd.length > 0);
const both = set2Topics.filter(t => t.abcd.length > 0 && t.bcd.length > 0);

console.log(`Topics with only ABCD: ${onlyAbcd.length}`);
onlyAbcd.forEach(t => console.log(`   - ${t.topic}: ABCD[${t.abcd.join(', ')}]`));

console.log(`Topics with only BCD: ${onlyBcd.length}`);
onlyBcd.forEach(t => console.log(`   - ${t.topic}: BCD[${t.bcd.join(', ')}]`));

console.log(`Topics with both ABCD & BCD: ${both.length}`);
both.forEach(t => console.log(`   - ${t.topic}: ABCD[${t.abcd.join(', ')}] BCD[${t.bcd.join(', ')}]`));
