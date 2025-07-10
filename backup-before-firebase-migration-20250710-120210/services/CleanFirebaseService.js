/**
 * Firebase Service - Drop-in replacement for CleanSupabaseService
 * 
 * Provides the same interface as your existing Supabase service
 * but uses Firebase Firestore as the backend
 */

import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebaseConfig.js';

class CleanFirebaseService {
  constructor() {
    // Use Firebase configuration from firebaseConfig.js
    this.db = db;
    
    console.log('🔥 CleanFirebaseService initialized - Firebase Firestore');
  }

  // =====================================
  // 👤 USER MANAGEMENT
  // =====================================

  async createUser(userData) {
    try {
      const userRef = doc(collection(this.db, 'users'));
      await setDoc(userRef, {
        username: userData.username,
        email: userData.email,
        hr_count: userData.hr || 1,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime()
      });
      
      console.log('✅ User created:', userRef.id);
      return { id: userRef.id, ...userData };
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      console.error('❌ Error getting user:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const usersSnapshot = await getDocs(
        query(collection(this.db, 'users'), orderBy('username'))
      );
      
      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
      console.log(`📤 Saving Excel data for ${userId} on ${date}`);
      
      // Validate data structure
      const sets = excelData.sets || excelData.data?.sets;
      if (!sets || Object.keys(sets).length === 0) {
        throw new Error('Excel data must contain sets/topics');
      }

      const docId = `${userId}_${date}`;
      await setDoc(doc(this.db, 'excel_data', docId), {
        user_id: userId,
        date: date,
        file_name: excelData.fileName || 'Unknown',
        data: { sets: sets },
        created_at: new Date().getTime(),
        updated_at: new Date().getTime()
      });
      
      console.log(`✅ Excel data saved: ${Object.keys(sets).length} sets`);
      return { id: docId };
    } catch (error) {
      console.error('❌ Error saving Excel data:', error);
      throw error;
    }
  }

  async getExcelData(userId, date) {
    try {
      console.log(`📥 Getting Excel data for ${userId} on ${date}`);

      const docId = `${userId}_${date}`;
      const excelDoc = await getDoc(doc(this.db, 'excel_data', docId));

      if (!excelDoc.exists()) {
        console.log(`ℹ️ No Excel data found for ${userId} on ${date}`);
        return null;
      }

      const data = excelDoc.data();
      console.log(`✅ Excel data loaded: ${Object.keys(data.data?.sets || {}).length} sets`);
      
      return {
        fileName: data.file_name,
        sets: data.data?.sets || {},
        dataSource: 'Firebase',
        date: data.date
      };
    } catch (error) {
      console.error('❌ Error getting Excel data:', error);
      throw error;
    }
  }

  async deleteExcelData(userId, date) {
    try {
      const docId = `${userId}_${date}`;
      await deleteDoc(doc(this.db, 'excel_data', docId));
      console.log(`🗑️ Excel data deleted for ${userId} on ${date}`);
    } catch (error) {
      console.error('❌ Error deleting Excel data:', error);
      throw error;
    }
  }

  async hasExcelData(userId, date) {
    try {
      const docId = `${userId}_${date}`;
      const excelDoc = await getDoc(doc(this.db, 'excel_data', docId));
      return excelDoc.exists();
    } catch (error) {
      console.error('❌ Error checking Excel data:', error);
      return false;
    }
  }

  // =====================================
  // ⏰ HOUR ENTRY MANAGEMENT  
  // =====================================

  async saveHourEntry(userId, date, planetSelections) {
    try {
      console.log(`📤 Saving hour entry for ${userId} on ${date}`);

      const docId = `${userId}_${date}`;
      await setDoc(doc(this.db, 'hour_entries', docId), {
        user_id: userId,
        date_key: date,
        hour_data: { 
          planetSelections: planetSelections,
          date: date,
          userId: userId,
          savedAt: new Date().getTime()
        },
        created_at: new Date().getTime(),
        updated_at: new Date().getTime()
      });
      
      console.log(`✅ Hour entry saved: ${Object.keys(planetSelections).length} HR selections`);
      return { id: docId };
    } catch (error) {
      console.error('❌ Error saving hour entry:', error);
      throw error;
    }
  }

  async getHourEntry(userId, date) {
    try {
      console.log(`📥 Getting hour entry for ${userId} on ${date}`);

      const docId = `${userId}_${date}`;
      const hourDoc = await getDoc(doc(this.db, 'hour_entries', docId));

      if (!hourDoc.exists()) {
        console.log(`ℹ️ No hour entry found for ${userId} on ${date} (this is normal for new dates)`);
        return null;
      }

      const data = hourDoc.data();
      console.log(`✅ Hour entry loaded: ${Object.keys(data.hour_data?.planetSelections || {}).length} HR selections`);
      
      return {
        planetSelections: data.hour_data?.planetSelections || {},
        dataSource: 'Firebase',
        date: data.date_key
      };
    } catch (error) {
      console.error('❌ Error getting hour entry:', error);
      throw error;
    }
  }

  async deleteHourEntry(userId, date) {
    try {
      const docId = `${userId}_${date}`;
      await deleteDoc(doc(this.db, 'hour_entries', docId));
      console.log(`🗑️ Hour entry deleted for ${userId} on ${date}`);
    } catch (error) {
      console.error('❌ Error deleting hour entry:', error);
      throw error;
    }
  }

  async hasHourEntry(userId, date) {
    try {
      const docId = `${userId}_${date}`;
      const hourDoc = await getDoc(doc(this.db, 'hour_entries', docId));
      return hourDoc.exists();
    } catch (error) {
      console.error('❌ Error checking hour entry:', error);
      return false;
    }
  }

  // =====================================
  // 📅 DATE MANAGEMENT
  // =====================================

  async getUserDates(userId) {
    try {
      const userDoc = await getDoc(doc(this.db, 'user_dates', userId));
      
      if (!userDoc.exists()) {
        return [];
      }
      
      return userDoc.data().dates || [];
    } catch (error) {
      console.error('❌ Error getting user dates:', error);
      throw error;
    }
  }

  async saveUserDates(userId, dates) {
    try {
      await setDoc(doc(this.db, 'user_dates', userId), {
        user_id: userId,
        dates: dates,
        updated_at: new Date().getTime()
      });
      
      console.log(`✅ User dates saved: ${dates.length} dates`);
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

  async removeUserDate(userId, date) {
    try {
      const currentDates = await this.getUserDates(userId);
      const newDates = currentDates.filter(d => d !== date);
      await this.saveUserDates(userId, newDates);
      
      // Also delete associated data
      await this.deleteExcelData(userId, date);
      await this.deleteHourEntry(userId, date);
    } catch (error) {
      console.error('❌ Error removing user date:', error);
      throw error;
    }
  }

  // =====================================
  // 🧮 ANALYSIS FUNCTIONS
  // =====================================

  async extractNumbersFromSet(userId, date, setName, hrNumber) {
    try {
      const [excelData, hourData] = await Promise.all([
        this.getExcelData(userId, date),
        this.getHourEntry(userId, date)
      ]);

      if (!excelData || !hourData) {
        console.log(`⚠️ Missing data for extraction: Excel=${!!excelData}, Hour=${!!hourData}`);
        return [];
      }

      const sets = excelData.sets || {};
      const planetSelections = hourData.planetSelections || {};
      const setData = sets[setName];
      const selectedPlanet = planetSelections[hrNumber];

      if (!setData || !selectedPlanet) {
        console.log(`⚠️ Missing set data or planet selection for ${setName}/HR${hrNumber}`);
        return [];
      }

      const numbers = new Set();
      Object.entries(setData).forEach(([elementName, planetData]) => {
        const rawString = planetData[selectedPlanet];
        if (rawString) {
          const match = rawString.match(/^[a-z]+-(\d+)[\/\-]/);
          if (match) {
            numbers.add(Number(match[1]));
          }
        }
      });

      const result = Array.from(numbers).sort((a, b) => a - b);
      console.log(`🔢 Extracted ${result.length} numbers from ${setName} HR${hrNumber}: [${result.join(', ')}]`);
      return result;
    } catch (error) {
      console.error('❌ Error extracting numbers:', error);
      return [];
    }
  }

  // =====================================
  // 🔧 UTILITY FUNCTIONS
  // =====================================

  async getDataSummary(userId) {
    try {
      const [excelSnapshot, hourSnapshot, dates] = await Promise.all([
        getDocs(query(collection(this.db, 'excel_data'), where('user_id', '==', userId))),
        getDocs(query(collection(this.db, 'hour_entries'), where('user_id', '==', userId))),
        this.getUserDates(userId)
      ]);

      return {
        excelDataCount: excelSnapshot.size,
        hourEntryCount: hourSnapshot.size,
        userDatesCount: dates.length,
        userDates: dates
      };
    } catch (error) {
      console.error('❌ Error getting data summary:', error);
      return {
        excelDataCount: 0,
        hourEntryCount: 0,
        userDatesCount: 0,
        userDates: []
      };
    }
  }

  // Health check
  async checkConnection() {
    try {
      // Simple test query
      const testQuery = query(collection(this.db, 'users'), limit(1));
      await getDocs(testQuery);
      
      console.log('✅ Firebase connection healthy');
      return true;
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cleanFirebaseService = new CleanFirebaseService();
export default cleanFirebaseService;
