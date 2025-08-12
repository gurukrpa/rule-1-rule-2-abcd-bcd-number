/**
 * Service for handling Rule2 analysis results with topic-specific ABCD/BCD numbers
 * This service manages the enhanced rule2_analysis_results table that stores detailed topic data
 * 
 * Table: rule2_analysis_results
 * - overall_abcd_numbers: Combined ABCD numbers from all topics
 * - overall_bcd_numbers: Combined BCD numbers from all topics  
 * - topic_numbers: JSON object with topic-specific ABCD/BCD numbers
 *   Format: {"D-1 Set-1 Matrix": {"abcd": [1,2,4,7,9], "bcd": [5]}, ...}
 */

import { supabase } from '../supabaseClient.js';

export class Rule2AnalysisResultsService {
  /**
   * Save Rule2 analysis results with both overall and topic-specific numbers
   * @param {string} userId - User ID
   * @param {string} analysisDate - Analysis date
   * @param {string} triggerDate - Date that triggered the analysis
   * @param {number} selectedHR - Selected HR period
   * @param {Array} overallAbcdNumbers - Combined ABCD numbers from all topics
   * @param {Array} overallBcdNumbers - Combined BCD numbers from all topics
   * @param {Array} topicResults - Array of topic-specific results from Rule2CompactPage
   * @param {Object} sequenceDates - ABCD sequence dates {aDay, bDay, cDay, dDay}
   * @returns {Promise<Object>} Success/error result
   */
  static async saveAnalysisResults(
    userId, 
    analysisDate, 
    triggerDate, 
    selectedHR,
    overallAbcdNumbers = [], 
    overallBcdNumbers = [],
    topicResults = [],
    sequenceDates = {}
  ) {
    try {
      console.log(`🔄 [Rule2AnalysisResults] Saving analysis results for ${userId} on ${analysisDate}`);
      console.log(`📊 [Rule2AnalysisResults] Overall numbers - ABCD: [${overallAbcdNumbers.join(', ')}], BCD: [${overallBcdNumbers.join(', ')}]`);
      console.log(`📊 [Rule2AnalysisResults] Topic results: ${topicResults.length} topics`);

      // Build topic_numbers JSON object
      const topicNumbers = {};
      topicResults.forEach(result => {
        topicNumbers[result.setName] = {
          abcd: result.abcdNumbers || [],
          bcd: result.bcdNumbers || []
        };
      });

      // Log sample topic data for verification
      const sampleTopics = Object.keys(topicNumbers).slice(0, 3);
      sampleTopics.forEach(topicName => {
        const topic = topicNumbers[topicName];
        console.log(`🎯 [Rule2AnalysisResults] ${topicName}: ABCD[${topic.abcd.join(',')}] BCD[${topic.bcd.join(',')}]`);
      });

      const data = {
        user_id: userId,
        analysis_date: analysisDate,
        trigger_date: triggerDate,
        selected_hr: selectedHR,
        overall_abcd_numbers: overallAbcdNumbers,
        overall_bcd_numbers: overallBcdNumbers,
        topic_numbers: topicNumbers,
        total_topics: topicResults.length,
        a_day: sequenceDates.aDay,
        b_day: sequenceDates.bDay,
        c_day: sequenceDates.cDay,
        d_day: sequenceDates.dDay,
        updated_at: new Date().toISOString()
      };

      // Check if record exists
      const { data: existing, error: checkError } = await supabase
        .from('rule2_analysis_results')
        .select('id')
        .eq('user_id', userId)
        .eq('analysis_date', analysisDate)
        .single();

      let result;
      if (existing && !checkError) {
        // Update existing record
        console.log(`🔄 [Rule2AnalysisResults] Updating existing record for ${analysisDate}`);
        const { data: updateData, error: updateError } = await supabase
          .from('rule2_analysis_results')
          .update(data)
          .eq('id', existing.id)
          .select()
          .single();
          
        result = { data: updateData, error: updateError };
      } else {
        // Insert new record
        console.log(`✨ [Rule2AnalysisResults] Creating new record for ${analysisDate}`);
        const { data: insertData, error: insertError } = await supabase
          .from('rule2_analysis_results')
          .insert(data)
          .select()
          .single();
          
        result = { data: insertData, error: insertError };
      }

      if (result.error) {
        console.error(`❌ [Rule2AnalysisResults] Database error:`, result.error);
        return { success: false, error: result.error.message };
      }

      console.log(`✅ [Rule2AnalysisResults] Successfully saved analysis results for ${analysisDate}`);
      return { success: true, data: result.data };

    } catch (error) {
      console.error(`💥 [Rule2AnalysisResults] Exception saving results:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get latest Rule2 analysis results with topic-specific numbers
   * @param {string} userId - User ID
   * @param {number} limit - Number of recent results to return (default: 1)
   * @returns {Promise<Object>} Analysis results or null
   */
  static async getLatestAnalysisResults(userId, limit = 1) {
    try {
      console.log(`🔍 [Rule2AnalysisResults] Fetching latest analysis results for ${userId}`);

      const { data, error } = await supabase
        .from('rule2_analysis_results')
        .select('*')
        .eq('user_id', userId)
        .order('analysis_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error(`❌ [Rule2AnalysisResults] Database error:`, error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        console.log(`📭 [Rule2AnalysisResults] No analysis results found for ${userId}`);
        return { success: true, data: null };
      }

      const latestResult = data[0];
      console.log(`✅ [Rule2AnalysisResults] Found analysis result for ${latestResult.analysis_date}`);
      console.log(`📊 [Rule2AnalysisResults] Overall - ABCD: ${latestResult.overall_abcd_numbers?.length || 0}, BCD: ${latestResult.overall_bcd_numbers?.length || 0}`);
      console.log(`📊 [Rule2AnalysisResults] Topics: ${Object.keys(latestResult.topic_numbers || {}).length}`);

      return { success: true, data: latestResult };

    } catch (error) {
      console.error(`💥 [Rule2AnalysisResults] Exception fetching results:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get analysis results for a specific date
   * @param {string} userId - User ID
   * @param {string} analysisDate - Analysis date
   * @returns {Promise<Object>} Analysis results or null
   */
  static async getAnalysisResultsByDate(userId, analysisDate) {
    try {
      console.log(`🔍 [Rule2AnalysisResults] Fetching analysis results for ${userId} on ${analysisDate}`);

      const { data, error } = await supabase
        .from('rule2_analysis_results')
        .select('*')
        .eq('user_id', userId)
        .eq('analysis_date', analysisDate)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`📭 [Rule2AnalysisResults] No analysis results found for ${analysisDate}`);
          return { success: true, data: null };
        }
        console.error(`❌ [Rule2AnalysisResults] Database error:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ [Rule2AnalysisResults] Found analysis result for ${analysisDate}`);
      return { success: true, data };

    } catch (error) {
      console.error(`💥 [Rule2AnalysisResults] Exception fetching results:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get topic-specific numbers for a given topic from latest analysis
   * @param {string} userId - User ID
   * @param {string} topicName - Topic name (e.g., "D-1 Set-1 Matrix")
   * @returns {Promise<Object>} Topic numbers {abcd: [], bcd: []} or null
   */
  static async getTopicNumbers(userId, topicName) {
    try {
      const result = await this.getLatestAnalysisResults(userId);
      
      if (!result.success || !result.data) {
        return { success: false, error: 'No analysis results found' };
      }

      const topicNumbers = result.data.topic_numbers?.[topicName];
      
      if (!topicNumbers) {
        console.log(`⚠️ [Rule2AnalysisResults] Topic '${topicName}' not found in analysis results`);
        return { success: true, data: { abcd: [], bcd: [] } };
      }

      console.log(`✅ [Rule2AnalysisResults] ${topicName}: ABCD[${topicNumbers.abcd?.join(',') || ''}] BCD[${topicNumbers.bcd?.join(',') || ''}]`);
      return { 
        success: true, 
        data: {
          abcd: topicNumbers.abcd || [],
          bcd: topicNumbers.bcd || []
        }
      };

    } catch (error) {
      console.error(`💥 [Rule2AnalysisResults] Exception getting topic numbers:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if analysis results exist for a specific date
   * @param {string} userId - User ID
   * @param {string} analysisDate - Analysis date
   * @returns {Promise<boolean>} True if results exist
   */
  static async hasAnalysisResults(userId, analysisDate) {
    try {
      const result = await this.getAnalysisResultsByDate(userId, analysisDate);
      return result.success && result.data !== null;
    } catch (error) {
      console.error(`💥 [Rule2AnalysisResults] Exception checking if results exist:`, error);
      return false;
    }
  }

  /**
   * Delete analysis results for a specific date
   * @param {string} userId - User ID
   * @param {string} analysisDate - Analysis date
   * @returns {Promise<Object>} Success/error result
   */
  static async deleteAnalysisResults(userId, analysisDate) {
    try {
      console.log(`🗑️ [Rule2AnalysisResults] Deleting analysis results for ${userId} on ${analysisDate}`);

      const { error } = await supabase
        .from('rule2_analysis_results')
        .delete()
        .eq('user_id', userId)
        .eq('analysis_date', analysisDate);

      if (error) {
        console.error(`❌ [Rule2AnalysisResults] Database error:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ [Rule2AnalysisResults] Successfully deleted analysis results for ${analysisDate}`);
      return { success: true };

    } catch (error) {
      console.error(`💥 [Rule2AnalysisResults] Exception deleting results:`, error);
      return { success: false, error: error.message };
    }
  }
}

export default Rule2AnalysisResultsService;
