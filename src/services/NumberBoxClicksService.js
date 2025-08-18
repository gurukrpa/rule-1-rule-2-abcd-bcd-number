/**
 * Number Box Clicks Database Service
 * Manages persistence of user interactions with 1-12 number boxes in Rule1Page_Enhanced
 * REFACTORED: Now uses topic_clicks table for all data
 */

import { supabase } from '../supabaseClient.js';

class NumberBoxClicksService {
  constructor() {
    console.log('🎯 NumberBoxClicksService initialized - using topic_clicks table');
  }

  /**
   * Save or update a number box click
   * @param {string} userId - User ID
   * @param {string} setName - Topic/set name (e.g., "D-1 Set-1 Matrix")
   * @param {string} dateKey - Date key (YYYY-MM-DD format)
   * @param {number} numberValue - Number clicked (1-12)
   * @param {number} hrNumber - HR number (1-12)
   * @param {boolean} isClicked - Whether the number box is clicked
   * @param {boolean} isPresent - Whether the number was found in the topic data
   */
  async saveNumberBoxClick(userId, setName, dateKey, numberValue, hrNumber, isClicked, isPresent) {
    try {
      console.log(`💾 [NumberBoxClicks] Saving click:`, {
        userId, setName, dateKey, numberValue, hrNumber, isClicked, isPresent
      });

      const hour = `HR${hrNumber}`;

      if (isClicked) {
        // Insert the click into topic_clicks
        const { data, error } = await supabase
          .from('topic_clicks')
          .upsert({
            user_id: userId,
            topic_name: setName,
            date_key: dateKey,
            hour: hour,
            clicked_number: numberValue,
            is_matched: isPresent,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,topic_name,date_key,hour,clicked_number'
          })
          .select()
          .maybeSingle();

        if (error) throw error;
        console.log(`✅ [NumberBoxClicks] Click saved successfully`);
        return data;
      } else {
        // Remove the click from topic_clicks
        const { error } = await supabase
          .from('topic_clicks')
          .delete()
          .eq('user_id', userId)
          .eq('topic_name', setName)
          .eq('date_key', dateKey)
          .eq('hour', hour)
          .eq('clicked_number', numberValue);

        if (error) throw error;
        console.log(`✅ [NumberBoxClicks] Click removed successfully`);
        return null;
      }
    } catch (error) {
      console.error('❌ [NumberBoxClicks] Error saving click:', error);
      throw error;
    }
  }

  /**
   * Get all number box clicks for a user, date, and HR
   * @param {string} userId - User ID
   * @param {string} dateKey - Date key (YYYY-MM-DD format)
   * @param {number} hrNumber - HR number (1-12)
   * @returns {Promise<Object>} Object with click states keyed by setName_dateKey_number_HRx format
   */
  async getNumberBoxClicks(userId, dateKey, hrNumber) {
    try {
      console.log(`📥 [NumberBoxClicks] Loading clicks for:`, { userId, dateKey, hrNumber });

      const hour = `HR${hrNumber}`;
      const { data, error } = await supabase
        .from('topic_clicks')
        .select('*')
        .eq('user_id', userId)
        .eq('date_key', dateKey)
        .eq('hour', hour);

      if (error) throw error;

      // Convert to the format expected by Rule1Page_Enhanced
      const clickedNumbers = {};
      const numberPresenceStatus = {};

      data.forEach(click => {
        const boxKey = `${click.topic_name}_${click.date_key}_${click.clicked_number}_${click.hour}`;
        clickedNumbers[boxKey] = true; // All records in topic_clicks represent clicked numbers
        numberPresenceStatus[boxKey] = click.is_matched;
      });

      console.log(`✅ [NumberBoxClicks] Loaded ${data.length} clicks`);
      return { clickedNumbers, numberPresenceStatus };
    } catch (error) {
      console.error('❌ [NumberBoxClicks] Error loading clicks:', error);
      return { clickedNumbers: {}, numberPresenceStatus: {} };
    }
  }

  /**
   * Get all number box clicks for a user and date across all HRs
   * @param {string} userId - User ID
   * @param {string} dateKey - Date key (YYYY-MM-DD format)
   * @returns {Promise<Object>} Object with click states keyed by setName_dateKey_number_HRx format
   */
  async getAllNumberBoxClicksForDate(userId, dateKey) {
    try {
      console.log(`📥 [NumberBoxClicks] Loading all clicks for date:`, { userId, dateKey });

      const { data, error } = await supabase
        .from('topic_clicks')
        .select('*')
        .eq('user_id', userId)
        .eq('date_key', dateKey);

      if (error) throw error;

      // Convert to the format expected by Rule1Page_Enhanced
      const clickedNumbers = {};
      const numberPresenceStatus = {};

      data.forEach(click => {
        const boxKey = `${click.topic_name}_${click.date_key}_${click.clicked_number}_${click.hour}`;
        clickedNumbers[boxKey] = true; // All records in topic_clicks represent clicked numbers
        numberPresenceStatus[boxKey] = click.is_matched;
      });

      console.log(`✅ [NumberBoxClicks] Loaded ${data.length} clicks for all HRs`);
      return { clickedNumbers, numberPresenceStatus };
    } catch (error) {
      console.error('❌ [NumberBoxClicks] Error loading clicks for date:', error);
      return { clickedNumbers: {}, numberPresenceStatus: {} };
    }
  }

  /**
   * Delete number box click
   * @param {string} userId - User ID
   * @param {string} setName - Topic/set name
   * @param {string} dateKey - Date key (YYYY-MM-DD format)
   * @param {number} numberValue - Number clicked (1-12)
   * @param {number} hrNumber - HR number (1-12)
   */
  async deleteNumberBoxClick(userId, setName, dateKey, numberValue, hrNumber) {
    try {
      console.log(`🗑️ [NumberBoxClicks] Deleting click:`, {
        userId, setName, dateKey, numberValue, hrNumber
      });

      const hour = `HR${hrNumber}`;
      const { error } = await supabase
        .from('topic_clicks')
        .delete()
        .eq('user_id', userId)
        .eq('topic_name', setName)
        .eq('date_key', dateKey)
        .eq('clicked_number', numberValue)
        .eq('hour', hour);

      if (error) throw error;

      console.log(`✅ [NumberBoxClicks] Click deleted successfully`);
    } catch (error) {
      console.error('❌ [NumberBoxClicks] Error deleting click:', error);
      throw error;
    }
  }

  /**
   * Delete all number box clicks for a specific date
   * @param {string} userId - User ID
   * @param {string} dateKey - Date key (YYYY-MM-DD format)
   */
  async deleteAllClicksForDate(userId, dateKey) {
    try {
      console.log(`🗑️ [NumberBoxClicks] Deleting all clicks for date:`, { userId, dateKey });

      const { error } = await supabase
        .from('topic_clicks')
        .delete()
        .eq('user_id', userId)
        .eq('date_key', dateKey);

      if (error) throw error;

      console.log(`✅ [NumberBoxClicks] All clicks deleted for date`);
    } catch (error) {
      console.error('❌ [NumberBoxClicks] Error deleting clicks for date:', error);
      throw error;
    }
  }

  /**
   * Get statistics about number box clicks
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Statistics object
   */
  async getClickStatistics(userId) {
    try {
      const { data, error } = await supabase
        .from('topic_clicks')
        .select('date_key, hour, is_matched')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        totalClicks: data.length,
        clickedCount: data.length, // All records in topic_clicks represent clicked numbers
        presentCount: data.filter(click => click.is_matched).length,
        dateCount: new Set(data.map(click => click.date_key)).size,
        hrCount: new Set(data.map(click => click.hour)).size
      };

      return stats;
    } catch (error) {
      console.error('❌ [NumberBoxClicks] Error getting statistics:', error);
      return {
        totalClicks: 0,
        clickedCount: 0,
        presentCount: 0,
        dateCount: 0,
        hrCount: 0
      };
    }
  }

  /**
   * Clear all number box clicks for a user
   * @param {string} userId - User ID
   */
  async clearAllClicks(userId) {
    try {
      console.log(`🧹 [NumberBoxClicks] Clearing all clicks for user:`, userId);

      const { error } = await supabase
        .from('topic_clicks')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      console.log(`✅ [NumberBoxClicks] All clicks cleared for user`);
    } catch (error) {
      console.error('❌ [NumberBoxClicks] Error clearing all clicks:', error);
      throw error;
    }
  }

  /**
   * Health check for the service
   */
  async checkConnection() {
    try {
      const { data, error } = await supabase
        .from('topic_clicks')
        .select('count(*)')
        .limit(1);

      if (error) throw error;
      console.log('✅ [NumberBoxClicks] Database connection healthy');
      return true;
    } catch (error) {
      console.error('❌ [NumberBoxClicks] Database connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const numberBoxClicksService = new NumberBoxClicksService();
export default numberBoxClicksService;
