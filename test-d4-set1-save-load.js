// Targeted diagnostic for D-4 Set-1 HR1 persistence issue
// Tests the specific save/load operations for dates 31-7-25 and 4-8-25

async function testD4Set1SaveLoad() {
  console.log('🎯 TARGETED TEST: D-4 Set-1 Save/Load Operations');
  console.log('='.repeat(60));
  
  // Test parameters
  const testParams = {
    user: 'sing_maya', // Adjust if needed
    topic: 'D-4 Set-1',
    dates: ['31-7-25', '4-8-25'],
    hr: 'HR1',
    testNumbers: [8, 10] // The specific numbers mentioned
  };
  
  console.log('📋 Test Parameters:', testParams);
  
  // Step 1: Check service availability
  if (!window.cleanSupabaseService) {
    console.error('❌ CleanSupabaseService not available');
    return;
  }
  
  const service = window.cleanSupabaseService;
  
  // Step 2: Test save operations
  console.log('\n💾 TESTING SAVE OPERATIONS');
  console.log('-'.repeat(40));
  
  for (const dateKey of testParams.dates) {
    for (const number of testParams.testNumbers) {
      try {
        console.log(`📤 Saving: ${testParams.topic} | ${dateKey} | ${testParams.hr} | ${number}`);
        
        const saveResult = await service.saveTopicClick(
          testParams.user,
          testParams.topic, // Human-readable topic name
          dateKey,
          testParams.hr,
          number,
          true // isMatched
        );
        
        console.log(`✅ Save successful:`, saveResult);
        
      } catch (error) {
        console.error(`❌ Save failed for ${number} on ${dateKey}:`, error);
      }
    }
  }
  
  // Wait a moment for database writes to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 3: Test load operations
  console.log('\n📥 TESTING LOAD OPERATIONS');
  console.log('-'.repeat(40));
  
  for (const dateKey of testParams.dates) {
    try {
      console.log(`📤 Loading: ${testParams.topic} | ${dateKey}`);
      
      const loadResults = await service.getTopicClicks(
        testParams.user,
        testParams.topic, // Human-readable topic name
        dateKey
      );
      
      console.log(`📊 Loaded ${loadResults.length} records for ${dateKey}:`);
      loadResults.forEach(record => {
        console.log(`   ${record.clicked_number} (HR: ${record.hour}, matched: ${record.is_matched})`);
      });
      
    } catch (error) {
      console.error(`❌ Load failed for ${dateKey}:`, error);
    }
  }
  
  // Step 4: Test canonical key transformation
  console.log('\n🔑 TESTING CANONICAL KEY TRANSFORMATION');
  console.log('-'.repeat(40));
  
  // Helper functions (should match the component)
  const topicKey = (name) => { 
    const m = String(name).match(/D-(\d+).*?Set-(\d+)/i); 
    return m ? `D-${m[1]}#${m[2]}` : String(name).trim(); 
  };
  
  const normHR = (hr) => { 
    const h = String(hr).replace(/^HR/i,'').trim(); 
    return `HR${parseInt(h,10)}`; 
  };
  
  const tKey = topicKey(testParams.topic);
  const hrKey = normHR(testParams.hr);
  
  console.log('🔄 Key transformations:');
  console.log(`   Topic: "${testParams.topic}" → "${tKey}"`);
  console.log(`   HR: "${testParams.hr}" → "${hrKey}"`);
  
  // Step 5: Simulate component load logic
  console.log('\n🔄 SIMULATING COMPONENT LOAD LOGIC');
  console.log('-'.repeat(40));
  
  try {
    // Get all clicks for the user (simulating loadClickedNumbers function)
    const allClicks = await service.getTopicClicks(testParams.user);
    console.log(`📊 Total clicks for user: ${allClicks.length}`);
    
    // Organize clicks by canonical keys (simulating component logic)
    const organizedClicks = {};
    
    allClicks.forEach(click => {
      const { topic_name, date_key, hour, clicked_number } = click;
      
      // Transform to canonical keys
      const clickTKey = topicKey(topic_name);
      const clickHrKey = normHR(hour);
      
      // Initialize nested structure
      if (!organizedClicks[clickTKey]) {
        organizedClicks[clickTKey] = {};
      }
      if (!organizedClicks[clickTKey][date_key]) {
        organizedClicks[clickTKey][date_key] = {};
      }
      if (!organizedClicks[clickTKey][date_key][clickHrKey]) {
        organizedClicks[clickTKey][date_key][clickHrKey] = [];
      }
      
      organizedClicks[clickTKey][date_key][clickHrKey].push(clicked_number);
    });
    
    console.log('🏗️ Organized clicks structure:');
    console.log('Topics:', Object.keys(organizedClicks));
    
    // Check our specific topic
    const ourTopicData = organizedClicks[tKey];
    if (ourTopicData) {
      console.log(`📊 Data for "${tKey}":`, Object.keys(ourTopicData));
      
      testParams.dates.forEach(dateKey => {
        const dateData = ourTopicData[dateKey];
        if (dateData) {
          console.log(`   ${dateKey}:`, Object.keys(dateData));
          const hrData = dateData[hrKey];
          if (hrData) {
            console.log(`     ${hrKey}: [${hrData.join(', ')}]`);
          } else {
            console.log(`     ${hrKey}: No data`);
          }
        } else {
          console.log(`   ${dateKey}: No data`);
        }
      });
    } else {
      console.log(`❌ No data found for topic "${tKey}"`);
    }
    
  } catch (error) {
    console.error('❌ Load simulation failed:', error);
  }
  
  // Step 6: Check if numbers should be highlighted
  console.log('\n🎨 HIGHLIGHTING LOGIC TEST');
  console.log('-'.repeat(40));
  
  // Simulate shouldHighlightCell logic
  const simulateHighlighting = (organizedData, topic, date, hr, number) => {
    const userClickedNumbers = organizedData[topic]?.[date]?.[hr] || [];
    const wasClickedByUser = userClickedNumbers.includes(number);
    
    console.log(`🔍 Number ${number} on ${date}:`);
    console.log(`   User clicked: ${wasClickedByUser}`);
    console.log(`   Should highlight: ${wasClickedByUser}`); // Simplified logic
    
    return wasClickedByUser;
  };
  
  // Test our specific numbers
  if (organizedClicks[tKey]) {
    testParams.dates.forEach(dateKey => {
      testParams.testNumbers.forEach(number => {
        simulateHighlighting(organizedClicks, tKey, dateKey, hrKey, number);
      });
    });
  }
  
  // Step 7: Final summary
  console.log('\n📋 TEST SUMMARY');
  console.log('-'.repeat(40));
  
  const hasData = organizedClicks[tKey] && Object.keys(organizedClicks[tKey]).length > 0;
  console.log(`✅ Data persistence: ${hasData ? 'WORKING' : 'FAILED'}`);
  
  if (hasData) {
    testParams.dates.forEach(dateKey => {
      const hasDateData = organizedClicks[tKey][dateKey] && organizedClicks[tKey][dateKey][hrKey];
      console.log(`✅ ${dateKey} data: ${hasDateData ? 'WORKING' : 'MISSING'}`);
    });
  }
  
  return organizedClicks;
}

// Test the specific issue
async function diagnosePersistenceIssue() {
  console.log('🔬 DIAGNOSTIC: D-4 Set-1 Persistence Issue');
  console.log('Checking why numbers don\'t persist for HR1, dates 31-7 and 4-8');
  
  const results = await testD4Set1SaveLoad();
  
  if (results) {
    console.log('\n🎯 PERSISTENCE ANALYSIS COMPLETE');
    console.log('Check the logs above to identify the issue.');
    console.log('Common problems:');
    console.log('1. Date format mismatch (31-7-25 vs 2025-07-31)');
    console.log('2. HR format mismatch (HR1 vs 1)');
    console.log('3. Topic name mismatch (D-4 Set-1 vs canonical key)');
    console.log('4. Database table missing or inaccessible');
  }
}

// Export for global access
window.testD4Set1SaveLoad = testD4Set1SaveLoad;
window.diagnosePersistenceIssue = diagnosePersistenceIssue;

// Auto-run if conditions are met
if (window.cleanSupabaseService) {
  console.log('🚀 CleanSupabaseService detected - ready to run diagnostic');
  console.log('💡 Run: diagnosePersistenceIssue() to start the test');
} else {
  console.log('⚠️ CleanSupabaseService not available - load the Rule1 page first');
}
