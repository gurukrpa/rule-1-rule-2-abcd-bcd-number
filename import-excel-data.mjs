/**
 * Import excel_data collection with smaller batch size
 */
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://viboothi-a9dcd-default-rtdb.firebaseio.com'
    });
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

async function importExcelData() {
  console.log('📊 Importing excel_data with smaller batches...');
  
  try {
    const data = JSON.parse(readFileSync('firebase-excel_data-2025-07-10T06-22-51.json', 'utf8'));
    const entries = Object.entries(data);
    
    if (entries.length === 0) {
      console.log('ℹ️ No excel data to import');
      return;
    }

    console.log(`📁 Found ${entries.length} excel data documents`);

    // Use very small batches for large documents
    const BATCH_SIZE = 10;
    let imported = 0;
    
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchEntries = entries.slice(i, i + BATCH_SIZE);
      
      batchEntries.forEach(([docId, docData]) => {
        const docRef = db.collection('excel_data').doc(String(docId));
        batch.set(docRef, docData);
      });
      
      await batch.commit();
      imported += batchEntries.length;
      console.log(`  ✅ Imported ${imported}/${entries.length} documents`);
    }
    
    console.log(`🎉 Successfully imported ${imported} documents to excel_data`);
    
  } catch (error) {
    console.error(`❌ Error importing excel_data:`, error.message);
    throw error;
  }
}

// Run the import
importExcelData()
  .then(() => {
    console.log('✅ Excel data import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });
