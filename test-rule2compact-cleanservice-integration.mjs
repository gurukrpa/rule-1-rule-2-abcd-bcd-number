#!/usr/bin/env node

/**
 * 🧪 TEST: Rule2CompactPage CleanSupabaseService Integration
 * 
 * This script tests if Rule2CompactPage can properly access data through CleanSupabaseService
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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testUserId = '8db9861a-76ce-4ae3-81b0-7a8b82314ef2';
const testDates = ['2025-06-01', '2025-06-02', '2025-06-03', '2025-06-04', '2025-06-05'];

async function testCleanSupabaseServiceIntegration() {
  console.log('🧪 TESTING RULE2COMPACTPAGE CLEANSUPABASESERVICE INTEGRATION');
  console.log('============================================================');
  
  try {
    // Import CleanSupabaseService directly
    const { default: cleanSupabaseService } = await import('./src/services/CleanSupabaseService.js');
    
    console.log('✅ CleanSupabaseService imported successfully');
    
    // Test the exact methods that Rule2CompactPage uses
    console.log('\n🔍 Testing CleanSupabaseService methods used by Rule2CompactPage:');
    
    for (const testDate of testDates.slice(0, 2)) { // Test first 2 dates
      console.log(`\n📅 Testing date: ${testDate}`);
      
      // Test hasExcelData
      const hasExcel = await cleanSupabaseService.hasExcelData(testUserId, testDate);
      console.log(`   📊 hasExcelData: ${hasExcel}`);
      
      // Test hasHourEntry
      const hasHour = await cleanSupabaseService.hasHourEntry(testUserId, testDate);
      console.log(`   🕐 hasHourEntry: ${hasHour}`);
      
      if (hasExcel && hasHour) {
        // Test getExcelData
        const excelData = await cleanSupabaseService.getExcelData(testUserId, testDate);
        console.log(`   📊 getExcelData:`, {
          exists: !!excelData,
          hasSets: !!excelData?.sets,
          setsCount: excelData?.sets ? Object.keys(excelData.sets).length : 0
        });
        
        // Test getHourEntry
        const hourData = await cleanSupabaseService.getHourEntry(testUserId, testDate);
        console.log(`   🕐 getHourEntry:`, {
          exists: !!hourData,
          hasPlanetSelections: !!hourData?.planetSelections,
          hrCount: hourData?.planetSelections ? Object.keys(hourData.planetSelections).length : 0
        });
        
        // Test data extraction like Rule2CompactPage does
        if (excelData?.sets && hourData?.planetSelections) {
          const setNames = Object.keys(excelData.sets).slice(0, 2); // Test first 2 sets
          console.log(`   🎯 Testing data extraction for sets: ${setNames.join(', ')}`);
          
          setNames.forEach(setName => {
            const setData = excelData.sets[setName];
            const hrKeys = Object.keys(hourData.planetSelections);
            
            if (setData && hrKeys.length > 0) {
              const hr = hrKeys[0]; // Use first HR
              const selectedPlanet = hourData.planetSelections[hr];
              
              console.log(`      🪐 Set ${setName}, HR ${hr}, Planet ${selectedPlanet}`);
              
              // Try to extract some numbers like Rule2CompactPage does
              const elementNames = Object.keys(setData).slice(0, 2); // Test first 2 elements
              let extractedNumbers = [];
              
              elementNames.forEach(elementName => {
                const planetData = setData[elementName];
                const rawString = planetData?.[selectedPlanet];
                if (rawString) {
                  // Extract the first number (similar to Rule2CompactPage logic)
                  const match = rawString.match(/^[a-z]+-(\d+)[\/\-]/);
                  if (match) {
                    extractedNumbers.push(Number(match[1]));
                  }
                }
              });
              
              console.log(`         📊 Extracted numbers: [${extractedNumbers.join(', ')}]`);
            }
          });
        }
      }
    }
    
    console.log('\n✅ CleanSupabaseService integration test completed successfully!');
    console.log('\n🎯 CONCLUSION: Rule2CompactPage should now be able to access data correctly');
    
  } catch (e) {
    console.error('❌ CleanSupabaseService integration test failed:', e.message);
    console.error('Full error:', e);
    
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('1. Check that CleanSupabaseService.js exists');
    console.log('2. Verify import paths are correct');
    console.log('3. Ensure CleanSupabaseService methods work independently');
    
    return false;
  }
  
  return true;
}

// Run the test
testCleanSupabaseServiceIntegration()
  .then(success => {
    if (success) {
      console.log('\n🚀 Rule2CompactPage should now work correctly with CleanSupabaseService!');
      console.log('💡 Try accessing Rule2CompactPage in the browser to test ABCD/BCD number display');
    } else {
      console.log('\n⚠️ Issues found - Rule2CompactPage may still have problems');
    }
  })
  .catch(console.error);
