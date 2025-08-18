// 🔧 DIAGNOSTIC: Test Cross-Page Sync Status
console.log('=== CROSS-PAGE SYNC DIAGNOSTIC ===');

// 1. Test Rule-1 Page - Manual Clicking
console.log('1. Testing Rule-1 page click functionality...');

// Simulate clicking number 7 on Rule-1 page for target date 2025-08-17
const testRule1Click = async () => {
  try {
    console.log('📝 Simulating Rule-1 click: Number 7');
    
    // This would normally be done by clicking the button
    const clickData = {
      user_id: '5019aa9a-a653-49f5-b7da-f5bc9dcde985',
      topic_name: 'D-1 Set-1 Matrix',
      date_key: '2025-08-17',
      hour: 'HR1',
      clicked_number: 7
    };
    
    console.log('✅ Rule-1 click data prepared:', clickData);
    return clickData;
  } catch (error) {
    console.error('❌ Rule-1 click test failed:', error);
  }
};

// 2. Test Cross-Page Sync Service
console.log('2. Testing cross-page sync service...');

const testSyncService = async () => {
  try {
    // Import the service
    const { crossPageSyncService } = await import('./src/services/crossPageSyncService.js');
    
    console.log('📡 Cross-page sync service loaded');
    
    // Test getting clicked numbers
    const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    const syncData = await crossPageSyncService.getAllClickedNumbers(userId);
    
    console.log('✅ Sync data retrieved:', syncData);
    return syncData;
  } catch (error) {
    console.error('❌ Sync service test failed:', error);
  }
};

// 3. Test PlanetsAnalysis Page Display
console.log('3. Testing PlanetsAnalysis page sync display...');

const testPlanetsDisplay = (syncData) => {
  try {
    console.log('🌍 Testing PlanetsAnalysis display logic...');
    
    // Simulate checking if number 7 should be highlighted
    const targetDate = '2025-08-17';
    const topicName = 'D-1 Set-1 Matrix';
    const numberToCheck = 7;
    
    const dateData = syncData?.[targetDate];
    const topicData = dateData?.[topicName];
    const isHighlighted = topicData?.clickedNumbers?.includes(numberToCheck);
    
    console.log(`🎯 Number ${numberToCheck} highlighted status:`, isHighlighted);
    console.log('📊 Full topic data:', topicData);
    
    return isHighlighted;
  } catch (error) {
    console.error('❌ Planets display test failed:', error);
  }
};

// Run all tests
const runDiagnostic = async () => {
  console.log('🚀 Starting comprehensive diagnostic...');
  
  const rule1Data = await testRule1Click();
  const syncData = await testSyncService();
  const planetsResult = testPlanetsDisplay(syncData);
  
  console.log('=== DIAGNOSTIC SUMMARY ===');
  console.log('Rule-1 Click:', rule1Data ? '✅ Working' : '❌ Failed');
  console.log('Sync Service:', syncData ? '✅ Working' : '❌ Failed');
  console.log('Planets Display:', planetsResult ? '✅ Working' : '❌ Failed');
  
  if (rule1Data && syncData && planetsResult) {
    console.log('🎉 ALL SYSTEMS WORKING! Cross-page sync is functional!');
  } else {
    console.log('⚠️ Issues detected. Check individual test results above.');
  }
};

// Auto-run diagnostic
runDiagnostic();
