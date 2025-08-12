import { supabase } from '../supabaseClient';

/**
 * DataService - Unified data access layer for ABCD-BCD Number application
 * Provides localStorage fallback for all operations during migration phase
 */
class DataService {
  constructor() {
    this.useLocalStorageFallback = false; // Disabled - Supabase only
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
        return data;
      } else {
        this.log('❌ Error saving to Supabase', error.message);
        throw error;
      }
    } catch (error) {
      this.log('❌ Exception saving dates', error.message);
      throw error;
      return null;
    }
  }

  // =============================================================================
  // MIGRATION UTILITIES
  // =============================================================================

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
      // Supabase only - no fallback
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

      return null;
    } catch (error) {
      this.log('❌ Error fetching Excel data', error.message);
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
      // Save to Supabase only
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
        return;
      }

      // If Supabase fails, throw error
      throw new Error(`Failed to save Excel data: ${error.message}`);
    } catch (error) {
      this.log('❌ Error saving Excel data', error.message);
      throw error;
    }
  }

  // =============================================================================
  // DATA DELETION
  // =============================================================================

  /**
   * Check if Excel data exists for a specific date
   * @param {string} userId - User ID
   * @param {string} date - Date string
   * @returns {Promise<boolean>} True if Excel data exists
   */
  async hasExcelData(userId, date) {
    try {
      // Check Supabase only - use count to avoid single() errors
      const { count, error } = await supabase
        .from('excel_data')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date', date);

      if (!error && count > 0) {
        this.log(`📊 Excel data check: EXISTS in Supabase`, { userId, date, count });
        return true;
      }

      this.log(`📊 Excel data check: NOT FOUND`, { userId, date });
      return false;

    } catch (error) {
      this.log('❌ Excel data check failed:', error.message);
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
      // Supabase only - no fallback
      const { data, error } = await supabase
        .from('hour_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date_key', date)
        .single();

      if (!error && data) {
        this.log('✅ Hour entry fetched from Supabase', { date });
        return {
          userId: data.user_id,
          date: data.date_key,
          planetSelections: data.hour_data?.planetSelections || {},
          savedAt: data.hour_data?.savedAt || data.created_at
        };
      }

      return null;
    } catch (error) {
      this.log('❌ Error fetching hour entry', error.message);
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
      // Save to Supabase only
      const record = {
        user_id: userId,
        date_key: date,
        hour_data: {
          planetSelections: hourEntryData.planetSelections,
          userId: userId,
          date: date,
          savedAt: hourEntryData.savedAt || new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('hour_entries')
        .upsert(record, { onConflict: 'user_id,date_key' });

      if (!error) {
        this.log('✅ Hour entry saved to Supabase', { date });
        return;
      }

      // If Supabase fails, throw error
      throw new Error(`Failed to save hour entry: ${error.message}`);
    } catch (error) {
      this.log('❌ Error saving hour entry', error.message);
      throw error;
    }
  }

  // =============================================================================
  // DATA DELETION
  // =============================================================================

  /**
   * Check if hour entry exists for a specific date
   * @param {string} userId - User ID
   * @param {string} date - Date string
   * @returns {Promise<boolean>} True if hour entry exists
   */
  async hasHourEntry(userId, date) {
    try {
      // Check Supabase only - use count to avoid single() errors
      const { count, error } = await supabase
        .from('hour_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date_key', date);

      if (!error && count > 0) {
        this.log(`⏰ Hour Entry check: EXISTS in Supabase`, { userId, date, count });
        return true;
      }

      this.log(`⏰ Hour Entry check: NOT FOUND`, { userId, date });
      return false;

    } catch (error) {
      this.log('❌ Hour Entry check failed:', error.message);
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
    this.log('🗑️ [COMPREHENSIVE] Deleting all data for date from ALL storage locations:', { userId, date });
    
    try {
      // Delete from ALL known Supabase tables where this date might exist
      const deletePromises = [
        // Core ABCD data tables
        supabase.from('excel_data').delete().eq('user_id', userId).eq('date', date),
        supabase.from('hour_entries').delete().eq('user_id', userId).eq('date_key', date),
        supabase.from('hour_entries').delete().eq('user_id', userId).eq('date_key', date),
        
        // UserData component tables (hr_data, house)
        supabase.from('hr_data').delete().eq('user_id', userId).eq('date', date),
        supabase.from('house').delete().eq('user_id', userId).eq('date', date),
        
        // PagesDataService tables  
        supabase.from('processed_data').delete().eq('user_id', userId).eq('date', date),
        supabase.from('abcd_sequences').delete().eq('user_id', userId).eq('trigger_date', date),
        supabase.from('abcd_sequences').delete().eq('user_id', userId).eq('a_date', date),
        supabase.from('abcd_sequences').delete().eq('user_id', userId).eq('b_date', date),
        supabase.from('abcd_sequences').delete().eq('user_id', userId).eq('c_date', date),
        supabase.from('abcd_sequences').delete().eq('user_id', userId).eq('d_date', date),
        
        // Rule2 analysis results
        supabase.from('rule2_results').delete().eq('user_id', userId).eq('date', date),
        
        // General analysis and cache tables
        supabase.from('analysis_results').delete().eq('user_id', userId).eq('date', date),
        supabase.from('calculation_cache').delete().eq('user_id', userId).eq('date', date),
        
        // Index page and other potential cache tables
        supabase.from('page_cache').delete().eq('user_id', userId).eq('date', date),
        supabase.from('user_cache').delete().eq('user_id', userId).eq('date', date),
        supabase.from('session_cache').delete().eq('user_id', userId).eq('date', date)
      ];

      this.log('🔄 Executing comprehensive deletion from 17 tables...', { tableCount: deletePromises.length });
      const results = await Promise.allSettled(deletePromises);
      
      // Log results for each table (some tables might not exist, that's OK)
      const tableNames = [
        'excel_data', 'hour_entry', 'hour_entries', 
        'hr_data', 'house', 
        'processed_data', 'abcd_sequences(trigger)', 'abcd_sequences(a_date)', 
        'abcd_sequences(b_date)', 'abcd_sequences(c_date)', 'abcd_sequences(d_date)',
        'rule2_results', 'analysis_results', 'calculation_cache',
        'page_cache', 'user_cache', 'session_cache'
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

      
      this.log('✅ [COMPREHENSIVE] Complete data deletion finished', { 
        date, 
        successfulTables: successCount, 
        failedTables: errorCount,
        totalTablesChecked: tableNames.length 
      });
      
    } catch (error) {
      this.log('❌ [COMPREHENSIVE] Error during complete deletion', error.message);
      throw error; // Let caller handle the error
    }
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