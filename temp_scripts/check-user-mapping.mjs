import { createClient } from '@supabase/supabase-js';

// Supabase credentials (read-only check)
const supabaseUrl = 'https://mntnxgryscfhduukveho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udG54Z3J5c2NmaGR1dWt2ZWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NDE1NTQsImV4cCI6MjA0OTQxNzU1NH0.tCaV8XZs6g3CtjVnkA50kNtEy-K6KxZp_k_lPaKjejY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 INVESTIGATING USER ID MAPPING ISSUE');
console.log('=====================================');

try {
  // 1. Check users table to see what users exist
  console.log('1️⃣ Checking users table...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*');
  
  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
  } else {
    console.log('👥 Found users:');
    users.forEach(user => {
      console.log(`   - ID: ${user.id} | Username: "${user.username}" | Email: ${user.email}`);
    });
  }

  // 2. Check number_box_clicks to see what user_id is actually stored
  console.log('\n2️⃣ Checking number_box_clicks table...');
  const { data: clicks, error: clicksError } = await supabase
    .from('number_box_clicks')
    .select('user_id, set_name, date_key, number_value, hr_number, is_clicked')
    .limit(10);
  
  if (clicksError) {
    console.error('❌ Error fetching clicks:', clicksError);
  } else {
    console.log('🎯 Found number box clicks:');
    clicks.forEach(click => {
      console.log(`   - User: ${click.user_id} | Set: ${click.set_name} | Date: ${click.date_key} | Number: ${click.number_value} | HR: ${click.hr_number} | Clicked: ${click.is_clicked}`);
    });
  }

  // 3. Check if there's a user with UUID 5019aa9a-a653-49f5-b7da-f5bc9dcde985
  console.log('\n3️⃣ Checking specific UUID user...');
  const { data: uuidUser, error: uuidError } = await supabase
    .from('users')
    .select('*')
    .eq('id', '5019aa9a-a653-49f5-b7da-f5bc9dcde985');
  
  if (uuidError) {
    console.error('❌ Error fetching UUID user:', uuidError);
  } else if (uuidUser.length > 0) {
    console.log('🎯 Found UUID user:');
    uuidUser.forEach(user => {
      console.log(`   - ID: ${user.id} | Username: "${user.username}" | Email: ${user.email}`);
    });
  } else {
    console.log('❌ No user found with UUID 5019aa9a-a653-49f5-b7da-f5bc9dcde985');
  }

  // 4. Check if there's a user with username "sing maya"
  console.log('\n4️⃣ Checking for "sing maya" username...');
  const { data: mayaUser, error: mayaError } = await supabase
    .from('users')
    .select('*')
    .ilike('username', '%sing maya%');
  
  if (mayaError) {
    console.error('❌ Error fetching maya user:', mayaError);
  } else if (mayaUser.length > 0) {
    console.log('🎯 Found "sing maya" user:');
    mayaUser.forEach(user => {
      console.log(`   - ID: ${user.id} | Username: "${user.username}" | Email: ${user.email}`);
    });
  } else {
    console.log('❌ No user found with username containing "sing maya"');
  }

} catch (error) {
  console.error('💥 Script error:', error);
}

