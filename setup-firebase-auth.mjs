#!/usr/bin/env node

/**
 * Firebase Authentication Setup Script
 * Creates the default admin user for the application
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'viboothi-a9dcd'
});

const auth = admin.auth();

async function createDefaultUser() {
  try {
    console.log('🔐 Creating default admin user...');
    
    const userRecord = await auth.createUser({
      email: 'admin@viboothi.local',
      password: 'Srimatha1@',
      displayName: 'Admin User',
      emailVerified: true
    });

    console.log('✅ Successfully created user:', userRecord.uid);
    console.log('📧 Email:', userRecord.email);
    console.log('👤 Display Name:', userRecord.displayName);
    
    // Add custom claims for admin access
    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin'
    });
    
    console.log('🎯 Custom admin claims set successfully');
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️  User already exists. Updating custom claims...');
      
      // Get existing user and update claims
      const existingUser = await auth.getUserByEmail('admin@viboothi.local');
      await auth.setCustomUserClaims(existingUser.uid, {
        admin: true,
        role: 'admin'
      });
      
      console.log('✅ Updated custom claims for existing user');
    } else {
      console.error('❌ Error creating user:', error);
    }
  } finally {
    process.exit(0);
  }
}

createDefaultUser();
