// CRITICAL ISSUE DIAGNOSTIC: Number Box Clicks Not Saving to Database
// Run this in your browser console while on the Rule-1 page to trace the save flow

console.log('🔥 CRITICAL DIAGNOSTIC: Tracing why number box clicks are not saving to database');

// 1. Check what user ID is being used in the application
function checkCurrentUser() {
  console.log('\n👤 CHECKING CURRENT USER:');
  
  // Check various places where user ID might be stored
  const sources = [
    { name: 'URL params', value: new URLSearchParams(window.location.search).get('userId') || window.location.pathname.split('/').pop() },
    { name: 'localStorage.user', value: localStorage.getItem('user') },
    { name: 'localStorage.userId', value: localStorage.getItem('userId') },
    { name: 'localStorage.selectedUser', value: localStorage.getItem('selectedUser') },
    { name: 'sessionStorage.user', value: sessionStorage.getItem('user') },
    { name: 'sessionStorage.userId', value: sessionStorage.getItem('userId') },
    { name: 'window.selectedUser', value: window.selectedUser },
    { name: 'React props/state', value: 'Check component props in React DevTools' }
  ];
  
  sources.forEach(source => {
    console.log(`  ${source.name}: ${source.value || 'NOT FOUND'}`);
  });
  
  return sources.find(s => s.value)?.value;
}

// 2. Test if UnifiedNumberBoxService is working
async function testUnifiedNumberBoxService() {
  console.log('\n🔧 TESTING UnifiedNumberBoxService:');
  
  if (typeof window.unifiedNumberBoxService === 'undefined') {
    console.log('❌ UnifiedNumberBoxService not available in global scope');
    console.log('   This might be the root cause - service not accessible');
    return false;
  }
  
  console.log('✅ UnifiedNumberBoxService found');
  
  // Test the service methods
  try {
    const testUserId = checkCurrentUser() || 'test_user';
    const testTopic = 'Su';
    const testDate = '2025-08-14';
    const testHour = 'HR2';
    const testNumber = 999;
    
    console.log(`📝 Testing click with: ${testUserId}/${testTopic}/${testDate}/${testHour}/${testNumber}`);
    
    // Test click
    await window.unifiedNumberBoxService.clickNumber(testUserId, testTopic, testDate, testHour, testNumber);
    console.log('✅ Click method executed (check console for detailed logs)');
    
    // Test fetch
    const numbers = await window.unifiedNumberBoxService.getClickedNumbers(testUserId, testTopic, testDate, testHour);
    console.log('📊 Fetched numbers:', numbers);
    
    return true;
  } catch (error) {
    console.error('❌ UnifiedNumberBoxService test failed:', error);
    return false;
  }
}

// 3. Test direct database access
async function testDirectDatabaseAccess() {
  console.log('\n🗄️ TESTING DIRECT DATABASE ACCESS:');
  
  if (typeof window.supabase === 'undefined') {
    console.log('❌ Supabase not available in global scope');
    return false;
  }
  
  console.log('✅ Supabase found');
  
  try {
    const testUserId = checkCurrentUser() || 'diagnostic_test_user';
    
    // Test insert
    console.log('💾 Testing direct database insert...');
    const insertResult = await window.supabase
      .from('topic_clicks')
      .insert({
        user_id: testUserId,
        topic_name: 'DIAGNOSTIC_TEST',
        date_key: '2025-08-18',
        hour: 'HR2',
        clicked_number: 888,
        is_matched: false
      })
      .select();
    
    if (insertResult.error) {
      console.error('❌ Direct insert failed:', insertResult.error);
      return false;
    }
    
    console.log('✅ Direct insert successful:', insertResult.data[0]);
    
    // Test fetch
    console.log('📥 Testing direct database fetch...');
    const fetchResult = await window.supabase
      .from('topic_clicks')
      .select('*')
      .eq('user_id', testUserId)
      .eq('topic_name', 'DIAGNOSTIC_TEST');
    
    console.log('📊 Fetched test records:', fetchResult.data);
    
    // Clean up
    await window.supabase
      .from('topic_clicks')
      .delete()
      .eq('user_id', testUserId)
      .eq('topic_name', 'DIAGNOSTIC_TEST');
    
    console.log('🧹 Test records cleaned up');
    return true;
    
  } catch (error) {
    console.error('❌ Direct database test failed:', error);
    return false;
  }
}

// 4. Monitor actual click events
function monitorClickEvents() {
  console.log('\n👆 MONITORING CLICK EVENTS:');
  console.log('   Click on number boxes in the UI and watch for logs...');
  
  // Override console.log to catch our debug messages
  const originalLog = console.log;
  console.log = function(...args) {
    // Look for our specific debug patterns
    const message = args.join(' ');
    if (message.includes('[UnifiedNumberBox]') || 
        message.includes('saveTopicClick') || 
        message.includes('clicked number') ||
        message.includes('🔢') ||
        message.includes('💾') ||
        message.includes('➕') ||
        message.includes('➖')) {
      originalLog('🎯 DETECTED CLICK EVENT:', ...args);
    }
    originalLog.apply(console, args);
  };
  
  // Also monitor fetch/XHR requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (url && url.includes && (url.includes('topic_clicks') || url.includes('supabase'))) {
      console.log('🌐 DATABASE REQUEST:', url, args[1]);
    }
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Click monitoring active - try clicking numbers now');
}

// 5. Check for service initialization issues
function checkServiceInitialization() {
  console.log('\n🚀 CHECKING SERVICE INITIALIZATION:');
  
  // Check if services are properly initialized
  const services = [
    'supabase',
    'cleanSupabaseService', 
    'unifiedNumberBoxService',
    'crossPageSyncService'
  ];
  
  services.forEach(serviceName => {
    const service = window[serviceName];
    if (service) {
      console.log(`✅ ${serviceName}: Available`);
      if (service.constructor && service.constructor.name) {
        console.log(`   Type: ${service.constructor.name}`);
      }
    } else {
      console.log(`❌ ${serviceName}: NOT AVAILABLE`);
    }
  });
  
  // Check React component state (if React DevTools available)
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools available - check component props/state');
  } else {
    console.log('⚠️ React DevTools not available');
  }
}

// 6. Check current page context
function checkPageContext() {
  console.log('\n📄 CHECKING PAGE CONTEXT:');
  
  console.log('URL:', window.location.href);
  console.log('Page title:', document.title);
  
  // Check for Rule-1 page indicators
  const pageIndicators = [
    document.querySelector('h1, h2, h3'),
    document.querySelector('[class*="rule"]'),
    document.querySelector('[class*="HR"]'),
    document.querySelector('[data-hour]')
  ].filter(Boolean);
  
  pageIndicators.forEach((element, index) => {
    console.log(`Page element ${index + 1}:`, element.textContent?.trim(), element.className);
  });
  
  // Check for number boxes
  const numberBoxes = document.querySelectorAll('[class*="number"], [class*="cell"], button[class*="box"]');
  console.log(`Number boxes found: ${numberBoxes.length}`);
  
  if (numberBoxes.length > 0) {
    console.log('Sample number box:', numberBoxes[0]);
    console.log('Number box classes:', numberBoxes[0].className);
  }
}

// Main diagnostic function
async function runCriticalDiagnostic() {
  console.log('🔥🔥🔥 CRITICAL ISSUE DIAGNOSTIC: NUMBER CLICKS NOT SAVING 🔥🔥🔥');
  console.log('=====================================================================');
  
  // Run all diagnostics
  const currentUser = checkCurrentUser();
  checkPageContext();
  checkServiceInitialization();
  
  const serviceWorking = await testUnifiedNumberBoxService();
  const databaseWorking = await testDirectDatabaseAccess();
  
  monitorClickEvents();
  
  console.log('\n📋 DIAGNOSTIC SUMMARY:');
  console.log('======================');
  console.log(`Current User ID: ${currentUser || 'NOT DETECTED'}`);
  console.log(`UnifiedNumberBoxService: ${serviceWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`Direct Database Access: ${databaseWorking ? '✅ Working' : '❌ Failed'}`);
  
  console.log('\n🎯 NEXT STEPS:');
  if (!currentUser) {
    console.log('1. ❌ CRITICAL: No user ID detected - this is likely the root cause');
    console.log('   - Check how the user ID is passed to the Rule-1 page');
    console.log('   - Verify URL parameters or component props');
  }
  
  if (!serviceWorking) {
    console.log('2. ❌ CRITICAL: UnifiedNumberBoxService not working');
    console.log('   - Service may not be imported/initialized properly');
    console.log('   - Check service imports in the Rule-1 component');
  }
  
  if (!databaseWorking) {
    console.log('3. ❌ CRITICAL: Database access failed');
    console.log('   - Check Supabase connection and permissions');
    console.log('   - Verify table schema and RLS policies');
  }
  
  console.log('\n👆 Now click on number boxes and watch for click event logs above');
  console.log('   If no logs appear, the click handlers are not properly attached');
}

// Export for global access
window.criticalDiagnostic = {
  run: runCriticalDiagnostic,
  checkUser: checkCurrentUser,
  testService: testUnifiedNumberBoxService,
  testDatabase: testDirectDatabaseAccess,
  monitor: monitorClickEvents
};

// Auto-run the diagnostic
runCriticalDiagnostic();
