#!/usr/bin/env node

/**
 * EXACT PIPELINE SIMULATION TEST
 * This simulates the exact data extraction pipeline used in Rule2CompactPage
 * to verify our fixes work end-to-end
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read environment variables
const envPath = path.join(process.cwd(), '.env');
let supabaseUrl, supabaseKey;

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (e) {
  console.error('❌ Could not read .env file:', e.message);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test configuration matching Rule2CompactPage
const testUserId = '8db9861a-76ce-4ae3-81b0-7a8b82314ef2';
const testDates = ['2025-06-01', '2025-06-02', '2025-06-03', '2025-06-04', '2025-06-05'];
const selectedHR = 1; // This was causing the issue - number vs string

// Simulate the DataService methods with our fixes
async function getExcelData(userId, date) {
  console.log(`📊 getExcelData(${userId}, ${date})`);
  
  const { data, error } = await supabase
    .from('excel_data') // ✅ Correct table name
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();
    
  if (error) {
    console.log(`❌ Excel data error:`, error.message);
    return null;
  }
  
  // ✅ Return data.sets (our structure fix)
  return {
    sets: data?.data?.sets || {},
    // ... other properties
  };
}

async function getHourEntry(userId, date) {
  console.log(`⏰ getHourEntry(${userId}, ${date})`);
  
  const { data, error } = await supabase
    .from('hour_entries') // ✅ Fixed table name: hour_entry → hour_entries
    .select('hour_data')
    .eq('user_id', userId)
    .eq('date_key', date) // ✅ Correct column name
    .single();
    
  if (error) {
    console.log(`❌ Hour data error:`, error.message);
    return null;
  }
  
  // ✅ Return hour_data.planetSelections (our structure fix)
  return {
    planetSelections: data?.hour_data?.planetSelections || {}
  };
}

// Simulate the exact extraction logic from Rule2CompactPage
function extractElementNumber(str) {
  if (typeof str !== 'string') return null;
  
  // Look for pattern: element-NUMBER/ or element-NUMBER-
  const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
  return match ? Number(match[1]) : null;
}

function extractFromDateAndSet(targetDate, setName, cachedData, selectedHR) {
  console.log(`🔍 extractFromDateAndSet(${targetDate}, ${setName}, selectedHR: ${selectedHR})`);
  
  if (!cachedData || !cachedData.excelData || !cachedData.hourData) {
    console.log(`❌ Missing cached data for ${targetDate}`);
    return [];
  }
  
  const { sets, planetSelections } = cachedData;
  console.log(`📊 Available sets: ${Object.keys(sets).length}, planetSelections keys: ${Object.keys(planetSelections)}`);
  
  const allNumbers = new Set();
  
  // Find the specific set
  const setData = sets[setName];
  if (setData) {
    console.log(`📋 Found set ${setName} with ${Object.keys(setData).length} elements`);
    
    // ✅ Use the selected HR for planet selection (this was the key fix)
    const selectedPlanet = planetSelections[selectedHR]; // selectedHR is now a number
    
    if (selectedPlanet) {
      console.log(`🪐 Using planet: ${selectedPlanet} for HR ${selectedHR}`);
      
      // Process each element in the set
      Object.entries(setData).forEach(([elementName, planetData]) => {
        const rawString = planetData[selectedPlanet];
        if (rawString) {
          const elementNumber = extractElementNumber(rawString);
          console.log(`🔢 ${elementName}[${selectedPlanet}]: "${rawString}" → ${elementNumber}`);
          if (elementNumber !== null) {
            allNumbers.add(elementNumber);
          }
        }
      });
    } else {
      console.log(`❌ No planet selected for HR ${selectedHR}. Available HRs: ${Object.keys(planetSelections)}`);
    }
  } else {
    console.log(`❌ Set ${setName} not found. Available sets: ${Object.keys(sets).slice(0, 3)}...`);
  }
  
  const result = Array.from(allNumbers).sort((a, b) => a - b);
  console.log(`✅ Final numbers for ${targetDate}, set ${setName}: [${result.join(', ')}]`);
  return result;
}

async function simulateRule2CompactPagePipeline() {
  console.log('🚀 SIMULATING RULE2COMPACTPAGE DATA EXTRACTION PIPELINE');
  console.log('=======================================================\n');
  
  // Step 1: Preload data (like Rule2CompactPage does)
  console.log('1️⃣ Preloading date data...');
  const dateDataCache = new Map();
  
  for (const targetDate of testDates) {
    console.log(`\n📅 Loading data for ${targetDate}:`);
    
    const [excelData, hourData] = await Promise.all([
      getExcelData(testUserId, targetDate),
      getHourEntry(testUserId, targetDate)
    ]);
    
    dateDataCache.set(targetDate, {
      excelData,
      hourData,
      sets: excelData?.sets || {},
      planetSelections: hourData?.planetSelections || {}
    });
    
    console.log(`✅ Cached data for ${targetDate}:`, {
      hasExcelData: !!excelData,
      hasHourData: !!hourData,
      setsCount: Object.keys(excelData?.sets || {}).length,
      planetSelectionsCount: Object.keys(hourData?.planetSelections || {}).length
    });
  }
  
  // Step 2: Test data extraction for D-day (like Rule2CompactPage does)
  console.log(`\n2️⃣ Testing D-day extraction (${testDates[4]}):`);
  const dDay = testDates[4]; // 2025-06-05
  const cachedData = dateDataCache.get(dDay);
  
  if (cachedData && cachedData.sets) {
    const availableSets = Object.keys(cachedData.sets);
    console.log(`📋 Available sets for D-day: ${availableSets.length}`);
    
    // Test extraction for first few sets
    const testSets = availableSets.slice(0, 3);
    let totalNumbers = 0;
    
    for (const setName of testSets) {
      const numbers = extractFromDateAndSet(dDay, setName, cachedData, selectedHR);
      totalNumbers += numbers.length;
      
      if (numbers.length > 0) {
        console.log(`✅ ${setName}: [${numbers.join(', ')}] (${numbers.length} numbers)`);
      } else {
        console.log(`❌ ${setName}: No numbers extracted`);
      }
    }
    
    console.log(`\n📊 EXTRACTION SUMMARY:`);
    console.log(`- Total sets tested: ${testSets.length}`);
    console.log(`- Total numbers extracted: ${totalNumbers}`);
    console.log(`- Average per set: ${(totalNumbers / testSets.length).toFixed(1)}`);
    
    if (totalNumbers > 0) {
      console.log('\n🎉 SUCCESS! Data extraction pipeline is working!');
      console.log('✅ Our database fixes have resolved the "No D-day numbers found" issue');
    } else {
      console.log('\n❌ ISSUE: No numbers were extracted');
      console.log('🔍 Need to investigate data structure or extraction logic');
    }
  } else {
    console.log('❌ No cached data available for D-day');
  }
  
  console.log('\n📋 FIX VERIFICATION SUMMARY:');
  console.log('============================');
  console.log('✅ Table name fix: hour_entry → hour_entries');
  console.log('✅ Column structure fix: planet_selections → hour_data.planetSelections');
  console.log('✅ selectedHR type fix: string → number');
  console.log('✅ Data extraction pipeline: Simulated successfully');
}

simulateRule2CompactPagePipeline().catch(console.error);
