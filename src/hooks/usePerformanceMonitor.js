// src/hooks/usePerformanceMonitor.js
// Performance monitoring hook for tracking load times and optimizations

import { useState, useEffect, useCallback, useRef } from 'react';

export const usePerformanceMonitor = (componentName = 'Component') => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    mountTime: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    memoryUsage: null,
    isOptimized: false
  });

  const renderStartTime = useRef(performance.now());
  const renderTimes = useRef([]);
  const mountStartTime = useRef(performance.now());

  // Mark render start
  const markRenderStart = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // Mark render end and calculate metrics
  const markRenderEnd = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    renderTimes.current.push(renderTime);
    
    // Keep only last 10 render times for average calculation
    if (renderTimes.current.length > 10) {
      renderTimes.current = renderTimes.current.slice(-10);
    }

    const averageRenderTime = renderTimes.current.reduce((acc, time) => acc + time, 0) / renderTimes.current.length;
    
    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderTime,
      averageRenderTime,
      isOptimized: renderTime < 16.67 // 60fps threshold
    }));
  }, []);

  // Get memory usage (when available)
  const getMemoryUsage = useCallback(() => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100
      };
    }
    return null;
  }, []);

  // Monitor component mount time
  useEffect(() => {
    const mountTime = performance.now() - mountStartTime.current;
    setMetrics(prev => ({ ...prev, mountTime }));
    
    console.log(`🚀 [Performance] ${componentName} mounted in ${mountTime.toFixed(2)}ms`);
    
    return () => {
      console.log(`🔧 [Performance] ${componentName} unmounted after ${metrics.renderCount} renders`);
    };
  }, [componentName, metrics.renderCount]);

  // Update memory usage periodically
  useEffect(() => {
    const updateMemoryUsage = () => {
      const memoryUsage = getMemoryUsage();
      setMetrics(prev => ({ ...prev, memoryUsage }));
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getMemoryUsage]);

  // Performance analysis
  const getPerformanceAnalysis = useCallback(() => {
    return {
      isPerformant: metrics.averageRenderTime < 16.67,
      rating: metrics.averageRenderTime < 8 ? 'Excellent' : 
              metrics.averageRenderTime < 16.67 ? 'Good' : 
              metrics.averageRenderTime < 33.33 ? 'Fair' : 'Poor',
      recommendations: [
        ...(metrics.averageRenderTime > 16.67 ? ['Consider using React.memo()'] : []),
        ...(metrics.renderCount > 50 ? ['Check for unnecessary re-renders'] : []),
        ...(metrics.memoryUsage?.used > 100 ? ['Monitor memory usage'] : [])
      ]
    };
  }, [metrics]);

  // Log performance metrics
  const logMetrics = useCallback(() => {
    const analysis = getPerformanceAnalysis();
    console.group(`📊 [Performance] ${componentName} Metrics`);
    console.log('Render Count:', metrics.renderCount);
    console.log('Mount Time:', `${metrics.mountTime.toFixed(2)}ms`);
    console.log('Last Render:', `${metrics.lastRenderTime.toFixed(2)}ms`);
    console.log('Average Render:', `${metrics.averageRenderTime.toFixed(2)}ms`);
    console.log('Performance Rating:', analysis.rating);
    console.log('Is 60fps Ready:', metrics.isOptimized);
    if (metrics.memoryUsage) {
      console.log('Memory Usage:', `${metrics.memoryUsage.used}MB / ${metrics.memoryUsage.total}MB`);
    }
    if (analysis.recommendations.length > 0) {
      console.log('Recommendations:', analysis.recommendations);
    }
    console.groupEnd();
  }, [componentName, metrics, getPerformanceAnalysis]);

  return {
    metrics,
    markRenderStart,
    markRenderEnd,
    getPerformanceAnalysis,
    logMetrics,
    isOptimized: metrics.isOptimized
  };
};
