// src/components/Rule1Page_Enhanced.jsx
// Enhanced Rule1Page with caching and unified data service

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnalysisCache, useCachedData } from '../hooks/useCachedData';
import cleanSupabaseService from '../services/CleanSupabaseService';
import { DataService } from '../services/dataService_new';
import rule2AnalysisService from '../services/rule2AnalysisService';
import { unifiedDataService } from '../services/unifiedDataService';
import { NumberBoxController } from './RobustNumberBoxSystem.jsx';

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
  
  // 🎯 NEW: Robust Number Box System
  const numberBoxControllerRef = useRef(null);
  const [numberBoxLoading, setNumberBoxLoading] = useState(false);
  const [clickedNumbers, setClickedNumbers] = useState({}); // Legacy state for backward compatibility
  
  // Highlighted topics count state
  const [highlightedTopicCountPerDate, setHighlightedTopicCountPerDate] = useState({}); // {dateKey: count}
  

  
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
    
    // Look for pattern: element-NUMBER/ or element-NUMBER- or element-NUMBER-letters (for grid cells)
    // Updated regex to handle grid cell formats like "as-9-sg", "mo-1-le"
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

  // 🆕 Bulk topic selection handlers for Set-1 and Set-2
  const handleBulkSetToggle = (setNumber) => {
    const setTopics = availableTopics.filter(topic => topic.includes(`Set-${setNumber}`));
    const newSelectedTopics = new Set(selectedTopics);
    
    // Check if all topics in this set are currently selected
    const allSelected = setTopics.every(topic => selectedTopics.has(topic));
    
    if (allSelected) {
      // Deselect all topics in this set
      setTopics.forEach(topic => newSelectedTopics.delete(topic));
    } else {
      // Select all topics in this set
      setTopics.forEach(topic => newSelectedTopics.add(topic));
    }
    
    setSelectedTopics(newSelectedTopics);
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

  // =====================================
  // 🎯 ROBUST NUMBER BOX SYSTEM INTEGRATION
  // =====================================
  
  // Load clicked numbers using robust system (memoized to prevent infinite re-renders)
  const loadClickedNumbersRobust = useCallback(async () => {
    if (!numberBoxControllerRef.current) return;

    try {
      setNumberBoxLoading(true);
      console.log('📥 Loading clicked numbers with robust system...');
      
      const loadedNumbers = await numberBoxControllerRef.current.loadClickedNumbers();
      
      // Update legacy state for backward compatibility
      const legacyFormat = {};
      Object.entries(loadedNumbers).forEach(([stateKey, numbers]) => {
        const parts = stateKey.split('|');
        const topicName = parts[0];
        const dateKey = parts[1]; 
        const hr = parts[2];
        
        if (!legacyFormat[topicName]) legacyFormat[topicName] = {};
        if (!legacyFormat[topicName][dateKey]) legacyFormat[topicName][dateKey] = {};
        legacyFormat[topicName][dateKey][hr] = numbers;
      });
      
      setClickedNumbers(legacyFormat);
      console.log('✅ Clicked numbers loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading clicked numbers:', error);
    } finally {
      setNumberBoxLoading(false);
    }
  }, []); // Empty dependency array since it only uses ref

  // Initialize number box controller (memoized to prevent re-creation)
  useEffect(() => {
    if (selectedUser && !numberBoxControllerRef.current) {
      numberBoxControllerRef.current = new NumberBoxController(cleanSupabaseService, selectedUser);
      console.log('🎯 NumberBoxController initialized for user:', selectedUser);
    }
    
    // Cleanup on unmount or user change
    return () => {
      if (numberBoxControllerRef.current) {
        numberBoxControllerRef.current.cleanup();
        numberBoxControllerRef.current = null;
      }
    };
  }, [selectedUser]);

  // Initialize number box system when data is ready (with proper dependency management)
  useEffect(() => {
    if (numberBoxControllerRef.current && 
        Object.keys(abcdBcdAnalysis).length > 0 && 
        activeHR) {
      
      numberBoxControllerRef.current.initialize(abcdBcdAnalysis, activeHR);
      loadClickedNumbersRobust();
    }
  }, [abcdBcdAnalysis, activeHR, loadClickedNumbersRobust]);

  // Update active HR in number box controller (debounced to prevent excessive updates)
  useEffect(() => {
    if (numberBoxControllerRef.current && activeHR) {
      const timeoutId = setTimeout(() => {
        numberBoxControllerRef.current.setActiveHR(activeHR);
      }, 50); // 50ms debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeHR]);

  // Handle number box click with robust system (memoized to prevent re-creation)
  const handleNumberBoxClickRobust = useCallback(async (topicName, dateKey, number) => {
    console.log('🔢 handleNumberBoxClickRobust called:', { topicName, dateKey, number, activeHR });
    
    if (!numberBoxControllerRef.current || !activeHR) {
      console.warn('❌ Click handler blocked:', { 
        hasController: !!numberBoxControllerRef.current, 
        activeHR 
      });
      return;
    }

    try {
      console.log(`🔢 Robust number box click: ${number} for ${topicName} ${dateKey} HR${activeHR}`);
      
      const eligibility = { eligible: true, matchType: 'ABCD' }; // Simplified for now
      
      const newState = await numberBoxControllerRef.current.handleNumberClick(
        topicName, 
        dateKey, 
        activeHR, 
        number, 
        eligibility
      );
      
      // Update legacy state for UI reactivity
      setClickedNumbers(prev => {
        const updated = { ...prev };
        if (!updated[topicName]) updated[topicName] = {};
        if (!updated[topicName][dateKey]) updated[topicName][dateKey] = {};
        if (!updated[topicName][dateKey][`HR${activeHR}`]) updated[topicName][dateKey][`HR${activeHR}`] = [];
        
        const hrNumbers = updated[topicName][dateKey][`HR${activeHR}`];
        if (newState) {
          // Number was added
          if (!hrNumbers.includes(number)) {
            hrNumbers.push(number);
          }
        } else {
          // Number was removed
          const index = hrNumbers.indexOf(number);
          if (index > -1) {
            hrNumbers.splice(index, 1);
          }
        }
        
        return updated;
      });
      
      console.log(`✅ Number ${number} ${newState ? 'added' : 'removed'} successfully`);
      
    } catch (error) {
      console.error('❌ Error handling robust number box click:', error);
    }
  }, [activeHR]); // Only depend on activeHR

  // Render number boxes using robust system
  const renderNumberBoxesRobust = (topicName, dateKey, abcdNumbers, bcdNumbers) => {
    console.log('🎨 renderNumberBoxesRobust called:', { 
      topicName, 
      dateKey, 
      abcdCount: abcdNumbers?.length || 0, 
      bcdCount: bcdNumbers?.length || 0,
      hasController: !!numberBoxControllerRef.current,
      activeHR
    });
    
    if (!numberBoxControllerRef.current) {
      console.warn('⚠️ Number box controller not initialized');
      return (
        <div className="mt-2 text-center text-xs text-gray-500 py-2 bg-gray-50 rounded border">
          Number box system initializing...
        </div>
      );
    }

    // Get available dates for eligibility check
    const availableDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));
    
    console.log('🔗 Setting click handler and rendering...');
    
    // Set the click handler on the controller
    numberBoxControllerRef.current.setClickHandler(handleNumberBoxClickRobust);
    
    const result = numberBoxControllerRef.current.renderNumberBoxes(topicName, dateKey, availableDates);
    
    console.log('✅ Number boxes rendered:', !!result);
    
    return result;
  };

  // Check if cell should be highlighted and return match type (HR-specific)
  // ✅ CLEAN SUPABASE-ONLY: Only use ABCD/BCD analysis, no localStorage/highlightedCells fallback
  const shouldHighlightCell = (cellValue, topicName, dateKey) => {
    // Extract number from cell value
    const match = cellValue.match(/(\d+)/);
    if (!match) return { highlighted: false };
    
    const cellNumber = parseInt(match[1]);
    
    // Check if this number was clicked by the user for this topic/date/HR
    const userClickedNumbers = clickedNumbers[topicName]?.[dateKey]?.[`HR${activeHR}`] || [];
    const wasClickedByUser = userClickedNumbers.includes(cellNumber);
    
    // Only highlight if the number was clicked AND appears in current ABCD/BCD analysis
    if (wasClickedByUser) {
      const currentAnalysis = abcdBcdAnalysis[topicName]?.[dateKey];
      if (currentAnalysis) {
        const abcdNumbers = currentAnalysis.abcdNumbers || [];
        const bcdNumbers = currentAnalysis.bcdNumbers || [];
        const isInAbcd = abcdNumbers.includes(cellNumber);
        const isInBcd = bcdNumbers.includes(cellNumber);
        
        if (isInAbcd || isInBcd) {
          return { highlighted: true, type: isInAbcd ? 'ABCD' : 'BCD' };
        }
      }
    }
    
    return { highlighted: false };
  };

  // ✅ NEW: Use robust number box system (replaces old renderNumberBoxes)
  const renderNumberBoxes = (topicName, dateKey) => {
    // Delegate to robust system, but maintain same interface for existing code
    const abcdNumbers = abcdBcdAnalysis[topicName]?.[dateKey]?.abcdNumbers || [];
    const bcdNumbers = abcdBcdAnalysis[topicName]?.[dateKey]?.bcdNumbers || [];
    
    return renderNumberBoxesRobust(topicName, dateKey, abcdNumbers, bcdNumbers);
  };

  // ✅ NEW: Handle number box click with robust system (replaces old handleNumberBoxClick)
  const handleNumberBoxClick = async (topicName, dateKey, number) => {
    await handleNumberBoxClickRobust(topicName, dateKey, number);
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
    if (Object.keys(allDaysData).length > 0 && availableTopics.length > 0 && selectedUser && activeHR) {
      loadRule2AnalysisResults();
    }
  }, [allDaysData, availableTopics, selectedUser, activeHR]);

  // ✅ REPLACED: Load clicked numbers using robust system when activeHR changes or component mounts
  // This is now handled by the numberBoxController initialization useEffect above

  // Calculate highlighted topics count per date (only count topics with clicked+highlighted numbers)
  useEffect(() => {
    if (Object.keys(abcdBcdAnalysis).length === 0 || availableTopics.length === 0 || !activeHR) {
      console.log('🚫 [HighlightedCount] Skipping calculation - missing dependencies:', {
        hasAbcdBcdAnalysis: Object.keys(abcdBcdAnalysis).length > 0,
        hasAvailableTopics: availableTopics.length > 0,
        hasActiveHR: !!activeHR
      });
      setHighlightedTopicCountPerDate({});
      return;
    }

    const availableDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));
    const countPerDate = {};

    console.log('🔍 [HighlightedCount] Starting calculation for clicked+highlighted topics...');
    console.log('📊 [HighlightedCount] Dependencies check:', {
      availableTopics: availableTopics.length,
      availableDates: availableDates,
      activeHR: activeHR,
      clickedNumbersKeys: Object.keys(clickedNumbers),
      abcdBcdAnalysisKeys: Object.keys(abcdBcdAnalysis),
      clickedNumbersStructure: Object.fromEntries(
        Object.entries(clickedNumbers).slice(0, 2).map(([topic, dates]) => [
          topic, 
          Object.fromEntries(
            Object.entries(dates).slice(0, 2).map(([date, hrs]) => [
              date,
              Object.keys(hrs)
            ])
          )
        ])
      )
    });

    // Only process dates from the 5th onward (skip first 4 dates as they don't have ABCD/BCD numbers)
    availableDates.forEach((dateKey, dateIndex) => {
      if (dateIndex < 4) {
        // Skip first 4 dates - they don't have ABCD/BCD numbers from previous dates
        console.log(`⏭️ [HighlightedCount] Skipping date ${dateIndex + 1}: "${dateKey}" - no ABCD/BCD available (first 4 dates)`);
        return;
      }
      
      let highlightedTopicsForThisDate = 0;
      let totalTopicsWithClicks = 0;
      let totalTopicsWithAnyData = 0;

      console.log(`📊 [HighlightedCount] Processing date ${dateIndex + 1}: "${dateKey}" - ABCD/BCD numbers available`);

      availableTopics.forEach(topicName => {
        // Check if topic has ABCD/BCD analysis data for this date
        const topicAnalysis = abcdBcdAnalysis[topicName];
        if (!topicAnalysis || !topicAnalysis[dateKey]) {
          return; // Skip if no analysis data for this topic/date
        }

        totalTopicsWithAnyData++;
        const dateAnalysis = topicAnalysis[dateKey];
        const abcdNumbers = dateAnalysis.abcdNumbers || [];
        const bcdNumbers = dateAnalysis.bcdNumbers || [];
        
        // Get clicked numbers for this topic/date/HR
        const topicClickedNumbers = clickedNumbers[topicName]?.[dateKey]?.[`HR${activeHR}`] || [];
        
        // Special debug for 30-6-25 date
        if (dateKey === '2025-06-30' || dateKey.includes('30-6') || dateKey.includes('06-30')) {
          console.log(`🔍 [HighlightedCount] SPECIAL DEBUG for date ${dateKey} topic ${topicName}:`, {
            topicClickedNumbers,
            abcdNumbers,
            bcdNumbers,
            fullClickedNumbersState: clickedNumbers[topicName]?.[dateKey],
            hasClickedData: !!clickedNumbers[topicName]?.[dateKey]
          });
        }
        
        if (topicClickedNumbers.length === 0) {
          return; // Skip if no clicked numbers for this topic/date/HR
        }

        totalTopicsWithClicks++;

        // 👉 A topic should be counted for a date ONLY IF:
        // - The user clicked at least one number (1–12), AND
        // - That clicked number is also present in the ABCD or BCD array for that topic and date, AND
        // - That clicked number actually appears in the topic's row data (in rawData strings like "as-3-sg", "mo-3-le")
        
        let hasClickedHighlightedNumber = false;
        
        // Get the topic's raw data for this date/HR to check if clicked numbers appear in it
        const dayData = allDaysData[dateKey];
        let topicRawDataStrings = [];
        
        if (dayData?.success && dayData.hrData[activeHR]?.sets[topicName]) {
          const topicSet = dayData.hrData[activeHR].sets[topicName];
          // Collect all raw data strings from all elements in this topic set
          Object.values(topicSet).forEach(elementData => {
            if (elementData?.rawData && typeof elementData.rawData === 'string') {
              topicRawDataStrings.push(elementData.rawData);
            }
          });
        }
        
        // Check if topicClickedNumbers has any matches with ABCD or BCD AND appears in topic data
        if (topicClickedNumbers.length > 0) {
          const matchingNumbers = topicClickedNumbers.filter(num => {
            // First check: is the number in ABCD or BCD arrays?
            const isInAbcdBcd = abcdNumbers.includes(num) || bcdNumbers.includes(num);
            
            // Second check: does this number actually appear in the topic's raw data?
            const appearsInTopicData = topicRawDataStrings.some(rawData => 
              rawData.includes(`-${num}-`)
            );
            
            return isInAbcdBcd && appearsInTopicData;
          });
          
          hasClickedHighlightedNumber = matchingNumbers.length > 0;
        }

        // Enhanced logging for debugging
        console.log(`📊 [HighlightedCount] Analysis for "${topicName}" on "${dateKey}" HR${activeHR}:`, {
          hasClickedNumbers: topicClickedNumbers.length > 0,
          clickedNumbers: topicClickedNumbers,
          abcdNumbers,
          bcdNumbers,
          topicRawDataStrings: topicRawDataStrings.slice(0, 3), // Show first 3 for debugging
          hasClickedHighlightedNumber,
          willCountTopic: hasClickedHighlightedNumber,
          validationDetail: topicClickedNumbers.length > 0 ? topicClickedNumbers.map(num => ({
            number: num,
            inAbcdBcd: abcdNumbers.includes(num) || bcdNumbers.includes(num),
            inTopicData: topicRawDataStrings.some(rawData => rawData.includes(`-${num}-`))
          })) : []
        });
        
        // Only count this topic if it has clicked numbers that are in ABCD or BCD
        if (hasClickedHighlightedNumber) {
          highlightedTopicsForThisDate++;
          console.log(`🎯 [HighlightedCount] TOPIC COUNTED: "${topicName}" on "${dateKey}" HR${activeHR} - has clicked+highlighted numbers`);
        } else if (topicClickedNumbers.length > 0) {
          console.log(`⚪ [HighlightedCount] TOPIC NOT COUNTED: "${topicName}" on "${dateKey}" HR${activeHR} - clicked numbers but none are highlighted`);
        }
      });

      countPerDate[dateKey] = highlightedTopicsForThisDate;
      console.log(`📊 [HighlightedCount] Date "${dateKey}" HR${activeHR}: ${highlightedTopicsForThisDate} topics with clicked+highlighted numbers`);
      console.log(`📈 [HighlightedCount] Date "${dateKey}" HR${activeHR} breakdown:`, {
        totalTopicsWithData: totalTopicsWithAnyData,
        totalTopicsWithClicks: totalTopicsWithClicks,
        finalCountedTopics: highlightedTopicsForThisDate,
        explanation: 'Only topics with clicked numbers that appear in ABCD/BCD AND are visible in topic raw data are counted'
      });
    });

    setHighlightedTopicCountPerDate(countPerDate);
    console.log('🎯 [HighlightedCount] Final clicked+highlighted counts per date:', countPerDate);
  }, [abcdBcdAnalysis, availableTopics, allDaysData, clickedNumbers, activeHR]);

  // Function to show detailed highlight debugging
  const showHighlightDebugging = () => {
    console.log('🔍 [DEBUG] COMPLETE HIGHLIGHT STATE ANALYSIS');
    console.log('==========================================');
    
    console.log('📊 Current States:');
    console.log('  - clickedNumbers:', clickedNumbers);
    console.log('  - highlightedCells:', highlightedCells);
    console.log('  - abcdBcdAnalysis keys:', Object.keys(abcdBcdAnalysis));
    console.log('  - activeHR:', activeHR);
    
    console.log('\n🎯 Per-Topic Analysis:');
    availableTopics.forEach(topicName => {
      const availableDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));
      
      availableDates.forEach(dateKey => {
        const topicClickedNumbers = clickedNumbers[topicName]?.[dateKey]?.[`HR${activeHR}`] || [];
        const abcdNumbers = abcdBcdAnalysis[topicName]?.[dateKey]?.abcdNumbers || [];
        const bcdNumbers = abcdBcdAnalysis[topicName]?.[dateKey]?.bcdNumbers || [];
        
        if (topicClickedNumbers.length > 0) {
          console.log(`\n📋 ${topicName} on ${dateKey} HR${activeHR}:`);
          console.log(`  Clicked: [${topicClickedNumbers.join(', ')}]`);
          console.log(`  ABCD: [${abcdNumbers.join(', ')}]`);
          console.log(`  BCD: [${bcdNumbers.join(', ')}]`);
          
          // Get topic raw data for validation
          const dayData = allDaysData[dateKey];
          let topicRawDataStrings = [];
          if (dayData?.success && dayData.hrData[activeHR]?.sets[topicName]) {
            const topicSet = dayData.hrData[activeHR].sets[topicName];
            Object.values(topicSet).forEach(elementData => {
              if (elementData?.rawData && typeof elementData.rawData === 'string') {
                topicRawDataStrings.push(elementData.rawData);
              }
            });
          }
          
          // Check which numbers meet all three conditions
          const validMatches = topicClickedNumbers.filter(num => {
            const isInAbcdBcd = abcdNumbers.includes(num) || bcdNumbers.includes(num);
            const appearsInTopicData = topicRawDataStrings.some(rawData => rawData.includes(`-${num}-`));
            return isInAbcdBcd && appearsInTopicData;
          });
          
          console.log(`  ABCD/BCD Matches: [${topicClickedNumbers.filter(num => abcdNumbers.includes(num) || bcdNumbers.includes(num)).join(', ')}]`);
          console.log(`  Topic Raw Data: [${topicRawDataStrings.slice(0, 2).join(', ')}${topicRawDataStrings.length > 2 ? '...' : ''}]`);
          console.log(`  Valid Matches (All 3 conditions): [${validMatches.join(', ')}] - ${validMatches.length > 0 ? 'COUNTS' : 'NO COUNT'}`);
          
          // Check visual highlighting status
          const visualHighlights = topicClickedNumbers.map(num => ({
            number: num,
            visuallyHighlighted: shouldHighlightCell(`test-${num}`, topicName, dateKey).highlighted
          }));
          console.log(`  Visual highlighting:`, visualHighlights);
        }
      });
    });
    
    console.log('\n📈 Summary:');
    console.log(`  Highlighted topics count per date:`, highlightedTopicCountPerDate);
    
    // Show detailed breakdown of what's being counted (only dates from 5th onward)
    console.log('\n🔬 DETAILED COUNT BREAKDOWN (From 5th Date Onward):');
    Object.keys(highlightedTopicCountPerDate)
      .sort((a, b) => new Date(a) - new Date(b))
      .forEach((dateKey, dateIndex) => {
        // Only show breakdown for dates that have ABCD/BCD numbers (5th onward)
        const count = highlightedTopicCountPerDate[dateKey];
        if (count > 0) {
          console.log(`\n📅 Date ${dateKey} (Count: ${count}):`);
          let topicCount = 0;
          availableTopics.forEach(topicName => {
          const topicClickedNumbers = clickedNumbers[topicName]?.[dateKey]?.[`HR${activeHR}`] || [];
          const abcdNumbers = abcdBcdAnalysis[topicName]?.[dateKey]?.abcdNumbers || [];
          const bcdNumbers = abcdBcdAnalysis[topicName]?.[dateKey]?.bcdNumbers || [];
          
          if (topicClickedNumbers.length > 0) {
            // Get topic raw data for validation
            const dayData = allDaysData[dateKey];
            let topicRawDataStrings = [];
            if (dayData?.success && dayData.hrData[activeHR]?.sets[topicName]) {
              const topicSet = dayData.hrData[activeHR].sets[topicName];
              Object.values(topicSet).forEach(elementData => {
                if (elementData?.rawData && typeof elementData.rawData === 'string') {
                  topicRawDataStrings.push(elementData.rawData);
                }
              });
            }
            
            // Check which numbers meet all three conditions
            const validMatches = topicClickedNumbers.filter(num => {
              const isInAbcdBcd = abcdNumbers.includes(num) || bcdNumbers.includes(num);
              const appearsInTopicData = topicRawDataStrings.some(rawData => rawData.includes(`-${num}-`));
              return isInAbcdBcd && appearsInTopicData;
            });
            
            if (validMatches.length > 0) {
              topicCount++;
              console.log(`  ${topicCount}. ${topicName} - Clicked: [${topicClickedNumbers.join(', ')}], Valid Matches: [${validMatches.join(', ')}]`);
            }
          }
        });
      }
    });
    
    alert('🔍 Highlight debugging completed! Check console for detailed analysis.');
  };
  const renderColorCodedDayNumber = (displayValue, setName, dateKey) => {
    if (displayValue === '—' || displayValue === '(No Data)') {
      return displayValue;
    }

    const elementNumber = extractElementNumber(displayValue);
    
    // 🔍 DEBUG: Always log extraction attempts for this specific case
    if (dateKey === '2025-06-30' || displayValue.includes('-3-') || displayValue.includes('as-9') || displayValue.includes('mo-1') || displayValue.includes('hl-4')) {
      console.log(`🔍 [GridDebug] Extracting from "${displayValue}":`, {
        displayValue,
        extractedNumber: elementNumber,
        setName,
        dateKey,
        extractFunction: 'extractElementNumber'
      });
    }
    
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
    
    // 🔍 DETAILED DEBUG: Enhanced logging for troubleshooting
    if (dateKey === '2025-06-30' && (abcdNumbers.includes(elementNumber) || bcdNumbers.includes(elementNumber))) {
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
      console.log(`✅ [Rule1Page] Rendering ABCD tag for number ${elementNumber} from "${displayValue}"`);
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="text-data-value">{displayValue}</span>
          <span className="bg-green-200 text-green-800 text-xs font-medium px-1 py-0.5 rounded">
            ABCD
          </span>
        </div>
      );
    } else if (bcdNumbers.includes(elementNumber)) {
      console.log(`✅ [Rule1Page] Rendering BCD tag for number ${elementNumber} from "${displayValue}"`);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full">
      <div className="w-full px-6 py-6">
        {/* ✅ STICKY HEADER with Highlighted Topics Summary */}
        <div className="sticky top-0 z-50 bg-white shadow-md rounded-lg p-4 mb-6 border-t-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Rule-1 Matrix Analysis - HR {activeHR || '?'}</h1>
              {/* User Name Display */}
              <div className="text-sm text-purple-800 mt-1">
                <p>👤 User: {(() => {
                  const currentUser = users?.find(user => user.id === selectedUser);
                  return currentUser ? currentUser.username : `ID: ${selectedUser}`;
                })()}</p>
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              <button
                onClick={onBack}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                ← Back to Main
              </button>
            </div>
          </div>
          
          {/* Highlighted Topics Summary */}
          {Object.keys(highlightedTopicCountPerDate).length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">📊 Highlighted Topics Summary</h3>
                <span className="text-xs text-gray-500">Topics with clicked+highlighted numbers (From 5th date onward)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(allDaysData)
                  .sort((a, b) => new Date(a) - new Date(b))
                  .filter((dateKey, dateIndex) => dateIndex >= 4) // Only show dates from 5th onward
                  .map(dateKey => {
                    const count = highlightedTopicCountPerDate[dateKey] || 0;
                    const dateObj = new Date(dateKey);
                    const formattedDate = `${dateObj.getDate()}-${dateObj.getMonth() + 1}-${dateObj.getFullYear().toString().slice(-2)}`;
                    
                    return (
                      <div
                        key={dateKey}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                          count > 0 
                            ? 'bg-green-100 text-green-800 border border-green-300 shadow-md' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        } ${dateKey === date ? 'ring-2 ring-blue-500 ring-opacity-75 shadow-lg' : ''}`}
                      >
                        <span className="font-semibold">{formattedDate}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                          count > 0 
                            ? 'bg-green-200 text-green-900 border border-green-300' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {count}
                        </span>
                        {dateKey === date && (
                          <span className="text-blue-600 font-bold text-lg">●</span>
                        )}
                        {count > 0 && (
                          <span className="text-green-600 font-bold">✓</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

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
          <div className="bg-white rounded-lg shadow-md mb-4 p-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-gray-800">📊 Topic Selection</h3>
              <div className="flex gap-1">
                <button
                  onClick={handleSelectAll}
                  className="bg-green-300 hover:bg-green-400 text-green-800 px-1.5 py-0.5 rounded text-xs"
                >
                  All
                </button>
                <button
                  onClick={handleClearAll}
                  className="bg-red-300 hover:bg-red-400 text-red-800 px-1.5 py-0.5 rounded text-xs"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowTopicSelector(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-1.5 py-0.5 rounded text-xs"
                >
                  Hide
                </button>
              </div>
            </div>
            {/* Combined Topics in 2 rows */}
            <div className="space-y-0.5">
              {/* Set-1 Topics Row */}
              <div className="flex flex-wrap gap-0.5 items-center">
                <button 
                  onClick={() => handleBulkSetToggle(1)}
                  className="text-xs font-medium text-blue-600 mr-1 hover:text-blue-800 hover:bg-blue-50 px-1 py-0.5 rounded cursor-pointer transition-colors"
                  title="Click to select/deselect all Set-1 topics"
                >
                  Set-1:
                </button>
                {availableTopics.filter(topic => topic.includes('Set-1')).map(topic => (
                  <label key={topic} className="flex items-center space-x-0.5 text-xs bg-blue-50 px-1 py-0.5 rounded border">
                    <input
                      type="checkbox"
                      checked={selectedTopics.has(topic)}
                      onChange={() => handleTopicToggle(topic)}
                      className="rounded border-gray-300 w-2.5 h-2.5"
                    />
                    <span className="whitespace-nowrap text-xs">{formatSetName(topic)}</span>
                  </label>
                ))}
              </div>
              
              {/* Set-2 Topics Row */}
              <div className="flex flex-wrap gap-0.5 items-center">
                <button 
                  onClick={() => handleBulkSetToggle(2)}
                  className="text-xs font-medium text-green-600 mr-1 hover:text-green-800 hover:bg-green-50 px-1 py-0.5 rounded cursor-pointer transition-colors"
                  title="Click to select/deselect all Set-2 topics"
                >
                  Set-2:
                </button>
                {availableTopics.filter(topic => topic.includes('Set-2')).map(topic => (
                  <label key={topic} className="flex items-center space-x-0.5 text-xs bg-green-50 px-1 py-0.5 rounded border">
                    <input
                      type="checkbox"
                      checked={selectedTopics.has(topic)}
                      onChange={() => handleTopicToggle(topic)}
                      className="rounded border-gray-300 w-2.5 h-2.5"
                    />
                    <span className="whitespace-nowrap text-xs">{formatSetName(topic)}</span>
                  </label>
                ))}
              </div>
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

          
          <div className="p-4 space-y-6">
            {topicsToDisplay.length > 0 ? (
              topicsToDisplay.map(setName => (
                <div key={setName} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="bg-blue-100 p-3 font-bold text-lg rounded-t-lg border-b border-gray-200">
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
                              
                              {/* Clickable Number Boxes - Only show from 5th date onward */}
                              {renderNumberBoxes(setName, dateKey)}
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
                              const highlightInfo = shouldHighlightCell(cellValue, setName, dateKey);
                              
                              // Define colors for different match types
                              const getHighlightStyle = (highlightInfo) => {
                                if (!highlightInfo.highlighted) return {};
                                
                                if (highlightInfo.type === 'ABCD') {
                                  return {
                                    backgroundColor: '#FCE7C8', // Orange for ABCD
                                    color: '#8B4513',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                  };
                                } else if (highlightInfo.type === 'BCD') {
                                  return {
                                    backgroundColor: '#41B3A2', // Custom teal color for BCD
                                    color: '#FFFFFF', // White text for better contrast
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px -1px rgba(65, 179, 162, 0.4), 0 2px 4px -1px rgba(65, 179, 162, 0.3)'
                                  };
                                }
                                
                                // Fallback to original orange color
                                return {
                                  backgroundColor: '#FCE7C8',
                                  color: '#8B4513',
                                  fontWeight: 'bold',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                };
                              };
                              
                              const getCSSClass = (highlightInfo) => {
                                if (!highlightInfo.highlighted) return '';
                                
                                if (highlightInfo.type === 'ABCD') {
                                  // Orange for ABCD matches
                                  return 'bg-orange-200 text-orange-900 ring-2 ring-orange-400 shadow-lg';
                                } else if (highlightInfo.type === 'BCD') {
                                  // Custom teal color for BCD matches
                                  return 'bg-teal-600 text-white ring-2 ring-teal-500 shadow-lg';
                                }
                                
                                // Fallback to original orange class
                                return 'bg-orange-200 text-orange-900 ring-2 ring-orange-400 shadow-lg';
                              };
                              
                              return (
                                <td
                                  key={dateKey}
                                  className={`${baseClass} ${
                                    highlightInfo.highlighted
                                      ? getCSSClass(highlightInfo)
                                      : isTargetDate
                                        ? 'ring-2 ring-blue-400 bg-blue-50'
                                        : hasData 
                                          ? 'bg-gray-100 text-gray-800' 
                                          : 'bg-red-50 text-gray-400'
                                  }`}
                                  style={getHighlightStyle(highlightInfo)}
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
