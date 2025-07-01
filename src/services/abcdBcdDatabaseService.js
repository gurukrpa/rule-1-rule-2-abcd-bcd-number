// src/services/abcdBcdDatabaseService.js
// Dedicated service for managing ABCD/BCD numbers in Supabase database

import { supabase } from '../supabaseClient';

class AbcdBcdDatabaseService {
  constructor() {
    this.tableName = 'topic_abcd_bcd_numbers';
  }

  /**
   * Get ABCD/BCD numbers for all topics
   * @returns {Promise<Object>} Success/error response with data
   */
  async getAllTopicNumbers() {
    try {
      console.log('🔍 [AbcdBcdDB] Fetching all topic numbers from database...');
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('topic_name, abcd_numbers, bcd_numbers')
        .order('topic_name');

      if (error) {
        console.error('❌ [AbcdBcdDB] Database error:', error);
        return {
          success: false,
          error: `Database error: ${error.message}`,
          data: null
        };
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ [AbcdBcdDB] No topic numbers found in database');
        return {
          success: false,
          error: 'No topic numbers found in database',
          data: null
        };
      }

      // Convert array data to topic mapping object
      const topicMapping = {};
      data.forEach(row => {
        topicMapping[row.topic_name] = {
          abcd: row.abcd_numbers || [],
          bcd: row.bcd_numbers || []
        };
      });

      console.log(`✅ [AbcdBcdDB] Loaded ${data.length} topics from database`);
      
      return {
        success: true,
        data: {
          topicNumbers: topicMapping,
          totalTopics: data.length,
          source: 'Database (topic_abcd_bcd_numbers)',
          lastUpdated: new Date().toISOString()
        },
        error: null
      };

    } catch (error) {
      console.error('💥 [AbcdBcdDB] Service error:', error);
      return {
        success: false,
        error: `Service error: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * Get ABCD/BCD numbers for a specific topic
   * @param {string} topicName - Name of the topic
   * @returns {Promise<Object>} ABCD/BCD numbers for the topic
   */
  async getTopicNumbers(topicName) {
    try {
      console.log(`🔍 [AbcdBcdDB] Fetching numbers for topic: ${topicName}`);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('abcd_numbers, bcd_numbers')
        .eq('topic_name', topicName)
        .single();

      if (error) {
        console.error(`❌ [AbcdBcdDB] Error fetching topic ${topicName}:`, error);
        return { abcd: [], bcd: [] };
      }

      if (!data) {
        console.warn(`⚠️ [AbcdBcdDB] Topic not found: ${topicName}`);
        return { abcd: [], bcd: [] };
      }

      const result = {
        abcd: data.abcd_numbers || [],
        bcd: data.bcd_numbers || []
      };

      console.log(`✅ [AbcdBcdDB] Topic ${topicName}:`, result);
      return result;

    } catch (error) {
      console.error(`💥 [AbcdBcdDB] Error fetching topic ${topicName}:`, error);
      return { abcd: [], bcd: [] };
    }
  }

  /**
   * Update ABCD/BCD numbers for a specific topic
   * @param {string} topicName - Name of the topic
   * @param {Array} abcdNumbers - Array of ABCD numbers
   * @param {Array} bcdNumbers - Array of BCD numbers
   * @param {string} notes - Optional notes about the update
   * @returns {Promise<Object>} Success/error response
   */
  async updateTopicNumbers(topicName, abcdNumbers, bcdNumbers, notes = '') {
    try {
      console.log(`🔄 [AbcdBcdDB] Updating topic: ${topicName}`);
      console.log(`   ABCD: [${abcdNumbers.join(', ')}]`);
      console.log(`   BCD: [${bcdNumbers.join(', ')}]`);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          abcd_numbers: abcdNumbers,
          bcd_numbers: bcdNumbers,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('topic_name', topicName)
        .select();

      if (error) {
        console.error(`❌ [AbcdBcdDB] Error updating topic ${topicName}:`, error);
        return {
          success: false,
          error: `Database error: ${error.message}`
        };
      }

      console.log(`✅ [AbcdBcdDB] Successfully updated topic: ${topicName}`);
      return {
        success: true,
        data: data[0] || null
      };

    } catch (error) {
      console.error(`💥 [AbcdBcdDB] Error updating topic ${topicName}:`, error);
      return {
        success: false,
        error: `Service error: ${error.message}`
      };
    }
  }

  /**
   * Check if a number is an ABCD number for a topic
   * @param {Object} topicData - Topic data object with abcd/bcd arrays
   * @param {number} number - Number to check
   * @returns {boolean} True if the number is an ABCD number
   */
  isAbcdNumber(topicData, number) {
    if (!topicData || !topicData.abcd) return false;
    return topicData.abcd.includes(number);
  }

  /**
   * Check if a number is a BCD number for a topic
   * @param {Object} topicData - Topic data object with abcd/bcd arrays
   * @param {number} number - Number to check
   * @returns {boolean} True if the number is a BCD number
   */
  isBcdNumber(topicData, number) {
    if (!topicData || !topicData.bcd) return false;
    return topicData.bcd.includes(number);
  }

  /**
   * Get analysis summary from loaded data
   * @param {Object} result - Result from getAllTopicNumbers()
   * @returns {Object} Analysis summary
   */
  getAnalysisSummary(result) {
    if (!result.success || !result.data) {
      return {
        source: 'Database (failed)',
        totalTopics: 0,
        totalAbcdNumbers: 0,
        totalBcdNumbers: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const { topicNumbers } = result.data;
    let totalAbcd = 0;
    let totalBcd = 0;

    Object.values(topicNumbers).forEach(topic => {
      totalAbcd += topic.abcd.length;
      totalBcd += topic.bcd.length;
    });

    return {
      source: result.data.source,
      totalTopics: result.data.totalTopics,
      totalAbcdNumbers: totalAbcd,
      totalBcdNumbers: totalBcd,
      lastUpdated: result.data.lastUpdated
    };
  }

  /**
   * Bulk update multiple topics at once
   * @param {Array} updates - Array of {topicName, abcdNumbers, bcdNumbers, notes}
   * @returns {Promise<Object>} Success/error response
   */
  async bulkUpdateTopics(updates) {
    try {
      console.log(`🔄 [AbcdBcdDB] Bulk updating ${updates.length} topics...`);
      
      const results = [];
      for (const update of updates) {
        const result = await this.updateTopicNumbers(
          update.topicName,
          update.abcdNumbers,
          update.bcdNumbers,
          update.notes
        );
        results.push({ topicName: update.topicName, ...result });
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`✅ [AbcdBcdDB] Bulk update completed: ${successCount}/${updates.length} successful`);
      
      return {
        success: successCount === updates.length,
        results: results,
        summary: `${successCount}/${updates.length} topics updated successfully`
      };

    } catch (error) {
      console.error('💥 [AbcdBcdDB] Bulk update error:', error);
      return {
        success: false,
        error: `Bulk update error: ${error.message}`
      };
    }
  }
}

// Create and export singleton instance
export const abcdBcdDatabaseService = new AbcdBcdDatabaseService();
export default abcdBcdDatabaseService;
