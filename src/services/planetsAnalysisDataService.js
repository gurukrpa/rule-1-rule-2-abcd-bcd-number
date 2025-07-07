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
   * Get latest ABCD/BCD numbers for all topics from database, Past Days and Rule-2 analysis
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

      if (!selectedUser) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      // Strategy 0: Try direct database access first (NEW)
      try {
        console.log(`🎯 [PlanetsAnalysis] Attempting direct database access for real ABCD/BCD numbers`);
        
        const { AbcdBcdDatabaseService } = await import('./abcdBcdDatabaseService.js');
        const dbService = new AbcdBcdDatabaseService();
        const dbResult = await dbService.getAllTopicNumbers();
        
        if (dbResult.success && dbResult.data && Object.keys(dbResult.data).length > 0) {
          console.log(`✅ [PlanetsAnalysis] Direct database access successful - found ${Object.keys(dbResult.data).length} topics`);
          return this.formatDatabaseResult(dbResult.data, 'database');
        } else {
          console.log(`📊 [PlanetsAnalysis] No data in database table, proceeding to analysis methods`);
        }
      } catch (error) {
        console.log(`⚠️ [PlanetsAnalysis] Database access failed:`, error.message);
      }

      // If no dates available, we can only try database access
      if (!datesList || datesList.length === 0) {
        return {
          success: false,
          error: 'No ABCD/BCD data available in database and no dates provided for analysis'
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
   * Format database result for Planets Analysis page consumption
   * @param {Object} databaseData - Raw database data from AbcdBcdDatabaseService
   * @param {string} source - Data source ('database')
   * @returns {Object} Formatted result
   */
  static formatDatabaseResult(databaseData, source) {
    console.log(`📊 [PlanetsAnalysis] Formatting database result with ${Object.keys(databaseData).length} topics`);
    
    // Convert database format to our expected format
    const topicNumbers = {};
    
    Object.entries(databaseData).forEach(([topicName, topicData]) => {
      topicNumbers[topicName] = {
        abcd: topicData.abcd || [],
        bcd: topicData.bcd || []
      };
    });

    return {
      success: true,
      data: {
        source: 'database',
        analysisDate: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        hrNumber: 1, // Default for database access
        
        // Topic-specific ABCD/BCD numbers (main requirement)
        topicNumbers: topicNumbers,
        
        // Overall numbers for reference (combine all topics)
        overallNumbers: {
          abcd: [...new Set(Object.values(topicNumbers).flatMap(topic => topic.abcd))],
          bcd: [...new Set(Object.values(topicNumbers).flatMap(topic => topic.bcd))]
        },
        
        // Metadata
        totalTopics: Object.keys(topicNumbers).length,
        dataSource: 'Direct Database Access'
      }
    };
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
    
    // Handle both topicResults (from RealTimeRule2AnalysisService) and setResults (from rule2AnalysisService)
    const topicResultsArray = data.topicResults || data.setResults;
    
    if (topicResultsArray) {
      // Format topic-specific results
      topicResultsArray.forEach(topic => {
        topicNumbers[topic.setName] = {
          abcd: topic.abcdNumbers || [],
          bcd: topic.bcdNumbers || []
        };
      });
      
      console.log(`🎯 [PlanetsAnalysis] Formatted ${topicResultsArray.length} topics for ${source} analysis (HR ${data.selectedHR || data.summary?.selectedHR || 'unknown'})`);
    }

    // Also get overall numbers for reference - handle both field name formats
    const overallNumbers = {
      abcd: data.overallAbcdNumbers || data.abcdNumbers || [],
      bcd: data.overallBcdNumbers || data.bcdNumbers || []
    };

    return {
      success: true,
      data: {
        source: source,
        analysisDate: analysisDate,
        timestamp: new Date().toISOString(),
        hrNumber: data.hrNumber || data.summary?.selectedHR || data.availableHRs?.[0] || 1,
        
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
      
      // Reduced requirement: try with any available dates (minimum 2 for basic analysis)
      if (i >= 1) { // Changed from 3 to 1 - need at least 2 dates for analysis
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
