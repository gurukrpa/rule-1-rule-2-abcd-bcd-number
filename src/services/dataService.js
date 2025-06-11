import { supabase } from '../supabaseClient';

/**
 * DataService - Unified data access layer for ABCD-BCD Number application
 * Provides localStorage fallback for all operations during migration phase
 */
class DataService {
  constructor() {
    this.useLocalStorageFallback = true; // Enable fallback during migration
    this.enableDebugLogging = true;
  }

  log(message, data = null) {
    if (this.enableDebugLogging) {
      console.log(`[DataService] ${message}`, data || '');
    }
  }

  // =============================================================================
  // USER DATES MANAGEMENT
  // =============================================================================

  /**
   * Get all dates for a user
   * @param {string} userId - User ID
   * @returns {Promise<string[]>} Array of date strings in ISO format
   */
  async getDates(userId) {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('user_dates')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) {
        this.log('✅ Dates fetched from Supabase', data.map(d => d.date));
        return data.map(d => d.date);
      }

      // Fallback to localStorage
      if (this.useLocalStorageFallback) {
        const dates = this.getLocalStorageDates(userId);
        this.log('📦 Dates fetched from localStorage', dates);
        return dates;
      }

      return [];
    } catch (error) {
      this.log('❌ Error fetching dates, using localStorage fallback', error.message);
      if (this.useLocalStorageFallback) {
        return this.getLocalStorageDates(userId);
      }
      throw error;
    }
  }

  /**
   * Save dates for a user
   * @param {string} userId - User ID
   * @param {string[]} dates - Array of date strings
   */
  async saveDates(userId, dates) {
    try {
      // Save to Supabase
      if (dates.length > 0) {
        // Delete existing dates first
        await supabase
          .from('user_dates')
          .delete()
          .eq('user_id', userId);

        // Insert new dates
        const dateRecords = dates.map(date => ({
          user_id: userId,
          date: date
        }));

        const { error } = await supabase
          .from('user_dates')
          .insert(dateRecords);

        if (!error) {
          this.log('✅ Dates saved to Supabase', dates);
          // Also save to localStorage for fallback
          this.saveLocalStorageDates(userId, dates);
          return;
        }
      }

      // If Supabase fails, save to localStorage
      this.saveLocalStorageDates(userId, dates);
      this.log('📦 Dates saved to localStorage (Supabase failed)', dates);
    } catch (error) {
      this.log('❌ Error saving dates, using localStorage', error.message);
      this.saveLocalStorageDates(userId, dates);
    }
  }

  getLocalStorageDates(userId) {
    try {
      const cached = localStorage.getItem(`abcd_dates_${userId}`);
      if (cached) {
        const arr = JSON.parse(cached);
        if (Array.isArray(arr)) {
          return arr.sort((a, b) => new Date(b) - new Date(a));
        }
      }
    } catch (e) {
      this.log('❌ Error reading localStorage dates', e.message);
    }
    return [];
  }

  saveLocalStorageDates(userId, dates) {
    try {
      localStorage.setItem(`abcd_dates_${userId}`, JSON.stringify(dates));
    } catch (e) {
      this.log('❌ Error saving localStorage dates', e.message);
    }
  }

  // =============================================================================
  // EXCEL DATA MANAGEMENT
  // =============================================================================

  /**
   * Get Excel data for a specific user and date
   * @param {string} userId - User ID
   * @param {string} date - Date string
   * @returns {Promise<Object|null>} Excel data object or null
   */
  async getExcelData(userId, date) {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('excel_data')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (!error && data) {
        this.log('✅ Excel data fetched from Supabase', { date, fileName: data.file_name });
        return {
          date: data.date,
          fileName: data.file_name,
          data: data.data,
          uploadedAt: data.uploaded_at
        };
      }

      // Fallback to localStorage
      if (this.useLocalStorageFallback) {
        const excelData = this.getLocalStorageExcelData(userId, date);
        if (excelData) {
          this.log('📦 Excel data fetched from localStorage', { date, fileName: excelData.fileName });
        }
        return excelData;
      }

      return null;
    } catch (error) {
      this.log('❌ Error fetching Excel data, using localStorage fallback', error.message);
      if (this.useLocalStorageFallback) {
        return this.getLocalStorageExcelData(userId, date);
      }
      throw error;
    }
  }

  /**
   * Save Excel data for a specific user and date
   * @param {string} userId - User ID
   * @param {string} date - Date string
   * @param {Object} excelData - Excel data object with fileName, data, etc.
   */
  async saveExcelData(userId, date, excelData) {
    try {
      // Save to Supabase
      const record = {
        user_id: userId,
        date: date,
        file_name: excelData.fileName,
        data: excelData.data
      };

      const { error } = await supabase
        .from('excel_data')
        .upsert(record, { onConflict: 'user_id,date' });

      if (!error) {
        this.log('✅ Excel data saved to Supabase', { date, fileName: excelData.fileName });
        // Also save to localStorage for fallback
        this.saveLocalStorageExcelData(userId, date, excelData);
        return;
      }

      // If Supabase fails, save to localStorage
      this.saveLocalStorageExcelData(userId, date, excelData);
      this.log('📦 Excel data saved to localStorage (Supabase failed)', { date, fileName: excelData.fileName });
    } catch (error) {
      this.log('❌ Error saving Excel data, using localStorage', error.message);
      this.saveLocalStorageExcelData(userId, date, excelData);
    }
  }

  getLocalStorageExcelData(userId, date) {
    try {
      const key = `abcd_excel_${userId}_${date}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      this.log('❌ Error reading localStorage Excel data', e.message);
    }
    return null;
  }

  saveLocalStorageExcelData(userId, date, excelData) {
    try {
      const key = `abcd_excel_${userId}_${date}`;
      const payload = {
        date: date,
        fileName: excelData.fileName,
        data: excelData.data,
        uploadedAt: excelData.uploadedAt || new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
      this.log('❌ Error saving localStorage Excel data', e.message);
    }
  }

  /**
   * Check if Excel data exists for a specific date
   * @param {string} userId - User ID
   * @param {string} date - Date string
   * @returns {Promise<boolean>} True if Excel data exists
   */
  async hasExcelData(userId, date) {
    try {
      // Check Supabase first
      const { data, error } = await supabase
        .from('excel_data')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (!error && data) {
        return true;
      }

      // Fallback to localStorage
      if (this.useLocalStorageFallback) {
        const key = `abcd_excel_${userId}_${date}`;
        return localStorage.getItem(key) !== null;
      }

      return false;
    } catch (error) {
      // If Supabase fails, check localStorage
      if (this.useLocalStorageFallback) {
        const key = `abcd_excel_${userId}_${date}`;
        return localStorage.getItem(key) !== null;
      }
      return false;
    }
  }

  // =============================================================================
  // HOUR ENTRIES MANAGEMENT
  // =============================================================================

  /**
   * Get hour entry data for a specific user and date
   * @param {string} userId - User ID
   * @param {string} date - Date string
   * @returns {Promise<Object|null>} Hour entry data or null
   */
  async getHourEntry(userId, date) {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('hour_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (!error && data) {
        this.log('✅ Hour entry fetched from Supabase', { date });
        return {
          userId: data.user_id,
          date: data.date,
          planetSelections: data.planet_selections,
          savedAt: data.saved_at
        };
      }

      // Fallback to localStorage
      if (this.useLocalStorageFallback) {
        const hourEntry = this.getLocalStorageHourEntry(userId, date);
        if (hourEntry) {
          this.log('📦 Hour entry fetched from localStorage', { date });
        }
        return hourEntry;
      }

      return null;
    } catch (error) {
      this.log('❌ Error fetching hour entry, using localStorage fallback', error.message);
      if (this.useLocalStorageFallback) {
        return this.getLocalStorageHourEntry(userId, date);
      }
      throw error;
    }
  }

  /**
   * Save hour entry data for a specific user and date
   * @param {string} userId - User ID
   * @param {string} date - Date string
   * @param {Object} hourEntryData - Hour entry data with planetSelections
   */
  async saveHourEntry(userId, date, hourEntryData) {
    try {
      // Save to Supabase
      const record = {
        user_id: userId,
        date: date,
        planet_selections: hourEntryData.planetSelections
      };

      const { error } = await supabase
        .from('hour_entries')
        .upsert(record, { onConflict: 'user_id,date' });

      if (!error) {
        this.log('✅ Hour entry saved to Supabase', { date });
        // Also save to localStorage for fallback
        this.saveLocalStorageHourEntry(userId, date, hourEntryData);
        return;
      }

      // If Supabase fails, save to localStorage
      this.saveLocalStorageHourEntry(userId, date, hourEntryData);
      this.log('📦 Hour entry saved to localStorage (Supabase failed)', { date });
    } catch (error) {
      this.log('❌ Error saving hour entry, using localStorage', error.message);
      this.saveLocalStorageHourEntry(userId, date, hourEntryData);
    }
  }

  getLocalStorageHourEntry(userId, date) {
    try {
      const key = `abcd_hourEntry_${userId}_${date}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      this.log('❌ Error reading localStorage hour entry', e.message);
    }
    return null;
  }

  saveLocalStorageHourEntry(userId, date, hourEntryData) {
    try {
      const key = `abcd_hourEntry_${userId}_${date}`;
      const payload = {
        userId: userId,
        date: date,
        planetSelections: hourEntryData.planetSelections,
        savedAt: hourEntryData.savedAt || new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
      this.log('❌ Error saving localStorage hour entry', e.message);
    }
  }

  /**
   * Check if hour entry exists for a specific date
   * @param {string} userId - User ID
   * @param {string} date - Date string
   * @returns {Promise<boolean>} True if hour entry exists
   */
  async hasHourEntry(userId, date) {
    try {
      // Check Supabase first
      const { data, error } = await supabase
        .from('hour_entries')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (!error && data) {
        return true;
      }

      // Fallback to localStorage
      if (this.useLocalStorageFallback) {
        const key = `abcd_hourEntry_${userId}_${date}`;
        return localStorage.getItem(key) !== null;
      }

      return false;
    } catch (error) {
      // If Supabase fails, check localStorage
      if (this.useLocalStorageFallback) {
        const key = `abcd_hourEntry_${userId}_${date}`;
        return localStorage.getItem(key) !== null;
      }
      return false;
    }
  }

  // =============================================================================
  // DATA DELETION
  // =============================================================================

  /**
   * Delete all data for a specific date
   * @param {string} userId - User ID
   * @param {string} date - Date string
   */
  async deleteDataForDate(userId, date) {
    try {
      // Delete from Supabase
      const deletePromises = [
        supabase.from('user_dates').delete().eq('user_id', userId).eq('date', date),
        supabase.from('excel_data').delete().eq('user_id', userId).eq('date', date),
        supabase.from('hour_entries').delete().eq('user_id', userId).eq('date', date)
      ];

      await Promise.all(deletePromises);
      this.log('✅ Data deleted from Supabase', { date });

      // Also delete from localStorage
      this.deleteLocalStorageDataForDate(userId, date);
    } catch (error) {
      this.log('❌ Error deleting from Supabase, cleaning localStorage', error.message);
      this.deleteLocalStorageDataForDate(userId, date);
    }
  }

  deleteLocalStorageDataForDate(userId, date) {
    try {
      localStorage.removeItem(`abcd_excel_${userId}_${date}`);
      localStorage.removeItem(`abcd_hourEntry_${userId}_${date}`);
      localStorage.removeItem(`abcd_indexData_${userId}_${date}`);
      this.log('✅ Local storage data deleted', { date });
    } catch (e) {
      this.log('❌ Error deleting localStorage data', e.message);
    }
  }

  // =============================================================================
  // MIGRATION UTILITIES
  // =============================================================================

  /**
   * Migrate all localStorage data to Supabase for a user
   * @param {string} userId - User ID
   */
  async migrateUserData(userId) {
    this.log('🔄 Starting migration for user', userId);
    
    try {
      // 1. Migrate dates
      const dates = this.getLocalStorageDates(userId);
      if (dates.length > 0) {
        await this.saveDates(userId, dates);
        this.log('✅ Migrated dates', dates);
      }

      // 2. Migrate Excel data for each date
      for (const date of dates) {
        const excelData = this.getLocalStorageExcelData(userId, date);
        if (excelData) {
          await this.saveExcelData(userId, date, excelData);
          this.log('✅ Migrated Excel data', { date });
        }

        const hourEntry = this.getLocalStorageHourEntry(userId, date);
        if (hourEntry) {
          await this.saveHourEntry(userId, date, hourEntry);
          this.log('✅ Migrated hour entry', { date });
        }
      }

      this.log('🎉 Migration completed for user', userId);
      return { success: true, migratedDates: dates.length };
    } catch (error) {
      this.log('❌ Migration failed', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export all user data to JSON for backup
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Complete user data
   */
  async exportUserData(userId) {
    const dates = await this.getDates(userId);
    const exportData = {
      userId,
      exportedAt: new Date().toISOString(),
      dates,
      excelData: {},
      hourEntries: {}
    };

    for (const date of dates) {
      const excel = await this.getExcelData(userId, date);
      const hourEntry = await this.getHourEntry(userId, date);
      
      if (excel) exportData.excelData[date] = excel;
      if (hourEntry) exportData.hourEntries[date] = hourEntry;
    }

    return exportData;
  }
}

// Create and export singleton instance
export const dataService = new DataService();

// Export the class for direct instantiation if needed
export { DataService };

// Legacy exports for backward compatibility
export const fetchUserData = async (userId) => {
  // This function can be updated to use the new DataService if needed
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError) throw userError;

  const { data: hrData, error: hrError } = await supabase
    .from('hr_data')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (hrError) throw hrError;

  return {
    user: userData,
    hrData: hrData || []
  };
};

export const saveUserData = async (userId, newData) => {
  if (newData.length === 0) return;

  const dates = [...new Set(newData.map(d => d.date))];
  if (dates.length > 0) {
    const { error: deleteError } = await supabase
      .from('hr_data')
      .delete()
      .eq('user_id', userId)
      .in('date', dates);

    if (deleteError) throw deleteError;
  }

  const { error: insertError } = await supabase
    .from('hr_data')
    .insert(newData);

  if (insertError) throw insertError;

  await new Promise(resolve => setTimeout(resolve, 500));
};