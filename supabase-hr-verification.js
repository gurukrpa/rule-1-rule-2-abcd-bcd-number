/**
 * Supabase Direct Query Test for PlanetsAnalysisPage
 * Simple verification using direct supabase connection
 */

import { createClient } from '@supabase/supabase-js';

// Direct Supabase connection (you may need to update these)
const supabaseUrl = 'https://your-project.supabase.co'; // Update with your URL
const supabaseKey = 'your-anon-key'; // Update with your anon key

// If the above doesn't work, let's check the .env file
import { readFileSync } from 'fs';

let SUPABASE_URL, SUPABASE_ANON_KEY;

try {
  const envContent = readFileSync('.env', 'utf8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  
  SUPABASE_URL = urlMatch ? urlMatch[1].trim() : null;
  SUPABASE_ANON_KEY = keyMatch ? keyMatch[1].trim() : null;
} catch (error) {
  console.log('Could not read .env file:', error.message);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Missing Supabase configuration. Please check .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEST_USER_ID = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
const TEST_DATE = '2025-08-18';

async function verifyAllHRData() {
  console.log('🔍 PlanetsAnalysisPage Supabase Verification');
  console.log(`📅 Date: ${TEST_DATE} | 👤 User: ${TEST_USER_ID}`);
  console.log('='.repeat(60));

  const results = [];

  for (let hr = 1; hr <= 6; hr++) {
    try {
      const { data, error } = await supabase
        .from('rule2_analysis_results')
        .select('topic_numbers, overall_abcd_numbers, overall_bcd_numbers')
        .eq('user_id', TEST_USER_ID)
        .eq('analysis_date', TEST_DATE)
        .eq('selected_hr', hr)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log(`HR${hr}: ❌ Error - ${error.message}`);
        results.push({ hr, status: 'error', error: error.message });
        continue;
      }

      if (!data) {
        console.log(`HR${hr}: ❌ No data found`);
        results.push({ hr, status: 'no_data' });
        continue;
      }

      // Analyze the data
      const topicNumbers = data.topic_numbers || {};
      const topicKeys = Object.keys(topicNumbers);
      
      let totalABCD = 0, totalBCD = 0;
      let d1SetTopics = [];
      
      topicKeys.forEach(key => {
        const topic = topicNumbers[key];
        if (topic) {
          totalABCD += (topic.abcd || []).length;
          totalBCD += (topic.bcd || []).length;
          
          if (key.includes('D-1 Set-')) {
            d1SetTopics.push({
              name: key,
              abcd: topic.abcd || [],
              bcd: topic.bcd || []
            });
          }
        }
      });

      console.log(`HR${hr}: ✅ ${topicKeys.length} topics, ${totalABCD} ABCD, ${totalBCD} BCD`);
      
      // Show D-1 Set topics specifically (most visible in UI)
      d1SetTopics.forEach(topic => {
        if (topic.abcd.length > 0 || topic.bcd.length > 0) {
          console.log(`  📋 ${topic.name}: ABCD[${topic.abcd.join(',')}] BCD[${topic.bcd.join(',')}]`);
        }
      });

      results.push({
        hr,
        status: 'success',
        totalTopics: topicKeys.length,
        totalABCD,
        totalBCD,
        d1Topics: d1SetTopics.length
      });

    } catch (error) {
      console.log(`HR${hr}: 💥 Exception - ${error.message}`);
      results.push({ hr, status: 'exception', error: error.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY:');
  
  const successfulHRs = results.filter(r => r.status === 'success');
  const noDataHRs = results.filter(r => r.status === 'no_data');
  
  console.log(`✅ HRs with data: ${successfulHRs.map(r => r.hr).join(', ')}`);
  console.log(`❌ HRs missing data: ${noDataHRs.map(r => r.hr).join(', ')}`);
  
  console.log('\n🎯 EXPECTED PLANETSANALYSISPAGE BEHAVIOR:');
  successfulHRs.forEach(result => {
    if (result.totalABCD + result.totalBCD > 0) {
      console.log(`HR${result.hr}: Should show ${result.totalABCD + result.totalBCD} yellow ABCD/BCD number boxes`);
    } else {
      console.log(`HR${result.hr}: Should show "No analysis data" (no numbers to display)`);
    }
  });
  
  noDataHRs.forEach(result => {
    console.log(`HR${result.hr}: Should show "No analysis data for this date: ${TEST_DATE} hr ${result.hr}"`);
  });
}

verifyAllHRData().catch(console.error);
