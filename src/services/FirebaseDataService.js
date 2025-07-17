/**
 * Firebase Data Service
 * Handles all data operations using Firebase Firestore
 */
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebaseClient.js';

class FirebaseDataService {
  constructor() {
    this.db = db;
    console.log('🔥 Firebase Data Service initialized');
  }

  // =====================================
  // 👤 USER MANAGEMENT
  // =====================================

  async createUser(userData) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const userRef = doc(this.db, 'users', userData.id || userData.username);
      await setDoc(userRef, {
        username: userData.username,
        email: userData.email,
        hr_count: userData.hr || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log('🔥 User created:', userData.username);
      return { id: userData.id || userData.username, ...userData };
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const usersRef = collection(this.db, 'users');
      const usersSnap = await getDocs(usersRef);
      
      const users = [];
      usersSnap.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });

      return users;
    } catch (error) {
      console.error('❌ Error getting users:', error);
      throw error;
    }
  }

  // =====================================
  // 📊 EXCEL DATA MANAGEMENT
  // =====================================

  async saveExcelData(userId, date, excelData) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const excelRef = doc(this.db, 'excel_data', `${userId}_${date}`);
      await setDoc(excelRef, {
        user_id: userId,
        date: date,
        file_name: excelData.fileName || 'Unknown',
        data: excelData.data || excelData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log('🔥 Excel data saved for', date);
      return { id: `${userId}_${date}`, ...excelData };
    } catch (error) {
      console.error('❌ Error saving Excel data:', error);
      throw error;
    }
  }

  async getExcelData(userId, date) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const excelRef = doc(this.db, 'excel_data', `${userId}_${date}`);
      const excelSnap = await getDoc(excelRef);

      if (excelSnap.exists()) {
        const data = excelSnap.data();
        return {
          fileName: data.file_name,
          data: data.data,
          dataSource: 'Firebase',
          date: data.date
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting Excel data:', error);
      throw error;
    }
  }

  async hasExcelData(userId, date) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const excelRef = doc(this.db, 'excel_data', `${userId}_${date}`);
      const excelSnap = await getDoc(excelRef);

      return excelSnap.exists();
    } catch (error) {
      console.error('❌ Error checking Excel data:', error);
      return false;
    }
  }

  async deleteExcelData(userId, date) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const excelRef = doc(this.db, 'excel_data', `${userId}_${date}`);
      await deleteDoc(excelRef);

      console.log('🔥 Excel data deleted for', date);
    } catch (error) {
      console.error('❌ Error deleting Excel data:', error);
      throw error;
    }
  }

  // =====================================
  // ⏰ HOUR ENTRY MANAGEMENT
  // =====================================

  async saveHourEntry(userId, date, planetSelections) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const hourRef = doc(this.db, 'hour_entries', `${userId}_${date}`);
      await setDoc(hourRef, {
        user_id: userId,
        date_key: date,
        hour_data: {
          planetSelections: planetSelections,
          date: date,
          userId: userId,
          savedAt: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log('🔥 Hour entry saved for', date);
      return { id: `${userId}_${date}`, planetSelections };
    } catch (error) {
      console.error('❌ Error saving hour entry:', error);
      throw error;
    }
  }

  async getHourEntry(userId, date) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const hourRef = doc(this.db, 'hour_entries', `${userId}_${date}`);
      const hourSnap = await getDoc(hourRef);

      if (hourSnap.exists()) {
        const data = hourSnap.data();
        return {
          planetSelections: data.hour_data?.planetSelections || {},
          dataSource: 'Firebase',
          date: data.date_key
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting hour entry:', error);
      throw error;
    }
  }

  async hasHourEntry(userId, date) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const hourRef = doc(this.db, 'hour_entries', `${userId}_${date}`);
      const hourSnap = await getDoc(hourRef);

      return hourSnap.exists();
    } catch (error) {
      console.error('❌ Error checking hour entry:', error);
      return false;
    }
  }

  async deleteHourEntry(userId, date) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const hourRef = doc(this.db, 'hour_entries', `${userId}_${date}`);
      await deleteDoc(hourRef);

      console.log('🔥 Hour entry deleted for', date);
    } catch (error) {
      console.error('❌ Error deleting hour entry:', error);
      throw error;
    }
  }

  // =====================================
  // 📅 DATE MANAGEMENT
  // =====================================

  async getUserDates(userId) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const datesRef = doc(this.db, 'user_dates', userId);
      const datesSnap = await getDoc(datesRef);

      if (datesSnap.exists()) {
        return datesSnap.data().dates || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Error getting user dates:', error);
      return [];
    }
  }

  async saveUserDates(userId, dates) {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      const datesRef = doc(this.db, 'user_dates', userId);
      await setDoc(datesRef, {
        user_id: userId,
        dates: dates,
        updated_at: new Date().toISOString()
      });

      console.log('🔥 User dates saved:', dates.length);
      return { user_id: userId, dates };
    } catch (error) {
      console.error('❌ Error saving user dates:', error);
      throw error;
    }
  }

  async addUserDate(userId, date) {
    try {
      const currentDates = await this.getUserDates(userId);
      if (!currentDates.includes(date)) {
        const newDates = [...currentDates, date].sort();
        await this.saveUserDates(userId, newDates);
      }
    } catch (error) {
      console.error('❌ Error adding user date:', error);
      throw error;
    }
  }

  // =====================================
  // 🔍 UTILITY METHODS
  // =====================================

  async checkConnection() {
    try {
      if (!this.db) {
        throw new Error('Firebase not initialized');
      }

      // Test connection by getting a small collection
      const testRef = collection(this.db, 'users');
      const testQuery = query(testRef, limit(1));
      await getDocs(testQuery);
      
      console.log('🔥 Firebase connection healthy');
      return true;
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const firebaseDataService = new FirebaseDataService();
export default firebaseDataService;
