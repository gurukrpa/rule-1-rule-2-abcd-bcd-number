// Web Worker for combination generation
// This runs in a separate thread so it never blocks the UI

const planetNumbers = {
  Sun: [1, 10, 19, 28, 37, 46, 55, 64, 73, 82, 91, 100],
  Moon: [2, 11, 20, 29, 38, 47, 56, 65, 74, 83, 92],
  Mars: [9, 18, 27, 36, 45, 54, 63, 72, 81, 90, 99],
  Mercury: [5, 14, 23, 32, 41, 50, 59, 68, 77, 86, 95],
  Jupiter: [3, 12, 21, 30, 39, 48, 57, 66, 75, 84, 93],
  Venus: [6, 15, 24, 33, 42, 51, 60, 69, 78, 87, 96],
  Saturn: [8, 17, 26, 35, 44, 53, 62, 71, 80, 89, 98],
  Rahu: [4, 13, 22, 31, 40, 49, 58, 67, 76, 85, 94],
  Kethu: [7, 16, 25, 34, 43, 52, 61, 70, 79, 88, 97]
};

// Generate cartesian product of arrays
function cartesianProduct(arrays) {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) return arrays[0].map(item => [item]);
  
  const result = [];
  const firstArray = arrays[0];
  const remainingProduct = cartesianProduct(arrays.slice(1));
  
  for (const firstItem of firstArray) {
    for (const remainingItem of remainingProduct) {
      result.push([firstItem, ...remainingItem]);
    }
  }
  
  return result;
}

// Find combinations from planet numbers
function findCombinationsFromPlanetNumbers(planetsWithNumbers, planetOrder, valueRange, minSum, maxSum) {
  const numberArrays = planetsWithNumbers.map(item => item.numbers);
  const allCombinations = cartesianProduct(numberArrays);
  
  return allCombinations
    .filter(numbers => {
      // Value range filter
      const maxNumber = Math.max(...numbers);
      if (maxNumber > valueRange) return false;
      
      // Sum filter
      const sum = numbers.reduce((a, b) => a + b, 0);
      if (sum < minSum || sum > maxSum) return false;
      
      return true;
    })
    .map(numbers => ({
      numbers: numbers,
      planets: planetOrder,
      sum: numbers.reduce((a, b) => a + b, 0)
    }));
}

// Generate planet permutations
function generatePlanetPermutations(selectedPlanetsByPosition) {
  const validPlanetSelections = selectedPlanetsByPosition.filter(planets => 
    planets && planets.length > 0
  );
  
  if (validPlanetSelections.length === 0) {
    return [];
  }
  
  return cartesianProduct(validPlanetSelections);
}

// Main worker message handler
self.onmessage = function(e) {
  const { 
    selectedPlanetsByPosition, 
    valueRange, 
    minSum, 
    maxSum,
    jobId 
  } = e.data;
  
  try {
    console.log('Worker: Starting combination generation');
    const startTime = Date.now();
    
    // Step 1: Generate planet permutations
    self.postMessage({
      type: 'progress',
      jobId,
      phase: 'calculating',
      message: 'Calculating planet permutations...'
    });
    
    const planetPermutations = generatePlanetPermutations(selectedPlanetsByPosition);
    
    if (planetPermutations.length === 0) {
      self.postMessage({
        type: 'error',
        jobId,
        message: 'No combinations possible. Please ensure all planet positions have at least one planet selected.'
      });
      return;
    }
    
    console.log(`Worker: Generated ${planetPermutations.length} planet permutations`);
    
    // Step 2: Process permutations in batches
    self.postMessage({
      type: 'progress',
      jobId,
      phase: 'generating',
      totalPermutations: planetPermutations.length,
      permutationIndex: 0,
      currentBatch: 0,
      totalBatches: planetPermutations.length,
      current: 0
    });
    
    let allResults = [];
    const batchSize = 10; // Small batches for frequent updates
    
    for (let batchIndex = 0; batchIndex < planetPermutations.length; batchIndex += batchSize) {
      const currentBatchNumber = Math.floor(batchIndex / batchSize) + 1;
      const totalBatches = Math.ceil(planetPermutations.length / batchSize);
      const batchEnd = Math.min(batchIndex + batchSize, planetPermutations.length);
      const batchPermutations = planetPermutations.slice(batchIndex, batchEnd);
      
      // Process batch
      const batchResults = [];
      for (let i = 0; i < batchPermutations.length; i++) {
        const permutation = batchPermutations[i];
        const planetsWithNumbers = permutation.map((planet) => ({
          planet: planet,
          numbers: planetNumbers[planet]
        }));
        
        const permResult = findCombinationsFromPlanetNumbers(
          planetsWithNumbers, 
          permutation, 
          valueRange, 
          minSum, 
          maxSum
        );
        
        batchResults.push(...permResult);
        
        // Update progress frequently
        const elapsedTime = (Date.now() - startTime) / 1000;
        const totalProcessed = batchIndex + i + 1;
        const processingSpeed = totalProcessed / elapsedTime;
        const remainingPermutations = planetPermutations.length - totalProcessed;
        const estimatedTimeRemaining = remainingPermutations / processingSpeed;
        
        if (i % 2 === 0 || i === batchPermutations.length - 1) {
          self.postMessage({
            type: 'progress',
            jobId,
            phase: 'generating',
            totalPermutations: planetPermutations.length,
            permutationIndex: totalProcessed,
            currentBatch: currentBatchNumber,
            totalBatches: totalBatches,
            current: allResults.length + batchResults.length,
            processingSpeed: Math.round(processingSpeed * 100) / 100,
            estimatedTimeRemaining: Math.round(estimatedTimeRemaining)
          });
        }
      }
      
      // Add batch results
      allResults = [...allResults, ...batchResults];
      
      // Send intermediate results
      self.postMessage({
        type: 'intermediate_results',
        jobId,
        results: allResults,
        isComplete: false
      });
    }
    
    // Send final results
    self.postMessage({
      type: 'complete',
      jobId,
      results: allResults,
      totalTime: (Date.now() - startTime) / 1000
    });
    
    console.log(`Worker: Generation complete. ${allResults.length} combinations in ${(Date.now() - startTime) / 1000}s`);
    
  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage({
      type: 'error',
      jobId,
      message: error.message,
      stack: error.stack
    });
  }
};
