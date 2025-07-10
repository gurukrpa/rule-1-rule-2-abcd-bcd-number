/**
 * Firebase Data Import Service
 * 
 * Service to import the exported Supabase data into Firebase Firestore
 * Use this after running the export script
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

class FirebaseImportService {
  constructor() {
    // Initialize Firebase Admin SDK
    // You'll need to download serviceAccountKey.json from Firebase Console
    if (!admin.apps.length) {
      try {
        const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: 'https://viboothi-a9dcd-default-rtdb.firebaseio.com'
        });
      } catch (error) {
        console.error('❌ Firebase initialization failed:', error.message);
        console.log('📋 Setup instructions:');
        console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
        console.log('2. Click "Generate new private key"');
        console.log('3. Save the file as "serviceAccountKey.json" in this directory');
        console.log('4. Update the databaseURL above with your project URL');
        process.exit(1);
      }
    }
    
    this.db = admin.firestore();
  }

  /**
   * Import a collection from JSON file
   */
  async importCollection(collectionName, filePath) {
    console.log(`📊 Importing collection: ${collectionName}`);
    
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      const entries = Object.entries(data);
      
      if (entries.length === 0) {
        console.log(`ℹ️ No data to import for ${collectionName}`);
        return;
      }

      // Import in batches (Firestore limit is 500 operations per batch)
      // For large documents (like excel_data), use smaller batches
      const BATCH_SIZE = collectionName === 'excel_data' ? 50 : 500;
      let imported = 0;
      
      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = this.db.batch();
        const batchEntries = entries.slice(i, i + BATCH_SIZE);
        
        batchEntries.forEach(([docId, docData]) => {
          const docRef = this.db.collection(collectionName).doc(String(docId));
          batch.set(docRef, docData);
        });
        
        await batch.commit();
        imported += batchEntries.length;
        console.log(`  ✅ Imported ${imported}/${entries.length} documents`);
      }
      
      console.log(`🎉 Successfully imported ${imported} documents to ${collectionName}`);
      
    } catch (error) {
      console.error(`❌ Error importing ${collectionName}:`, error.message);
      throw error;
    }
  }

  /**
   * Import all collections from export files
   */
  async importAllCollections(timestamp) {
    const collections = [
      'users',
      'excel_data',
      'hour_entries', 
      'user_dates',
      'user_dates_userdata',
      'user_dates_abcd',
      'topic_abcd_bcd_numbers',
      'rule2_analysis_results',
      'hr_data',
      'processed_data',
      'rule2_results'
    ];

    console.log('🚀 Starting Firebase import...\n');

    let totalImported = 0;
    const importResults = {};

    for (const collection of collections) {
      const filePath = `firebase-${collection}-${timestamp}.json`;
      
      try {
        // Check if file exists
        readFileSync(filePath, 'utf8');
        
        const startTime = Date.now();
        await this.importCollection(collection, filePath);
        const endTime = Date.now();
        
        importResults[collection] = {
          status: 'success',
          duration: endTime - startTime
        };
        
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`⚠️ File not found: ${filePath} (skipping)`);
          importResults[collection] = { status: 'skipped', reason: 'file not found' };
        } else {
          console.error(`❌ Failed to import ${collection}:`, error.message);
          importResults[collection] = { status: 'failed', error: error.message };
        }
      }
    }

    // Print summary
    console.log('\n📈 Import Summary:');
    Object.entries(importResults).forEach(([collection, result]) => {
      const status = result.status === 'success' ? '✅' : 
                    result.status === 'skipped' ? '⚠️' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`  ${status} ${collection}${duration}`);
    });

    console.log('\n🎉 Firebase import completed!');
  }

  /**
   * Verify imported data
   */
  async verifyImport() {
    console.log('\n🔍 Verifying imported data...');

    const collections = await this.db.listCollections();
    
    for (const collection of collections) {
      const snapshot = await collection.get();
      console.log(`  📊 ${collection.id}: ${snapshot.size} documents`);
      
      // Sample a few documents to verify structure
      if (snapshot.size > 0) {
        const sample = snapshot.docs[0].data();
        console.log(`    📋 Sample fields: ${Object.keys(sample).join(', ')}`);
      }
    }
  }

  /**
   * Setup Firestore indexes if needed
   */
  async setupIndexes() {
    console.log('\n🔧 Setting up recommended indexes...');
    
    // Note: Firestore indexes are usually created automatically based on queries
    // You can also define them in firestore.indexes.json
    
    console.log('ℹ️ Indexes will be created automatically when you run queries');
    console.log('ℹ️ For complex queries, consider creating composite indexes in Firebase Console');
  }

  /**
   * Clean up test data (useful during development)
   */
  async cleanupTestData() {
    console.log('🧹 Cleaning up test data...');
    
    const batch = this.db.batch();
    
    // Add your cleanup logic here
    // For example, delete test users or old data
    
    await batch.commit();
    console.log('✅ Cleanup completed');
  }
}

// CLI usage
if (process.argv.length < 3) {
  console.log('Usage: node firebase-import-service.mjs <timestamp>');
  console.log('Example: node firebase-import-service.mjs 2025-01-10T12-30-00');
  console.log('\nAvailable commands:');
  console.log('- import <timestamp>  : Import all collections');
  console.log('- verify             : Verify imported data');
  console.log('- setup-indexes      : Setup recommended indexes');
  console.log('- cleanup            : Clean up test data');
  process.exit(1);
}

const command = process.argv[2];
const timestamp = process.argv[3];

const importService = new FirebaseImportService();

try {
  switch (command) {
    case 'import':
      if (!timestamp) {
        console.error('❌ Timestamp required for import command');
        process.exit(1);
      }
      await importService.importAllCollections(timestamp);
      break;
      
    case 'verify':
      await importService.verifyImport();
      break;
      
    case 'setup-indexes':
      await importService.setupIndexes();
      break;
      
    case 'cleanup':
      await importService.cleanupTestData();
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
} catch (error) {
  console.error('❌ Import service failed:', error);
  process.exit(1);
}

export { FirebaseImportService };
