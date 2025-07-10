# 🔥 Supabase to Firebase Migration Guide

This guide provides step-by-step instructions to migrate your ABCD-BCD Number application from Supabase to Firebase Firestore.

## 📋 Migration Overview

Firebase Firestore doesn't accept SQL directly, so we need to:
1. Export data from Supabase in JSON format
2. Convert the data structure to Firebase-compatible format
3. Import the data into Firestore collections
4. Update your application code to use Firebase SDK

## 🛠️ Prerequisites

1. **Firebase Project**: Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. **Node.js**: Ensure you have Node.js installed
3. **Firebase CLI**: Install globally with `npm install -g firebase-tools`

## 📊 Step 1: Export Data from Supabase

Run the export script to extract all your data:

```bash
node export-supabase-to-firebase.mjs
```

This will generate:
- `supabase-export-TIMESTAMP.json` (raw backup)
- `firebase-import-TIMESTAMP.json` (Firebase-compatible format)
- Individual collection files: `firebase-COLLECTION-TIMESTAMP.json`
- Import instructions: `firebase-import-instructions-TIMESTAMP.md`

## 🔧 Step 2: Setup Firebase Project

### 2.1 Initialize Firebase in your project

```bash
firebase login
firebase init firestore
```

### 2.2 Configure Firebase in your app

Update your Firebase configuration in `CleanFirebaseService.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id", 
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 2.3 Install Firebase SDK

```bash
npm install firebase
npm install firebase-admin  # For server-side operations
```

## 📥 Step 3: Import Data to Firebase

### Option A: Programmatic Import (Recommended)

1. **Download Service Account Key**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in your project root

2. **Run the import script**:
```bash
node firebase-import-service.mjs import TIMESTAMP
```

### Option B: Manual Import via Firebase Console

1. Go to Firebase Console → Firestore Database
2. For each collection:
   - Click "Start collection"
   - Enter collection name (e.g., "users")
   - Import the corresponding JSON file
   - Note: Console supports max 500 documents per import

## 🔄 Step 4: Update Application Code

### 4.1 Replace Supabase Service

Replace your Supabase service imports:

```javascript
// OLD - Supabase
import { cleanSupabaseService } from './services/CleanSupabaseService.js';

// NEW - Firebase  
import { cleanFirebaseService } from './services/CleanFirebaseService.js';
```

### 4.2 Update Service References

The Firebase service provides the same interface, so most of your code should work unchanged:

```javascript
// These methods work the same way
await cleanFirebaseService.saveExcelData(userId, date, excelData);
await cleanFirebaseService.getExcelData(userId, date);
await cleanFirebaseService.saveHourEntry(userId, date, planetSelections);
// etc.
```

## 📚 Step 5: Collection Mapping

Your Supabase tables become Firestore collections:

| Supabase Table | Firestore Collection | Description |
|----------------|---------------------|-------------|
| `users` | `users` | User profiles and settings |
| `excel_data` | `excel_data` | Uploaded Excel file data |
| `hour_entries` | `hour_entries` | Planet selections for each hour |
| `user_dates` | `user_dates` | User's saved dates |
| `user_dates_userdata` | `user_dates_userdata` | UserData page specific dates |
| `user_dates_abcd` | `user_dates_abcd` | ABCD page specific dates |
| `topic_abcd_bcd_numbers` | `topic_abcd_bcd_numbers` | ABCD/BCD numbers for each topic |
| `rule2_analysis_results` | `rule2_analysis_results` | Rule2 analysis results |
| `hr_data` | `hr_data` | Hour-related data |
| `processed_data` | `processed_data` | Processed calculation data |
| `rule2_results` | `rule2_results` | Rule2 calculation results |

## 🔒 Step 6: Setup Security Rules

Create Firestore security rules (`firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /excel_data/{docId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    match /hour_entries/{docId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    match /user_dates/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add similar rules for other collections
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## 🧪 Step 7: Testing and Validation

### 7.1 Verify Data Import

```bash
node firebase-import-service.mjs verify
```

### 7.2 Test Application Functionality

1. Test user login/creation
2. Test Excel data upload and retrieval
3. Test hour entry saving and loading
4. Test ABCD/BCD number calculations
5. Test date management
6. Test all major features

### 7.3 Performance Testing

Firebase has different performance characteristics:
- Queries are limited to 1MB or 1000 documents by default
- Complex queries may need composite indexes
- Real-time listeners can improve user experience

## 🚀 Step 8: Go Live

### 8.1 Update Environment Variables

Update your production environment to use Firebase:

```bash
# Remove Supabase environment variables
# Add Firebase configuration
```

### 8.2 Deploy with Firebase

```bash
firebase deploy
```

### 8.3 Monitor Usage

- Check Firebase Console for usage metrics
- Monitor error logs in Firebase
- Set up alerts for high usage

## 🔧 Troubleshooting

### Common Issues

1. **Import Fails**: Check document size limits (1MB per document)
2. **Security Rules Block Access**: Update rules to match your auth system
3. **Performance Issues**: Add indexes for complex queries
4. **Cost Concerns**: Monitor usage and optimize queries

### Data Type Differences

| Supabase | Firebase | Notes |
|----------|----------|-------|
| `INTEGER[]` | `Array<number>` | Direct conversion |
| `JSONB` | `Map<string, any>` | Nested objects supported |
| `TIMESTAMP` | `Timestamp` | Use Firebase Timestamp |
| `UUID` | `string` | Use document ID or string |
| `NULL` | *omitted* | Firebase doesn't store null |

## 📊 Migration Checklist

- [ ] Export all data from Supabase
- [ ] Create Firebase project
- [ ] Import data to Firestore
- [ ] Update application code
- [ ] Setup security rules
- [ ] Test all functionality
- [ ] Performance optimization
- [ ] Deploy to production
- [ ] Monitor and maintain

## 🆘 Rollback Plan

Keep your Supabase data for at least 30 days:
1. Maintain parallel systems during transition
2. Test thoroughly before full cutover
3. Have rollback scripts ready
4. Monitor for issues post-migration

## 📞 Support

If you encounter issues:
1. Check Firebase documentation: https://firebase.google.com/docs/firestore
2. Firebase support forums
3. Stack Overflow with 'firebase' tag

## 💡 Additional Considerations

### Real-time Updates
Firebase offers real-time listeners that can improve user experience:

```javascript
// Listen for real-time updates
const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
  console.log('User data updated:', doc.data());
});
```

### Offline Support
Firebase provides offline persistence:

```javascript
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Enable offline persistence
await enableOfflineSupport();
```

### Cost Optimization
- Use queries efficiently (avoid fetching unnecessary data)
- Implement pagination for large datasets
- Consider using Firebase Functions for heavy computations
- Monitor usage in Firebase Console

---

**Good luck with your migration! 🔥**
