import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataService } from '../services/dataService';
import { Rule2ResultsService } from '../services/rule2ResultsService';
import ProgressBar from './ProgressBar';
import { performAbcdBcdAnalysis } from '../utils/abcdBcdAnalysis';

/**
 * Rule2CompactPage - Compact 30-Topic ABCD-BCD Analysis
 * 
 * Displays results for all available sets in single-row format:
 * "D-1 Set-1 Matrix -ABCD Numbers- 6,7,8,10 / BCD Numbers- 1"
 */
const Rule2CompactPage = ({ date, selectedUser, selectedUserData, datesList, onBack, activeHR }) => {
  const navigate = useNavigate();
  const userId = selectedUser;
  const [topicResults, setTopicResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [error, setError] = useState('');
  const [analysisInfo, setAnalysisInfo] = useState({});
  const [selectedHR, setSelectedHR] = useState(activeHR || '1');
  const [availableHRs, setAvailableHRs] = useState([]);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Initialize DataService for localStorage fallback during migration
  const dataService = new DataService();

  // 🚀 OPTIMIZED: Debounced HR change to avoid frequent re-analysis
  const handleHRChange = (newHR) => {
    setSelectedHR(newHR);
    
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set new timer for debounced re-analysis
    const timer = setTimeout(() => {
      // Trigger re-analysis after 500ms delay
      if (newHR !== selectedHR) {
        console.log('🔄 HR changed, triggering re-analysis...');
        performAnalysis();
      }
    }, 500);
    
    setDebounceTimer(timer);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Extract the FIRST number after element prefix, e.g. "as-7/su-..." → 7
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    
    // Look for pattern: element-NUMBER/ or element-NUMBER-
    const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
    return match ? Number(match[1]) : null;
  };

  // 🚀 OPTIMIZED: Cache data loading to avoid repeated fetches
  const dateDataCache = new Map();
  
  // Pre-load all date data once and cache it
  const preloadDateData = async (dates) => {
    const loadPromises = dates.map(async (targetDate) => {
      try {
        const [excelData, hourData] = await Promise.all([
          dataService.getExcelData(userId, targetDate),
          dataService.getHourEntry(userId, targetDate)
        ]);
        
        dateDataCache.set(targetDate, {
          excelData,
          hourData,
          sets: excelData?.data?.sets || {},
          planetSelections: hourData?.planetSelections || {}
        });
        
        return { date: targetDate, success: true };
      } catch (e) {
        console.error(`Error preloading ${targetDate}:`, e);
        dateDataCache.set(targetDate, { excelData: null, hourData: null, sets: {}, planetSelections: {} });
        return { date: targetDate, success: false };
      }
    });
    
    return Promise.all(loadPromises);
  };

  // 🚀 OPTIMIZED: Extract numbers from cached data
  const extractFromDateAndSet = (targetDate, setName) => {
    const cachedData = dateDataCache.get(targetDate);
    console.log(`🔍 Debug extractFromDateAndSet for ${targetDate}, set ${setName}:`, {
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
            const elementNumber = extractElementNumber(rawString);
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
  };

  // 🚀 ENHANCED: Process ABCD-BCD analysis using centralized utility
  const processSetAnalysis = (setName, aDay, bDay, cDay, dDay) => {
    // Extract numbers from each day for this specific set using cached data
    const dDayNumbers = extractFromDateAndSet(dDay, setName);
    const cDayNumbers = extractFromDateAndSet(cDay, setName);
    const bDayNumbers = extractFromDateAndSet(bDay, setName);
    const aDayNumbers = extractFromDateAndSet(aDay, setName);
    
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

    // ✅ Use enhanced utility function for consistent analysis
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
  };

  // Define the 30-topic order in ascending numerical order
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

  // 🚀 OPTIMIZED: Get all available sets from cached D-day data
  const getAllAvailableSets = (dDay) => {
    const cachedData = dateDataCache.get(dDay);
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
    console.log(`📋 Available set names in data:`, availableSetNames);
    console.log(`📋 TOPIC_ORDER filter:`, TOPIC_ORDER);
    
    // Return sets in the predefined order, only including those that actually exist
    const filteredSets = TOPIC_ORDER.filter(topicName => availableSetNames.includes(topicName));
    console.log(`✅ Filtered available sets:`, filteredSets);
    return filteredSets;
  };

  // 🚀 OPTIMIZED: Get available HRs from cached D-day data
  const getAvailableHRs = (dDay) => {
    const cachedData = dateDataCache.get(dDay);
    if (!cachedData || !cachedData.hourData) return [];
    
    const { planetSelections } = cachedData;
    return Object.keys(planetSelections).sort((a, b) => parseInt(a) - parseInt(b));
  };

  useEffect(() => {
    const performAnalysis = async () => {
      setLoadingProgress(0);
      setLoadingMessage('Initializing analysis...');
      
      if (!datesList?.length) {
        setError('Date list is empty or invalid.');
        setLoading(false);
        return;
      }

      if (datesList.length < 4) {
        setError('Need at least 4 dates to perform ABCD-BCD number extraction');
        setLoading(false);
        return;
      }

      try {
        setLoadingProgress(10);
        setLoadingMessage('Sorting dates...');
        
        // Sort dates in ascending order (oldest to newest)
        const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
        
        // Find the clicked date position
        const clickedIndex = sortedDates.findIndex(d => d === date);
        
        if (clickedIndex < 4) {
          setError(`Rule-2 can only be triggered from the 5th date onwards. Current position: ${clickedIndex + 1}`);
          setLoading(false);
          return;
        }
        
        setLoadingProgress(20);
        setLoadingMessage('Determining ABCD sequence...');
        
        // Take the 4 dates BEFORE the clicked date as ABCD sequence
        const aDay = sortedDates[clickedIndex - 4]; // 4 days before clicked date
        const bDay = sortedDates[clickedIndex - 3]; // 3 days before clicked date
        const cDay = sortedDates[clickedIndex - 2]; // 2 days before clicked date
        const dDay = sortedDates[clickedIndex - 1]; // 1 day before clicked date (D-day source)

        setLoadingProgress(30);
        setLoadingMessage('🚀 Pre-loading all date data...');
        
        // 🚀 OPTIMIZATION: Pre-load all date data once instead of repeated fetches
        const allDates = [aDay, bDay, cDay, dDay];
        await preloadDateData(allDates);
        
        // 🔍 COMPREHENSIVE DEBUG: Check data loading results
        console.log('🔍 === DATA PIPELINE DEBUG ===');
        console.log('📅 Dates to process:', { aDay, bDay, cDay, dDay });
        console.log('👤 User ID:', userId);
        console.log('🪐 Selected HR:', selectedHR);
        
        // Check what data was actually loaded
        allDates.forEach(date => {
          const cachedData = dateDataCache.get(date);
          console.log(`📊 ${date} data:`, {
            hasCache: !!cachedData,
            hasExcelData: !!cachedData?.excelData,
            hasHourData: !!cachedData?.hourData,
            setsCount: Object.keys(cachedData?.sets || {}).length,
            planetSelectionsCount: Object.keys(cachedData?.planetSelections || {}).length,
            sets: Object.keys(cachedData?.sets || {}),
            planetSelections: cachedData?.planetSelections
          });
        });
        
        setLoadingProgress(40);
        setLoadingMessage('Getting available HRs...');
        
        // Get available HRs from cached D-day data
        const hrOptions = getAvailableHRs(dDay);
        setAvailableHRs(hrOptions);
        
        if (hrOptions.length > 0 && !hrOptions.includes(selectedHR)) {
          setSelectedHR(hrOptions[0]);
        }

        setLoadingProgress(50);
        setLoadingMessage('Getting available sets...');

        console.log('🎯 Rule2CompactPage - Processing all sets:');
        console.log('Clicked date (Rule-2 trigger):', date);
        console.log('A-day (oldest in sequence):', aDay);
        console.log('B-day:', bDay);
        console.log('C-day:', cDay);
        console.log('D-day (analysis day):', dDay);
        console.log('🪐 Available HRs:', hrOptions, 'Selected HR:', selectedHR);

        // Get all available sets from cached D-day data
        const availableSets = getAllAvailableSets(dDay);
        console.log('📊 Available sets:', availableSets);

        setLoadingProgress(60);
        setLoadingMessage(`🚀 Analyzing ${availableSets.length} sets in parallel...`);

        // 🚀 OPTIMIZATION: Process all sets in parallel using cached data
        const results = [];
        const batchSize = 10; // Process sets in batches to avoid overwhelming the browser
        
        for (let i = 0; i < availableSets.length; i += batchSize) {
          const batch = availableSets.slice(i, i + batchSize);
          
          // Update progress for each batch
          const batchProgress = 60 + Math.floor(((i + batch.length) / availableSets.length) * 30);
          setLoadingProgress(batchProgress);
          setLoadingMessage(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(availableSets.length/batchSize)}: ${batch.length} sets`);
          
          // Process batch in parallel (no async needed since we use cached data)
          const batchResults = batch.map(setName => {
            const result = processSetAnalysis(setName, aDay, bDay, cDay, dDay);
            console.log(`📊 ${setName}: ABCD(${result.abcdNumbers.length}) BCD(${result.bcdNumbers.length}) D-day(${result.dDayCount})`);
            return result;
          });
          
          results.push(...batchResults);
          
          // Small delay between batches to keep UI responsive
          if (i + batchSize < availableSets.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }

        setLoadingProgress(90);
        setLoadingMessage('Calculating overall ABCD/BCD results...');

        // Calculate overall ABCD/BCD numbers by applying the filtering logic to ALL combined numbers
        const allDDayNumbers = new Set();
        const allADayNumbers = new Set();
        const allBDayNumbers = new Set();
        const allCDayNumbers = new Set();
        
        // Collect ALL numbers from all topics for each day
        availableSets.forEach(setName => {
          const dDayNumbers = extractFromDateAndSet(dDay, setName);
          const aDayNumbers = extractFromDateAndSet(aDay, setName);
          const bDayNumbers = extractFromDateAndSet(bDay, setName);
          const cDayNumbers = extractFromDateAndSet(cDay, setName);
          
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
        
        console.log('🎉 Rule2CompactPage Final Overall Results:');
        console.log('📊 Overall ABCD Numbers:', finalAbcdNumbers);
        console.log('📊 Overall BCD Numbers:', finalBcdNumbers);
        
        // Summary of filtering applied
        console.log('🔍 Filtering Summary:');
        console.log(`   📈 Total D-day numbers from all topics: ${combinedDDayNumbers.length}`);
        console.log(`   ✅ ABCD candidates (≥2 in A,B,C): ${overallAbcdCandidates.length}`);
        console.log(`   ✅ BCD candidates (exclusive B-D or C-D): ${overallBcdCandidates.length}`);
        console.log(`   🎯 Final ABCD (after priority): ${finalAbcdNumbers.length}`);
        console.log(`   🎯 Final BCD (after exclusion): ${finalBcdNumbers.length}`);
        
        setLoadingProgress(95);
        setLoadingMessage('Saving results to database...');
        
        // Save overall ABCD/BCD results to Supabase for Rule1Page display
        try {
          const saveResult = await Rule2ResultsService.saveResults(userId, date, finalAbcdNumbers, finalBcdNumbers);
          if (saveResult.success) {
            console.log(`✅ [Rule2Compact] Successfully saved overall ABCD/BCD results to Supabase for ${date}`);
            setLoadingMessage('Analysis complete & saved!');
          } else {
            console.error(`❌ [Rule2Compact] Failed to save results to Supabase:`, saveResult.error);
            setLoadingMessage('Analysis complete (save failed)');
          }
        } catch (saveError) {
          console.error(`❌ [Rule2Compact] Exception saving results to Supabase:`, saveError);
          setLoadingMessage('Analysis complete (save error)');
        }

        setTopicResults(results);
        setAnalysisInfo({
          aDay, bDay, cDay, dDay,
          triggerDate: date,
          totalSets: availableSets.length,
          selectedHR,
          availableHRs: hrOptions,
          // Add overall results to analysis info
          overallAbcdNumbers: finalAbcdNumbers,
          overallBcdNumbers: finalBcdNumbers
        });

        setLoadingProgress(100);
        setLoadingMessage('Analysis complete!');
        
        // Small delay to show completion before hiding loading
        setTimeout(() => {
          setLoading(false);
        }, 500);

      } catch (error) {
        console.error('Error in Rule2CompactPage analysis:', error);
        setError('Error performing ABCD-BCD analysis: ' + error.message);
        setLoading(false);
      }
    };

    performAnalysis();
  }, [userId, date, datesList, selectedHR]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">🚀 Processing 30-Topic Analysis (Optimized)</h3>
            <p className="text-sm text-gray-600 mt-1">Fast parallel processing with data caching...</p>
          </div>
          
          <ProgressBar 
            progress={loadingProgress}
            message={loadingMessage}
            color="purple"
            className="mb-4"
          />
          
          {loadingProgress > 80 && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                🚀 Optimized performance with data caching and parallel processing
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Analysis Error</div>
          <p className="mb-4 text-gray-700">{error}</p>
          <button onClick={onBack} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const { aDay, bDay, cDay, dDay, totalSets, selectedHR: currentHR, availableHRs: hrOptions } = analysisInfo;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-purple-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔗 Rule-2 Compact Analysis (30-Topic Format)</h1>
              <div className="mt-2 text-sm text-purple-800">
                <p>👤 User: {selectedUserData?.username || userId}</p>
                <p>📅 Trigger Date (5th): {new Date(date).toLocaleDateString()}</p>
                <p>📊 Total Topics Processed: {totalSets}</p>
                <p>🪐 Selected HR: {selectedHR}</p>
                <p>⚙️ ABCD Sequence: A({new Date(aDay).toLocaleDateString()}) → B({new Date(bDay).toLocaleDateString()}) → C({new Date(cDay).toLocaleDateString()}) → D({new Date(dDay).toLocaleDateString()})</p>
              </div>
            </div>
            <button onClick={onBack} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
              ← Back
            </button>
          </div>
        </div>

        {/* HR Selection */}
        {availableHRs && availableHRs.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">Select HR Period:</span>
              {availableHRs.map(hr => (
                <button
                  key={hr}
                  onClick={() => handleHRChange(hr)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedHR === hr
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  HR {hr}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Analysis uses planet selections from the chosen HR period for all 4 dates (A, B, C, D)
            </div>
          </div>
        )}

        {/* Compact Results Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📋 30-Topic Single-Row Results
          </h2>
          
          <div className="space-y-2 font-mono text-sm">
            {topicResults.map((result, index) => {
              const abcdDisplay = result.abcdNumbers.length > 0 ? result.abcdNumbers.join(',') : 'None';
              const bcdDisplay = result.bcdNumbers.length > 0 ? result.bcdNumbers.join(',') : 'None';
              
              return (
                <div
                  key={result.setName}
                  className={`p-3 rounded border-l-4 ${
                    result.abcdNumbers.length > 0 || result.bcdNumbers.length > 0
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-blue-700">
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                    <span className="font-bold text-gray-800">
                      {result.setName}
                    </span>
                    <span className="text-green-700">
                      -ABCD Numbers-
                    </span>
                    <span className="font-semibold bg-green-100 px-2 py-1 rounded">
                      {abcdDisplay}
                    </span>
                    <span className="text-blue-700">
                      / BCD Numbers-
                    </span>
                    <span className="font-semibold bg-blue-100 px-2 py-1 rounded">
                      {bcdDisplay}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      (D-day: {result.dDayCount} numbers)
                    </span>
                  </div>
                  
                  {/* Additional debug info for empty results */}
                  {result.error && (
                    <div className="text-xs text-red-600 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                  
                  {result.dDayCount === 0 && !result.error && (
                    <div className="text-xs text-gray-500 mt-1">
                      No source numbers found in D-day data for this set
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">📊 Summary Statistics</h3>
            
            {/* Overall ABCD/BCD Results */}
            {analysisInfo.overallAbcdNumbers && (
              <div className="mb-4 p-3 bg-white rounded border">
                <h4 className="font-semibold text-green-700 mb-2">🎯 Overall ABCD/BCD Results (Saved to Database)</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">ABCD Numbers:</span>
                    {analysisInfo.overallAbcdNumbers.length > 0 ? (
                      <div className="flex gap-1">
                        {analysisInfo.overallAbcdNumbers.map(num => (
                          <span key={num} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                            {num}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">None</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">BCD Numbers:</span>
                    {analysisInfo.overallBcdNumbers.length > 0 ? (
                      <div className="flex gap-1">
                        {analysisInfo.overallBcdNumbers.map(num => (
                          <span key={num} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                            {num}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">None</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>• HR Period used: <strong>HR {selectedHR}</strong></p>
              <p>• Total topics analyzed: <strong>{topicResults.length}</strong></p>
              <p>• Topics with ABCD numbers: <strong>{topicResults.filter(r => r.abcdNumbers.length > 0).length}</strong></p>
              <p>• Topics with BCD numbers: <strong>{topicResults.filter(r => r.bcdNumbers.length > 0).length}</strong></p>
              <p>• Topics with any results: <strong>{topicResults.filter(r => r.abcdNumbers.length > 0 || r.bcdNumbers.length > 0).length}</strong></p>
              <p>• Total ABCD numbers found: <strong>{topicResults.reduce((sum, r) => sum + r.abcdNumbers.length, 0)}</strong></p>
              <p>• Total BCD numbers found: <strong>{topicResults.reduce((sum, r) => sum + r.bcdNumbers.length, 0)}</strong></p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🔍 Analysis Criteria</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>ABCD Numbers:</strong> D-day numbers that appear in at least 2 out of 3 preceding days (A, B, C)</p>
              <p><strong>BCD Numbers:</strong> D-day numbers that form exclusive B-D pairs OR exclusive C-D pairs (NOT both B and C)</p>
              <p><strong>Mutual Exclusivity:</strong> Numbers cannot appear in both ABCD and BCD categories - ABCD takes priority</p>
              <p><strong>Source:</strong> All numbers extracted from Set matrices using the selected planet for HR {selectedHR}</p>
              <p><strong>HR Selection:</strong> Uses the same HR period's planet selection across all 4 dates for consistent analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rule2CompactPage;