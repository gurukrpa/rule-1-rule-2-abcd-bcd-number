// Test lottery sync with your actual database configuration
import { createClient } from '@supabase/supabase-js';

// Use your actual environment configuration
const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLotteryColumns() {
  console.log('🎰 Testing Lottery Sync with Correct Database');
  console.log('Database URL:', supabaseUrl);
  console.log('=====================================\n');

  try {
    // 1. Test connection and check users
    console.log('1. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, lottery_enabled, lottery_country, lottery_game_code')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`✅ Found ${users.length} users`);
    if (users.length > 0) {
      console.log('📊 User data sample:');
      users.forEach(user => {
        console.log(`  - ${user.username}: lottery_enabled=${user.lottery_enabled}, game=${user.lottery_game_code}`);
      });
    }

    // 2. Check if lottery columns exist
    console.log('\n2. Verifying lottery columns exist...');
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' });
    
    if (columnError) {
      console.log('ℹ️ Cannot check columns via RPC (this is normal)');
    } else {
      console.log('✅ Columns retrieved:', columns);
    }

    // 3. Test creating a lottery-enabled user
    console.log('\n3. Testing lottery user creation...');
    const testUser = {
      username: `lottery_test_${Date.now()}`,
      lottery_enabled: true,
      lottery_country: 'Singapore',
      lottery_game_code: 'sg_toto'
    };

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating lottery user:', createError);
    } else {
      console.log('✅ Lottery user created successfully:');
      console.log('  ID:', newUser.id);
      console.log('  Username:', newUser.username);
      console.log('  Lottery enabled:', newUser.lottery_enabled);
      console.log('  Country:', newUser.lottery_country);
      console.log('  Game code:', newUser.lottery_game_code);

      // Clean up test user
      await supabase.from('users').delete().eq('id', newUser.id);
      console.log('🧹 Test user cleaned up');
    }

    console.log('\n✅ Lottery database test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to UserList page in your browser');
    console.log('2. Configure a user for lottery sync');
    console.log('3. Go to ABCD page and test the sync button');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testLotteryColumns();
