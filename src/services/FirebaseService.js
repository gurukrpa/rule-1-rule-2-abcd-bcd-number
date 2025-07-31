/**
 * Firebase Service for Real-Time Data Sharing
 * Connects to Firebase Firestore for shared data between localhost and viboothi.in
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
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

class FirebaseService {
  constructor() {
    this.isStub = false;
    this.db = db;
    this.auth = auth;
    console.log('🔥 Firebase Service initialized (REAL MODE) - Shared data enabled');
    console.log('🌐 Data will sync between localhost and viboothi.in');
  }

  // User Management
  async createUser(userData) {
    try {
      console.log('🔥 [Firebase] Creating user:', userData.username || userData.id);
      await setDoc(doc(this.db, 'users', userData.id), {
        ...userData,
        createdAt: new Date().toISOString(),
        source: 'firebase'
      });
      return { success: true, data: userData, source: 'firebase' };
    } catch (error) {
      console.error('❌ Firebase createUser error:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      console.log('🔥 [Firebase] Getting user:', userId);
      const docRef = doc(this.db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Firebase getUser error:', error);
      return null;
    }
  }

  async getAllUsers() {
    try {
      console.log('🔥 [Firebase] Getting all users');
      const querySnapshot = await getDocs(collection(this.db, 'users'));
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      console.error('❌ Firebase getAllUsers error:', error);
      return [];
    }
  }

  // Excel Data Management
  async saveExcelData(userId, date, excelData) {
    try {
      console.log('🔥 [Firebase] Saving Excel data:', { userId, date, fileName: excelData.fileName });
      const docId = `${userId}_${date}`;
      await setDoc(doc(this.db, 'excelData', docId), {
        userId,
        date,
        ...excelData,
        updatedAt: new Date().toISOString(),
        source: 'firebase'
      });
      return { success: true, data: excelData, source: 'firebase' };
    } catch (error) {
      console.error('❌ Firebase saveExcelData error:', error);
      throw error;
    }
  }

  async getExcelData(userId, date) {
    try {
      console.log('🔥 [Firebase] Getting Excel data:', { userId, date });
      const docId = `${userId}_${date}`;
      const docRef = doc(this.db, 'excelData', docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Firebase getExcelData error:', error);
      return null;
    }
  }

  async hasExcelData(userId, date) {
    try {
      console.log('🔥 [Firebase] Checking Excel data:', { userId, date });
      const data = await this.getExcelData(userId, date);
      return !!data;
    } catch (error) {
      console.error('❌ Firebase hasExcelData error:', error);
      return false;
    }
  }

  async deleteExcelData(userId, date) {
    try {
      console.log('🔥 [Firebase] Deleting Excel data:', { userId, date });
      const docId = `${userId}_${date}`;
      await deleteDoc(doc(this.db, 'excelData', docId));
      return { success: true, source: 'firebase' };
    } catch (error) {
      console.error('❌ Firebase deleteExcelData error:', error);
      throw error;
    }
  }

  // Hour Entry Management
  async saveHourEntry(userId, date, planetSelections) {
    try {
      console.log('🔥 [Firebase] Saving hour entry:', { userId, date, hrCount: Object.keys(planetSelections).length });
      const docId = `${userId}_${date}`;
      await setDoc(doc(this.db, 'hourEntries', docId), {
        userId,
        date,
        planetSelections,
        updatedAt: new Date().toISOString(),
        source: 'firebase'
      });
      return { success: true, data: { planetSelections }, source: 'firebase' };
    } catch (error) {
      console.error('❌ Firebase saveHourEntry error:', error);
      throw error;
    }
  }

  async getHourEntry(userId, date) {
    try {
      console.log('🔥 [Firebase] Getting hour entry:', { userId, date });
      const docId = `${userId}_${date}`;
      const docRef = doc(this.db, 'hourEntries', docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Firebase getHourEntry error:', error);
      return null;
    }
  }

  async hasHourEntry(userId, date) {
    try {
      console.log('🔥 [Firebase] Checking hour entry:', { userId, date });
      const data = await this.getHourEntry(userId, date);
      return !!data;
    } catch (error) {
      console.error('❌ Firebase hasHourEntry error:', error);
      return false;
    }
  }

  async deleteHourEntry(userId, date) {
    try {
      console.log('🔥 [Firebase] Deleting hour entry:', { userId, date });
      const docId = `${userId}_${date}`;
      await deleteDoc(doc(this.db, 'hourEntries', docId));
      return { success: true, source: 'firebase' };
    } catch (error) {
      console.error('❌ Firebase deleteHourEntry error:', error);
      throw error;
    }
  }

  // Date Management
  async getUserDates(userId) {
    try {
      console.log('🔥 [Firebase] Getting user dates:', userId);
      const docRef = doc(this.db, 'userDates', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().dates || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Firebase getUserDates error:', error);
      return [];
    }
  }

  async saveUserDates(userId, dates) {
    try {
      console.log('🔥 [Firebase] Saving user dates:', { userId, dateCount: dates.length });
      await setDoc(doc(this.db, 'userDates', userId), {
        userId,
        dates,
        updatedAt: new Date().toISOString(),
        source: 'firebase'
      });
      return { success: true, data: dates, source: 'firebase' };
    } catch (error) {
      console.error('❌ Firebase saveUserDates error:', error);
      throw error;
    }
  }

  async addUserDate(userId, date) {
    try {
      console.log('🔥 [Firebase] Adding user date:', { userId, date });
      const currentDates = await this.getUserDates(userId);
      if (!currentDates.includes(date)) {
        const newDates = [...currentDates, date].sort();
        await this.saveUserDates(userId, newDates);
      }
      return { success: true, source: 'firebase' };
    } catch (error) {
      console.error('❌ Firebase addUserDate error:', error);
      throw error;
    }
  }

  // Utility Methods
  async checkConnection() {
    try {
      console.log('🔥 [Firebase] Checking connection');
      // Try a simple read operation to test connection
      const testDoc = await getDoc(doc(this.db, 'test', 'connection'));
      return true; // If we get here, connection is working
    } catch (error) {
      console.error('❌ Firebase connection check failed:', error);
      return false;
    }
  }

  async getDataSummary(userId) {
    try {
      console.log('🔥 [Firebase] Getting data summary:', userId);
      
      const [userDates, excelQuerySnapshot, hourQuerySnapshot] = await Promise.all([
        this.getUserDates(userId),
        getDocs(query(collection(this.db, 'excelData'), where('userId', '==', userId))),
        getDocs(query(collection(this.db, 'hourEntries'), where('userId', '==', userId)))
      ]);

      return {
        excelDataCount: excelQuerySnapshot.size,
        hourEntryCount: hourQuerySnapshot.size,
        userDatesCount: userDates.length,
        userDates: userDates,
        source: 'firebase'
      };
    } catch (error) {
      console.error('❌ Firebase getDataSummary error:', error);
      return {
        excelDataCount: 0,
        hourEntryCount: 0,
        userDatesCount: 0,
        userDates: [],
        source: 'firebase-error'
      };
    }
  }

  // Sync methods for migration
  async syncFromSupabase(userId) {
    console.log('🔥 [Firebase] Sync from Supabase for user:', userId);
    return { success: true, note: 'Firebase real service - sync available', source: 'firebase' };
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;