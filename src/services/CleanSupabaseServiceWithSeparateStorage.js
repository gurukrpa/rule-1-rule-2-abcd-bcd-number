/**
 * Enhanced CleanSupabaseService with Page-Specific Date Storage
 * This provides true independence between UserData and ABCD pages
 */

import { supabase } from '../supabaseClient';

/**
 * Page contexts for separate date storage
 */
const PAGE_CONTEXTS = {
  USERDATA: 'userdata',
  ABCD: 'abcd'
};

class CleanSupabaseServiceWithSeparateStorage {
  constructor() {
    this.supabase = supabase;
    console.log('🚀 CleanSupabaseService with separate page storage initialized');
  }

  /**
   * Get user dates for a specific page context
   * @param {string} userId - User ID
   * @param {string} pageContext - Page context (USERDATA or ABCD)
   * @returns {Promise<string[]>} Array of date strings
   */
  async getUserDates(userId, pageContext = PAGE_CONTEXTS.USERDATA) {
    try {
      const tableName = this._getTableName(pageContext);
      const { data, error } = await this.supabase
        .from(tableName)
        .select('dates')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const dates = data?.dates || [];
      console.log(`📅 [${pageContext.toUpperCase()}] Loaded ${dates.length} dates for user ${userId}`);
      return dates;
    } catch (error) {
      console.error(`❌ Error loading dates for ${pageContext}:`, error);
      return [];
    }
  }

  /**
   * Save user dates for a specific page context
   * @param {string} userId - User ID
   * @param {string[]} dates - Array of date strings
   * @param {string} pageContext - Page context (USERDATA or ABCD)
   */
  async saveUserDates(userId, dates, pageContext = PAGE_CONTEXTS.USERDATA) {
    try {
      const tableName = this._getTableName(pageContext);
      const { data, error } = await this.supabase
        .from(tableName)
        .upsert({
          user_id: userId,
          dates: dates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log(`✅ [${pageContext.toUpperCase()}] Saved ${dates.length} dates for user ${userId}`);
      return data;
    } catch (error) {
      console.error(`❌ Error saving dates for ${pageContext}:`, error);
      throw error;
    }
  }

  /**
   * Add a date for a specific page context
   * @param {string} userId - User ID
   * @param {string} date - Date string to add
   * @param {string} pageContext - Page context (USERDATA or ABCD)
   */
  async addUserDate(userId, date, pageContext = PAGE_CONTEXTS.USERDATA) {
    try {
      const currentDates = await this.getUserDates(userId, pageContext);
      if (!currentDates.includes(date)) {
        const newDates = [...currentDates, date].sort();
        await this.saveUserDates(userId, newDates, pageContext);
        console.log(`✅ [${pageContext.toUpperCase()}] Added date ${date} for user ${userId}`);
      }
    } catch (error) {
      console.error(`❌ Error adding date for ${pageContext}:`, error);
      throw error;
    }
  }

  /**
   * Remove a date for a specific page context
   * @param {string} userId - User ID
   * @param {string} date - Date string to remove
   * @param {string} pageContext - Page context (USERDATA or ABCD)
   */
  async removeUserDate(userId, date, pageContext = PAGE_CONTEXTS.USERDATA) {
    try {
      const currentDates = await this.getUserDates(userId, pageContext);
      const newDates = currentDates.filter(d => d !== date);
      await this.saveUserDates(userId, newDates, pageContext);
      
      // Also delete associated data for this page context
      if (pageContext === PAGE_CONTEXTS.ABCD) {
        await this.deleteExcelData(userId, date);
        await this.deleteHourEntry(userId, date);
      }
      
      console.log(`✅ [${pageContext.toUpperCase()}] Removed date ${date} for user ${userId}`);
    } catch (error) {
      console.error(`❌ Error removing date for ${pageContext}:`, error);
      throw error;
    }
  }

  /**
   * Get the appropriate table name for the page context
   * @param {string} pageContext - Page context
   * @returns {string} Table name
   */
  _getTableName(pageContext) {
    switch (pageContext) {
      case PAGE_CONTEXTS.USERDATA:
        return 'user_dates_userdata';
      case PAGE_CONTEXTS.ABCD:
        return 'user_dates_abcd';
      default:
        return 'user_dates'; // Fallback to original table
    }
  }

  // Pass-through methods for backward compatibility
  async hasExcelData(userId, date) {
    try {
      const { data, error } = await this.supabase
        .from('excel_data')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      return !error && data;
    } catch (error) {
      return false;
    }
  }

  async getExcelData(userId, date) {
    try {
      const { data, error } = await this.supabase
        .from('excel_data')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting Excel data:', error);
      return null;
    }
  }

  async saveExcelData(userId, date, data) {
    try {
      const { error } = await this.supabase
        .from('excel_data')
        .upsert({
          user_id: userId,
          date: date,
          data: data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;
      console.log('✅ Excel data saved');
    } catch (error) {
      console.error('❌ Error saving Excel data:', error);
      throw error;
    }
  }

  async deleteExcelData(userId, date) {
    try {
      const { error } = await this.supabase
        .from('excel_data')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

      if (error) throw error;
      console.log('✅ Excel data deleted');
    } catch (error) {
      console.error('❌ Error deleting Excel data:', error);
      throw error;
    }
  }

  async hasHourEntry(userId, date) {
    try {
      const { data, error } = await this.supabase
        .from('hour_entries')
        .select('id')
        .eq('user_id', userId)
        .eq('date_key', date)
        .single();

      return !error && data;
    } catch (error) {
      return false;
    }
  }

  async getHourEntry(userId, date) {
    try {
      const { data, error } = await this.supabase
        .from('hour_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date_key', date)
        .single();

      if (error) throw error;
      return data.hour_data;
    } catch (error) {
      console.error('Error getting hour entry:', error);
      return null;
    }
  }

  async saveHourEntry(userId, date, planetSelections) {
    try {
      const { error } = await this.supabase
        .from('hour_entries')
        .upsert({
          user_id: userId,
          date_key: date,
          hour_data: { planetSelections },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date_key'
        });

      if (error) throw error;
      console.log('✅ Hour entry saved');
    } catch (error) {
      console.error('❌ Error saving hour entry:', error);
      throw error;
    }
  }

  async deleteHourEntry(userId, date) {
    try {
      const { error } = await this.supabase
        .from('hour_entries')
        .delete()
        .eq('user_id', userId)
        .eq('date_key', date);

      if (error) throw error;
      console.log('✅ Hour entry deleted');
    } catch (error) {
      console.error('❌ Error deleting hour entry:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .order('username', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error getting users:', error);
      return [];
    }
  }

  async createUser(userData) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ User created');
      return data;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }
}

// Export the page contexts for use in components
export { PAGE_CONTEXTS };

// Create and export singleton instance
const cleanSupabaseServiceWithSeparateStorage = new CleanSupabaseServiceWithSeparateStorage();
export default cleanSupabaseServiceWithSeparateStorage;
