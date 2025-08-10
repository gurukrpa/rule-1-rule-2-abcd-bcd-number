// Debug script to test database connection and check tables
import { createClient } from '@supabase/supabase-js';

// Load automation environment
const supabaseUrl = 'https://oqbusqbsmvwkwhggzvhl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjMxMjYsImV4cCI6MjA3MDI5OTEyNn0.kXRSa-AdjuSIzOonl98OQi6H2eTjZ4WjQ_5l_m1eVq4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDatabase() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count');
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Try to get all users
    console.log('\n2. Fetching all users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log('✅ Users fetched successfully:', users);
      console.log('📊 Total users found:', users.length);
    }
    
    // Test creating a user
    console.log('\n3. Testing user creation...');
    const testUser = {
      username: 'test_user_' + Date.now(),
      hr: 100,
      days: 30
    };
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([testUser])
      .select();
    
    if (createError) {
      console.error('❌ Error creating user:', createError);
    } else {
      console.log('✅ User created successfully:', newUser);
      
      // Clean up test user
      if (newUser && newUser[0]) {
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', newUser[0].id);
        
        if (deleteError) {
          console.error('⚠️ Could not delete test user:', deleteError);
        } else {
          console.log('🧹 Test user cleaned up');
        }
      }
    }
    
    // Check table structure
    console.log('\n4. Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_structure', { table_name: 'users' })
      .single();
    
    if (tableError) {
      console.log('ℹ️ Could not get table structure (this is normal):', tableError.message);
    } else {
      console.log('📋 Table structure:', tableInfo);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

debugDatabase().then(() => {
  console.log('\n🏁 Database debug complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug script failed:', error);
  process.exit(1);
});
