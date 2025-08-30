#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUserData() {
  console.log('Looking for actual user data in different tables...\n');
  
  try {
    // Check rule2_analysis_results
    console.log('🔍 Checking rule2_analysis_results table:');
    const { data: rule2Data, error: rule2Error } = await supabase
      .from('rule2_analysis_results')
      .select('user_id, analysis_date')
      .limit(5);
    
    if (rule2Error) {
      console.log(`   ❌ Error: ${rule2Error.message}`);
    } else {
      console.log(`   📊 Found ${rule2Data.length} records`);
      if (rule2Data.length > 0) {
        console.log(`   📋 Sample user_ids: ${rule2Data.map(r => r.user_id).join(', ')}`);
        console.log(`   📅 Sample dates: ${rule2Data.map(r => r.analysis_date).join(', ')}`);
      }
    }
    
    // Check hour_entries
    console.log('\n🔍 Checking hour_entries table:');
    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')
      .select('user_id, date_key')
      .limit(5);
    
    if (hourError) {
      console.log(`   ❌ Error: ${hourError.message}`);
    } else {
      console.log(`   📊 Found ${hourData.length} records`);
      if (hourData.length > 0) {
        console.log(`   📋 Sample user_ids: ${hourData.map(r => r.user_id).join(', ')}`);
        console.log(`   📅 Sample dates: ${hourData.map(r => r.date_key).join(', ')}`);
      }
    }
    
    // Check for specific date records regardless of user
    console.log('\n🔍 Checking for 2025-08-14 records:');
    const { data: dateData, error: dateError } = await supabase
      .from('rule2_analysis_results')
      .select('user_id, hr_number, topic_numbers')
      .eq('analysis_date', '2025-08-14')
      .limit(10);
    
    if (dateError) {
      console.log(`   ❌ Error: ${dateError.message}`);
    } else {
      console.log(`   📊 Found ${dateData.length} records for 2025-08-14`);
      if (dateData.length > 0) {
        console.log(`   📋 Users with data on 2025-08-14: ${[...new Set(dateData.map(r => r.user_id))].join(', ')}`);
        console.log(`   🕐 Hours available: ${[...new Set(dateData.map(r => r.hr_number))].sort().join(', ')}`);
        
        // Check first record for ABCD/BCD numbers
        const firstRecord = dateData[0];
        if (firstRecord.topic_numbers) {
          const allNumbers = Object.values(firstRecord.topic_numbers).flat();
          const abcdBcdNumbers = allNumbers.filter(num => 
            (typeof num === 'string' && (num.includes('ABCD') || num.includes('BCD'))) ||
            (typeof num === 'number' && num >= 1000)
          );
          console.log(`   ⭐ Sample ABCD/BCD numbers: ${abcdBcdNumbers.slice(0, 5).join(', ')}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

findUserData();
