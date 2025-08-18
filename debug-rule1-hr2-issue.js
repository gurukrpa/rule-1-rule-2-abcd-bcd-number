// Debug Script: Rule-1 Page HR2 Number Box Click Issues
// This script diagnoses save/fetch issues for HR2 on Rule-1 page

console.log('🔍 Starting Rule-1 HR2 diagnostic...');

// Test configuration
const TEST_USER_ID = 'saaed1995@gmail.com'; // Replace with actual user ID
const TEST_TOPIC = 'Su'; // Replace with actual topic name  
const TEST_DATE = '2025-08-14'; // Replace with problematic date
const TEST_HOUR = 'HR2'; // Testing HR2 specifically
const TEST_NUMBER = 15; // Replace with test number

// Diagnostic functions
async function testDatabaseSaveAndFetch() {
  console.log('\n📝 Testing direct database save/fetch for HR2...');
  
  try {
    // Import services (adjust paths as needed)
    const { supabase } = await import('./src/supabaseClient.js');
    
    // 1. Save test click directly to database
    console.log('💾 Saving test click to database...');
    const saveResult = await supabase
      .from('topic_clicks')
      .upsert({
        user_id: TEST_USER_ID,
        topic_name: TEST_TOPIC,
        date_key: TEST_DATE,
        hour: TEST_HOUR,
        clicked_number: TEST_NUMBER,
        is_matched: false
      }, {
        onConflict: 'user_id,topic_name,date_key,hour,clicked_number'
      })
      .select();
    
    if (saveResult.error) {
      console.error('❌ Save failed:', saveResult.error);
      return false;
    }
    
    console.log('✅ Save successful:', saveResult.data[0]);
    
    // 2. Fetch back the saved data
    console.log('\n📥 Fetching saved data back...');
    const fetchResult = await supabase
      .from('topic_clicks')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .eq('topic_name', TEST_TOPIC)
      .eq('date_key', TEST_DATE)
      .eq('hour', TEST_HOUR);
    
    if (fetchResult.error) {
      console.error('❌ Fetch failed:', fetchResult.error);
      return false;
    }
    
    console.log('✅ Fetch successful:', fetchResult.data);
    console.log(`📊 Found ${fetchResult.data.length} records for ${TEST_TOPIC}/${TEST_DATE}/${TEST_HOUR}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

async function testServiceLayer() {
  console.log('\n🔧 Testing service layer save/fetch for HR2...');
  
  try {
    // Import services
    const cleanSupabaseService = (await import('./src/services/CleanSupabaseService.js')).default;
    const unifiedNumberBoxService = (await import('./src/services/UnifiedNumberBoxService.js')).default;
    
    // 1. Test UnifiedNumberBoxService click
    console.log('🎯 Testing UnifiedNumberBoxService click...');
    await unifiedNumberBoxService.clickNumber(TEST_USER_ID, TEST_TOPIC, TEST_DATE, TEST_HOUR, TEST_NUMBER);
    
    // 2. Test fetching clicked numbers
    console.log('📥 Testing getClickedNumbers...');
    const clickedNumbers = await unifiedNumberBoxService.getClickedNumbers(TEST_USER_ID, TEST_TOPIC, TEST_DATE, TEST_HOUR);
    console.log('📊 Clicked numbers:', clickedNumbers);
    
    // 3. Test CleanSupabaseService directly
    console.log('🗄️ Testing CleanSupabaseService.getTopicClicks...');
    const allClicks = await cleanSupabaseService.getTopicClicks(TEST_USER_ID, TEST_TOPIC, TEST_DATE);
    const hr2Clicks = allClicks.filter(click => click.hour === TEST_HOUR);
    console.log('📊 All topic clicks:', allClicks.length);
    console.log('📊 HR2 clicks:', hr2Clicks);
    
    return true;
    
  } catch (error) {
    console.error('❌ Service layer test failed:', error);
    return false;
  }
}

async function testCrossPageSync() {
  console.log('\n🔄 Testing cross-page sync for HR2...');
  
  try {
    // Import cross-page sync service
    const CrossPageSyncService = (await import('./src/services/crossPageSyncService.js')).default;
    const syncService = new CrossPageSyncService();
    
    // 1. Get all clicked numbers
    console.log('📊 Getting all clicked numbers...');
    const syncData = await syncService.getAllClickedNumbers(TEST_USER_ID);
    
    // 2. Check if HR2 data is present
    const targetData = syncData[TEST_DATE]?.[TEST_TOPIC];
    console.log(`📊 Data for ${TEST_DATE}/${TEST_TOPIC}:`, targetData);
    
    // 3. Test sync to PlanetsAnalysis for HR2
    console.log('🎯 Testing sync to PlanetsAnalysis for HR2...');
    const planetsData = syncService.syncToPlanetsAnalysis(syncData, TEST_DATE, 2);
    console.log('📊 PlanetsAnalysis sync result:', planetsData);
    
    return true;
    
  } catch (error) {
    console.error('❌ Cross-page sync test failed:', error);
    return false;
  }
}

async function generateComprehensiveReport() {
  console.log('\n📋 Generating comprehensive diagnostic report...');
  
  try {
    const { supabase } = await import('./src/supabaseClient.js');
    
    // 1. Check all HR2 records for the user
    const hr2Records = await supabase
      .from('topic_clicks')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .eq('hour', 'HR2')
      .order('created_at', { ascending: false });
    
    console.log(`📊 Total HR2 records found: ${hr2Records.data?.length || 0}`);
    
    if (hr2Records.data?.length > 0) {
      // Group by date and topic
      const groupedData = hr2Records.data.reduce((acc, record) => {
        const key = `${record.date_key}/${record.topic_name}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(record.clicked_number);
        return acc;
      }, {});
      
      console.log('📊 HR2 records grouped by date/topic:');
      Object.entries(groupedData).forEach(([key, numbers]) => {
        console.log(`  ${key}: [${numbers.join(', ')}]`);
      });
    }
    
    // 2. Check for hour format inconsistencies
    const allHours = await supabase
      .from('topic_clicks')
      .select('hour')
      .eq('user_id', TEST_USER_ID)
      .eq('date_key', TEST_DATE);
    
    const uniqueHours = [...new Set(allHours.data?.map(r => r.hour) || [])];
    console.log(`📊 Hour formats found for ${TEST_DATE}:`, uniqueHours);
    
    // 3. Check specific problematic date/topic
    const specificData = await supabase
      .from('topic_clicks')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .eq('topic_name', TEST_TOPIC)
      .eq('date_key', TEST_DATE)
      .order('hour', { ascending: true });
    
    console.log(`📊 All records for ${TEST_TOPIC}/${TEST_DATE}:`);
    specificData.data?.forEach(record => {
      console.log(`  ${record.hour}: [${record.clicked_number}] (${record.created_at})`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Report generation failed:', error);
    return false;
  }
}

// Main diagnostic function
async function runDiagnostic() {
  console.log('🚀 Starting comprehensive Rule-1 HR2 diagnostic...');
  console.log('📋 Test Configuration:', {
    userId: TEST_USER_ID,
    topic: TEST_TOPIC,
    date: TEST_DATE,
    hour: TEST_HOUR,
    testNumber: TEST_NUMBER
  });
  
  const results = {
    database: false,
    serviceLayer: false,
    crossPageSync: false,
    report: false
  };
  
  // Run all tests
  results.database = await testDatabaseSaveAndFetch();
  results.serviceLayer = await testServiceLayer();
  results.crossPageSync = await testCrossPageSync();
  results.report = await generateComprehensiveReport();
  
  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'ISSUES DETECTED'}`);
  
  if (!allPassed) {
    console.log('\n🔧 TROUBLESHOOTING RECOMMENDATIONS:');
    if (!results.database) console.log('- Check database connection and table schema');
    if (!results.serviceLayer) console.log('- Check service method implementations and hour format handling');
    if (!results.crossPageSync) console.log('- Check cross-page sync field mapping and hour comparison logic');
    if (!results.report) console.log('- Check database permissions and query syntax');
  }
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  window.debugRule1HR2 = {
    runDiagnostic,
    testDatabaseSaveAndFetch,
    testServiceLayer,
    testCrossPageSync,
    generateComprehensiveReport
  };
  
  console.log('🔧 Debug functions available:');
  console.log('- window.debugRule1HR2.runDiagnostic() - Run full diagnostic');
  console.log('- window.debugRule1HR2.testDatabaseSaveAndFetch() - Test direct DB operations');
  console.log('- window.debugRule1HR2.testServiceLayer() - Test service layer');
  console.log('- window.debugRule1HR2.testCrossPageSync() - Test cross-page sync');
  console.log('- window.debugRule1HR2.generateComprehensiveReport() - Generate report');
} else {
  // Node.js environment
  runDiagnostic().catch(console.error);
}
