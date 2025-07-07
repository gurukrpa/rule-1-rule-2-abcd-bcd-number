// src/services/realTimeRule2AnalysisService.js
// Real-time Rule2 analysis service for Past Days
// Uses the same logic as Rule2CompactPage but without UI dependencies

import { cleanSupabaseService } from './CleanSupabaseService.js';
import { performAbcdBcdAnalysis } from '../utils/abcdBcdAnalysis.js';
import { DateManagementService } from '../utils/dateManagement.js';

export class RealTimeRule2AnalysisService {
  /**
   * Perform real-time Rule2-style ABCD/BCD analysis for a specific date
   * This replicates Rule2CompactPage logic without the UI
   * @param {string} userId - User ID
   * @param {string} analysisDate - Date to analyze (4th date for Past Days)
   * @param {string[]} datesList - All available dates for sequence calculation
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  static async performRule2Analysis(userId, analysisDate, datesList) {
    try {
      console.log('🚀 [RealTimeRule2] Starting real-time analysis for:', {
        userId,
        analysisDate,
        totalDates: datesList.length
      });

      // Sort dates in ascending order (same as Rule2CompactPage)
      const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
      const analysisIndex = sortedDates.indexOf(analysisDate);
      
      console.log(`🔍 [RealTimeRule2] Looking for analysisDate "${analysisDate}" in dates:`, sortedDates);
      console.log(`📍 [RealTimeRule2] Found at index: ${analysisIndex}`);
      
      if (analysisIndex === -1) {
        return {
          success: false,
          error: `Analysis date "${analysisDate}" not found in available dates: [${sortedDates.join(', ')}]. Add this date first or check date formatting.`
        };
      }
      
      // 🔧 FIXED: Handle progressive calendar dates - use the latest complete sequence if needed
      let dDay, cDay, bDay, aDay;
      
      if (analysisIndex < 3) {
        // If the requested date doesn't have enough preceding dates, 
        // use the latest complete sequence that exists
        console.log(`⚠️ [RealTimeRule2] Requested date "${analysisDate}" at position ${analysisIndex + 1} doesn't have enough preceding dates`);
        
        if (sortedDates.length < 4) {
          return {
            success: false,
            error: `Need at least 4 total dates for analysis. Available: ${sortedDates.length} dates`
          };
        }
        
        // Use the latest possible complete sequence
        const latestSequenceIndex = sortedDates.length - 1;
        dDay = sortedDates[latestSequenceIndex];     // Latest date
        cDay = sortedDates[latestSequenceIndex - 1]; // 1 day before latest
        bDay = sortedDates[latestSequenceIndex - 2]; // 2 days before latest  
        aDay = sortedDates[latestSequenceIndex - 3]; // 3 days before latest
        
        console.log(`🔄 [RealTimeRule2] Using latest complete sequence instead:`);
        console.log(`   Requested: ${analysisDate} (position ${analysisIndex + 1})`);
        console.log(`   Using: ${dDay} (position ${latestSequenceIndex + 1})`);
      } else {
        // Original logic: use the requested date and its preceding dates
        dDay = sortedDates[analysisIndex];     // Analysis date becomes D-day
        cDay = sortedDates[analysisIndex - 1]; // 1 day before
        bDay = sortedDates[analysisIndex - 2]; // 2 days before  
        aDay = sortedDates[analysisIndex - 3]; // 3 days before
        
        console.log(`✅ [RealTimeRule2] Using requested date sequence:`);
      }

      // Calculate ABCD sequence (same logic as Rule2CompactPage)

      console.log('🔗 [RealTimeRule2] ABCD sequence for analysis:', {
        aDay, bDay, cDay, dDay: `${dDay} (analysis source)`
      });

      // Pre-load all date data (same as Rule2CompactPage)
      const allDates = [aDay, bDay, cDay, dDay];
      const dateDataCache = {};
      
      for (const date of allDates) {
        try {
          const excelData = await cleanSupabaseService.getExcelData(userId, date);
          const hourData = await cleanSupabaseService.getHourEntry(userId, date);
          
          dateDataCache[date] = {
            excel: excelData,
            hour: hourData,
            success: excelData && hourData
          };
          
          console.log(`📊 [RealTimeRule2] Loaded data for ${date}:`, {
            hasExcel: !!excelData,
            hasHour: !!hourData
          });
        } catch (error) {
          console.error(`❌ [RealTimeRule2] Error loading data for ${date}:`, error);
          dateDataCache[date] = { success: false, error: error.message };
        }
      }

      // Check if we have data for all required dates
      const missingDates = allDates.filter(date => !dateDataCache[date].success);
      if (missingDates.length > 0) {
        console.log(`⚠️ [RealTimeRule2] Missing data for dates: ${missingDates.join(', ')}`);
        console.log(`🔧 [RealTimeRule2] Attempting to auto-populate missing dates...`);
        
        // Try to auto-populate missing dates
        try {
          const autoFillResult = await DateManagementService.autoFillSequence(userId, allDates);
          console.log('🔧 [RealTimeRule2] Auto-fill result:', autoFillResult);
          
          if (autoFillResult.success && autoFillResult.addedDates.length > 0) {
            console.log(`✅ [RealTimeRule2] Successfully auto-populated: ${autoFillResult.addedDates.join(', ')}`);
            
            // Reload data for the newly populated dates
            for (const date of autoFillResult.addedDates) {
              try {
                const excelData = await cleanSupabaseService.getExcelData(userId, date);
                const hourData = await cleanSupabaseService.getHourEntry(userId, date);
                
                dateDataCache[date] = {
                  excel: excelData,
                  hour: hourData,
                  success: excelData && hourData
                };
                
                console.log(`✅ [RealTimeRule2] Reloaded data for auto-populated ${date}`);
              } catch (error) {
                console.error(`❌ [RealTimeRule2] Error reloading data for ${date}:`, error);
                dateDataCache[date] = { success: false, error: error.message };
              }
            }
            
            // Re-check missing dates after auto-population
            const stillMissingDates = allDates.filter(date => !dateDataCache[date].success);
            if (stillMissingDates.length > 0) {
              return {
                success: false,
                error: `Still missing data for dates after auto-population: ${stillMissingDates.join(', ')}. ${DateManagementService.getManualInstructions(stillMissingDates[0]).steps.slice(0, 2).join('. ')}`
              };
            }
          } else {
            return {
              success: false,
              error: `Missing data for dates: ${missingDates.join(', ')}. Auto-population failed: ${autoFillResult.message}. ${DateManagementService.getManualInstructions(missingDates[0]).steps.slice(0, 2).join('. ')}`
            };
          }
        } catch (autoFillError) {
          console.error(`❌ [RealTimeRule2] Auto-fill error:`, autoFillError);
          return {
            success: false,
            error: `Missing data for dates: ${missingDates.join(', ')}. Auto-population failed. ${DateManagementService.getManualInstructions(missingDates[0]).steps.slice(0, 2).join('. ')}`
          };
        }
      }

      // Get available HR periods from D-day data
      const dDayHourData = dateDataCache[dDay].hour;
      if (!dDayHourData?.planetSelections) {
        return {
          success: false,
          error: `No planet selections found for analysis date ${dDay}`
        };
      }

      const availableHRs = Object.keys(dDayHourData.planetSelections)
        .map(hr => parseInt(hr))
        .sort((a, b) => a - b);

      console.log(`🪐 [RealTimeRule2] Available HR periods:`, availableHRs);

      // Perform analysis for each HR period
      const hrResults = {};
      
      for (const hrNumber of availableHRs) {
        console.log(`🔍 [RealTimeRule2] Analyzing HR ${hrNumber}...`);
        
        try {
          const hrAnalysis = await this.performHRAnalysis(hrNumber, allDates, dateDataCache);
          hrResults[hrNumber] = hrAnalysis;
          
          console.log(`✅ [RealTimeRule2] HR ${hrNumber} analysis complete:`, {
            totalTopics: hrAnalysis.topicResults.length,
            overallABCD: hrAnalysis.overallAbcdNumbers.length,
            overallBCD: hrAnalysis.overallBcdNumbers.length
          });
        } catch (error) {
          console.error(`❌ [RealTimeRule2] Error analyzing HR ${hrNumber}:`, error);
          hrResults[hrNumber] = { error: error.message };
        }
      }

      return {
        success: true,
        data: {
          analysisDate,
          abcdSequence: { aDay, bDay, cDay, dDay },
          hrResults,
          availableHRs,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ [RealTimeRule2] Analysis failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Perform ABCD/BCD analysis for a specific HR period
   * @param {number} hrNumber - HR period number
   * @param {string[]} allDates - [aDay, bDay, cDay, dDay]
   * @param {Object} dateDataCache - Pre-loaded data for all dates
   */
  static async performHRAnalysis(hrNumber, allDates, dateDataCache) {
    const [aDay, bDay, cDay, dDay] = allDates;
    
    // Extract element numbers for each date (same logic as Rule2CompactPage)
    const extractFromDateAndSet = (targetDate, setName) => {
      const dayData = dateDataCache[targetDate];
      if (!dayData.success) return [];
      
      const sets = dayData.excel.data?.sets || dayData.excel.sets || {};
      const planetSelections = dayData.hour.planetSelections || {};
      const selectedPlanet = planetSelections[hrNumber];
      
      if (!selectedPlanet || !sets[setName]) return [];
      
      const allNumbers = new Set();
      const setData = sets[setName];
      
      Object.entries(setData).forEach(([elementName, planetData]) => {
        const rawString = planetData[selectedPlanet];
        if (rawString) {
          const elementNumber = this.extractElementNumber(rawString);
          if (elementNumber !== null) {
            allNumbers.add(elementNumber);
          }
        }
      });
      
      return Array.from(allNumbers).sort((a, b) => a - b);
    };

    // Get all available topic sets from D-day data
    const dDayData = dateDataCache[dDay];
    const availableSets = Object.keys(dDayData.excel.data?.sets || dDayData.excel.sets || {});
    
    // Process each topic
    const topicResults = [];
    const combinedDDayNumbers = new Set();
    const combinedADayNumbers = new Set();
    const combinedBDayNumbers = new Set();
    const combinedCDayNumbers = new Set();
    
    for (const setName of availableSets) {
      // Extract numbers for this topic
      const dDayNumbers = extractFromDateAndSet(dDay, setName);
      const cDayNumbers = extractFromDateAndSet(cDay, setName);
      const bDayNumbers = extractFromDateAndSet(bDay, setName);
      const aDayNumbers = extractFromDateAndSet(aDay, setName);
      
      if (dDayNumbers.length === 0) {
        topicResults.push({
          setName,
          abcdNumbers: [],
          bcdNumbers: [],
          dDayCount: 0,
          error: 'No D-day numbers found'
        });
        continue;
      }
      
      // Perform ABCD/BCD analysis for this topic
      const analysis = performAbcdBcdAnalysis(
        aDayNumbers,
        bDayNumbers,
        cDayNumbers,
        dDayNumbers,
        {
          includeDetailedAnalysis: false,
          logResults: false,
          setName
        }
      );
      
      topicResults.push({
        setName,
        abcdNumbers: analysis.abcdNumbers,
        bcdNumbers: analysis.bcdNumbers,
        dDayCount: dDayNumbers.length,
        summary: analysis.summary
      });
      
      // Add to combined numbers for overall analysis
      dDayNumbers.forEach(num => combinedDDayNumbers.add(num));
      aDayNumbers.forEach(num => combinedADayNumbers.add(num));
      bDayNumbers.forEach(num => combinedBDayNumbers.add(num));
      cDayNumbers.forEach(num => combinedCDayNumbers.add(num));
    }
    
    // Calculate overall ABCD/BCD numbers (same logic as Rule2CompactPage)
    const combinedDArray = Array.from(combinedDDayNumbers);
    const combinedAArray = Array.from(combinedADayNumbers);
    const combinedBArray = Array.from(combinedBDayNumbers);
    const combinedCArray = Array.from(combinedCDayNumbers);
    
    // Overall ABCD analysis
    const overallAbcdCandidates = combinedDArray.filter(num => {
      let count = 0;
      if (combinedAArray.includes(num)) count++;
      if (combinedBArray.includes(num)) count++;
      if (combinedCArray.includes(num)) count++;
      return count >= 2;
    });
    
    // Overall BCD analysis
    const overallBcdCandidates = combinedDArray.filter(num => {
      const inB = combinedBArray.includes(num);
      const inC = combinedCArray.includes(num);
      const bdPairOnly = inB && !inC;
      const cdPairOnly = inC && !inB;
      return bdPairOnly || cdPairOnly;
    });
    
    // Apply mutual exclusivity
    const overallAbcdNumbers = overallAbcdCandidates.sort((a, b) => a - b);
    const overallBcdNumbers = overallBcdCandidates
      .filter(num => !overallAbcdCandidates.includes(num))
      .sort((a, b) => a - b);
    
    return {
      hrNumber,
      topicResults,
      overallAbcdNumbers,
      overallBcdNumbers,
      totalTopics: topicResults.length,
      successfulTopics: topicResults.filter(r => !r.error).length
    };
  }

  /**
   * Extract element number from raw string (same as Rule2CompactPage)
   */
  static extractElementNumber(str) {
    if (typeof str !== 'string') return null;
    const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
    return match ? Number(match[1]) : null;
  }

  /**
   * Get simplified results for Past Days display
   * Returns the overall ABCD/BCD numbers for the primary HR
   * @param {Object} analysisResult - Result from performRule2Analysis
   * @returns {Object} Simplified result for Past Days
   */
  static getSimplifiedResults(analysisResult) {
    if (!analysisResult.success) {
      return {
        success: false,
        error: analysisResult.error
      };
    }

    const { data } = analysisResult;
    const primaryHR = data.availableHRs[0]; // Use first available HR
    const primaryHRResult = data.hrResults[primaryHR];
    
    if (!primaryHRResult || primaryHRResult.error) {
      return {
        success: false,
        error: primaryHRResult?.error || 'No valid HR analysis found'
      };
    }
    
    return {
      success: true,
      data: {
        analysisDate: data.analysisDate,
        abcdNumbers: primaryHRResult.overallAbcdNumbers,
        bcdNumbers: primaryHRResult.overallBcdNumbers,
        hrNumber: primaryHR,
        source: 'realTimeRule2Analysis',
        timestamp: data.timestamp
      }
    };
  }
}
