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
    this.log('🔍 getDates called for user:', userId);
    
    try {
      // ✅ SINGLE SOURCE OF TRUTH: Only read from user_dates table (JSONB array)
      // This prevents deleted dates from being resurrected from other tables
      const { data: userDatesData, error: userDatesError } = await supabase
        .from('user_dates')
        .select('dates')
        .eq('user_id', userId)
        .single();

      if (!userDatesError && userDatesData && userDatesData.dates && Array.isArray(userDatesData.dates)) {
        this.log('✅ Dates fetched from user_dates table', userDatesData.dates);
        return userDatesData.dates.sort((a, b) => new Date(b) - new Date(a));
      }

      // If no user_dates record exists, return empty array
      if (userDatesError && userDatesError.code === 'PGRST116') {
        this.log('📭 No user_dates record found - returning empty array');
        return [];
      }

      // If user_dates exists but dates array is empty, return empty array
      if (userDatesData && (!userDatesData.dates || userDatesData.dates.length === 0)) {
        this.log('📭 User dates array is empty - returning empty array');
        return [];
      }

      this.log('📭 No valid dates found');
      return [];
    } catch (error) {
      this.log('❌ Error fetching dates from user_dates table', error.message);
      // ✅ NO FALLBACKS: Don't resurrect deleted dates from other sources
      return [];
    }
  }

  /**
   * Save dates for a user
   * @param {string} userId - User ID
   * @param {string[]} dates - Array of date strings
   */
  async saveDates(userId, dates) {
    this.log('💾 Saving dates to Supabase:', { userId, dates });
    
    try {
      // Save to Supabase using upsert to handle both insert and update
      const { data, error } = await supabase
        .from('user_dates')
        .upsert([
          {
            user_id: userId,
            dates: dates,  // JSONB array
            updated_at: new Date().toISOString()
          }
        ], { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (!error) {
        this.log('✅ Dates saved to Supabase successfully', dates);
        // Also save to localStorage for fallback
        this.saveLocalStorageDates(userId, dates);
        return data;
      } else {
        this.log('❌ Error saving to Supabase, falling back to localStorage', error.message);
        this.saveLocalStorageDates(userId, dates);
        return null;
      }
    } catch (error) {
      this.log('❌ Exception saving dates, using localStorage fallback', error.message);
      this.saveLocalStorageDates(userId, dates);
      return null;
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
      // Check Supabase first - use correct table and column names
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
        .from('hour_entry')
        .select('*')
        .eq('user_id', userId)
        .eq('date_key', date)
        .single();

      if (!error && data) {
        this.log('✅ Hour entry fetched from Supabase', { date });
        return {
          userId: data.user_id,
          date: data.date_key,
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
        date_key: date,
        planet_selections: hourEntryData.planetSelections
      };

      const { error } = await supabase
        .from('hour_entry')
        .upsert(record, { onConflict: 'user_id,date_key' });

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
      // Check Supabase first - use correct table and column names
      const { data, error } = await supabase
        .from('hour_entry')
        .select('id')
        .eq('user_id', userId)
        .eq('date_key', date)
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
   * Delete all data for a specific date from ALL storage locations
   * @param {string} userId - User ID
   * @param {string} date - Date string
   */
  async deleteDataForDate(userId, date) {
    this.log('🗑️ [ENHANCED] Deleting all data for date from ALL storage locations:', { userId, date });
    
    try {
      // Delete from all known Supabase tables where this date might exist
      const deletePromises = [
        // Core ABCD data tables
        supabase.from('excel_data').delete().eq('user_id', userId).eq('date', date),
        supabase.from('hour_entry').delete().eq('user_id', userId).eq('date_key', date),
        supabase.from('hour_entries').delete().eq('user_id', userId).eq('date_key', date),
        
        // UserData component tables (hr_data, house) - THESE WERE MISSING!
        supabase.from('hr_data').delete().eq('user_id', userId).eq('date', date),
        supabase.from('house').delete().eq('user_id', userId).eq('date', date),
        
        // PagesDataService tables - THESE WERE MISSING!
        supabase.from('processed_data').delete().eq('user_id', userId).eq('date', date),
        supabase.from('abcd_sequences').delete().eq('user_id', userId).eq('trigger_date', date),
        
        // Any other potential data tables
        supabase.from('analysis_results').delete().eq('user_id', userId).eq('date', date),
        supabase.from('calculation_cache').delete().eq('user_id', userId).eq('date', date)
      ];

      this.log('🔄 Executing deletion from 9 tables...', { tableCount: deletePromises.length });
      const results = await Promise.allSettled(deletePromises);
      
      // Log results for each table (some tables might not exist, that's OK)
      const tableNames = [
        'excel_data', 'hour_entry', 'hour_entries', 
        'hr_data', 'house', 
        'processed_data', 'abcd_sequences',
        'analysis_results', 'calculation_cache'
      ];
      
      let successCount = 0;
      let errorCount = 0;
      
      results.forEach((result, index) => {
        const tableName = tableNames[index];
        if (result.status === 'fulfilled') {
          this.log(`✅ Deleted from ${tableName}`, { date, affected: result.value?.count || 'unknown' });
          successCount++;
        } else {
          this.log(`⚠️ Could not delete from ${tableName}:`, result.reason?.message || 'Unknown error');
          errorCount++;
        }
      });

      // Delete from localStorage (existing function)
      this.deleteLocalStorageDataForDate(userId, date);
      
      // Clear any additional localStorage keys that might exist
      const additionalLocalStorageKeys = [
        `abcd_analysis_${userId}_${date}`,
        `abcd_cached_${userId}_${date}`,
        `abcd_processed_${userId}_${date}`,
        `rule1_data_${userId}_${date}`,
        `rule2_data_${userId}_${date}`,
        `index_data_${userId}_${date}`
      ];
      
      additionalLocalStorageKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          this.log(`🧹 Cleared additional localStorage: ${key}`);
        } catch (e) {
          this.log(`⚠️ Could not clear localStorage key: ${key}`);
        }
      });

      // ✅ STEP 5: UPDATE user_dates table - Remove the deleted date from JSONB array
      this.log('🔄 Updating user_dates table to remove deleted date from JSONB array...');
      try {
        // First, get current dates for the user
        const { data: currentUserDates, error: fetchError } = await supabase
          .from('user_dates')
          .select('dates')
          .eq('user_id', userId)
          .single();

        if (!fetchError && currentUserDates && currentUserDates.dates) {
          // Remove the deleted date from the array
          const updatedDates = currentUserDates.dates.filter(d => d !== date);
          
          // Update the user_dates table with the new array
          const { error: updateError } = await supabase
            .from('user_dates')
            .update({ 
              dates: updatedDates,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (!updateError) {
            this.log('✅ Successfully removed date from user_dates JSONB array', { 
              date, 
              remainingDates: updatedDates.length 
            });
          } else {
            this.log('⚠️ Error updating user_dates table:', updateError.message);
          }
        } else {
          this.log('ℹ️ No user_dates record found or no dates array - deletion still successful');
        }
      } catch (userDatesError) {
        this.log('⚠️ Error updating user_dates table (deletion from other tables still successful):', userDatesError.message);
      }
      
      this.log('✅ [ENHANCED] Comprehensive data deletion completed', { 
        date, 
        successfulTables: successCount, 
        failedTables: errorCount,
        totalTablesChecked: tableNames.length 
      });
      
    } catch (error) {
      this.log('❌ [ENHANCED] Error during comprehensive deletion', error.message);
      throw error; // Let caller handle the error
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

  // =============================================================================
  // SAMPLE DATA CREATION
  // =============================================================================

  /**
   * Create sample data for testing when no data exists
   * @param {string} userId - User ID
   */
  async createSampleData(userId) {
    this.log('🎲 Creating sample data for user', userId);
    
    // Double-check deletion flag before creating sample data
    const deletionFlag = localStorage.getItem(`abcd_user_deleted_all_${userId}`);
    this.log('⚠️ CREATING SAMPLE DATA - deletion flag check:', { userId, flag: deletionFlag });
    
    if (deletionFlag === 'true') {
      this.log('❌ CRITICAL: Trying to create sample data but deletion flag is set! Aborting.');
      return;
    }
    
    // Create sample dates (last 4 days)
    const today = new Date();
    const sampleDates = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      sampleDates.push(date.toISOString().split('T')[0]);
    }

    // Create proper 30 topics in ascending order as expected by IndexPage
    const topicsInAscendingOrder = [
      'D-1 Set-1 Matrix', 'D-1 Set-2 Matrix',
      'D-3 Set-1 Matrix', 'D-3 Set-2 Matrix', 
      'D-4 Set-1 Matrix', 'D-4 Set-2 Matrix',
      'D-5 Set-1 Matrix', 'D-5 Set-2 Matrix',
      'D-7 Set-1 Matrix', 'D-7 Set-2 Matrix',
      'D-9 Set-1 Matrix', 'D-9 Set-2 Matrix',
      'D-10 Set-1 Matrix', 'D-10 Set-2 Matrix',
      'D-11 Set-1 Matrix', 'D-11 Set-2 Matrix',
      'D-12 Set-1 Matrix', 'D-12 Set-2 Matrix',
      'D-27 Set-1 Matrix', 'D-27 Set-2 Matrix',
      'D-30 Set-1 Matrix', 'D-30 Set-2 Matrix',
      'D-60 Set-1 Matrix', 'D-60 Set-2 Matrix',
      'D-81 Set-1 Matrix', 'D-81 Set-2 Matrix',
      'D-108 Set-1 Matrix', 'D-108 Set-2 Matrix',
      'D-144 Set-1 Matrix', 'D-144 Set-2 Matrix'
    ];

    // All 9 standard elements in exact order expected by IndexPage
    const elementNames = ['Lagna', 'Moon', 'Hora Lagna', 'Ghati Lagna', 'Vighati Lagna', 'Varnada Lagna', 'Sree Lagna', 'Pranapada Lagna', 'Indu Lagna'];
    const elementCodes = ['as', 'mo', 'hl', 'gl', 'vig', 'var', 'sl', 'pp', 'in'];
    const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];

    // Build all 30 sets with realistic astrological data
    const allSets = {};
    
    topicsInAscendingOrder.forEach((topicName, topicIndex) => {
      const setData = {};
      
      elementNames.forEach((elementName, elemIndex) => {
        const elementCode = elementCodes[elemIndex];
        const planetData = {};
        
        planets.forEach((planet, planetIndex) => {
          // Generate realistic numbers that vary by topic, element, and planet
          const baseNumber = (topicIndex * 3) + (elemIndex * 5) + (planetIndex * 2) + 1;
          const signNumber = (baseNumber + topicIndex + elemIndex) % 12 + 1;
          const degreeNumber = (baseNumber * 2 + planetIndex) % 30 + 1;
          
          // Create realistic astrological data format: as-7/su-(12 Sc 50)
          planetData[planet] = `${elementCode}-${baseNumber}/${planet.toLowerCase()}-(${signNumber} Sc ${degreeNumber})`;
        });
        
        setData[elementName] = planetData;
      });
      
      allSets[topicName] = setData;
    });

    // Sample Excel data structure with all 30 topics
    const sampleExcelData = {
      fileName: 'sample_30_topics.xlsx',
      data: {
        sets: allSets
      }
    };

    // Sample hour entry data with all 24 hours and realistic planet selections
    const sampleHourEntry = {
      planetSelections: {
        '1': 'Su', '2': 'Mo', '3': 'Ma', '4': 'Me', '5': 'Ju', '6': 'Ve', 
        '7': 'Sa', '8': 'Ra', '9': 'Ke', '10': 'Su', '11': 'Mo', '12': 'Ma',
        '13': 'Me', '14': 'Ju', '15': 'Ve', '16': 'Sa', '17': 'Ra', '18': 'Ke',
        '19': 'Su', '20': 'Mo', '21': 'Ma', '22': 'Me', '23': 'Ju', '24': 'Ve'
      }
    };

    // Save sample data for each date
    for (const date of sampleDates) {
      // Create slightly different data for each date by varying numbers
      const dateOffset = sampleDates.indexOf(date);
      const modifiedExcelData = {
        ...sampleExcelData,
        data: {
          sets: {}
        }
      };

      // Modify numbers for each date to create unique data per date
      Object.entries(sampleExcelData.data.sets).forEach(([topicName, topicData]) => {
        modifiedExcelData.data.sets[topicName] = {};
        Object.entries(topicData).forEach(([elementName, planetData]) => {
          modifiedExcelData.data.sets[topicName][elementName] = {};
          Object.entries(planetData).forEach(([planet, value]) => {
            // Add date offset to numbers to make them unique per date
            const modifiedValue = value.replace(/(\d+)/g, (match) => {
              const newNum = parseInt(match) + dateOffset;
              return String(newNum > 50 ? newNum - 50 : newNum); // Keep numbers reasonable
            });
            modifiedExcelData.data.sets[topicName][elementName][planet] = modifiedValue;
          });
        });
      });

      await this.saveExcelData(userId, date, modifiedExcelData);
      await this.saveHourEntry(userId, date, sampleHourEntry);
    }

    // Save dates list
    await this.saveDates(userId, sampleDates);
    
    this.log('✅ Sample data created successfully', { userId, dates: sampleDates });
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