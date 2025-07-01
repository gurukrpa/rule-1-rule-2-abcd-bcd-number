/**
 * BROWSER CONSOLE SCRIPT: Debug Frontend Topic Processing
 * 
 * CRITICAL FINDING: Database has all 30 topics, but frontend only shows 14
 * Root Cause: Topic names have annotations like "(pv)", "(trd)", "(sh)" 
 * that may be causing filtering issues in frontend components
 * 
 * Run this in browser console on PlanetsAnalysisPage
 */

console.log('🔍 FRONTEND TOPIC PROCESSING DEBUG');
console.log('==================================');

// Test the CleanSupabaseService directly
async function debugFrontendTopicProcessing() {
  try {
    // Import the CleanSupabaseService 
    const targetUser = '2dc97157-e7d5-43b2-93b2-ee3c6252b3dd';
    const targetDate = '2025-06-26';

    console.log(`🎯 Testing user: ${targetUser} on ${targetDate}`);

    // Step 1: Test CleanSupabaseService.getExcelData directly
    console.log('\n📊 STEP 1: Direct CleanSupabaseService Test');
    console.log('==========================================');

    // Get the service instance (assuming it's globally available or imported)
    let dataService;
    if (window.cleanSupabaseService) {
      dataService = window.cleanSupabaseService;
    } else if (window.dataService) {
      dataService = window.dataService;
    } else {
      console.log('❌ No data service found. Try importing or accessing it differently.');
      
      // Alternative: Try to create a new instance
      console.log('🔧 Attempting to access via React component...');
      
      // Let's check what's available in the page
      console.log('Available global objects:', Object.keys(window).filter(k => k.includes('data') || k.includes('service')));
      return;
    }

    const excelData = await dataService.getExcelData(targetUser, targetDate);
    
    if (!excelData) {
      console.log('❌ No Excel data returned from service');
      return;
    }

    console.log('✅ Excel data retrieved');
    console.log('   Sets count:', Object.keys(excelData.sets || {}).length);
    console.log('   Sets:', Object.keys(excelData.sets || {}));

    // Step 2: Test topic filtering and processing
    console.log('\n🔍 STEP 2: Topic Processing Analysis');
    console.log('===================================');

    const allTopics = Object.keys(excelData.sets || {});
    console.log('   Raw topics from database:', allTopics.length);
    
    // Test the topic name patterns
    const topicPatterns = {
      withAnnotations: allTopics.filter(t => t.includes('(') && t.includes(')')),
      withoutAnnotations: allTopics.filter(t => !t.includes('(') && !t.includes(')')),
      dNumbers: {}
    };

    allTopics.forEach(topic => {
      const match = topic.match(/D-(\d+)/);
      if (match) {
        const dNum = parseInt(match[1]);
        if (!topicPatterns.dNumbers[dNum]) {
          topicPatterns.dNumbers[dNum] = [];
        }
        topicPatterns.dNumbers[dNum].push(topic);
      }
    });

    console.log('   Topics with annotations:', topicPatterns.withAnnotations.length);
    console.log('   Topics without annotations:', topicPatterns.withoutAnnotations.length);
    console.log('   D-numbers found:', Object.keys(topicPatterns.dNumbers).map(n => parseInt(n)).sort((a,b) => a-b));

    // Step 3: Test naturalTopicSort function (if available)
    console.log('\n📋 STEP 3: Topic Sorting Test');
    console.log('=============================');

    // Simple natural sort implementation for testing
    const naturalTopicSort = (topics) => {
      return topics.sort((a, b) => {
        const extractNumber = (topic) => {
          const match = topic.match(/D-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };
        
        const numA = extractNumber(a);
        const numB = extractNumber(b);
        
        if (numA !== numB) {
          return numA - numB;
        }
        
        return a.localeCompare(b);
      });
    };

    const sortedTopics = naturalTopicSort([...allTopics]);
    console.log('   Sorted topics:', sortedTopics);

    // Step 4: Check for filtering issues
    console.log('\n🎯 STEP 4: Filtering Issues Analysis');
    console.log('===================================');

    // Common filtering patterns that might exclude annotated topics
    const expectedTopicPattern = /^D-\d+\s+Set-[12]\s+Matrix$/;
    const matchingTopics = allTopics.filter(t => expectedTopicPattern.test(t));
    const nonMatchingTopics = allTopics.filter(t => !expectedTopicPattern.test(t));

    console.log('   Topics matching standard pattern:', matchingTopics.length);
    console.log('   Topics NOT matching standard pattern:', nonMatchingTopics.length);
    console.log('   Non-matching topics:', nonMatchingTopics);

    // Step 5: Simulate PlanetsAnalysisPage processing
    console.log('\n💻 STEP 5: PlanetsAnalysisPage Simulation');
    console.log('=========================================');

    // Simulate what PlanetsAnalysisPage might be doing
    const planetsData = {
      sets: excelData.sets
    };

    const availableTopics = naturalTopicSort(Object.keys(planetsData.sets || {}));
    console.log('   Available topics for display:', availableTopics.length);
    console.log('   Topics list:', availableTopics);

    if (availableTopics.length === 14) {
      console.log('   ❌ ISSUE REPRODUCED: Only 14 topics available');
      console.log('   🔧 The filtering is happening during topic processing');
    } else if (availableTopics.length === 30) {
      console.log('   ✅ All 30 topics available in frontend');
      console.log('   🔧 Issue may be in display logic or state management');
    } else {
      console.log(`   ⚠️ Unexpected topic count: ${availableTopics.length}`);
    }

    // Step 6: Recommendations
    console.log('\n🎯 RECOMMENDATIONS');
    console.log('=================');

    if (nonMatchingTopics.length > 0) {
      console.log('   ❌ ISSUE FOUND: Topics with annotations not matching expected pattern');
      console.log('   📋 ACTION ITEMS:');
      console.log('   1. Update topic pattern matching to handle annotations');
      console.log('   2. Modify naturalTopicSort to handle annotated topics');
      console.log('   3. Check PlanetsAnalysisPage filtering logic');
      console.log('   4. Update topic display components to show annotated topics');
    }

    return {
      totalTopics: allTopics.length,
      withAnnotations: topicPatterns.withAnnotations.length,
      withoutAnnotations: topicPatterns.withoutAnnotations.length,
      matchingStandardPattern: matchingTopics.length,
      nonMatchingTopics: nonMatchingTopics
    };

  } catch (error) {
    console.error('❌ Frontend debugging failed:', error);
  }
}

// Auto-run the debug if in browser
if (typeof window !== 'undefined') {
  console.log('🚀 Starting frontend debug...');
  debugFrontendTopicProcessing().then(result => {
    if (result) {
      console.log('\n📊 SUMMARY RESULTS:');
      console.log('==================');
      console.log('Total topics:', result.totalTopics);
      console.log('With annotations:', result.withAnnotations);
      console.log('Without annotations:', result.withoutAnnotations);
      console.log('Matching standard pattern:', result.matchingStandardPattern);
      console.log('Non-matching topics:', result.nonMatchingTopics);
      
      if (result.nonMatchingTopics.length > 0) {
        console.log('\n🔧 SOLUTION: Update frontend code to handle annotated topic names');
      }
    }
  });
} else {
  console.log('📝 Copy and paste this script into browser console on PlanetsAnalysisPage');
}
