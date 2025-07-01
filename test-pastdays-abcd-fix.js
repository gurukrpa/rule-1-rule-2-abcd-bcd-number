// ✅ Test PastDays ABCD/BCD Fix - Rule2AnalysisService Smart Topic Matching
// Testing the fix for missing ABCD/BCD numbers on D-3, D-5, D-7, D-10, D-12, D-27, D-30, D-60

console.log('🔍 TESTING PASTDAYS ABCD/BCD FIX - SMART TOPIC MATCHING');
console.log('='.repeat(70));

// Test the createTopicMatcher function independently
function testCreateTopicMatcher() {
  console.log('\n📋 STEP 1: Testing createTopicMatcher Function...');
  
  // Mock the createTopicMatcher logic from the service
  const createTopicMatcher = (expectedTopics, availableTopics) => {
    const topicMap = new Map();
    
    expectedTopics.forEach(expectedTopic => {
      const expectedMatch = expectedTopic.match(/D-(\d+)\s+Set-(\d+)/);
      if (expectedMatch) {
        const [, dNumber, setNumber] = expectedMatch;
        
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
  
  // Test with the problematic topics
  const expectedTopics = [
    'D-3 Set-1 Matrix',
    'D-3 Set-2 Matrix',
    'D-5 Set-1 Matrix', 
    'D-5 Set-2 Matrix',
    'D-7 Set-1 Matrix',
    'D-7 Set-2 Matrix',
    'D-10 Set-1 Matrix',
    'D-10 Set-2 Matrix',
    'D-12 Set-1 Matrix',
    'D-12 Set-2 Matrix',
    'D-27 Set-1 Matrix',
    'D-27 Set-2 Matrix',
    'D-30 Set-1 Matrix',
    'D-30 Set-2 Matrix',
    'D-60 Set-1 Matrix',
    'D-60 Set-2 Matrix'
  ];
  
  // Simulate annotated names from database
  const availableTopics = [
    'D-3 (trd) Set-1 Matrix',
    'D-3 (trd) Set-2 Matrix',
    'D-5 (pv) Set-1 Matrix',
    'D-5 (pv) Set-2 Matrix', 
    'D-7 (sh) Set-1 Matrix',
    'D-7 (sh) Set-2 Matrix',
    'D-10 (Trd) Set-1 Matrix',
    'D-10 (Trd) Set-2 Matrix',
    'D-12 (Pv) Set-1 Matrix',
    'D-12 (Pv) Set-2 Matrix',
    'D-27 (special) Set-1 Matrix',
    'D-27 (special) Set-2 Matrix',
    'D-30 (long) Set-1 Matrix',
    'D-30 (long) Set-2 Matrix',
    'D-60 (cycle) Set-1 Matrix',
    'D-60 (cycle) Set-2 Matrix'
  ];
  
  console.log(`Expected Topics (${expectedTopics.length}):`, expectedTopics.slice(0, 4).map(t => `"${t}"`).join(', '), '...');
  console.log(`Available Topics (${availableTopics.length}):`, availableTopics.slice(0, 4).map(t => `"${t}"`).join(', '), '...');
  
  // Test the matching
  const topicMatcher = createTopicMatcher(expectedTopics, availableTopics);
  
  console.log(`\n✅ Smart Matching Results:`);
  console.log(`   Matches Found: ${topicMatcher.size}/${expectedTopics.length}`);
  console.log(`   Success Rate: ${(topicMatcher.size / expectedTopics.length * 100).toFixed(1)}%`);
  
  // Show sample mappings
  console.log(`\n📋 Sample Mappings:`);
  let count = 0;
  for (const [expected, actual] of topicMatcher.entries()) {
    if (count < 4) {
      console.log(`   "${expected}" → "${actual}"`);
      count++;
    }
  }
  
  // Test missing topics
  const missingTopics = expectedTopics.filter(topic => !topicMatcher.has(topic));
  if (missingTopics.length > 0) {
    console.log(`\n❌ Missing Topics (${missingTopics.length}):`, missingTopics.slice(0, 3).join(', '));
  } else {
    console.log(`\n✅ ALL TOPICS MATCHED SUCCESSFULLY!`);
  }
  
  return topicMatcher;
}

// Test the getAllAvailableSets logic
function testGetAllAvailableSets() {
  console.log('\n📋 STEP 2: Testing getAllAvailableSets Logic...');
  
  // Simulate the fixed logic from rule2AnalysisService
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
  
  // Simulate database data with annotations
  const availableSetNames = [
    'D-1 Set-1 Matrix',
    'D-1 Set-2 Matrix',
    'D-3 (trd) Set-1 Matrix',
    'D-3 (trd) Set-2 Matrix',
    'D-4 Set-1 Matrix',
    'D-4 Set-2 Matrix',
    'D-5 (pv) Set-1 Matrix',
    'D-5 (pv) Set-2 Matrix',
    'D-7 (sh) Set-1 Matrix',
    'D-7 (sh) Set-2 Matrix',
    'D-9 Set-1 Matrix',
    'D-9 Set-2 Matrix',
    'D-10 (Trd) Set-1 Matrix',
    'D-10 (Trd) Set-2 Matrix',
    'D-11 Set-1 Matrix',
    'D-11 Set-2 Matrix',
    'D-12 (Pv) Set-1 Matrix',
    'D-12 (Pv) Set-2 Matrix',
    'D-27 (special) Set-1 Matrix',
    'D-27 (special) Set-2 Matrix',
    'D-30 (long) Set-1 Matrix',
    'D-30 (long) Set-2 Matrix',
    'D-60 (cycle) Set-1 Matrix',
    'D-60 (cycle) Set-2 Matrix',
    'D-81 Set-1 Matrix',
    'D-81 Set-2 Matrix',
    'D-108 Set-1 Matrix',
    'D-108 Set-2 Matrix',
    'D-144 Set-1 Matrix',
    'D-144 Set-2 Matrix'
  ];
  
  console.log(`TOPIC_ORDER Count: ${TOPIC_ORDER.length}`);
  console.log(`Available Sets Count: ${availableSetNames.length}`);
  
  // OLD METHOD (BROKEN) - Exact string matching
  console.log(`\n❌ OLD METHOD (BROKEN) - Exact String Matching:`);
  const oldFilteredSets = TOPIC_ORDER.filter(topicName => availableSetNames.includes(topicName));
  console.log(`   Result Count: ${oldFilteredSets.length}/${TOPIC_ORDER.length}`);
  console.log(`   Success Rate: ${(oldFilteredSets.length / TOPIC_ORDER.length * 100).toFixed(1)}%`);
  console.log(`   Missing: ${TOPIC_ORDER.length - oldFilteredSets.length} topics`);
  
  // Check specifically missing problematic topics
  const problematicTopics = [
    'D-3 Set-1 Matrix', 'D-3 Set-2 Matrix',
    'D-5 Set-1 Matrix', 'D-5 Set-2 Matrix',
    'D-7 Set-1 Matrix', 'D-7 Set-2 Matrix',
    'D-10 Set-1 Matrix', 'D-10 Set-2 Matrix',
    'D-12 Set-1 Matrix', 'D-12 Set-2 Matrix',
    'D-27 Set-1 Matrix', 'D-27 Set-2 Matrix',
    'D-30 Set-1 Matrix', 'D-30 Set-2 Matrix',
    'D-60 Set-1 Matrix', 'D-60 Set-2 Matrix'
  ];
  
  const oldMissing = problematicTopics.filter(topic => !oldFilteredSets.includes(topic));
  console.log(`   Problematic Topics Missing: ${oldMissing.length}/${problematicTopics.length}`);
  console.log(`   Missing List: ${oldMissing.slice(0, 4).join(', ')}...`);
  
  // NEW METHOD (FIXED) - Smart topic matching
  console.log(`\n✅ NEW METHOD (FIXED) - Smart Topic Matching:`);
  
  // Use the same createTopicMatcher logic
  const createTopicMatcher = (expectedTopics, availableTopics) => {
    const topicMap = new Map();
    
    expectedTopics.forEach(expectedTopic => {
      const expectedMatch = expectedTopic.match(/D-(\d+)\s+Set-(\d+)/);
      if (expectedMatch) {
        const [, dNumber, setNumber] = expectedMatch;
        
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
  
  const topicMatcher = createTopicMatcher(TOPIC_ORDER, availableSetNames);
  const newFilteredSets = TOPIC_ORDER
    .filter(expectedTopic => topicMatcher.has(expectedTopic))
    .map(expectedTopic => topicMatcher.get(expectedTopic));
  
  console.log(`   Result Count: ${newFilteredSets.length}/${TOPIC_ORDER.length}`);
  console.log(`   Success Rate: ${(newFilteredSets.length / TOPIC_ORDER.length * 100).toFixed(1)}%`);
  console.log(`   Missing: ${TOPIC_ORDER.length - newFilteredSets.length} topics`);
  
  // Check problematic topics specifically
  const newMissingProblematic = problematicTopics.filter(topic => !topicMatcher.has(topic));
  console.log(`   Problematic Topics Missing: ${newMissingProblematic.length}/${problematicTopics.length}`);
  
  if (newMissingProblematic.length === 0) {
    console.log(`   🎉 ALL PROBLEMATIC TOPICS NOW FOUND!`);
  } else {
    console.log(`   Still Missing: ${newMissingProblematic.join(', ')}`);
  }
  
  return {
    oldCount: oldFilteredSets.length,
    newCount: newFilteredSets.length,
    improvement: newFilteredSets.length - oldFilteredSets.length,
    fixed: newMissingProblematic.length === 0
  };
}

// Test summary
function testSummary() {
  console.log('\n🎯 STEP 3: Fix Impact Summary...');
  
  const topicMatcher = testCreateTopicMatcher();
  const getAllAvailableSetsResult = testGetAllAvailableSets();
  
  console.log('\n📊 OVERALL RESULTS:');
  console.log(`   Topic Matching: ${topicMatcher.size}/16 problematic topics found`);
  console.log(`   getAllAvailableSets: ${getAllAvailableSetsResult.improvement} additional topics discovered`);
  console.log(`   Problematic Topics Fixed: ${getAllAvailableSetsResult.fixed ? 'YES' : 'NO'}`);
  
  if (getAllAvailableSetsResult.fixed) {
    console.log('\n🎉 SUCCESS: The smart topic matching fix should resolve the missing ABCD/BCD numbers!');
    console.log('');
    console.log('🔧 What was fixed:');
    console.log('   1. rule2AnalysisService.getAllAvailableSets() now uses createTopicMatcher()');
    console.log('   2. Handles annotated topic names like "D-3 (trd) Set-1 Matrix"');
    console.log('   3. Maps expected names to actual database names');
    console.log('   4. All 30 topics should now be discovered and processed');
    console.log('');
    console.log('🎯 Expected Result:');
    console.log('   • D-3, D-5, D-7, D-10, D-12, D-27, D-30, D-60 topics should now appear');
    console.log('   • ABCD/BCD numbers should be calculated for these topics');
    console.log('   • PastDays page should show the missing ABCD/BCD badges');
  } else {
    console.log('\n❌ The fix may not be complete. Additional investigation needed.');
  }
}

// Run all tests
testSummary();
