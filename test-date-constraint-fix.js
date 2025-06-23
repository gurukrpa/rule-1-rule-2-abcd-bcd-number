// Test script to verify the database constraint fix
// This test ensures that adding dates no longer causes constraint violations

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NDUzOTYsImV4cCI6MjAzODUyMTM5Nn0.AcWQQXmBpqiIJUdCOOLHl-2FnCJM4w2UHrx8bYFZXSw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDateConstraintFix() {
  console.log('🧪 Testing date constraint fix...');
  
  const testUserId = '1';
  const testDate = '2025-06-23';
  
  try {
    // Step 1: Try to add a date (should create or update the record)
    console.log('📝 Step 1: Adding initial date...');
    const { data: data1, error: error1 } = await supabase
      .from('user_dates')
      .upsert({
        user_id: testUserId,
        dates: [testDate]
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error1) {
      console.error('❌ Error in Step 1:', error1);
      return;
    }
    console.log('✅ Step 1 Success:', data1);
    
    // Step 2: Try to add another date (should update existing record)
    console.log('📝 Step 2: Adding second date...');
    const { data: data2, error: error2 } = await supabase
      .from('user_dates')
      .upsert({
        user_id: testUserId,
        dates: [testDate, '2025-06-24']
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error2) {
      console.error('❌ Error in Step 2:', error2);
      return;
    }
    console.log('✅ Step 2 Success:', data2);
    
    // Step 3: Verify the data
    console.log('📝 Step 3: Verifying final data...');
    const { data: data3, error: error3 } = await supabase
      .from('user_dates')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    if (error3) {
      console.error('❌ Error in Step 3:', error3);
      return;
    }
    console.log('✅ Step 3 Success - Final data:', data3);
    
    console.log('🎉 All tests passed! Date constraint fix is working.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testDateConstraintFix();
