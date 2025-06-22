// src/components/Rule1Page.jsx

import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { Rule2ResultsService } from '../services/rule2ResultsService';
import ProgressBar from './ProgressBar';

function Rule1Page({ date, selectedUser, selectedUserData, datesList, onBack }) {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [error, setError] = useState('');
  const [activeHR, setActiveHR] = useState(null);
  const [allDaysData, setAllDaysData] = useState({});
  const [windowType, setWindowType] = useState('');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [abcdBcdHeaderData, setAbcdBcdHeaderData] = useState(new Map()); // Store ABCD/BCD for headers only
  
  // Topic-specific ABCD/BCD analysis (for color-coding matrix cells)
  const [abcdBcdAnalysis, setAbcdBcdAnalysis] = useState({});
  
  // NEW: Comprehensive topic-specific ABCD/BCD data per date
  const [topicAbcdBcdPerDate, setTopicAbcdBcdPerDate] = useState({});
  
  // Topic selection (needed for matrix filtering)
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [showTopicSelector, setShowTopicSelector] = useState(true); // Show/hide topic selector
  
  // Loading stages tracking
  const [loadingStages, setLoadingStages] = useState({
    dataValidation: false,
    dateProcessing: false,
    topicProcessing: false,
    uiRendering: false
  });
  
  // Initialize DataService
  const dataService = new DataService();

  // Define the 30-topic order in ascending numerical order (same as Rule2CompactPage)
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
  
  // Extract the FIRST number after element prefix, e.g. "as-7/su-..." → 7
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
    return match ? Number(match[1]) : null;
  };

  // Enhanced render function for table cells with ABCD/BCD color-coding
  const renderColorCodedDayNumber = (cellValue, setName, isCurrentDate = false, dateKey = null) => {
    // Debug logging for specific date and topic
    if ((dateKey === '2025-06-06' || dateKey === '2025-06-06-Sa') && setName === 'D-1 Set-1 Matrix') {
      console.log(`🎯 [SPECIFIC DEBUG] Rendering ${setName} for ${dateKey}, cellValue: ${cellValue}`);
    }
    
    // Base styling
    let baseSpan = <span className="font-mono">{cellValue}</span>;
    
    // Only apply color coding to valid cell values
    if (!cellValue || cellValue === '—' || cellValue === '(No Data)') {
      return baseSpan;
    }
    
    // Extract number from cell value
    const elementNumber = extractElementNumber(cellValue);
    if (elementNumber === null || isNaN(elementNumber)) {
      return baseSpan;
    }
    
    // Check if we should apply badges: only from 5th date onwards
    const shouldApplyBadges = (() => {
      if (!dateKey || !availableDates) return false;
      
      // Sort dates in ascending order (oldest to newest)
      const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
      const dateIndex = sortedDates.findIndex(d => d === dateKey);
      
      // Only apply badges from 5th date onwards (index 4+)
      return dateIndex >= 4;
    })();
    
    // Get topic-specific ABCD/BCD numbers from abcdBcdAnalysis
    const { abcdNumbers: topicAbcdNumbers = [], bcdNumbers: topicBcdNumbers = [] } = 
      abcdBcdAnalysis[setName] || {};
    
    // Debug logging for specific date and topic ABCD/BCD data
    if ((dateKey === '2025-06-06' || dateKey === '2025-06-06-Sa') && setName === 'D-1 Set-1 Matrix') {
      console.log(`🎯 [SPECIFIC DEBUG] abcdBcdAnalysis state:`, abcdBcdAnalysis);
      console.log(`🎯 [SPECIFIC DEBUG] Topic analysis for ${setName}:`, abcdBcdAnalysis[setName]);
      console.log(`🎯 [SPECIFIC DEBUG] ABCD: [${topicAbcdNumbers.join(',')}], BCD: [${topicBcdNumbers.join(',')}]`);
    }
    
    // Debug logging for badge application
    if (elementNumber && setName && shouldApplyBadges) {
      console.log(`🔍 [Badge Check] ${setName} | Number: ${elementNumber} | Date: ${dateKey} | ABCD: [${topicAbcdNumbers.join(',')}] | BCD: [${topicBcdNumbers.join(',')}]`);
      console.log(`🔍 [Badge Details] shouldApplyBadges: ${shouldApplyBadges}, dateIndex: ${(() => {
        const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
        return sortedDates.findIndex(d => d === dateKey);
      })()}, cellValue: ${cellValue}`);
    }
    
    // Check if this number matches topic-specific ABCD or BCD arrays
    const isAbcdMatch = shouldApplyBadges && topicAbcdNumbers.includes(elementNumber);
    const isBcdMatch = shouldApplyBadges && topicBcdNumbers.includes(elementNumber);
    
    // Apply color coding based on ABCD/BCD status (badges only, no background colors)
    if (isAbcdMatch) {
      console.log(`✅ [ABCD Badge] Applied to ${cellValue} in ${setName} on ${dateKey}`);
      // Extra debug for specific numbers
      if ([10, 11].includes(elementNumber)) {
        console.log(`🎯 [EXPECTED ABCD] Badge applied to expected number ${elementNumber}`);
      }
      return (
        <span className="inline-flex items-center">
          <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-bold mr-1">
            ABCD
          </span>
          <span className="font-mono">{cellValue}</span>
        </span>
      );
    } else if (isBcdMatch) {
      console.log(`✅ [BCD Badge] Applied to ${cellValue} in ${setName} on ${dateKey}`);
      // Extra debug for specific numbers
      if ([2, 9].includes(elementNumber)) {
        console.log(`🎯 [EXPECTED BCD] Badge applied to expected number ${elementNumber}`);
      }
      return (
        <span className="inline-flex items-center">
          <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-bold mr-1">
            BCD
          </span>
          <span className="font-mono">{cellValue}</span>
        </span>
      );
    }
    
    return baseSpan;
  };

  // Simple render function for table cells (fallback)
  const renderSimpleDayNumber = (cellValue) => {
    return <span className="font-mono">{cellValue}</span>;
  };

  // Topic Selection Functions (similar to IndexPage)
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

  // Optimized data loading with progress tracking
  const buildAllDaysData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('Starting analysis...');
      
      console.log(`🔍 [Rule-1] Loading data for user ${selectedUser}, date ${date}`);
      console.log(`📊 [Rule-1] Available dates:`, datesList);

      // Stage 1: Data Validation (0-10%)
      setLoadingProgress(5);
      setLoadingMessage('Validating input data...');
      setLoadingStages(prev => ({ ...prev, dataValidation: true }));

      if (!datesList || !Array.isArray(datesList) || datesList.length === 0) {
        console.error(`❌ [Rule-1] CRITICAL: Invalid datesList:`, datesList);
        setError('Invalid dates list provided to Rule-1 page');
        setLoading(false);
        return;
      }

      if (!selectedUser) {
        console.error(`❌ [Rule-1] CRITICAL: No selectedUser provided`);
        setError('No user selected for Rule-1 analysis');
        setLoading(false);
        return;
      }

      setLoadingProgress(10);
      setLoadingMessage('Sorting dates and calculating window...');

      // 1. Sort all dates ascending (oldest → newest)
      const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
      console.log(`📈 [Rule-1] Sorted dates (oldest→newest):`, sortedDates);
      
      const targetIdx = sortedDates.indexOf(date);
      console.log(`🎯 [Rule-1] Target date "${date}" found at index:`, targetIdx);

      if (targetIdx === -1) {
        console.error(`❌ [Rule-1] CRITICAL: Clicked date "${date}" not found in datesList!`);
        setError(`Selected date "${date}" not found in available dates list`);
        setLoading(false);
        return;
      }

      // 2. Show ALL dates up to and INCLUDING the clicked date
      let windowDates = sortedDates.slice(0, targetIdx + 1);
      console.log(`🪟 [Rule-1] Window dates:`, windowDates);
      console.log(`🪟 [Rule-1] Window analysis:`, {
        totalDates: windowDates.length,
        firstDate: windowDates[0],
        lastDate: windowDates[windowDates.length - 1],
        fifthDate: windowDates.length >= 5 ? windowDates[4] : 'Not available',
        clickedDate: date,
        isClickedDateFifth: windowDates.length >= 5 && windowDates[4] === date
      });
      
      if (windowDates.length < 4) {
        console.error(`❌ [Rule-1] Need at least 4 dates, got ${windowDates.length}`);
        setError(`Rule-1 requires at least 4 dates total. Only ${windowDates.length} dates available.`);
        setLoading(false);
        return;
      }
      
      const dateIndex = sortedDates.indexOf(date);
      setWindowType(`Historical View (${windowDates.length} dates up to ${dateIndex + 1}th date)`);

      // Stage 2: Date Processing (10-80%)
      setLoadingProgress(15);
      setLoadingMessage('Loading data for all dates...');
      setLoadingStages(prev => ({ ...prev, dateProcessing: true }));

      const assembled = {};
      const totalDates = windowDates.length;
      const progressPerDate = 65 / totalDates; // 65% for all date processing (15% to 80%)

      // Optimize: Load all data concurrently with Promise.all for better performance
      const dataPromises = windowDates.map(async (d, idx) => {
        const currentProgress = 15 + (idx * progressPerDate);
        setLoadingProgress(currentProgress);
        setLoadingMessage(`Loading date ${idx + 1}/${totalDates}: ${new Date(d).toLocaleDateString()}`);

        try {
          // Load Excel and Hour data concurrently
          const [excelData, hourData] = await Promise.all([
            dataService.getExcelData(selectedUser, d),
            dataService.getHourEntry(selectedUser, d)
          ]);
          
          console.log(`📊 [Rule-1] Date ${d} - Excel:`, !!excelData, 'Hour:', !!hourData);

          if (excelData && hourData) {
            const planetSel = hourData.planetSelections || {};
            const hrData = {};

            // Process HR data efficiently
            Object.entries(planetSel).forEach(([hr, selectedPlanet]) => {
              const oneHR = { selectedPlanet, sets: {} };
              const sets = excelData.data.sets || {};
              
              Object.entries(sets).forEach(([setName, elementBlock]) => {
                const elementsToShow = {};
                Object.entries(elementBlock).forEach(([elementName, planetMap]) => {
                  const rawString = planetMap[selectedPlanet];
                  if (rawString) {
                    elementsToShow[elementName] = rawString;
                  }
                });
                
                if (Object.keys(elementsToShow).length > 0) {
                  oneHR.sets[setName] = elementsToShow;
                }
              });
              
              hrData[hr] = oneHR;
            });

            return {
              dateKey: d,
              data: {
                date: d,
                success: true,
                isEmpty: false,
                hrData,
                dataSource: 'Optimized Concurrent Load'
              }
            };
          } else {
            return {
              dateKey: d,
              data: {
                date: d,
                success: false,
                isEmpty: true,
                hrData: {},
                error: `Missing ${!excelData ? 'Excel' : ''} ${!hourData ? 'Hour' : ''} data`
              }
            };
          }
        } catch (error) {
          console.error(`❌ Error loading date ${d}:`, error);
          return {
            dateKey: d,
            data: {
              date: d,
              success: false,
              isEmpty: true,
              hrData: {},
              error: error.message
            }
          };
        }
      });

      // Wait for all dates to load concurrently
      setLoadingMessage('Processing all date data...');
      const results = await Promise.all(dataPromises);
      
      // Assemble results
      results.forEach(({ dateKey, data }) => {
        assembled[dateKey] = data;
      });

      setLoadingProgress(80);
      setLoadingMessage('Loading ABCD/BCD for headers...');
      
      // Load ABCD/BCD data for 5th date (trigger date) header display
      await loadAbcdBcdForHeaders(windowDates);
      
      setLoadingProgress(85);
      setLoadingMessage('Finalizing data structure...');

      setAllDaysData(assembled);
      console.log(`✅ [Rule-1] All days data assembled:`, assembled);

      // Auto-select first available HR if none selected
      if (!activeHR) {
        const allHRs = new Set();
        Object.values(assembled).forEach(dayData => {
          if (dayData?.success && dayData.hrData) {
            Object.keys(dayData.hrData).forEach(hr => allHRs.add(hr));
          }
        });
        const firstHR = Array.from(allHRs).sort((a, b) => parseInt(a) - parseInt(b))[0];
        if (firstHR) {
          console.log(`🎯 [Rule-1] Auto-selecting first HR: ${firstHR}`);
          setActiveHR(firstHR);
        }
      }

      setLoadingProgress(95);
      setLoadingMessage('✅ Matrix ready!');
      setLoadingStages(prev => ({ ...prev, uiRendering: true }));

      // Brief completion delay to show success message
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(100);
        setShowSuccessNotification(true);
        console.log('🎉 [Rule-1] Page fully loaded and ready!');
        
        // Hide success notification after 3 seconds
        setTimeout(() => {
          setShowSuccessNotification(false);
        }, 3000);
      }, 800);

    } catch (error) {
      console.error('❌ [Rule-1] Error in buildAllDaysData:', error);
      setError(`Failed to load data: ${error.message}`);
      setLoading(false);
    }
  };

  // Load ABCD/BCD results for header display using Rule2Page calculation logic
  // NOTE: This calculates OVERALL ABCD/BCD from ALL topics combined (like Rule2Page)
  // This is different from topic-specific analysis which calculates separate ABCD/BCD for each topic
  const loadAbcdBcdForHeaders = async (windowDates) => {
    try {
      console.log('🔍 [Rule1] Loading ABCD/BCD for header display using Rule2Page logic, window dates:', windowDates);
      
      const headerDataMap = new Map();
      
      // Check if we have a 5th date (trigger date) for ABCD/BCD display
      if (windowDates.length >= 5) {
        const triggerDate = windowDates[4]; // 5th date (index 4)
        
        console.log(`🎯 [Rule1] Processing trigger date for header: ${triggerDate}`);
        
        try {
          // Sort dates to get ABCD sequence
          const sortedDates = [...windowDates].sort((a, b) => new Date(a) - new Date(b));
          const clickedIndex = sortedDates.findIndex(d => d === triggerDate);
          
          if (clickedIndex >= 4) {
            // Get ABCD sequence (4 dates before trigger date)
            const aDay = sortedDates[clickedIndex - 4];
            const bDay = sortedDates[clickedIndex - 3]; 
            const cDay = sortedDates[clickedIndex - 2];
            const dDay = sortedDates[clickedIndex - 1];
            
            console.log(`🎯 [Rule1] Header ABCD sequence: A=${aDay}, B=${bDay}, C=${cDay}, D=${dDay}`);
            
            // Extract numbers from ALL topics combined (like Rule2CompactPage)
            const extractFromDate = async (targetDate) => {
              try {
                const excelData = await dataService.getExcelData(selectedUser, targetDate);
                const hourData = await dataService.getHourEntry(selectedUser, targetDate);
                
                if (!excelData || !hourData) return [];
                
                const sets = excelData.data.sets || {};
                const planetSelections = hourData.planetSelections || {};
                const firstHR = Object.keys(planetSelections).sort((a, b) => parseInt(a) - parseInt(b))[0];
                const selectedPlanet = planetSelections[firstHR];
                
                if (!selectedPlanet) return [];
                
                const allNumbers = new Set();
                
                // Get all available sets in TOPIC_ORDER
                const availableSets = TOPIC_ORDER.filter(setName => sets[setName]);
                
                // Extract numbers from ALL topics
                availableSets.forEach(setName => {
                  const setData = sets[setName];
                  if (setData) {
                    Object.entries(setData).forEach(([elementName, planetData]) => {
                      const rawString = planetData[selectedPlanet];
                      if (rawString) {
                        const elementNumber = extractElementNumber(rawString);
                        if (elementNumber !== null) {
                          allNumbers.add(elementNumber);
                        }
                      }
                    });
                  }
                });
                
                return Array.from(allNumbers).sort((a, b) => a - b);
              } catch (error) {
                return [];
              }
            };
            
            // Extract numbers from each day
            const [dDayNumbers, aDayNumbers, bDayNumbers, cDayNumbers] = await Promise.all([
              extractFromDate(dDay),
              extractFromDate(aDay),
              extractFromDate(bDay), 
              extractFromDate(cDay)
            ]);
            
            if (dDayNumbers.length > 0) {
              // Calculate ABCD/BCD using Rule2Page logic
              const abcdCandidates = dDayNumbers.filter(num => {
                let count = 0;
                if (aDayNumbers.includes(num)) count++;
                if (bDayNumbers.includes(num)) count++;
                if (cDayNumbers.includes(num)) count++;
                return count >= 2;
              });
              
              const bcdCandidates = dDayNumbers.filter(num => {
                const inB = bDayNumbers.includes(num);
                const inC = cDayNumbers.includes(num);
                const bdPairOnly = inB && !inC;
                const cdPairOnly = inC && !inB;
                return bdPairOnly || cdPairOnly;
              });
              
              const finalAbcdNumbers = abcdCandidates;
              const finalBcdNumbers = bcdCandidates.filter(num => !abcdCandidates.includes(num));
              
              console.log(`✅ [Rule1] Calculated header ABCD/BCD using Rule2Page logic (ALL topics combined):`);
              console.log(`   📊 Header ABCD: [${finalAbcdNumbers.join(', ')}]`);
              console.log(`   📊 Header BCD: [${finalBcdNumbers.join(', ')}]`);
              console.log(`   📈 Combined from ${Object.keys(excelData.data.sets || {}).length} available topics`);
              
              headerDataMap.set(triggerDate, {
                abcdNumbers: finalAbcdNumbers,
                bcdNumbers: finalBcdNumbers,
                triggerDate: triggerDate
              });
            }
          }
        } catch (error) {
          console.log(`ℹ️ [Rule1] Could not calculate header ABCD/BCD for: ${triggerDate}`, error.message);
        }
      }
      
      setAbcdBcdHeaderData(headerDataMap);
      console.log('✅ [Rule1] ABCD/BCD header data calculated using Rule2Page logic.');
      console.log(`   - Map size: ${headerDataMap.size}`);
      
      if (headerDataMap.size > 0) {
        console.log(`   - Calculated entries:`);
        Array.from(headerDataMap.entries()).forEach(([key, value]) => {
          console.log(`     * ${key}: ABCD=[${value.abcdNumbers.join(', ')}], BCD=[${value.bcdNumbers.join(', ')}]`);
        });
      }
      
    } catch (error) {
      console.error('❌ [Rule1] Error calculating ABCD/BCD header data:', error);
    }
  };

  useEffect(() => {
    if (selectedUser && Array.isArray(datesList) && datesList.length > 0) {
      console.log(`👤 [Rule-1] User data received as prop:`, selectedUserData);
      buildAllDaysData();
    } else {
      setError('Missing required user or dates data.');
      setLoading(false);
    }
  }, [selectedUser, datesList, date]);

  // Initialize available topics when data is loaded (using predefined TOPIC_ORDER like Rule2CompactPage)
  useEffect(() => {
    if (allDaysData && Object.keys(allDaysData).length > 0) {
      // Collect all unique set names from all dates that have data
      const discoveredSets = new Set();
      
      // Use actual date keys instead of ['A', 'B', 'C', 'D'] labels
      Object.keys(allDaysData).forEach(dateKey => {
        if (allDaysData[dateKey]?.success && allDaysData[dateKey].hrData) {
          Object.values(allDaysData[dateKey].hrData).forEach(hrData => {
            Object.keys(hrData.sets || {}).forEach(setName => {
              discoveredSets.add(setName);
            });
          });
        }
      });

      // Use predefined TOPIC_ORDER, filtering to only include topics that actually exist in data
      // This ensures comprehensive topic discovery like Rule2CompactPage
      const orderedTopics = TOPIC_ORDER.filter(topicName => discoveredSets.has(topicName));
      
      console.log(`📊 [Rule1Page] Topic Discovery (Rule2CompactPage Method):`, {
        allDaysDataKeys: Object.keys(allDaysData),
        discoveredSetsRaw: Array.from(discoveredSets),
        discoveredSetsCount: discoveredSets.size,
        orderedTopicsCount: orderedTopics.length,
        orderedTopics,
        missingFromOrder: Array.from(discoveredSets).filter(set => !TOPIC_ORDER.includes(set)),
        notInData: TOPIC_ORDER.filter(topic => !discoveredSets.has(topic))
      });
      
      setAvailableTopics(orderedTopics);
      
      // Initialize selected topics with all topics if none selected
      if (selectedTopics.size === 0) {
        setSelectedTopics(new Set(orderedTopics));
      }
    }
  }, [allDaysData]);

  // No longer need uniform ABCD/BCD calculation - using topic-specific analysis only

  // Calculate topic-specific ABCD/BCD analysis for color-coding matrix cells (Primary Analysis)
  useEffect(() => {
    const calculateTopicSpecificAnalysis = async () => {
      if (!selectedUser || !availableDates || !allDaysData) {
        console.log('🎯 [Rule1] Not calculating topic-specific ABCD/BCD - missing data');
        return;
      }

      try {
        console.log(`🎯 [Rule1] Comprehensive topic-specific ABCD/BCD analysis for all dates ≥ 5th`);
        
        // Sort dates in ascending order (oldest to newest)
        const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
        
        // Initialize comprehensive data structure
        const comprehensiveData = {};
        
        // Function to extract numbers from a specific date and set
        const extractFromDateAndSet = async (targetDate, setName) => {
          try {
            const excelData = await dataService.getExcelData(selectedUser, targetDate);
            const hourData = await dataService.getHourEntry(selectedUser, targetDate);
            
            if (!excelData || !hourData) return [];
            
            const sets = excelData.data.sets || {};
            const setData = sets[setName];
            if (!setData) return [];
            
            // Use first available HR for planet selection (like Rule2CompactPage)
            const planetSelections = hourData.planetSelections || {};
            const firstHR = Object.keys(planetSelections).sort((a, b) => parseInt(a) - parseInt(b))[0];
            const selectedPlanet = planetSelections[firstHR];
            
            if (!selectedPlanet) return [];
            
            const allNumbers = new Set();
            Object.entries(setData).forEach(([elementName, planetData]) => {
              const rawString = planetData[selectedPlanet];
              if (rawString) {
                const elementNumber = extractElementNumber(rawString);
                if (elementNumber !== null) {
                  allNumbers.add(elementNumber);
                }
              }
            });
            
            return Array.from(allNumbers).sort((a, b) => a - b);
          } catch (error) {
            return [];
          }
        };

        // Collect all available sets from all dates using same discovery method
        const discoveredSets = new Set();
        Object.keys(allDaysData).forEach(dateKey => {
          if (allDaysData[dateKey]?.success && allDaysData[dateKey].hrData) {
            Object.values(allDaysData[dateKey].hrData).forEach(hrData => {
              if (hrData.sets) {
                Object.keys(hrData.sets).forEach(setName => {
                  discoveredSets.add(setName);
                });
              }
            });
          }
        });
        
        // Use predefined TOPIC_ORDER to ensure comprehensive analysis
        const orderedTopics = TOPIC_ORDER.filter(topicName => discoveredSets.has(topicName));
        
        console.log(`📊 [Rule1] ABCD/BCD Analysis - Processing ${orderedTopics.length} topics for ${sortedDates.length - 4} dates...`);
        
        // Process all dates from 5th onward
        for (let i = 4; i < sortedDates.length; i++) {
          const currentDate = sortedDates[i];
          
          // Get ABCD sequence (4 dates before current date)
          const aDay = sortedDates[i - 4];
          const bDay = sortedDates[i - 3];
          const cDay = sortedDates[i - 2];
          const dDay = sortedDates[i - 1];
          console.log(`🎯 [Rule1] Processing ${currentDate}: A=${aDay}, B=${bDay}, C=${cDay}, D=${dDay}`);
          
          // Initialize date entry
          comprehensiveData[currentDate] = {};
          
          // Process each topic for this date
          for (const setName of orderedTopics) {
            try {
              // Extract numbers from each day for this specific set
              const [dDayNumbers, aDayNumbers, bDayNumbers, cDayNumbers] = await Promise.all([
                extractFromDateAndSet(dDay, setName),
                extractFromDateAndSet(aDay, setName),
                extractFromDateAndSet(bDay, setName),
                extractFromDateAndSet(cDay, setName)
              ]);
              
              if (dDayNumbers.length > 0) {
                // Calculate ABCD/BCD using Rule2Page logic
                const abcdCandidates = dDayNumbers.filter(num => {
                  let count = 0;
                  if (aDayNumbers.includes(num)) count++;
                  if (bDayNumbers.includes(num)) count++;
                  if (cDayNumbers.includes(num)) count++;
                  return count >= 2;
                });
                
                const bcdCandidates = dDayNumbers.filter(num => {
                  const inB = bDayNumbers.includes(num);
                  const inC = cDayNumbers.includes(num);
                  const bdPairOnly = inB && !inC;
                  const cdPairOnly = inC && !inB;
                  return bdPairOnly || cdPairOnly;
                });
                
                const finalAbcdNumbers = abcdCandidates;
                const finalBcdNumbers = bcdCandidates.filter(num => !abcdCandidates.includes(num));
                
                // Save result into comprehensiveData[date][topic]
                comprehensiveData[currentDate][setName] = {
                  abcdNumbers: finalAbcdNumbers,
                  bcdNumbers: finalBcdNumbers
                };
                
                if (finalAbcdNumbers.length > 0 || finalBcdNumbers.length > 0) {
                  console.log(`✅ [Rule1] ${currentDate} > ${setName}: ABCD[${finalAbcdNumbers.join(',')}] BCD[${finalBcdNumbers.join(',')}]`);
                }
              } else {
                comprehensiveData[currentDate][setName] = { abcdNumbers: [], bcdNumbers: [] };
              }
            } catch (error) {
              console.error(`❌ [Rule1] Error analyzing ${setName} for ${currentDate}:`, error);
              comprehensiveData[currentDate][setName] = { abcdNumbers: [], bcdNumbers: [] };
            }
          }
        }
        
        // Set comprehensive data for all dates
        setTopicAbcdBcdPerDate(comprehensiveData);
        
        // Set analysis for the current clicked date
        const currentDateAnalysis = comprehensiveData[date] || {};
        setAbcdBcdAnalysis(currentDateAnalysis);
        
        console.log(`🎉 [Rule1] Comprehensive topic-specific ABCD/BCD analysis complete for ${Object.keys(comprehensiveData).length} dates`);
        console.log(`📊 [Rule1] Comprehensive Data:`, comprehensiveData);
        console.log(`📊 [Rule1] Current Date Analysis (${date}):`, currentDateAnalysis);
        
        // Detailed logging for D-1 Set-1 Matrix specifically
        if (currentDateAnalysis['D-1 Set-1 Matrix']) {
          console.log(`🎯 [Rule1] D-1 Set-1 Matrix Analysis for ${date}:`, {
            abcdNumbers: currentDateAnalysis['D-1 Set-1 Matrix'].abcdNumbers,
            bcdNumbers: currentDateAnalysis['D-1 Set-1 Matrix'].bcdNumbers,
            date: date
          });
        }
        
      } catch (error) {
        console.error(`❌ [Rule1] Error calculating comprehensive ABCD/BCD analysis:`, error);
        setAbcdBcdAnalysis({});
        setTopicAbcdBcdPerDate({});
      }
    };

    calculateTopicSpecificAnalysis();
  }, [selectedUser, allDaysData]);

  // Get all available dates (chronologically sorted)
  const availableDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));

  // Generate enhanced column header for each date with topic-specific ABCD/BCD numbers
  const generateColumnHeader = (dateKey, currentTopic = null) => {
    const dayObj = allDaysData[dateKey];
    if (!dayObj) {
      return '(Missing)';
    }
    
    // Check if this date has topic-specific ABCD/BCD data for the current topic
    const topicMap = topicAbcdBcdPerDate[dateKey] || {};
    const topicData = currentTopic ? topicMap[currentTopic] : null;
    
    console.log(`🔍 [Rule1] generateColumnHeader for ${dateKey} + ${currentTopic} - Has topic data: ${!!topicData}`);
    if (topicData) {
      console.log(`   📊 Topic data:`, topicData);
    }
    
    if (!dayObj.success || dayObj.isEmpty || !activeHR || !dayObj.hrData[activeHR]) {
      // Show topic data even when no Excel data for the main matrix
      if (topicData && (topicData.abcdNumbers?.length > 0 || topicData.bcdNumbers?.length > 0)) {
        return (
          <div className="text-center max-w-xs">
            <div className="text-xs text-gray-600 font-semibold mb-2">{dayObj.date} [No Data]</div>
            <div className="text-xs">
              <div className="mb-1 p-1 bg-gray-100 rounded">
                <div className="font-semibold text-xs truncate" title={currentTopic}>
                  {currentTopic?.replace(' Matrix', '')}
                </div>
                {topicData.abcdNumbers?.length > 0 && (
                  <div className="text-green-700">
                    A: [{topicData.abcdNumbers.join(',')}]
                  </div>
                )}
                {topicData.bcdNumbers?.length > 0 && (
                  <div className="text-blue-700">
                    B: [{topicData.bcdNumbers.join(',')}]
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
      return `${dayObj.date} [No Data]`;
    }
    
    const planet = dayObj.hrData[activeHR].selectedPlanet;
    
    // Show enhanced header with current topic's specific data
    if (topicData && (topicData.abcdNumbers?.length > 0 || topicData.bcdNumbers?.length > 0)) {
      return (
        <div className="text-center max-w-xs">
          <div className="text-xs font-semibold mb-2">{dayObj.date}-{planet}</div>
          <div className="text-xs">
            <div className="mb-1 p-1 bg-blue-50 rounded">
              <div className="font-semibold text-xs truncate" title={currentTopic}>
                {currentTopic?.replace(' Matrix', '')}
              </div>
              {topicData.abcdNumbers?.length > 0 && (
                <div className="text-green-700">
                  A: [{topicData.abcdNumbers.join(',')}]
                </div>
              )}
              {topicData.bcdNumbers?.length > 0 && (
                <div className="text-blue-700">
                  B: [{topicData.bcdNumbers.join(',')}]
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return `${dayObj.date}-${planet}`;
  };

  // Helper functions for column styling (updated for larger headers)
  const headerCellClass = (dateKey) => {
    const dayObj = allDaysData[dateKey];
    const topicMap = topicAbcdBcdPerDate[dateKey] || {};
    const hasTopicData = Object.keys(topicMap).length > 0;
    
    let base = 'border border-gray-300 px-2 py-2 font-semibold text-center text-xs';
    
    if (!dayObj || dayObj.isEmpty || !dayObj.success) {
      base += ' bg-gray-200 text-gray-500';
    } else {
      base += ' bg-gray-50 text-gray-700';
    }
    
    // Add min-width and max-width for topic data columns
    if (hasTopicData) {
      base += ' min-w-48 max-w-64';
    } else {
      base += ' min-w-32';
    }
    
    return base;
  };

  // Get ALL window dates including those without data (for proper display)
  const allWindowDates = availableDates; // Show all dates loaded into allDaysData
  
  // Get HR choices from ANY available date that has data
  const hrChoices = (() => {
    const allHRs = new Set();
    availableDates.forEach(dateKey => {
      if (allDaysData[dateKey]?.hrData && allDaysData[dateKey].success) {
        Object.keys(allDaysData[dateKey].hrData).forEach(hr => allHRs.add(hr));
      }
    });
    const hrArray = Array.from(allHRs).sort((a, b) => parseInt(a) - parseInt(b));
    console.log(`🔍 [Rule-1] Available HR choices:`, hrArray, 'from successful dates:', availableDates.filter(dateKey => allDaysData[dateKey]?.success));
    return hrArray;
  })();

  // Get available sets only from dates that have data (with topic filtering)
  const getAvailableSetsForDisplay = () => {
    if (!activeHR) {
      console.log(`🚫 [Rule-1] getAvailableSetsForDisplay: No activeHR selected`);
      return [];
    }
    
    const allSets = new Set();
    availableDates.forEach(dateKey => {
      if (allDaysData[dateKey]?.success && allDaysData[dateKey].hrData[activeHR]) {
        Object.keys(allDaysData[dateKey].hrData[activeHR].sets).forEach(setName => {
          allSets.add(setName);
        });
      }
    });
    
    // Apply topic filtering - only show selected topics
    const topicsToDisplay = getTopicsForDisplay();
    const filteredSets = Array.from(allSets).filter(setName => topicsToDisplay.includes(setName));
    
    console.log(`📊 [Rule-1] getAvailableSetsForDisplay for HR ${activeHR}:`, {
      allSets: Array.from(allSets),
      topicsToDisplay: topicsToDisplay.length,
      selectedTopics: selectedTopics.size,
      filteredSets: filteredSets.length
    });
    
    return filteredSets;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">🏠 Loading Rule-1 Matrix Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">Processing historical data...</p>
          </div>
          
          <ProgressBar 
            progress={loadingProgress}
            message={loadingMessage}
            color="green"
            className="mb-4"
          />
          
          {/* 🆕 Loading Stages Indicator */}
          <div className="space-y-2 mb-4">
            <div className={`flex items-center text-xs ${loadingStages.dataValidation ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-2">{loadingStages.dataValidation ? '✅' : '⏳'}</span>
              Data Validation & Date Sorting
            </div>
            <div className={`flex items-center text-xs ${loadingStages.dateProcessing ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-2">{loadingStages.dateProcessing ? '✅' : '⏳'}</span>
              Loading Excel & Hour Data
            </div>
            <div className={`flex items-center text-xs ${loadingProgress >= 80 ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-2">{loadingProgress >= 80 ? '✅' : '⏳'}</span>
              Loading ABCD/BCD for Headers
            </div>
            <div className={`flex items-center text-xs ${loadingStages.uiRendering ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-2">{loadingStages.uiRendering ? '✅' : '⏳'}</span>
              Matrix Rendering & UI Setup
            </div>
          </div>
          
          {/* 🆕 Current Window Info */}
          {windowType && (
            <div className="text-center mb-4">
              <p className="text-xs text-gray-600">
                <strong>Window:</strong> {windowType}
              </p>
            </div>
          )}
          
          {/* 🆕 Performance & Data Source Info */}
          {loadingProgress > 85 && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                🚀 Optimized data loading
              </p>
              <p className="text-xs text-green-600 mt-1">
                Ready to display matrix!
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
        <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md">
          <div className="text-red-600 text-xl mb-2">⚠️ Rule-1 Error</div>
          <p className="mb-4 text-gray-700">{error}</p>
          <button onClick={onBack} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🆕 Success Notification Banner */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <span className="text-4xl">🎉</span>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-green-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Rule-1 Matrix View</h1>
              <div className="mt-2 text-sm text-green-800">
                <p>👤 User: {selectedUserData?.username || selectedUser}</p>
                <p>📅 Clicked Date: {new Date(date).toLocaleDateString()}</p>
                <p>🗓️ Historical Matrix: {availableDates.length} dates</p>
                <p>⚙️ Type: {windowType}</p>
                <p>🔍 Matrix Display Only</p>
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

        {/* Topic-Specific ABCD/BCD Numbers Display (like Rule2Page) */}
        <div className="bg-white rounded-lg shadow-md mb-6 border-l-4 border-purple-600">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="text-purple-600 mr-2">🎯</span>
              Topic-Specific ABCD/BCD Analysis for {new Date(date).toLocaleDateString()}
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Using Rule2Page Logic
              </span>
            </h2>
            
            {Object.keys(abcdBcdAnalysis).length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-4">
                  📊 <strong>{Object.keys(abcdBcdAnalysis).length} Topics Analyzed</strong> - Each topic shows its own ABCD/BCD numbers
                </div>
                
                {/* Topic Results Display */}
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(abcdBcdAnalysis)
                    .sort(([a], [b]) => {
                      // Sort topics like Rule2Page: D-1, D-3, D-4, etc.
                      const aMatch = a.match(/^D-(\d+)\s+Set-(\d+)/);
                      const bMatch = b.match(/^D-(\d+)\s+Set-(\d+)/);
                      if (aMatch && bMatch) {
                        const aDNum = parseInt(aMatch[1]);
                        const bDNum = parseInt(bMatch[1]);
                        const aSetNum = parseInt(aMatch[2]);
                        const bSetNum = parseInt(bMatch[2]);
                        if (aDNum !== bDNum) return aDNum - bDNum;
                        return aSetNum - bSetNum;
                      }
                      return a.localeCompare(b);
                    })
                    .map(([setName, analysis], index) => {
                      const { abcdNumbers: topicAbcd = [], bcdNumbers: topicBcd = [] } = analysis;
                      const abcdDisplay = topicAbcd.length > 0 ? topicAbcd.join(',') : 'None';
                      const bcdDisplay = topicBcd.length > 0 ? topicBcd.join(',') : 'None';
                      
                      return (
                        <div
                          key={setName}
                          className={`p-3 rounded border-l-4 ${
                            topicAbcd.length > 0 || topicBcd.length > 0
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 bg-gray-50'
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-blue-700">
                              {String(index + 1).padStart(2, '0')}.
                            </span>
                            <span className="font-bold text-gray-800">
                              {setName}
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
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {/* Summary Stats */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">📊 Summary Statistics</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Topics with ABCD numbers: <strong>{Object.values(abcdBcdAnalysis).filter(a => a.abcdNumbers?.length > 0).length}</strong></p>
                    <p>• Topics with BCD numbers: <strong>{Object.values(abcdBcdAnalysis).filter(a => a.bcdNumbers?.length > 0).length}</strong></p>
                    <p>• Total ABCD numbers found: <strong>{Object.values(abcdBcdAnalysis).reduce((sum, a) => sum + (a.abcdNumbers?.length || 0), 0)}</strong></p>
                    <p>• Total BCD numbers found: <strong>{Object.values(abcdBcdAnalysis).reduce((sum, a) => sum + (a.bcdNumbers?.length || 0), 0)}</strong></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No topic-specific analysis data found for this date</p>
                <p className="text-sm mt-1">Date must be 5th or later to show ABCD/BCD analysis</p>
              </div>
            )}

            {/* Source Info */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>Data Source:</strong> Live topic-specific calculation using Rule2Page logic - each topic analyzed independently
                {Object.keys(abcdBcdAnalysis).length > 0 && (
                  <span className="ml-2 text-green-600">
                    ✅ Each topic uses its own Set data for ABCD/BCD calculation (no uniform calculation)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Legend Section (matching Rule2Page) */}
        {Object.keys(abcdBcdAnalysis).length > 0 && (
          <div className="bg-white rounded-lg shadow-md mb-6">
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
          </div>
        )}

        {/* Compact Topic Selector */}
        {showTopicSelector && availableTopics.length > 0 && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">🎯 Filter Topics</h3>
              <button
                onClick={() => setShowTopicSelector(false)}
                className="text-gray-500 hover:text-gray-700"
                title="Hide topic selector"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Clear All
                </button>
                <div className="text-sm text-gray-600 py-1">
                  Selected: {selectedTopics.size} / {availableTopics.length}
                </div>
              </div>

              {/* Compact Single Row Topic Display */}
              <div className="flex flex-wrap gap-2 items-center">
                {availableTopics.map(topic => {
                  const isSelected = selectedTopics.has(topic);
                  const handleTopicClick = () => {
                    // Multi-select: toggle the topic on/off
                    const newSelected = new Set(selectedTopics);
                    if (isSelected) {
                      // If already selected, deselect it
                      newSelected.delete(topic);
                    } else {
                      // If not selected, add it to selection
                      newSelected.add(topic);
                    }
                    setSelectedTopics(newSelected);
                  };

                  return (
                    <button
                      key={topic}
                      onClick={handleTopicClick}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={`Click to ${isSelected ? 'deselect' : 'select'} ${formatSetName(topic)}`}
                    >
                      {formatSetName(topic)}
                    </button>
                  );
                })}
              </div>
              
              {selectedTopics.size > 0 && selectedTopics.size < availableTopics.length && (
                <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  📍 Showing {selectedTopics.size} selected topic{selectedTopics.size > 1 ? 's' : ''}: 
                  <strong className="ml-1">
                    {Array.from(selectedTopics).map(formatSetName).join(', ')}
                  </strong>
                  <button
                    onClick={() => setSelectedTopics(new Set(availableTopics))}
                    className="ml-2 text-blue-700 underline hover:text-blue-800"
                  >
                    Show All
                  </button>
                </div>
              )}
              
              {selectedTopics.size === 0 && (
                <div className="mt-3 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  ⚠️ No topics selected - no matrices will be displayed
                  <button
                    onClick={() => setSelectedTopics(new Set(availableTopics))}
                    className="ml-2 text-orange-700 underline hover:text-orange-800"
                  >
                    Select All
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Show Topic Selector Toggle (when hidden) */}
        {!showTopicSelector && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-4 text-center">
              <button
                onClick={() => setShowTopicSelector(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                🎯 Show Topic Filter ({selectedTopics.size} / {availableTopics.length} selected) - Multi-select enabled
              </button>
            </div>
          </div>
        )}

        {/* HR Selection & Matrix */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200 p-4">
            <span className="text-sm font-medium text-gray-600 mr-4">Select HR:</span>
            {hrChoices.length > 0 ? (
              hrChoices.map(hr => (
                <button
                  key={hr}
                  onClick={() => setActiveHR(hr)}
                  className={`mx-1 px-3 py-1 rounded-lg text-sm font-medium ${
                    activeHR === hr
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  HR {hr}
                </button>
              ))
            ) : (
              <span className="text-red-600 text-sm">
                No HR data available for any of the days in this window
              </span>
            )}
          </div>
          
          <div className="p-6">
            {activeHR ? (
              (() => {
                const availableSets = getAvailableSetsForDisplay();
                
                if (availableSets.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">⚠️</div>
                      <p className="text-lg font-semibold mb-4 text-red-600">No Sets Found for HR{activeHR}</p>
                      <div className="bg-gray-100 p-4 rounded-lg text-left max-w-2xl mx-auto">
                        <h4 className="font-semibold mb-2">Debug Information:</h4>
                        <div className="text-sm space-y-1">
                          <div><strong>Available Dates:</strong> {availableDates.join(', ')}</div>
                          <div><strong>Selected Topics:</strong> {selectedTopics.size} / {availableTopics.length}</div>
                          <div><strong>Active HR:</strong> {activeHR}</div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return availableSets.map(setName => (
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
                            {availableDates.map(dateKey => {
                              const dayObj = allDaysData[dateKey];
                              return (
                                <th key={dateKey} className={headerCellClass(dateKey)}>
                                  {generateColumnHeader(dateKey, setName)}
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
                            availableDates.forEach(dateKey => {
                              const dayObj = allDaysData[dateKey];
                              if (dayObj?.success && dayObj.hrData?.[activeHR]?.sets?.[setName]) {
                                Object.keys(dayObj.hrData[activeHR].sets[setName]).forEach(el => availableElements.add(el));
                              }
                            });
                            
                            // Ensure we show all standard elements even if they have no data
                            orderedElementNames.forEach(standardElement => {
                              availableElements.add(standardElement);
                            });
                            
                            // Filter ordered elements to only include those that should be displayed
                            const elementsToDisplay = orderedElementNames.filter(elName => 
                              availableElements.has(elName)
                            );
                            
                            console.log(`🎭 [Rule1] Rendering elements for ${setName} in specified order:`, elementsToDisplay);
                            
                            return elementsToDisplay.map(elName => (
                              <tr key={elName} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2 font-medium bg-blue-200">
                                  {elName}
                                </td>
                                {availableDates.map(dateKey => {
                                  const dayObj = allDaysData[dateKey];
                                  let cellValue = '—';
                                  let hasData = false;
                                  
                                  // Safely extract cell value with multiple fallback checks
                                  if (dayObj?.success && dayObj.hrData?.[activeHR]?.sets?.[setName]?.[elName]) {
                                    const rawData = dayObj.hrData[activeHR].sets[setName][elName];
                                    hasData = true;
                                    cellValue = rawData || '—';
                                  }
                                  
                                  console.log(`📊 [Rule1] Cell value for ${dateKey}-${elName}:`, {
                                    hasSuccess: dayObj?.success,
                                    hasHrData: !!dayObj?.hrData?.[activeHR],
                                    hasSet: !!dayObj?.hrData?.[activeHR]?.sets?.[setName],
                                    hasElement: !!dayObj?.hrData?.[activeHR]?.sets?.[setName]?.[elName],
                                    hasData,
                                    cellValue
                                  });
                                  
                                  const baseClass = 'border border-gray-300 px-4 py-2 text-center font-mono text-sm';
                                  const isCurrentDate = dateKey === date; // Check if this is the current clicked date
                                  
                                  return (
                                    <td
                                      key={dateKey}
                                      className={`${baseClass} ${
                                        isCurrentDate
                                          ? 'ring-2 ring-blue-400 bg-blue-50'
                                          : hasData 
                                            ? 'bg-white text-gray-800' 
                                            : 'bg-red-50 text-gray-400'
                                      }`}
                                    >
                                      {renderColorCodedDayNumber(cellValue, setName, isCurrentDate, dateKey)}
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
                <p>Click an HR tab to view the matrix data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rule1Page;
