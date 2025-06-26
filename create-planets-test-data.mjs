import { createClient } from '@supabase/supabase-js';

// Use the correct Supabase configuration from .env
const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const TEST_USER_ID = 'planets-test-user-2025';
const TEST_DATES = ['2025-06-26', '2025-06-25', '2025-06-24'];

console.log('🧪 CREATING TEST DATA FOR PLANETS ANALYSIS PAGE');
console.log('===============================================');

async function createPlanetsTestData() {
  try {
    // 1. Create test user
    console.log('👤 Creating test user...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: TEST_USER_ID,
        username: 'PlanetsTestUser',
        hr: 12,
        name: 'Test User for Planets Analysis Page'
      }, { onConflict: 'id' });

    if (userError) {
      console.log('⚠️ User creation warning:', userError.message);
    } else {
      console.log('✅ Test user created successfully');
    }

    // 2. Create user dates (PRIMARY SERVICE DATA)
    console.log('📅 Creating user dates for primary service...');
    const { data: datesData, error: datesError } = await supabase
      .from('user_dates')
      .upsert({
        user_id: TEST_USER_ID,
        dates: TEST_DATES,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (datesError) {
      console.error('❌ Error creating user dates:', datesError.message);
      return false;
    } else {
      console.log(`✅ User dates created: ${TEST_DATES.length} dates for primary service`);
    }

    // 3. Create Excel data (FALLBACK SERVICE DATA)
    console.log('📊 Creating Excel data for fallback service...');
    for (const date of TEST_DATES) {
      const excelData = {
        user_id: TEST_USER_ID,
        date: date,
        file_name: `planets-test-${date}.xlsx`,
        data: {
          sets: {
            'Test Set-1': {
              'Element A': {
                'Su': 'ar-100/sample',
                'Mo': 'ta-200/sample',
                'Ma': 'ge-300/sample'
              },
              'Element B': {
                'Su': 'ar-400/sample',
                'Mo': 'ta-500/sample',
                'Ma': 'ge-600/sample'
              }
            }
          }
        },
        uploaded_at: new Date().toISOString()
      };

      const { error: excelError } = await supabase
        .from('excel_data')
        .upsert(excelData, { onConflict: 'user_id,date' });

      if (excelError) {
        console.log(`❌ Excel data error for ${date}:`, excelError.message);
      } else {
        console.log(`✅ Excel data created for ${date}`);
      }
    }

    // 4. Create Hour Entry data
    console.log('⏰ Creating Hour Entry data...');
    for (const date of TEST_DATES) {
      const hourData = {
        user_id: TEST_USER_ID,
        date_key: date,
        hour_data: {
          planetSelections: {
            '1': 'Su',
            '2': 'Mo',
            '3': 'Ma',
            '4': 'Me',
            '5': 'Ju'
          },
          date: date,
          userId: TEST_USER_ID,
          savedAt: new Date().toISOString()
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

    // 5. Verify the data
    console.log('🔍 Verifying test data...');
    
    // Test primary service path
    const { data: verifyUserDates } = await supabase
      .from('user_dates')
      .select('dates')
      .eq('user_id', TEST_USER_ID)
      .single();
    
    console.log(`✅ Primary service verification: ${verifyUserDates?.dates?.length || 0} dates`);

    // Test fallback service path
    const { data: verifyExcel } = await supabase
      .from('excel_data')
      .select('date')
      .eq('user_id', TEST_USER_ID);
    
    console.log(`✅ Fallback service verification: ${verifyExcel?.length || 0} Excel records`);

    console.log('🎉 TEST DATA CREATION COMPLETE!');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('1. Open: http://localhost:5173/planets-analysis');
    console.log('2. Select "PlanetsTestUser" from user dropdown');
    console.log('3. Verify dates load without "Failed to load dates" error');
    console.log('4. Check browser console for unifiedDataService success messages');
    console.log('');
    console.log('Expected Results:');
    console.log(`✅ User dropdown shows "PlanetsTestUser"`);
    console.log(`✅ Date dropdown shows ${TEST_DATES.length} dates`);
    console.log(`✅ No "Failed to load dates" error message`);
    console.log(`✅ Console shows successful getDates() calls`);

    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the test data creation
createPlanetsTestData();
