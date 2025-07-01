#!/usr/bin/env node

// Simple analysis using the same pattern as find-complete-data.js
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function analyzeTopicsIssue() {
  console.log('🔍 TOPIC ANALYSIS FOR 26/06/2025');
  console.log('=================================\n');

  // Get Excel data for the specific trigger date
  const { data: targetDateData } = await supabase
    .from('excel_data')
    .select('*')
    .eq('date', '2025-06-26');

  console.log(`📊 Excel entries for 2025-06-26: ${targetDateData.length}`);
  
  if (targetDateData.length === 0) {
    console.log('❌ No data found for trigger date - this is the problem!');
    return;
  }

  // Analyze each entry
  targetDateData.forEach((entry, index) => {
    console.log(`\n👤 User ${entry.user_id} (${entry.file_name}):`);
    
    if (!entry.data || !entry.data.sets) {
      console.log('   ❌ No sets data found');
      return;
    }

    const allSets = Object.keys(entry.data.sets);
    console.log(`   📈 Total sets: ${allSets.length}`);

    // Extract D-numbers
    const dNumbers = new Set();
    allSets.forEach(setName => {
      const match = setName.match(/D-(\d+)/);
      if (match) {
        dNumbers.add(parseInt(match[1]));
      }
    });

    const sortedDNumbers = Array.from(dNumbers).sort((a, b) => a - b);
    console.log(`   🔢 D-numbers: ${sortedDNumbers.join(', ')}`);
    console.log(`   📊 Count: ${sortedDNumbers.length} unique D-numbers`);

    // Check for missing reported numbers
    const reportedMissing = [3, 5, 7, 10, 12, 27, 30, 60];
    const actuallyMissing = reportedMissing.filter(dNum => !dNumbers.has(dNum));
    
    if (actuallyMissing.length > 0) {
      console.log(`   ❌ Missing: ${actuallyMissing.join(', ')}`);
      console.log(`   🎯 This confirms the user's report!`);
    } else {
      console.log(`   ✅ All reported missing D-numbers are present`);
    }

    // Show the problematic state
    if (sortedDNumbers.length === 7) {
      console.log(`   🚨 PROBLEM FOUND: Only 7 D-numbers in Excel file`);
      console.log(`   📊 This gives: 7 × 2 = 14 topics instead of 30`);
    }
  });

  console.log('\n🎯 CONCLUSION:');
  if (targetDateData.some(entry => {
    const sets = Object.keys(entry.data?.sets || {});
    const dNumbers = new Set();
    sets.forEach(setName => {
      const match = setName.match(/D-(\d+)/);
      if (match) dNumbers.add(parseInt(match[1]));
    });
    return dNumbers.size === 7;
  })) {
    console.log('❌ ROOT CAUSE: Excel files contain incomplete data (only 7 D-numbers)');
    console.log('🔧 SOLUTION: Re-upload Excel files with all 15 D-numbers');
    console.log('📊 Expected: D-1,3,4,5,7,9,10,11,12,27,30,60,81,108,144');
  } else {
    console.log('✅ Excel data appears complete - issue is in frontend processing');
  }
}

analyzeTopicsIssue().then(() => {
  console.log('\n✅ Analysis done!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
