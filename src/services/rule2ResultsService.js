// src/services/rule2ResultsService.js
// Service for managing Rule2 ABCD/BCD results in Supabase

import { supabase } from '../supabaseClient';

export class Rule2ResultsService {
  /**
   * Save or update ABCD/BCD results for a specific user and date
   * @param {string} userId - User ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {number[]} abcdNumbers - Array of ABCD numbers
   * @param {number[]} bcdNumbers - Array of BCD numbers
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  static async saveResults(userId, date, abcdNumbers = [], bcdNumbers = []) {
    try {
      console.log(`📊 [Rule2Results] Saving results for user ${userId}, date ${date}:`, {
        abcdNumbers,
        bcdNumbers
      });

      const { data, error } = await supabase
        .from('rule2_results')
        .upsert({
          user_id: userId,
          date: date,
          abcd_numbers: abcdNumbers,
          bcd_numbers: bcdNumbers
        }, { 
          onConflict: ['user_id', 'date'],
          returning: 'minimal'
        });

      if (error) {
        console.error(`❌ [Rule2Results] Error saving results:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ [Rule2Results] Successfully saved results for ${userId}/${date}`);
      return { success: true, data };

    } catch (err) {
      console.error(`❌ [Rule2Results] Exception saving results:`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch ABCD/BCD results for a specific user and date
   * @param {string} userId - User ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<{success: boolean, data?: {abcd_numbers: number[], bcd_numbers: number[]}, error?: string}>}
   */
  static async getResults(userId, date) {
    try {
      console.log(`🔍 [Rule2Results] Fetching results for user ${userId}, date ${date}`);

      const { data, error } = await supabase
        .from('rule2_results')
        .select('abcd_numbers, bcd_numbers, created_at, updated_at')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - this is normal for dates without analysis
          console.log(`ℹ️ [Rule2Results] No results found for ${userId}/${date}`);
          return { success: true, data: null };
        }
        console.error(`❌ [Rule2Results] Error fetching results:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ [Rule2Results] Found results for ${userId}/${date}:`, data);
      return { success: true, data };

    } catch (err) {
      console.error(`❌ [Rule2Results] Exception fetching results:`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch ABCD/BCD results for multiple dates for a user
   * @param {string} userId - User ID
   * @param {string[]} dates - Array of dates in YYYY-MM-DD format
   * @returns {Promise<{success: boolean, data?: Map<string, {abcd_numbers: number[], bcd_numbers: number[]}>, error?: string}>}
   */
  static async getMultipleResults(userId, dates) {
    try {
      console.log(`🔍 [Rule2Results] Fetching multiple results for user ${userId}, dates:`, dates);

      const { data, error } = await supabase
        .from('rule2_results')
        .select('date, abcd_numbers, bcd_numbers, created_at, updated_at')
        .eq('user_id', userId)
        .in('date', dates);

      if (error) {
        console.error(`❌ [Rule2Results] Error fetching multiple results:`, error);
        return { success: false, error: error.message };
      }

      // Convert to Map for easy lookup
      const resultsMap = new Map();
      if (data) {
        data.forEach(result => {
          resultsMap.set(result.date, {
            abcd_numbers: result.abcd_numbers || [],
            bcd_numbers: result.bcd_numbers || [],
            created_at: result.created_at,
            updated_at: result.updated_at
          });
        });
      }

      console.log(`✅ [Rule2Results] Found ${resultsMap.size} results for ${dates.length} dates`);
      return { success: true, data: resultsMap };

    } catch (err) {
      console.error(`❌ [Rule2Results] Exception fetching multiple results:`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete results for a specific user and date
   * @param {string} userId - User ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async deleteResults(userId, date) {
    try {
      console.log(`🗑️ [Rule2Results] Deleting results for user ${userId}, date ${date}`);

      const { error } = await supabase
        .from('rule2_results')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

      if (error) {
        console.error(`❌ [Rule2Results] Error deleting results:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ [Rule2Results] Successfully deleted results for ${userId}/${date}`);
      return { success: true };

    } catch (err) {
      console.error(`❌ [Rule2Results] Exception deleting results:`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get all dates that have results for a user
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, data?: string[], error?: string}>}
   */
  static async getResultDates(userId) {
    try {
      console.log(`📅 [Rule2Results] Fetching all result dates for user ${userId}`);

      const { data, error } = await supabase
        .from('rule2_results')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) {
        console.error(`❌ [Rule2Results] Error fetching result dates:`, error);
        return { success: false, error: error.message };
      }

      const dates = data ? data.map(row => row.date) : [];
      console.log(`✅ [Rule2Results] Found ${dates.length} dates with results`);
      return { success: true, data: dates };

    } catch (err) {
      console.error(`❌ [Rule2Results] Exception fetching result dates:`, err);
      return { success: false, error: err.message };
    }
  }
}
