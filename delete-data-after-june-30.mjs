// Delete all data for user "sing maya" after June 30, 2025
// This script will clean up all tables that contain date-based data

import { createClient } from '@supabase/supabase-js';

// Use your actual Supabase credentials
const supabaseUrl = 'https://kqfkebcqrspffwcrkkid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZmtlYmNxcnNwZmZ3Y3Jra2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2OTg5NzAsImV4cCI6MjA0OTI3NDk3MH0.yGCy2Vu0Y-8jSJ1D6lVJODPJN6_VuPqHdWKPPy3jyDw';

const supabase = createClient(supabaseUrl, supabaseKey);
const USER_ID = 'sing maya';
const CUTOFF_DATE = '2025-06-30';

console.log('🗑️ DELETING DATA AFTER JUNE 30, 2025 FOR USER:', USER_ID);
console.log('==================================================');
console.log(`⚠️ WARNING: This will permanently delete all data after ${CUTOFF_DATE}`);
console.log('');

async function deleteDataAfterJune30() {
  try {
    let totalDeleted = 0;

    // 1. Delete from excel_data table
    console.log('📊 1. Cleaning excel_data table...');
    const { data: deletedExcel, error: excelError } = await supabase
      .from('excel_data')
      .delete()
      .eq('user_id', USER_ID)
      .gt('date', CUTOFF_DATE)
      .select();
    
    if (excelError) {
      console.log('❌ Excel data deletion error:', excelError.message);
    } else {
      const excelCount = deletedExcel?.length || 0;
      console.log(`✅ Deleted ${excelCount} Excel records after ${CUTOFF_DATE}`);
      totalDeleted += excelCount;
      if (excelCount > 0) {
        deletedExcel.forEach(record => {
          console.log(`   📊 Deleted: ${record.date}`);
        });
      }
    }

    // 2. Delete from hour_entries table
    console.log('\n⏰ 2. Cleaning hour_entries table...');
    const { data: deletedHour, error: hourError } = await supabase
      .from('hour_entries')
      .delete()
      .eq('user_id', USER_ID)
      .gt('date_key', CUTOFF_DATE)
      .select();
    
    if (hourError) {
      console.log('❌ Hour entries deletion error:', hourError.message);
    } else {
      const hourCount = deletedHour?.length || 0;
      console.log(`✅ Deleted ${hourCount} Hour entry records after ${CUTOFF_DATE}`);
      totalDeleted += hourCount;
      if (hourCount > 0) {
        deletedHour.forEach(record => {
          console.log(`   ⏰ Deleted: ${record.date_key}`);
        });
      }
    }

    // 3. Delete from rule2_analysis_results table
    console.log('\n🧮 3. Cleaning rule2_analysis_results table...');
    const { data: deletedAnalysis, error: analysisError } = await supabase
      .from('rule2_analysis_results')
      .delete()
      .eq('user_id', USER_ID)
      .gt('analysis_date', CUTOFF_DATE)
      .select();
    
    if (analysisError) {
      console.log('❌ Analysis results deletion error:', analysisError.message);
    } else {
      const analysisCount = deletedAnalysis?.length || 0;
      console.log(`✅ Deleted ${analysisCount} Analysis result records after ${CUTOFF_DATE}`);
      totalDeleted += analysisCount;
      if (analysisCount > 0) {
        deletedAnalysis.forEach(record => {
          console.log(`   🧮 Deleted: ${record.analysis_date}`);
        });
      }
    }

    // 4. Update user_dates table (remove dates after June 30)
    console.log('\n📅 4. Updating user_dates table...');
    const { data: currentUserDates, error: fetchUserError } = await supabase
      .from('user_dates')
      .select('dates')
      .eq('user_id', USER_ID)
      .single();
    
    if (fetchUserError && fetchUserError.code !== 'PGRST116') {
      console.log('❌ Error fetching user_dates:', fetchUserError.message);
    } else if (currentUserDates?.dates) {
      const originalDates = currentUserDates.dates;
      const filteredDates = originalDates.filter(date => date <= CUTOFF_DATE);
      const removedDates = originalDates.filter(date => date > CUTOFF_DATE);
      
      if (removedDates.length > 0) {
        const { error: updateUserError } = await supabase
          .from('user_dates')
          .update({ 
            dates: filteredDates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', USER_ID);
        
        if (updateUserError) {
          console.log('❌ Error updating user_dates:', updateUserError.message);
        } else {
          console.log(`✅ Removed ${removedDates.length} dates from user_dates:`);
          removedDates.forEach(date => {
            console.log(`   📅 Removed: ${date}`);
          });
          console.log(`📅 Remaining dates: ${filteredDates.length}`);
          totalDeleted += removedDates.length;
        }
      } else {
        console.log('✅ No dates to remove from user_dates (all dates are on or before June 30)');
      }
    } else {
      console.log('ℹ️ No user_dates found or dates array is empty');
    }

    // 5. Update user_dates_abcd table (remove dates after June 30)
    console.log('\n📅 5. Updating user_dates_abcd table...');
    const { data: currentAbcdDates, error: fetchAbcdError } = await supabase
      .from('user_dates_abcd')
      .select('dates')
      .eq('user_id', USER_ID)
      .single();
    
    if (fetchAbcdError && fetchAbcdError.code !== 'PGRST116') {
      console.log('❌ Error fetching user_dates_abcd:', fetchAbcdError.message);
    } else if (currentAbcdDates?.dates) {
      const originalAbcdDates = currentAbcdDates.dates;
      const filteredAbcdDates = originalAbcdDates.filter(date => date <= CUTOFF_DATE);
      const removedAbcdDates = originalAbcdDates.filter(date => date > CUTOFF_DATE);
      
      if (removedAbcdDates.length > 0) {
        const { error: updateAbcdError } = await supabase
          .from('user_dates_abcd')
          .update({ 
            dates: filteredAbcdDates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', USER_ID);
        
        if (updateAbcdError) {
          console.log('❌ Error updating user_dates_abcd:', updateAbcdError.message);
        } else {
          console.log(`✅ Removed ${removedAbcdDates.length} dates from user_dates_abcd:`);
          removedAbcdDates.forEach(date => {
            console.log(`   📅 Removed: ${date}`);
          });
          console.log(`📅 Remaining ABCD dates: ${filteredAbcdDates.length}`);
          totalDeleted += removedAbcdDates.length;
        }
      } else {
        console.log('✅ No dates to remove from user_dates_abcd (all dates are on or before June 30)');
      }
    } else {
      console.log('ℹ️ No user_dates_abcd found or dates array is empty');
    }

    // 6. Check for any other tables that might contain data after June 30
    console.log('\n🔍 6. Checking for any remaining data after June 30...');
    
    // Check if there are any remaining excel_data records
    const { data: remainingExcel, error: checkExcelError } = await supabase
      .from('excel_data')
      .select('date')
      .eq('user_id', USER_ID)
      .gt('date', CUTOFF_DATE);
    
    if (!checkExcelError && remainingExcel?.length > 0) {
      console.log(`⚠️ Found ${remainingExcel.length} remaining Excel records after ${CUTOFF_DATE}`);
    }

    // Check if there are any remaining hour_entries records
    const { data: remainingHour, error: checkHourError } = await supabase
      .from('hour_entries')
      .select('date_key')
      .eq('user_id', USER_ID)
      .gt('date_key', CUTOFF_DATE);
    
    if (!checkHourError && remainingHour?.length > 0) {
      console.log(`⚠️ Found ${remainingHour.length} remaining Hour entry records after ${CUTOFF_DATE}`);
    }

    // Summary
    console.log('\n🎉 CLEANUP SUMMARY:');
    console.log('==================');
    console.log(`👤 User: ${USER_ID}`);
    console.log(`📅 Cutoff Date: ${CUTOFF_DATE}`);
    console.log(`🗑️ Total Records Deleted: ${totalDeleted}`);
    console.log('');
    console.log('✅ Cleanup completed successfully!');
    console.log('');
    console.log('🔍 To verify the cleanup worked:');
    console.log('1. Run the browser date checker to see remaining dates');
    console.log('2. Check that no dates after June 30, 2025 appear');
    console.log('3. Test your application to ensure it works with the remaining data');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Ask for confirmation before proceeding
console.log('🚨 FINAL WARNING:');
console.log('This will permanently delete data from the database.');
console.log('Make sure you have a backup if you need to restore this data later.');
console.log('');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...');

// Add a 5-second delay for the user to cancel if needed
setTimeout(() => {
  deleteDataAfterJune30().catch(console.error);
}, 5000);
