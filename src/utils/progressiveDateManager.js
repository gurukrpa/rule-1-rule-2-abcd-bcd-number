// src/utils/progressiveDateManager.js
// Smart date sequence management for progressive calendar dates

import { cleanSupabaseService } from '../services/CleanSupabaseService.js';

export class ProgressiveDateManager {
  
  /**
   * Get the best available ABCD sequence for analysis given progressive calendar dates
   * @param {string} userId - User ID
   * @param {string} targetDate - Desired analysis date 
   * @param {string[]} availableDates - All available dates in progressive order
   * @returns {Promise<{sequence: string[], usedTarget: boolean, message: string}>}
   */
  static async getBestAnalysisSequence(userId, targetDate, availableDates) {
    try {
      const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
      const targetIndex = sortedDates.indexOf(targetDate);
      
      console.log(`🔍 [ProgressiveDateManager] Finding best sequence for ${targetDate}`);
      console.log(`📅 Available dates:`, sortedDates);
      console.log(`📍 Target date position:`, targetIndex + 1);
      
      // Case 1: Target date has enough preceding dates (ideal scenario)
      if (targetIndex >= 3) {
        const sequence = [
          sortedDates[targetIndex - 3], // A
          sortedDates[targetIndex - 2], // B  
          sortedDates[targetIndex - 1], // C
          sortedDates[targetIndex]      // D (target)
        ];
        
        console.log(`✅ [ProgressiveDateManager] Using target date sequence:`, sequence);
        return {
          sequence,
          usedTarget: true,
          analysisDate: targetDate,
          message: `Using ${targetDate} with its preceding dates for analysis`
        };
      }
      
      // Case 2: Target date doesn't have enough preceding dates
      // Use the latest complete sequence available
      if (sortedDates.length >= 4) {
        const latestCompleteSequence = [
          sortedDates[sortedDates.length - 4], // A
          sortedDates[sortedDates.length - 3], // B
          sortedDates[sortedDates.length - 2], // C
          sortedDates[sortedDates.length - 1]  // D (latest available)
        ];
        
        console.log(`🔄 [ProgressiveDateManager] Target date ${targetDate} doesn't have enough preceding dates`);
        console.log(`📅 Using latest complete sequence:`, latestCompleteSequence);
        
        return {
          sequence: latestCompleteSequence,
          usedTarget: false,
          analysisDate: latestCompleteSequence[3], // D-day
          message: `${targetDate} doesn't have enough preceding dates. Using ${latestCompleteSequence[3]} instead.`
        };
      }
      
      // Case 3: Not enough dates total - need to auto-populate
      console.log(`⚠️ [ProgressiveDateManager] Not enough dates total (${sortedDates.length}). Need at least 4.`);
      
      const populateResult = await this.autoPopulateSequence(userId, targetDate, sortedDates);
      if (populateResult.success) {
        return {
          sequence: populateResult.sequence,
          usedTarget: populateResult.usedTarget,
          analysisDate: populateResult.analysisDate,
          message: populateResult.message
        };
      }
      
      return {
        sequence: null,
        usedTarget: false,
        analysisDate: null,
        message: `Cannot create analysis sequence: ${populateResult.message}`
      };
      
    } catch (error) {
      console.error('[ProgressiveDateManager] Error finding analysis sequence:', error);
      return {
        sequence: null,
        usedTarget: false,
        analysisDate: null,
        message: `Error: ${error.message}`
      };
    }
  }
  
  /**
   * Auto-populate missing dates to create a complete sequence
   * @param {string} userId - User ID
   * @param {string} targetDate - Desired target date
   * @param {string[]} currentDates - Currently available dates
   * @returns {Promise<{success: boolean, sequence?: string[], message: string}>}
   */
  static async autoPopulateSequence(userId, targetDate, currentDates) {
    try {
      console.log(`🔧 [ProgressiveDateManager] Auto-populating sequence for ${targetDate}`);
      
      // We need to create a 4-date sequence ending with the target date
      const targetDateObj = new Date(targetDate);
      const neededDates = [];
      
      // Generate the 4-date sequence: A, B, C, D (where D = target)
      for (let i = 3; i >= 0; i--) {
        const dateObj = new Date(targetDateObj);
        dateObj.setDate(dateObj.getDate() - i);
        neededDates.push(dateObj.toISOString().split('T')[0]);
      }
      
      console.log(`📅 [ProgressiveDateManager] Needed sequence:`, neededDates);
      
      // Find which dates are missing
      const missingDates = neededDates.filter(date => !currentDates.includes(date));
      console.log(`🔍 [ProgressiveDateManager] Missing dates:`, missingDates);
      
      if (missingDates.length === 0) {
        return {
          success: true,
          sequence: neededDates,
          usedTarget: true,
          analysisDate: targetDate,
          message: `All dates already available for ${targetDate} sequence`
        };
      }
      
      // Get a template date for copying structure
      if (currentDates.length === 0) {
        return {
          success: false,
          message: 'No existing dates to use as template for auto-population'
        };
      }
      
      const templateDate = currentDates[currentDates.length - 1]; // Use latest available as template
      console.log(`📋 [ProgressiveDateManager] Using ${templateDate} as template`);
      
      // Auto-populate each missing date
      const populatedDates = [];
      for (const missingDate of missingDates) {
        const result = await this.createDateFromTemplate(userId, missingDate, templateDate);
        if (result.success) {
          populatedDates.push(missingDate);
          console.log(`✅ [ProgressiveDateManager] Created ${missingDate}`);
        } else {
          console.log(`❌ [ProgressiveDateManager] Failed to create ${missingDate}: ${result.message}`);
        }
      }
      
      if (populatedDates.length === missingDates.length) {
        return {
          success: true,
          sequence: neededDates,
          usedTarget: true,
          analysisDate: targetDate,
          message: `Successfully auto-populated ${populatedDates.length} missing dates: ${populatedDates.join(', ')}`
        };
      } else {
        return {
          success: false,
          message: `Only created ${populatedDates.length}/${missingDates.length} needed dates. Missing: ${missingDates.filter(d => !populatedDates.includes(d)).join(', ')}`
        };
      }
      
    } catch (error) {
      console.error('[ProgressiveDateManager] Error auto-populating sequence:', error);
      return {
        success: false,
        message: `Auto-population failed: ${error.message}`
      };
    }
  }
  
  /**
   * Create a new date entry by copying from a template date
   * @param {string} userId - User ID
   * @param {string} newDate - New date to create
   * @param {string} templateDate - Template date to copy from
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async createDateFromTemplate(userId, newDate, templateDate) {
    try {
      console.log(`🔧 [ProgressiveDateManager] Creating ${newDate} from template ${templateDate}`);
      
      // Check if data already exists
      const hasExcel = await cleanSupabaseService.hasExcelData(userId, newDate);
      const hasHour = await cleanSupabaseService.hasHourEntry(userId, newDate);
      
      if (hasExcel && hasHour) {
        return {
          success: true,
          message: `Date ${newDate} already has complete data`
        };
      }
      
      // Copy Excel data if missing
      if (!hasExcel) {
        const templateExcelData = await cleanSupabaseService.getExcelData(userId, templateDate);
        if (templateExcelData) {
          const newExcelData = {
            ...templateExcelData,
            upload_date: newDate,
            metadata: {
              ...templateExcelData.metadata,
              autoGenerated: true,
              sourceTemplate: templateDate,
              targetDate: newDate,
              createdAt: new Date().toISOString(),
              purpose: 'Progressive calendar date sequence completion'
            }
          };
          
          await cleanSupabaseService.saveExcelData(userId, newDate, newExcelData);
        } else {
          throw new Error(`Could not get template Excel data from ${templateDate}`);
        }
      }
      
      // Copy Hour entry if missing
      if (!hasHour) {
        const templateHourData = await cleanSupabaseService.getHourEntry(userId, templateDate);
        if (templateHourData) {
          const newHourData = {
            ...templateHourData,
            date: newDate,
            metadata: {
              ...templateHourData.metadata,
              autoGenerated: true,
              sourceTemplate: templateDate,
              targetDate: newDate,
              createdAt: new Date().toISOString(),
              purpose: 'Progressive calendar date sequence completion'
            }
          };
          
          await cleanSupabaseService.saveHourEntry(userId, newDate, newHourData);
        } else {
          throw new Error(`Could not get template Hour data from ${templateDate}`);
        }
      }
      
      return {
        success: true,
        message: `Successfully created ${newDate} from template ${templateDate}`
      };
      
    } catch (error) {
      console.error(`[ProgressiveDateManager] Error creating ${newDate}:`, error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  /**
   * Get manual instructions for adding dates progressively
   * @param {string} targetDate - Target date that needs to be added
   * @returns {Object} Instructions for manual data entry
   */
  static getManualInstructions(targetDate) {
    return {
      title: `Add ${targetDate} for Progressive Calendar`,
      steps: [
        'Navigate to ABCD-number page in your application',
        `Click "Add Date" button and enter: ${targetDate}`,
        'Upload Excel file with planets data for this date',
        'Add Hour Entry by selecting planets for HR 1-6',
        'Save the data',
        'Return to Planets Analysis to test'
      ],
      expectedResult: `Analysis Date: ${new Date(targetDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
      note: `Progressive calendar dates work forward in time. Each new date added enables analysis for that specific date.`
    };
  }
}

export default ProgressiveDateManager;
