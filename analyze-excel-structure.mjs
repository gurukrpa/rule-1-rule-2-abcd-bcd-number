#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 ANALYZING EXCEL DATA STRUCTURE FOR MISSING TOPICS');
console.log('====================================================');
console.log('');

async function analyzeExcelDataStructure() {
  try {
    // Focus on the trigger date where the issue is reported
    const targetDate = '2025-06-26';
    console.log(`🎯 Analyzing Excel data for trigger date: ${targetDate}`);
    console.log('');

    const { data: excelData, error } = await supabase
      .from('excel_data')
      .select('*')
      .eq('date', targetDate);

    if (error) {
      console.error('❌ Error fetching data:', error);
      return;
    }

    if (excelData.length === 0) {
      console.log('❌ No Excel data found for target date');
      return;
    }

    console.log(`✅ Found ${excelData.length} Excel entries for ${targetDate}`);
    console.log('');

    // Analyze each entry
    excelData.forEach((entry, index) => {
      console.log(`📊 ANALYSIS ${index + 1}: User ${entry.user_id}`);
      console.log(`   File: ${entry.file_name}`);
      console.log(`   Upload time: ${entry.created_at}`);
      
      if (!entry.data || !entry.data.sets) {
        console.log('   ❌ No sets data found');
        console.log('');
        return;
      }

      const allSets = Object.keys(entry.data.sets);
      console.log(`   📈 Total sets found: ${allSets.length}`);

      // Extract D-numbers and analyze
      const dNumbers = new Map(); // Map to store D-number -> set names
      allSets.forEach(setName => {
        const match = setName.match(/D-(\d+)/);
        if (match) {
          const dNum = parseInt(match[1]);
          if (!dNumbers.has(dNum)) {
            dNumbers.set(dNum, []);
          }
          dNumbers.get(dNum).push(setName);
        } else {
          console.log(`   ⚠️ Non-standard set name: ${setName}`);
        }
      });

      const sortedDNumbers = Array.from(dNumbers.keys()).sort((a, b) => a - b);
      console.log(`   🔢 D-numbers found: ${sortedDNumbers.join(', ')}`);
      console.log(`   📊 Unique D-numbers: ${sortedDNumbers.length}`);

      // Expected 15 D-numbers for 30 topics
      const expectedDNumbers = [1, 3, 4, 5, 7, 9, 10, 11, 12, 27, 30, 60, 81, 108, 144];
      const missingDNumbers = expectedDNumbers.filter(dNum => !dNumbers.has(dNum));
      const extraDNumbers = sortedDNumbers.filter(dNum => !expectedDNumbers.includes(dNum));

      if (missingDNumbers.length > 0) {
        console.log(`   ❌ Missing expected D-numbers: ${missingDNumbers.join(', ')}`);
      }
      
      if (extraDNumbers.length > 0) {
        console.log(`   ⚠️ Unexpected D-numbers: ${extraDNumbers.join(', ')}`);
      }

      // Check for the specific reported missing D-numbers
      const reportedMissing = [3, 5, 7, 10, 12, 27, 30, 60];
      const actuallyMissing = reportedMissing.filter(dNum => !dNumbers.has(dNum));
      
      if (actuallyMissing.length > 0) {
        console.log(`   🎯 CONFIRMED MISSING (user reported): ${actuallyMissing.join(', ')}`);
      } else {
        console.log(`   ✅ All user-reported missing D-numbers are actually present!`);
      }

      // Show sets per D-number
      console.log('   📋 Sets breakdown:');
      sortedDNumbers.forEach(dNum => {
        const sets = dNumbers.get(dNum);
        console.log(`      D-${dNum}: ${sets.length} sets (${sets.join(', ')})`);
      });

      // Sample a few sets to check structure
      console.log('   🔍 Sample set structure:');
      const sampleSets = allSets.slice(0, 3);
      sampleSets.forEach(setName => {
        const setData = entry.data.sets[setName];
        const elements = Object.keys(setData || {});
        console.log(`      ${setName}: ${elements.length} elements`);
        
        if (elements.length > 0) {
          const firstElement = elements[0];
          const elementData = setData[firstElement];
          const planets = Object.keys(elementData || {});
          console.log(`        Sample element "${firstElement}": ${planets.length} planets (${planets.join(', ')})`);
        }
      });

      console.log('');
    });

    // Summary analysis
    console.log('🎯 SUMMARY ANALYSIS');
    console.log('==================');
    
    const allFoundDNumbers = new Set();
    let totalSetsAcrossAllUsers = 0;
    
    excelData.forEach(entry => {
      if (entry.data?.sets) {
        const sets = Object.keys(entry.data.sets);
        totalSetsAcrossAllUsers += sets.length;
        
        sets.forEach(setName => {
          const match = setName.match(/D-(\d+)/);
          if (match) {
            allFoundDNumbers.add(parseInt(match[1]));
          }
        });
      }
    });

    const sortedFoundDNumbers = Array.from(allFoundDNumbers).sort((a, b) => a - b);
    console.log(`📊 All D-numbers across all users: ${sortedFoundDNumbers.join(', ')}`);
    console.log(`📈 Total unique D-numbers: ${sortedFoundDNumbers.length}`);
    console.log(`📋 Total sets across all users: ${totalSetsAcrossAllUsers}`);

    // Diagnosis
    console.log('');
    console.log('🔍 DIAGNOSIS');
    console.log('============');

    if (sortedFoundDNumbers.length === 7) {
      console.log('❌ ROOT CAUSE IDENTIFIED: Excel files only contain 7 D-numbers');
      console.log('💡 The uploaded Excel files are incomplete');
      console.log('🔧 SOLUTION: Re-upload Excel files with all 15 D-numbers (30 topics)');
      console.log('');
      console.log('📊 Current state: 7 D-numbers × 2 sets each = 14 topics');
      console.log('🎯 Required state: 15 D-numbers × 2 sets each = 30 topics');
    } else if (sortedFoundDNumbers.length === 15) {
      console.log('✅ Excel data appears complete (15 D-numbers found)');
      console.log('🔍 Issue must be in frontend data processing or filtering');
      console.log('💡 Check TOPIC_ORDER arrays and data transformation logic');
    } else {
      console.log(`⚠️ Unexpected state: ${sortedFoundDNumbers.length} D-numbers found`);
      console.log('🔍 This is neither the reported issue nor the expected complete state');
    }

    // Check specific user data if multiple users
    if (excelData.length > 1) {
      console.log('');
      console.log('👥 MULTIPLE USERS DETECTED');
      console.log('==========================');
      console.log('The issue might be user-specific. Check which user you\'re logged in as:');
      
      excelData.forEach((entry, index) => {
        const sets = Object.keys(entry.data?.sets || {});
        const dNums = new Set();
        sets.forEach(setName => {
          const match = setName.match(/D-(\d+)/);
          if (match) dNums.add(parseInt(match[1]));
        });
        
        console.log(`   User ${entry.user_id}: ${dNums.size} D-numbers, ${sets.length} total sets`);
      });
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
analyzeExcelDataStructure().then(() => {
  console.log('\n✅ Analysis complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Analysis failed:', err);
  process.exit(1);
});
