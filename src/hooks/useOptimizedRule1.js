// src/hooks/useOptimizedRule1.js
// Custom hook for optimized Rule1 functionality

import { useCallback, useEffect, useRef, useState } from 'react';
import optimizedRule1Service from '../services/OptimizedRule1Service';

export function useOptimizedRule1(selectedUser, datesList, activeHR = 'HR1') {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
    clickedNumbers: {},
    analysisResults: {},
    availableTopics: [],
    performance: {
      loadTime: 0,
      cacheHitRate: 0,
      dbCalls: 0
    }
  });

  const loadingRef = useRef(false);

  // Optimized data loading
  const loadData = useCallback(async () => {
    if (!selectedUser || !datesList?.length || loadingRef.current) return;

    loadingRef.current = true;
    const startTime = Date.now();

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Load all data in parallel
      const [userData, clickedData, analysisData] = await Promise.all([
        optimizedRule1Service.getOptimizedUserData(selectedUser, datesList),
        optimizedRule1Service.getClickedNumbers(
          selectedUser, 
          datesList, 
          ['HR1', 'HR2', 'HR3', 'HR4', 'HR5', 'HR6'],
          [] // Will be populated after userData loads
        ),
        optimizedRule1Service.getAnalysisResults(
          selectedUser, 
          datesList, 
          ['HR1', 'HR2', 'HR3', 'HR4', 'HR5', 'HR6']
        )
      ]);

      // Extract topics
      const topics = new Set();
      Object.values(userData).forEach(dayData => {
        if (dayData.success && dayData.data?.sets) {
          Object.keys(dayData.data.sets).forEach(setName => topics.add(setName));
        }
      });
      const availableTopics = Array.from(topics);

      // If we didn't have topics before, reload clicked data
      let finalClickedData = clickedData;
      if (availableTopics.length > 0 && Object.keys(clickedData).length === 0) {
        finalClickedData = await optimizedRule1Service.getClickedNumbers(
          selectedUser, 
          datesList, 
          ['HR1', 'HR2', 'HR3', 'HR4', 'HR5', 'HR6'],
          availableTopics
        );
      }

      const loadTime = Date.now() - startTime;
      const stats = optimizedRule1Service.getPerformanceStats();

      setState({
        loading: false,
        error: null,
        data: userData,
        clickedNumbers: finalClickedData,
        analysisResults: analysisData,
        availableTopics,
        performance: {
          loadTime,
          cacheHitRate: stats.cacheHitRate,
          dbCalls: stats.dbCalls
        }
      });

      // Start prefetching
      optimizedRule1Service.prefetchData(selectedUser, datesList, ['HR1', 'HR2', 'HR3', 'HR4', 'HR5', 'HR6'], availableTopics);

    } catch (error) {
      console.error('❌ [useOptimizedRule1] Error loading data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load data'
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [selectedUser, datesList]);

  // Optimized click handler
  const handleClick = useCallback(async (topicName, dateKey, number) => {
    if (!selectedUser) return;

    // Optimistic update
    setState(prev => {
      const newClickedNumbers = { ...prev.clickedNumbers };
      if (!newClickedNumbers[topicName]) newClickedNumbers[topicName] = {};
      if (!newClickedNumbers[topicName][dateKey]) newClickedNumbers[topicName][dateKey] = {};
      if (!newClickedNumbers[topicName][dateKey][activeHR]) newClickedNumbers[topicName][dateKey][activeHR] = [];

      const current = newClickedNumbers[topicName][dateKey][activeHR];
      const existingIndex = current.findIndex(item => item.number === number);
      
      if (existingIndex > -1) {
        newClickedNumbers[topicName][dateKey][activeHR] = current.filter(item => item.number !== number);
      } else {
        newClickedNumbers[topicName][dateKey][activeHR] = [...current, { number, isMatched: false }];
      }

      return {
        ...prev,
        clickedNumbers: newClickedNumbers
      };
    });

    // Batch operation
    try {
      const isCurrentlyClicked = state.clickedNumbers[topicName]?.[dateKey]?.[activeHR]?.some(item => item.number === number);
      
      await optimizedRule1Service.batchClickNumbers(selectedUser, [{
        topicName,
        dateKey,
        hour: activeHR,
        number,
        isClicked: !isCurrentlyClicked
      }]);
    } catch (error) {
      console.error('❌ Click operation failed:', error);
      // Revert optimistic update
      loadData();
    }
  }, [selectedUser, activeHR, state.clickedNumbers, loadData]);

  // Check if number is clicked
  const isNumberClicked = useCallback((topicName, dateKey, number) => {
    return state.clickedNumbers[topicName]?.[dateKey]?.[activeHR]?.some(item => item.number === number) || false;
  }, [state.clickedNumbers, activeHR]);

  // Check if number is highlighted
  const isNumberHighlighted = useCallback((topicName, dateKey, number) => {
    return state.analysisResults[dateKey]?.[activeHR]?.[topicName]?.abcdNumbers?.includes(number) ||
           state.analysisResults[dateKey]?.[activeHR]?.[topicName]?.bcdNumbers?.includes(number) || false;
  }, [state.analysisResults, activeHR]);

  // Load data when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      optimizedRule1Service.cleanup();
    };
  }, []);

  return {
    ...state,
    loadData,
    handleClick,
    isNumberClicked,
    isNumberHighlighted,
    stats: optimizedRule1Service.getPerformanceStats()
  };
}
