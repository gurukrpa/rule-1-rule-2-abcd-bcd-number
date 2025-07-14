// debug-table-check.mjs
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking if separate table structure exists...');
  
  try {
    // Check user_dates_abcd table
    console.log('\n📊 Checking user_dates_abcd table...');
    const { data: abcdData, error: abcdError } = await supabase
      .from('user_dates_abcd')
      .select('*')
      .limit(3);
    
    if (abcdError) {
      console.log('❌ user_dates_abcd table error:', abcdError.message);
      console.log('🔧 This table needs to be created for ABCD page independence');
    } else {
      console.log('✅ user_dates_abcd table exists');
      console.log('📊 Data count:', abcdData.length);
      if (abcdData.length > 0) {
        console.log('📊 Sample data:', abcdData);
      }
    }
    
    // Check user_dates_userdata table  
    console.log('\n📊 Checking user_dates_userdata table...');
    const { data: userdataData, error: userdataError } = await supabase
      .from('user_dates_userdata')
      .select('*')
      .limit(3);
    
    if (userdataError) {
      console.log('❌ user_dates_userdata table error:', userdataError.message);
      console.log('🔧 This table needs to be created for UserData page independence');
    } else {
      console.log('✅ user_dates_userdata table exists');
      console.log('📊 Data count:', userdataData.length);
      if (userdataData.length > 0) {
        console.log('📊 Sample data:', userdataData);
      }
    }
    
    // Check original user_dates table
    console.log('\n📊 Checking user_dates table...');
    const { data: originalData, error: originalError } = await supabase
      .from('user_dates')
      .select('*')
      .limit(5);
    
    if (originalError) {
      console.log('❌ user_dates table error:', originalError.message);
    } else {
      console.log('✅ user_dates table exists');
      console.log('📊 Data count:', originalData.length);
      if (originalData.length > 0) {
        console.log('📊 Sample data:', originalData.slice(0, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
  
  process.exit(0);
}

checkTables();
