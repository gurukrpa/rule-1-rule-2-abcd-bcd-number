#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 INVESTIGATING MISSING TOPICS ISSUE');
console.log('=====================================');
console.log('');
console.log('Issue: Only 7 topic groups showing instead of 30 topics');
console.log('Date: 26/06/2025 (trigger date)');
console.log('Missing: D-3, D-5, D-7, D-10, D-12, D-27, D-30, D-60');
console.log('Showing: D-1, D-4, D-9, D-11, D-81, D-108, D-144');
console.log('');

async function investigateTopicIssue() {
  try {
    console.log('📊 STEP 1: Get all Excel data entries');
    console.log('=====================================');
    
    const { data: allExcelData, error: excelError } = await supabase
      .from('excel_data')
      .select('*')
      .order('date', { ascending: false });

    if (excelError) {
      console.error('❌ Error fetching Excel data:', excelError);
      return;
    }

    console.log(`📈 Total Excel entries found: ${allExcelData.length}`);
    
    // Group by user and show recent entries
    const userEntries = {};
    allExcelData.forEach(entry => {
      if (!userEntries[entry.user_id]) userEntries[entry.user_id] = [];
      userEntries[entry.user_id].push(entry);
    });

    console.log('\n📋 Excel entries by user:');
    Object.entries(userEntries).forEach(([userId, entries]) => {
      console.log(`\n👤 User ${userId}:`);
      entries.slice(0, 5).forEach(entry => {
        const setsCount = Object.keys(entry.data?.sets || {}).length;
        console.log(`  📅 ${entry.date}: ${entry.file_name} (${setsCount} sets)`);
      });
    });

    console.log('\n🎯 STEP 2: Analyze specific date data structure');
    console.log('==============================================');
    
    // Check the trigger date specifically
    const triggerDate = '2025-06-26';
    const { data: triggerData, error: triggerError } = await supabase
      .from('excel_data')
      .select('*')
      .eq('date', triggerDate);

    if (triggerError) {
      console.error('❌ Error fetching trigger date data:', triggerError);
    } else if (triggerData.length === 0) {
      console.log(`❌ No Excel data found for trigger date: ${triggerDate}`);
      console.log('💡 This might be why only 7 topics are showing - no data for this specific date!');
    } else {
      console.log(`✅ Found ${triggerData.length} Excel entries for ${triggerDate}`);
      
      triggerData.forEach((entry, index) => {
        console.log(`\n📊 Entry ${index + 1} (User ${entry.user_id}):`);
        console.log(`   File: ${entry.file_name}`);
        console.log(`   Date: ${entry.date}`);
        
        if (entry.data?.sets) {
          const allSets = Object.keys(entry.data.sets);
          console.log(`   Total sets: ${allSets.length}`);
          
          // Group by D-number
          const dNumbers = new Set();
          allSets.forEach(setName => {
            const match = setName.match(/D-(\d+)/);
            if (match) {
              dNumbers.add(parseInt(match[1]));
            }
          });
          
          const sortedDNumbers = Array.from(dNumbers).sort((a, b) => a - b);
          console.log(`   D-numbers found: ${sortedDNumbers.join(', ')}`);
          console.log(`   Unique D-numbers: ${sortedDNumbers.length}`);
          
          // Check for missing expected D-numbers
          const expectedDNumbers = [1, 3, 4, 5, 7, 9, 10, 11, 12, 27, 30, 60, 81, 108, 144];
          const missingDNumbers = expectedDNumbers.filter(dNum => !dNumbers.has(dNum));
          
          if (missingDNumbers.length > 0) {
            console.log(`   ❌ Missing D-numbers: ${missingDNumbers.join(', ')}`);
            console.log(`   🔍 This explains why only ${sortedDNumbers.length} topic groups are showing!`);
          } else {
            console.log(`   ✅ All expected D-numbers present`);
          }
          
          // Show first few sets
          console.log(`   First 10 sets:`);
          allSets.slice(0, 10).forEach((setName, i) => {
            console.log(`     ${i + 1}. ${setName}`);
          });
        } else {
          console.log(`   ❌ No sets data found in entry`);
        }
      });
    }

    console.log('\n⏰ STEP 3: Check Hour Entry data for trigger date');
    console.log('================================================');
    
    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')
      .select('*')
      .eq('date_key', triggerDate);

    if (hourError) {
      console.error('❌ Error fetching hour data:', hourError);
    } else if (hourData.length === 0) {
      console.log(`❌ No Hour Entry data found for ${triggerDate}`);
    } else {
      console.log(`✅ Found ${hourData.length} Hour entries for ${triggerDate}`);
      
      hourData.forEach((entry, index) => {
        const planetSelections = entry.hour_data?.planetSelections || {};
        console.log(`   Entry ${index + 1} (User ${entry.user_id}): ${Object.keys(planetSelections).length} HR selections`);
      });
    }

    console.log('\n🔍 STEP 4: Check most recent entries (any date)');
    console.log('===============================================');
    
    // Get the most recent entry to see if it has all 30 topics
    const recentEntry = allExcelData[0]; // Most recent due to ordering
    if (recentEntry) {
      console.log(`\n📊 Most recent entry analysis:`);
      console.log(`   User: ${recentEntry.user_id}`);
      console.log(`   Date: ${recentEntry.date}`);
      console.log(`   File: ${recentEntry.file_name}`);
      
      if (recentEntry.data?.sets) {
        const allSets = Object.keys(recentEntry.data.sets);
        console.log(`   Total sets: ${allSets.length}`);
        
        const dNumbers = new Set();
        allSets.forEach(setName => {
          const match = setName.match(/D-(\d+)/);
          if (match) {
            dNumbers.add(parseInt(match[1]));
          }
        });
        
        const sortedDNumbers = Array.from(dNumbers).sort((a, b) => a - b);
        console.log(`   D-numbers: ${sortedDNumbers.join(', ')}`);
        
        if (sortedDNumbers.length === 7) {
          console.log(`   🎯 FOUND THE ISSUE! Recent uploads only have 7 D-numbers`);
          console.log(`   💡 The Excel file being uploaded is incomplete`);
        } else if (sortedDNumbers.length === 15) {
          console.log(`   ✅ Recent entry has all 15 expected D-numbers (30 topics)`);
          console.log(`   🔍 Issue might be in data retrieval for specific date`);
        }
      }
    }

    console.log('\n🎯 STEP 5: Summary and Recommendations');
    console.log('======================================');
    
    console.log('Based on the analysis:');
    console.log('');
    
    if (triggerData.length === 0) {
      console.log('❌ ROOT CAUSE: No Excel data exists for trigger date 2025-06-26');
      console.log('🔧 SOLUTION: Upload Excel file for this specific date');
    } else {
      const triggerEntry = triggerData[0];
      if (triggerEntry?.data?.sets) {
        const setsCount = Object.keys(triggerEntry.data.sets).length;
        const dNumbers = new Set();
        Object.keys(triggerEntry.data.sets).forEach(setName => {
          const match = setName.match(/D-(\d+)/);
          if (match) dNumbers.add(parseInt(match[1]));
        });
        
        if (dNumbers.size === 7) {
          console.log('❌ ROOT CAUSE: Excel file for trigger date only contains 7 D-numbers');
          console.log('🔧 SOLUTION: Re-upload complete Excel file with all 15 D-numbers (30 topics)');
          console.log('📊 CURRENT: Only 14 topics (7 D-numbers × 2 sets each)');
          console.log('🎯 NEEDED: 30 topics (15 D-numbers × 2 sets each)');
        } else {
          console.log('✅ Excel data appears complete for trigger date');
          console.log('🔍 Issue might be in frontend data processing or filtering');
        }
      }
    }

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

// Run the investigation
investigateTopicIssue().then(() => {
  console.log('\n✅ Investigation complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Investigation failed:', err);
  process.exit(1);
});
