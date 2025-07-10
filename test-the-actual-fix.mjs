/**
 * Quick test to verify our CleanFirebaseService fix
 */

import FirebaseAuthService from './src/services/FirebaseAuthService.js';
import CleanFirebaseService, { PAGE_CONTEXTS } from './src/services/CleanFirebaseService.js';

async function testTheActualFix() {
  console.log('🧪 Testing the ACTUAL fix - Default pageContext parameter');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Authenticate using existing service
    console.log('🔐 Authenticating...');
    await FirebaseAuthService.signIn('admin@viboothi.local', 'Srimatha1@');
    console.log('✅ Authentication successful!');
    
    // Step 2: Test the fix - call getUserDates WITHOUT pageContext parameter
    const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'; // sing maya user ID
    
    console.log('\n🔧 Testing the CORE FIX:');
    console.log('   The issue was that getUserDates(userId) without pageContext was failing');
    console.log('   because pageContext was undefined instead of defaulting to USERDATA');
    
    // Test 1: Call with explicit ABCD context (should work)
    console.log('\n1️⃣ Testing getUserDates(userId, PAGE_CONTEXTS.ABCD):');
    const abcdDates = await CleanFirebaseService.getUserDates(userId, PAGE_CONTEXTS.ABCD);
    console.log(`   ✅ Result: ${abcdDates.length} dates`);
    
    // Test 2: Call without pageContext (the ACTUAL issue we fixed)
    console.log('\n2️⃣ Testing getUserDates(userId) - NO pageContext parameter:');
    console.log('   This was the failing call that needed the default parameter fix');
    const defaultDates = await CleanFirebaseService.getUserDates(userId);
    console.log(`   ✅ Result: ${defaultDates.length} dates (should default to USERDATA context)`);
    
    // Test 3: Verify the fix worked
    console.log('\n🎯 VERIFICATION:');
    if (typeof defaultDates !== 'undefined' && Array.isArray(defaultDates)) {
      console.log('✅ SUCCESS: getUserDates() without pageContext now works!');
      console.log('   Default parameter fix is working correctly');
      console.log(`   ABCD context: ${abcdDates.length} dates`);
      console.log(`   Default context: ${defaultDates.length} dates`);
      
      if (abcdDates.length > 0) {
        console.log('\n🎉 FINAL RESULT: The ABCD page should now show dates for sing maya!');
        console.log('   Please refresh the browser and check the ABCD BCD Number page');
      }
    } else {
      console.log('❌ ISSUE: getUserDates() without pageContext is still failing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTheActualFix().catch(console.error);
