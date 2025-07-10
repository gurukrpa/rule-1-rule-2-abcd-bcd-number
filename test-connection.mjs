import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

console.log('🔍 Testing Supabase connection...');

try {
  const { data, error } = await supabase.from('users').select('*').limit(3);
  
  if (error) {
    console.error('❌ Supabase connection failed:', error);
  } else {
    console.log('✅ Supabase connection successful!');
    console.log(`📊 Found ${data.length} users (showing first 3):`);
    data.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username || user.email || user.id} (HR: ${user.hr || user.hr_count || 'N/A'})`);
    });
  }
} catch (err) {
  console.error('❌ Connection test failed:', err.message);
}
