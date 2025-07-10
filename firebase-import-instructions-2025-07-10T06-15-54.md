# Firebase Import Instructions

## Files Generated


## Firebase Console Import Steps

### Method 1: Firebase Console (Small datasets)
1. Go to Firebase Console → Firestore Database
2. For each collection:
   - Click "Start collection"
   - Enter collection name (e.g., "undefined")
   - Import the corresponding JSON file
   - Firebase Console supports up to 500 documents per import

### Method 2: Firebase CLI (Recommended for large datasets)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Use the Firebase Admin SDK to import data programmatically
```

### Method 3: Firebase Admin SDK (Programmatic import)
Create an import script:

```javascript
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
  
  console.log(`Imported ${Object.keys(data).length} documents to ${collectionName}`);
}
```

## Collection Mapping
Your Supabase tables will become Firebase collections:


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
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Example rule - customize based on your needs
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
