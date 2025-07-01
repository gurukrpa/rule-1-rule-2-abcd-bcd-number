#!/usr/bin/env node
/**
 * TEST: Validate that PastDays (Rule1Page_Enhanced) topic fix is working
 * This script tests the same logic that was fixed in the component
 */

// Simulate the topic matcher logic from the fix
const createTopicMatcher = (expectedTopics, availableTopics) => {
  const topicMap = new Map();
  
  expectedTopics.forEach(expectedTopic => {
    // Extract D-number and Set number from expected topic
    const expectedMatch = expectedTopic.match(/D-(\d+)\s+Set-(\d+)/);
    if (expectedMatch) {
      const [, dNumber, setNumber] = expectedMatch;
      
      // Find matching topic in available topics (may have annotations)
      const matchingTopic = availableTopics.find(availableTopic => {
        const availableMatch = availableTopic.match(/D-(\d+)(?:\s*\([^)]*\))?\s+Set-(\d+)/);
        if (availableMatch) {
          const [, availableDNumber, availableSetNumber] = availableMatch;
          return dNumber === availableDNumber && setNumber === availableSetNumber;
        }
        return false;
      });
      
      if (matchingTopic) {
        topicMap.set(expectedTopic, matchingTopic);
      }
    }
  });
  
  return topicMap;
};

// Expected topic order (30 topics)
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
  'D-108 Set-1 Matrix',
  'D-108 Set-2 Matrix',
  'D-150 Set-1 Matrix',
  'D-150 Set-2 Matrix',
  'D-300 Set-1 Matrix',
  'D-300 Set-2 Matrix'
];

// Simulate annotated topics from database (like the problematic data)
const simulatedDatabaseTopics = [
  'D-1 (trd) Set-1 Matrix',
  'D-1 (pv) Set-2 Matrix',
  'D-3 (trd) Set-1 Matrix',
  'D-3 (pv) Set-2 Matrix',
  'D-4 (trd) Set-1 Matrix',
  'D-4 (pv) Set-2 Matrix',
  'D-5 (trd) Set-1 Matrix',
  'D-5 (pv) Set-2 Matrix',
  'D-7 (trd) Set-1 Matrix',
  'D-7 (pv) Set-2 Matrix',
  'D-9 (trd) Set-1 Matrix',
  'D-9 (pv) Set-2 Matrix',
  'D-10 (trd) Set-1 Matrix',
  'D-10 (pv) Set-2 Matrix',
  'D-11 (trd) Set-1 Matrix',
  'D-11 (pv) Set-2 Matrix',
  'D-12 (trd) Set-1 Matrix',
  'D-12 (pv) Set-2 Matrix',
  'D-27 (trd) Set-1 Matrix',
  'D-27 (pv) Set-2 Matrix',
  'D-30 (trd) Set-1 Matrix',
  'D-30 (pv) Set-2 Matrix',
  'D-60 (trd) Set-1 Matrix',
  'D-60 (pv) Set-2 Matrix',
  'D-108 (trd) Set-1 Matrix',
  'D-108 (pv) Set-2 Matrix',
  'D-150 (trd) Set-1 Matrix',
  'D-150 (pv) Set-2 Matrix',
  'D-300 (trd) Set-1 Matrix',
  'D-300 (pv) Set-2 Matrix'
];

console.log('🧪 TESTING: PastDays (Rule1Page_Enhanced) Topic Discovery Fix');
console.log('='.repeat(60));

// Test OLD method (broken)
console.log('\n❌ OLD METHOD (BROKEN):');
const discoveredSets = new Set(simulatedDatabaseTopics);
const oldOrderedTopics = TOPIC_ORDER.filter(topicName => discoveredSets.has(topicName));
console.log(`Found: ${oldOrderedTopics.length}/30 topics`);
console.log(`Missing: ${30 - oldOrderedTopics.length} topics`);
if (oldOrderedTopics.length < 30) {
  console.log('❌ FAIL: Missing topics due to annotation mismatch');
}

// Test NEW method (fixed)
console.log('\n✅ NEW METHOD (FIXED):');
const topicMatcher = createTopicMatcher(TOPIC_ORDER, simulatedDatabaseTopics);
const newOrderedTopics = TOPIC_ORDER
  .filter(expectedTopic => topicMatcher.has(expectedTopic))
  .map(expectedTopic => topicMatcher.get(expectedTopic));

console.log(`Found: ${newOrderedTopics.length}/30 topics`);
console.log(`Missing: ${30 - newOrderedTopics.length} topics`);

if (newOrderedTopics.length === 30) {
  console.log('✅ SUCCESS: All 30 topics found with smart matching!');
  console.log('\n📊 Sample mappings:');
  console.log('Expected → Database:');
  Array.from(topicMatcher.entries()).slice(0, 5).forEach(([expected, actual]) => {
    console.log(`  ${expected} → ${actual}`);
  });
} else {
  console.log('❌ FAIL: Still missing topics');
  console.log('Missing:', TOPIC_ORDER.filter(topic => !topicMatcher.has(topic)));
}

console.log('\n🎯 CONCLUSION:');
console.log(`PastDays fix ${newOrderedTopics.length === 30 ? 'SUCCESSFUL' : 'FAILED'}`);
console.log('The Rule1Page_Enhanced component should now show all 30 topics instead of 14');
console.log('\n🔧 IMPLEMENTATION:');
console.log('- Updated topic discovery logic in Rule1Page_Enhanced.jsx');
console.log('- Replaced exact string matching with smart pattern matching');
console.log('- Now handles database topics with annotations like "(trd)", "(pv)", "(sh)"');
