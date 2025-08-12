/**
 * Firebase Service for Dual-Service Mode
 * Works alongside Supabase for backup, real-time sync, and redundancy
 */

// Production Firebase imports (commented out for development)
/*
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
*/

// Development mode - Firebase disabled
let db = null;
let auth = null;
let serverTimestamp = null;

class FirebaseService {
  constructor() {
    this.db = db;
    this.auth = auth;
    this.isConfigured = this.checkConfiguration();
    
    if (this.isConfigured) {
      console.log('🔥 Firebase Service initialized and ready');
    } else {
      console.log('🔥 Firebase Service initialized (configuration needed for production)');
    }
  }

  /**
   * Check if Firebase is properly configured
   */
  checkConfiguration() {
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('🔥 Firebase missing environment variables:', missingVars);
      return false;
    }

    return this.db !== null && this.auth !== null;
  }

  /**
   * Check Firebase connection
   */
  async checkConnection() {
    if (!this.isConfigured) {
      throw new Error('Firebase not configured - missing environment variables');
    }

    try {
      // Try to read from a test collection
      const testRef = doc(this.db, 'connection_test', 'test');
      await getDoc(testRef);
      return true;
    } catch (error) {
      console.error('🔥 Firebase connection failed:', error);
      throw new Error(`Firebase connection failed: ${error.message}`);
    }
  }

  // =====================================
  // 👤 USER MANAGEMENT
  // =====================================

  async createUser(userData) {
    if (!this.isConfigured) {
      return { success: true, note: 'Firebase not configured - development mode' };
    }

    try {
      const userRef = doc(this.db, 'users', userData.id);
      await setDoc(userRef, {
        ...userData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      console.log('🔥 Firebase user created:', userData.id);
      return { 
        success: true, 
        data: userData,
        service: 'firebase'
      };
    } catch (error) {
      console.error('❌ Firebase createUser error:', error);
      throw new Error(`Firebase createUser failed: ${error.message}`);
    }
  }

  async getUser(userId) {
    if (!this.isConfigured) {
      return null;
    }

    try {
      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('🔥 Firebase user retrieved:', userId);
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Firebase getUser error:', error);
      throw new Error(`Firebase getUser failed: ${error.message}`);
    }
  }

  // =====================================
  // 📊 EXCEL DATA MANAGEMENT
  // =====================================

  async saveExcelData(userId, date, excelData) {
    if (!this.isConfigured) {
      return { success: true, note: 'Firebase not configured - development mode' };
    }

    try {
      const docRef = doc(this.db, 'excel_data', `${userId}_${date}`);
      await setDoc(docRef, {
        user_id: userId,
        date_key: date,
        file_name: excelData.fileName,
        excel_data: excelData.sets || excelData.data,
        updated_at: serverTimestamp()
      });
      
      console.log('🔥 Firebase Excel data saved:', { userId, date });
      return { 
        success: true, 
        service: 'firebase'
      };
    } catch (error) {
      console.error('❌ Firebase saveExcelData error:', error);
      throw new Error(`Firebase saveExcelData failed: ${error.message}`);
    }
  }

  async getExcelData(userId, date) {
    if (!this.isConfigured) {
      return null;
    }

    try {
      const docRef = doc(this.db, 'excel_data', `${userId}_${date}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('🔥 Firebase Excel data retrieved:', { userId, date });
        return {
          fileName: data.file_name,
          sets: data.excel_data,
          dataSource: 'Firebase',
          date: data.date_key
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Firebase getExcelData error:', error);
      throw new Error(`Firebase getExcelData failed: ${error.message}`);
    }
  }

  // =====================================
  // ⏰ HOUR ENTRY MANAGEMENT
  // =====================================

  async saveHourEntry(userId, date, planetSelections) {
    if (!this.isConfigured) {
      return { success: true, note: 'Firebase not configured - development mode' };
    }

    try {
      const docRef = doc(this.db, 'hour_entries', `${userId}_${date}`);
      await setDoc(docRef, {
        user_id: userId,
        date_key: date,
        hour_data: { planetSelections },
        updated_at: serverTimestamp()
      });
      
      console.log('🔥 Firebase hour entry saved:', { userId, date });
      return { 
        success: true, 
        service: 'firebase'
      };
    } catch (error) {
      console.error('❌ Firebase saveHourEntry error:', error);
      throw new Error(`Firebase saveHourEntry failed: ${error.message}`);
    }
  }

  async getHourEntry(userId, date) {
    if (!this.isConfigured) {
      return null;
    }

    try {
      const docRef = doc(this.db, 'hour_entries', `${userId}_${date}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('🔥 Firebase hour entry retrieved:', { userId, date });
        return {
          planetSelections: data.hour_data?.planetSelections || {},
          dataSource: 'Firebase',
          date: data.date_key
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Firebase getHourEntry error:', error);
      throw new Error(`Firebase getHourEntry failed: ${error.message}`);
    }
  }

  // =====================================
  // 📅 DATE MANAGEMENT
  // =====================================

  async getUserDates(userId) {
    if (!this.isConfigured) {
      return [];
    }

    try {
      const docRef = doc(this.db, 'user_dates', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('🔥 Firebase user dates retrieved:', userId);
        return data.dates || [];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Firebase getUserDates error:', error);
      throw new Error(`Firebase getUserDates failed: ${error.message}`);
    }
  }

  async saveUserDates(userId, dates) {
    if (!this.isConfigured) {
      return { success: true, note: 'Firebase not configured - development mode' };
    }

    try {
      const docRef = doc(this.db, 'user_dates', userId);
      await setDoc(docRef, {
        user_id: userId,
        dates: dates,
        updated_at: serverTimestamp()
      });
      
      console.log('🔥 Firebase user dates saved:', { userId, dateCount: dates.length });
      return { 
        success: true, 
        service: 'firebase'
      };
    } catch (error) {
      console.error('❌ Firebase saveUserDates error:', error);
      throw new Error(`Firebase saveUserDates failed: ${error.message}`);
    }
  }

  // =====================================
  // 🔧 UTILITY FUNCTIONS
  // =====================================

  async syncFromSupabase(supabaseData) {
    if (!this.isConfigured) {
      return {
        success: false,
        note: 'Firebase not configured - development mode'
      };
    }

    try {
      console.log('🔄 Syncing data from Supabase to Firebase...', supabaseData);
      
      // Implementation: Sync specific data types
      // This would be implemented based on the supabaseData structure
      
      return {
        success: true,
        synced: Object.keys(supabaseData).length,
        service: 'firebase'
      };
    } catch (error) {
      console.error('❌ Firebase sync failed:', error);
      throw new Error(`Firebase sync failed: ${error.message}`);
    }
  }

  // =====================================
  // 📈 DATA SUMMARY METHODS
  // =====================================

  async getDataSummary(userId) {
    if (!this.isConfigured) {
      return {
        excelDatesCount: 0,
        hourEntriesCount: 0,
        userDatesCount: 0,
        note: 'Firebase not configured - development mode'
      };
    }

    try {
      // This would query multiple collections to get counts
      // For now, return a placeholder structure
      
      console.log('🔥 Firebase data summary requested for:', userId);
      return {
        excelDatesCount: 0,
        hourEntriesCount: 0,
        userDatesCount: 0,
        service: 'firebase',
        note: 'Summary implementation needed'
      };
    } catch (error) {
      console.error('❌ Firebase getDataSummary error:', error);
      throw new Error(`Firebase getDataSummary failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;
