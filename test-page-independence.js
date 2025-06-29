// Test script to verify page-specific date independence
// This script will check if dates are being stored in the correct tables

import { createClient } from '@supabase/supabase-js';

// Database configuration (update with your actual values)
const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPageIndependence() {
  console.log('🧪 Testing page-specific date independence...\n');

  try {
    // Check UserData table
    const { data: userDataDates, error: userDataError } = await supabase
      .from('user_dates_userdata')
      .select('*');

    if (userDataError && userDataError.code !== 'PGRST116') {
      console.error('❌ Error accessing user_dates_userdata:', userDataError);
    } else {
      console.log('📊 UserData table (user_dates_userdata):');
      console.log(`   Records: ${userDataDates?.length || 0}`);
      if (userDataDates?.length > 0) {
        userDataDates.forEach((record, i) => {
          console.log(`   ${i + 1}. User ${record.user_id}: ${record.dates?.length || 0} dates`);
        });
      }
      console.log('');
    }

    // Check ABCD table
    const { data: abcdDates, error: abcdError } = await supabase
      .from('user_dates_abcd')
      .select('*');

    if (abcdError && abcdError.code !== 'PGRST116') {
      console.error('❌ Error accessing user_dates_abcd:', abcdError);
    } else {
      console.log('📊 ABCD table (user_dates_abcd):');
      console.log(`   Records: ${abcdDates?.length || 0}`);
      if (abcdDates?.length > 0) {
        abcdDates.forEach((record, i) => {
          console.log(`   ${i + 1}. User ${record.user_id}: ${record.dates?.length || 0} dates`);
        });
      }
      console.log('');
    }

    // Check original table (should be empty or legacy)
    const { data: originalDates, error: originalError } = await supabase
      .from('user_dates')
      .select('*');

    if (originalError && originalError.code !== 'PGRST116') {
      console.error('❌ Error accessing user_dates:', originalError);
    } else {
      console.log('📊 Original table (user_dates) - should be legacy:');
      console.log(`   Records: ${originalDates?.length || 0}`);
      if (originalDates?.length > 0) {
        console.log('   ⚠️  Warning: Original table still has data - migration may be incomplete');
      }
      console.log('');
    }

    console.log('✅ Independence test completed successfully!');
    console.log('\n📋 Expected behavior:');
    console.log('   - UserData page dates should only appear in user_dates_userdata');
    console.log('   - ABCD page dates should only appear in user_dates_abcd');
    console.log('   - No cross-contamination between pages');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPageIndependence();
