// src/hooks/useCachedData.js
// Custom hooks for data caching and analysis

import { useState, useEffect, useCallback } from 'react';
import { redisCache } from '../services/redisClient';
import { unifiedDataService } from '../services/unifiedDataService';

export function useCachedData(userId) {
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    lastUpdate: null
  });

  const updateStats = useCallback(() => {
    const stats = redisCache.getStats();
    setCacheStats({
      hits: stats.hits,
      misses: stats.misses,
      lastUpdate: new Date().toISOString()
    });
  }, []);

  const getExcelData = useCallback(async (userId, date) => {
    const cacheKey = `excel_${userId}_${date}`;
    
    try {
      // Check cache first
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        updateStats();
        return JSON.parse(cached);
      }

      // Fetch from service
      const data = await unifiedDataService.getExcelData(userId, date);
      if (data) {
        await redisCache.set(cacheKey, JSON.stringify(data), 3600); // Cache for 1 hour
      }
      updateStats();
      return data;
    } catch (error) {
      console.error('Error in getExcelData:', error);
      return null;
    }
  }, [updateStats]);

  const getHourEntry = useCallback(async (userId, date) => {
    const cacheKey = `hour_${userId}_${date}`;
    
    try {
      // Check cache first
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        updateStats();
        return JSON.parse(cached);
      }

      // Fetch from service
      const data = await unifiedDataService.getHourEntry(userId, date);
      if (data) {
        await redisCache.set(cacheKey, JSON.stringify(data), 3600); // Cache for 1 hour
      }
      updateStats();
      return data;
    } catch (error) {
      console.error('Error in getHourEntry:', error);
      return null;
    }
  }, [updateStats]);

  const cacheAnalysis = useCallback(async (key, analysis) => {
    try {
      await redisCache.set(`analysis_${key}`, JSON.stringify(analysis), 7200); // Cache for 2 hours
      updateStats();
    } catch (error) {
      console.error('Error caching analysis:', error);
    }
  }, [updateStats]);

  const getCachedAnalysis = useCallback(async (key) => {
    try {
      const cached = await redisCache.get(`analysis_${key}`);
      updateStats();
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached analysis:', error);
      return null;
    }
  }, [updateStats]);

  useEffect(() => {
    updateStats();
  }, [updateStats]);

  return {
    cacheStats,
    getExcelData,
    getHourEntry,
    cacheAnalysis,
    getCachedAnalysis
  };
}

export function useAnalysisCache(userId, analysisType) {
  const [cachedResult, setCachedResult] = useState(null);
  const [cacheHit, setCacheHit] = useState(false);

  const checkCache = useCallback(async (dateKey, hrKey) => {
    const cacheKey = `${analysisType}_${userId}_${dateKey}_${hrKey}`;
    
    try {
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        const result = JSON.parse(cached);
        setCachedResult(result);
        setCacheHit(true);
        console.log(`🚀 [AnalysisCache] Cache hit for ${cacheKey}`);
        return result;
      }
      setCacheHit(false);
      console.log(`❌ [AnalysisCache] Cache miss for ${cacheKey}`);
      return null;
    } catch (error) {
      console.error('Error checking analysis cache:', error);
      setCacheHit(false);
      return null;
    }
  }, [userId, analysisType]);

  const saveToCache = useCallback(async (dateKey, hrKey, result) => {
    const cacheKey = `${analysisType}_${userId}_${dateKey}_${hrKey}`;
    
    try {
      await redisCache.set(cacheKey, JSON.stringify(result), 3600); // Cache for 1 hour
      setCachedResult(result);
      console.log(`💾 [AnalysisCache] Saved result to cache: ${cacheKey}`);
    } catch (error) {
      console.error('Error saving to analysis cache:', error);
    }
  }, [userId, analysisType]);

  return {
    cachedResult,
    cacheHit,
    checkCache,
    saveToCache
  };
}
