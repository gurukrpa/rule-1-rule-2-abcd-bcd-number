// src/components/Rule1Page_Optimized.jsx
// Performance-optimized Rule1Page with lazy loading, memoization, and chunked data processing

import React, { useState, useEffect, useCallback, useMemo, memo, Suspense, lazy } from 'react';
import { unifiedDataService } from '../services/unifiedDataService';
import { useCachedData, useAnalysisCache } from '../hooks/useCachedData';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useWebWorker } from '../hooks/useWebWorker';
import rule2AnalysisService from '../services/rule2AnalysisService';
import cleanSupabaseService from '../services/CleanSupabaseService';

// Lazy load heavy components
const ProgressBar = lazy(() => import('./ProgressBar'));
const NumberBoxGrid = lazy(() => import('./NumberBoxGrid'));
const TopicSelector = lazy(() => import('./TopicSelector'));

// Memoized constants to prevent recreations
const TOPIC_ORDER = [
  'D-1 Set-1 Matrix', 'D-1 Set-2 Matrix', 'D-2 Set-1 Matrix', 'D-2 Set-2 Matrix',
  'D-3 Set-1 Matrix', 'D-3 Set-2 Matrix', 'D-4 Set-1 Matrix', 'D-4 Set-2 Matrix',
  'D-5 Set-1 Matrix', 'D-5 Set-2 Matrix', 'D-6 Set-1 Matrix', 'D-6 Set-2 Matrix',
  'D-7 Set-1 Matrix', 'D-7 Set-2 Matrix', 'D-9 Set-1 Matrix', 'D-9 Set-2 Matrix',
  'D-10 Set-1 Matrix', 'D-10 Set-2 Matrix', 'D-11 Set-1 Matrix', 'D-11 Set-2 Matrix',
  'D-12 Set-1 Matrix', 'D-12 Set-2 Matrix', 'D-27 Set-1 Matrix', 'D-27 Set-2 Matrix',
  'D-30 Set-1 Matrix', 'D-30 Set-2 Matrix', 'D-60 Set-1 Matrix', 'D-60 Set-2 Matrix',
  'D-81 Set-1 Matrix', 'D-81 Set-2 Matrix', 'D-108 Set-1 Matrix', 'D-108 Set-2 Matrix',
  'D-144 Set-1 Matrix', 'D-144 Set-2 Matrix'
];

// Utility function for creating topic matcher (memoized)
const createTopicMatcher = useMemo(() => (expectedTopics, discoveredTopics) => {
  const matcher = new Map();
  expectedTopics.forEach(expected => {
    const found = discoveredTopics.find(discovered => 
      discovered.toLowerCase().includes(expected.toLowerCase().replace(' matrix', ''))
    );
    if (found) matcher.set(expected, found);
  });
  return matcher;
}, []);

// Performance-optimized component with chunked processing
const Rule1PageOptimized = memo(({ date, analysisDate, selectedUser, datesList, onBack, users }) => {
  // Performance monitoring
  const { metrics, markRenderStart, markRenderEnd, logMetrics, isOptimized } = usePerformanceMonitor('Rule1PageOptimized');
  
  // Web Worker for heavy calculations
  const { calculateABCDBCD, processBulkData, isSupported: isWorkerSupported } = useWebWorker();

  // Mark render start
  markRenderStart();

  // Optimized state structure
  const [state, setState] = useState({
    loading: true,
    error: '',
    activeHR: null,
    windowType: '',
    selectedTopics: new Set(),
    availableTopics: [],
    showTopicSelector: true,
    numberBoxLoading: false,
    processingChunk: 0,
    totalChunks: 0
  });

  // Separate heavy data state to prevent unnecessary re-renders
  const [heavyData, setHeavyData] = useState({
    allDaysData: {},
    abcdBcdAnalysis: {},
    clickedNumbers: {},
    highlightedTopicCountPerDate: {}
  });

  // Redis caching hooks
  const { getExcelData, getHourEntry, cacheAnalysis, getCachedAnalysis } = useCachedData(selectedUser);
  const { cachedResult, cacheHit, checkCache } = useAnalysisCache(selectedUser, 'rule1');

  // Memoized date calculations
  const dateCalculations = useMemo(() => {
    if (!datesList?.length) return { sortedDates: [], targetIdx: -1, windowDates: [] };
    
    const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
    const targetAnalysisDate = analysisDate || date;
    const targetIdx = sortedDates.indexOf(targetAnalysisDate);
    const windowDates = sortedDates;
    
    return { sortedDates, targetIdx, windowDates };
  }, [datesList, date, analysisDate]);

  // Optimized data fetching with concurrency control
  const fetchDataConcurrently = useCallback(async (dates, maxConcurrency = 3) => {
    const results = {};
    const chunks = [];
    
    // Split dates into chunks for controlled concurrency
    for (let i = 0; i < dates.length; i += maxConcurrency) {
      chunks.push(dates.slice(i, i + maxConcurrency));
    }

    setState(prev => ({ ...prev, totalChunks: chunks.length, processingChunk: 0 }));

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      setState(prev => ({ ...prev, processingChunk: chunkIndex + 1 }));
      
      const chunk = chunks[chunkIndex];
      const chunkPromises = chunk.map(async (dateItem) => {
        try {
          const [excelData, hourData] = await Promise.all([
            getExcelData(selectedUser, dateItem),
            getHourEntry(selectedUser, dateItem)
          ]);

          return { date: dateItem, excelData, hourData };
        } catch (error) {
          console.error(`Error fetching data for ${dateItem}:`, error);
          return { date: dateItem, excelData: null, hourData: null, error: error.message };
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      
      // Process chunk results
      chunkResults.forEach(({ date: dateItem, excelData, hourData, error }) => {
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

          results[dateItem] = {
            date: dateItem,
            hrData,
            success: Object.keys(hrData).length > 0,
            index: dates.indexOf(dateItem),
            dateKey: dateItem
          };
        } else {
          results[dateItem] = {
            date: dateItem,
            hrData: {},
            success: false,
            error: error || (!excelData ? 'No Excel data' : 'No Hour Entry data'),
            index: dates.indexOf(dateItem),
            dateKey: dateItem
          };
        }
      });

      // Update UI progressively to show loading progress
      setHeavyData(prev => ({
        ...prev,
        allDaysData: { ...prev.allDaysData, ...results }
      }));

      // Add small delay to prevent UI blocking
      if (chunkIndex < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    return results;
  }, [selectedUser, getExcelData, getHourEntry]);

  // Memoized topic discovery with smart matching
  const discoveredTopics = useMemo(() => {
    const discoveredSets = new Set();
    Object.values(heavyData.allDaysData).forEach(dayData => {
      if (dayData.success && dayData.hrData) {
        Object.values(dayData.hrData).forEach(hrData => {
          Object.keys(hrData.sets || {}).forEach(setName => {
            discoveredSets.add(setName);
          });
        });
      }
    });

    const discoveredTopicsArray = Array.from(discoveredSets);
    const topicMatcher = createTopicMatcher(TOPIC_ORDER, discoveredTopicsArray);
    
    return TOPIC_ORDER
      .filter(expectedTopic => topicMatcher.has(expectedTopic))
      .map(expectedTopic => topicMatcher.get(expectedTopic));
  }, [heavyData.allDaysData]);

  // Optimized data loading with caching
  const buildAllDaysData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      
      const { windowDates } = dateCalculations;
      
      if (windowDates.length < 4) {
        setState(prev => ({ 
          ...prev, 
          error: `Rule-1 requires at least 4 total dates. Only ${windowDates.length} dates available.`,
          loading: false 
        }));
        return;
      }

      // Check cache first
      const cacheKey = `rule1_optimized_${selectedUser}_${date}`;
      const cachedData = await getCachedAnalysis(cacheKey);
      
      if (cachedData && cacheHit) {
        console.log('🚀 [Rule-1 Optimized] Using cached data');
        setHeavyData(prev => ({ ...prev, allDaysData: cachedData.allDaysData }));
        setState(prev => ({ 
          ...prev, 
          availableTopics: cachedData.availableTopics,
          activeHR: cachedData.activeHR,
          selectedTopics: new Set(cachedData.availableTopics),
          loading: false 
        }));
        return;
      }

      // Fetch data with optimized concurrency
      const assembled = await fetchDataConcurrently(windowDates);

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

      // Update state
      setState(prev => ({ 
        ...prev,
        activeHR: firstHR,
        availableTopics: discoveredTopics,
        selectedTopics: new Set(discoveredTopics),
        windowType: `Complete Historical View (${windowDates.length} dates)`,
        loading: false
      }));

      // Cache the result
      await cacheAnalysis(cacheKey, {
        allDaysData: assembled,
        availableTopics: discoveredTopics,
        activeHR: firstHR
      });

    } catch (err) {
      console.error('❌ [Rule-1 Optimized] Error building data:', err);
      setState(prev => ({ 
        ...prev, 
        error: `Error loading data: ${err.message}`,
        loading: false 
      }));
    }
  }, [selectedUser, date, dateCalculations, getCachedAnalysis, cacheAnalysis, fetchDataConcurrently, discoveredTopics, cacheHit]);

  // Optimized ABCD/BCD analysis with web workers (when available)
  const loadRule2AnalysisResults = useCallback(async () => {
    try {
      console.log('🔍 [Rule1Page Optimized] Loading Rule-2 analysis with optimization...');
      
      const availableDates = Object.keys(heavyData.allDaysData).sort((a, b) => new Date(a) - new Date(b));
      
      if (availableDates.length === 0) return;

      const analysisData = {};
      
      // Use requestIdleCallback for non-blocking processing when available
      const processDateChunk = (dates, startIndex = 0, chunkSize = 2) => {
        return new Promise((resolve) => {
          const processChunk = async () => {
            const endIndex = Math.min(startIndex + chunkSize, dates.length);
            
            for (let i = startIndex; i < endIndex; i++) {
              if (i > 0) {
                const currentDate = dates[i];
                const previousDate = dates[i - 1];
                
                try {
                  const datesForAnalysis = dates.slice(0, i + 1);
                  const rule2Analysis = await rule2AnalysisService.performRule2Analysis(
                    selectedUser, 
                    previousDate,
                    datesForAnalysis,
                    state.activeHR || 1
                  );

                  if (rule2Analysis.success && rule2Analysis.setResults) {
                    rule2Analysis.setResults.forEach(setResult => {
                      if (!analysisData[setResult.setName]) {
                        analysisData[setResult.setName] = {};
                      }
                      analysisData[setResult.setName][currentDate] = {
                        abcdNumbers: setResult.abcdNumbers || [],
                        bcdNumbers: setResult.bcdNumbers || []
                      };
                    });
                  }
                } catch (error) {
                  console.error(`Error processing ${currentDate}:`, error);
                }
              }
            }

            if (endIndex < dates.length) {
              // Use setTimeout for non-blocking continuation
              setTimeout(() => processDateChunk(dates, endIndex, chunkSize).then(resolve), 10);
            } else {
              resolve();
            }
          };

          // Use requestIdleCallback if available, otherwise setTimeout
          if (window.requestIdleCallback) {
            window.requestIdleCallback(processChunk);
          } else {
            setTimeout(processChunk, 0);
          }
        });
      };

      await processDateChunk(availableDates);

      if (Object.keys(analysisData).length > 0) {
        setHeavyData(prev => ({ ...prev, abcdBcdAnalysis: analysisData }));
      }

    } catch (error) {
      console.error('❌ [Rule1Page Optimized] Error loading Rule-2 analysis:', error);
    }
  }, [heavyData.allDaysData, selectedUser, state.activeHR]);

  // Optimized clicked numbers loading
  const loadClickedNumbers = useCallback(async () => {
    if (!selectedUser || !state.activeHR) return;

    try {
      setState(prev => ({ ...prev, numberBoxLoading: true }));
      
      const clickedData = await cleanSupabaseService.getTopicClicks(selectedUser);
      const organizedClicks = {};
      
      clickedData.forEach(click => {
        const { topic_name, date_key, hour, clicked_number } = click;
        
        if (!organizedClicks[topic_name]) organizedClicks[topic_name] = {};
        if (!organizedClicks[topic_name][date_key]) organizedClicks[topic_name][date_key] = {};
        if (!organizedClicks[topic_name][date_key][hour]) organizedClicks[topic_name][date_key][hour] = [];

        organizedClicks[topic_name][date_key][hour].push(clicked_number);
      });

      setHeavyData(prev => ({ ...prev, clickedNumbers: organizedClicks }));
      
    } catch (error) {
      console.error('❌ Error loading clicked numbers:', error);
    } finally {
      setState(prev => ({ ...prev, numberBoxLoading: false }));
    }
  }, [selectedUser, state.activeHR]);

  // Optimized effects with dependencies
  useEffect(() => {
    if (selectedUser && datesList && date) {
      buildAllDaysData();
    }
  }, [selectedUser, datesList, date, buildAllDaysData]);

  useEffect(() => {
    if (Object.keys(heavyData.allDaysData).length > 0 && state.availableTopics.length > 0 && selectedUser && state.activeHR) {
      loadRule2AnalysisResults();
    }
  }, [heavyData.allDaysData, state.availableTopics, selectedUser, state.activeHR, loadRule2AnalysisResults]);

  useEffect(() => {
    if (selectedUser && state.activeHR && Object.keys(heavyData.allDaysData).length > 0) {
      loadClickedNumbers();
    }
  }, [selectedUser, state.activeHR, heavyData.allDaysData, loadClickedNumbers]);

  // Memoized topic display calculation
  const topicsForDisplay = useMemo(() => {
    if (state.selectedTopics.size === 0) return state.availableTopics;
    return state.availableTopics.filter(topic => state.selectedTopics.has(topic));
  }, [state.selectedTopics, state.availableTopics]);

  // Event handlers
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleTopicToggle = useCallback((topic) => {
    setState(prev => {
      const newSelectedTopics = new Set(prev.selectedTopics);
      if (prev.selectedTopics.has(topic)) {
        newSelectedTopics.delete(topic);
      } else {
        newSelectedTopics.add(topic);
      }
      return { ...prev, selectedTopics: newSelectedTopics };
    });
  }, []);

  // Mark render end and log performance metrics
  useEffect(() => {
    markRenderEnd();
    
    // Log performance metrics every 10 renders
    if (metrics.renderCount % 10 === 0 && metrics.renderCount > 0) {
      logMetrics();
    }
  });

  // Loading component
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Suspense fallback={<div>Loading...</div>}>
            <ProgressBar />
          </Suspense>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Optimized Rule-1 Analysis Loading
          </h2>
          <p className="text-gray-600">
            Enhanced performance with chunked processing
          </p>
          {state.totalChunks > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                Processing chunk {state.processingChunk} of {state.totalChunks}
              </div>
              <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(state.processingChunk / state.totalChunks) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{state.error}</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button 
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Rule-1 Analysis (Optimized)
              </h1>
              <p className="text-gray-600">{state.windowType}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Performance Enhanced • {Object.keys(heavyData.allDaysData).length} dates loaded
              </div>
              <div className="text-sm text-green-600">
                ⚡ Optimized with chunked processing & caching
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {isOptimized ? '🟢 60fps Ready' : '🟡 Optimizing'} • 
                Renders: {metrics.renderCount} • 
                Avg: {metrics.averageRenderTime.toFixed(1)}ms
                {isWorkerSupported && ' • 🔧 Web Worker Active'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Topic Selector */}
        <Suspense fallback={<div className="h-20 bg-gray-100 rounded animate-pulse"></div>}>
          <TopicSelector
            availableTopics={state.availableTopics}
            selectedTopics={state.selectedTopics}
            onTopicToggle={handleTopicToggle}
            showSelector={state.showTopicSelector}
          />
        </Suspense>

        {/* Data Tables with Lazy Loading */}
        <Suspense fallback={<div className="h-96 bg-gray-100 rounded animate-pulse"></div>}>
          <div className="space-y-6">
            {topicsForDisplay.map(topic => (
              <div key={topic} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">{topic}</h3>
                </div>
                <div className="p-6">
                  <NumberBoxGrid
                    topic={topic}
                    allDaysData={heavyData.allDaysData}
                    abcdBcdAnalysis={heavyData.abcdBcdAnalysis}
                    clickedNumbers={heavyData.clickedNumbers}
                    activeHR={state.activeHR}
                    selectedUser={selectedUser}
                    numberBoxLoading={state.numberBoxLoading}
                  />
                </div>
              </div>
            ))}
          </div>
        </Suspense>
      </div>
    </div>
  );
});

Rule1PageOptimized.displayName = 'Rule1PageOptimized';

export default Rule1PageOptimized;
