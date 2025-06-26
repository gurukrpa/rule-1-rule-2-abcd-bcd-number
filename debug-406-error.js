// Debug the 406 error in PlanetsAnalysisPage
// This script will help us understand what's causing the HTTP 406 response

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzU2NDMsImV4cCI6MjA1MDU1MTY0M30.tYHEJqX_-J7CKMJXIlGKTKJ5bVMRcm1n6kPh-I_BJ50';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug406Error() {
  console.log('🔍 DEBUGGING 406 ERROR FROM PLANETSANALYSISPAGE');
  console.log('================================================');
  
  const userId = '8db9861a-76ce-4ae3-81b0-7a8b82314ef2';
  const date = '2025-06-06';
  
  console.log('User ID:', userId);
  console.log('Date:', date);
  console.log('Supabase URL:', supabaseUrl);
  console.log('');
  
  try {
    // Test 1: Basic connection test
    console.log('🧪 Test 1: Basic Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(0);
    
    if (testError) {
      console.log('❌ Basic connection failed:', testError);
      return;
    } else {
      console.log('✅ Basic connection successful');
    }
    
    // Test 2: Check if the user exists
    console.log('\n🧪 Test 2: Check if user exists...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    
    if (userError) {
      console.log('❌ User query failed:', userError);
    } else {
      console.log('✅ User query successful, found:', userData.length, 'users');
      if (userData.length > 0) {
        console.log('   User details:', userData[0]);
      }
    }
    
    // Test 3: Check hour_entries table structure
    console.log('\n🧪 Test 3: Check hour_entries table...');
    const { data: hourStructure, error: hourStructureError } = await supabase
      .from('hour_entries')
      .select('*')
      .limit(1);
    
    if (hourStructureError) {
      console.log('❌ Hour entries structure check failed:', hourStructureError);
    } else {
      console.log('✅ Hour entries table accessible, sample count:', hourStructure.length);
      if (hourStructure.length > 0) {
        console.log('   Sample structure:', Object.keys(hourStructure[0]));
      }
    }
    
    // Test 4: Simulate the exact query from CleanSupabaseService
    console.log('\n🧪 Test 4: Simulate exact CleanSupabaseService query...');
    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date_key', date)
      .single();
    
    if (hourError) {
      console.log('❌ CleanSupabaseService query failed:', hourError);
      console.log('   Error code:', hourError.code);
      console.log('   Error message:', hourError.message);
      console.log('   Error details:', hourError.details);
      console.log('   Error hint:', hourError.hint);
    } else {
      console.log('✅ CleanSupabaseService query successful:', hourData);
    }
    
    // Test 5: Check what hour entries exist for this user
    console.log('\n🧪 Test 5: List all hour entries for this user...');
    const { data: allHourData, error: allHourError } = await supabase
      .from('hour_entries')
      .select('*')
      .eq('user_id', userId);
    
    if (allHourError) {
      console.log('❌ All hour entries query failed:', allHourError);
    } else {
      console.log('✅ Found hour entries for user:', allHourData.length);
      allHourData.forEach(entry => {
        console.log(`   - Date: ${entry.date_key}, Planet selections: ${Object.keys(entry.hour_data?.planetSelections || {}).length}`);
      });
    }
    
    // Test 6: Test DataService fallback table name
    console.log('\n🧪 Test 6: Check if hour_entry table exists (DataService fallback)...');
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('hour_entry')  // Note: singular, not plural
      .select('*')
      .eq('user_id', userId)
      .eq('date_key', date);
    
    if (fallbackError) {
      console.log('❌ Fallback table query failed:', fallbackError.message);
    } else {
      console.log('✅ Fallback table query successful, found:', fallbackData.length);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error during debugging:', error);
  }
}

debug406Error().catch(console.error);
