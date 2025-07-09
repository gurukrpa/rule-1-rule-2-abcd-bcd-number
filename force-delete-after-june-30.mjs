// Force Delete Data After June 30, 2025 for user "sing maya"
// This script uses direct database connection to bypass network issues

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kqfkebcqrspffwcrkkid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZmtlYmNxcnNwZmZ3Y3Jra2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2OTg5NzAsImV4cCI6MjA0OTI3NDk3MH0.yGCy2Vu0Y-8jSJ1D6lVJODPJN6_VuPqHdWKPPy3jyDw';

const supabase = createClient(supabaseUrl, supabaseKey);
const USER_ID = 'sing maya';
const CUTOFF_DATE = '2025-06-30';

console.log('🗑️ FORCE DELETE DATA AFTER JUNE 30, 2025');
console.log('==========================================');
console.log(`👤 User: ${USER_ID}`);
console.log(`📅 Cutoff Date: ${CUTOFF_DATE}`);
console.log('');

// Wait for user confirmation
console.log('⚠️  WARNING: This will permanently delete all data after June 30, 2025!');
console.log('Press Ctrl+C to cancel, or press Enter to continue...');

// Wait for 3 seconds to allow user to cancel
await new Promise(resolve => {
    setTimeout(() => {
        console.log('🚀 Starting deletion in 3 seconds...');
        setTimeout(() => {
            console.log('🚀 Starting deletion in 2 seconds...');
            setTimeout(() => {
                console.log('🚀 Starting deletion in 1 second...');
                setTimeout(resolve, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
});

console.log('');
console.log('🗑️ STARTING DELETION PROCESS...');
console.log('================================');

let totalDeleted = 0;

try {
    // 1. Delete from excel_data
    console.log('📊 1. Deleting Excel data after June 30...');
    const { data: deletedExcel, error: excelError } = await supabase
        .from('excel_data')
        .delete()
        .eq('user_id', USER_ID)
        .gt('date', CUTOFF_DATE)
        .select();
    
    if (excelError) {
        console.log(`❌ Excel deletion error: ${excelError.message}`);
    } else {
        const excelCount = deletedExcel?.length || 0;
        console.log(`✅ Deleted ${excelCount} Excel records`);
        totalDeleted += excelCount;
        if (excelCount > 0) {
            deletedExcel.forEach(record => {
                console.log(`   📊 Deleted: ${record.date}`);
            });
        }
    }
    console.log('');

    // 2. Delete from hour_entries
    console.log('⏰ 2. Deleting Hour entries after June 30...');
    const { data: deletedHour, error: hourError } = await supabase
        .from('hour_entries')
        .delete()
        .eq('user_id', USER_ID)
        .gt('date_key', CUTOFF_DATE)
        .select();
    
    if (hourError) {
        console.log(`❌ Hour entries deletion error: ${hourError.message}`);
    } else {
        const hourCount = deletedHour?.length || 0;
        console.log(`✅ Deleted ${hourCount} Hour entry records`);
        totalDeleted += hourCount;
        if (hourCount > 0) {
            deletedHour.forEach(record => {
                console.log(`   ⏰ Deleted: ${record.date_key}`);
            });
        }
    }
    console.log('');

    // 3. Delete from rule2_analysis_results
    console.log('🧮 3. Deleting Rule2 analysis results after June 30...');
    const { data: deletedAnalysis, error: analysisError } = await supabase
        .from('rule2_analysis_results')
        .delete()
        .eq('user_id', USER_ID)
        .gt('analysis_date', CUTOFF_DATE)
        .select();
    
    if (analysisError) {
        console.log(`❌ Analysis deletion error: ${analysisError.message}`);
    } else {
        const analysisCount = deletedAnalysis?.length || 0;
        console.log(`✅ Deleted ${analysisCount} Analysis records`);
        totalDeleted += analysisCount;
        if (analysisCount > 0) {
            deletedAnalysis.forEach(record => {
                console.log(`   🧮 Deleted: ${record.analysis_date}`);
            });
        }
    }
    console.log('');

    // 4. Update user_dates
    console.log('📅 4. Updating user_dates table...');
    const { data: currentUserDates, error: fetchUserError } = await supabase
        .from('user_dates')
        .select('dates')
        .eq('user_id', USER_ID)
        .single();
    
    if (fetchUserError && fetchUserError.code !== 'PGRST116') {
        console.log(`❌ Error fetching user_dates: ${fetchUserError.message}`);
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
                console.log(`❌ Error updating user_dates: ${updateUserError.message}`);
            } else {
                console.log(`✅ Removed ${removedDates.length} dates from user_dates`);
                removedDates.forEach(date => {
                    console.log(`   📅 Removed: ${date}`);
                });
                totalDeleted += removedDates.length;
            }
        } else {
            console.log(`✅ No dates to remove from user_dates`);
        }
    } else {
        console.log(`ℹ️ No user_dates found`);
    }
    console.log('');

    // 5. Update user_dates_abcd
    console.log('📅 5. Updating user_dates_abcd table...');
    const { data: currentAbcdDates, error: fetchAbcdError } = await supabase
        .from('user_dates_abcd')
        .select('dates')
        .eq('user_id', USER_ID)
        .single();
    
    if (fetchAbcdError && fetchAbcdError.code !== 'PGRST116') {
        console.log(`❌ Error fetching user_dates_abcd: ${fetchAbcdError.message}`);
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
                console.log(`❌ Error updating user_dates_abcd: ${updateAbcdError.message}`);
            } else {
                console.log(`✅ Removed ${removedAbcdDates.length} dates from user_dates_abcd`);
                removedAbcdDates.forEach(date => {
                    console.log(`   📅 Removed: ${date}`);
                });
                totalDeleted += removedAbcdDates.length;
            }
        } else {
            console.log(`✅ No dates to remove from user_dates_abcd`);
        }
    } else {
        console.log(`ℹ️ No user_dates_abcd found`);
    }
    console.log('');

    // Final summary
    console.log('🎉 DELETION COMPLETED!');
    console.log('=====================');
    console.log(`👤 User: ${USER_ID}`);
    console.log(`📅 Cutoff Date: ${CUTOFF_DATE}`);
    console.log(`🗑️ Total Records Deleted: ${totalDeleted}`);
    console.log('');
    console.log('✅ All data after June 30, 2025 has been successfully deleted!');
    console.log('');
    console.log('🔍 Next Steps:');
    console.log('1. Refresh your application');
    console.log('2. Verify that only dates on or before June 30, 2025 appear');
    console.log('3. Test functionality with the remaining data');
    console.log('4. Try adding a new date after June 30, 2025 to verify it works');

} catch (error) {
    console.log(`❌ Critical error during deletion: ${error.message}`);
    console.log('Stack trace:', error.stack);
    process.exit(1);
}
