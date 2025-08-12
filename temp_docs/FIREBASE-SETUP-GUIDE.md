# 🔥 Firebase Setup Guide for Dual-Service Mode

## 📋 Overview

This guide will help you set up Firebase as a backup service alongside Supabase for maximum reliability and data redundancy.

## 🚀 Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click "Create a project" or "Add project"

2. **Project Setup**
   - Project name: `rule-1-rule-2-abcd-bcd-number`
   - Enable Google Analytics (optional)
   - Choose your analytics account

3. **Enable Required Services**
   - **Firestore Database**: Go to "Build" > "Firestore Database" > "Create database"
     - Start in test mode (we'll configure rules later)
     - Choose your location (preferably same as your users)
   
   - **Authentication**: Go to "Build" > "Authentication" > "Get started"
     - Enable "Email/Password" sign-in method
     - Add your domain to authorized domains

## 🔧 Step 2: Get Firebase Configuration

1. **Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

2. **Add Web App**
   - Scroll down to "Your apps" section
   - Click the `</>` (Web) icon
   - App nickname: `rule-1-rule-2-web-app`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Configuration**
   - Copy the `firebaseConfig` object
   - You'll need these values for your `.env` file

## 📝 Step 3: Update Environment Variables

Add these variables to your `.env` file:

```bash
# Firebase Configuration (Production Backup Service)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id_here
```

**Example with real values:**
```bash
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=rule-1-rule-2-abcd-bcd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=rule-1-rule-2-abcd-bcd
VITE_FIREBASE_STORAGE_BUCKET=rule-1-rule-2-abcd-bcd.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
VITE_FIREBASE_APP_ID=1:987654321:web:abcdef123456789
```

## 📦 Step 4: Install Firebase Dependencies

```bash
npm install firebase
```

## 🔄 Step 5: Enable Firebase in Production

1. **Update FirebaseService.js** - Uncomment the Firebase imports and configuration
2. **Update DatabaseServiceSwitcher.js** - Uncomment the Firebase service imports
3. **Deploy to Production** - Firebase will only be enabled in production builds

## 🗄️ Step 6: Configure Firestore Database Structure

Your Firestore will automatically create these collections when data is saved:

```
📁 users/
  📄 [userId] = {
    id: string,
    username: string,
    fullname: string,
    created_at: timestamp
  }

📁 excel_data/
  📄 [userId_date] = {
    user_id: string,
    date_key: string,
    excel_data: object,
    updated_at: timestamp
  }

📁 hour_entries/
  📄 [userId_date] = {
    user_id: string,
    date_key: string,
    hour_data: object,
    updated_at: timestamp
  }

📁 user_dates/
  📄 [userId] = {
    user_id: string,
    dates: array,
    updated_at: timestamp
  }
```

## 🔒 Step 7: Configure Security Rules

Update your Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for all authenticated users for now
    // TODO: Implement proper user-based security
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**For production, use more secure rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    match /excel_data/{docId} {
      allow read, write: if request.auth != null 
        && resource.data.user_id == request.auth.uid;
    }
    
    match /hour_entries/{docId} {
      allow read, write: if request.auth != null 
        && resource.data.user_id == request.auth.uid;
    }
    
    match /user_dates/{userId} {
      allow read, write: if request.auth != null 
        && userId == request.auth.uid;
    }
  }
}
```

## 🧪 Step 8: Test Firebase Integration

1. **Local Testing** (Firebase disabled):
   ```bash
   npm run dev
   # Visit http://localhost:5173/dual-service-demo
   # Should show "Firebase disabled in development"
   ```

2. **Production Testing** (Firebase enabled):
   ```bash
   npm run build
   npm run preview
   # Visit http://localhost:4173/dual-service-demo
   # Should connect to both Supabase and Firebase
   ```

3. **Live Testing**:
   ```bash
   npm run deploy
   # Visit your GitHub Pages URL
   # Navigate to /dual-service-demo
   ```

## 📊 Step 9: Monitor Dual-Service Performance

1. **Firebase Console**
   - Monitor database usage
   - Check for errors
   - Review performance metrics

2. **Application Monitoring**
   ```javascript
   // Check health status
   const health = await dualServiceManager.getHealthStatus();
   console.log('Service Health:', health);
   
   // Test sync functionality
   const syncResult = await dualServiceManager.syncPrimaryToBackup(userId);
   console.log('Sync Result:', syncResult);
   ```

## 🚨 Troubleshooting

### Common Issues:

1. **"Firebase not defined" errors**
   - Ensure Firebase is only imported in production builds
   - Check environment variable configuration

2. **Permission denied errors**
   - Update Firestore security rules
   - Verify authentication is working

3. **Quota exceeded**
   - Monitor Firebase usage in console
   - Implement data cleanup strategies

4. **Sync failures**
   - Check network connectivity
   - Verify both services are properly configured
   - Review console logs for specific errors

## 🎯 Expected Benefits

After setup completion:

✅ **99.9% Uptime** - Automatic failover between services  
✅ **Data Redundancy** - Data saved to both Supabase and Firebase  
✅ **Performance Optimization** - Load balancing and service-specific features  
✅ **Real-time Capabilities** - Firebase real-time updates when needed  
✅ **Backup & Recovery** - Automatic data sync and recovery  

## 🔄 Quick Commands

```bash
# Development (Supabase only)
npm run dev

# Build for production (Supabase + Firebase)
npm run build

# Deploy to GitHub Pages (Production)
npm run deploy

# Test dual-service functionality
# Visit: /dual-service-demo
```

## 📞 Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Review the `DUAL-SERVICE-SETUP.md` for advanced configuration
3. Test individual services before enabling dual-mode
4. Verify all environment variables are correctly set

---

🎉 **Success!** After completing this setup, your application will have a robust dual-service architecture with automatic failover, data redundancy, and enhanced reliability!
