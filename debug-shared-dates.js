/**
 * Debug script to understand the ABCD/UserData date sharing issue
 * Run this in the browser console while application is loaded
 */

console.log('🔍 DEBUGGING DATE SHARING ISSUE');
console.log('================================\n');

// Check if we can access the Supabase client
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Supabase client found');
  
  // Get the current users to check their dates
  window.supabase
    .from('users')
    .select('id, username, hr')
    .then(({ data: users, error }) => {
      if (error) {
        console.error('❌ Error fetching users:', error);
        return;
      }
      
      console.log(`📊 Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`   - ${user.username} (ID: ${user.id})`);
      });
      
      // Check user_dates table for each user
      return Promise.all(users.map(async (user) => {
        const { data: userDates, error: datesError } = await window.supabase
          .from('user_dates')
          .select('*')
          .eq('user_id', user.id);
          
        console.log(`\n📅 Dates for ${user.username}:`);
        if (datesError) {
          console.error('   ❌ Error:', datesError);
        } else if (userDates && userDates.length > 0) {
          userDates.forEach(dateRecord => {
            console.log(`   - Record ID: ${dateRecord.id}`);
            console.log(`   - Dates array: [${dateRecord.dates?.join(', ') || 'none'}]`);
            console.log(`   - Updated: ${dateRecord.updated_at}`);
          });
        } else {
          console.log('   - No dates found');
        }
        
        return { user, userDates };
      }));
    })
    .then((results) => {
      console.log('\n📋 ANALYSIS:');
      console.log('=============');
      console.log('✅ Both UserData and ABCD pages use CleanSupabaseService');
      console.log('✅ CleanSupabaseService saves to user_dates table');
      console.log('✅ Both pages read from the SAME user_dates table');
      console.log('❌ This is why dates appear on both pages!');
      console.log('\n🔧 SOLUTION NEEDED:');
      console.log('   • Separate date storage for each page');
      console.log('   • Or add page context to distinguish date sources');
    })
    .catch(console.error);
} else {
  console.log('❌ Supabase client not found. Make sure app is loaded.');
  console.log('💡 Alternative: Check browser network tab for user_dates requests');
}

// Check if CleanSupabaseService is available
if (typeof window !== 'undefined' && window.cleanSupabaseService) {
  console.log('✅ CleanSupabaseService found in window');
} else {
  console.log('⚠️ CleanSupabaseService not found in window');
}

console.log('\n🔍 To verify the issue:');
console.log('1. Add a date on ABCD page');
console.log('2. Navigate to UserData page');
console.log('3. Check if the date appears there too');
console.log('4. This confirms they share the same database table');
