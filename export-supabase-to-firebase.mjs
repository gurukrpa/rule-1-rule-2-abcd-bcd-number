#!/usr/bin/env node

/**
 * Export Supabase Data to Firebase-Compatible Format
 * 
 * This script exports all data from your Supabase database
 * and converts it to JSON format that can be imported into Firebase
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

// Your Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables to export (based on your database structure)
const TABLES_TO_EXPORT = [
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

async function exportTable(tableName) {
  console.log(`📊 Exporting table: ${tableName}`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.log(`⚠️ Could not export ${tableName}: ${error.message}`);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log(`ℹ️ No data found in ${tableName}`);
      return [];
    }
    
    console.log(`✅ Exported ${data.length} records from ${tableName}`);
    return data;
  } catch (err) {
    console.log(`❌ Error exporting ${tableName}: ${err.message}`);
    return null;
  }
}

function convertToFirebaseFormat(supabaseData) {
  const firebaseData = {};
  
  Object.entries(supabaseData).forEach(([tableName, records]) => {
    if (!records || records.length === 0) return;
    
    // Convert each table to Firebase format
    firebaseData[tableName] = {};
    
    records.forEach((record, index) => {
      // Use the record ID as key, or generate one
      const key = record.id || record.user_id || `record_${index}`;
      
      // Convert PostgreSQL arrays and JSONB to Firebase-compatible format
      const convertedRecord = convertRecord(record);
      firebaseData[tableName][key] = convertedRecord;
    });
  });
  
  return firebaseData;
}

function convertRecord(record) {
  const converted = {};
  
  Object.entries(record).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      // Firebase doesn't store null values
      return;
    }
    
    // Convert PostgreSQL arrays to Firebase arrays
    if (Array.isArray(value)) {
      converted[key] = value;
    }
    // Convert JSONB objects
    else if (typeof value === 'object') {
      converted[key] = value;
    }
    // Convert timestamps to Firebase timestamp format
    else if (key.includes('_at') || key.includes('_date') || key === 'date') {
      if (typeof value === 'string') {
        const timestamp = new Date(value).getTime();
        converted[key] = timestamp;
      } else {
        converted[key] = value;
      }
    }
    // Keep primitive values as-is
    else {
      converted[key] = value;
    }
  });
  
  return converted;
}

async function exportAllData() {
  console.log('🚀 Starting Supabase to Firebase data export...\n');
  
  const exportedData = {};
  let totalRecords = 0;
  
  // Export each table
  for (const tableName of TABLES_TO_EXPORT) {
    const tableData = await exportTable(tableName);
    if (tableData !== null) {
      exportedData[tableName] = tableData;
      totalRecords += tableData.length;
    }
  }
  
  console.log(`\n📈 Export Summary:`);
  console.log(`- Tables processed: ${Object.keys(exportedData).length}`);
  console.log(`- Total records: ${totalRecords}`);
  
  // Convert to Firebase format
  console.log('\n🔄 Converting to Firebase format...');
  const firebaseData = convertToFirebaseFormat(exportedData);
  
  // Save to files
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  // Raw Supabase export (for backup)
  const supabaseFilename = `supabase-export-${timestamp}.json`;
  writeFileSync(supabaseFilename, JSON.stringify(exportedData, null, 2));
  console.log(`✅ Raw Supabase data saved to: ${supabaseFilename}`);
  
  // Firebase-compatible format
  const firebaseFilename = `firebase-import-${timestamp}.json`;
  writeFileSync(firebaseFilename, JSON.stringify(firebaseData, null, 2));
  console.log(`✅ Firebase-compatible data saved to: ${firebaseFilename}`);
  
  // Create individual collection files for Firebase import
  console.log('\n📁 Creating individual collection files...');
  Object.entries(firebaseData).forEach(([collectionName, collectionData]) => {
    const collectionFilename = `firebase-${collectionName}-${timestamp}.json`;
    writeFileSync(collectionFilename, JSON.stringify(collectionData, null, 2));
    console.log(`  📄 ${collectionName}: ${collectionFilename}`);
  });
  
  // Generate import instructions
  const instructions = generateImportInstructions(firebaseData, timestamp);
  const instructionsFilename = `firebase-import-instructions-${timestamp}.md`;
  writeFileSync(instructionsFilename, instructions);
  console.log(`\n📋 Import instructions saved to: ${instructionsFilename}`);
  
  console.log('\n🎉 Export completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Use the individual collection JSON files to import into Firebase');
  console.log('2. Follow the instructions in the generated markdown file');
  console.log('3. Test your Firebase connection with the migrated data');
}

function generateImportInstructions(firebaseData, timestamp) {
  const collections = Object.keys(firebaseData);
  
  return `# Firebase Import Instructions

## Files Generated
${collections.map(col => `- firebase-${col}-${timestamp}.json (${Object.keys(firebaseData[col]).length} records)`).join('\n')}

## Firebase Console Import Steps

### Method 1: Firebase Console (Small datasets)
1. Go to Firebase Console → Firestore Database
2. For each collection:
   - Click "Start collection"
   - Enter collection name (e.g., "${collections[0]}")
   - Import the corresponding JSON file
   - Firebase Console supports up to 500 documents per import

### Method 2: Firebase CLI (Recommended for large datasets)
\`\`\`bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Use the Firebase Admin SDK to import data programmatically
\`\`\`

### Method 3: Firebase Admin SDK (Programmatic import)
Create an import script:

\`\`\`javascript
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Import function for each collection
async function importCollection(collectionName, data) {
  const batch = db.batch();
  let count = 0;
  
  Object.entries(data).forEach(([docId, docData]) => {
    const docRef = db.collection(collectionName).doc(docId);
    batch.set(docRef, docData);
    count++;
    
    // Firestore batch limit is 500 operations
    if (count === 500) {
      batch.commit();
      count = 0;
    }
  });
  
  if (count > 0) {
    await batch.commit();
  }
  
  console.log(\`Imported \${Object.keys(data).length} documents to \${collectionName}\`);
}
\`\`\`

## Collection Mapping
Your Supabase tables will become Firebase collections:
${collections.map(col => `- ${col} → Firestore collection "${col}"`).join('\n')}

## Important Notes
1. Firebase doesn't support null values - they've been filtered out
2. PostgreSQL arrays are converted to Firebase arrays
3. JSONB objects are preserved as nested objects
4. Timestamps are converted to Firebase timestamp format
5. Auto-generated IDs are preserved where possible

## Data Validation
After import, verify:
- Record counts match the export summary
- Data types are correct
- Relationships between collections are maintained
- Date/timestamp fields are properly formatted

## Security Rules
Don't forget to set up Firestore security rules for your collections:
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Example rule - customize based on your needs
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`
`;
}

// Run the export
exportAllData().catch(console.error);
