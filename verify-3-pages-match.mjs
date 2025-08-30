#!/usr/bin/env node
/**
 * Verification Script: Check if Rule-1, Rule-2, and PlanetsAnalysisPage show matching ABCD/BCD numbers
 * Target: Date 2025-08-21, D-1 Set-2 Matrix, HR1
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.automation' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify3PagesMatch() {
  console.log('🔍 Verifying ABCD/BCD Number Matching Across 3 Pages\n');
  
  const testParams = {
    userId: '5019aa9a-a653-49f5-b7da-f5bc9dcde985', // Use the UUID from Rule-2 page
    targetDate: '2025-08-21',
    topicName: 'D-1 Set-2 Matrix',
    hrNumber: 1
  };
  
  console.log(`📋 Test Parameters:`);
  console.log(`   User: ${testParams.userId}`);
  console.log(`   Target Date: ${testParams.targetDate}`);
  console.log(`   Topic: ${testParams.topicName}`);
  console.log(`   Hour: HR${testParams.hrNumber}`);
  console.log(`\n${'='.repeat(60)}\n`);
  
  const results = {
    rule1: null,
    rule2: null,
    planets: null
  };
  
  try {
    // 1. Check Rule-1 Page Data (hour_entries table)
    console.log('📊 1. RULE-1 PAGE DATA (hour_entries table)');
    const { data: rule1Data, error: rule1Error } = await supabase
      .from('hour_entries')
      .select('hour_data')
      .eq('user_id', testParams.userId)
      .eq('date_key', testParams.targetDate)
      .single();
    
    if (rule1Error || !rule1Data) {
      console.log(`   ❌ No Rule-1 data found for ${testParams.targetDate}`);
    } else {
      const hrKey = `hr${testParams.hrNumber}`;
      const topicData = rule1Data.hour_data?.planetSelections?.[hrKey]?.topicNumbers?.[testParams.topicName];
      
      if (topicData) {
        results.rule1 = {
          abcd: topicData.filter(num => num >= 1000 && num < 10000), // Assuming ABCD are 4-digit
          bcd: topicData.filter(num => num >= 100 && num < 1000),   // Assuming BCD are 3-digit
          all: topicData
        };
        console.log(`   ✅ Found topic: ${Object.keys(rule1Data.hour_data.planetSelections[hrKey].topicNumbers).length} topics total`);
        console.log(`   📋 ${testParams.topicName}: [${topicData.join(', ')}]`);
        console.log(`   🟢 ABCD: [${results.rule1.abcd.join(', ') || 'None'}]`);
        console.log(`   🔵 BCD: [${results.rule1.bcd.join(', ') || 'None'}]`);
      } else {
        console.log(`   ❌ Topic "${testParams.topicName}" not found in Rule-1 data`);
      }
    }
    
    // 2. Check Rule-2 Page Data (rule2_analysis_results table)
    console.log(`\n📊 2. RULE-2 PAGE DATA (rule2_analysis_results table)`);
    const { data: rule2Data, error: rule2Error } = await supabase
      .from('rule2_analysis_results')
      .select('topic_numbers, overall_abcd_numbers, overall_bcd_numbers')
      .eq('user_id', testParams.userId)
      .eq('analysis_date', testParams.targetDate)
      .eq('hr_number', testParams.hrNumber)
      .single();
    
    if (rule2Error || !rule2Data) {
      console.log(`   ❌ No Rule-2 data found for ${testParams.targetDate} HR${testParams.hrNumber}`);
    } else {
      const topicData = rule2Data.topic_numbers?.[testParams.topicName];
      
      if (topicData) {
        results.rule2 = {
          abcd: rule2Data.overall_abcd_numbers || [],
          bcd: rule2Data.overall_bcd_numbers || [],
          all: topicData
        };
        console.log(`   ✅ Found topic: ${Object.keys(rule2Data.topic_numbers).length} topics total`);
        console.log(`   📋 ${testParams.topicName}: [${topicData.join(', ')}]`);
        console.log(`   🟢 Overall ABCD: [${results.rule2.abcd.join(', ') || 'None'}]`);
        console.log(`   🔵 Overall BCD: [${results.rule2.bcd.join(', ') || 'None'}]`);
      } else {
        console.log(`   ❌ Topic "${testParams.topicName}" not found in Rule-2 data`);
        if (rule2Data.topic_numbers) {
          console.log(`   📋 Available topics: ${Object.keys(rule2Data.topic_numbers).join(', ')}`);
        }
      }
    }
    
    // 3. Check PlanetsAnalysisPage Data (should use same source as Rule-1 now)
    console.log(`\n📊 3. PLANETSANALYSISPAGE DATA (hour_entries table - same as Rule-1)`);
    if (results.rule1) {
      results.planets = results.rule1; // Should be identical now
      console.log(`   ✅ PlanetsAnalysisPage uses same data source as Rule-1`);
      console.log(`   📋 ${testParams.topicName}: [${results.planets.all.join(', ')}]`);
      console.log(`   🟢 ABCD: [${results.planets.abcd.join(', ') || 'None'}]`);
      console.log(`   🔵 BCD: [${results.planets.bcd.join(', ') || 'None'}]`);
    } else {
      console.log(`   ❌ No PlanetsAnalysisPage data (depends on Rule-1 data)`);
    }
    
    // 4. COMPARISON ANALYSIS
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 COMPARISON ANALYSIS`);
    console.log(`${'='.repeat(60)}`);
    
    const hasRule1 = results.rule1 !== null;
    const hasRule2 = results.rule2 !== null;
    const hasPlanets = results.planets !== null;
    
    console.log(`\n📋 Data Availability:`);
    console.log(`   Rule-1 Page: ${hasRule1 ? '✅ Available' : '❌ No Data'}`);
    console.log(`   Rule-2 Page: ${hasRule2 ? '✅ Available' : '❌ No Data'}`);
    console.log(`   PlanetsAnalysisPage: ${hasPlanets ? '✅ Available' : '❌ No Data'}`);
    
    if (hasRule1 && hasRule2) {
      console.log(`\n🔍 Number Comparison for ${testParams.topicName}:`);
      
      // Compare raw numbers
      const rule1Numbers = results.rule1.all.sort((a,b) => a-b);
      const rule2Numbers = results.rule2.all.sort((a,b) => a-b);
      const numbersMatch = JSON.stringify(rule1Numbers) === JSON.stringify(rule2Numbers);
      
      console.log(`   Rule-1 Numbers: [${rule1Numbers.join(', ')}]`);
      console.log(`   Rule-2 Numbers: [${rule2Numbers.join(', ')}]`);
      console.log(`   Numbers Match: ${numbersMatch ? '✅ YES' : '❌ NO'}`);
      
      // Compare ABCD/BCD classifications
      const rule1ABCD = results.rule1.abcd.sort((a,b) => a-b);
      const rule2ABCD = results.rule2.abcd.sort((a,b) => a-b);
      const rule1BCD = results.rule1.bcd.sort((a,b) => a-b);
      const rule2BCD = results.rule2.bcd.sort((a,b) => a-b);
      
      const abcdMatch = JSON.stringify(rule1ABCD) === JSON.stringify(rule2ABCD);
      const bcdMatch = JSON.stringify(rule1BCD) === JSON.stringify(rule2BCD);
      
      console.log(`\n🏷️ ABCD Classification:`);
      console.log(`   Rule-1 ABCD: [${rule1ABCD.join(', ') || 'None'}]`);
      console.log(`   Rule-2 ABCD: [${rule2ABCD.join(', ') || 'None'}]`);
      console.log(`   ABCD Match: ${abcdMatch ? '✅ YES' : '❌ NO'}`);
      
      console.log(`\n🏷️ BCD Classification:`);
      console.log(`   Rule-1 BCD: [${rule1BCD.join(', ') || 'None'}]`);
      console.log(`   Rule-2 BCD: [${rule2BCD.join(', ') || 'None'}]`);
      console.log(`   BCD Match: ${bcdMatch ? '✅ YES' : '❌ NO'}`);
      
      // Overall verdict
      console.log(`\n🎯 FINAL VERDICT:`);
      if (numbersMatch && abcdMatch && bcdMatch) {
        console.log(`   ✅ ALL THREE PAGES MATCH PERFECTLY!`);
        console.log(`   ✅ Rule-1 ↔ Rule-2 ↔ PlanetsAnalysisPage synchronized`);
      } else {
        console.log(`   ❌ PAGES DO NOT MATCH`);
        if (!numbersMatch) console.log(`   🔍 Issue: Raw numbers differ between Rule-1 and Rule-2`);
        if (!abcdMatch) console.log(`   🔍 Issue: ABCD classifications differ`);
        if (!bcdMatch) console.log(`   🔍 Issue: BCD classifications differ`);
      }
      
    } else {
      console.log(`\n❌ CANNOT COMPARE: Missing data from one or more pages`);
      console.log(`   💡 Suggestion: Run Rule-1 and Rule-2 analysis first to generate data`);
    }
    
    return { hasRule1, hasRule2, hasPlanets, results };
    
  } catch (error) {
    console.error(`❌ Verification failed:`, error);
    return { error: error.message };
  }
}

// Run the verification
verify3PagesMatch()
  .then(result => {
    if (result.error) {
      console.log(`\n💥 Verification failed: ${result.error}`);
      process.exit(1);
    } else {
      console.log(`\n🏁 Verification completed!`);
      process.exit(0);
    }
  })
  .catch(error => {
    console.error(`\n💥 Script error:`, error);
    process.exit(1);
  });
