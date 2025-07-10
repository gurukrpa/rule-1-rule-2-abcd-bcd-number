#!/usr/bin/env node

/**
 * Check Firebase Data Counts
 * Compare what's actually in Firebase vs what should be there
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
const db = getFirestore(app);

async function checkFirebaseData() {
  try {
    console.log('🔐 Authenticating...');
    await signInWithEmailAndPassword(auth, 'admin@viboothi.local', 'Srimatha1@');
    
    console.log('📊 Checking actual Firebase data counts...');
    
    const collections = [
      'users',
      'excel_data',
      'hour_entries',
      'user_dates',
      'user_dates_userdata',
      'user_dates_abcd',
      'rule2_analysis_results',
      'hr_data',
      'rule2_results'
    ];
    
    const actualCounts = {};
    
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        actualCounts[collectionName] = snapshot.size;
        console.log(`✅ ${collectionName}: ${snapshot.size} documents`);
      } catch (error) {
        console.log(`❌ ${collectionName}: Error - ${error.message}`);
        actualCounts[collectionName] = 0;
      }
    }
    
    console.log('\\n📈 Expected vs Actual:');
    const expected = {
      users: 2,
      excel_data: 53,
      hour_entries: 45,
      user_dates: 10,
      user_dates_userdata: 2,
      user_dates_abcd: 2,
      rule2_analysis_results: 5,
      hr_data: 672,
      rule2_results: 27
    };
    
    let totalMissing = 0;
    for (const [collection, expectedCount] of Object.entries(expected)) {
      const actualCount = actualCounts[collection] || 0;
      const missing = expectedCount - actualCount;
      totalMissing += missing;
      
      if (missing > 0) {
        console.log(`⚠️  ${collection}: Expected ${expectedCount}, Got ${actualCount}, Missing ${missing}`);
      } else {
        console.log(`✅ ${collection}: ${actualCount} documents (complete)`);
      }
    }
    
    console.log(`\\n🔢 Total missing documents: ${totalMissing}`);
    
    if (totalMissing > 0) {
      console.log('\\n💡 Need to re-import missing data from Supabase export!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkFirebaseData();
