// Web Worker for heavy ABCD/BCD analysis computations
// This runs in a separate thread to avoid blocking the UI

self.onmessage = function(e) {
  const { data, type } = e.data;

  try {
    let result;

    switch (type) {
      case 'ABCD_ANALYSIS':
        result = performAbcdAnalysis(data);
        break;
      case 'BCD_ANALYSIS':
        result = performBcdAnalysis(data);
        break;
      case 'FULL_ANALYSIS':
        result = performFullAnalysis(data);
        break;
      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }

    self.postMessage({
      success: true,
      result,
      timestamp: Date.now()
    });

  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
      timestamp: Date.now()
    });
  }
};

// ABCD Analysis: D-day numbers appearing in 2+ of A,B,C days
function performAbcdAnalysis({ aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers }) {
  const abcdNumbers = [];

  for (const dNum of dDayNumbers) {
    let count = 0;
    if (aDayNumbers.includes(dNum)) count++;
    if (bDayNumbers.includes(dNum)) count++;
    if (cDayNumbers.includes(dNum)) count++;

    if (count >= 2) {
      abcdNumbers.push(dNum);
    }
  }

  return {
    abcdNumbers: [...new Set(abcdNumbers)].sort((a, b) => a - b),
    totalChecked: dDayNumbers.length,
    qualificationRate: dDayNumbers.length > 0 ? abcdNumbers.length / dDayNumbers.length : 0
  };
}

// BCD Analysis: D-day numbers in exclusive B-D or C-D pairs
function performBcdAnalysis({ aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers, abcdNumbers = [] }) {
  const bcdNumbers = [];

  for (const dNum of dDayNumbers) {
    // Skip if already in ABCD (mutual exclusivity)
    if (abcdNumbers.includes(dNum)) continue;

    const inA = aDayNumbers.includes(dNum);
    const inB = bDayNumbers.includes(dNum);
    const inC = cDayNumbers.includes(dNum);

    // Exclusive B-D pair (in B and D, but not in A or C)
    const bdPairOnly = inB && !inA && !inC;
    
    // Exclusive C-D pair (in C and D, but not in A or B)
    const cdPairOnly = inC && !inA && !inB;

    if (bdPairOnly || cdPairOnly) {
      bcdNumbers.push(dNum);
    }
  }

  return {
    bcdNumbers: [...new Set(bcdNumbers)].sort((a, b) => a - b),
    totalChecked: dDayNumbers.length - abcdNumbers.length,
    qualificationRate: dDayNumbers.length > 0 ? bcdNumbers.length / dDayNumbers.length : 0
  };
}

// Full Analysis: Both ABCD and BCD with detailed breakdown
function performFullAnalysis({ aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers, setName = 'Unknown Set' }) {
  // Ensure all inputs are arrays of numbers
  const aNumbers = Array.isArray(aDayNumbers) ? aDayNumbers.filter(n => typeof n === 'number') : [];
  const bNumbers = Array.isArray(bDayNumbers) ? bDayNumbers.filter(n => typeof n === 'number') : [];
  const cNumbers = Array.isArray(cDayNumbers) ? cDayNumbers.filter(n => typeof n === 'number') : [];
  const dNumbers = Array.isArray(dDayNumbers) ? dDayNumbers.filter(n => typeof n === 'number') : [];

  // Step 1: ABCD Analysis
  const abcdResult = performAbcdAnalysis({
    aDayNumbers: aNumbers,
    bDayNumbers: bNumbers,
    cDayNumbers: cNumbers,
    dDayNumbers: dNumbers
  });

  // Step 2: BCD Analysis (excluding ABCD numbers)
  const bcdResult = performBcdAnalysis({
    aDayNumbers: aNumbers,
    bDayNumbers: bNumbers,
    cDayNumbers: cNumbers,
    dDayNumbers: dNumbers,
    abcdNumbers: abcdResult.abcdNumbers
  });

  // Step 3: Detailed element-wise breakdown
  const elementWiseAnalysis = [];
  const allNumbers = [...new Set([...aNumbers, ...bNumbers, ...cNumbers, ...dNumbers])].sort((a, b) => a - b);

  for (const num of allNumbers) {
    const inA = aNumbers.includes(num);
    const inB = bNumbers.includes(num);
    const inC = cNumbers.includes(num);
    const inD = dNumbers.includes(num);

    const abcCount = [inA, inB, inC].filter(Boolean).length;
    let qualification = 'None';
    let details = '';

    if (inD) {
      if (abcdResult.abcdNumbers.includes(num)) {
        qualification = 'ABCD';
        details = `Appears in ${abcCount} of A,B,C days`;
      } else if (bcdResult.bcdNumbers.includes(num)) {
        qualification = 'BCD';
        if (inB && !inA && !inC) details = 'B-D pair only';
        else if (inC && !inA && !inB) details = 'C-D pair only';
      } else {
        qualification = 'Unqualified';
        details = 'Does not meet ABCD or BCD criteria';
      }
    } else {
      qualification = 'Not in D-day';
      details = 'Number not present in D-day data';
    }

    elementWiseAnalysis.push({
      number: num,
      occurrences: { A: inA, B: inB, C: inC, D: inD },
      qualification,
      details,
      abcCount
    });
  }

  // Step 4: Summary statistics
  const summary = {
    setName,
    totalNumbers: allNumbers.length,
    dDayCount: dNumbers.length,
    abcdCount: abcdResult.abcdNumbers.length,
    bcdCount: bcdResult.bcdNumbers.length,
    unqualifiedCount: dNumbers.length - abcdResult.abcdNumbers.length - bcdResult.bcdNumbers.length,
    qualificationRate: dNumbers.length > 0 ? 
      (abcdResult.abcdNumbers.length + bcdResult.bcdNumbers.length) / dNumbers.length : 0
  };

  return {
    setName,
    abcdNumbers: abcdResult.abcdNumbers,
    bcdNumbers: bcdResult.bcdNumbers,
    unqualifiedNumbers: dNumbers.filter(num => 
      !abcdResult.abcdNumbers.includes(num) && !bcdResult.bcdNumbers.includes(num)
    ),
    elementWiseAnalysis,
    summary,
    rawData: {
      aDayNumbers: aNumbers,
      bDayNumbers: bNumbers,
      cDayNumbers: cNumbers,
      dDayNumbers: dNumbers
    },
    timestamp: Date.now()
  };
}

// Utility function to validate input data
function validateAnalysisData(data) {
  const required = ['aDayNumbers', 'bDayNumbers', 'cDayNumbers', 'dDayNumbers'];
  
  for (const field of required) {
    if (!Array.isArray(data[field])) {
      throw new Error(`${field} must be an array`);
    }
  }

  return true;
}
