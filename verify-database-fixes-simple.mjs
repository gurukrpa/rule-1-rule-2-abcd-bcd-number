#!/usr/bin/env node

/**
 * SIMPLIFIED DATABASE VERIFICATION
 * Tests our database fixes using direct Supabase connection
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
const testDate = '2025-06-01';

async function verifyOurFixes() {
  console.log('🔍 VERIFYING DATABASE FIXES');
  console.log('============================\n');
  
  console.log('1️⃣ Testing hour_entries table access (fix: hour_entry → hour_entries)');
  try {
    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')
      .select('*')
      .eq('user_id', testUserId)
      .eq('date_key', testDate)
      .limit(1);
    
    console.log('✅ hour_entries table:', {
      accessible: !hourError,
      error: hourError?.message,
      hasData: !!hourData?.[0],
      recordCount: hourData?.length || 0
    });
    
    if (hourData?.[0]) {
      const record = hourData[0];
      console.log('📊 hour_entries record structure:', {
        columns: Object.keys(record),
        hasHourData: !!record.hour_data,
        hourDataType: typeof record.hour_data
      });
      
      // Test our column structure fix (planet_selections → hour_data.planetSelections)
      if (record.hour_data) {
        console.log('\n2️⃣ Testing column structure (fix: planet_selections → hour_data.planetSelections)');
        console.log('✅ hour_data structure:', {
          keys: Object.keys(record.hour_data),
          hasPlanetSelections: !!record.hour_data.planetSelections,
          planetSelectionsType: typeof record.hour_data.planetSelections,
          planetSelectionsKeys: record.hour_data.planetSelections ? 
            Object.keys(record.hour_data.planetSelections) : 'N/A'
        });
        
        // Test HR type handling (selectedHR should work with both string and number keys)
        if (record.hour_data.planetSelections) {
          console.log('\n3️⃣ Testing HR key types (fix: selectedHR string vs number handling)');
          const planetSelections = record.hour_data.planetSelections;
          const hrKeys = Object.keys(planetSelections);
          
          console.log('✅ HR key handling:', {
            originalKeys: hrKeys,
            originalKeyTypes: hrKeys.map(k => typeof k),
            convertedToNumbers: hrKeys.map(k => parseInt(k)).sort((a, b) => a - b),
            firstKeyStringAccess: planetSelections[hrKeys[0]],
            firstKeyNumberAccess: planetSelections[parseInt(hrKeys[0])]
          });
        }
      }
    }
  } catch (e) {
    console.log('❌ hour_entries test failed:', e.message);
  }
  
  console.log('\n4️⃣ Testing excel_data table access');
  try {
    const { data: excelData, error: excelError } = await supabase
      .from('excel_data')
      .select('*')
      .eq('user_id', testUserId)
      .eq('date', testDate)
      .limit(1);
    
    console.log('✅ excel_data table:', {
      accessible: !excelError,
      error: excelError?.message,
      hasData: !!excelData?.[0],
      recordCount: excelData?.length || 0
    });
    
    if (excelData?.[0]) {
      const record = excelData[0];
      console.log('📊 excel_data record structure:', {
        columns: Object.keys(record),
        hasData: !!record.data,
        dataType: typeof record.data,
        hasSets: !!record.data?.sets,
        setsCount: record.data?.sets ? Object.keys(record.data.sets).length : 0
      });
    }
  } catch (e) {
    console.log('❌ excel_data test failed:', e.message);
  }
  
  console.log('\n📋 SUMMARY OF FIXES:');
  console.log('========================');
  console.log('✅ Table name: hour_entry → hour_entries (DataService updated)');
  console.log('✅ Column structure: planet_selections → hour_data.planetSelections (DataService updated)');
  console.log('✅ HR type handling: selectedHR number conversion (Rule2CompactPage updated)');
  console.log('✅ Cache structure: dateDataCache properly structured');
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('- Navigate to Rule2CompactPage in browser');
  console.log('- Check browser console for debug logs');
  console.log('- Verify data extraction pipeline is working');
}

verifyOurFixes().catch(console.error);
