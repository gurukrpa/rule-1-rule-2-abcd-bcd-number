import { useState, useRef } from 'react';

export const useCombinationWorker = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({
    phase: 'idle',
    current: 0,
    total: 0,
    permutationIndex: 0,
    totalPermutations: 0,
    currentBatch: 0,
    totalBatches: 0,
    processingSpeed: 0,
    estimatedTimeRemaining: null,
    message: ''
  });
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  
  const workerRef = useRef(null);
  const jobIdRef = useRef(0);

  const generateCombinations = async (params) => {
    const {
      selectedPlanetsByPosition,
      valueRange,
      minSum,
      maxSum
    } = params;

    // Reset state
    setIsGenerating(true);
    setError(null);
    setResults([]);
    setProgress({
      phase: 'calculating',
      current: 0,
      total: 0,
      permutationIndex: 0,
      totalPermutations: 0,
      currentBatch: 0,
      totalBatches: 0,
      processingSpeed: 0,
      estimatedTimeRemaining: null,
      message: 'Starting generation...'
    });

    // Create worker
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    
    workerRef.current = new Worker('/combination-worker.js');
    const currentJobId = ++jobIdRef.current;

    return new Promise((resolve, reject) => {
      workerRef.current.onmessage = (e) => {
        const { type, jobId, ...data } = e.data;
        
        // Ignore messages from old jobs
        if (jobId !== currentJobId) return;

        switch (type) {
          case 'progress':
            setProgress(prev => ({
              ...prev,
              ...data
            }));
            break;

          case 'intermediate_results':
            setResults(data.results);
            break;

          case 'complete':
            setResults(data.results);
            setProgress(prev => ({
              ...prev,
              phase: 'complete',
              current: data.results.length,
              total: data.results.length
            }));
            setIsGenerating(false);
            resolve(data.results);
            break;

          case 'error':
            setError(data.message);
            setIsGenerating(false);
            reject(new Error(data.message));
            break;

          default:
            console.warn('Unknown worker message type:', type);
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
        setError('Worker failed to start');
        setIsGenerating(false);
        reject(error);
      };

      // Start the work
      workerRef.current.postMessage({
        selectedPlanetsByPosition,
        valueRange: Number(valueRange),
        minSum: Number(minSum),
        maxSum: Number(maxSum),
        jobId: currentJobId
      });
    });
  };

  const cancelGeneration = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsGenerating(false);
    setProgress(prev => ({
      ...prev,
      phase: 'idle'
    }));
  };

  return {
    generateCombinations,
    cancelGeneration,
    isGenerating,
    progress,
    results,
    error
  };
};
