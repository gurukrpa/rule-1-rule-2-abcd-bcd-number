/**
 * Test the specific fix for PAGE_CONTEXTS.ABCD parameter
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import FirebaseAuthService from './src/services/FirebaseAuthService.js';
import CleanFirebaseService, { PAGE_CONTEXTS } from './src/services/CleanFirebaseService.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCCbYOmGBvtCYHGJCNEYPjwZJdnDyIK_Q",
  authDomain: "rule-1-rule-2-abcd-bcd-number.firebaseapp.com",
  projectId: "rule-1-rule-2-abcd-bcd-number",
  storageBucket: "rule-1-rule-2-abcd-bcd-number.firebasestorage.app",
  messagingSenderId: "582397615088",
  appId: "1:582397615088:web:e8c5b4db7c8f5a8e6c6b44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testPageContextFix() {
  console.log('🧪 Testing PAGE_CONTEXTS.ABCD Fix for sing maya user');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Authenticate
    console.log('🔐 Authenticating...');
    const authService = new FirebaseAuthService(auth);
    await authService.signInWithEmailAndPassword('admin@viboothi.local', 'admin123');
    console.log('✅ Authentication successful!');
    
    // Step 2: Initialize CleanFirebaseService
    console.log('🔧 Initializing CleanFirebaseService...');
    const cleanFirebaseService = new CleanFirebaseService(db);
    
    // Step 3: Test different page contexts
    const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'; // sing maya user ID
    
    console.log('\n📊 Testing different page contexts:');
    
    // Test ABCD context (should find 13 dates)
    console.log('\n1️⃣ Testing ABCD context:');
    const abcdDates = await cleanFirebaseService.getUserDates(userId, PAGE_CONTEXTS.ABCD);
    console.log(`   Found ${abcdDates.length} dates in ABCD context`);
    if (abcdDates.length > 0) {
      console.log(`   Sample dates: ${abcdDates.slice(0, 3).join(', ')}...`);
    }
    
    // Test USERDATA context (should find 1 date)
    console.log('\n2️⃣ Testing USERDATA context:');
    const userdataDates = await cleanFirebaseService.getUserDates(userId, PAGE_CONTEXTS.USERDATA);
    console.log(`   Found ${userdataDates.length} dates in USERDATA context`);
    if (userdataDates.length > 0) {
      console.log(`   Dates: ${userdataDates.join(', ')}`);
    }
    
    // Test default context (should default to USERDATA and find 1 date)
    console.log('\n3️⃣ Testing default context (should default to USERDATA):');
    const defaultDates = await cleanFirebaseService.getUserDates(userId);
    console.log(`   Found ${defaultDates.length} dates in default context`);
    if (defaultDates.length > 0) {
      console.log(`   Dates: ${defaultDates.join(', ')}`);
    }
    
    // Summary
    console.log('\n🎯 RESULTS SUMMARY:');
    console.log(`   ABCD context: ${abcdDates.length} dates`);
    console.log(`   USERDATA context: ${userdataDates.length} dates`);
    console.log(`   Default context: ${defaultDates.length} dates`);
    
    // Verify the fix
    console.log('\n🔍 VERIFICATION:');
    if (abcdDates.length === 13) {
      console.log('✅ ABCD context is working correctly (13 dates found)');
    } else {
      console.log(`❌ ABCD context issue: expected 13 dates, got ${abcdDates.length}`);
    }
    
    if (userdataDates.length === 1) {
      console.log('✅ USERDATA context is working correctly (1 date found)');
    } else {
      console.log(`❌ USERDATA context issue: expected 1 date, got ${userdataDates.length}`);
    }
    
    if (defaultDates.length === userdataDates.length) {
      console.log('✅ Default context properly defaults to USERDATA');
    } else {
      console.log(`❌ Default context issue: should match USERDATA (${userdataDates.length}), got ${defaultDates.length}`);
    }
    
    // Final result
    if (abcdDates.length === 13 && userdataDates.length === 1) {
      console.log('\n🎉 SUCCESS: PAGE_CONTEXTS.ABCD fix is working!');
      console.log('   The ABCD BCD Number page should now show "📅 Dates: 13" for sing maya user');
    } else {
      console.log('\n❌ ISSUE: PAGE_CONTEXTS.ABCD fix is not working correctly');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPageContextFix().catch(console.error);
