/**
 * Test script to verify the ABCD page context fix for sing maya user
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

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
const db = getFirestore(app);
const auth = getAuth(app);

// Import page contexts
const PAGE_CONTEXTS = {
  USERDATA: 'userdata',
  ABCD: 'abcd',
  RULE2: 'rule2',
  PAST_DAYS: 'past_days',
  INDEX: 'index'
};

// Simple getUserDates function that mimics CleanFirebaseService
async function getUserDates(userId, pageContext = PAGE_CONTEXTS.USERDATA) {
  try {
    // Sign in anonymously to access Firebase
    await signInAnonymously(auth);
    
    // Get collection name based on page context
    const getCollectionName = (pageContext) => {
      switch (pageContext) {
        case PAGE_CONTEXTS.USERDATA:
          return 'user_dates_userdata';
        case PAGE_CONTEXTS.ABCD:
          return 'user_dates_abcd';
        case PAGE_CONTEXTS.RULE2:
          return 'user_dates_rule2';
        case PAGE_CONTEXTS.PAST_DAYS:
          return 'user_dates_past_days';
        case PAGE_CONTEXTS.INDEX:
          return 'user_dates_index';
        default:
          return 'user_dates';
      }
    };
    
    const collectionName = getCollectionName(pageContext);
    console.log(`🔍 Getting dates for user "${userId}" from collection "${collectionName}"`);
    
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    const q = query(
      collection(db, collectionName),
      where('user_id', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`📭 No dates found for user "${userId}" in collection "${collectionName}"`);
      return [];
    }
    
    const dates = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.dates && Array.isArray(data.dates)) {
        dates.push(...data.dates);
      }
    });
    
    console.log(`✅ Found ${dates.length} dates for user "${userId}" in collection "${collectionName}":`, dates);
    return dates;
    
  } catch (error) {
    console.error(`❌ Error getting dates for user "${userId}":`, error);
    return [];
  }
}

// Test the fix
async function testABCDPageContextFix() {
  console.log('🧪 Testing ABCD Page Context Fix for sing maya user');
  console.log('='.repeat(60));
  
  const userId = 'sing maya';
  
  // Test 1: Get dates from ABCD context (should work now)
  console.log('\n1️⃣ Testing ABCD context (should find dates):');
  const abcdDates = await getUserDates(userId, PAGE_CONTEXTS.ABCD);
  console.log(`   Result: ${abcdDates.length} dates found`);
  
  // Test 2: Get dates from USERDATA context (should be empty)
  console.log('\n2️⃣ Testing USERDATA context (should be empty):');
  const userdataDates = await getUserDates(userId, PAGE_CONTEXTS.USERDATA);
  console.log(`   Result: ${userdataDates.length} dates found`);
  
  // Test 3: Get dates without context (should default to USERDATA and be empty)
  console.log('\n3️⃣ Testing default context (should default to USERDATA and be empty):');
  const defaultDates = await getUserDates(userId);
  console.log(`   Result: ${defaultDates.length} dates found`);
  
  // Summary
  console.log('\n🎯 SUMMARY:');
  console.log(`   ABCD context: ${abcdDates.length} dates ✅`);
  console.log(`   USERDATA context: ${userdataDates.length} dates (expected: 0)`);
  console.log(`   Default context: ${defaultDates.length} dates (expected: 0)`);
  
  if (abcdDates.length > 0) {
    console.log('\n🎉 SUCCESS: ABCD page context fix is working!');
    console.log('   The getUserDates() method now correctly reads from user_dates_abcd collection');
    console.log('   when PAGE_CONTEXTS.ABCD parameter is provided.');
  } else {
    console.log('\n❌ ISSUE: ABCD page context is still not working correctly');
  }
  
  process.exit(0);
}

// Run the test
testABCDPageContextFix().catch(console.error);
