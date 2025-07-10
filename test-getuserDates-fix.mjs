#!/usr/bin/env node

/**
 * Test the getUserDates fix for ABCD page context
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQqZqTmy17oldVtZG9Tqf4KHxJHO8if5E",
  authDomain: "viboothi-a9dcd.firebaseapp.com",
  projectId: "viboothi-a9dcd",
  storageBucket: "viboothi-a9dcd.appspot.com",
  messagingSenderId: "117979484616",
  appId: "1:117979484616:web:ed248e2d11bb593a7eb0fd",
  measurementId: "G-4GB6JLNSMR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testGetUserDatesFix() {
  console.log('🧪 Testing getUserDates Fix for ABCD Page Context');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Authenticate
    console.log('🔐 Authenticating...');
    await signInWithEmailAndPassword(auth, 'admin@viboothi.local', 'Srimatha1@');
    console.log('✅ Authentication successful!');
    
    // Step 2: Import CleanFirebaseService
    console.log('\n🔧 Importing CleanFirebaseService...');
    const { default: cleanFirebaseService, PAGE_CONTEXTS } = await import('./src/services/CleanFirebaseService.js');
    console.log('✅ CleanFirebaseService imported');
    
    // Step 3: Test different contexts
    const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'; // sing maya user ID
    console.log(`\n🔍 Testing user: ${userId}`);
    
    console.log('\n1️⃣ Testing ABCD context:');
    const abcdDates = await cleanFirebaseService.getUserDates(userId, PAGE_CONTEXTS.ABCD);
    console.log(`   Found ${abcdDates.length} dates`);
    
    console.log('\n2️⃣ Testing USERDATA context:');
    const userdataDates = await cleanFirebaseService.getUserDates(userId, PAGE_CONTEXTS.USERDATA);
    console.log(`   Found ${userdataDates.length} dates`);
    
    console.log('\n3️⃣ Testing default context (should use USERDATA):');
    const defaultDates = await cleanFirebaseService.getUserDates(userId);
    console.log(`   Found ${defaultDates.length} dates`);
    
    console.log('\n🎯 RESULTS:');
    console.log(`   ABCD context: ${abcdDates.length} dates`);
    console.log(`   USERDATA context: ${userdataDates.length} dates`);
    console.log(`   Default context: ${defaultDates.length} dates`);
    
    if (abcdDates.length > 10) {
      console.log('\n🎉 SUCCESS: ABCD context is working correctly!');
      console.log('   The ABCD page should now show the correct number of dates.');
    } else {
      console.log('\n❌ ISSUE: ABCD context is still not working.');
      console.log('   Expected more than 10 dates for sing maya user.');
    }
    
    if (defaultDates.length === userdataDates.length) {
      console.log('✅ Default context correctly uses USERDATA');
    } else {
      console.log('❌ Default context issue');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testGetUserDatesFix();
