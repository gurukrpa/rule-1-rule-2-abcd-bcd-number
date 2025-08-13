// public/analysis-worker.js
// Web Worker for heavy ABCD/BCD analysis calculations

self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'CALCULATE_ABCD_BCD':
      try {
        const result = calculateABCDBCD(data);
        self.postMessage({ type: 'ABCD_BCD_RESULT', result, success: true });
      } catch (error) {
        self.postMessage({ 
          type: 'ABCD_BCD_ERROR', 
          error: error.message, 
          success: false 
        });
      }
      break;
      
    case 'PROCESS_BULK_DATA':
      try {
        const results = processBulkData(data);
        self.postMessage({ type: 'BULK_DATA_RESULT', results, success: true });
      } catch (error) {
        self.postMessage({ 
          type: 'BULK_DATA_ERROR', 
          error: error.message, 
          success: false 
        });
      }
      break;
      
    default:
      self.postMessage({ 
        type: 'ERROR', 
        error: `Unknown message type: ${type}`, 
        success: false 
      });
  }
};

// ABCD/BCD calculation function
function calculateABCDBCD({ dDayNumbers, cDayNumbers, bDayNumbers, aDayNumbers }) {
  if (!dDayNumbers || dDayNumbers.length === 0) {
    return {
      abcdNumbers: [],
      bcdNumbers: [],
      error: 'No target date numbers found'
    };
  }

  // ABCD Analysis - numbers appearing in ≥2 of A, B, C days
  const abcdCandidates = dDayNumbers.filter(num => {
    let count = 0;
    if (aDayNumbers.includes(num)) count++;
    if (bDayNumbers.includes(num)) count++;
    if (cDayNumbers.includes(num)) count++;
    return count >= 2;
  });

  // BCD Analysis - exclusive pairs
  const bcdCandidates = dDayNumbers.filter(num => {
    const inB = bDayNumbers.includes(num);
    const inC = cDayNumbers.includes(num);
    const inTarget = true; // Already filtering dDayNumbers
    
    const bTargetPairOnly = inB && inTarget && !inC;
    const cTargetPairOnly = inC && inTarget && !inB;
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

// Bulk data processing function
function processBulkData({ datasets, chunkSize = 5 }) {
  const results = [];
  
  for (let i = 0; i < datasets.length; i += chunkSize) {
    const chunk = datasets.slice(i, i + chunkSize);
    
    chunk.forEach(dataset => {
      try {
        const result = calculateABCDBCD(dataset);
        results.push({
          id: dataset.id,
          setName: dataset.setName,
          dateKey: dataset.dateKey,
          ...result,
          processed: true
        });
      } catch (error) {
        results.push({
          id: dataset.id,
          setName: dataset.setName,
          dateKey: dataset.dateKey,
          error: error.message,
          processed: false
        });
      }
    });
    
    // Send progress update
    self.postMessage({
      type: 'BULK_DATA_PROGRESS',
      processed: Math.min(i + chunkSize, datasets.length),
      total: datasets.length,
      progress: Math.min((i + chunkSize) / datasets.length * 100, 100)
    });
  }
  
  return results;
}

// Utility function for extracting element numbers
function extractElementNumber(str) {
  if (typeof str !== 'string') return null;
  const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
  return match ? Number(match[1]) : null;
}

console.log('🔧 Analysis Web Worker initialized and ready for heavy calculations');
