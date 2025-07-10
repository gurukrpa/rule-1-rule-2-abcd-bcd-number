#!/usr/bin/env node

/**
 * Debug User Data - Check what data exists for "sing maya" user
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

async function debugUserData() {
  try {
    console.log('🔐 Authenticating...');
    await signInWithEmailAndPassword(auth, 'admin@viboothi.local', 'Srimatha1@');
    
    console.log('👤 Looking for "sing maya" user...');
    
    // First, get all users and find "sing maya"
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let singMayaUser = null;
    
    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      console.log(`  📋 User: ${userData.username} (ID: ${doc.id})`);
      if (userData.username === 'sing maya') {
        singMayaUser = { id: doc.id, ...userData };
      }
    });
    
    if (!singMayaUser) {
      console.log('❌ "sing maya" user not found!');
      return;
    }
    
    console.log(`✅ Found "sing maya" user:`, singMayaUser);
    console.log(`🔍 User ID: ${singMayaUser.id}`);
    
    // Check different date collections
    const dateCollections = [
      'user_dates',
      'user_dates_userdata', 
      'user_dates_abcd'
    ];
    
    for (const collectionName of dateCollections) {
      console.log(`\\n📅 Checking ${collectionName}...`);
      
      const q = query(collection(db, collectionName), where('user_id', '==', singMayaUser.id));
      const snapshot = await getDocs(q);
      
      console.log(`  📊 Found ${snapshot.size} documents`);
      
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`    ${index + 1}. ${JSON.stringify(data, null, 2)}`);
      });
    }
    
    // Check excel_data
    console.log(`\\n📊 Checking excel_data...`);
    const excelQuery = query(collection(db, 'excel_data'), where('user_id', '==', singMayaUser.id));
    const excelSnapshot = await getDocs(excelQuery);
    console.log(`  📊 Found ${excelSnapshot.size} excel_data documents`);
    
    excelSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`    ${index + 1}. Date: ${data.date}, File: ${data.file_name}`);
    });
    
    // Check hour_entries
    console.log(`\\n⏰ Checking hour_entries...`);
    const hourQuery = query(collection(db, 'hour_entries'), where('user_id', '==', singMayaUser.id));
    const hourSnapshot = await getDocs(hourQuery);
    console.log(`  📊 Found ${hourSnapshot.size} hour_entries documents`);
    
    hourSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`    ${index + 1}. Date: ${data.date || data.date_key}`);
    });
    
    // Check hr_data
    console.log(`\\n📈 Checking hr_data...`);
    const hrQuery = query(collection(db, 'hr_data'), where('user_id', '==', singMayaUser.id));
    const hrSnapshot = await getDocs(hrQuery);
    console.log(`  📊 Found ${hrSnapshot.size} hr_data documents`);
    
    if (hrSnapshot.size > 0) {
      // Just show a sample
      const sampleDoc = hrSnapshot.docs[0];
      const sampleData = sampleDoc.data();
      console.log(`    Sample: Date: ${sampleData.date}, Topic: ${sampleData.topic}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugUserData();
