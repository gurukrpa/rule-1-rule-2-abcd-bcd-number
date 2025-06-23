// 🔬 Direct DataService Test
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pqxomdlxrhemtimxmhbw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxeG9tZGx4cmhlbXRpbXhtaGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwNDMzOTYsImV4cCI6MjA0NDYxOTM5Nn0.z_0Mec3VpKvOb_0rlAdJ7xGAMuKR1QJEXhJfkXfbdXM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDataServiceFixes() {
  console.log('🔬 TESTING DATASERVICE FIXES DIRECTLY');
  console.log('=====================================');

  const userId = '8db9861a-76ce-4ae3-81b0-7a8b82314ef2';
  const testDate = '2025-06-04';

  console.log(`Testing: User ${userId}, Date ${testDate}`);

  // Test Hour Entries with our fixed structure
  console.log('\n⏰ Testing Hour Entries (Fixed Structure):');
  try {
    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')  // Fixed table name
      .select('*')
      .eq('user_id', userId)
      .eq('date_key', testDate)
      .single();

    if (hourError) {
      console.log('❌ Hour data error:', hourError.message);
    } else {
      console.log('✅ Hour data retrieved');
      console.log('Raw hour data:', hourData);
      
      // Test our fixed column structure
      const planetSelections = hourData.hour_data?.planetSelections || {};
      console.log('Planet selections:', planetSelections);
      console.log('Planet selections count:', Object.keys(planetSelections).length);
      
      if (Object.keys(planetSelections).length > 0) {
        console.log('✅ DataService hour_data fix working!');
      } else {
        console.log('❌ No planet selections found');
      }
    }
  } catch (error) {
    console.log('❌ Hour test failed:', error.message);
  }

  // Test Excel Data
  console.log('\n📊 Testing Excel Data:');
  try {
    const { data: excelData, error: excelError } = await supabase
      .from('excel_data')
      .select('*')
      .eq('user_id', userId)
      .eq('date', testDate)
      .single();

    if (excelError) {
      console.log('❌ Excel data error:', excelError.message);
    } else {
      console.log('✅ Excel data retrieved');
      
      // Check data structure
      const directSets = excelData.data?.sets || {};
      console.log('Sets count:', Object.keys(directSets).length);
      console.log('Sample sets:', Object.keys(directSets).slice(0, 3));
      
      if (Object.keys(directSets).length > 0) {
        console.log('✅ Excel data structure correct!');
      } else {
        console.log('❌ No sets found in Excel data');
      }
    }
  } catch (error) {
    console.log('❌ Excel test failed:', error.message);
  }

  console.log('\n🎯 CONCLUSION:');
  console.log('If both tests pass, DataService fixes are working.');
  console.log('If tests fail, we need to investigate further.');
}

testDataServiceFixes().catch(console.error);
