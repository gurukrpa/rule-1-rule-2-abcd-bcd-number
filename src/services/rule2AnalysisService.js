// Rule2 Real-Time Analysis Service
// Extracted from Rule2CompactPage.jsx for reusable ABCD/BCD analysis

import cleanSupabaseService from './CleanSupabaseService';
import { performAbcdBcdAnalysis } from '../utils/abcdBcdAnalysis';

/**
 * Service for performing real-time Rule2 ABCD/BCD analysis
 * Uses the same logic as Rule2CompactPage but in a reusable format
 */
class Rule2AnalysisService {
  constructor() {
    this.dataService = {
      hasExcelData: (userId, date) => cleanSupabaseService.hasExcelData(userId, date),
      getExcelData: (userId, date) => cleanSupabaseService.getExcelData(userId, date),
      hasHourEntry: (userId, date) => cleanSupabaseService.hasHourEntry(userId, date),
      getHourEntry: (userId, date) => cleanSupabaseService.getHourEntry(userId, date)
    };
    
    // Cache for data loading to avoid repeated fetches
    this.dateDataCache = new Map();
  }

  /**
   * Extract the FIRST number after element prefix
   * e.g. "as-7/su-..." → 7
   */
  extractElementNumber(str) {
    if (typeof str !== 'string') return null;
    
    // Look for pattern: element-NUMBER/ or element-NUMBER-
    const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
    return match ? Number(match[1]) : null;
  }

  /**
   * Pre-load all date data once and cache it
   */
  async preloadDateData(userId, dates) {
    const loadPromises = dates.map(async (targetDate) => {
      try {
        const [excelData, hourData] = await Promise.all([
          this.dataService.getExcelData(userId, targetDate),
          this.dataService.getHourEntry(userId, targetDate)
        ]);
        
        console.log(`🔍 [Rule2Analysis] Data received for ${targetDate}:`, {
          excelData: excelData ? {
            hasDirectSets: !!excelData.sets,
            hasNestedSets: !!excelData.data?.sets,
            directSetsCount: Object.keys(excelData.sets || {}).length,
            nestedSetsCount: Object.keys(excelData.data?.sets || {}).length
          } : null,
          hourData: hourData ? {
            hasPlanetSelections: !!hourData.planetSelections,
            planetSelectionsCount: Object.keys(hourData.planetSelections || {}).length
          } : null
        });

        this.dateDataCache.set(targetDate, {
          excelData,
          hourData,
          sets: excelData?.sets || {},
          planetSelections: hourData?.planetSelections || {}
        });
        
        return { date: targetDate, success: true };
      } catch (e) {
        console.error(`Error preloading ${targetDate}:`, e);
        this.dateDataCache.set(targetDate, { 
          excelData: null, 
          hourData: null, 
          sets: {}, 
          planetSelections: {} 
        });
        return { date: targetDate, success: false };
      }
    });
    
    return Promise.all(loadPromises);
  }

  /**
   * Extract numbers from cached data for a specific date and set
   */
  extractFromDateAndSet(targetDate, setName, selectedHR) {
    const cachedData = this.dateDataCache.get(targetDate);
    console.log(`🔍 [Rule2Analysis] extractFromDateAndSet for ${targetDate}, set ${setName}:`, {
      cachedData: !!cachedData,
      hasExcelData: !!cachedData?.excelData,
      hasHourData: !!cachedData?.hourData,
      selectedHR
    });
    
    if (!cachedData || !cachedData.excelData || !cachedData.hourData) {
      console.log(`❌ Missing data for ${targetDate}:`, {
        cachedData: !!cachedData,
        excelData: !!cachedData?.excelData,
        hourData: !!cachedData?.hourData
      });
      return [];
    }
    
    const { sets, planetSelections } = cachedData;
    console.log(`📊 Data structure for ${targetDate}:`, {
      availableSets: Object.keys(sets),
      planetSelections,
      selectedHR,
      selectedPlanet: planetSelections[selectedHR]
    });
    
    const allNumbers = new Set();
    
    // Find the specific set
    const setData = sets[setName];
    if (setData) {
      console.log(`📋 Found set ${setName}:`, Object.keys(setData));
      
      // Use the selected HR for planet selection
      const selectedPlanet = planetSelections[selectedHR];
      
      if (selectedPlanet) {
        console.log(`🪐 Using planet: ${selectedPlanet}`);
        
        // Process each element in the set
        Object.entries(setData).forEach(([elementName, planetData]) => {
          const rawString = planetData[selectedPlanet];
          console.log(`🔍 Element ${elementName}:`, {
            planetData: Object.keys(planetData),
            selectedPlanet,
            rawString
          });
          
          if (rawString) {
            const elementNumber = this.extractElementNumber(rawString);
            console.log(`🔢 Extracted from "${rawString}": ${elementNumber}`);
            if (elementNumber !== null) {
              allNumbers.add(elementNumber);
            }
          }
        });
      } else {
        console.log(`❌ No planet selected for HR ${selectedHR}`);
      }
    } else {
      console.log(`❌ Set ${setName} not found. Available sets:`, Object.keys(sets));
    }
    
    const result = Array.from(allNumbers).sort((a, b) => a - b);
    console.log(`✅ Final numbers for ${targetDate}, set ${setName}:`, result);
    return result;
  }

  /**
   * Process ABCD-BCD analysis for a specific set using centralized utility
   */
  processSetAnalysis(setName, aDay, bDay, cDay, dDay, selectedHR) {
    // Extract numbers from each day for this specific set using cached data
    const dDayNumbers = this.extractFromDateAndSet(dDay, setName, selectedHR);
    const cDayNumbers = this.extractFromDateAndSet(cDay, setName, selectedHR);
    const bDayNumbers = this.extractFromDateAndSet(bDay, setName, selectedHR);
    const aDayNumbers = this.extractFromDateAndSet(aDay, setName, selectedHR);
    
    if (dDayNumbers.length === 0) {
      return {
        setName,
        abcdNumbers: [],
        bcdNumbers: [],
        dDayCount: 0,
        summary: { dDayCount: 0, abcdCount: 0, bcdCount: 0, totalQualified: 0, qualificationRate: '0.0' },
        error: 'No D-day numbers found'
      };
    }

    // Use enhanced utility function for consistent analysis
    const analysis = performAbcdBcdAnalysis(
      aDayNumbers, 
      bDayNumbers, 
      cDayNumbers, 
      dDayNumbers,
      {
        includeDetailedAnalysis: false,
        logResults: true,
        setName
      }
    );

    // Return standardized result format
    return {
      setName,
      abcdNumbers: analysis.abcdNumbers,
      bcdNumbers: analysis.bcdNumbers,
      dDayCount: dDayNumbers.length,
      summary: analysis.summary,
      error: analysis.error || null
    };
  }

  /**
   * Get all available sets from cached D-day data
   */
  getAllAvailableSets(dDay) {
    const cachedData = this.dateDataCache.get(dDay);
    console.log(`🔍 getAllAvailableSets for ${dDay}:`, {
      hasCache: !!cachedData,
      hasExcelData: !!cachedData?.excelData,
      setsKeys: Object.keys(cachedData?.sets || {})
    });
    
    if (!cachedData || !cachedData.excelData) {
      console.log(`❌ No cached data or Excel data for ${dDay}`);
      return [];
    }
    
    const { sets } = cachedData;
    const availableSetNames = Object.keys(sets);
    
    // Define the 30-topic order
    const TOPIC_ORDER = [
      'D-1 Set-1 Matrix',
      'D-1 Set-2 Matrix',
      'D-3 (trd) Set-1 Matrix',
      'D-3 (trd) Set-2 Matrix',
      'D-4 Set-1 Matrix',
      'D-4 Set-2 Matrix',
      'D-5 (pv) Set-1 Matrix',
      'D-5 (pv) Set-2 Matrix',
      'D-7 (trd) Set-1 Matrix',
      'D-7 (trd) Set-2 Matrix',
      'D-9 Set-1 Matrix',
      'D-9 Set-2 Matrix',
      'D-10 (trd) Set-1 Matrix',
      'D-10 (trd) Set-2 Matrix',
      'D-11 Set-1 Matrix',
      'D-11 Set-2 Matrix',
      'D-12 (trd) Set-1 Matrix',
      'D-12 (trd) Set-2 Matrix',
      'D-27 (trd) Set-1 Matrix',
      'D-27 (trd) Set-2 Matrix',
      'D-30 (sh) Set-1 Matrix',
      'D-30 (sh) Set-2 Matrix',
      'D-60 (Trd) Set-1 Matrix',
      'D-60 (Trd) Set-2 Matrix',
      'D-81 Set-1 Matrix',
      'D-81 Set-2 Matrix',
      'D-108 Set-1 Matrix',
      'D-108 Set-2 Matrix',
      'D-144 Set-1 Matrix',
      'D-144 Set-2 Matrix'
    ];
    
    // Return sets in the predefined order, only including those that actually exist
    const filteredSets = TOPIC_ORDER.filter(topicName => availableSetNames.includes(topicName));
    console.log(`✅ Filtered available sets:`, filteredSets);
    return filteredSets;
  }

  /**
   * Get available HRs from cached D-day data
   */
  getAvailableHRs(dDay) {
    const cachedData = this.dateDataCache.get(dDay);
    if (!cachedData || !cachedData.hourData) return [];
    
    const { planetSelections } = cachedData;
    return Object.keys(planetSelections).map(hr => parseInt(hr)).sort((a, b) => a - b);
  }

  /**
   * Calculate ABCD sequence dates from a given trigger date and datesList
   * Returns { aDay, bDay, cDay, dDay } where dDay is the analysis source
   */
  calculateAbcdSequence(triggerDate, datesList) {
    // Sort dates in ascending order (oldest to newest)
    const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
    
    // Find the trigger date position
    const clickedIndex = sortedDates.findIndex(d => d === triggerDate);
    
    if (clickedIndex < 3) {
      throw new Error(`Analysis requires the trigger date to have at least 3 preceding dates (A, B, C). Current position: ${clickedIndex + 1}, need position 4+`);
    }
    
    // Use the TRIGGER date as D-day (analysis source)
    const dDay = sortedDates[clickedIndex]; // Trigger date becomes D-day (analysis source)
    const cDay = sortedDates[clickedIndex - 1]; // 1 day before trigger date
    const bDay = sortedDates[clickedIndex - 2]; // 2 days before trigger date
    const aDay = sortedDates[clickedIndex - 3]; // 3 days before trigger date
    
    console.log('🔗 ABCD SEQUENCE CALCULATION:');
    console.log(`  A-day: sortedDates[${clickedIndex - 3}] = ${aDay}`);
    console.log(`  B-day: sortedDates[${clickedIndex - 2}] = ${bDay}`);
    console.log(`  C-day: sortedDates[${clickedIndex - 1}] = ${cDay}`);
    console.log(`  D-day: sortedDates[${clickedIndex}] = ${dDay} ← ANALYSIS SOURCE`);
    
    return { aDay, bDay, cDay, dDay };
  }

  /**
   * Perform complete Rule2 ABCD/BCD analysis for a specific date
   * @param {string} userId - User ID
   * @param {string} triggerDate - The date to analyze (becomes D-day)
   * @param {Array} datesList - List of all available dates
   * @param {number} selectedHR - HR selection for planet choice
   * @returns {Object} Analysis results with overall ABCD/BCD numbers
   */
  async performRule2Analysis(userId, triggerDate, datesList, selectedHR = 1) {
    try {
      console.log(`🚀 [Rule2Analysis] Starting analysis for ${triggerDate}, HR: ${selectedHR}`);
      
      // Calculate ABCD sequence
      const { aDay, bDay, cDay, dDay } = this.calculateAbcdSequence(triggerDate, datesList);
      
      // Pre-load all date data
      const allDates = [aDay, bDay, cDay, dDay];
      await this.preloadDateData(userId, allDates);
      
      // Get available sets from D-day data
      const availableSets = this.getAllAvailableSets(dDay);
      console.log('📊 Available sets:', availableSets);
      
      if (availableSets.length === 0) {
        throw new Error('No available sets found for analysis');
      }
      
      // Process all sets in parallel
      const setResults = availableSets.map(setName => {
        const result = this.processSetAnalysis(setName, aDay, bDay, cDay, dDay, selectedHR);
        console.log(`📊 ${setName}: ABCD(${result.abcdNumbers.length}) BCD(${result.bcdNumbers.length}) D-day(${result.dDayCount})`);
        return result;
      });
      
      // Calculate overall ABCD/BCD numbers by combining all sets
      const allDDayNumbers = new Set();
      const allADayNumbers = new Set();
      const allBDayNumbers = new Set();
      const allCDayNumbers = new Set();
      
      // Collect ALL numbers from all topics for each day
      availableSets.forEach(setName => {
        const dDayNumbers = this.extractFromDateAndSet(dDay, setName, selectedHR);
        const aDayNumbers = this.extractFromDateAndSet(aDay, setName, selectedHR);
        const bDayNumbers = this.extractFromDateAndSet(bDay, setName, selectedHR);
        const cDayNumbers = this.extractFromDateAndSet(cDay, setName, selectedHR);
        
        dDayNumbers.forEach(num => allDDayNumbers.add(num));
        aDayNumbers.forEach(num => allADayNumbers.add(num));
        bDayNumbers.forEach(num => allBDayNumbers.add(num));
        cDayNumbers.forEach(num => allCDayNumbers.add(num));
      });

      // Convert to arrays for analysis
      const combinedDDayNumbers = Array.from(allDDayNumbers);
      const combinedADayNumbers = Array.from(allADayNumbers);
      const combinedBDayNumbers = Array.from(allBDayNumbers);
      const combinedCDayNumbers = Array.from(allCDayNumbers);

      console.log('🔄 Combined numbers from all topics:');
      console.log(`📊 Total unique D-day numbers: ${combinedDDayNumbers.length}`);
      console.log(`📊 Total unique A-day numbers: ${combinedADayNumbers.length}`);
      console.log(`📊 Total unique B-day numbers: ${combinedBDayNumbers.length}`);
      console.log(`📊 Total unique C-day numbers: ${combinedCDayNumbers.length}`);

      // Apply ABCD filtering logic to combined numbers
      const overallAbcdCandidates = combinedDDayNumbers.filter(num => {
        let count = 0;
        if (combinedADayNumbers.includes(num)) count++;
        if (combinedBDayNumbers.includes(num)) count++;
        if (combinedCDayNumbers.includes(num)) count++;
        
        if (count >= 2) {
          console.log(`✅ ABCD candidate ${num}: appears in ${count}/3 ABC days`);
        }
        return count >= 2;
      });

      // Apply BCD filtering logic to combined numbers
      const overallBcdCandidates = combinedDDayNumbers.filter(num => {
        const inB = combinedBDayNumbers.includes(num);
        const inC = combinedCDayNumbers.includes(num);
        
        // BCD qualification: (B-D pair only) OR (C-D pair only) - exclude if in both B and C
        const bdPairOnly = inB && !inC;
        const cdPairOnly = inC && !inB;
        const qualified = bdPairOnly || cdPairOnly;
        
        if (qualified) {
          console.log(`✅ BCD candidate ${num}: ${bdPairOnly ? 'B-D pair only' : 'C-D pair only'}`);
        }
        return qualified;
      });

      // Apply mutual exclusivity - ABCD takes priority over BCD
      const finalAbcdNumbers = overallAbcdCandidates.sort((a, b) => a - b);
      const finalBcdNumbers = overallBcdCandidates
        .filter(num => {
          const excluded = overallAbcdCandidates.includes(num);
          if (excluded) {
            console.log(`⚠️ Number ${num} excluded from BCD (already in ABCD)`);
          }
          return !excluded;
        })
        .sort((a, b) => a - b);
      
      console.log('🎉 Rule2Analysis Final Overall Results:');
      console.log('📊 Overall ABCD Numbers:', finalAbcdNumbers);
      console.log('📊 Overall BCD Numbers:', finalBcdNumbers);
      
      return {
        success: true,
        analysisDate: dDay,
        triggerDate,
        abcdNumbers: finalAbcdNumbers,
        bcdNumbers: finalBcdNumbers,
        setResults,
        summary: {
          aDay, bDay, cDay, dDay,
          totalSets: availableSets.length,
          selectedHR,
          availableHRs: this.getAvailableHRs(dDay)
        }
      };
      
    } catch (error) {
      console.error('❌ [Rule2Analysis] Error in analysis:', error);
      return {
        success: false,
        error: error.message,
        triggerDate
      };
    }
  }

  /**
   * Clear the data cache
   */
  clearCache() {
    this.dateDataCache.clear();
  }
}

// Export singleton instance
const rule2AnalysisService = new Rule2AnalysisService();
export default rule2AnalysisService;
