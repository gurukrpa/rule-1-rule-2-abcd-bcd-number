// 🚨 Debug Missing ABCD/BCD Numbers on PastDays Page
// Investigating why D-3, D-5, D-7, D-10, D-12, D-27, D-30, D-60 topics 
// are missing ABCD/BCD numbers specifically on PastDays page

import cleanSupabaseService from './src/services/CleanSupabaseService.js';
import rule2AnalysisService from './src/services/rule2AnalysisService.js';

console.log('🔍 DEBUGGING PASTDAYS MISSING ABCD/BCD NUMBERS');
console.log('='.repeat(60));

// Test data from the issue report
const TEST_CONFIG = {
  userId: '2dc97157-e7d5-43b2-93b2-ee3c6252b3dd',
  targetDate: '2025-06-26',
  missingTopics: [
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
  ]
};

async function debugMissingAbcdBcd() {
  try {
    console.log('\n📋 TEST CONFIGURATION:');
    console.log(`User ID: ${TEST_CONFIG.userId}`);
    console.log(`Target Date: ${TEST_CONFIG.targetDate}`);
    console.log(`Missing Topics Count: ${TEST_CONFIG.missingTopics.length}`);
    console.log(`Missing Topics: ${TEST_CONFIG.missingTopics.slice(0, 4).join(', ')}...`);

    // Step 1: Get all available dates for this user
    console.log('\n🗓️ STEP 1: Fetching Available Dates...');
    
    // Get sample of dates to work with
    const allDates = [
      '2025-06-22', '2025-06-23', '2025-06-24', 
      '2025-06-25', '2025-06-26', '2025-06-27'
    ];
    
    console.log(`Available Dates: ${allDates.join(', ')}`);
    
    // Step 2: Test PastDays N-1 Pattern
    console.log('\n🔄 STEP 2: Testing Past Days N-1 Pattern...');
    console.log('PastDays Logic: Display date N shows ABCD/BCD from date N-1');
    
    // For date 2025-06-26, PastDays should show ABCD/BCD from 2025-06-25
    const displayDate = TEST_CONFIG.targetDate; // 2025-06-26
    const analysisDate = '2025-06-25'; // Previous date (N-1)
    
    console.log(`Display Date: ${displayDate}`);
    console.log(`Analysis Date (N-1): ${analysisDate}`);
    
    // Step 3: Perform Real-time Rule2 Analysis for N-1 date
    console.log('\n🚀 STEP 3: Performing Real-time Rule2 Analysis...');
    
    const rule2Result = await rule2AnalysisService.performRule2Analysis(
      TEST_CONFIG.userId,
      analysisDate, // Analyze the previous date
      allDates,
      1 // HR 1
    );
    
    if (!rule2Result.success) {
      console.error('❌ Rule2 Analysis FAILED:', rule2Result.error);
      return;
    }
    
    console.log('✅ Rule2 Analysis SUCCESS:');
    console.log(`   Analysis Date: ${rule2Result.analysisDate}`);
    console.log(`   Overall ABCD: [${rule2Result.abcdNumbers.join(', ')}]`);
    console.log(`   Overall BCD: [${rule2Result.bcdNumbers.join(', ')}]`);
    console.log(`   Sets Analyzed: ${rule2Result.setResults.length}`);
    
    // Step 4: Check Missing Topics Specifically
    console.log('\n🎯 STEP 4: Analyzing Missing Topics...');
    
    const missingAnalysis = {};
    let foundTopics = 0;
    let missingTopics = 0;
    
    for (const topicName of TEST_CONFIG.missingTopics) {
      const topicResult = rule2Result.setResults.find(s => s.setName === topicName);
      
      if (topicResult) {
        foundTopics++;
        missingAnalysis[topicName] = {
          found: true,
          abcdCount: topicResult.abcdNumbers.length,
          bcdCount: topicResult.bcdNumbers.length,
          abcdNumbers: topicResult.abcdNumbers,
          bcdNumbers: topicResult.bcdNumbers,
          dDayCount: topicResult.dDayCount
        };
        
        const hasAbcdBcd = topicResult.abcdNumbers.length > 0 || topicResult.bcdNumbers.length > 0;
        console.log(`✅ ${topicName}: ${hasAbcdBcd ? 'HAS' : 'NO'} ABCD/BCD numbers`);
        if (hasAbcdBcd) {
          console.log(`   ABCD: [${topicResult.abcdNumbers.join(', ')}]`);
          console.log(`   BCD: [${topicResult.bcdNumbers.join(', ')}]`);
        }
      } else {
        missingTopics++;
        missingAnalysis[topicName] = {
          found: false,
          reason: 'Topic not found in Rule2 analysis results'
        };
        console.log(`❌ ${topicName}: NOT FOUND in analysis results`);
      }
    }
    
    // Step 5: Summary and Diagnosis
    console.log('\n📊 STEP 5: Analysis Summary...');
    console.log(`Topics Found: ${foundTopics}/${TEST_CONFIG.missingTopics.length}`);
    console.log(`Topics Missing: ${missingTopics}/${TEST_CONFIG.missingTopics.length}`);
    
    if (missingTopics > 0) {
      console.log('\n🚨 DIAGNOSIS: Topics Missing from Rule2 Analysis');
      console.log('This suggests the topics are not being discovered/processed by rule2AnalysisService');
      console.log('Possible causes:');
      console.log('1. Topic name mismatch (annotated names vs expected names)');
      console.log('2. Data missing for these topics on the analysis date');
      console.log('3. Topic discovery logic filtering them out');
    }
    
    // Step 6: Check Data Availability for Missing Topics
    console.log('\n🔍 STEP 6: Checking Data Availability...');
    
    try {
      const excelData = await cleanSupabaseService.getExcelData(TEST_CONFIG.userId, analysisDate);
      const hourData = await cleanSupabaseService.getHourEntry(TEST_CONFIG.userId, analysisDate);
      
      console.log('Data availability for analysis date:');
      console.log(`   Excel Data: ${excelData ? 'Available' : 'Missing'}`);
      console.log(`   Hour Data: ${hourData ? 'Available' : 'Missing'}`);
      
      if (excelData && excelData.sets) {
        const availableSets = Object.keys(excelData.sets);
        console.log(`   Available Sets: ${availableSets.length}`);
        
        // Check if missing topics exist in Excel data
        const missingInExcel = TEST_CONFIG.missingTopics.filter(topic => {
          // Try exact match and pattern matching
          const exactMatch = availableSets.includes(topic);
          const patternMatch = availableSets.find(setName => {
            // Extract D-X pattern
            const topicPattern = topic.match(/D-(\d+)/);
            const setPattern = setName.match(/D-(\d+)/);
            return topicPattern && setPattern && topicPattern[1] === setPattern[1];
          });
          
          return !exactMatch && !patternMatch;
        });
        
        console.log(`   Missing Topics in Excel: ${missingInExcel.length}`);
        if (missingInExcel.length > 0) {
          console.log(`   Missing: ${missingInExcel.slice(0, 3).join(', ')}...`);
        }
        
        // Show sample of actual set names
        console.log(`   Sample Sets: ${availableSets.slice(0, 5).join(', ')}...`);
      }
    } catch (dataError) {
      console.error('❌ Error checking data availability:', dataError.message);
    }
    
    // Step 7: Recommendations
    console.log('\n💡 STEP 7: Recommendations...');
    
    if (missingTopics > 0) {
      console.log('🔧 IMMEDIATE FIXES NEEDED:');
      console.log('1. Check topic discovery logic in rule2AnalysisService.getAllAvailableSets()');
      console.log('2. Verify topic name pattern matching for annotated names');
      console.log('3. Add logging to see which topics are filtered out and why');
      console.log('4. Test with createTopicMatcher utility like other components use');
    } else {
      console.log('🔧 INVESTIGATE WHY ABCD/BCD NUMBERS ARE EMPTY:');
      console.log('1. Check if data extraction is working for these topics');
      console.log('2. Verify ABCD/BCD analysis logic for these specific topics');
      console.log('3. Check if these topics have sufficient D-day numbers for analysis');
    }

  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
  }
}

// Run the diagnostic
debugMissingAbcdBcd().then(() => {
  console.log('\n✅ Diagnostic Complete');
}).catch(err => {
  console.error('❌ Diagnostic Failed:', err);
});
