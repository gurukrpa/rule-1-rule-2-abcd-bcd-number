// src/components/IndexPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cleanSupabaseService } from '../services/CleanSupabaseService';
import ProgressBar from './ProgressBar';
import { performAbcdBcdAnalysis } from '../utils/abcdBcdAnalysis';
import ABCDBCDAnalyzer, { quickAnalyze, createAnalyzer } from '../../abcd-bcd-analyzer-script';

const IndexPage = ({
  date,               // clicked date (e.g. "2025-06-05")
  selectedUser,       // current user ID string
  selectedUserData,   // user data object with username, hr, etc.
  datesList,          // array of all dates for this user (e.g. ["2025-05-22", "2025-05-26", …])
  onBack,             // callback to go back
  onExtractNumbers    // callback(date, activeHR) to open Rule-2
}) => {
  const navigate = useNavigate();
  const [activeHR, setActiveHR] = useState(null);
  const [allDaysData, setAllDaysData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [error, setError] = useState('');
  const [abcdBcdAnalysis, setAbcdBcdAnalysis] = useState({});
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [debugStatus, setDebugStatus] = useState('Initializing...');
  
  // 🆕 Enhanced ABCD/BCD Analysis State
  const [abcdBcdAnalyzer, setAbcdBcdAnalyzer] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [extractedNumbers, setExtractedNumbers] = useState({});

  // 🆕 Topic Selection State
  const [selectedTopics, setSelectedTopics] = useState(new Set()); // Set of selected topic names
  const [showTopicSelector, setShowTopicSelector] = useState(true); // Show/hide topic selector
  const [availableTopics, setAvailableTopics] = useState([]); // All available topics

  // Initialize CleanSupabaseService for consistent data operations
  const dataService = cleanSupabaseService;

  // 🆕 Initialize ABCD/BCD Analyzer
  useEffect(() => {
    const analyzer = createAnalyzer();
    setAbcdBcdAnalyzer(analyzer);
    console.log('🎯 ABCD/BCD Analyzer initialized');
  }, []);

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

  // Abbreviation → exact element name in processedData.sets
  const elementNames = {
    as:  'Lagna',
    mo:  'Moon',
    hl:  'Hora Lagna',
    gl:  'Ghati Lagna',
    vig: 'Vighati Lagna',
    var: 'Varnada Lagna',
    sl:  'Sree Lagna',
    pp:  'Pranapada Lagna',
    in:  'Indu Lagna'
  };

  // Extract the FIRST number after element prefix, e.g. "as-7/su-..." → 7
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
    return match ? Number(match[1]) : null;
  };

  // Extract numbers from a specific set for a specific date using selected HR
  const extractFromDateAndSet = async (targetDate, setName, hrNumber) => {
    try {
      console.log(`🔍 [ABCD-DEBUG] Extracting from date=${targetDate}, set=${setName}, HR=${hrNumber}`);
      
      // Use CleanSupabaseService for direct and consistent data access
      console.log(`☁️ [ABCD-DEBUG] Using CleanSupabaseService for ${targetDate}`);
      const excelData = await dataService.getExcelData(selectedUser, targetDate);
      const hourData = await dataService.getHourEntry(selectedUser, targetDate);
      
      console.log(`📊 [ABCD-DEBUG] Data for ${targetDate}:`, { 
        hasExcel: !!excelData, 
        hasHour: !!hourData,
        excelSets: excelData?.sets ? Object.keys(excelData.sets) : [],
        hourPlanets: hourData?.planetSelections ? Object.keys(hourData.planetSelections) : [],
        storageType: 'CleanSupabaseService'
      });
      
      if (!excelData || !hourData) {
        console.log(`❌ [ABCD-DEBUG] Missing data for ${targetDate} - Excel: ${!!excelData}, Hour: ${!!hourData}`);
        return [];
      }
      
      // CleanSupabaseService returns data in direct sets format
      const sets = excelData.sets || {};
      const planetSelections = hourData.planetSelections || {};        
        console.log(`🔍 [ABCD-DEBUG] Data structure for ${targetDate}:`, {
          hasDirectSets: !!excelData?.sets,
          usingFormat: 'CleanSupabaseService',
          setCount: Object.keys(sets).length,
          planetSelectionCount: Object.keys(planetSelections).length
        });
      
      const allNumbers = new Set();
      const setData = sets[setName];
      if (setData) {
        const selectedPlanet = planetSelections[hrNumber];
        console.log(`🌟 [ABCD-DEBUG] Selected planet for HR${hrNumber}: ${selectedPlanet}`);
        
        if (selectedPlanet) {
          Object.entries(setData).forEach(([elementName, planetData]) => {
            const rawString = planetData[selectedPlanet];
            if (rawString) {
              const elementNumber = extractElementNumber(rawString);
              console.log(`🔢 [ABCD-DEBUG] ${elementName} -> "${rawString}" -> ${elementNumber}`);
              if (elementNumber !== null) {
                allNumbers.add(elementNumber);
              }
            } else {
              console.log(`⚠️ [ABCD-DEBUG] No data for ${elementName} with planet ${selectedPlanet}`);
            }
          });
        } else {
          console.log(`❌ [ABCD-DEBUG] No planet selected for HR${hrNumber}`);
        }
      } else {
        console.log(`❌ [ABCD-DEBUG] No set data found for "${setName}" in sets:`, Object.keys(sets));
      }
      
      const result = Array.from(allNumbers).sort((a, b) => a - b);
      console.log(`✅ [ABCD-DEBUG] Extracted ${result.length} numbers for ${targetDate}/${setName}/HR${hrNumber}:`, result);
      
      if (result.length === 0) {
        console.log(`🚨 [ABCD-DEBUG] ZERO NUMBERS EXTRACTED! This is likely the main issue.`);
        console.log(`🔍 [ABCD-DEBUG] Debug info:`, {
          setExists: !!setData,
          planetSelected: !!planetSelections[hrNumber],
          selectedPlanet: planetSelections[hrNumber],
          availableElements: setData ? Object.keys(setData) : [],
          sampleElementData: setData ? Object.values(setData)[0] : null
        });
      }
      
      return result;
    } catch (e) {
      console.error('Error extracting from date and set:', e);
      return [];
    }
  };

  // 🚀 Enhanced ABCD-BCD analysis using comprehensive analyzer
  const performIndexAbcdBcdAnalysis = async (setName, aDay, bDay, cDay, dDay, hrNumber) => {
    try {
      console.log(`🧮 Enhanced Analyzer - Performing ABCD-BCD analysis for ${setName} with days A=${aDay}, B=${bDay}, C=${cDay}, D=${dDay}, HR=${hrNumber}`);
      
      // Extract numbers from all available days (some might be empty if days are missing)
      const dDayNumbers = dDay ? await extractFromDateAndSet(dDay, setName, hrNumber) : [];
      const cDayNumbers = cDay ? await extractFromDateAndSet(cDay, setName, hrNumber) : [];
      const bDayNumbers = bDay ? await extractFromDateAndSet(bDay, setName, hrNumber) : [];
      const aDayNumbers = aDay ? await extractFromDateAndSet(aDay, setName, hrNumber) : [];
      
      console.log(`📈 Numbers extracted for enhanced analysis:`, {
        A: aDayNumbers,
        B: bDayNumbers,
        C: cDayNumbers,
        D: dDayNumbers
      });
      
      if (dDayNumbers.length === 0) {
        console.log(`⚠️ No D-day numbers for ${setName}, skipping analysis`);
        return { abcdNumbers: [], bcdNumbers: [] };
      }

      // 🎯 Store extracted numbers for Rule2Page integration
      setExtractedNumbers(prev => ({
        ...prev,
        [setName]: {
          aDayNumbers,
          bDayNumbers,
          cDayNumbers,
          dDayNumbers,
          hrNumber,
          timestamp: new Date().toISOString()
        }
      }));

      // 🚀 Use enhanced analyzer for comprehensive analysis
      if (abcdBcdAnalyzer) {
        const dataStructure = {
          aDayNumbers,
          bDayNumbers,
          cDayNumbers,
          dDayNumbers
        };

        const enhancedAnalysis = abcdBcdAnalyzer.analyze(dataStructure, {
          setName: `IndexPage-${setName}`,
          includeSummary: true,
          includeElementWise: false, // Skip element-wise for performance in IndexPage
          includeDetailed: false,
          saveToHistory: true
        });

        console.log(`🎯 Enhanced analyzer results for ${setName}:`, {
          availableDays: [aDayNumbers, bDayNumbers, cDayNumbers].filter(arr => arr.length > 0).length,
          summary: enhancedAnalysis.summary,
          abcdNumbers: enhancedAnalysis.results.abcdNumbers,
          bcdNumbers: enhancedAnalysis.results.bcdNumbers,
          unqualifiedNumbers: enhancedAnalysis.results.unqualifiedNumbers
        });

        // Store enhanced results for future reference
        setAnalysisResults(prev => ({
          ...prev,
          [setName]: enhancedAnalysis
        }));

        return { 
          abcdNumbers: enhancedAnalysis.results.abcdNumbers, 
          bcdNumbers: enhancedAnalysis.results.bcdNumbers,
          unqualifiedNumbers: enhancedAnalysis.results.unqualifiedNumbers,
          summary: enhancedAnalysis.summary
        };
      } else {
        // Fallback to utility function if analyzer not ready
        console.log('📝 Analyzer not ready, using fallback utility');
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

        return { 
          abcdNumbers: analysis.abcdNumbers, 
          bcdNumbers: analysis.bcdNumbers 
        };
      }
    } catch (error) {
      console.error('Error performing enhanced ABCD-BCD analysis:', error);
      return { abcdNumbers: [], bcdNumbers: [] };
    }
  };

  // 🆕 Topic Selection Functions
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
      // If no topics selected, show all available topics
      return availableTopics;
    }
    // Show only selected topics
    return availableTopics.filter(topic => selectedTopics.has(topic));
  };

  // Extract unique base topics (D-1, D-3, D-4, etc.) for grouping
  const getUniqueBaseTopics = () => {
    const baseTopics = new Set();
    availableTopics.forEach(topic => {
      const match = topic.match(/^(D-\d+)/);
      if (match) {
        baseTopics.add(match[1]);
      }
    });
    return Array.from(baseTopics).sort((a, b) => {
      const aNum = parseInt(a.split('-')[1]);
      const bNum = parseInt(b.split('-')[1]);
      return aNum - bNum;
    });
  };

  const getRelatedTopics = (baseTopic) => {
    return availableTopics.filter(topic => topic.startsWith(baseTopic + ' '));
  };

  const isBaseTopicSelected = (baseTopic) => {
    const relatedTopics = getRelatedTopics(baseTopic);
    return relatedTopics.length > 0 && relatedTopics.every(topic => selectedTopics.has(topic));
  };

  const isBaseTopicPartiallySelected = (baseTopic) => {
    const relatedTopics = getRelatedTopics(baseTopic);
    const selectedCount = relatedTopics.filter(topic => selectedTopics.has(topic)).length;
    return selectedCount > 0 && selectedCount < relatedTopics.length;
  };

  const handleBaseTopicToggle = (baseTopic) => {
    const relatedTopics = getRelatedTopics(baseTopic);
    const newSelectedTopics = new Set(selectedTopics);
    
    if (isBaseTopicSelected(baseTopic)) {
      // Deselect all related topics
      relatedTopics.forEach(topic => newSelectedTopics.delete(topic));
    } else {
      // Select all related topics
      relatedTopics.forEach(topic => newSelectedTopics.add(topic));
    }
    
    setSelectedTopics(newSelectedTopics);
  };

  // Initialize available topics when data is loaded (using predefined TOPIC_ORDER like Rule2CompactPage)
  useEffect(() => {
    if (allDaysData && Object.keys(allDaysData).length > 0) {
      // Collect all unique set names from all dates that have data
      const discoveredSets = new Set();
      ['A', 'B', 'C', 'D'].forEach(lbl => {
        if (allDaysData[lbl]?.success && allDaysData[lbl].hrData) {
          Object.values(allDaysData[lbl].hrData).forEach(hrData => {
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
      
      console.log(`📊 [IndexPage] Topic Discovery (FIXED with Smart Matching):`, {
        allDaysDataKeys: Object.keys(allDaysData),
        discoveredSetsRaw: discoveredTopicsArray,
        discoveredSetsCount: discoveredSets.size,
        orderedTopicsCount: orderedTopics.length,
        orderedTopics,
        topicMappings: Array.from(topicMatcher.entries()).slice(0, 5), // Show first 5 mappings
        missingFromOrder: discoveredTopicsArray.filter(set => !Array.from(topicMatcher.values()).includes(set)),
        notInData: TOPIC_ORDER.filter(topic => !topicMatcher.has(topic))
      });
      
      setAvailableTopics(orderedTopics);
      if (selectedTopics.size === 0) {
        setSelectedTopics(new Set(orderedTopics));
      }
    }
  }, [allDaysData]);

  // Helper to render color-coded D-day numbers with improved logic
  const renderColorCodedDayNumber = (cellValue, setName, dayLabel) => {
    console.log(`🎨 renderColorCodedDayNumber called:`, {
      cellValue,
      setName,
      dayLabel,
      hasAnalysis: !!abcdBcdAnalysis[setName],
      analysisKeys: Object.keys(abcdBcdAnalysis),
      analysisForSet: abcdBcdAnalysis[setName]
    });

    // Only apply color coding to D-day columns and valid cell values
    if (dayLabel !== 'D' || !cellValue || cellValue === '—' || !abcdBcdAnalysis[setName]) {
      console.log(`❌ Early return: dayLabel=${dayLabel}, cellValue=${cellValue}, hasAnalysis=${!!abcdBcdAnalysis[setName]}`);
      return cellValue;
    }

    const elementNumber = extractElementNumber(cellValue);
    console.log(`🔢 Extracted element number: ${elementNumber} from ${cellValue}`);
    if (elementNumber === null || isNaN(elementNumber)) {
      console.log(`⚠️ Invalid element number extracted`);
      return cellValue;
    }

    const { abcdNumbers = [], bcdNumbers = [] } = abcdBcdAnalysis[setName];
    console.log(`🎯 Checking against analysis:`, { 
      abcdNumbers, 
      bcdNumbers, 
      elementNumber,
      abcdCount: abcdNumbers.length,
      bcdCount: bcdNumbers.length,
      setName,
      allAnalysisKeys: Object.keys(abcdBcdAnalysis)
    });
    
    // Check ABCD first (higher priority)
    if (abcdNumbers.includes(elementNumber)) {
      console.log(`✅ ABCD match for ${elementNumber}`);
      return (
        <span className="inline-flex items-center">
          <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-bold mr-2">
            ABCD
          </span>
          <span className="font-mono">{cellValue}</span>
        </span>
      );
    } 
    
    // Check BCD (lower priority)
    if (bcdNumbers.includes(elementNumber)) {
      console.log(`✅ BCD match for ${elementNumber}`);
      return (
        <span className="inline-flex items-center">
          <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-bold mr-2">
            BCD
          </span>
          <span className="font-mono">{cellValue}</span>
        </span>
      );
    }
    
    console.log(`🔸 No match for ${elementNumber}`);
    return <span className="font-mono">{cellValue}</span>;
  };

  // Build a sliding four-day window ending at "date"
  const buildAllDaysData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('Preparing date window...');
      setError('');

      // 1. Sort all dates ascending (oldest → newest)
      const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
      const targetIdx   = sortedDates.indexOf(date);

      // 2. Be flexible with window creation - use what's available up to 4 dates
      let windowDates;
      if (targetIdx === -1) {
        // clicked date not found → use available dates (prefer recent ones)
        const maxDates = Math.min(4, sortedDates.length);
        windowDates = sortedDates.slice(-maxDates);
        console.log(`⚠️ Target date "${date}" not found in datesList. Using ${windowDates.length} available dates.`);
      } else {
        const end   = targetIdx + 1;           // slice end (exclusive)
        const start = Math.max(0, end - 4);     // can't go below zero
        windowDates  = sortedDates.slice(start, end);
        console.log(`✅ Target date "${date}" found at index ${targetIdx}. Using ${windowDates.length} dates in window.`);
      }
      
      // Single date is perfectly fine for viewing data
      if (windowDates.length === 1) {
        console.log(`📊 Single date mode: Displaying data for "${windowDates[0]}"`);
      }
      
      console.log('🎯 Date Window Analysis:', {
        clickedDate: date,
        allDates: sortedDates,
        targetIndex: targetIdx,
        windowDates: windowDates,
        labelsToUse: windowDates.map((d, i) => `${['A', 'B', 'C', 'D'][i]}: ${d}`)
      });

      setLoadingProgress(10);
      setLoadingMessage(`Loading data for ${windowDates.length} dates...`);

      // 3. Label those up to 4 days as A, B, C, D (chronological order)
      const labels   = ['A', 'B', 'C', 'D'];
      const assembled = {};

      // Process each date with async DataService calls
      for (let idx = 0; idx < windowDates.length; idx++) {
        const d = windowDates[idx];
        const label = labels[idx];  // 'A', 'B', 'C', or 'D'
        
        const progressPerDate = 70 / windowDates.length; // 70% of progress for data loading
        const currentProgress = 10 + (idx * progressPerDate);
        setLoadingProgress(currentProgress);
        setLoadingMessage(`Loading ${label}-day data (${d})...`);

        try {
          // Use DataService with automatic Supabase + localStorage fallback
          const excelData = await dataService.getExcelData(selectedUser, d);
          setLoadingProgress(currentProgress + progressPerDate * 0.5);
          
          const hourData = await dataService.getHourEntry(selectedUser, d);
          setLoadingProgress(currentProgress + progressPerDate);

          // DEBUG: Log the raw data structure with enhanced detail
          console.log(`🔍 Raw data for ${d} (${label}):`, {
            excelData: excelData ? {
              hasSets: !!excelData.sets,
              setNames: excelData.sets ? Object.keys(excelData.sets) : [],
              setCount: excelData.sets ? Object.keys(excelData.sets).length : 0,
              dataSource: excelData.dataSource || 'CleanSupabaseService',
              fileName: excelData.fileName || 'unknown'
            } : null,
            hourData: hourData ? {
              hasPlanetSelections: !!hourData.planetSelections,
              hrNumbers: hourData.planetSelections ? Object.keys(hourData.planetSelections) : [],
              hrCount: hourData.planetSelections ? Object.keys(hourData.planetSelections).length : 0,
              dataSource: hourData.dataSource || 'CleanSupabaseService'
            } : null
          });

          if (excelData && hourData) {
            const planetSel = hourData.planetSelections || {};

            console.log(`🔍 [DATA DEBUG] Processing ${label}-day (${d}):`, {
              excelSets: excelData?.sets ? Object.keys(excelData.sets).length : 'none',
              planetSelections: Object.keys(planetSel).length
            });

            // Build hrData: for each HR, store selectedPlanet + all "sets"
            const hrData = {};
            Object.entries(planetSel).forEach(([hr, selectedPlanet]) => {
              const oneHR = { selectedPlanet, sets: {} };
              // CleanSupabaseService returns data in direct sets format
              const setsData = excelData.sets || {};
              
              console.log(`🔍 [DATA DEBUG] HR${hr} processing:`, {
                selectedPlanet,
                setsDataKeys: Object.keys(setsData).length,
                firstFewSets: Object.keys(setsData).slice(0, 3)
              });
              Object.entries(setsData).forEach(([setName, elementBlock]) => {
                const elementsToShow = {};
                
                console.log(`🔍 [SETS DEBUG] Processing set "${setName}":`, {
                  elementCount: Object.keys(elementBlock).length,
                  elements: Object.keys(elementBlock).slice(0, 3),
                  selectedPlanet
                });
                
                // Process all elements in this set, including those without data
                Object.entries(elementBlock).forEach(([elementName, planetMap]) => {
                  const rawString = planetMap[selectedPlanet];
                  elementsToShow[elementName] = {
                    rawData: rawString || null, // Keep null for missing data instead of excluding
                    selectedPlanet,
                    hasData: !!rawString
                  };
                });
                
                // Ensure all standard elements are present even if not in Excel data
                Object.values(elementNames).forEach(standardElement => {
                  if (!elementsToShow[standardElement]) {
                    elementsToShow[standardElement] = {
                      rawData: null,
                      selectedPlanet,
                      hasData: false
                    };
                  }
                });
                
                oneHR.sets[setName] = elementsToShow;
              });
              hrData[hr] = oneHR;
            });

            assembled[label] = {
              date:      d,
              hrData,
              success:   Object.keys(hrData).length > 0,
              dayLabel:  label
            };
          } else {
            // Missing Excel or HourEntry
            assembled[label] = {
              date:     d,
              hrData:   {},
              success:  false,
              error:    !excelData ? 'No Excel data' : 'No Hour Entry data',
              dayLabel: label
            };
          }
        } catch (dateError) {
          // Error processing this specific date
          assembled[label] = {
            date:     d,
            hrData:   {},
            success:  false,
            error:    `Error loading data: ${dateError.message}`,
            dayLabel: label
          };
        }
      }

      setLoadingProgress(80);
      setLoadingMessage('Processing loaded data...');
      
      // Apply fallback data if needed (development mode)
      const finalAssembled = addFallbackDataIfNeeded(assembled);
      setAllDaysData(finalAssembled);
      
      // DEBUG: Comprehensive data summary with more detail
      console.log(`📈 FINAL DATA ASSEMBLY SUMMARY:`);
      console.log(`   Total days processed: ${Object.keys(assembled).length}`);
      console.log(`   Date window: ${windowDates.join(' → ')}`);
      console.log(`   Labels mapped: ${windowDates.map((d, i) => `${labels[i]}: ${d}`).join(', ')}`);
      
      Object.entries(assembled).forEach(([label, dayData]) => {
        console.log(`   ${label}-day (${dayData.date}):`, {
          success: dayData.success,
          error: dayData.error,
          hrCount: Object.keys(dayData.hrData || {}).length,
          hrNumbers: Object.keys(dayData.hrData || {}),
          setsPerHR: Object.fromEntries(
            Object.entries(dayData.hrData || {}).map(([hr, data]) => [
              hr, {
                setCount: Object.keys(data.sets || {}).length,
                setNames: Object.keys(data.sets || {}),
                selectedPlanet: data.selectedPlanet,
                sampleSetElements: Object.keys(data.sets || {})[0] ? 
                  Object.keys(data.sets[Object.keys(data.sets)[0]] || {}) : [],
                elementDataTypes: Object.keys(data.sets || {})[0] ? 
                  Object.entries(data.sets[Object.keys(data.sets)[0]] || {}).slice(0, 2).map(([el, planetData]) => 
                    `${el}: ${typeof planetData} (keys: ${Object.keys(planetData || {}).join(',')})`
                  ) : []
              }
            ])
          )
        });
      });
      
      // Extra debug: Check raw data structure
      if (assembled.D?.success) {
        const dDayHR = Object.keys(assembled.D.hrData || {})[0];
        if (dDayHR) {
          const dDayData = assembled.D.hrData[dDayHR];
          const setNames = Object.keys(dDayData.sets || {});
          console.log(`🔬 D-day detailed structure check (HR${dDayHR}):`, {
            totalSets: setNames.length,
            firstSetName: setNames[0],
            firstSetStructure: setNames[0] ? dDayData.sets[setNames[0]] : null
          });
        }
      }

      // Auto-select first available HR from any of A/B/C/D using processed data
      setLoadingProgress(90);
      setLoadingMessage('Setting up interface...');
      
      let firstHR = null;
      for (let lbl of ['A', 'B', 'C', 'D']) {
        if (finalAssembled[lbl]?.success) {
          const hrKeys = Object.keys(finalAssembled[lbl].hrData || {});
          if (hrKeys.length) {
            firstHR = hrKeys[0];
            console.log(`🎯 Auto-selected HR${firstHR} from ${lbl}-day`);
            break;
          }
        }
      }
      
      if (firstHR) {
        setActiveHR(firstHR);
        console.log(`✅ Successfully set activeHR to: ${firstHR}`);
      } else {
        console.warn('⚠️ No HR data found in any day. User needs to complete Hour Entries.');
        // Don't set error here - let the UI show what data is available
      }

      setLoadingProgress(100);
      setLoadingMessage('Complete!');
      
      // Small delay to show completion
      setTimeout(() => {
        setLoading(false);
      }, 300);
      
    } catch (err) {
      console.error(err);
      setError('Error building index data.');
      setLoading(false);
    }
  };

  // Compute ABCD-BCD analysis when activeHR changes or data is ready
  useEffect(() => {
    const performAnalysis = async () => {
      console.log('🔍 [ABCD-DEBUG] Starting ABCD-BCD analysis...', {
        activeHR,
        hasA: !!allDaysData.A,
        hasB: !!allDaysData.B,
        hasC: !!allDaysData.C,
        hasD: !!allDaysData.D,
        allDaysDataKeys: Object.keys(allDaysData),
        aSuccess: allDaysData.A?.success,
        bSuccess: allDaysData.B?.success,
        cSuccess: allDaysData.C?.success,
        dSuccess: allDaysData.D?.success
      });

      setDebugStatus('Starting analysis...');

      // Reset analysis progress
      setAnalysisProgress(0);
      setAnalysisMessage('');

      if (!activeHR) {
        console.log('❌ [ABCD-DEBUG] No activeHR, clearing analysis state');
        setDebugStatus('No HR selected');
        setAbcdBcdAnalysis({});
        return;
      }

      // Check which days have data - be more flexible
      const availableLabels = ['A', 'B', 'C', 'D'].filter(lbl => allDaysData[lbl]?.success);
      console.log('📊 Available labels for analysis:', availableLabels);
      
      if (availableLabels.length < 1) {
        console.log(`⚠️ No days available for analysis (${availableLabels.length}), clearing analysis`);
        setAbcdBcdAnalysis({});
        return;
      }

      // Allow analysis with any number of days (1 or more)
      if (availableLabels.length < 4) {
        console.log(`📊 Partial analysis mode: Using ${availableLabels.length} days instead of full 4-day window`);
      }

      // Check if activeHR exists in available days
      const daysWithActiveHR = availableLabels.filter(lbl => 
        allDaysData[lbl].hrData && allDaysData[lbl].hrData[activeHR]
      );
      
      console.log(`🔑 Days with HR${activeHR}:`, daysWithActiveHR);
      
      if (daysWithActiveHR.length === 0) {
        console.log(`❌ HR${activeHR} not available in any days`);
        setAbcdBcdAnalysis({});
        return;
      }

      // If we have less than 4 days, still try to do partial analysis
      if (availableLabels.length < 4) {
        console.log(`⚠️ Partial data analysis: only ${availableLabels.length}/4 days available`);
        setAnalysisMessage(`Partial analysis with ${availableLabels.length} days...`);
      }

      setAnalysisProgress(10);
      setAnalysisMessage('Scanning available sets...');

      const analysis = {};
      
      // Get all unique set names across all days for the active HR (using TOPIC_ORDER approach)
      const discoveredSets = new Set();
      availableLabels.forEach(lbl => {
        if (allDaysData[lbl].hrData[activeHR]) {
          Object.keys(allDaysData[lbl].hrData[activeHR].sets).forEach(setName => {
            discoveredSets.add(setName);
          });
        }
      });

      // ✅ FIXED: Use smart topic matching for ABCD analysis too
      const discoveredTopicsArray = Array.from(discoveredSets);
      const topicMatcherForAnalysis = createTopicMatcher(TOPIC_ORDER, discoveredTopicsArray);
      
      // Get ordered sets using the actual annotated names from database
      const orderedSets = TOPIC_ORDER
        .filter(expectedTopic => topicMatcherForAnalysis.has(expectedTopic))
        .map(expectedTopic => topicMatcherForAnalysis.get(expectedTopic));
      
      console.log('🎯 [ABCD-DEBUG] Sets to analyze (FIXED with Smart Matching):', {
        orderedSetsCount: orderedSets.length,
        orderedSets: orderedSets.slice(0, 5), // Show first 5
        topicMappings: Array.from(topicMatcherForAnalysis.entries()).slice(0, 3) // Show first 3 mappings
      });

      if (orderedSets.length === 0) {
        console.log('❌ [ABCD-DEBUG] No sets found for analysis');
        setDebugStatus('No sets found for analysis');
        setAbcdBcdAnalysis({});
        return;
      }

      setDebugStatus(`Analyzing ${orderedSets.length} sets...`);

      setAnalysisProgress(20);
      setAnalysisMessage(`Analyzing ${orderedSets.length} sets...`);

      // Perform analysis for each set with async calls
      const setsArray = orderedSets;
      for (let i = 0; i < setsArray.length; i++) {
        const setName = setsArray[i];
        const progressPerSet = 70 / setsArray.length; // 70% for analysis, 10% for final processing
        const currentProgress = 20 + (i * progressPerSet);
        
        setAnalysisProgress(currentProgress);
        setAnalysisMessage(`Analyzing ${setName} (${i + 1}/${setsArray.length})...`);
        
        // Use available days - handle missing days gracefully
        const aDay = allDaysData.A?.date || null;
        const bDay = allDaysData.B?.date || null;
        const cDay = allDaysData.C?.date || null;
        const dDay = allDaysData.D?.date || null;
        
        console.log(`🔬 Analyzing set "${setName}" for available dates:`, { 
          aDay: aDay || 'missing', 
          bDay: bDay || 'missing', 
          cDay: cDay || 'missing', 
          dDay: dDay || 'missing' 
        });
        
        try {
          const result = await performIndexAbcdBcdAnalysis(setName, aDay, bDay, cDay, dDay, activeHR);
          
          // Ensure we always have valid arrays
          analysis[setName] = {
            abcdNumbers: Array.isArray(result.abcdNumbers) ? result.abcdNumbers : [],
            bcdNumbers: Array.isArray(result.bcdNumbers) ? result.bcdNumbers : []
          };
          
          console.log(`✅ Analysis result for "${setName}":`, analysis[setName]);
          
          setAnalysisProgress(currentProgress + progressPerSet);
        } catch (error) {
          console.error(`❌ Error analyzing set ${setName}:`, error);
          // Provide fallback empty arrays to prevent rendering issues
          analysis[setName] = { abcdNumbers: [], bcdNumbers: [] };
        }
      }

      setAnalysisProgress(90);
      setAnalysisMessage('Finalizing analysis...');

      console.log('🎉 Final analysis result:', analysis);
      setAbcdBcdAnalysis(analysis);
      
      const totalResults = Object.values(analysis).reduce((sum, result) => 
        sum + result.abcdNumbers.length + result.bcdNumbers.length, 0
      );
      
      setDebugStatus(totalResults > 0 ? 
        `✅ Found ${totalResults} ABCD/BCD numbers` : 
        '⚠️ No ABCD/BCD numbers found'
      );
      
      setAnalysisProgress(100);
      setAnalysisMessage('Analysis complete!');
      
      // Clear analysis progress after a short delay
      setTimeout(() => {
        setAnalysisProgress(0);
        setAnalysisMessage('');
      }, 1000);
    };

    performAnalysis();
  }, [activeHR, Object.keys(allDaysData).join(','), allDaysData.A?.success, allDaysData.B?.success, allDaysData.C?.success, allDaysData.D?.success]);

  // Debug: Log abcdBcdAnalysis state changes
  useEffect(() => {
    console.log('🎪 abcdBcdAnalysis state updated:', abcdBcdAnalysis);
    console.log('🔑 Analysis keys:', Object.keys(abcdBcdAnalysis));
    Object.entries(abcdBcdAnalysis).forEach(([setName, analysis]) => {
      console.log(`📋 Set "${setName}":`, analysis);
    });
  }, [abcdBcdAnalysis]);

  useEffect(() => {
    const loadData = async () => {
      if (selectedUser && Array.isArray(datesList) && datesList.length > 0) {
        await buildAllDaysData();
      } else {
        setError('Missing required user or dates data.');
        setLoading(false);
      }
    };

    loadData();
  }, [selectedUser, datesList, date]); // Removed useSupabaseStorage dependency - now automatic

  // Development mode: Add fallback data if no sets are found
  const addFallbackDataIfNeeded = (assembled) => {
    if (process.env.NODE_ENV === 'development') {
      // Check if any day has sets - Enhanced debugging
      console.log('🔍 [FALLBACK DEBUG] Checking assembled data for sets...');
      console.log('🔍 [FALLBACK DEBUG] Assembled structure:', {
        dayLabels: Object.keys(assembled),
        daySuccessStatus: Object.fromEntries(
          Object.entries(assembled).map(([label, dayData]) => [
            label, 
            {
              success: dayData.success,
              hasHrData: !!dayData.hrData,
              hrKeys: Object.keys(dayData.hrData || {}),
              error: dayData.error
            }
          ])
        )
      });

      // Check each day for sets with detailed logging
      Object.entries(assembled).forEach(([label, dayData]) => {
        console.log(`🔍 [FALLBACK DEBUG] ${label}-day (${dayData.date}):`, {
          success: dayData.success,
          hasHrData: !!dayData.hrData,
          hrCount: Object.keys(dayData.hrData || {}).length
        });
        
        if (dayData.success && dayData.hrData) {
          Object.entries(dayData.hrData).forEach(([hr, hrData]) => {
            const setCount = Object.keys(hrData.sets || {}).length;
            const setNames = Object.keys(hrData.sets || {});
            console.log(`🔍 [FALLBACK DEBUG]   HR${hr}:`, {
              hasSets: !!hrData.sets,
              setCount,
              setNames: setNames.slice(0, 3),
              selectedPlanet: hrData.selectedPlanet
            });
          });
        }
      });

      const hasAnySets = Object.values(assembled).some(dayData => 
        dayData.success && Object.values(dayData.hrData || {}).some(hrData => 
          Object.keys(hrData.sets || {}).length > 0
        )
      );
      
      console.log(`🔍 [FALLBACK DEBUG] hasAnySets result: ${hasAnySets}`);
      
      // 🚨 IMPORTANT: Fallback system disabled to prevent interference with real data
      // The debug logs show that your data structure is loading correctly:
      // - hasHrObj: true, hasSets: true, hasSetName: true, hasElement: true, hasData: true
      // This means Excel and Hour data exist and are being processed properly.
      // 
      // If you see this log but still get fallback data, the issue is likely:
      // 1. Empty sets in your Excel data (excelSets: Array(0))
      // 2. Wrong data structure in uploaded Excel file
      // 3. Data exists but has no actual topic sets
      //
      // To fix: Re-upload Excel file with proper 30 topics structure
      // Format should be: "D-1 Set-1 Matrix", "D-1 Set-2 Matrix", "D-3 Set-1 Matrix", etc.
      
      if (!hasAnySets) {
        console.log('🚧 REAL DATA ISSUE: No sets found in your uploaded Excel data!');
        console.log('📊 Debug shows: hasHrObj=true, hasSets=true, but actual sets are empty');
        console.log('🔧 SOLUTION: Re-upload Excel file with all 30 topics properly formatted');
        console.log('   Expected format: D-1 Set-1 Matrix, D-1 Set-2 Matrix, D-3 Set-1 Matrix, etc.');
        console.log('   Your current Excel data has structure but no actual sets/topics');
        
        // Instead of adding fallback data, show clear error message
        console.log('❌ FALLBACK SYSTEM DISABLED - Upload proper Excel data to see real topics');
      } else {
        console.log('✅ Real sets found! This should show your 30 topics in ascending order');
      }
    }
    return assembled;
  };

  // Helper function to create a complete element set with all 9 standard elements
  const createCompleteElementSet = (selectedPlanet, baseNumber) => {
    const elementCodes = {
      'Lagna': 'as',
      'Moon': 'mo', 
      'Hora Lagna': 'hl',
      'Ghati Lagna': 'gl',
      'Vighati Lagna': 'vig',
      'Varnada Lagna': 'var',
      'Sree Lagna': 'sl',
      'Pranapada Lagna': 'pp',
      'Indu Lagna': 'in'
    };
    
    const elementSet = {};
    Object.entries(elementCodes).forEach(([elementName, code], index) => {
      elementSet[elementName] = {
        rawData: `${code}-${baseNumber + index}/fallback-data`,
        selectedPlanet: selectedPlanet,
        hasData: true
      };
    });
    
    return elementSet;
  };

  // 🔗 Function to provide enhanced analysis data to Rule2Page
  const getAnalysisDataForRule2 = (setName) => {
    const extractedData = extractedNumbers[setName];
    const analysisData = analysisResults?.[setName];
    
    if (extractedData && analysisData) {
      console.log(`📤 Providing enhanced analysis data for ${setName} to Rule2Page`);
      return {
        extractedNumbers: extractedData,
        analysisResults: analysisData,
        enhancedAnalyzer: abcdBcdAnalyzer,
        timestamp: extractedData.timestamp
      };
    }
    
    console.log(`⚠️ No enhanced analysis data available for ${setName}`);
    return null;
  };

  // 🚀 Enhanced navigation to Rule2Page with analysis data
  const handleExtractNumbersWithAnalysis = (date, hrNumber, setName = null) => {
    console.log(`🚀 Enhanced navigation to Rule2Page - Date: ${date}, HR: ${hrNumber}, Set: ${setName}`);
    
    // Prepare enhanced data package for Rule2Page
    const enhancedData = {
      date,
      hrNumber,
      setName,
      analysisData: setName ? getAnalysisDataForRule2(setName) : null,
      allAnalysisResults: analysisResults,
      allExtractedNumbers: extractedNumbers,
      enhancedAnalyzer: abcdBcdAnalyzer
    };

    // Call the original callback with enhanced data
    if (onExtractNumbers) {
      onExtractNumbers(date, hrNumber, enhancedData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">Loading Index Data</h3>
            <p className="text-sm text-gray-600 mt-1">
              Fetching data automatically with cloud sync and local backup...
            </p>
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
                ☁️ Using automatic storage selection for optimal performance and reliability
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
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Error</div>
          <p className="mb-4 text-gray-700">{error}</p>
          <button
            onClick={onBack}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // Determine the clicked date's ascending index to gate "Extract Numbers"
  const sortedAll = [...datesList].sort((a, b) => new Date(a) - new Date(b));
  const idxAll    = sortedAll.indexOf(date);
  const canEnableRule2 = idxAll >= 4 && activeHR !== null;

  // Helpers for matrix display
  const generateColumnHeader = (dayObj) => {
    if (!dayObj.success || !activeHR || !dayObj.hrData[activeHR]) {
      return `${dayObj.date}-(${dayObj.dayLabel})`;
    }
    const planet = dayObj.hrData[activeHR].selectedPlanet;
    return `${dayObj.date}-${planet}(${dayObj.dayLabel})`;
  };

  const isDColumn = (dayObj) => dayObj.dayLabel === 'D';
  const headerCellClass = (dayObj) => {
    let base = 'border border-gray-300 px-4 py-2 font-semibold text-center';
    if (isDColumn(dayObj)) {
      base += ' bg-blue-600 text-white';
    } else {
      base += ' bg-gray-50 text-gray-700';
    }
    return base;
  };

  // Determine which labels (A, B, C, D) are present
  const availableLabels = ['A', 'B', 'C', 'D'].filter(lbl => allDaysData[lbl]?.success);
  
  // Get HR choices from any available day (not just 'D') - Enhanced for partial data
  const hrChoices = (() => {
    const allHRs = new Set();
    console.log('🔍 HR Choices Debug:', {
      availableLabels,
      allDaysDataKeys: Object.keys(allDaysData),
      successfulDays: Object.entries(allDaysData).map(([key, data]) => ({
        label: key,
        success: data?.success,
        hasHrData: !!data?.hrData,
        hrDataKeys: data?.hrData ? Object.keys(data.hrData) : []
      }))
    });
    
    // Check ALL days (including unsuccessful ones) for any HR data
    Object.entries(allDaysData).forEach(([lbl, dayData]) => {
      console.log(`🔍 Checking ${lbl}-day:`, {
        hasData: !!dayData,
        success: dayData?.success,
        hasHrData: !!dayData?.hrData,
        hrKeys: dayData?.hrData ? Object.keys(dayData.hrData) : []
      });
      
      if (dayData?.hrData) {
        Object.keys(dayData.hrData).forEach(hr => {
          console.log(`  Found HR${hr} in ${lbl}-day`);
          allHRs.add(hr);
        });
      }
    });
    
    const result = Array.from(allHRs).sort((a, b) => parseInt(a) - parseInt(b));
    console.log('🎯 Final HR choices:', result);
    return result;
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Top Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-orange-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔮 Astrological Index Matrix</h1>
              <div className="mt-2 text-sm text-orange-800">
                <p>👤 User: {selectedUserData?.username || selectedUser}</p>
                <p>📅 Clicked Date: {new Date(date).toLocaleDateString()}</p>
                <p>🗓️ Window: {availableLabels.join(', ')}</p>
              </div>
              
              {/* Debug Status Display */}
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-600">Debug:</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  debugStatus.includes('✅') ? 'bg-green-100 text-green-700' :
                  debugStatus.includes('⚠️') ? 'bg-yellow-100 text-yellow-700' :
                  debugStatus.includes('❌') ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {debugStatus}
                </span>
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* HR Selection & Matrix */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          {/* Developer Debug Panel */}
          {process.env.NODE_ENV === 'development' && (
            <div className="border-b border-gray-200 p-3 bg-yellow-50">
              <details>
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  🐛 Developer Debug Panel (Click to expand)
                </summary>
                <div className="mt-2 text-xs space-y-2">
                  <div><strong>Loading:</strong> {loading.toString()}</div>
                  <div><strong>ActiveHR:</strong> {activeHR || 'null'}</div>
                  <div><strong>Available Labels:</strong> [{availableLabels.join(', ')}]</div>
                  <div><strong>HR Choices:</strong> [{hrChoices.join(', ')}]</div>
                  <div><strong>Analysis Keys:</strong> [{Object.keys(abcdBcdAnalysis).join(', ')}]</div>
                  <div><strong>All Days Data Keys:</strong> [{Object.keys(allDaysData).join(', ')}]</div>
                  
                  {activeHR && availableLabels.length > 0 && (
                    <div className="mt-2 p-2 bg-white rounded border">
                      <strong>Sample Data Check:</strong>
                      {(() => {
                        const sampleDay = availableLabels[0];
                        const sampleHRData = allDaysData[sampleDay]?.hrData?.[activeHR];
                        return (
                          <div className="text-xs mt-1 space-y-1">
                            <div><strong>Sample Day:</strong> {sampleDay}</div>
                            <div><strong>Has HR Data:</strong> {!!sampleHRData}</div>
                            <div><strong>Sets:</strong> {sampleHRData ? Object.keys(sampleHRData.sets || {}).join(', ') : 'none'}</div>
                            <div><strong>Selected Planet:</strong> {sampleHRData?.selectedPlanet || 'none'}</div>
                            {sampleHRData?.sets && Object.keys(sampleHRData.sets).length > 0 && (
                              <div>
                                <strong>Sample Set Elements:</strong> {Object.keys(Object.values(sampleHRData.sets)[0] || {}).join(', ')}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  <div className="mt-2 p-2 bg-white rounded border">
                    <strong>Analysis State:</strong>
                    <div className="text-xs mt-1 space-y-1">
                      <div><strong>Progress:</strong> {analysisProgress}%</div>
                      <div><strong>Message:</strong> {analysisMessage}</div>
                      <div><strong>Total Sets with Analysis:</strong> {Object.keys(abcdBcdAnalysis).length}</div>
                      {Object.entries(abcdBcdAnalysis).map(([setName, analysis]) => (
                        <div key={setName} className="ml-2">
                          <strong>{setName}:</strong> ABCD={analysis.abcdNumbers?.length || 0}, BCD={analysis.bcdNumbers?.length || 0}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}
          
          <div className="border-b border-gray-200 p-4">
            <span className="text-sm font-medium text-gray-600 mr-4">Select HR:</span>
            {hrChoices.map(hr => (
              <button
                key={hr}
                onClick={() => setActiveHR(hr)}
                className={`mx-1 px-3 py-1 rounded-lg text-sm font-medium ${
                  activeHR === hr
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                }`}
              >
                HR {hr}
              </button>
            ))}
          </div>
          
          {/* Analysis Progress Bar */}
          {analysisProgress > 0 && analysisProgress < 100 && (
            <div className="border-b border-gray-200 p-4 bg-blue-50">
              <ProgressBar 
                progress={analysisProgress}
                message={analysisMessage}
                color="blue"
                className="mb-2"
              />
              <p className="text-xs text-gray-600 text-center">
                🧮 Computing ABCD/BCD patterns for HR {activeHR}...
              </p>
            </div>
          )}
          
          {/* Color-Coding Legend */}
          {activeHR && Object.keys(abcdBcdAnalysis).length > 0 && (
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center space-x-6 text-sm">
                <span className="font-medium text-gray-700">Legend:</span>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-bold">
                    ABCD
                  </span>
                  <span className="text-gray-600">D-day numbers appearing in ≥2 of A,B,C days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                    BCD
                  </span>
                  <span className="text-gray-600">D-day numbers in exclusive B-D or C-D pairs</span>
                </div>
                <span className="text-xs text-gray-500 italic">
                  (ABCD takes priority over BCD - numbers can't be both)
                </span>
              </div>
            </div>
          )}

          {/* Topic Selection UI */}
          {activeHR && availableTopics.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filter Topics:</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedTopics.size} of {availableTopics.length} selected
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowTopicSelector(!showTopicSelector)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showTopicSelector ? '☑️ Hide Selector' : '◻️ Show Selector'}
                  </button>
                </div>
              </div>

              {showTopicSelector && (
                <div className="space-y-4">
                  {/* Topic Groups (Smart Selection) */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Topic Groups (Smart Selection)</h4>
                    <div className="flex flex-wrap gap-2">
                      {getUniqueBaseTopics().map(baseTopic => {
                        const isSelected = isBaseTopicSelected(baseTopic);
                        const isPartial = isBaseTopicPartiallySelected(baseTopic);
                        const relatedTopics = getRelatedTopics(baseTopic);
                        
                        return (
                          <button
                            key={baseTopic}
                            onClick={() => handleBaseTopicToggle(baseTopic)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : isPartial
                                ? 'bg-blue-200 text-blue-800 border-2 border-blue-400'
                                : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                            }`}
                            title={`${baseTopic}: ${relatedTopics.join(', ')}`}
                          >
                            {baseTopic} {isSelected ? '✓' : isPartial ? '◐' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Topics (Fine Control) */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Individual Topics (Fine Control)</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {availableTopics.map(topic => (
                        <div key={topic} className="relative">
                          <button
                            onClick={() => handleTopicToggle(topic)}
                            className={`w-full px-2 py-1 rounded text-xs font-medium transition-all text-left ${
                              selectedTopics.has(topic)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{formatSetName(topic)}</span>
                              {selectedTopics.has(topic) && <span className="text-white text-xs">✓</span>}
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTopics.size === 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ No topics selected. Select at least one topic to view analysis results.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="p-6">
            {/* Data Status Panel - Show even when no activeHR */}
            {hrChoices.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                      No HR Data Available
                    </h3>
                    <p className="text-yellow-700 mb-4">
                      The IndexPage requires both Excel data and Hour Entry data for at least one date to display HR tabs.
                    </p>
                    
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">Current Data Status:</h4>
                      <div className="space-y-2 text-sm">
                        {['A', 'B', 'C', 'D'].map(label => {
                          const dayData = allDaysData[label];
                          const hasData = !!dayData;
                          const success = dayData?.success;
                          const hasHrData = !!dayData?.hrData;
                          const hrCount = hasHrData ? Object.keys(dayData.hrData).length : 0;
                          
                          return (
                            <div key={label} className="flex justify-between items-center">
                              <span className="font-medium">{label}-day ({dayData?.date || 'Unknown'}):</span>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {success ? '✅ Complete' : '❌ Missing data'}
                                </span>
                                {hasHrData && (
                                  <span className="text-xs text-gray-600">
                                    {hrCount} HR{hrCount !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">💡 How to Fix:</h4>
                      <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
                        <li>Go back to the main ABCD page</li>
                        <li>For each missing date, click "Excel Upload" and upload Excel file</li>
                        <li>For each date, click "Hour Entry" and select planets for each HR</li>
                        <li>Return to IndexPage once you have complete data for at least one date</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeHR ? (
              (() => {
                // Get all unique sets for the active HR with better error handling
                const allSets = new Set();
                const debugInfo = { availableLabels, activeHR, dayDataStatus: {} };
                
                availableLabels.forEach(lbl => {
                  const dayData = allDaysData[lbl];
                  const hrData = dayData?.hrData?.[activeHR];
                  const sets = hrData?.sets;
                  
                  debugInfo.dayDataStatus[lbl] = {
                    hasData: !!dayData,
                    success: dayData?.success,
                    hasHrData: !!hrData,
                    hasSets: !!sets,
                    setCount: sets ? Object.keys(sets).length : 0,
                    setNames: sets ? Object.keys(sets) : []
                  };
                  
                  if (sets) {
                    Object.keys(sets).forEach(setName => {
                      allSets.add(setName);
                    });
                  }
                });
                
                console.log(`🎭 Rendering tables for HR${activeHR}:`, debugInfo);
                
                if (allSets.size === 0) {
                  return (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">⚠️</div>
                      <p className="text-lg font-semibold mb-4 text-red-600">No Sets Found for HR{activeHR}</p>
                      <div className="bg-gray-100 p-4 rounded-lg text-left max-w-2xl mx-auto">
                        <h4 className="font-semibold mb-2">Debug Information:</h4>
                        <div className="text-sm space-y-1">
                          <div><strong>Available Labels:</strong> {availableLabels.join(', ')}</div>
                          <div><strong>Active HR:</strong> {activeHR}</div>
                          {Object.entries(debugInfo.dayDataStatus).map(([label, status]) => (
                            <div key={label} className="ml-4">
                              <strong>{label}-day:</strong> Success={status.success?.toString()}, 
                              Sets={status.setCount} {status.setNames.length > 0 && `(${status.setNames.join(', ')})`}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-xs text-gray-600">
                          Check console logs for detailed data loading information
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Apply topic filtering to respect user selection
                const topicsToDisplay = getTopicsForDisplay();
                const filteredSets = Array.from(allSets).filter(setName => 
                  topicsToDisplay.includes(setName)
                );
                
                console.log(`🎯 Topic filtering applied:`, {
                  totalSets: allSets.size,
                  selectedTopics: selectedTopics.size,
                  availableTopics: availableTopics.length,
                  topicsToDisplay: topicsToDisplay.length,
                  filteredSets: filteredSets.length,
                  setsToRender: filteredSets
                });
                
                return filteredSets.map(setName => (
                <div key={setName} className="mb-8">
                  <h2 className="text-lg font-bold mb-3 bg-blue-50 p-2 rounded">
                    {setName}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 font-semibold bg-gray-100">
                            Element
                          </th>
                          {availableLabels.map(lbl => {
                            const dayObj = allDaysData[lbl];
                            return (
                              <th key={lbl} className={headerCellClass(dayObj)}>
                                {generateColumnHeader(dayObj)}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Define the specific order for elements as requested
                          const orderedElementNames = [
                            'Lagna',
                            'Moon', 
                            'Hora Lagna',
                            'Ghati Lagna',
                            'Vighati Lagna',
                            'Varnada Lagna',
                            'Sree Lagna',
                            'Pranapada Lagna',
                            'Indu Lagna'
                          ];
                          
                          // Collect all unique elements across all days to check what data is available
                          const availableElements = new Set();
                          
                          // First, add elements that actually have data
                          availableLabels.forEach(lbl => {
                            const hrObj = allDaysData[lbl].hrData[activeHR];
                            if (hrObj && hrObj.sets && hrObj.sets[setName]) {
                              Object.keys(hrObj.sets[setName]).forEach(el => availableElements.add(el));
                            }
                          });
                          
                          // Ensure we show all standard elements even if they have no data
                          Object.values(elementNames).forEach(standardElement => {
                            availableElements.add(standardElement);
                          });
                          
                          // Filter ordered elements to only include those that should be displayed
                          const elementsToDisplay = orderedElementNames.filter(elName => 
                            availableElements.has(elName)
                          );
                          
                          console.log(`🎭 Rendering elements for ${setName} in specified order:`, elementsToDisplay);
                          
                          return elementsToDisplay.map(elName => (
                            <tr key={elName} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-medium bg-blue-200">
                                {elName}
                              </td>
                              {availableLabels.map(lbl => {
                                const hrObj = allDaysData[lbl].hrData[activeHR];
                                let cellValue = '—';
                                let hasData = false;
                                
                                // Safely extract cell value with multiple fallback checks
                                if (hrObj && hrObj.sets && hrObj.sets[setName] && hrObj.sets[setName][elName]) {
                                  const elementData = hrObj.sets[setName][elName];
                                  hasData = elementData.hasData;
                                  cellValue = elementData.rawData || '—';
                                }
                                
                                console.log(`📊 Cell value for ${lbl}-${elName}:`, {
                                  hasHrObj: !!hrObj,
                                  hasSets: !!(hrObj && hrObj.sets),
                                  hasSetName: !!(hrObj && hrObj.sets && hrObj.sets[setName]),
                                  hasElement: !!(hrObj && hrObj.sets && hrObj.sets[setName] && hrObj.sets[setName][elName]),
                                  hasData,
                                  cellValue
                                });
                                
                                const baseClass = 'border border-gray-300 px-4 py-2 text-center font-mono text-sm';
                                const dayLabel  = allDaysData[lbl].dayLabel;
                                
                                return (
                                  <td
                                    key={lbl}
                                    className={`${baseClass} ${
                                      isDColumn(allDaysData[lbl])
                                        ? 'ring-2 ring-blue-400 bg-blue-50'
                                        : hasData 
                                          ? 'bg-green-50 text-gray-800' 
                                          : 'bg-red-50 text-gray-400'
                                    }`}
                                  >
                                    {renderColorCodedDayNumber(cellValue, setName, dayLabel)}
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
                ));
              })()
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-lg font-semibold mb-2">Select an HR above</p>
                <p>Click an HR tab to view the available data matrices</p>
              </div>
            )}
          </div>
        </div>

        {/* Extract Numbers (Rule-2) Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => {
              if (canEnableRule2) {
                handleExtractNumbersWithAnalysis(date, activeHR);
              }
            }}
            disabled={!canEnableRule2}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              canEnableRule2
                ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            🚀 Extract Numbers (Enhanced)
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;

// === DEBUG/EXPLANATION: Why do you see fallback-data here? ===
// If you see cellValue like 'pp-12/fallback-data' or 'in-13/fallback-data',
// it means the application could not find real Excel data for this cell.
// This happens when:
//   1. No real Excel data is loaded for this date/user/HR
//   2. The Excel data exists but has no sets (topics)
//   3. The fallback system is triggered (DEV mode, or missing data)
// To fix: Upload a proper Excel file for this date with all 30 topics/sets.
// After upload, this fallback-data will disappear and you will see real numbers.
// See also: addFallbackDataIfNeeded() and debug logs above for more details.
// === END DEBUG/EXPLANATION ===
