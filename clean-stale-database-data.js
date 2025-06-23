// Clean stale database data that's causing auto-upload status
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function cleanStaleData() {
  console.log('🧹 CLEANING STALE DATABASE DATA');
  console.log('=================================\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`👥 Found ${users.length} users`);

    for (const user of users) {
      console.log(`\n🔍 Cleaning data for user: ${user.username} (${user.id})`);

      // 1. Check Excel data
      const { data: excelData, error: excelError } = await supabase
        .from('excel_data')
        .select('*')
        .eq('user_id', user.id);

      if (excelError) {
        console.log(`   ⚠️ Error checking Excel data: ${excelError.message}`);
      } else {
        console.log(`   📊 Excel entries found: ${excelData.length}`);
        excelData.forEach(entry => {
          console.log(`      - ${entry.date}: ${entry.file_name}`);
        });

        // DELETE ALL Excel data
        if (excelData.length > 0) {
          const { error: deleteExcelError } = await supabase
            .from('excel_data')
            .delete()
            .eq('user_id', user.id);

          if (deleteExcelError) {
            console.log(`   ❌ Error deleting Excel data: ${deleteExcelError.message}`);
          } else {
            console.log(`   ✅ Deleted ${excelData.length} Excel entries`);
          }
        }
      }

      // 2. Check Hour Entry data
      const { data: hourData, error: hourError } = await supabase
        .from('hour_entries')
        .select('*')
        .eq('user_id', user.id);

      if (hourError) {
        console.log(`   ⚠️ Error checking Hour entries: ${hourError.message}`);
      } else {
        console.log(`   ⏰ Hour entries found: ${hourData.length}`);
        hourData.forEach(entry => {
          const planetCount = Object.keys(entry.hour_data?.planetSelections || {}).length;
          console.log(`      - ${entry.date_key}: ${planetCount} planet selections`);
        });

        // DELETE ALL Hour Entry data
        if (hourData.length > 0) {
          const { error: deleteHourError } = await supabase
            .from('hour_entries')
            .delete()
            .eq('user_id', user.id);

          if (deleteHourError) {
            console.log(`   ❌ Error deleting Hour entries: ${deleteHourError.message}`);
          } else {
            console.log(`   ✅ Deleted ${hourData.length} Hour entries`);
          }
        }
      }

      // 3. Check user dates
      const { data: userDatesData, error: userDatesError } = await supabase
        .from('user_dates')
        .select('*')
        .eq('user_id', user.id);

      if (userDatesError) {
        console.log(`   ⚠️ Error checking user dates: ${userDatesError.message}`);
      } else {
        console.log(`   📅 User dates records found: ${userDatesData.length}`);
        userDatesData.forEach(entry => {
          console.log(`      - Dates array: ${entry.dates?.length || 0} dates: ${entry.dates?.join(', ') || 'none'}`);
        });

        // CLEAR user dates (but keep the record structure)
        if (userDatesData.length > 0) {
          const { error: updateUserDatesError } = await supabase
            .from('user_dates')
            .update({ dates: [] })
            .eq('user_id', user.id);

          if (updateUserDatesError) {
            console.log(`   ❌ Error clearing user dates: ${updateUserDatesError.message}`);
          } else {
            console.log(`   ✅ Cleared user dates array`);
          }
        }
      }
    }

    console.log('\n🎯 CLEANUP SUMMARY:');
    console.log('✅ All Excel data removed');
    console.log('✅ All Hour Entry data removed');
    console.log('✅ All user dates cleared');
    console.log('\n💡 NOW TEST THE FIX:');
    console.log('1. Refresh the ABCD page');
    console.log('2. Add a new date (like Jun 3, 2025)');
    console.log('3. It should show RED status (not uploaded)');
    console.log('4. Upload Excel and complete Hour Entry to test normal flow');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Also clean old localStorage data if running in browser
if (typeof window !== 'undefined' && window.localStorage) {
  console.log('\n🗄️ CLEANING BROWSER LOCALSTORAGE:');
  
  const keys = Object.keys(localStorage);
  const abcdKeys = keys.filter(key => 
    key.includes('abcd_') || 
    key.includes('excel') || 
    key.includes('hour') ||
    key.includes('user_dates') ||
    key.includes('status')
  );

  console.log(`Found ${abcdKeys.length} ABCD-related localStorage keys`);
  abcdKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Cleared: ${key}`);
  });
}

cleanStaleData().then(() => {
  console.log('\n✅ Database cleanup complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
