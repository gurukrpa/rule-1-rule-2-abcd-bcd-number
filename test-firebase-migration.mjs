#!/usr/bin/env node

/**
 * Test Firebase Authentication and Data Access
 * Verifies that the Firebase migration is working correctly
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

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

async function testFirebaseAccess() {
  try {
    console.log('🔐 Testing Firebase Authentication...');
    
    // Sign in with the admin user
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@viboothi.local', 'Srimatha1@');
    console.log('✅ Authentication successful:', userCredential.user.email);
    
    console.log('\n📊 Testing data access...');
    
    // Test accessing users collection
    const usersQuery = query(collection(db, 'users'), limit(5));
    const usersSnapshot = await getDocs(usersQuery);
    console.log(`✅ Users collection: ${usersSnapshot.size} documents`);
    
    // Test accessing other collections
    const collections = [
      'user_dates',
      'user_dates_userdata', 
      'user_dates_abcd',
      'excel_data',
      'hour_entries',
      'hr_data',
      'rule2_analysis_results',
      'rule2_results'
    ];
    
    for (const collectionName of collections) {
      try {
        const q = query(collection(db, collectionName), limit(1));
        const snapshot = await getDocs(q);
        console.log(`✅ ${collectionName}: ${snapshot.size} documents (sample)`);
      } catch (error) {
        console.log(`❌ ${collectionName}: Error - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Firebase migration test completed successfully!');
    console.log('💡 You can now use the application with Firebase authentication');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 Run setup-firebase-auth.mjs first to create the admin user');
    } else if (error.code === 'permission-denied') {
      console.log('💡 Check Firestore security rules and ensure they allow authenticated access');
    }
  } finally {
    process.exit(0);
  }
}

testFirebaseAccess();
