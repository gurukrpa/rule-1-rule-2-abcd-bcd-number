// src/config/performance.js
// Performance configuration and feature flags

export const PERFORMANCE_CONFIG = {
  // Enable/disable optimized components
  USE_OPTIMIZED_RULE1: true,
  
  // Web Worker configuration
  WEB_WORKERS: {
    enabled: true,
    maxConcurrency: 3,
    chunkSize: 5,
    fallbackTimeout: 5000
  },
  
  // Caching configuration
  CACHING: {
    enabled: true,
    ttl: {
      excel: 3600, // 1 hour
      hourEntry: 3600, // 1 hour
      analysis: 7200, // 2 hours
      results: 1800 // 30 minutes
    },
    maxSize: 100 // Max items in cache
  },
  
  // Data loading configuration
  DATA_LOADING: {
    maxConcurrency: 3,
    chunkSize: 2,
    progressiveLoading: true,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Performance monitoring
  MONITORING: {
    enabled: true,
    logInterval: 10, // Log every 10 renders
    trackMemory: true,
    trackRenderTime: true
  },
  
  // UI optimizations
  UI_OPTIMIZATIONS: {
    lazyLoading: true,
    virtualizedLists: false, // Enable for very large lists
    memoization: true,
    suspenseFallbacks: true
  },
  
  // Development flags
  DEVELOPMENT: {
    showPerformanceMetrics: true,
    enableDevTools: process.env.NODE_ENV === 'development',
    verboseLogging: process.env.NODE_ENV === 'development'
  }
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT_RENDER_TIME: 8, // ms
  GOOD_RENDER_TIME: 16.67, // 60fps
  ACCEPTABLE_RENDER_TIME: 33.33, // 30fps
  MAX_MEMORY_USAGE: 100, // MB
  MAX_LOAD_TIME: 2000 // ms
};

// Feature detection
export const FEATURE_DETECTION = {
  webWorkersSupported: () => typeof Worker !== 'undefined',
  serviceWorkersSupported: () => 'serviceWorker' in navigator,
  intersectionObserverSupported: () => 'IntersectionObserver' in window,
  requestIdleCallbackSupported: () => 'requestIdleCallback' in window,
  performanceApiSupported: () => 'performance' in window && 'memory' in performance
};

// Get optimized configuration based on device capabilities
export const getOptimizedConfig = () => {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowMemoryDevice = FEATURE_DETECTION.performanceApiSupported() && 
    performance.memory && 
    performance.memory.jsHeapSizeLimit < 1073741824; // Less than 1GB

  return {
    ...PERFORMANCE_CONFIG,
    WEB_WORKERS: {
      ...PERFORMANCE_CONFIG.WEB_WORKERS,
      enabled: PERFORMANCE_CONFIG.WEB_WORKERS.enabled && 
        FEATURE_DETECTION.webWorkersSupported() && 
        !isLowMemoryDevice,
      maxConcurrency: isMobile ? 2 : PERFORMANCE_CONFIG.WEB_WORKERS.maxConcurrency
    },
    DATA_LOADING: {
      ...PERFORMANCE_CONFIG.DATA_LOADING,
      maxConcurrency: isMobile ? 2 : PERFORMANCE_CONFIG.DATA_LOADING.maxConcurrency,
      chunkSize: isMobile ? 1 : PERFORMANCE_CONFIG.DATA_LOADING.chunkSize
    },
    CACHING: {
      ...PERFORMANCE_CONFIG.CACHING,
      maxSize: isLowMemoryDevice ? 50 : PERFORMANCE_CONFIG.CACHING.maxSize
    }
  };
};

// Performance utilities
export const performanceUtils = {
  measureAsync: async (fn, label) => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`⏱️ [Performance] ${label}: ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`❌ [Performance] ${label} failed after ${(end - start).toFixed(2)}ms:`, error);
      throw error;
    }
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};
