#!/usr/bin/env node

/**
 * Test CleanFirebaseService directly
 * Check if the service can fetch users correctly
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// We need to initialize Firebase first
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

async function testCleanFirebaseService() {
  try {
    console.log('🔐 Authenticating first...');
    await signInWithEmailAndPassword(auth, 'admin@viboothi.local', 'Srimatha1@');
    
    console.log('📊 Testing CleanFirebaseService...');
    
    // Dynamically import the service (ES modules)
    const { cleanFirebaseService } = await import('./src/services/CleanFirebaseService.js');
    
    // Test connection
    const isConnected = await cleanFirebaseService.checkConnection();
    console.log('✅ Connection test:', isConnected ? 'PASSED' : 'FAILED');
    
    // Test fetching users
    const users = await cleanFirebaseService.getAllUsers();
    console.log('✅ Users fetched:', users.length);
    
    // Show user details
    users.forEach(user => {
      console.log(`  👤 ${user.username} (ID: ${user.id})`);
    });
    
    console.log('\\n🎉 CleanFirebaseService test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testCleanFirebaseService();
