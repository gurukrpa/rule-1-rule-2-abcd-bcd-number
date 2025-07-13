// debug-localstorage-mismatch.mjs
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';

async function debugLocalStorageMismatch() {
  console.log('🔍 Debugging localStorage vs Database mismatch...');
  console.log('👤 User ID:', userId);
  
  try {
    // Check what's in user_dates_abcd table (where ABCD page stores)
    console.log('\n🗄️ Database (user_dates_abcd table):');
    const { data: abcdData, error: abcdError } = await supabase
      .from('user_dates_abcd')
      .select('dates')
      .eq('user_id', userId)
      .single();
    
    if (abcdError) {
      console.log('❌ Error reading user_dates_abcd:', abcdError.message);
    } else {
      console.log('✅ ABCD table dates:', abcdData.dates);
    }
    
    // Check what's in regular user_dates table 
    console.log('\n🗄️ Database (user_dates table):');
    const { data: regularData, error: regularError } = await supabase
      .from('user_dates')
      .select('dates')
      .eq('user_id', userId)
      .single();
    
    if (regularError) {
      console.log('❌ Error reading user_dates:', regularError.message);
    } else {
      console.log('✅ Regular table dates:', regularData.dates);
    }
    
    // Simulate what localStorage would have (if any)
    console.log('\n📦 Expected localStorage keys:');
    const expectedKeys = [
      `abcd_dates_${userId}`,
      `dates_${userId}`,
      `user_dates_${userId}`,
      `${userId}_dates`
    ];
    
    expectedKeys.forEach(key => {
      console.log(`  - ${key}: Would contain dates if ABCD page used localStorage`);
    });
    
    console.log('\n🔍 Analysis:');
    console.log('❌ PROBLEM IDENTIFIED:');
    console.log('  1. ABCD page stores dates in DATABASE (user_dates_abcd table)');
    console.log('  2. PlanetsAnalysis page tries localStorage FIRST');
    console.log('  3. When localStorage is empty, it tries database as fallback');
    console.log('  4. But there might be a bug in the fallback logic');
    
    console.log('\n🎯 Expected Flow:');
    console.log('  1. PlanetsAnalysis tries localStorage: empty');
    console.log('  2. PlanetsAnalysis tries CleanSupabaseServiceWithSeparateStorage: should get ABCD dates');
    console.log('  3. Use ABCD dates for analysis: [2025-07-03, 2025-07-07, 2025-07-08]');
    
    console.log('\n✅ Correct dates to expect:');
    if (abcdData && abcdData.dates) {
      console.log('  Available for analysis:', abcdData.dates);
      console.log('  July 7 click → July 7 data (exact match)');
      console.log('  July 8 click → July 8 data (exact match)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

debugLocalStorageMismatch();
