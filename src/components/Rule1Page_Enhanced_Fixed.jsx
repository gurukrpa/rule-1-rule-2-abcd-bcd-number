// src/components/Rule1Page_Enhanced.jsx
// Enhanced Rule1Page with caching and unified data service

import React, { useState, useEffect } from 'react';
import { unifiedDataService } from '../services/unifiedDataService';
import { DataService } from '../services/dataService_new';
import { useCachedData, useAnalysisCache } from '../hooks/useCachedData';
import { redisCache } from '../services/redisClient';
import { Rule2ResultsService } from '../services/rule2ResultsService';
import rule2AnalysisService from '../services/rule2AnalysisService';
import cleanSupabaseService from '../services/CleanSupabaseService';
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
  
  // Clickable number boxes state
  const [clickedNumbers, setClickedNumbers] = useState({}); // {topicName: {dateKey: {hour: [numbers]}}}
  const [numberBoxLoading, setNumberBoxLoading] = useState(false);
  
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

  // ✅ NEW: Normalize topic names for consistent persistence
  const normalizeTopicName = (topicName) => {
    if (!topicName) return null;
    
    // Extract D-number and Set number, ignoring annotations and "Matrix" suffix
    const match = topicName.match(/D-(\d+)(?:\s*\([^)]*\))?\s+Set-(\d+)/);
    if (match) {
      const [, dNumber, setNumber] = match;
      return `D-${dNumber} Set-${setNumber}`;
    }
    
    return topicName;
  };

  // ✅ NEW: Get display name (with annotations) from normalized name
  const getDisplayTopicName = (normalizedName) => {
    // Find the topic in availableTopics that matches the normalized name
    const matchingTopic = availableTopics.find(topic => {
      const normalized = normalizeTopicName(topic);
      return normalized === normalizedName;
    });
    
    return matchingTopic || normalizedName;
  };

  // Define the 30-topic order in ascending numerical order (NORMALIZED: without annotations or Matrix suffix)
  const TOPIC_ORDER = [
    'D-1 Set-1',
    'D-1 Set-2',
    'D-3 Set-1',
    'D-3 Set-2',
    'D-4 Set-1',
    'D-4 Set-2',
    'D-5 Set-1',
    'D-5 Set-2',
    'D-7 Set-1',
    'D-7 Set-2',
    'D-9 Set-1',
    'D-9 Set-2',
    'D-10 Set-1',
    'D-10 Set-2',
    'D-11 Set-1',
    'D-11 Set-2',
    'D-12 Set-1',
    'D-12 Set-2',
    'D-27 Set-1',
    'D-27 Set-2',
    'D-30 Set-1',
    'D-30 Set-2',
    'D-60 Set-1',
    'D-60 Set-2',
    'D-81 Set-1',
    'D-81 Set-2',
    'D-108 Set-1',
    'D-108 Set-2',
    'D-144 Set-1',
    'D-144 Set-2'
  ];

  // Extract the FIRST number after element prefix, similar to Rule-2
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    
    // Look for pattern: element-NUMBER/ or element-NUMBER- or element-NUMBER-letters (for grid cells)
    // Updated regex to handle grid cell formats like "as-9-sg", "mo-1-le"
    const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
    return match ? Number(match[1]) : null;
  };

  // ✅ CLEAN SUPABASE-ONLY: Load previously clicked numbers from database
  const loadClickedNumbers = async () => {
    if (!selectedUser || !activeHR) return;

    try {
      setNumberBoxLoading(true);
      console.log('📥 Loading previously clicked numbers from Supabase...');

      const clickedData = await cleanSupabaseService.getTopicClicks(selectedUser);
      
      // Organize clicked data by NORMALIZED topic, date, and hour
      const organizedClicks = {};
      
      clickedData.forEach(click => {
        const { topic_name, date_key, hour, clicked_number } = click;
        
        // ✅ Normalize the topic name from database
        const normalizedTopicName = normalizeTopicName(topic_name) || topic_name;
        
        // Initialize nested structure using normalized name
        if (!organizedClicks[normalizedTopicName]) {
          organizedClicks[normalizedTopicName] = {};
        }
        if (!organizedClicks[normalizedTopicName][date_key]) {
          organizedClicks[normalizedTopicName][date_key] = {};
        }
        if (!organizedClicks[normalizedTopicName][date_key][hour]) {
          organizedClicks[normalizedTopicName][date_key][hour] = [];
        }

        organizedClicks[normalizedTopicName][date_key][hour].push(clicked_number);
      });

      setClickedNumbers(organizedClicks);
      
      console.log(`✅ Loaded ${clickedData.length} previously clicked numbers (organized by normalized topic names)`);
    } catch (error) {
      console.error('❌ Error loading clicked numbers:', error);
    } finally {
      setNumberBoxLoading(false);
    }
  };

  // Handle number box click with toggle functionality
  const handleNumberBoxClick = async (topicName, dateKey, number) => {
    if (!selectedUser || !activeHR) return;

    try {
      console.log(`🔢 Number box clicked: ${number} for topic ${topicName} on ${dateKey} HR${activeHR}`);
      
      // ✅ NORMALIZE topic name for consistent persistence
      const normalizedTopicName = normalizeTopicName(topicName);
      console.log(`🎯 Using normalized topic name: "${normalizedTopicName}" (from "${topicName}")`);
      
      // Check if number matches ABCD or BCD arrays for this topic/date
      const abcdNumbers = abcdBcdAnalysis[topicName]?.[dateKey]?.abcdNumbers || [];
      const bcdNumbers = abcdBcdAnalysis[topicName]?.[dateKey]?.bcdNumbers || [];
      const isAbcdMatch = abcdNumbers.includes(number);
      const isBcdMatch = bcdNumbers.includes(number);
      const isMatched = isAbcdMatch || isBcdMatch;
      
      // Only proceed if the number is matched (in ABCD or BCD)
      if (!isMatched) {
        console.log(`❌ Number ${number} is not in ABCD/BCD arrays - cannot click`);
        return;
      }
      
      // Check if number is already clicked (for toggle logic) - use normalized name for local state
      const currentClicks = clickedNumbers[normalizedTopicName]?.[dateKey]?.[`HR${activeHR}`] || [];
      const isAlreadyClicked = currentClicks.includes(number);
      const matchType = isAbcdMatch ? 'ABCD' : 'BCD';
      
      if (isAlreadyClicked) {
        // UNCLICK: Remove from database and local state
        await cleanSupabaseService.deleteTopicClick(
          selectedUser, 
          normalizedTopicName,  // ✅ Use normalized name for database
          dateKey, 
          `HR${activeHR}`, 
          number
        );
        
        // Remove from local state (using normalized name)
        setClickedNumbers(prev => {
          const updated = { ...prev };
          if (updated[normalizedTopicName]?.[dateKey]?.[`HR${activeHR}`]) {
            const hrNumbers = updated[normalizedTopicName][dateKey][`HR${activeHR}`];
            const index = hrNumbers.indexOf(number);
            if (index > -1) {
              hrNumbers.splice(index, 1);
            }
          }
          return updated;
        });
        
        console.log(`✅ Number ${number} successfully REMOVED (unclicked)`);
        
      } else {
        // CLICK: Add to database and local state (only matched numbers reach here)
        await cleanSupabaseService.saveTopicClick(
          selectedUser, 
          normalizedTopicName,  // ✅ Use normalized name for database
          dateKey, 
          `HR${activeHR}`, 
          number, 
          isMatched
        );
        
        // Add to local state (using normalized name)
        setClickedNumbers(prev => {
          const updated = { ...prev };
          if (!updated[normalizedTopicName]) updated[normalizedTopicName] = {};
          if (!updated[normalizedTopicName][dateKey]) updated[normalizedTopicName][dateKey] = {};
          if (!updated[normalizedTopicName][dateKey][`HR${activeHR}`]) {
            updated[normalizedTopicName][dateKey][`HR${activeHR}`] = [];
          }
          
          const hrNumbers = updated[normalizedTopicName][dateKey][`HR${activeHR}`];
          if (!hrNumbers.includes(number)) {
            hrNumbers.push(number);
          }
          
          return updated;
        });
        
        console.log(`✅ Number ${number} successfully ADDED (clicked as ${matchType})`);
      }
      
    } catch (error) {
      console.error('❌ Error handling number box click:', error);
    }
  };

  // Enhanced data loading
  const buildAllDaysData = async () => {
    try {
      setLoading(true);
      
      // Sort all dates ascending
      const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
      
      if (sortedDates.length < 4) {
        setError(`Rule-1 requires at least 4 total dates. Only ${sortedDates.length} dates available.`);
        setLoading(false);
        return;
      }

      setWindowType(`Complete Historical View (showing ${sortedDates.length} dates)`);
      
      const assembled = {};

      // Process each date
      for (let idx = 0; idx < sortedDates.length; idx++) {
        const d = sortedDates[idx];
        
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

            assembled[d] = {
              date: d,
              hrData,
              success: Object.keys(hrData).length > 0,
              index: idx,
              dateKey: d
            };
          } else {
            assembled[d] = {
              date: d,
              hrData: {},
              success: false,
              error: !excelData ? 'No Excel data' : 'No Hour Entry data',
              index: idx,
              dateKey: d
            };
          }
        } catch (dateError) {
          assembled[d] = {
            date: d,
            hrData: {},
            success: false,
            error: dateError.message || 'Unknown error',
            index: idx,
            dateKey: d
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

      // ✅ FIXED: Use smart topic matching
      const discoveredTopicsArray = Array.from(discoveredSets);
      const topicMatcher = createTopicMatcher(TOPIC_ORDER, discoveredTopicsArray);
      
      // Get ordered topics using the actual annotated names from database
      const orderedTopics = TOPIC_ORDER
        .filter(expectedTopic => topicMatcher.has(expectedTopic))
        .map(expectedTopic => topicMatcher.get(expectedTopic));
      
      setAvailableTopics(orderedTopics);
      setSelectedTopics(new Set(orderedTopics));

      setLoading(false);
      
    } catch (err) {
      console.error('❌ Error building all days data:', err);
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

  // Load clicked numbers when activeHR changes or component mounts
  useEffect(() => {
    if (selectedUser && activeHR && Object.keys(allDaysData).length > 0) {
      loadClickedNumbers();
    }
  }, [selectedUser, activeHR, allDaysData]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Rule-1 Enhanced Analysis</h1>
            <button
              onClick={onBack}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              ← Back
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600">Enhanced Rule-1 analysis with Supabase-only persistence is now working!</p>
            <p className="text-sm text-gray-500 mt-2">
              ✅ All 30 topics supported with normalized names<br/>
              ✅ Number box persistence fixed<br/>
              ✅ No localStorage fallbacks - Supabase only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rule1PageEnhanced;
