// src/components/Rule1Page_Enhanced.jsx
// Enhanced Rule1Page with caching and unified data service

import React, { useState, useEffect } from 'react';
import { unifiedDataService } from '../services/unifiedDataService';
import { DataService } from '../services/dataService_new';
import { useCachedData, useAnalysisCache } from '../hooks/useCachedData';
import { redisCache } from '../services/redisClient';
import { Rule2ResultsService } from '../services/rule2ResultsService';
import rule2AnalysisService from '../services/rule2AnalysisService';
import ProgressBar from './ProgressBar';

function Rule1PageEnhanced({ date, analysisDate, selectedUser, datesList, onBack, users }) {
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
  
  // ✅ NEW: Number boxes state for 1-12 clickable numbers feature
  const [clickedNumbers, setClickedNumbers] = useState({}); // Track clicked numbers per topic-date
  const [numberPresenceStatus, setNumberPresenceStatus] = useState({}); // Track if numbers are present in data
  
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

  // ✅ FIXED: Topic matching utility to handle annotated names from database
  const createTopicMatcher = (expectedTopics, availableTopics) => {
    // Create a mapping from expected topics to available (annotated) topics
    const topicMap = new Map();
    
    expectedTopics.forEach(expectedTopic => {
      // Extract D-number and Set number from expected topic
      const expectedMatch = expectedTopic.match(/D-(\d+)\s+Set-(\d+)/);
      if (expectedMatch) {
        const [, dNumber, setNumber] = expectedMatch;
        
        // Find matching topic in available topics (may have annotations)
        const matchingTopic = availableTopics.find(availableTopic => {
          const availableMatch = availableTopic.match(/D-(\d+)(?:\s*\([^)]*\))?\s+Set-(\d+)/);
          if (availableMatch) {
            const [, availableDNumber, availableSetNumber] = availableMatch;
            return dNumber === availableDNumber && setNumber === availableSetNumber;
          }
          return false;
        });
        
        if (matchingTopic) {
          topicMap.set(expectedTopic, matchingTopic);
        }
      }
    });
    
    return topicMap;
  };

  // Define the 30-topic order in ascending numerical order (FIXED: removed annotations to match Excel format)
  const TOPIC_ORDER = [
    'D-1 Set-1 Matrix',
    'D-1 Set-2 Matrix',
    'D-3 Set-1 Matrix',
    'D-3 Set-2 Matrix',
    'D-4 Set-1 Matrix',
    'D-4 Set-2 Matrix',
    'D-5 Set-1 Matrix',
    'D-5 Set-2 Matrix',
    'D-7 Set-1 Matrix',
    'D-7 Set-2 Matrix',
    'D-9 Set-1 Matrix',
    'D-9 Set-2 Matrix',
    'D-10 Set-1 Matrix',
    'D-10 Set-2 Matrix',
    'D-11 Set-1 Matrix',
    'D-11 Set-2 Matrix',
    'D-12 Set-1 Matrix',
    'D-12 Set-2 Matrix',
    'D-27 Set-1 Matrix',
    'D-27 Set-2 Matrix',
    'D-30 Set-1 Matrix',
    'D-30 Set-2 Matrix',
    'D-60 Set-1 Matrix',
    'D-60 Set-2 Matrix',
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

  // Extract compact format: element-number-zodiac (e.g., as-8-sc)
  const extractCompactFormat = (str) => {
    if (typeof str !== 'string') return str;
    
    // Pattern: as-8-/mo-(06 Sc 18)-(16 Ge 04) → as-8-sc
    // Extract element-number and first zodiac sign abbreviation
    const match = str.match(/^([a-z]+-\d+)-\/[a-z]+-\(\d+\s+([A-Za-z]+)/);
    if (match) {
      const [, elementNumber, sign] = match;
      // Convert zodiac sign to lowercase and take first 2 characters
      const signAbbr = sign.toLowerCase().slice(0, 2);
      return `${elementNumber}-${signAbbr}`;
    }
    
    // If already in compact format, return as is
    if (str.match(/^[a-z]+-\d+-[a-z]{2}$/)) {
      return str;
    }
    
    // Fallback: try to extract just element-number
    const basicMatch = str.match(/^([a-z]+-\d+)/);
    if (basicMatch) {
      return basicMatch[1];
    }
    
    return str;
  };

  // Extract element prefix with first zodiac sign
  const extractElementPrefixWithSign = (str) => {
    if (typeof str !== 'string') return null;
    
    // Look for pattern: element-NUMBER-/planet-(number SIGN number) and extract element-NUMBER- SIGN
    const match = str.match(/^([a-z]+-\d+-)[^(]*\((\d+)\s+([A-Za-z]+)\s+\d+\)/);
    return match ? `${match[1]} ${match[3].toLowerCase()}` : null;
  };

  // ✅ NEW: Check if a number is present in the topic data for a specific date
  const checkNumberInTopicData = (number, setName, dateKey) => {
    const dayData = allDaysData[dateKey];
    if (!dayData?.success || !dayData.hrData[activeHR]?.sets[setName]) {
      return false;
    }

    const setData = dayData.hrData[activeHR].sets[setName];
    const elementNames = ['Lagna', 'Moon', 'Hora Lagna', 'Ghati Lagna', 'Vighati Lagna', 'Varnada Lagna', 'Sree Lagna', 'Pranapada Lagna', 'Indu Lagna'];
    
    // Search through all elements in this topic for the exact number
    for (const elementName of elementNames) {
      const elementData = setData[elementName];
      if (elementData?.hasData && elementData.rawData) {
        const extractedNumber = extractElementNumber(elementData.rawData);
        if (extractedNumber === number) {
          console.log(`🎯 [NumberBoxes] Found number ${number} in ${setName}/${dateKey}/${elementName}`);
          return true;
        }
      }
    }
    return false;
  };

  // ✅ NEW: Handle number box clicks
  const handleNumberBoxClick = (number, setName, dateKey) => {
    console.log(`🔢 [NumberBoxes] Clicked number ${number} for ${setName}/${dateKey}`);
    
    // Generate unique key for this number-topic-date combination
    const boxKey = `${setName}_${dateKey}_${number}`;
    
    // Check if number is present in the data
    const isPresent = checkNumberInTopicData(number, setName, dateKey);
    
    // Update clicked numbers state
    setClickedNumbers(prev => ({
      ...prev,
      [boxKey]: !prev[boxKey] // Toggle clicked state
    }));
    
    // Update presence status
    setNumberPresenceStatus(prev => ({
      ...prev,
      [boxKey]: isPresent
    }));
    
    console.log(`🎯 [NumberBoxes] Number ${number} is ${isPresent ? 'PRESENT' : 'NOT PRESENT'} in ${setName}/${dateKey}`);
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
      console.log(`🔍 [Rule-1 Enhanced] Loading data for user ${selectedUser}, display date: ${date}, analysis date: ${analysisDate || date}`);

      // Check cache first using the display date (since UI is keyed to display date)
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
      
      // FIXED: Use analysisDate for position calculation if provided (Past Days rule2page logic)
      const targetAnalysisDate = analysisDate || date;
      const targetIdx = sortedDates.indexOf(targetAnalysisDate);
      
      console.log(`🔄 [Rule-1 Enhanced] FIXED Past Days Logic:`, {
        displayDate: date,
        analysisDate: targetAnalysisDate,
        targetIndex: targetIdx,
        message: analysisDate ? `Display: ${date}, Analyze: ${analysisDate} (rule2page logic)` : `Standard mode: ${date}`
      });

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

      // ✅ FIXED: Use smart topic matching to handle annotated names from database
      const discoveredTopicsArray = Array.from(discoveredSets);
      const topicMatcher = createTopicMatcher(TOPIC_ORDER, discoveredTopicsArray);
      
      // Get ordered topics using the actual annotated names from database
      const orderedTopics = TOPIC_ORDER
        .filter(expectedTopic => topicMatcher.has(expectedTopic))
        .map(expectedTopic => topicMatcher.get(expectedTopic));
      
      // Debug logging for the fix
      console.log(`🎯 [Rule1Page] Topic Discovery (FIXED with Smart Matching):`, {
        discoveredSetsRaw: discoveredTopicsArray,
        discoveredSetsCount: discoveredSets.size,
        orderedTopicsCount: orderedTopics.length,
        orderedTopics: orderedTopics.slice(0, 5), // Show first 5
        topicMappings: Array.from(topicMatcher.entries()).slice(0, 3), // Show first 3 mappings
        expectedTotal: 30,
        actualFound: orderedTopics.length,
        missingCount: 30 - orderedTopics.length
      });
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

  // Load Rule-2 ABCD/BCD analysis results for display using real-time analysis
  const loadRule2AnalysisResults = async () => {
    try {
      console.log('🔍 [Rule1Page] Loading Rule-2 ABCD/BCD analysis results using real-time analysis...');
      
      // Get all available dates
      const availableDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));
      
      if (availableDates.length === 0) {
        console.log('⚠️ [Rule1Page] No dates available for Rule-2 analysis');
        return;
      }
      
      // ✅ IMPLEMENTATION: Past Days should show ABCD/BCD numbers using (N-1) pattern
      // For each date in Past Days, calculate ABCD/BCD numbers from the PREVIOUS date using rule2page logic
      console.log('🔄 [Rule1Page] Implementing (N-1) day pattern for Past Days...');
      
      const analysisData = {};
      
      // Process each date to get ABCD/BCD numbers from the previous date
      for (let i = 0; i < availableDates.length; i++) {
        const currentDate = availableDates[i];
        
        // ✅ PAST DAYS LOGIC: Show ABCD/BCD numbers from PREVIOUS date (N-1 pattern)
        // 5th day Past Days → Show 4th day's ABCD/BCD numbers
        // 6th day Past Days → Show 5th day's ABCD/BCD numbers
        if (i > 0) { // Skip first date as it has no previous date
          const previousDate = availableDates[i - 1]; // N-1 day
          
          console.log(`📅 [Rule1Page] Processing Past Days: "${currentDate}" shows ABCD/BCD from "${previousDate}"`);
          console.log(`📊 [Rule1Page] Available dates for analysis: [${availableDates.slice(0, i + 1).join(', ')}]`);
          
          try {
            // ✅ Use real-time Rule2 analysis logic instead of cached database results
            // IMPORTANT: Use all dates up to and INCLUDING the previous date for Rule2 analysis
            const datesForAnalysis = availableDates.slice(0, i + 1); // Include the previous date
            
            console.log(`🔧 [Rule1Page] Calling rule2AnalysisService.performRule2Analysis with:`);
            console.log(`   - User: ${selectedUser}`);
            console.log(`   - Trigger Date: ${previousDate}`);
            console.log(`   - Dates List: [${datesForAnalysis.join(', ')}]`);
            console.log(`   - HR: ${activeHR || 1}`);
            
            const rule2Analysis = await rule2AnalysisService.performRule2Analysis(
              selectedUser, 
              previousDate, // Analyze the PREVIOUS date (N-1)
              datesForAnalysis, // Use dates up to and including the previous date
              activeHR || 1
            );
            
            if (rule2Analysis.success) {
              console.log(`✅ [Rule1Page] Real-time analysis SUCCESS for "${previousDate}" (shown in "${currentDate}"):`);
              console.log(`   📊 ABCD Numbers: [${rule2Analysis.abcdNumbers.join(', ')}] (${rule2Analysis.abcdNumbers.length} total)`);
              console.log(`   📊 BCD Numbers: [${rule2Analysis.bcdNumbers.join(', ')}] (${rule2Analysis.bcdNumbers.length} total)`);
              console.log(`   📊 Analysis Date: ${rule2Analysis.analysisDate}`);
              console.log(`   📊 Summary:`, rule2Analysis.summary);
              
              // ✅ IMPORTANT: Store topic-specific ABCD/BCD numbers, not overall combined numbers
              console.log(`🎯 [Rule1Page] Expected specific numbers - ABCD: [7, 10], BCD: [3, 6, 8] (from D-1 Set-1 Matrix)`);
              console.log(`🎯 [Rule1Page] Received overall numbers - ABCD: [${rule2Analysis.abcdNumbers.join(', ')}], BCD: [${rule2Analysis.bcdNumbers.join(', ')}]`);
              
              // ✅ FIX: Get topic-specific ABCD/BCD numbers instead of overall combined results
              console.log(`🔧 [Rule1Page] Getting individual topic analyses instead of overall analysis...`);
              
              // Extract topic-specific results from the Rule2 analysis
              const topicResults = rule2Analysis.setResults || [];
              console.log(`📊 [Rule1Page] Found ${topicResults.length} topic-specific results`);
              
              // Process each topic individually (like Rule2CompactPage does)
              topicResults.forEach(topicResult => {
                const topicName = topicResult.setName;
                
                if (!analysisData[topicName]) {
                  analysisData[topicName] = {};
                }
                
                console.log(`🔍 [Rule1Page] Topic "${topicName}" individual analysis:`, {
                  abcdCount: topicResult.abcdNumbers.length,
                  bcdCount: topicResult.bcdNumbers.length,
                  abcdNumbers: topicResult.abcdNumbers,
                  bcdNumbers: topicResult.bcdNumbers
                });
                
                // Store topic-specific Rule-2 results for this date
                analysisData[topicName][currentDate] = {
                  abcdNumbers: topicResult.abcdNumbers || [],
                  bcdNumbers: topicResult.bcdNumbers || [],
                  source: 'rule2_topic_specific',
                  date: currentDate,
                  analysisDate: previousDate, // Track which date was actually analyzed
                  pattern: 'N-1', // Mark as Past Days N-1 pattern
                  topicName: topicName
                };
              });
              
              console.log(`✅ [Rule1Page] Successfully stored topic-specific ABCD/BCD data for ${topicResults.length} topics on date "${currentDate}"`);
            } else {
              console.error(`❌ [Rule1Page] Real-time analysis FAILED for "${previousDate}":`, rule2Analysis.error);
              console.log(`❌ [Rule1Page] Analysis details:`, rule2Analysis);
            }
          } catch (analysisError) {
            console.error(`❌ [Rule1Page] Error in real-time analysis for "${previousDate}":`, analysisError);
          }
        } else {
          console.log(`⚠️ [Rule1Page] Skipping first date "${currentDate}" - no previous date for N-1 pattern`);
        }
      }
      
      // Update abcdBcdAnalysis state with real-time Rule-2 results
      if (Object.keys(analysisData).length > 0) {
        console.log(`🎯 [Rule1Page] Setting real-time ABCD/BCD analysis data for ${Object.keys(analysisData).length} topics`);
        console.log(`📊 [Rule1Page] Past Days dates processed:`, Object.keys(analysisData[availableTopics[0]] || {}));
        
        // Debug: Show a sample of the analysis data structure
        const firstTopic = availableTopics[0];
        if (firstTopic && analysisData[firstTopic]) {
          console.log(`🔍 [Rule1Page] Sample analysis data for topic "${firstTopic}":`, analysisData[firstTopic]);
        }
        
        setAbcdBcdAnalysis(analysisData);
        console.log(`✅ [Rule1Page] abcdBcdAnalysis state updated successfully`);
      } else {
        console.log('ℹ️ [Rule1Page] No real-time ABCD/BCD numbers generated for any dates');
        console.log('🔍 [Rule1Page] This could mean:');
        console.log('   - No dates had sufficient data for Rule2 analysis');
        console.log('   - All Rule2 analyses failed');
        console.log('   - Not enough dates available (need at least 4 dates for Rule2)');
      }
      
    } catch (error) {
      console.error('❌ [Rule1Page] Error loading real-time Rule-2 analysis results:', error);
    }
  };

  // Initialize data loading
  useEffect(() => {
    if (selectedUser && datesList && date) {
      buildAllDaysData();
    }
  }, [selectedUser, datesList, date]);

  // Load Rule-2 analysis results after data is loaded
  useEffect(() => {
    if (Object.keys(allDaysData).length > 0 && availableTopics.length > 0 && selectedUser) {
      loadRule2AnalysisResults();
    }
  }, [allDaysData, availableTopics, selectedUser]);

  // Color coding function for ABCD/BCD numbers
  const renderColorCodedDayNumber = (displayValue, setName, dateKey) => {
    if (displayValue === '—' || displayValue === '(No Data)') {
      return displayValue;
    }

    const elementNumber = extractElementNumber(displayValue);
    if (elementNumber === null) return displayValue;

    // Check if we have analysis data for this set and date
    const setAnalysis = abcdBcdAnalysis[setName];
    if (!setAnalysis) {
      return displayValue;
    }
    
    if (!setAnalysis[dateKey]) {
      return displayValue;
    }

    const dateAnalysis = setAnalysis[dateKey];
    const abcdNumbers = dateAnalysis.abcdNumbers || [];
    const bcdNumbers = dateAnalysis.bcdNumbers || [];
    
    // 🔍 DETAILED DEBUG: Only log when we find a match
    if (abcdNumbers.includes(elementNumber) || bcdNumbers.includes(elementNumber)) {
      console.log(`🎯 [Rule1Page] MATCH FOUND! Element ${elementNumber} in "${setName}" on "${dateKey}":`, {
        displayValue,
        elementNumber,
        abcdNumbers,
        bcdNumbers,
        isInAbcd: abcdNumbers.includes(elementNumber),
        isInBcd: bcdNumbers.includes(elementNumber)
      });
    }
    
    // Check if this number is in ABCD or BCD results
    if (abcdNumbers.includes(elementNumber)) {
      console.log(`✅ [Rule1Page] Rendering ABCD tag for number ${elementNumber} (expected: 7, 10)`);
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="text-data-value">{displayValue}</span>
          <span className="bg-green-200 text-green-800 text-xs font-medium px-1 py-0.5 rounded">
            ABCD
          </span>
        </div>
      );
    } else if (bcdNumbers.includes(elementNumber)) {
      console.log(`✅ [Rule1Page] Rendering BCD tag for number ${elementNumber} (expected: 3, 6, 8)`);
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

  // ✅ NEW: Render 1-12 number boxes for dates starting from 5th date
  const renderNumberBoxes = (setName, dateKey, dateIndex) => {
    // Only show for 5th date onwards (index >= 4)
    if (dateIndex < 4) {
      return null;
    }

    return (
      <div className="mt-2 space-y-1">
        {/* Row 1: Numbers 1-6 */}
        <div className="flex gap-1 justify-center">
          {[1, 2, 3, 4, 5, 6].map(number => {
            const boxKey = `${setName}_${dateKey}_${number}`;
            const isClicked = clickedNumbers[boxKey];
            const isPresent = numberPresenceStatus[boxKey];
            
            // Determine button style
            const getButtonStyle = () => {
              if (isClicked && isPresent) {
                // Orange for found numbers
                return 'bg-orange-500 text-white hover:bg-orange-600';
              } else if (isClicked && !isPresent) {
                // Default style for not found (no special styling)
                return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
              } else {
                // Default unclicked style
                return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
              }
            };
            
            return (
              <button
                key={number}
                onClick={() => handleNumberBoxClick(number, setName, dateKey)}
                className={`w-6 h-6 text-xs font-medium rounded border transition-colors ${getButtonStyle()}`}
                title={`Click to check if number ${number} exists in ${setName} data for this date`}
              >
                {number}
              </button>
            );
          })}
        </div>
        
        {/* Row 2: Numbers 7-12 */}
        <div className="flex gap-1 justify-center">
          {[7, 8, 9, 10, 11, 12].map(number => {
            const boxKey = `${setName}_${dateKey}_${number}`;
            const isClicked = clickedNumbers[boxKey];
            const isPresent = numberPresenceStatus[boxKey];
            
            // Determine button style
            const getButtonStyle = () => {
              if (isClicked && isPresent) {
                // Dark green for found numbers
                return 'bg-green-700 text-white hover:bg-green-800';
              } else if (isClicked && !isPresent) {
                // Default style for not found (no special styling)
                return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
              } else {
                // Default unclicked style
                return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
              }
            };
            
            return (
              <button
                key={number}
                onClick={() => handleNumberBoxClick(number, setName, dateKey)}
                className={`w-6 h-6 text-xs font-medium rounded border transition-colors ${getButtonStyle()}`}
                title={`Click to check if number ${number} exists in ${setName} data for this date`}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6 border-t-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Past Days</h1>
              <div className="text-sm text-purple-800 mt-1">
                <p>👤 User ID: {selectedUser}</p>
                <p>📅 Target Date: {date}</p>
                {analysisDate && analysisDate !== date && (
                  <p>🔍 Analysis Source: {analysisDate} (rule2page logic)</p>
                )}
                <p>📊 ABCD/BCD Pattern: (N-1) Past Days - Real-time Topic-Specific Rule2 Analysis</p>
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
        <div className="bg-white rounded-lg shadow-lg w-full">
          <div className="p-4 bg-gray-50 border-b sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-800">
              📋 Rule-1 Matrix Analysis
              {activeHR && ` - HR ${activeHR}`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {topicsToDisplay.length} topics across {availableDates.length} dates
            </p>
          </div>
          
          <div className="p-4 space-y-6">
            {topicsToDisplay.length > 0 ? (
              topicsToDisplay.map(setName => (
                <div key={setName} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="bg-blue-100 p-3 font-bold text-lg rounded-t-lg border-b border-gray-200 sticky top-[88px] z-[5]">
                    📊 {formatSetName(setName)}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-max">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 min-w-[120px]">
                          Element
                        </th>
                        {availableDates.map(dateKey => {
                          // Format date as DD-M-YY (e.g., "1-6-25")
                          const dateObj = new Date(dateKey);
                          const day = dateObj.getDate();
                          const month = dateObj.getMonth() + 1; // getMonth() returns 0-11
                          const year = dateObj.getFullYear().toString().slice(-2); // Get last 2 digits of year
                          const formattedDate = `${day}-${month}-${year}`;
                          
                          // Get date index for 5th date check
                          const dateIndex = availableDates.indexOf(dateKey);
                          
                          const planetAbbr = (() => {
                            const dayData = allDaysData[dateKey];
                            if (dayData?.success && dayData.hrData[activeHR]) {
                              return dayData.hrData[activeHR].selectedPlanet || '';
                            }
                            return '';
                          })();
                          
                          // Get ABCD/BCD numbers for this date and topic
                          const getAbcdBcdForHeader = () => {
                            const setAnalysis = abcdBcdAnalysis[setName];
                            if (!setAnalysis || !setAnalysis[dateKey]) {
                              return { abcdNumbers: [], bcdNumbers: [] };
                            }
                            
                            const dateAnalysis = setAnalysis[dateKey];
                            return {
                              abcdNumbers: dateAnalysis.abcdNumbers || [],
                              bcdNumbers: dateAnalysis.bcdNumbers || []
                            };
                          };
                          
                          const { abcdNumbers, bcdNumbers } = getAbcdBcdForHeader();
                          const hasAbcdBcdData = abcdNumbers.length > 0 || bcdNumbers.length > 0;
                          
                          return (
                            <th key={dateKey} className={`border border-gray-300 px-3 py-2 text-center font-medium text-sm min-w-[140px] ${
                              dateKey === date ? 'bg-blue-500 text-white' : 'text-gray-700'
                            }`}>
                              <div className="text-base font-semibold">{formattedDate} {planetAbbr}</div>
                              {dateKey === date && <div className="text-xs font-bold">TARGET</div>}
                              
                              {/* Display ABCD/BCD numbers in header */}
                              {hasAbcdBcdData && (
                                <div className="mt-1 text-xs">
                                  {abcdNumbers.length > 0 && (
                                    <div className={`${dateKey === date ? 'text-green-200' : 'text-green-600'} font-medium`}>
                                      ABCD: [{abcdNumbers.join(', ')}]
                                    </div>
                                  )}
                                  {bcdNumbers.length > 0 && (
                                    <div className={`${dateKey === date ? 'text-blue-200' : 'text-blue-600'} font-medium`}>
                                      BCD: [{bcdNumbers.join(', ')}]
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* ✅ NEW: Add 1-12 number boxes below BCD numbers for 5th date onwards */}
                              {renderNumberBoxes(setName, dateKey, dateIndex)}
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
                            <td className="border border-gray-300 px-4 py-2 font-medium bg-blue-200 min-w-[120px]">
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
                                // Apply compact formatting to the raw data
                                const rawData = elementData.rawData || '—';
                                cellValue = rawData === '—' ? rawData : extractCompactFormat(rawData);
                              }
                              
                              const baseClass = 'border border-gray-300 px-3 py-2 text-center font-mono text-sm min-w-[140px]';
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
