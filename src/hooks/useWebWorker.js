// src/hooks/useWebWorker.js
// Hook for managing Web Worker operations with fallback

import { useEffect, useRef, useCallback, useState } from 'react';

export const useWebWorker = (workerPath = '/analysis-worker.js') => {
  const workerRef = useRef(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Web Worker
  useEffect(() => {
    if (typeof Worker === 'undefined') {
      console.warn('🚫 Web Workers not supported in this environment');
      setIsSupported(false);
      return;
    }

    try {
      workerRef.current = new Worker(workerPath);
      setIsSupported(true);
      setIsReady(true);
      
      workerRef.current.onerror = (error) => {
        console.error('❌ Web Worker error:', error);
        setError(error.message);
        setIsReady(false);
      };

      console.log('🔧 Web Worker initialized successfully');
      
    } catch (err) {
      console.error('❌ Failed to create Web Worker:', err);
      setError(err.message);
      setIsSupported(false);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [workerPath]);

  // Calculate ABCD/BCD with Web Worker or fallback
  const calculateABCDBCD = useCallback(async (data) => {
    return new Promise((resolve, reject) => {
      if (!isSupported || !isReady || !workerRef.current) {
        // Fallback to main thread calculation
        try {
          const result = calculateABCDBCDFallback(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
        return;
      }

      const handleMessage = (e) => {
        const { type, result, error, success } = e.data;
        
        if (type === 'ABCD_BCD_RESULT' && success) {
          workerRef.current.removeEventListener('message', handleMessage);
          resolve(result);
        } else if (type === 'ABCD_BCD_ERROR' || !success) {
          workerRef.current.removeEventListener('message', handleMessage);
          reject(new Error(error || 'Web Worker calculation failed'));
        }
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type: 'CALCULATE_ABCD_BCD', data });
    });
  }, [isSupported, isReady]);

  // Process bulk data with progress updates
  const processBulkData = useCallback(async (datasets, onProgress) => {
    return new Promise((resolve, reject) => {
      if (!isSupported || !isReady || !workerRef.current) {
        // Fallback to main thread processing
        try {
          const results = datasets.map(dataset => calculateABCDBCDFallback(dataset));
          resolve(results);
        } catch (error) {
          reject(error);
        }
        return;
      }

      const handleMessage = (e) => {
        const { type, results, progress, processed, total, error, success } = e.data;
        
        if (type === 'BULK_DATA_PROGRESS' && onProgress) {
          onProgress({ processed, total, progress });
        } else if (type === 'BULK_DATA_RESULT' && success) {
          workerRef.current.removeEventListener('message', handleMessage);
          resolve(results);
        } else if (type === 'BULK_DATA_ERROR' || !success) {
          workerRef.current.removeEventListener('message', handleMessage);
          reject(new Error(error || 'Bulk processing failed'));
        }
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type: 'PROCESS_BULK_DATA', data: { datasets } });
    });
  }, [isSupported, isReady]);

  return {
    isSupported,
    isReady,
    error,
    calculateABCDBCD,
    processBulkData
  };
};

// Fallback calculation function for main thread
function calculateABCDBCDFallback({ dDayNumbers, cDayNumbers, bDayNumbers, aDayNumbers }) {
  if (!dDayNumbers || dDayNumbers.length === 0) {
    return {
      abcdNumbers: [],
      bcdNumbers: [],
      error: 'No target date numbers found'
    };
  }

  // ABCD Analysis
  const abcdCandidates = dDayNumbers.filter(num => {
    let count = 0;
    if (aDayNumbers && aDayNumbers.includes(num)) count++;
    if (bDayNumbers && bDayNumbers.includes(num)) count++;
    if (cDayNumbers && cDayNumbers.includes(num)) count++;
    return count >= 2;
  });

  // BCD Analysis
  const bcdCandidates = dDayNumbers.filter(num => {
    const inB = bDayNumbers && bDayNumbers.includes(num);
    const inC = cDayNumbers && cDayNumbers.includes(num);
    
    const bTargetPairOnly = inB && !inC;
    const cTargetPairOnly = inC && !inB;
    return bTargetPairOnly || cTargetPairOnly;
  });

  // Apply mutual exclusivity
  const abcdNumbers = abcdCandidates.sort((a, b) => a - b);
  const bcdNumbers = bcdCandidates
    .filter(num => !abcdCandidates.includes(num))
    .sort((a, b) => a - b);

  return {
    abcdNumbers,
    bcdNumbers,
    dDayCount: dDayNumbers.length,
    aDayCount: aDayNumbers ? aDayNumbers.length : 0,
    bDayCount: bDayNumbers ? bDayNumbers.length : 0,
    cDayCount: cDayNumbers ? cDayNumbers.length : 0
  };
}
