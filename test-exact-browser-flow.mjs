#!/usr/bin/env node

/**
 * Final Service Test - Exact Browser Simulation
 * This simulates exactly what the browser should be doing
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration (same as browser)
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

async function testExactBrowserFlow() {
  try {
    console.log('🧪 Testing Exact Browser Flow');
    console.log('='.repeat(40));
    
    // 1. Authenticate (same as browser)
    console.log('🔐 Authenticating as admin...');
    await signInWithEmailAndPassword(auth, 'admin@viboothi.local', 'Srimatha1@');
    console.log('✅ Authentication successful');
    
    // 2. Import service (same as browser)
    console.log('🔧 Importing CleanFirebaseService...');
    const cleanFirebaseServiceModule = await import('./src/services/CleanFirebaseService.js');
    const cleanFirebaseService = cleanFirebaseServiceModule.default;
    const { PAGE_CONTEXTS } = cleanFirebaseServiceModule;
    
    console.log('✅ Service imported');
    
    // 3. Test exact parameters from browser
    const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'; // sing maya user
    const pageContext = PAGE_CONTEXTS.ABCD; // ABCD page context
    
    console.log('🔍 Testing getUserDates with exact browser parameters:');
    console.log('  userId:', userId);
    console.log('  pageContext:', pageContext);
    
    // 4. Call service method (exact same as browser component)
    console.log('📅 Calling getUserDates...');
    const dates = await cleanFirebaseService.getUserDates(userId, pageContext);
    
    console.log('📊 Results:');
    console.log('  Dates returned:', dates ? dates.length : 0);
    console.log('  First few dates:', dates ? dates.slice(0, 3) : 'None');
    
    // 5. Verify expected result
    if (dates && dates.length === 13) {
      console.log('🎉 SUCCESS: Service returns 13 dates as expected!');
      console.log('✅ The browser ABCD page should show "📅 Dates: 13"');
    } else {
      console.log('❌ ISSUE: Expected 13 dates, got:', dates ? dates.length : 0);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testExactBrowserFlow();
