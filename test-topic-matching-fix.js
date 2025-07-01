// Test Topic Matching Fix - Verify that annotated database topics match expected topics
console.log('🧪 TESTING TOPIC MATCHING FIX');
console.log('===============================');

// Simulate expected topics (what frontend expects)
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

// Simulate annotated topics (what database actually has)
const DATABASE_TOPICS = [
  'D-1 Set-1 Matrix',
  'D-1 Set-2 Matrix',
  'D-4 Set-1 Matrix',
  'D-4 Set-2 Matrix',
  'D-9 Set-1 Matrix',
  'D-9 Set-2 Matrix',
  'D-11 Set-1 Matrix',
  'D-11 Set-2 Matrix',
  'D-81 Set-1 Matrix',
  'D-81 Set-2 Matrix',
  'D-108 Set-1 Matrix',
  'D-108 Set-2 Matrix',
  'D-144 Set-1 Matrix',
  'D-144 Set-2 Matrix',
  'D-5 (pv) Set-1 Matrix',
  'D-5 (pv) Set-2 Matrix',
  'D-3 (trd) Set-1 Matrix',
  'D-3 (trd) Set-2 Matrix',
  'D-30 (sh) Set-1 Matrix',
  'D-30 (sh) Set-2 Matrix',
  'D-7 (trd) Set-1 Matrix',
  'D-7 (trd) Set-2 Matrix',
  'D-10 (trd) Set-1 Matrix',
  'D-10 (trd) Set-2 Matrix',
  'D-12 (trd) Set-1 Matrix',
  'D-12 (trd) Set-2 Matrix',
  'D-27 (trd) Set-1 Matrix',
  'D-27 (trd) Set-2 Matrix',
  'D-60 (Trd) Set-1 Matrix',
  'D-60 (Trd) Set-2 Matrix'
];

// Implementation of the NEW topic matcher function
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

// Test the OLD method (broken)
console.log('❌ OLD METHOD (BROKEN):');
const oldFiltered = TOPIC_ORDER.filter(topicName => DATABASE_TOPICS.includes(topicName));
console.log(`   Topics found: ${oldFiltered.length}/30`);
console.log(`   Missing topics: ${30 - oldFiltered.length}`);

// Test the NEW method (fixed)
console.log('\n✅ NEW METHOD (FIXED):');
const topicMatcher = createTopicMatcher(TOPIC_ORDER, DATABASE_TOPICS);
const newFiltered = TOPIC_ORDER
  .filter(expectedTopic => topicMatcher.has(expectedTopic))
  .map(expectedTopic => topicMatcher.get(expectedTopic));

console.log(`   Topics found: ${newFiltered.length}/30`);
console.log(`   Missing topics: ${30 - newFiltered.length}`);

// Show mapping examples
console.log('\n🔍 MAPPING EXAMPLES:');
const mappingExamples = Array.from(topicMatcher.entries()).slice(0, 10);
mappingExamples.forEach(([expected, actual]) => {
  console.log(`   "${expected}" → "${actual}"`);
});

// Test natural topic sort with annotations
console.log('\n📊 NATURAL SORTING TEST:');
const unsortedTopics = [
  'D-60 (Trd) Set-1 Matrix',
  'D-3 (trd) Set-1 Matrix', 
  'D-10 (trd) Set-2 Matrix',
  'D-1 Set-1 Matrix',
  'D-144 Set-2 Matrix'
];

const naturalTopicSort = (topics) => {
  return topics.sort((a, b) => {
    // Extract the numeric part from "D-X" pattern (supports annotations)
    const extractNumber = (topic) => {
      // Enhanced pattern: D-NUMBER with optional annotations like (trd), (pv), (sh), (Trd)
      const match = topic.match(/D-(\d+)(?:\s*\([^)]*\))?/);
      return match ? parseInt(match[1], 10) : 0;
    };
    
    // Extract set number (Set-1 vs Set-2)
    const extractSetNumber = (topic) => {
      const match = topic.match(/Set-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };
    
    const numA = extractNumber(a);
    const numB = extractNumber(b);
    
    // First sort by the D-number
    if (numA !== numB) {
      return numA - numB;
    }
    
    // If D-numbers are equal, sort by Set number
    const setA = extractSetNumber(a);
    const setB = extractSetNumber(b);
    
    if (setA !== setB) {
      return setA - setB;
    }
    
    // If both D-number and Set number are equal, sort alphabetically
    return a.localeCompare(b);
  });
};

console.log('Before sorting:', unsortedTopics);
console.log('After sorting:', naturalTopicSort(unsortedTopics));

console.log('\n🎉 TOPIC MATCHING FIX TEST COMPLETE');
console.log('Expected result: All 30 topics should now be discoverable in frontend');
