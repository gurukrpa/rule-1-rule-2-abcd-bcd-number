// ✅ Enhanced ABCD/BCD Analysis Utility
// Unified logic for consistent analysis across all components

/**
 * Core ABCD/BCD Analysis Function
 * @param {number[]} aDayNumbers - Numbers from A-day
 * @param {number[]} bDayNumbers - Numbers from B-day  
 * @param {number[]} cDayNumbers - Numbers from C-day
 * @param {number[]} dDayNumbers - Numbers from D-day
 * @param {Object} options - Additional configuration options
 * @returns {Object} Analysis results with detailed information
 */
export const performAbcdBcdAnalysis = (aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers, options = {}) => {
  const {
    includeDetailedAnalysis = false,
    logResults = false,
    setName = 'Unknown'
  } = options;

  // Input validation
  if (!Array.isArray(dDayNumbers) || dDayNumbers.length === 0) {
    return {
      abcdNumbers: [],
      bcdNumbers: [],
      detailedAnalysis: includeDetailedAnalysis ? {} : undefined,
      error: 'No D-day numbers provided'
    };
  }

  const abcdNumbers = [];
  const bcdNumbers = [];
  const detailedAnalysis = includeDetailedAnalysis ? {} : null;

  // Helper function to check if a number exists in a list
  const exists = (list, num) => Array.isArray(list) && list.includes(num);

  // Process each D-day number
  for (const num of dDayNumbers) {
    // ✅ ABCD Analysis: Count presence in A, B, C days (only once per day)
    const inA = exists(aDayNumbers, num);
    const inB = exists(bDayNumbers, num);
    const inC = exists(cDayNumbers, num);
    
    const abcCount = [inA, inB, inC].filter(Boolean).length;
    const occurrences = [];
    
    if (inA) occurrences.push('A');
    if (inB) occurrences.push('B');
    if (inC) occurrences.push('C');

    // Store detailed analysis if requested
    if (detailedAnalysis) {
      detailedAnalysis[num] = {
        inA,
        inB,
        inC,
        abcCount,
        occurrences: [...occurrences],
        qualified: false,
        type: null,
        reason: ''
      };
    }

    // ✅ ABCD Logic: Must appear in ≥2 of A, B, C days
    if (abcCount >= 2) {
      abcdNumbers.push(num);
      if (detailedAnalysis) {
        detailedAnalysis[num].qualified = true;
        detailedAnalysis[num].type = 'ABCD';
        detailedAnalysis[num].reason = `Appears in ${abcCount}/3 ABC days: ${occurrences.join(', ')}`;
      }
      continue; // ❗ ABCD takes priority — skip BCD check
    }

    // ✅ BCD Logic: Must be in B or C (exclusively), but not both
    const bdPairOnly = inB && !inC; // B-D pair but NOT in C
    const cdPairOnly = inC && !inB; // C-D pair but NOT in B
    const bcdValid = bdPairOnly || cdPairOnly;

    if (bcdValid) {
      bcdNumbers.push(num);
      if (detailedAnalysis) {
        detailedAnalysis[num].qualified = true;
        detailedAnalysis[num].type = 'BCD';
        detailedAnalysis[num].reason = bdPairOnly ? 'B-D pair only' : 'C-D pair only';
      }
    } else if (detailedAnalysis) {
      // Record why it didn't qualify
      if (abcCount === 1) {
        detailedAnalysis[num].reason = `Only in ${occurrences.join(', ')} (need ≥2 for ABCD)`;
      } else if (inB && inC) {
        detailedAnalysis[num].reason = 'In both B and C (violates BCD exclusivity)';
      } else {
        detailedAnalysis[num].reason = 'Not in any ABC days';
      }
    }
  }

  // Sort results
  abcdNumbers.sort((a, b) => a - b);
  bcdNumbers.sort((a, b) => a - b);

  // Log results if requested
  if (logResults) {
    console.log(`🎯 Enhanced ABCD/BCD Analysis for ${setName}:`);
    console.log(`📊 D-day numbers: [${dDayNumbers.join(', ')}]`);
    console.log(`📊 A-day numbers: [${aDayNumbers.join(', ')}]`);
    console.log(`📊 B-day numbers: [${bDayNumbers.join(', ')}]`);
    console.log(`📊 C-day numbers: [${cDayNumbers.join(', ')}]`);
    console.log(`✅ ABCD results: [${abcdNumbers.join(', ')}] (${abcdNumbers.length} numbers)`);
    console.log(`✅ BCD results: [${bcdNumbers.join(', ')}] (${bcdNumbers.length} numbers)`);
  }

  const result = {
    abcdNumbers,
    bcdNumbers,
    summary: {
      dDayCount: dDayNumbers.length,
      abcdCount: abcdNumbers.length,
      bcdCount: bcdNumbers.length,
      totalQualified: abcdNumbers.length + bcdNumbers.length,
      qualificationRate: ((abcdNumbers.length + bcdNumbers.length) / dDayNumbers.length * 100).toFixed(1)
    }
  };

  if (includeDetailedAnalysis) {
    result.detailedAnalysis = detailedAnalysis;
  }

  return result;
};

/**
 * Batch Analysis for Multiple Sets
 * @param {Object} setData - Object containing set names as keys and day numbers as values
 * @param {Object} options - Configuration options
 * @returns {Object} Results for all sets
 */
export const performBatchAnalysis = (setData, options = {}) => {
  const {
    logResults = false,
    includeDetailedAnalysis = false
  } = options;

  const results = {};
  const summary = {
    totalSets: 0,
    totalAbcdNumbers: 0,
    totalBcdNumbers: 0,
    processedSets: [],
    errorSets: []
  };

  for (const [setName, dayNumbers] of Object.entries(setData)) {
    try {
      const { aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers } = dayNumbers;
      
      const analysis = performAbcdBcdAnalysis(
        aDayNumbers, 
        bDayNumbers, 
        cDayNumbers, 
        dDayNumbers,
        { 
          includeDetailedAnalysis, 
          logResults, 
          setName 
        }
      );

      results[setName] = analysis;
      summary.totalSets++;
      summary.totalAbcdNumbers += analysis.abcdNumbers.length;
      summary.totalBcdNumbers += analysis.bcdNumbers.length;
      summary.processedSets.push(setName);

    } catch (error) {
      console.error(`❌ Error processing set ${setName}:`, error);
      summary.errorSets.push({ setName, error: error.message });
    }
  }

  if (logResults) {
    console.log(`🎉 Batch Analysis Complete:`, summary);
  }

  return { results, summary };
};

/**
 * Validate Analysis Inputs
 * @param {number[]} aDayNumbers 
 * @param {number[]} bDayNumbers 
 * @param {number[]} cDayNumbers 
 * @param {number[]} dDayNumbers 
 * @returns {Object} Validation result
 */
export const validateAnalysisInputs = (aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers) => {
  const errors = [];
  const warnings = [];

  // Check if arrays are provided
  if (!Array.isArray(dDayNumbers)) errors.push('D-day numbers must be an array');
  if (!Array.isArray(aDayNumbers)) errors.push('A-day numbers must be an array');
  if (!Array.isArray(bDayNumbers)) errors.push('B-day numbers must be an array');
  if (!Array.isArray(cDayNumbers)) errors.push('C-day numbers must be an array');

  // Check for empty arrays
  if (Array.isArray(dDayNumbers) && dDayNumbers.length === 0) {
    errors.push('D-day numbers cannot be empty');
  }

  if (Array.isArray(aDayNumbers) && aDayNumbers.length === 0) {
    warnings.push('A-day numbers are empty');
  }
  if (Array.isArray(bDayNumbers) && bDayNumbers.length === 0) {
    warnings.push('B-day numbers are empty');
  }
  if (Array.isArray(cDayNumbers) && cDayNumbers.length === 0) {
    warnings.push('C-day numbers are empty');
  }

  // Check for valid numbers
  const allArrays = [aDayNumbers, bDayNumbers, cDayNumbers, dDayNumbers].filter(Array.isArray);
  for (const arr of allArrays) {
    for (const num of arr) {
      if (typeof num !== 'number' || !Number.isInteger(num) || num < 0) {
        errors.push(`Invalid number found: ${num} (must be positive integer)`);
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
