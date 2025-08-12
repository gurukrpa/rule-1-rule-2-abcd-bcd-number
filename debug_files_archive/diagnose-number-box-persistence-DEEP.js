/**
 * DEEP DIAGNOSIS: Number Box Persistence Issue - Comprehensive Analysis
 * This script will systematically investigate all aspects of the number box persistence problem
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mldvylsrlqytcjnmhwep.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZHZ5bHNybHF5dGNqbm1od2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0MTMyMDMsImV4cCI6MjA0Njk4OTIwM30.jBn8n5hj8C3A0vv0lTuC8ZFkVQ6xSFRhqJKZzuSmRJE';
const supabase = createClient(supabaseUrl, supabaseKey);

const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
const testDate = '2025-07-26'; // Adjust this to your test date
const hrNumber = 1; // Adjust this to your test HR

async function comprehensiveNumberBoxDiagnosis() {
  console.log('🔬 DEEP DIAGNOSIS: Number Box Persistence Issue Analysis');
  console.log('=' .repeat(80));
  
  try {
    // 1. DATABASE STRUCTURE ANALYSIS
    console.log('\n🗄️ STEP 1: Database Structure Analysis');
    console.log('-'.repeat(50));
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('number_box_clicks')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error('❌ Table access error:', tableError);
      return;
    }
    
    console.log('✅ Table accessible');
    
    // 2. DATA PRESENCE CHECK
    console.log('\n📊 STEP 2: Data Presence Check');
    console.log('-'.repeat(50));
    
    const { data: allClicks, error: allError } = await supabase
      .from('number_box_clicks')
      .select('*')
      .eq('user_id', userId)
      .eq('date_key', testDate);
      
    console.log(`📈 Total clicks for user ${userId} on ${testDate}:`, allClicks?.length || 0);
    
    if (allClicks && allClicks.length > 0) {
      console.log('📋 Sample data structure:', allClicks[0]);
      
      // Group by HR
      const clicksByHR = {};
      allClicks.forEach(click => {
        const hr = click.hr_number;
        if (!clicksByHR[hr]) clicksByHR[hr] = [];
        clicksByHR[hr].push(click);
      });
      
      Object.entries(clicksByHR).forEach(([hr, clicks]) => {
        console.log(`  HR ${hr}: ${clicks.length} clicks`);
      });
    }
    
    // 3. SPECIFIC HR DATA CHECK
    console.log(`\n🎯 STEP 3: HR ${hrNumber} Specific Data Check`);
    console.log('-'.repeat(50));
    
    const { data: hrClicks, error: hrError } = await supabase
      .from('number_box_clicks')
      .select('*')
      .eq('user_id', userId)
      .eq('date_key', testDate)
      .eq('hr_number', hrNumber);
      
    console.log(`📊 HR ${hrNumber} clicks:`, hrClicks?.length || 0);
    
    if (hrClicks && hrClicks.length > 0) {
      console.log('🔍 HR specific data:');
      hrClicks.forEach((click, idx) => {
        console.log(`  ${idx + 1}. ${click.set_name} | Number: ${click.number_value} | Clicked: ${click.is_clicked} | Present: ${click.is_present}`);
      });
    }
    
    // 4. KEY GENERATION TEST
    console.log('\n🔑 STEP 4: Key Generation Analysis');
    console.log('-'.repeat(50));
    
    if (hrClicks && hrClicks.length > 0) {
      console.log('🧮 Key generation test:');
      hrClicks.forEach(click => {
        // This should match the key generation in Rule1Page_Enhanced.jsx
        const expectedKey = `${click.set_name}_${click.date_key}_${click.number_value}_HR${click.hr_number}`;
        console.log(`  Expected key: ${expectedKey}`);
        console.log(`  Click data: ${JSON.stringify(click)}`);
      });
    }
    
    // 5. LOADER SIMULATION TEST
    console.log('\n🚀 STEP 5: Loader Logic Simulation');
    console.log('-'.repeat(50));
    
    console.log('🔄 Simulating loadSavedNumberBoxClicks logic...');
    
    const savedClicks = hrClicks; // This is what the loader gets
    const newClicked = {};
    const newPresent = {};
    
    if (savedClicks && Array.isArray(savedClicks)) {
      console.log(`📦 Processing ${savedClicks.length} saved clicks...`);
      
      savedClicks.forEach((entry, index) => {
        const key = `${entry.set_name}_${entry.date_key}_${entry.number_value}_HR${entry.hr_number}`;
        
        console.log(`  Processing entry ${index + 1}:`, {
          key,
          isClicked: entry.is_clicked,
          isPresent: entry.is_present
        });
        
        if (entry.is_clicked === true) {
          newClicked[key] = true;
          newPresent[key] = entry.is_present;
          console.log(`    ✅ Added to restore state: ${key}`);
        } else {
          console.log(`    ⏭️ Skipped (not clicked): ${key}`);
        }
      });
    }
    
    console.log('🎯 Final restoration state:');
    console.log('  newClicked:', newClicked);
    console.log('  newPresent:', newPresent);
    console.log(`  Total to restore: ${Object.keys(newClicked).length} clicked numbers`);
    
    // 6. REACT STATE TIMING TEST
    console.log('\n⏰ STEP 6: React State Timing Analysis');
    console.log('-'.repeat(50));
    
    console.log('🧩 Common React state timing issues:');
    console.log('  1. useEffect dependencies not triggering properly');
    console.log('  2. State not fully initialized when loader runs');
    console.log('  3. Race conditions between multiple useEffects');
    console.log('  4. State updates being batched or delayed');
    
    // 7. CRITICAL CHECKS
    console.log('\n🚨 STEP 7: Critical Issue Identification');
    console.log('-'.repeat(50));
    
    const criticalIssues = [];
    
    if (!allClicks || allClicks.length === 0) {
      criticalIssues.push('❌ No saved clicks found in database');
    }
    
    if (!hrClicks || hrClicks.length === 0) {
      criticalIssues.push(`❌ No clicks found for HR ${hrNumber}`);
    }
    
    if (hrClicks && hrClicks.length > 0 && Object.keys(newClicked).length === 0) {
      criticalIssues.push('❌ Clicks exist but none are marked as clicked (is_clicked = true)');
    }
    
    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES DETECTED:');
      criticalIssues.forEach(issue => console.log(`  ${issue}`));
    } else {
      console.log('✅ No critical database issues detected');
      console.log('🔍 Issue likely in React state management or timing');
    }
    
    // 8. BROWSER STATE DEBUGGING COMMANDS
    console.log('\n🌐 STEP 8: Browser Debugging Commands');
    console.log('-'.repeat(50));
    
    console.log('Run these commands in your browser console:');
    console.log(`
// Check current React state
console.log('Current clickedNumbers:', window.reactDevTools?.clickedNumbers);
console.log('Current numberPresenceStatus:', window.reactDevTools?.numberPresenceStatus);

// Check if loader function exists
console.log('DualServiceManager:', window.dualServiceManager);

// Manual loader test
if (window.dualServiceManager) {
  window.dualServiceManager.getAllNumberBoxClicksForUserDate('${userId}', '${testDate}')
    .then(data => console.log('Manual loader test:', data));
}

// Force reload state (if exposed)
if (window.forceReloadNumberBoxes) {
  window.forceReloadNumberBoxes();
}
    `);
    
    // 9. RECOMMENDATIONS
    console.log('\n💡 STEP 9: Diagnostic Recommendations');
    console.log('-'.repeat(50));
    
    console.log('Based on analysis, try these fixes:');
    console.log('1. Add debugging to browser console during page load');
    console.log('2. Check React DevTools for state values after load');
    console.log('3. Verify useEffect dependencies are complete');
    console.log('4. Add state verification with setTimeout delays');
    console.log('5. Check if multiple instances of loader are running');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

// Run the diagnosis
comprehensiveNumberBoxDiagnosis();
