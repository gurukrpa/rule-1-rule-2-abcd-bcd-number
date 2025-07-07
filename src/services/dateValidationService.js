// src/services/dateValidationService.js
// N-1 Pattern Date Validation Service
// Ensures proper date sequencing for N-1 pattern analysis

import { cleanSupabaseService } from './CleanSupabaseService.js';

export class DateValidationService {
  
  /**
   * Validate if adding a new date has proper N-1 data available
   * @param {string} userId - User ID
   * @param {string} newDate - New date to be added (YYYY-MM-DD)
   * @returns {Promise<{isValid: boolean, issues: string[], suggestions: string[], n1Date: string}>}
   */
  static async validateNewDate(userId, newDate) {
    try {
      console.log(`🔍 [DateValidation] Validating new date: ${newDate} for user: ${userId}`);
      
      // Get current available dates
      const availableDates = await cleanSupabaseService.getUserDates(userId);
      console.log(`📅 [DateValidation] Current available dates:`, availableDates);
      
      // Calculate N-1 date (previous day)
      const newDateObj = new Date(newDate);
      const n1DateObj = new Date(newDateObj);
      n1DateObj.setDate(n1DateObj.getDate() - 1);
      const n1Date = n1DateObj.toISOString().split('T')[0];
      
      console.log(`📊 [DateValidation] N-1 date for ${newDate} would be: ${n1Date}`);
      
      const issues = [];
      const suggestions = [];
      let isValid = true;
      
      // Check if N-1 date exists in available dates
      const hasN1Data = availableDates.includes(n1Date);
      
      if (!hasN1Data && availableDates.length > 0) {
        isValid = false;
        issues.push(`Missing N-1 data: ${newDate} requires ${n1Date} data for proper analysis`);
        suggestions.push(`Add ${n1Date} data first, then add ${newDate}`);
        
        // Check if there's a gap in dates
        const sortedDates = [...availableDates].sort();
        const latestDate = sortedDates[sortedDates.length - 1];
        const latestDateObj = new Date(latestDate);
        const newDateDiff = Math.floor((newDateObj - latestDateObj) / (1000 * 60 * 60 * 24));
        
        if (newDateDiff > 1) {
          const missingDates = [];
          for (let i = 1; i < newDateDiff; i++) {
            const missingDateObj = new Date(latestDateObj);
            missingDateObj.setDate(missingDateObj.getDate() + i);
            missingDates.push(missingDateObj.toISOString().split('T')[0]);
          }
          
          suggestions.push(`Fill the gap: Add missing dates in sequence: ${missingDates.join(', ')}`);
        }
      } else if (availableDates.length === 0) {
        // First date - this is fine
        console.log(`✅ [DateValidation] First date for user - no N-1 requirement`);
        suggestions.push(`This is the first date for this user - no previous data required`);
      } else {
        console.log(`✅ [DateValidation] N-1 date ${n1Date} is available`);
      }
      
      return {
        isValid,
        issues,
        suggestions,
        n1Date,
        hasN1Data,
        availableDates
      };
      
    } catch (error) {
      console.error('❌ [DateValidation] Error validating new date:', error);
      return {
        isValid: false,
        issues: [`Validation error: ${error.message}`],
        suggestions: ['Check database connection and try again'],
        n1Date: null,
        hasN1Data: false,
        availableDates: []
      };
    }
  }
  
  /**
   * Validate if a date can be used for N-1 pattern analysis
   * @param {string} userId - User ID
   * @param {string} targetDate - Date user wants to analyze (YYYY-MM-DD)
   * @returns {Promise<{canAnalyze: boolean, analysisDate: string, issues: string[], suggestions: string[]}>}
   */
  static async validateAnalysisDate(userId, targetDate) {
    try {
      console.log(`🔍 [DateValidation] Validating analysis for date: ${targetDate}`);
      
      const availableDates = await cleanSupabaseService.getUserDates(userId);
      
      // Calculate N-1 date for analysis
      const targetDateObj = new Date(targetDate);
      const analysisDateObj = new Date(targetDateObj);
      analysisDateObj.setDate(analysisDateObj.getDate() - 1);
      const analysisDate = analysisDateObj.toISOString().split('T')[0];
      
      const issues = [];
      const suggestions = [];
      
      const hasAnalysisData = availableDates.includes(analysisDate);
      
      if (!hasAnalysisData) {
        issues.push(`Cannot analyze ${targetDate}: Missing ${analysisDate} data (N-1 pattern)`);
        suggestions.push(`Add ${analysisDate} data to enable proper analysis of ${targetDate}`);
        
        // Suggest fallback
        if (availableDates.length > 0) {
          const sortedDates = [...availableDates].sort((a, b) => new Date(b) - new Date(a));
          const latestDate = sortedDates[0];
          suggestions.push(`Fallback: Will use latest available date (${latestDate}) instead`);
        }
      }
      
      return {
        canAnalyze: hasAnalysisData,
        analysisDate,
        targetDate,
        issues,
        suggestions,
        availableDates,
        fallbackDate: availableDates.length > 0 ? [...availableDates].sort((a, b) => new Date(b) - new Date(a))[0] : null
      };
      
    } catch (error) {
      console.error('❌ [DateValidation] Error validating analysis date:', error);
      return {
        canAnalyze: false,
        analysisDate: null,
        targetDate,
        issues: [`Validation error: ${error.message}`],
        suggestions: ['Check database connection and try again'],
        availableDates: [],
        fallbackDate: null
      };
    }
  }
  
  /**
   * Get recommended dates to add for proper N-1 sequence
   * @param {string} userId - User ID
   * @param {string} targetDate - Ultimate target date user wants to reach
   * @returns {Promise<{sequence: string[], description: string}>}
   */
  static async getRecommendedSequence(userId, targetDate) {
    try {
      const availableDates = await cleanSupabaseService.getUserDates(userId);
      
      if (availableDates.length === 0) {
        // Calculate N-1 date for the target
        const targetDateObj = new Date(targetDate);
        const n1DateObj = new Date(targetDateObj);
        n1DateObj.setDate(n1DateObj.getDate() - 1);
        const n1Date = n1DateObj.toISOString().split('T')[0];
        
        return {
          sequence: [n1Date, targetDate],
          description: `First time setup: Add ${n1Date} (for data), then ${targetDate} (for analysis)`
        };
      }
      
      const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
      const latestDate = sortedDates[sortedDates.length - 1];
      const latestDateObj = new Date(latestDate);
      const targetDateObj = new Date(targetDate);
      
      const sequence = [];
      const currentDate = new Date(latestDateObj);
      currentDate.setDate(currentDate.getDate() + 1);
      
      while (currentDate <= targetDateObj) {
        sequence.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return {
        sequence,
        description: `Sequential addition: ${sequence.length} dates needed for continuous N-1 pattern`
      };
      
    } catch (error) {
      console.error('❌ [DateValidation] Error getting recommended sequence:', error);
      return {
        sequence: [],
        description: 'Error calculating sequence'
      };
    }
  }
  
  /**
   * Quick check if N-1 pattern will work for a date
   * @param {string} userId - User ID  
   * @param {string} date - Date to check
   * @returns {Promise<boolean>}
   */
  static async quickN1Check(userId, date) {
    try {
      const availableDates = await cleanSupabaseService.getUserDates(userId);
      const dateObj = new Date(date);
      const n1DateObj = new Date(dateObj);
      n1DateObj.setDate(n1DateObj.getDate() - 1);
      const n1Date = n1DateObj.toISOString().split('T')[0];
      
      return availableDates.includes(n1Date);
    } catch (error) {
      console.error('❌ [DateValidation] Quick N-1 check failed:', error);
      return false;
    }
  }
}

export default DateValidationService;
