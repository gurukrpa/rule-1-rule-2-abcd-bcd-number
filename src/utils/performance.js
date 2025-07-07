// Performance optimization utilities
import { memo, useMemo, useCallback, useRef, useEffect } from 'react';

// Debounce utility for input handling
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle utility for scroll/resize events
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// Virtual scrolling for large datasets
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    offsetY: visibleRange.start * itemHeight,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  };
};

// Memoized component wrapper
export const withMemo = (Component, propsAreEqual) => {
  return memo(Component, propsAreEqual);
};

// Lazy loading utility
export const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

// Cache utility for expensive computations
class ComputationCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (LRU)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

export const computationCache = new ComputationCache();

// Memoized ABCD/BCD calculation
export const useMemoizedAnalysis = (data, dependencies) => {
  return useMemo(() => {
    if (!data) return null;

    const cacheKey = JSON.stringify({ data, dependencies });
    const cached = computationCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Perform expensive calculation
    const result = performAnalysisCalculation(data);
    computationCache.set(cacheKey, result);
    return result;
  }, [data, ...dependencies]);
};

// Web Worker utility for heavy computations
export class AnalysisWorker {
  constructor() {
    this.worker = null;
    this.isSupported = typeof Worker !== 'undefined';
  }

  async performAnalysis(data) {
    if (!this.isSupported) {
      // Fallback to main thread
      return this.performMainThreadAnalysis(data);
    }

    return new Promise((resolve, reject) => {
      if (!this.worker) {
        this.worker = new Worker('/workers/analysis-worker.js');
      }

      const timeout = setTimeout(() => {
        reject(new Error('Analysis timeout'));
      }, 30000); // 30 second timeout

      this.worker.onmessage = (e) => {
        clearTimeout(timeout);
        resolve(e.data);
      };

      this.worker.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      this.worker.postMessage(data);
    });
  }

  performMainThreadAnalysis(data) {
    // Fallback implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(performAnalysisCalculation(data));
      }, 0);
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Bundle splitting utility
export const loadComponentAsync = (componentPath) => {
  return lazy(() => import(componentPath));
};

// Image optimization utility
export const optimizedImageProps = (src, alt, width, height) => {
  return {
    src,
    alt,
    width,
    height,
    loading: 'lazy',
    decoding: 'async',
    style: { 
      aspectRatio: `${width}/${height}`,
      objectFit: 'cover'
    }
  };
};

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startMeasure(name) {
    this.metrics.set(name, performance.now());
  }

  endMeasure(name) {
    const start = this.metrics.get(name);
    if (start) {
      const duration = performance.now() - start;
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      this.metrics.delete(name);
      return duration;
    }
    return null;
  }

  measureAsync(name, asyncFunction) {
    return async (...args) => {
      this.startMeasure(name);
      try {
        const result = await asyncFunction(...args);
        this.endMeasure(name);
        return result;
      } catch (error) {
        this.endMeasure(name);
        throw error;
      }
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };
  }
  return null;
};

// Component performance HOC
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return memo((props) => {
    useEffect(() => {
      performanceMonitor.startMeasure(`${componentName}-render`);
      return () => {
        performanceMonitor.endMeasure(`${componentName}-render`);
      };
    });

    return <WrappedComponent {...props} />;
  });
};

// Helper function for analysis calculation (placeholder)
function performAnalysisCalculation(data) {
  // This would contain the actual ABCD/BCD analysis logic
  // Moved to separate function for easier testing and optimization
  return {
    abcdNumbers: [],
    bcdNumbers: [],
    timestamp: Date.now()
  };
}
