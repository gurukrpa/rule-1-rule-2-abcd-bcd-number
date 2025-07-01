// src/services/planetsAnalysisDataService.js
// Service for fetching latest ABCD/BCD numbers for Planets Analysis page

import rule2AnalysisService from './rule2AnalysisService.js';
import { RealTimeRule2AnalysisService } from './realTimeRule2AnalysisService.js';
import { cleanSupabaseService } from './CleanSupabaseService.js';

/**
 * Service to fetch latest ABCD/BCD numbers for Planets Analysis Page
 * Combines data from Past Days and Rule-2 analysis to get the most recent results
 */
export class PlanetsAnalysisDataService {
  
  /**
   * Get latest ABCD/BCD numbers for all topics from both Past Days and Rule-2 analysis
   * @param {string} selectedUser - User ID
   * @param {string[]} datesList - List of available dates
   * @param {number} activeHR - Active HR period
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  static async getLatestAnalysisNumbers(selectedUser, datesList, activeHR = 1) {
    try {
      console.log(`🔍 [PlanetsAnalysis] Fetching latest ABCD/BCD numbers for user ${selectedUser}`);
      console.log(`📅 [PlanetsAnalysis] Available dates:`, datesList);
      console.log(`⏰ [PlanetsAnalysis] Active HR: ${activeHR}`);

      if (!selectedUser || !datesList || datesList.length < 4) {
        return {
          success: false,
          error: 'Insufficient data: need at least 4 dates for analysis'
        };
      }

      // Sort dates to find the latest
      const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
      const latestDate = sortedDates[sortedDates.length - 1];
      
      console.log(`📊 [PlanetsAnalysis] Latest date identified: ${latestDate}`);

      // Strategy 1: Try Rule-2 analysis for the latest date
      let analysisResult = null;
      try {
        console.log(`🎯 [PlanetsAnalysis] Attempting Rule-2 analysis for ${latestDate}`);
        
        const rule2Service = new rule2AnalysisService();
        analysisResult = await rule2Service.performRule2Analysis(
          selectedUser, 
          latestDate, 
          datesList, 
          activeHR
        );
        
        if (analysisResult.success) {
          console.log(`✅ [PlanetsAnalysis] Rule-2 analysis successful for ${latestDate}`);
          return this.formatAnalysisResult(analysisResult, 'rule2', latestDate);
        }
      } catch (error) {
        console.log(`⚠️ [PlanetsAnalysis] Rule-2 analysis failed:`, error.message);
      }

      // Strategy 2: Try Past Days analysis (N-1 pattern)
      if (sortedDates.length >= 5) {
        const previousDate = sortedDates[sortedDates.length - 2]; // N-1 date
        
        try {
          console.log(`🔄 [PlanetsAnalysis] Attempting Past Days analysis for ${previousDate}`);
          
          analysisResult = await RealTimeRule2AnalysisService.performRule2Analysis(
            selectedUser,
            previousDate,
            datesList
          );
          
          if (analysisResult.success) {
            console.log(`✅ [PlanetsAnalysis] Past Days analysis successful for ${previousDate}`);
            return this.formatAnalysisResult(analysisResult, 'pastDays', previousDate);
          }
        } catch (error) {
          console.log(`⚠️ [PlanetsAnalysis] Past Days analysis failed:`, error.message);
        }
      }

      // Strategy 3: Fallback to any available data from recent dates
      return await this.getFallbackAnalysis(selectedUser, sortedDates, activeHR);

    } catch (error) {
      console.error(`❌ [PlanetsAnalysis] Error fetching latest analysis:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format analysis result for Planets Analysis page consumption
   * @param {Object} analysisResult - Raw analysis result
   * @param {string} source - Data source ('rule2' or 'pastDays')
   * @param {string} analysisDate - Date of analysis
   * @returns {Object} Formatted result
   */
  static formatAnalysisResult(analysisResult, source, analysisDate) {
    const { data } = analysisResult;
    
    // Extract topic-specific numbers from the analysis
    const topicNumbers = {};
    
    if (data.topicResults) {
      // Format topic-specific results
      data.topicResults.forEach(topic => {
        topicNumbers[topic.setName] = {
          abcd: topic.abcdNumbers || [],
          bcd: topic.bcdNumbers || []
        };
      });
    }

    // Also get overall numbers for reference
    const overallNumbers = {
      abcd: data.overallAbcdNumbers || [],
      bcd: data.overallBcdNumbers || []
    };

    return {
      success: true,
      data: {
        source: source,
        analysisDate: analysisDate,
        timestamp: new Date().toISOString(),
        hrNumber: data.hrNumber || data.availableHRs?.[0] || 1,
        
        // Topic-specific ABCD/BCD numbers (main requirement)
        topicNumbers: topicNumbers,
        
        // Overall numbers for reference
        overallNumbers: overallNumbers,
        
        // Metadata
        totalTopics: Object.keys(topicNumbers).length,
        dataSource: source === 'rule2' ? 'Rule-2 Analysis' : 'Past Days Analysis'
      }
    };
  }

  /**
   * Fallback analysis - try to get any recent analysis data
   * @param {string} selectedUser - User ID
   * @param {string[]} sortedDates - Sorted dates array
   * @param {number} activeHR - Active HR period
   * @returns {Promise<Object>} Fallback result
   */
  static async getFallbackAnalysis(selectedUser, sortedDates, activeHR) {
    console.log(`🔄 [PlanetsAnalysis] Attempting fallback analysis`);
    
    // Try the last few dates to find any working analysis
    const recentDates = sortedDates.slice(-6); // Last 6 dates
    
    for (let i = recentDates.length - 1; i >= 0; i--) {
      const testDate = recentDates[i];
      
      if (i >= 3) { // Need at least 4 dates for analysis
        try {
          console.log(`🎯 [PlanetsAnalysis] Fallback test for ${testDate}`);
          
          const rule2Service = new rule2AnalysisService();
          const result = await rule2Service.performRule2Analysis(
            selectedUser,
            testDate,
            recentDates.slice(0, i + 1), // Include dates up to this point
            activeHR
          );
          
          if (result.success) {
            console.log(`✅ [PlanetsAnalysis] Fallback successful for ${testDate}`);
            return this.formatAnalysisResult(result, 'fallback', testDate);
          }
        } catch (error) {
          console.log(`⚠️ [PlanetsAnalysis] Fallback failed for ${testDate}`);
          continue;
        }
      }
    }

    // If all fails, return empty structure
    console.log(`❌ [PlanetsAnalysis] All analysis attempts failed`);
    return {
      success: false,
      error: 'No ABCD/BCD analysis data available for any recent dates',
      data: {
        source: 'none',
        topicNumbers: {},
        overallNumbers: { abcd: [], bcd: [] }
      }
    };
  }

  /**
   * Get topic-specific numbers for a given topic name
   * @param {Object} analysisData - Analysis data from getLatestAnalysisNumbers
   * @param {string} topicName - Topic name (e.g., 'D-1 Set-1 Matrix')
   * @returns {Object} Topic numbers {abcd: [], bcd: []}
   */
  static getTopicNumbers(analysisData, topicName) {
    if (!analysisData.success || !analysisData.data?.topicNumbers) {
      return { abcd: [], bcd: [] };
    }

    return analysisData.data.topicNumbers[topicName] || { abcd: [], bcd: [] };
  }

  /**
   * Check if a number qualifies as ABCD for a specific topic
   * @param {Object} analysisData - Analysis data
   * @param {string} topicName - Topic name
   * @param {number} number - Number to check
   * @returns {boolean} True if ABCD qualified
   */
  static isAbcdNumber(analysisData, topicName, number) {
    const topicNumbers = this.getTopicNumbers(analysisData, topicName);
    return topicNumbers.abcd.includes(number);
  }

  /**
   * Check if a number qualifies as BCD for a specific topic
   * @param {Object} analysisData - Analysis data
   * @param {string} topicName - Topic name
   * @param {number} number - Number to check
   * @returns {boolean} True if BCD qualified
   */
  static isBcdNumber(analysisData, topicName, number) {
    const topicNumbers = this.getTopicNumbers(analysisData, topicName);
    return topicNumbers.bcd.includes(number);
  }

  /**
   * Get summary information about the analysis
   * @param {Object} analysisData - Analysis data
   * @returns {Object} Summary information
   */
  static getAnalysisSummary(analysisData) {
    if (!analysisData.success) {
      return {
        success: false,
        error: analysisData.error,
        source: 'none',
        totalTopics: 0,
        totalAbcdNumbers: 0,
        totalBcdNumbers: 0
      };
    }

    const { data } = analysisData;
    const topicNumbers = data.topicNumbers || {};
    
    let totalAbcdNumbers = 0;
    let totalBcdNumbers = 0;
    
    Object.values(topicNumbers).forEach(topic => {
      totalAbcdNumbers += topic.abcd.length;
      totalBcdNumbers += topic.bcd.length;
    });

    return {
      success: true,
      source: data.dataSource,
      analysisDate: data.analysisDate,
      hrNumber: data.hrNumber,
      totalTopics: data.totalTopics,
      totalAbcdNumbers,
      totalBcdNumbers,
      timestamp: data.timestamp
    };
  }
}

// Export default instance
export const planetsAnalysisDataService = new PlanetsAnalysisDataService();
