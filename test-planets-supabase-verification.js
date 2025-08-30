/**
 * Supabase Verification Test for PlanetsAnalysisPage ABCD/BCD Numbers
 * This script checks if all HR data (HR1-HR6) is properly stored and accessible
 */

import { supabase } from './src/supabaseClient.js';

const TEST_USER_ID = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'; // From your screenshot
const TEST_DATE = '2025-08-18'; // From your screenshot

async function verifyPlanetsSupabaseData() {
  console.log('🔍 Testing PlanetsAnalysisPage Supabase Data Verification');
  console.log(`📅 Date: ${TEST_DATE}`);
  console.log(`👤 User: ${TEST_USER_ID}`);
  console.log('=' .repeat(80));

  // Test each HR from 1 to 6
  for (let hr = 1; hr <= 6; hr++) {
    console.log(`\n🕐 Testing HR${hr}:`);
    console.log('-'.repeat(40));

    try {
      // Query rule2_analysis_results table (primary source)
      const { data, error } = await supabase
        .from('rule2_analysis_results')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('analysis_date', TEST_DATE)
        .eq('selected_hr', hr)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ No data found for HR${hr}`);
        } else {
          console.log(`❌ Database error for HR${hr}:`, error.message);
        }
        continue;
      }

      if (!data || !data.topic_numbers) {
        console.log(`❌ No topic_numbers found for HR${hr}`);
        continue;
      }

      console.log(`✅ Data found for HR${hr}`);
      
      // Check topic_numbers structure
      const topicNumbers = data.topic_numbers;
      const topicKeys = Object.keys(topicNumbers);
      console.log(`📊 Topics count: ${topicKeys.length}`);

      // Focus on D-1 topics which are most visible in UI
      const d1Topics = topicKeys.filter(key => key.includes('D-1'));
      console.log(`🎯 D-1 topics: ${d1Topics.length} found`);

      d1Topics.forEach(topicName => {
        const topicData = topicNumbers[topicName];
        if (topicData && (topicData.abcd || topicData.bcd)) {
          const abcdCount = topicData.abcd ? topicData.abcd.length : 0;
          const bcdCount = topicData.bcd ? topicData.bcd.length : 0;
          console.log(`  📋 ${topicName}:`);
          console.log(`    🟢 ABCD: [${topicData.abcd ? topicData.abcd.join(', ') : ''}] (${abcdCount} numbers)`);
          console.log(`    🔵 BCD: [${topicData.bcd ? topicData.bcd.join(', ') : ''}] (${bcdCount} numbers)`);
        }
      });

      // Check if this data should be visible in PlanetsAnalysisPage
      const totalNumbers = Object.values(topicNumbers).reduce((sum, topic) => {
        return sum + (topic.abcd ? topic.abcd.length : 0) + (topic.bcd ? topic.bcd.length : 0);
      }, 0);

      if (totalNumbers > 0) {
        console.log(`✅ HR${hr} should show ${totalNumbers} total ABCD/BCD numbers in PlanetsAnalysisPage`);
      } else {
        console.log(`⚠️  HR${hr} has no ABCD/BCD numbers to display`);
      }

    } catch (error) {
      console.log(`💥 Exception testing HR${hr}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📝 Summary:');
  console.log('- If ✅ data is found for an HR, PlanetsAnalysisPage should display ABCD/BCD numbers');
  console.log('- If ❌ no data found, PlanetsAnalysisPage should show "No analysis data" error');
  console.log('- Topic names with "Matrix" suffix should match exactly what UI expects');
  console.log('\n🧪 Test completed');
}

// Run the verification
verifyPlanetsSupabaseData().catch(console.error);
