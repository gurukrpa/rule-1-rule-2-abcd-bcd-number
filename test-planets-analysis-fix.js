// 🧪 Test Script for PlanetsAnalysisPage Date Loading Fix
// Run this in the browser console to create test data and verify the fix

console.log('🧪 TESTING PLANETSANALYSISPAGE DATE LOADING FIX');
console.log('===============================================');

// Test User ID that will be created
const TEST_USER_ID = 'test-planets-user-123';
const TEST_DATES = ['2025-06-26', '2025-06-25', '2025-06-24'];

async function createTestDataForPlanets() {
  try {
    console.log('📝 Step 1: Creating test user...');
    
    // First, check if supabase is available (should be in React app context)
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase client not available. Make sure to run this in the browser console of the ABCD app.');
      return;
    }

    // Create test user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: TEST_USER_ID,
        username: 'PlanetsTestUser',
        hr: 12,
        name: 'Test User for Planets Analysis'
      }, { onConflict: 'id' });

    if (userError) {
      console.log('⚠️ User creation warning:', userError.message);
    } else {
      console.log('✅ Test user created/updated');
    }

    console.log('📅 Step 2: Creating user dates...');
    
    // Create user dates (this is what unifiedDataService.getDates() will fetch)
    const { data: datesData, error: datesError } = await supabase
      .from('user_dates')
      .upsert({
        user_id: TEST_USER_ID,
        dates: TEST_DATES
      }, { onConflict: 'user_id' });

    if (datesError) {
      console.error('❌ Error creating user dates:', datesError.message);
      return;
    } else {
      console.log('✅ User dates created:', TEST_DATES.length, 'dates');
    }

    console.log('📊 Step 3: Creating Excel data for testing...');
    
    // Create minimal Excel data for each date
    for (const date of TEST_DATES) {
      const testExcelData = {
        user_id: TEST_USER_ID,
        date: date,
        file_name: `test-planets-${date}.xlsx`,
        data: {
          sets: {
            'Test Set 1': {
              'Element 1': {
                'Su': 'ar-123/text',
                'Mo': 'ta-456/text',
                'Ma': 'ge-789/text'
              }
            }
          }
        }
      };

      const { error: excelError } = await supabase
        .from('excel_data')
        .upsert(testExcelData, { onConflict: 'user_id,date' });

      if (excelError) {
        console.log(`❌ Excel data error for ${date}:`, excelError.message);
      } else {
        console.log(`✅ Excel data created for ${date}`);
      }
    }

    console.log('⏰ Step 4: Creating Hour Entry data...');
    
    // Create hour entry data for each date
    for (const date of TEST_DATES) {
      const hourData = {
        user_id: TEST_USER_ID,
        date_key: date,
        hour_data: {
          planetSelections: {
            '1': 'Su',
            '2': 'Mo',
            '3': 'Ma'
          }
        }
      };

      const { error: hourError } = await supabase
        .from('hour_entries')
        .upsert(hourData, { onConflict: 'user_id,date_key' });

      if (hourError) {
        console.log(`❌ Hour data error for ${date}:`, hourError.message);
      } else {
        console.log(`✅ Hour data created for ${date}`);
      }
    }

    console.log('🎉 Step 5: Test data creation complete!');
    console.log('');
    console.log('🔧 NEXT STEPS TO TEST THE FIX:');
    console.log('1. Navigate to: http://localhost:5173/planets-analysis');
    console.log('2. Select "PlanetsTestUser" in the user dropdown');
    console.log('3. Verify that dates load without "Failed to load dates" error');
    console.log('4. Check that you see:', TEST_DATES.length, 'dates in the date dropdown');
    console.log('');
    console.log('📊 Expected behavior:');
    console.log('- No "Failed to load dates" error message');
    console.log('- User dropdown shows "PlanetsTestUser"');
    console.log('- Date dropdown shows 3 dates');
    console.log('- Console shows unifiedDataService.getDates() success messages');

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function testUnifiedDataService() {
  console.log('🔍 Testing unifiedDataService.getDates() directly...');
  
  try {
    // Test if unifiedDataService is available
    if (typeof window !== 'undefined' && window.unifiedDataService) {
      const dates = await window.unifiedDataService.getDates(TEST_USER_ID);
      console.log('✅ unifiedDataService.getDates() returned:', dates.length, 'dates');
      console.log('   Dates:', dates);
    } else {
      console.log('ℹ️ unifiedDataService not available in global scope (this is normal)');
    }
  } catch (error) {
    console.error('❌ Error testing unifiedDataService:', error);
  }
}

// Auto-run the test
(async () => {
  const success = await createTestDataForPlanets();
  if (success) {
    await testUnifiedDataService();
  }
})();
