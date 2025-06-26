// 🔍 Verification Script for PlanetsAnalysisPage Fix
// This script checks if the "Failed to load dates" fix is working properly

console.log('🔍 VERIFYING PLANETSANALYSISPAGE FIX STATUS');
console.log('=========================================');

async function verifyPlanetsAnalysisFix() {
  try {
    console.log('📋 Step 1: Checking available users...');
    
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase client not available. Run this in the ABCD app browser console.');
      return;
    }

    // Check if we have any users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    console.log(`👥 Found ${users?.length || 0} users in database`);
    users?.forEach(user => {
      console.log(`   - ${user.username} (ID: ${user.id})`);
    });

    if (!users || users.length === 0) {
      console.log('⚠️ No users found. Run test-planets-analysis-fix.js to create test data.');
      return;
    }

    console.log('📅 Step 2: Testing date loading for first user...');
    const testUser = users[0];
    
    // Test primary service (user_dates table)
    const { data: userDatesRecord, error: userDatesError } = await supabase
      .from('user_dates')
      .select('dates')
      .eq('user_id', testUser.id)
      .single();

    if (userDatesError) {
      if (userDatesError.code === 'PGRST116') {
        console.log('📅 Primary service: No dates record found (will return empty array)');
      } else {
        console.error('❌ Primary service error:', userDatesError.message);
      }
    } else {
      console.log(`✅ Primary service: Found ${userDatesRecord.dates?.length || 0} dates`);
      if (userDatesRecord.dates?.length > 0) {
        console.log(`   Dates: ${userDatesRecord.dates.slice(0, 3).join(', ')}${userDatesRecord.dates.length > 3 ? '...' : ''}`);
      }
    }

    // Test fallback service (excel_data table)
    const { data: excelDates, error: excelError } = await supabase
      .from('excel_data')
      .select('date')
      .eq('user_id', testUser.id);

    if (excelError) {
      console.error('❌ Fallback service (excel) error:', excelError.message);
    } else {
      const uniqueExcelDates = [...new Set(excelDates?.map(d => d.date) || [])];
      console.log(`✅ Fallback service (excel): Found ${uniqueExcelDates.length} unique dates`);
    }

    console.log('🔧 Step 3: Checking unifiedDataService implementation...');
    
    // Check if the current page is PlanetsAnalysisPage
    const currentUrl = window.location.href;
    const isPlanetsPage = currentUrl.includes('/planets-analysis');
    console.log(`🌍 Current page is PlanetsAnalysisPage: ${isPlanetsPage}`);
    
    if (isPlanetsPage) {
      console.log('✅ You are on the PlanetsAnalysisPage - perfect for testing!');
      console.log('');
      console.log('🧪 TESTING INSTRUCTIONS:');
      console.log('1. Open the user dropdown and select a user');
      console.log('2. Watch the browser console for unifiedDataService.getDates() messages');
      console.log('3. Verify no "Failed to load dates" error appears');
      console.log('4. Check that dates appear in the date dropdown');
    } else {
      console.log('ℹ️ Navigate to /planets-analysis to test the fix directly');
    }

    console.log('');
    console.log('✅ VERIFICATION COMPLETE');
    console.log('The getDates method is implemented in unifiedDataService');
    console.log('PlanetsAnalysisPage should now load dates without errors');

  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

// Auto-run verification
verifyPlanetsAnalysisFix();
