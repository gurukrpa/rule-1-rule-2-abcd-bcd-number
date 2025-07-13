#!/usr/bin/env node

/**
 * Debug D-1 Set-1 Matrix Real Analysis Data Issue
 * 
 * The user is seeing "A: 1,2,4,9" instead of correct "ABCD: 1,2,4,7,9" and "BCD: 5"
 * This script tests the exact data flow from RealTimeRule2AnalysisService to PlanetsAnalysisPage
 */

import { RealTimeRule2AnalysisService } from './src/services/realTimeRule2AnalysisService.js';

console.log('🔍 DEBUG: D-1 Set-1 Matrix Real Analysis Data Issue');
console.log('========================================================');

console.log('\n📋 Expected Values:');
console.log('✅ D-1 Set-1 Matrix: ABCD[1, 2, 4, 7, 9], BCD[5]');
console.log('❌ Currently seeing: A[1, 2, 4, 9] (missing 7, no BCD)');

console.log('\n🔬 Testing Real Analysis Data Flow...');

// Test with some sample data to see what RealTimeRule2AnalysisService produces
const testUserId = 'test-user';
const testDates = ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04'];
const testAnalysisDate = '2023-01-04';

async function testRealTimeAnalysis() {
  try {
    console.log('\n🚀 Step 1: Testing RealTimeRule2AnalysisService.performRule2Analysis()');
    console.log(`User: ${testUserId}`);
    console.log(`Analysis Date: ${testAnalysisDate}`);
    console.log(`Available Dates: ${testDates.join(', ')}`);
    
    const result = await RealTimeRule2AnalysisService.performRule2Analysis(
      testUserId,
      testAnalysisDate,
      testDates
    );
    
    console.log('\n📊 Raw Analysis Result:');
    console.log('Success:', result.success);
    
    if (!result.success) {
      console.log('❌ Analysis failed:', result.error);
      console.log('\n💡 This is expected for test data - the issue is likely in data conversion');
      console.log('💡 Next, we should check the conversion logic in PlanetsAnalysisPage');
      
      // Test the hardcoded fallback data
      console.log('\n🔧 Testing Hardcoded Fallback Data:');
      const TOPIC_NUMBERS = {
        'D-1 Set-1 Matrix': { abcd: [1, 2, 4, 7, 9], bcd: [5] }
      };
      
      const fallbackResult = TOPIC_NUMBERS['D-1 Set-1 Matrix'];
      console.log('Fallback D-1 Set-1 Matrix:', fallbackResult);
      console.log('ABCD length:', fallbackResult.abcd.length);
      console.log('BCD length:', fallbackResult.bcd.length);
      console.log('Contains 7?', fallbackResult.abcd.includes(7));
      console.log('Contains 5 in BCD?', fallbackResult.bcd.includes(5));
      
      return;
    }
    
    console.log('\n🧪 Step 2: Examining HR Results Structure');
    const { data } = result;
    
    if (data.hrResults) {
      console.log('Available HRs:', Object.keys(data.hrResults));
      
      // Check HR-1 specifically
      const hr1Data = data.hrResults['1'];
      if (hr1Data) {
        console.log('\n🎯 HR-1 Data Structure:');
        console.log('Has topicResults?', !!hr1Data.topicResults);
        console.log('Overall ABCD Numbers:', hr1Data.overallAbcdNumbers);
        console.log('Overall BCD Numbers:', hr1Data.overallBcdNumbers);
        
        if (hr1Data.topicResults) {
          console.log('\nTopic Results Count:', hr1Data.topicResults.length);
          
          // Find D-1 Set-1 Matrix specifically
          const d1Set1Result = hr1Data.topicResults.find(topic => 
            topic.setName === 'D-1 Set-1 Matrix' || 
            topic.setName.includes('D-1') && topic.setName.includes('Set-1')
          );
          
          if (d1Set1Result) {
            console.log('\n🎯 Found D-1 Set-1 Matrix in HR-1:');
            console.log('Set Name:', d1Set1Result.setName);
            console.log('ABCD Numbers:', d1Set1Result.abcdNumbers);
            console.log('BCD Numbers:', d1Set1Result.bcdNumbers);
            console.log('Has Error?', !!d1Set1Result.error);
            
            if (d1Set1Result.error) {
              console.log('Error Details:', d1Set1Result.error);
            }
            
            // Check if the issue is here
            if (d1Set1Result.abcdNumbers && d1Set1Result.abcdNumbers.length > 0) {
              console.log('\n🔍 Analyzing ABCD Array:');
              console.log('Length:', d1Set1Result.abcdNumbers.length);
              console.log('Contains 1?', d1Set1Result.abcdNumbers.includes(1));
              console.log('Contains 2?', d1Set1Result.abcdNumbers.includes(2));
              console.log('Contains 4?', d1Set1Result.abcdNumbers.includes(4));
              console.log('Contains 7?', d1Set1Result.abcdNumbers.includes(7));
              console.log('Contains 9?', d1Set1Result.abcdNumbers.includes(9));
            }
            
            if (d1Set1Result.bcdNumbers && d1Set1Result.bcdNumbers.length > 0) {
              console.log('\n🔍 Analyzing BCD Array:');
              console.log('Length:', d1Set1Result.bcdNumbers.length);
              console.log('Contains 5?', d1Set1Result.bcdNumbers.includes(5));
            }
          } else {
            console.log('\n❌ D-1 Set-1 Matrix NOT found in topicResults');
            console.log('Available topics:', hr1Data.topicResults.map(t => t.setName).slice(0, 5));
          }
        }
      } else {
        console.log('\n❌ HR-1 data not found');
      }
    }
    
    console.log('\n🔧 Step 3: Simulating PlanetsAnalysisPage Conversion');
    if (data.hrResults && data.hrResults['1'] && data.hrResults['1'].topicResults) {
      const hr1Data = data.hrResults['1'];
      const topicNumbers = {};
      
      hr1Data.topicResults.forEach(topicResult => {
        if (!topicResult.error) {
          topicNumbers[topicResult.setName] = {
            abcd: topicResult.abcdNumbers || [],
            bcd: topicResult.bcdNumbers || []
          };
        }
      });
      
      console.log('\nConverted topicNumbers structure:');
      const d1Set1 = topicNumbers['D-1 Set-1 Matrix'];
      if (d1Set1) {
        console.log('D-1 Set-1 Matrix after conversion:', d1Set1);
        console.log('ABCD array intact?', Array.isArray(d1Set1.abcd) && d1Set1.abcd.length > 0);
        console.log('BCD array intact?', Array.isArray(d1Set1.bcd) && d1Set1.bcd.length > 0);
      } else {
        console.log('❌ D-1 Set-1 Matrix missing after conversion');
        console.log('Available keys:', Object.keys(topicNumbers).slice(0, 5));
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 This indicates the issue might be in data loading or service logic');
    console.log('💡 Check if the required Excel/Hour Entry data exists for the test user');
  }
}

console.log('\n🏃‍♂️ Running Analysis...');
testRealTimeAnalysis().then(() => {
  console.log('\n✅ Analysis Complete');
  
  console.log('\n🔍 DIAGNOSTIC SUMMARY:');
  console.log('======================');
  console.log('1. If real analysis failed: Issue is in data loading (expected for test)');
  console.log('2. If real analysis succeeded but D-1 Set-1 missing: Issue in RealTimeRule2AnalysisService');
  console.log('3. If D-1 Set-1 found but wrong numbers: Issue in ABCD/BCD calculation logic');
  console.log('4. If conversion failed: Issue in PlanetsAnalysisPage data transformation');
  console.log('5. If all looks good: Issue might be in UI rendering or state management');
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Test with actual user data that has Excel/Hour Entry data');
  console.log('2. Check browser console during actual planets analysis page load');
  console.log('3. Verify getTopicNumbers() function is receiving correct realAnalysisData');
  console.log('4. Check if selectedHour state is correct');
}).catch(console.error);
