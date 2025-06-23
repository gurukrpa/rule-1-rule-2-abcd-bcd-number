// src/components/Rule1Page_Enhanced.jsx
// Enhanced Rule1Page with caching and unified data service

import React, { useState, useEffect } from 'react';
import { unifiedDataService } from '../services/unifiedDataService';
import { DataService } from '../services/dataService_new';
import { useCachedData, useAnalysisCache } from '../hooks/useCachedData';
import { redisCache } from '../services/redisClient';
import ProgressBar from './ProgressBar';

function Rule1PageEnhanced({ date, selectedUser, datesList, onBack, users }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [activeHR, setActiveHR] = useState(null);
  const [allDaysData, setAllDaysData] = useState({});
  const [windowType, setWindowType] = useState('');
  const [abcdBcdAnalysis, setAbcdBcdAnalysis] = useState({});
  const [multipleAnalyses, setMultipleAnalyses] = useState([]); // Store multiple D-day analyses
  
  // Topic selection state
  const [selectedTopics, setSelectedTopics] = useState(new Set()); // Set of selected topic names
  const [availableTopics, setAvailableTopics] = useState([]); // All available topics
  const [showTopicSelector, setShowTopicSelector] = useState(true); // Show/hide topic selector
  
  // Column headers with validation status
  const [columnHeaders, setColumnHeaders] = useState({});
  
  // Redis caching hooks
  const { 
    cacheStats, 
    getExcelData, 
    getHourEntry,
    cacheAnalysis,
    getCachedAnalysis 
  } = useCachedData(selectedUser);
  
  const { 
    cachedResult, 
    cacheHit, 
    checkCache, 
    saveToCache 
  } = useAnalysisCache(selectedUser, 'rule1');
  
  // Initialize DataService (fallback) and unified service
  const dataService = new DataService(); // Keep for legacy compatibility
  
  console.log('🔥 Rule1Page using unified data service:', unifiedDataService.getServiceInfo());

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

  // Extract the FIRST number after element prefix, similar to Rule-2
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    
    // Look for pattern: element-NUMBER/ or element-NUMBER-
    const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
    return match ? Number(match[1]) : null;
  };

  // Extract just the element prefix with number and dash
  const extractElementPrefix = (str) => {
    if (typeof str !== 'string') return null;
    
    // Look for pattern: element-NUMBER- and return everything up to and including the dash
    const match = str.match(/^([a-z]+-\d+-)/);
    return match ? match[1] : null;
  };

  // Extract element prefix with first zodiac sign
  const extractElementPrefixWithSign = (str) => {
    if (typeof str !== 'string') return null;
    
    // Look for pattern: element-NUMBER-/planet-(number SIGN number) and extract element-NUMBER- SIGN
    const match = str.match(/^([a-z]+-\d+-)[^(]*\((\d+)\s+([A-Za-z]+)\s+\d+\)/);
    return match ? `${match[1]} ${match[3].toLowerCase()}` : null;
  };

  // Enhanced data fetching with retry mechanism and timeout protection
  const extractFromDateAndSetEnhanced = async (targetDate, setName, retryCount = 0) => {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second base delay
    const timeout = 10000; // 10 second timeout
    const cacheKey = `${targetDate}_${setName}_${activeHR}`;

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Data fetch timeout')), timeout);
    });

    try {
      // Enhanced data fetching with timeout protection using unified service
      const fetchPromise = Promise.all([
        getExcelData(selectedUser, targetDate),
        getHourEntry(selectedUser, targetDate)
      ]);

      const [excelData, hourData] = await Promise.race([fetchPromise, timeoutPromise]);

      if (!excelData || !hourData) {
        console.log(`📦 [Rule-1 Enhanced] Missing data for ${targetDate}: Excel(${!!excelData}) Hour(${!!hourData})`);
        
        // Retry logic for genuine failures
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount); // Progressive delay
          console.log(`🔄 [Rule-1 Enhanced] Retrying ${targetDate}/${setName} in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return extractFromDateAndSetEnhanced(targetDate, setName, retryCount + 1);
        }

        return { numbers: [], status: 'failed' };
      }

      const sets = excelData.data?.sets || excelData.sets || {};
      const planetSelections = hourData.planetSelections || {};
      const allNumbers = new Set();

      // Find the specific set
      const setData = sets[setName];
      if (setData) {
        // Use the active HR for planet selection
        const selectedPlanet = planetSelections[activeHR];
        
        if (selectedPlanet) {
          console.log(`🪐 [Rule-1 Enhanced] Using planet ${selectedPlanet} from HR ${activeHR} for ${setName} on ${targetDate}`);
          
          // Process each element in the set
          Object.entries(setData).forEach(([elementName, planetData]) => {
            const rawString = planetData[selectedPlanet];
            if (rawString) {
              const elementNumber = extractElementNumber(rawString);
              if (elementNumber !== null) {
                allNumbers.add(elementNumber);
              }
            }
          });
        } else {
          console.log(`❌ [Rule-1 Enhanced] No planet selected for HR ${activeHR} on ${targetDate}`);
        }
      }

      const result = {
        numbers: Array.from(allNumbers).sort((a, b) => a - b),
        status: 'success'
      };

      return result;

    } catch (e) {
      console.error(`❌ [Rule-1 Enhanced] Error extracting from ${targetDate} and ${setName}:`, e);
      
      // Retry logic for errors
      if (retryCount < maxRetries && !e.message.includes('timeout')) {
        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(`🔄 [Rule-1 Enhanced] Retrying ${targetDate}/${setName} after error in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return extractFromDateAndSetEnhanced(targetDate, setName, retryCount + 1);
      }

      return { numbers: [], status: 'error', error: e.message };
    }
  };

  // Maintain backward compatibility
  const extractFromDateAndSet = async (targetDate, setName) => {
    const result = await extractFromDateAndSetEnhanced(targetDate, setName);
    return result.numbers || [];
  };

  // Process ABCD-BCD analysis for a specific set using sliding window approach
  const processSetAnalysis = async (setName, aDay, bDay, cDay, dDay) => {
    // Extract numbers from each day for this specific set
    const dDayNumbers = await extractFromDateAndSet(dDay, setName);
    const cDayNumbers = await extractFromDateAndSet(cDay, setName);
    const bDayNumbers = await extractFromDateAndSet(bDay, setName);
    const aDayNumbers = await extractFromDateAndSet(aDay, setName);
    
    if (dDayNumbers.length === 0) {
      return {
        setName,
        abcdNumbers: [],
        bcdNumbers: [],
        dDayCount: 0,
        error: 'No target date numbers found'
      };
    }

    // Step 1: ABCD Analysis - Target date numbers appearing in ≥2 of A, B, C days
    const abcdCandidates = dDayNumbers.filter(num => {
      let count = 0;
      if (aDayNumbers.includes(num)) count++;
      if (bDayNumbers.includes(num)) count++;
      if (cDayNumbers.includes(num)) count++;
      return count >= 2;
    });

    // Step 2: BCD Analysis - Target date numbers appearing in exclusive B-target or C-target pairs
    const bcdCandidates = dDayNumbers.filter(num => {
      const inB = bDayNumbers.includes(num);
      const inC = cDayNumbers.includes(num);
      const inTarget = dDayNumbers.includes(num); // Always true since we're filtering dDayNumbers
      
      // BCD qualification: (B-target pair only) OR (C-target pair only) - exclude if in both B and C
      const bTargetPairOnly = inB && inTarget && !inC; // B-target pair but NOT in C
      const cTargetPairOnly = inC && inTarget && !inB; // C-target pair but NOT in B
      return bTargetPairOnly || cTargetPairOnly;
    });

    // Step 3: Apply mutual exclusivity - ABCD takes priority over BCD
    const abcdNumbers = abcdCandidates.sort((a, b) => a - b);
    const bcdNumbers = bcdCandidates
      .filter(num => !abcdCandidates.includes(num)) // Exclude numbers already in ABCD
      .sort((a, b) => a - b);

    console.log(`🔍 [Rule-1] ${setName} Analysis:`, {
      targetDateNumbers: dDayNumbers,
      abcdCandidates,
      bcdCandidates,
      finalABCD: abcdNumbers,
      finalBCD: bcdNumbers
    });

    return {
      setName,
      abcdNumbers,
      bcdNumbers,
      dDayCount: dDayNumbers.length,
      aDayCount: aDayNumbers.length,
      bDayCount: bDayNumbers.length,
      cDayCount: cDayNumbers.length
    };
  };

  // Topic selection functions
  const handleTopicToggle = (topic) => {
    const newSelectedTopics = new Set(selectedTopics);
    if (selectedTopics.has(topic)) {
      newSelectedTopics.delete(topic);
    } else {
      newSelectedTopics.add(topic);
    }
    setSelectedTopics(newSelectedTopics);
  };

  const handleSelectAll = () => {
    setSelectedTopics(new Set(availableTopics));
  };

  const handleClearAll = () => {
    setSelectedTopics(new Set());
  };

  const formatSetName = (setName) => {
    return setName.replace(/\s+Matrix$/i, '');
  };

  // Get topics to display based on selection
  const getTopicsForDisplay = () => {
    if (selectedTopics.size === 0) {
      return availableTopics;
    }
    return availableTopics.filter(topic => selectedTopics.has(topic));
  };

  // Enhanced data loading with caching
  const buildAllDaysData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 [Rule-1 Enhanced] Loading data for user ${selectedUser}, date ${date}`);

      // Check cache first
      const cacheKey = `rule1_data_${selectedUser}_${date}`;
      const cachedData = await getCachedAnalysis(cacheKey);
      if (cachedData && cacheHit) {
        console.log(`🚀 [Rule-1 Enhanced] Using cached data`);
        setAllDaysData(cachedData.allDaysData);
        setAvailableTopics(cachedData.availableTopics);
        setActiveHR(cachedData.activeHR);
        setLoading(false);
        return;
      }

      // Sort all dates ascending (oldest → newest)
      const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
      const targetIdx = sortedDates.indexOf(date);

      // Show ALL available dates for complete historical analysis
      let windowDates = sortedDates;
      
      if (windowDates.length < 4) {
        setError(`Rule-1 requires at least 4 total dates. Only ${windowDates.length} dates available.`);
        setLoading(false);
        return;
      }

      const dateIndex = sortedDates.indexOf(date);
      if (dateIndex >= 3) {
        setWindowType(`Complete Historical View (showing ${windowDates.length} dates including ${dateIndex + 1}th date)`);
      } else {
        setWindowType('Insufficient Data');
        setError(`Rule-1 requires at least 4 total dates. Current date ${date} is the ${dateIndex + 1}th date.`);
        setLoading(false);
        return;
      }

      const assembled = {};

      // Process each date with enhanced data fetching
      for (let idx = 0; idx < windowDates.length; idx++) {
        const d = windowDates[idx];
        const dateKey = d;
        
        console.log(`📊 [Rule-1 Enhanced] Loading date ${idx + 1}/${windowDates.length} (${d})...`);

        try {
          const excelData = await getExcelData(selectedUser, d);
          const hourData = await getHourEntry(selectedUser, d);

          if (excelData && hourData) {
            const planetSel = hourData.planetSelections || {};
            const hrData = {};
            
            Object.entries(planetSel).forEach(([hr, selectedPlanet]) => {
              const oneHR = { selectedPlanet, sets: {} };
              const setsData = excelData.data?.sets || excelData.sets || {};
              
              Object.entries(setsData).forEach(([setName, elementBlock]) => {
                const elementsToShow = {};
                
                Object.entries(elementBlock).forEach(([elementName, planetData]) => {
                  const rawString = planetData[selectedPlanet];
                  elementsToShow[elementName] = {
                    rawData: rawString || null,
                    selectedPlanet,
                    hasData: !!rawString
                  };
                });
                
                oneHR.sets[setName] = elementsToShow;
              });
              hrData[hr] = oneHR;
            });

            assembled[dateKey] = {
              date: d,
              hrData,
              success: Object.keys(hrData).length > 0,
              index: idx,
              dateKey
            };
          } else {
            assembled[dateKey] = {
              date: d,
              hrData: {},
              success: false,
              error: !excelData ? 'No Excel data' : 'No Hour Entry data',
              index: idx,
              dateKey
            };
          }
        } catch (dateError) {
          assembled[dateKey] = {
            date: d,
            hrData: {},
            success: false,
            error: dateError.message || 'Unknown error',
            index: idx,
            dateKey
          };
        }
      }

      setAllDaysData(assembled);

      // Auto-select first available HR
      let firstHR = null;
      for (const dateKey of Object.keys(assembled)) {
        if (assembled[dateKey]?.success) {
          const hrKeys = Object.keys(assembled[dateKey].hrData || {});
          if (hrKeys.length) {
            firstHR = hrKeys[0];
            break;
          }
        }
      }
      
      if (firstHR) {
        setActiveHR(firstHR);
      }

      // Collect available topics
      const discoveredSets = new Set();
      Object.values(assembled).forEach(dayData => {
        if (dayData.success && dayData.hrData) {
          Object.values(dayData.hrData).forEach(hrData => {
            Object.keys(hrData.sets || {}).forEach(setName => {
              discoveredSets.add(setName);
            });
          });
        }
      });

      const orderedTopics = TOPIC_ORDER.filter(topicName => discoveredSets.has(topicName));
      setAvailableTopics(orderedTopics);
      setSelectedTopics(new Set(orderedTopics));

      // Cache the result
      await cacheAnalysis(cacheKey, {
        allDaysData: assembled,
        availableTopics: orderedTopics,
        activeHR: firstHR
      });

      setLoading(false);
      
    } catch (err) {
      console.error('❌ [Rule-1 Enhanced] Error building all days data:', err);
      setError(`Error loading data: ${err.message || 'Unknown error occurred'}`);
      setLoading(false);
    }
  };

  // Initialize data loading
  useEffect(() => {
    if (selectedUser && datesList && date) {
      buildAllDaysData();
    }
  }, [selectedUser, datesList, date]);

  // Color coding function for ABCD/BCD numbers
  const renderColorCodedDayNumber = (displayValue, setName, dateKey) => {
    if (displayValue === '—' || displayValue === '(No Data)') {
      return displayValue;
    }

    const elementNumber = extractElementNumber(displayValue);
    if (elementNumber === null) return displayValue;

    // Check if we have analysis data for this set
    const setAnalysis = abcdBcdAnalysis[setName];
    if (!setAnalysis) return displayValue;

    const { abcdNumbers, bcdNumbers } = setAnalysis;
    
    // Check if this number is in ABCD or BCD results
    if (abcdNumbers.includes(elementNumber)) {
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="text-data-value">{displayValue}</span>
          <span className="bg-green-200 text-green-800 text-xs font-medium px-1 py-0.5 rounded">
            ABCD
          </span>
        </div>
      );
    } else if (bcdNumbers.includes(elementNumber)) {
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="text-data-value">{displayValue}</span>
          <span className="bg-blue-200 text-blue-800 text-xs font-medium px-1 py-0.5 rounded">
            BCD
          </span>
        </div>
      );
    }

    return displayValue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enhanced Rule-1 analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="container mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Rule-1 Data</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={onBack}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg"
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get available dates for display
  const availableDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));
  const topicsToDisplay = getTopicsForDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6 border-t-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Past Days</h1>
              <div className="text-sm text-purple-800 mt-1">
                <p>👤 User ID: {selectedUser}</p>
                <p>📅 Target Date: {date}</p>
                <p>🪟 {windowType}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                ← Back to Main
              </button>
            </div>
          </div>        </div>

        {/* HR Selection - positioned after header */}
        {activeHR && (
          <div className="bg-white rounded-lg shadow-md mb-6 p-4">
            <div className="flex flex-wrap gap-2">
              {(() => {
                const allHRs = new Set();
                availableDates.forEach(dateKey => {
                  if (allDaysData[dateKey]?.success) {
                    Object.keys(allDaysData[dateKey].hrData || {}).forEach(hr => allHRs.add(hr));
                  }
                });
                return Array.from(allHRs).sort((a, b) => parseInt(a) - parseInt(b));
              })().map(hr => (
                <button
                  key={hr}
                  onClick={() => setActiveHR(hr)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    activeHR === hr
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  HR {hr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Topic Selection */}
        {showTopicSelector && (
          <div className="bg-white rounded-lg shadow-md mb-6 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">📊 Topic Selection</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowTopicSelector(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Hide
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {availableTopics.map(topic => (
                <label key={topic} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedTopics.has(topic)}
                    onChange={() => handleTopicToggle(topic)}
                    className="rounded border-gray-300"
                  />
                  <span className="truncate">{formatSetName(topic)}</span>
                </label>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Selected: {selectedTopics.size} / {availableTopics.length} topics
            </div>
          </div>
        )}

        {!showTopicSelector && (
          <div className="mb-4">
            <button
              onClick={() => setShowTopicSelector(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              📊 Show Topic Selection ({selectedTopics.size} selected)
            </button>
          </div>
        )}

        {/* Matrix Display */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              📋 Rule-1 Matrix Analysis
              {activeHR && ` - HR ${activeHR}`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {topicsToDisplay.length} topics across {availableDates.length} dates
            </p>
          </div>
          
          <div className="overflow-x-auto max-h-screen">
            {topicsToDisplay.length > 0 ? (
              topicsToDisplay.map(setName => (
                <div key={setName} className="mb-8">
                  <div className="bg-blue-100 p-3 font-bold text-lg">
                    📊 {formatSetName(setName)}
                  </div>
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                          Element
                        </th>
                        {availableDates.map(dateKey => {
                          const formattedDate = new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          const planetAbbr = (() => {
                            const dayData = allDaysData[dateKey];
                            if (dayData?.success && dayData.hrData[activeHR]) {
                              return dayData.hrData[activeHR].selectedPlanet || '';
                            }
                            return '';
                          })();
                          
                          return (
                            <th key={dateKey} className={`border border-gray-300 px-4 py-2 text-center font-medium text-xs ${
                              dateKey === date ? 'bg-blue-500 text-white' : 'text-gray-700'
                            }`}>
                              <div>{formattedDate}-{planetAbbr}({availableDates.indexOf(dateKey) < 4 ? String.fromCharCode(65 + availableDates.indexOf(dateKey)) : 'D'})</div>
                              {dateKey === date && <div className="text-xs font-bold">TARGET</div>}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const elementNames = ['Lagna', 'Moon', 'Hora Lagna', 'Ghati Lagna', 'Vighati Lagna', 'Varnada Lagna', 'Sree Lagna', 'Pranapada Lagna', 'Indu Lagna'];
                        
                        return elementNames.map(elName => (
                          <tr key={elName} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 font-medium bg-blue-200">
                              {elName}
                            </td>
                            {availableDates.map(dateKey => {
                              const dayData = allDaysData[dateKey];
                              let cellValue = '—';
                              let hasData = false;
                              
                              // Safely extract cell value with multiple fallback checks
                              if (dayData?.success && dayData.hrData[activeHR]?.sets[setName] && dayData.hrData[activeHR].sets[setName][elName]) {
                                const elementData = dayData.hrData[activeHR].sets[setName][elName];
                                hasData = elementData.hasData;
                                cellValue = elementData.rawData || '—';
                              }
                              
                              const baseClass = 'border border-gray-300 px-4 py-2 text-center font-mono text-sm';
                              const isTargetDate = dateKey === date;
                              
                              return (
                                <td
                                  key={dateKey}
                                  className={`${baseClass} ${
                                    isTargetDate
                                      ? 'ring-2 ring-blue-400 bg-blue-50'
                                      : hasData 
                                        ? 'bg-green-50 text-gray-800' 
                                        : 'bg-red-50 text-gray-400'
                                  }`}
                                >
                                  {renderColorCodedDayNumber(cellValue, setName, dateKey)}
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">No Topics Selected</h3>
                <p>Please select topics to view the analysis matrix.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rule1PageEnhanced;
