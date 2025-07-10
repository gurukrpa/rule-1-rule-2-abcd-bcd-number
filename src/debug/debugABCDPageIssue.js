console.log('🧪 ABCD Page Debug Test - Starting...');

// Test function to debug the ABCD page issue
async function debugABCDPageIssue() {
  try {
    console.log('📊 Step 1: Testing CleanFirebaseService import...');
    
    // Import the service
    const { default: cleanFirebaseService, PAGE_CONTEXTS } = await import('../services/CleanFirebaseService.js');
    console.log('✅ CleanFirebaseService imported successfully');
    console.log('📝 PAGE_CONTEXTS:', PAGE_CONTEXTS);
    
    console.log('📊 Step 2: Testing getUserDates with ABCD context...');
    
    // Test with sing maya user ID
    const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    console.log('🔍 Testing with user ID:', userId);
    
    // Test ABCD context
    console.log('📅 Calling getUserDates with ABCD context...');
    const abcdDates = await cleanFirebaseService.getUserDates(userId, PAGE_CONTEXTS.ABCD);
    console.log('✅ ABCD dates result:', abcdDates);
    console.log('📊 ABCD dates count:', abcdDates ? abcdDates.length : 'null/undefined');
    
    // Test USERDATA context for comparison
    console.log('📅 Calling getUserDates with USERDATA context...');
    const userdataDates = await cleanFirebaseService.getUserDates(userId, PAGE_CONTEXTS.USERDATA);
    console.log('✅ USERDATA dates result:', userdataDates);
    console.log('📊 USERDATA dates count:', userdataDates ? userdataDates.length : 'null/undefined');
    
    // Test default context
    console.log('📅 Calling getUserDates with default context...');
    const defaultDates = await cleanFirebaseService.getUserDates(userId);
    console.log('✅ Default dates result:', defaultDates);
    console.log('📊 Default dates count:', defaultDates ? defaultDates.length : 'null/undefined');
    
    console.log('🎯 DEBUG SUMMARY:');
    console.log(`   ABCD context: ${abcdDates ? abcdDates.length : 0} dates`);
    console.log(`   USERDATA context: ${userdataDates ? userdataDates.length : 0} dates`);
    console.log(`   Default context: ${defaultDates ? defaultDates.length : 0} dates`);
    
    if (abcdDates && abcdDates.length > 0) {
      console.log('🎉 SUCCESS: ABCD context is returning dates!');
      console.log('💡 The issue might be in the UI component or state management');
    } else {
      console.log('❌ ISSUE: ABCD context is not returning dates');
      console.log('💡 The issue is in the service layer or authentication');
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

// Add to window for manual testing
window.debugABCDPageIssue = debugABCDPageIssue;

console.log('🧪 Debug function loaded. Run: debugABCDPageIssue()');

export default debugABCDPageIssue;
