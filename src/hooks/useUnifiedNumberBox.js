// src/hooks/useUnifiedNumberBox.js
// ✅ REACT HOOK for Unified Number Box System
// Easy integration across Rule1 and PlanetsAnalysis pages

import { useState, useEffect, useCallback } from 'react';
import unifiedNumberBoxService from '../services/UnifiedNumberBoxService';

export const useUnifiedNumberBox = (userId, currentTopic, currentDate, currentHour) => {
  const [clickedNumbers, setClickedNumbers] = useState({});
  const [highlightedCount, setHighlightedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ CLICK HANDLER: Toggle number state
  const handleNumberClick = useCallback(async (number) => {
    if (!userId || !currentTopic || !currentDate || !currentHour) {
      console.warn('❌ [useUnifiedNumberBox] Missing required parameters');
      return;
    }

    try {
      setLoading(true);
      
      const newState = await unifiedNumberBoxService.clickNumber(
        userId, currentTopic, currentDate, currentHour, number
      );
      
      console.log(`🔢 [useUnifiedNumberBox] Number ${number} is now ${newState ? 'clicked' : 'unclicked'}`);
      
      // Refresh local state
      await refreshClickedNumbers();
      await refreshCount();
      
    } catch (error) {
      console.error('❌ [useUnifiedNumberBox] Click error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, currentTopic, currentDate, currentHour]);

  // ✅ CHECK IF NUMBER IS CLICKED
  const isNumberClicked = useCallback((number) => {
    if (!currentTopic || !currentDate || !currentHour) return false;
    
    const key = `${currentTopic}|${currentDate}|HR${currentHour}`;
    const numbers = clickedNumbers[key] || [];
    return numbers.includes(number);
  }, [clickedNumbers, currentTopic, currentDate, currentHour]);

  // ✅ GET CLICKED NUMBERS FOR CURRENT CONTEXT
  const getCurrentClickedNumbers = useCallback(() => {
    if (!currentTopic || !currentDate || !currentHour) return [];
    
    const key = `${currentTopic}|${currentDate}|HR${currentHour}`;
    return clickedNumbers[key] || [];
  }, [clickedNumbers, currentTopic, currentDate, currentHour]);

  // ✅ REFRESH CLICKED NUMBERS
  const refreshClickedNumbers = useCallback(async () => {
    if (!userId) return;
    
    try {
      const allNumbers = await unifiedNumberBoxService.getAllClickedNumbers(userId);
      
      // Flatten for easy access
      const flattened = {};
      Object.keys(allNumbers).forEach(topic => {
        Object.keys(allNumbers[topic]).forEach(date => {
          Object.keys(allNumbers[topic][date]).forEach(hour => {
            const key = `${topic}|${date}|${hour}`;
            flattened[key] = allNumbers[topic][date][hour];
          });
        });
      });
      
      setClickedNumbers(flattened);
      
    } catch (error) {
      console.error('❌ [useUnifiedNumberBox] Refresh error:', error);
    }
  }, [userId]);

  // ✅ REFRESH COUNT
  const refreshCount = useCallback(async () => {
    if (!userId || !currentDate || !currentHour) return;
    
    try {
      const count = await unifiedNumberBoxService.calculateHighlightedCount(
        userId, currentDate, currentHour
      );
      setHighlightedCount(count);
      
    } catch (error) {
      console.error('❌ [useUnifiedNumberBox] Count refresh error:', error);
    }
  }, [userId, currentDate, currentHour]);

  // ✅ FORCE HIGHLIGHT UPDATE
  const forceHighlightUpdate = useCallback(() => {
    unifiedNumberBoxService.applyDOMHighlighting();
  }, []);

  // ✅ SET ANALYSIS DATA: For highlighting logic
  const setAnalysisData = useCallback((topic, date, abcdNumbers, bcdNumbers) => {
    unifiedNumberBoxService.setAnalysisData(topic, date, abcdNumbers, bcdNumbers);
  }, []);

  // ✅ INITIAL LOAD
  useEffect(() => {
    if (userId) {
      refreshClickedNumbers();
    }
  }, [userId, refreshClickedNumbers]);

  useEffect(() => {
    if (userId && currentDate && currentHour) {
      refreshCount();
    }
  }, [userId, currentDate, currentHour, refreshCount]);

  // ✅ LISTEN FOR REAL-TIME UPDATES
  useEffect(() => {
    const unsubscribe = unifiedNumberBoxService.addListener((eventType, data) => {
      if (eventType === 'numberClick') {
        console.log('🔄 [useUnifiedNumberBox] Real-time update received');
        refreshClickedNumbers();
        refreshCount();
        forceHighlightUpdate();
      }
    });

    return unsubscribe;
  }, [refreshClickedNumbers, refreshCount, forceHighlightUpdate]);

  // ✅ TRIGGER HIGHLIGHTING WHEN NUMBERS CHANGE
  useEffect(() => {
    if (Object.keys(clickedNumbers).length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        forceHighlightUpdate();
      }, 100);
    }
  }, [clickedNumbers, forceHighlightUpdate]);

  return {
    // State
    clickedNumbers,
    highlightedCount,
    loading,
    
    // Actions
    handleNumberClick,
    isNumberClicked,
    getCurrentClickedNumbers,
    refreshClickedNumbers,
    refreshCount,
    forceHighlightUpdate,
    setAnalysisData,
    
    // Helpers
    hasClickedNumbers: getCurrentClickedNumbers().length > 0,
    clickedNumbersCount: getCurrentClickedNumbers().length
  };
};
