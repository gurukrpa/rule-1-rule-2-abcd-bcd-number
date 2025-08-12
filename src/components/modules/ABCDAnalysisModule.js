// ABCDAnalysisModule.js - ABCD/BCD analysis functionality
// Handles sequence analysis, number extraction, and result processing

import { planetsServiceAdapter } from './PlanetsServiceAdapter';
import { extractElementNumber } from './PlanetsDataUtils';

export const performAbcdBcdAnalysis = async (setName, aDay, bDay, cDay, dDay, hrNumber, userId) => {
  try {
    console.log(`🧮 [ABCD Analysis] Starting analysis for ${setName}:`, {
      sequence: [aDay, bDay, cDay, dDay],
      hr: hrNumber
    });

    const results = {
      abcdNumbers: [],
      bcdNumbers: [],
      sequenceDates: [aDay, bDay, cDay, dDay],
      setName: setName
    };

    // Extract numbers for each date in the sequence
    const dayData = {};
    const dates = [aDay, bDay, cDay, dDay];
    
    for (const date of dates) {
      try {
        const numbers = await extractFromDateAndSet(date, setName, hrNumber, userId);
        dayData[date] = numbers;
        console.log(`📊 [ABCD] Numbers for ${date}:`, numbers);
      } catch (error) {
        console.error(`❌ [ABCD] Error extracting from ${date}:`, error);
        dayData[date] = [];
      }
    }

    // ABCD Analysis: Numbers that appear in ALL 4 days (A∩B∩C∩D)
    if (dayData[aDay].length > 0) {
      const abcdNumbers = dayData[aDay].filter(num => 
        dayData[bDay].includes(num) && 
        dayData[cDay].includes(num) && 
        dayData[dDay].includes(num)
      );
      results.abcdNumbers = abcdNumbers;
    }

    // BCD Analysis: Numbers that appear in B, C, and D (but not necessarily A)
    if (dayData[bDay].length > 0) {
      const bcdNumbers = dayData[bDay].filter(num => 
        dayData[cDay].includes(num) && 
        dayData[dDay].includes(num)
      );
      results.bcdNumbers = bcdNumbers;
    }

    console.log(`✅ [ABCD] Analysis complete for ${setName}:`, {
      abcd: results.abcdNumbers,
      bcd: results.bcdNumbers
    });

    return results;

  } catch (error) {
    console.error(`❌ [ABCD] Analysis failed for ${setName}:`, error);
    return {
      abcdNumbers: [],
      bcdNumbers: [],
      sequenceDates: [aDay, bDay, cDay, dDay],
      setName: setName,
      error: error.message
    };
  }
};

// Extract numbers from a specific set for a specific date using selected HR
const extractFromDateAndSet = async (targetDate, setName, hrNumber, userId) => {
  try {
    console.log(`🔍 [Extract] Extracting from date=${targetDate}, set=${setName}, HR=${hrNumber}`);
    
    const excelData = await planetsServiceAdapter.getExcelData(userId, targetDate);
    const hourData = await planetsServiceAdapter.getHourEntry(userId, targetDate);
    
    if (!excelData || !hourData) {
      console.log(`❌ [Extract] Missing data for ${targetDate}`);
      return [];
    }

    const selectedPlanet = hourData.planetSelections[hrNumber];
    if (!selectedPlanet) {
      console.log(`❌ [Extract] No planet selected for HR${hrNumber} on ${targetDate}`);
      return [];
    }

    const setData = excelData.data?.sets?.[setName];
    if (!setData) {
      console.log(`❌ [Extract] Set ${setName} not found in data for ${targetDate}`);
      return [];
    }

    const numbers = [];
    Object.entries(setData).forEach(([elementName, planetData]) => {
      const rawData = planetData[selectedPlanet];
      if (rawData) {
        const extractedNumber = extractElementNumber(rawData);
        if (extractedNumber !== null) {
          numbers.push(extractedNumber);
        }
      }
    });

    console.log(`✅ [Extract] Extracted ${numbers.length} numbers from ${setName} on ${targetDate}:`, numbers);
    return numbers;

  } catch (error) {
    console.error(`❌ [Extract] Error extracting from ${targetDate}:`, error);
    return [];
  }
};

export const processRule1LatestData = async (selectedUser, datesList, activeHR) => {
  if (!selectedUser || !datesList.length || datesList.length < 5) {
    return null;
  }

  try {
    // Get the latest date (most recent) as the target for display
    const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
    const latestDate = sortedDates[sortedDates.length - 1];
    
    // Get the previous date (N-1) for actual data fetching
    const previousDate = sortedDates[sortedDates.length - 2];
    
    if (!previousDate) {
      console.log(`❌ [Rule-1] Not enough dates for Rule-1 integration (need at least 2 dates)`);
      return null;
    }
    
    console.log(`🎯 [Rule-1] Target date for display: ${latestDate}`);
    console.log(`📅 [Rule-1] Fetching data from previous date: ${previousDate}`);

    // Fetch data from the PREVIOUS date (N-1) instead of the target date (N)
    const excelData = await planetsServiceAdapter.getExcelData(selectedUser, previousDate);
    const hourData = await planetsServiceAdapter.getHourEntry(selectedUser, previousDate);

    if (!excelData || !hourData) {
      console.log(`❌ [Rule-1] Missing data for previous date: ${previousDate}`);
      return null;
    }

    const selectedPlanet = hourData.planetSelections[activeHR];
    
    // Get the ABCD sequence (4 dates before the previous date for analysis)
    const analysisEndIndex = sortedDates.length - 2; // Previous date index
    const analysisStartIndex = Math.max(0, analysisEndIndex - 3);
    const abcdSequence = sortedDates.slice(analysisStartIndex, analysisEndIndex + 1);
    
    console.log(`🧮 [Rule-1] ABCD analysis sequence:`, abcdSequence);
    
    // Perform ABCD/BCD analysis for each available set using the previous date data
    const analysisResults = {};
    const targetElements = {};
    
    if (excelData.data?.sets && abcdSequence.length >= 4) {
      const [aDay, bDay, cDay, dDay] = abcdSequence;
      
      for (const setName of Object.keys(excelData.data.sets)) {
        try {
          // Perform ABCD/BCD analysis for this set
          const analysis = await performAbcdBcdAnalysis(setName, aDay, bDay, cDay, dDay, activeHR, selectedUser);
          analysisResults[setName] = analysis;
          
          // Get target elements for this set from the previous date
          const setData = excelData.data.sets[setName];
          const elements = {};
          
          Object.entries(setData).forEach(([elementName, planetData]) => {
            const rawData = planetData[selectedPlanet];
            if (rawData) {
              const extractedNumber = extractElementNumber(rawData);
              let badge = null;
              
              if (extractedNumber !== null && analysis) {
                if (analysis.abcdNumbers.includes(extractedNumber)) {
                  badge = 'ABCD';
                } else if (analysis.bcdNumbers.includes(extractedNumber)) {
                  badge = 'BCD';
                }
              }
              
              elements[elementName] = {
                rawData,
                formattedData: rawData, // formatPlanetData(rawData)
                extractedNumber,
                badge
              };
            }
          });
          
          if (Object.keys(elements).length > 0) {
            targetElements[setName] = elements;
          }
          
          console.log(`✅ [Rule-1] Analysis for ${setName}:`, {
            abcd: analysis.abcdNumbers,
            bcd: analysis.bcdNumbers,
            elements: Object.keys(elements).length
          });
          
        } catch (e) {
          console.log(`❌ [Rule-1] Error analyzing ${setName}:`, e);
          analysisResults[setName] = { abcdNumbers: [], bcdNumbers: [] };
        }
      }
    }
    
    const result = {
      targetDate: latestDate,  // Display the target date (N)
      dataDate: previousDate,  // Track where data actually came from (N-1)
      abcdSequence: abcdSequence,  // The 4-date sequence used for analysis
      selectedPlanet: selectedPlanet || 'Su',
      analysis: analysisResults,  // ABCD/BCD analysis results
      targetElements: targetElements,  // Element data with badges
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ [Rule-1] Complete Rule-1 data loaded:`, {
      targetDate: latestDate,
      dataDate: previousDate,
      analysisSequence: abcdSequence,
      setsAnalyzed: Object.keys(analysisResults).length,
      elementsFound: Object.keys(targetElements).reduce((total, setName) => 
        total + Object.keys(targetElements[setName]).length, 0)
    });
    
    return result;

  } catch (error) {
    console.error('Error processing Rule-1 data:', error);
    return null;
  }
};
