import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import NumberGenTable from './NumberGenTable';
import DataSyncStatus from './DataSyncStatus';

// Add access to Electron IPC if it exists (will be undefined in web-only mode)
const electron = window.electron;

/**
 * NumberGen Component
 * Generates number combinations for selected planets based on three logics:
 * 1. Value Input Range (1-100) - Only includes numbers <= specified range
 * 2. Planet Selection (1-9 Planets) - User selects which planets to include
 * 3. Hierarchical Cycling - Generates combinations with decreasing row counts
 * 
 * Features:
 * - Multi-select planet functionality for each position
 * - Table shows specific planets used for each number combination
 * - Generates appropriate permutations of planets first, then corresponding numbers
 * 
 * Special case handling for Mars, Saturn, Kethu combinations (in any order)
 */

// Helper function to detect if running on an Apple platform
const isApplePlatform = () => {
  // First try to use Electron's platform info if available
  if (window.electron && window.electron.platform) {
    return window.electron.platform.isMac;
  }
  
  // Fallback to user agent detection for web browser
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /macintosh|mac os x|iphone|ipad|ipod/.test(userAgent);
};

// Create initial range filter configuration
const createInitialRangeFilters = () => {
  return Array.from({ length: 10 }, (_, index) => {
    const min = index * 10 + 1;
    const max = (index + 1) * 10;
    return {
      id: `range-${min}-${max}`,
      min,
      max,
      active: false,
      inputValue: 0,
      matchCount: 0 // To track how many combinations match this range
    };
  });
};

const NumberGen = () => {
  console.log("Loading NumberGen component - " + new Date().toISOString());

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

  // State variables
  const [planetCount, setPlanetCount] = useState('');
  const [selectedPlanetsByPosition, setSelectedPlanetsByPosition] = useState([]); // This will now hold arrays of planets
  const [tableResults, setTableResults] = useState([]); // Will now contain objects with numbers and planets
  // User-configurable maxCombinations with unlimited option
  const [maxCombinations, setMaxCombinations] = useState(500); // Default 500, but user can change
  const [unlimitedMode, setUnlimitedMode] = useState(false); // Toggle for unlimited combinations
  const [valueRange, setValueRange] = useState(''); // Value range (1-100)
  const [minSum, setMinSum] = useState(''); // Minimum sum filter (1-500)
  const [maxSum, setMaxSum] = useState(''); // Maximum sum filter (1-500)
  const [rangeFilters, setRangeFilters] = useState(createInitialRangeFilters());
  const [filteredResults, setFilteredResults] = useState([]);
  const [isRangeFilteringActive, setIsRangeFilteringActive] = useState(false);
  
  // Format planet options for react-select
  const planetSelectOptions = Object.keys(planetNumbers).map(planet => ({
    value: planet,
    label: planet
  }));
  
  // Keep the original planetOptions array for compatibility
  const planetOptions = Object.keys(planetNumbers);

  // Initialize planet selectors without default values
  useEffect(() => {
    // Start with an empty array - no planets selected
    setSelectedPlanetsByPosition([]);

    Object.entries(planetNumbers).forEach(([planet, numbers]) => {
      console.log(`${planet} has ${numbers.length} numbers:`, numbers);
    });
    
    // Set up Electron IPC listeners if running in Electron
    if (electron) {
      // Set up listener for settings updates
      electron.receive('number-settings-updated', (result) => {
        console.log('Settings update result:', result);
      });
      
      // Set up listener for loading settings
      electron.receive('number-settings-loaded', (result) => {
        if (result.success && result.settings) {
          console.log('Loaded saved settings:', result.settings);
          
          // Apply the saved settings if they exist
          if (result.settings.valueRange) setValueRange(Number(result.settings.valueRange));
          if (result.settings.minSum) setMinSum(Number(result.settings.minSum));
          if (result.settings.maxSum) setMaxSum(Number(result.settings.maxMax));
          if (result.settings.planetCount) setPlanetCount(Number(result.settings.planetCount));
          // Load range filters if they exist
          if (result.settings.rangeFilters) {
            setRangeFilters(result.settings.rangeFilters);
            setIsRangeFilteringActive(result.settings.rangeFilters.some(r => r.active));
          }
          // Don't set selectedPlanetsByPosition here as it will be handled by the planetCount effect
        }
      });
      
      // Request saved settings from Electron main process
      electron.send('get-number-settings');
    }
  }, []);    

  // Update planet selectors when planet count changes
  useEffect(() => {
    // Skip if planetCount is empty
    if (planetCount === '') {
      setSelectedPlanetsByPosition([]); // Reset to empty array when planetCount is empty
      return;
    }

    // Convert planetCount to number to ensure proper comparison
    const numPlanetCount = Number(planetCount);
    
    if (selectedPlanetsByPosition.length !== numPlanetCount) {
      const newSelectors = [...selectedPlanetsByPosition];

      if (newSelectors.length < numPlanetCount) {
        while (newSelectors.length < numPlanetCount) {
          // Initialize with empty array for multi-select
          newSelectors.push([]);
        }
      } else if (newSelectors.length > numPlanetCount) {
        newSelectors.splice(numPlanetCount);
      }

      setSelectedPlanetsByPosition(newSelectors);
      setTableResults([]);
    }
  }, [planetCount, selectedPlanetsByPosition.length]);

  // Effect to sync settings with Electron when they change
  useEffect(() => {
    // Only send updates if electron is available and component has mounted (not first render)
    if (electron && selectedPlanetsByPosition.length > 0) {
      electron.send('update-number-settings', {
        valueRange: valueRange,
        minSum: minSum,
        maxSum: maxSum,
        planetCount: planetCount,
        selectedPlanets: selectedPlanetsByPosition,
        rangeFilters: rangeFilters
      });
    }
  }, [valueRange, minSum, maxSum, planetCount, rangeFilters]); // Don't include selectedPlanetsByPosition to avoid excessive updates

  // Add Apple-specific UI enhancements
  useEffect(() => {
    // Only apply Apple-specific enhancements if running on an Apple platform
    if (isApplePlatform()) {
      // Add an extra class to inputs for Apple styling if running on Apple platform
      const numericInputs = document.querySelectorAll('input[type="number"]');
      numericInputs.forEach(input => {
        input.classList.add('apple-input');
        
        // Add special handling for Apple numeric keyboards
        input.addEventListener('focus', () => {
          // On Apple devices, select all text when focusing on input
          setTimeout(() => input.select(), 10);
        });
      });
      
      // Add Apple-specific styles
      const style = document.createElement('style');
      style.innerHTML = `
        .apple-input::-webkit-inner-spin-button,
        .apple-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        .apple-input {
          -webkit-appearance: none;
          appearance: textfield;
        }
      `;
      document.head.appendChild(style);
      
      // Return cleanup function
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  // Generate Apple-specific button classes for styling
  const getButtonClass = (type) => {
    // Use the isApplePlatform helper to determine appropriate styling
    const baseClass = "px-6 py-3 text-lg font-semibold rounded-full shadow-md";
    const appleDevice = isApplePlatform();
    
    // Apply Apple-specific styling if running on macOS or iOS
    if (type === 'generate') {
      return appleDevice
        ? `${baseClass} bg-blue-500 text-white hover:bg-blue-600`
        : `${baseClass} bg-green-500 text-white hover:bg-green-600`;
    } else if (type === 'reset') {
      return appleDevice
        ? `${baseClass} bg-gray-200 text-gray-800 hover:bg-gray-300`
        : `${baseClass} bg-red-100 text-red-800 hover:bg-red-200`;
    }
    
    return baseClass;
  };

  const handlePlanetChange = (index, selectedOptions) => {
    console.log(`Planet Change for index ${index}:`, selectedOptions);
    const newSelectedPlanets = [...selectedPlanetsByPosition];
    // Extract the planet names from the selected options
    newSelectedPlanets[index] = selectedOptions ? selectedOptions.map(option => option.value) : [];
    console.log('New planet selection state:', newSelectedPlanets);
    setSelectedPlanetsByPosition(newSelectedPlanets);
  };

  const generateTableNumbers = () => {
    console.log('=== GENERATE TABLE NUMBERS STARTED ===');
    console.log('Planet count:', planetCount);
    console.log('Value range:', valueRange);
    console.log('Min sum:', minSum, 'Max sum:', maxSum);
    console.log('selectedPlanetsByPosition length:', selectedPlanetsByPosition.length);
    console.log('selectedPlanetsByPosition:', selectedPlanetsByPosition);
    
    console.log('Generating combinations from selected planets');
    console.log('Selected planets:', selectedPlanetsByPosition);
    console.log('Value range:', valueRange);
    console.log('Sum range filter:', `${minSum} to ${maxSum}`);
    
    // Handle empty values with default validation values for generation only
    const minSumNum = minSum === '' ? 1 : Number(minSum);
    const maxSumNum = maxSum === '' ? 150 : Number(maxSum);
    
    // Validate inputs
    if (isNaN(minSumNum) || isNaN(maxSumNum)) {
      alert('Error: Sum range values must be valid numbers');
      return;
    }
    
    // Handle empty value range
    if (valueRange === '') {
      console.log('VALIDATION FAILED: Empty value range');
      alert('Please enter a Value Range before generating combinations');
      return;
    }
    
    // Handle empty planet count
    if (planetCount === '') {
      console.log('VALIDATION FAILED: Empty planet count');
      alert('Please enter the Number of Planets before generating combinations');
      return;
    }
    
    // Check if all planet selectors have at least one selection
    console.log('Checking for empty positions...');
    const emptyPositions = selectedPlanetsByPosition
      .map((planets, index) => ({ position: index + 1, planets }))
      .filter(pos => !pos.planets || pos.planets.length === 0);
    
    console.log('Empty positions found:', emptyPositions);
    
    if (emptyPositions.length > 0) {
      const emptyPositionNumbers = emptyPositions.map(pos => pos.position).join(', ');
      console.log('VALIDATION FAILED: Empty positions at:', emptyPositionNumbers);
      alert(`Please select at least one planet for position(s): ${emptyPositionNumbers}`);
      return;
    }
    
    console.log('VALIDATION PASSED: All positions have planets selected');
    
    // Ensure minSum is not greater than maxSum
    if (minSumNum > maxSumNum) {
      alert('Error: Minimum sum cannot be greater than maximum sum');
      return;
    }
    
    // Update state with validated numbers
    setMinSum(minSumNum);
    setMaxSum(maxSumNum);

    if (selectedPlanetsByPosition.length > 5) {
      alert("Selecting more than 5 planets may cause performance issues. Consider reducing the number of planets.");
    }

    // Additional validation for multi-select - check if there are too many possible combinations
    const totalCombinations = selectedPlanetsByPosition.reduce((acc, planets) => acc * planets.length, 1);
    if (!unlimitedMode && totalCombinations > 500) {
      const confirm = window.confirm(`Your selection would generate approximately ${totalCombinations} combinations, which might slow down your browser. Do you want to continue?`);
      if (!confirm) return;
    } else if (unlimitedMode && totalCombinations > 10000) {
      const confirm = window.confirm(`⚠️ UNLIMITED MODE: Your selection could generate ${totalCombinations}+ combinations! This might freeze your browser for a long time. Are you sure you want to continue?`);
      if (!confirm) return;
    }

    try {
      // Generate all permutations of selected planets
      const planetPermutations = generatePlanetPermutations();
      console.log('Generated planet permutations:', planetPermutations.length);
      
      if (planetPermutations.length === 0) {
        console.error('No planet permutations generated');
        alert('No combinations possible. Please ensure all planet positions have at least one planet selected.');
        return;
      }
      
      if (planetPermutations.length > 100) {
        console.warn(`Large number of permutations (${planetPermutations.length}). This may take time to process.`);
        if (!confirm(`There are ${planetPermutations.length} possible planet combinations. This may take a while to process. Continue?`)) {
          return;
        }
      }
      
      // Process each permutation and collect all results
      let allResults = [];
      
      for (const permutation of planetPermutations) {
        const planetsWithNumbers = permutation.map((planet) => ({
          planet: planet,
          numbers: planetNumbers[planet]
        }));

        console.log('Processing permutation:', permutation);
        
        const permResult = findCombinationsFromPlanetNumbers(planetsWithNumbers, permutation);
        allResults = [...allResults, ...permResult];
        
        // Limit total results for performance (only if not in unlimited mode)
        if (!unlimitedMode && allResults.length >= maxCombinations) {
          console.warn(`Reached maximum combinations limit (${maxCombinations}). Stopping processing.`);
          break;
        }
      }
      
      // Sort and limit results
      allResults.sort((a, b) => {
        // MODIFIED: Sort by first (leftmost) value first, then second, etc. for left-to-right priority
        for (let i = 0; i < a.numbers.length; i++) {
          if (a.numbers[i] !== b.numbers[i]) return a.numbers[i] - b.numbers[i];
        }
        return 0;
      });
      
      allResults = unlimitedMode ? allResults : allResults.slice(0, maxCombinations);
      
      console.log('Generated results:', allResults.length, 'combinations');
      console.log('=== LEFT-TO-RIGHT ASCENDING ORDERING TEST ===');
      
      if (allResults.length > 0) {
        console.log('First few combinations (should show LEFT-TO-RIGHT ascending ordering):');
        allResults.slice(0, 5).forEach((result, index) => {
          console.log(`  ${index + 1}: [${result.numbers.join(', ')}] - planets: [${result.planets.join(', ')}]`);
        });
      }

      if (allResults.length === 0) {
        console.log("No valid combinations found. This may be because:");
        console.log("1. The selected planets don't have numbers in the specified range");
        console.log("2. The sum constraints (min/max) are too restrictive");
        console.log("3. There's an issue with the combination algorithm");
      }

      setTableResults(allResults);
      
      // Apply range filters to the new results
      const filtered = applyRangeFilters(allResults);
      setFilteredResults(filtered);
    } catch (error) {
      console.error("Error in generateTableNumbers:", error);
      alert("There was an error generating combinations. Please try with different planets.");
    }
  };

  const findCombinationsFromPlanetNumbers = (planetsWithNumbers, sourcePlanets) => {
    const results = [];
    
    // Ensure minSum and maxSum are valid numbers for processing
    const processMinSum = minSum === '' ? 1 : Number(minSum) || 1; // Default to 1 if empty or not a valid number
    const processMaxSum = maxSum === '' ? 150 : Number(maxSum) || 150; // Default to 150 if empty or not a valid number

    console.log('Finding combinations using position-based planet order with LEFT-TO-RIGHT ascending numbers');
    console.log('Number of planets:', planetsWithNumbers.length);
    console.log('Source planets (in POSITION-BASED order):', sourcePlanets);
    console.log('Using sum range for calculations:', `${processMinSum} to ${processMaxSum}`);
    console.log('Value range limit:', valueRange);
    console.log('NOTE: Planets maintain their position order, Numbers will increase from LEFT to RIGHT');

    // Filter numbers based on valueRange and sort
    const filteredPlanets = planetsWithNumbers.map(p => ({
      planet: p.planet,
      numbers: p.numbers.filter(num => num <= valueRange).sort((a, b) => a - b)
    }));

    console.log('Filtered planets (maintaining position order):');
    filteredPlanets.forEach((p, index) => {
      console.log(`Position ${index + 1} (${p.planet}): ${p.numbers.length} numbers (${p.numbers.slice(0, 5).join(', ')}${p.numbers.length > 5 ? '...' : ''})`);
    });

    // Check if any planet has no valid numbers
    const emptyPlanet = filteredPlanets.find(p => p.numbers.length === 0);
    if (emptyPlanet) {
      console.error(`Planet ${emptyPlanet.planet} has no numbers within range 1-${valueRange}`);
      alert(`Unable to generate combinations: ${emptyPlanet.planet} has no valid numbers within range 1-${valueRange}.`);
      return [];
    }

    // Use generic algorithm for all planet combinations (position-based ordering)
    const generateCombinations = (currentIndex, currentCombination, currentSum = 0) => {
        // If we've reached the end, check sum constraints before adding
        if (currentIndex === filteredPlanets.length) {
          const combinationSum = currentCombination.reduce((sum, num) => sum + num, 0);
          if (combinationSum >= processMinSum && combinationSum <= processMaxSum) {
            // Store numbers and planets together
            results.push({
              numbers: [...currentCombination],
              planets: sourcePlanets
            });
          }
          return;
        }
        
        const currentPlanet = filteredPlanets[currentIndex];
        // MODIFIED: For left-to-right ascending ordering, get previous number for comparison
        const prevNumber = currentIndex > 0 ? currentCombination[currentIndex - 1] : -Infinity;
        
        // Calculate the minimum possible sum for remaining planets (optimization)
        let minPossibleSum = currentSum;
        let remainingMinValues = 0;
        for (let i = currentIndex; i < filteredPlanets.length; i++) {
          if (filteredPlanets[i].numbers.length > 0) {
            remainingMinValues += filteredPlanets[i].numbers[0]; // Add minimum value from each remaining planet
          }
        }
        
        for (const num of currentPlanet.numbers) {
          // MODIFIED: For left-to-right ascending ordering, check if current number is greater than previous number
          // This ensures numbers increase from left to right
          if (num > prevNumber) {
            // Early pruning: Skip if even with minimal possible values for remaining planets, 
            // we would exceed maxSum
            const newSum = currentSum + num;
            const estimatedTotalSum = newSum + remainingMinValues - currentPlanet.numbers[0];
            
            if (estimatedTotalSum <= processMaxSum) {
              currentCombination[currentIndex] = num;
              generateCombinations(currentIndex + 1, currentCombination, newSum);
              
              if (!unlimitedMode && results.length >= maxCombinations) return;
            }
          }
        }
      };

      generateCombinations(0, Array(filteredPlanets.length).fill(0), 0);

    // Sort by planet order - MODIFIED: for left-to-right priority, sort by leftmost planet first
    results.sort((a, b) => {
      // Compare each planet's value in order (leftmost first)
      for (let i = 0; i < a.numbers.length; i++) {
        if (a.numbers[i] !== b.numbers[i]) {
          // For the first planet that differs, sort by its number in ascending order
          return a.numbers[i] - b.numbers[i];
        }
      }
      return 0; // If all numbers are the same
    });
    
    console.log('Sorted results based on LEFT-TO-RIGHT position hierarchy (POSITION-BASED ORDER):', results);
    console.log('Sample combinations (POSITION-BASED planets, LEFT-TO-RIGHT ascending numbers):');
    if (results.length > 0) {
      results.slice(0, 5).forEach((result, index) => {
        console.log(`  ${index + 1}: [${result.numbers.join(', ')}] - planets: [${result.planets.join(', ')}]`);
      });
    }
    return unlimitedMode ? results : results.slice(0, maxCombinations);
  };

  // Helper function to get a nice display name for planets
  const getDisplayNameForPlanet = (planet) => {
    // Map of shortened planet names to their full names
    const planetDisplayNames = {
      'Sun': 'Sun',
      'Moon': 'Moon',
      'Mars': 'Mars',
      'Mercury': 'Mercury',
      'Jupiter': 'Jupiter',
      'Venus': 'Venus',
      'Saturn': 'Saturn',
      'Rahu': 'Rahu',
      'Kethu': 'Kethu'
    };
    
    return planetDisplayNames[planet] || planet;
  };
  
  const resetFilters = () => {
    setTableResults([]);
    setFilteredResults([]);
    setValueRange('');
    setMinSum('');
    setMaxSum('');
    setPlanetCount(''); // Reset planet count to empty
    setRangeFilters(createInitialRangeFilters());
    setIsRangeFilteringActive(false);
    
    // If running in Electron, update the settings in the main process
    if (electron) {
      electron.send('update-number-settings', {
        valueRange: '',
        minSum: '',
        maxSum: '',
        planetCount: '',
        rangeFilters: createInitialRangeFilters()
      });
    }
  };
  
  // Apply range filters to combinations
  const applyRangeFilters = (combinations) => {
    // Check if any range filters are active
    const hasActiveFilters = rangeFilters.some(range => range.active);
    setIsRangeFilteringActive(hasActiveFilters);
    
    if (!hasActiveFilters) {
      // If no filters are active, return all combinations
      return combinations;
    }

    // Calculate match statistics for each range
    const updatedRangeFilters = rangeFilters.map(range => {
      // Count how many combinations would be excluded by this filter
      let matchCount = 0;
      
      // Go through each combination
      for (const combo of combinations) {
        // Count how many numbers in this combination fall within the current range
        const numbersInRange = combo.numbers.filter(n => n >= range.min && n <= range.max).length;
        
        // For active ranges, count combinations that would be excluded (have too many matches)
        // For inactive ranges, count combinations that have at least one number in range
        if ((range.active && numbersInRange >= range.inputValue) || 
            (!range.active && numbersInRange > 0)) {
          matchCount++;
        }
      }
      
      return {
        ...range,
        matchCount
      };
    });
    setRangeFilters(updatedRangeFilters);

    // Apply all active range filters
    return combinations.filter(combo => {
      return rangeFilters.every(range => {
        if (!range.active) return true; // Skip inactive filters
        
        // Count how many numbers in this combination fall within this range
        const numbersInRange = combo.numbers.filter(n => n >= range.min && n <= range.max).length;
        
        // Remove combinations that have at least the required number of values from this range
        // For example, if inputValue is 3, remove combinations with 3 or more numbers in this range
        return numbersInRange < range.inputValue;
      });
    });
  };

  // Handler to toggle a range filter
  const toggleRangeFilter = (rangeId) => {
    const updatedFilters = rangeFilters.map(range => 
      range.id === rangeId ? { ...range, active: !range.active } : range
    );
    setRangeFilters(updatedFilters);
    
    // Re-filter results
    if (tableResults.length > 0) {
      const newFilteredResults = applyRangeFilters(tableResults);
      setFilteredResults(newFilteredResults);
    }
  };

  // Handler to update a range filter input value
  const updateRangeFilterValue = (rangeId, value) => {
    // Ensure value is between 0 and 6
    const sanitizedValue = Math.min(6, Math.max(0, parseInt(value) || 0));
    
    const updatedFilters = rangeFilters.map(range => 
      range.id === rangeId ? { ...range, inputValue: sanitizedValue } : range
    );
    setRangeFilters(updatedFilters);
    
    // Re-filter results
    if (tableResults.length > 0) {
      const newFilteredResults = applyRangeFilters(tableResults);
      setFilteredResults(newFilteredResults);
    }
  };

  // Bulk operations for range filters
  const disableAllRangeFilters = () => {
    const updatedFilters = rangeFilters.map(range => ({ ...range, active: false }));
    setRangeFilters(updatedFilters);
    setIsRangeFilteringActive(false);
    setFilteredResults(tableResults);
  };

  const setAllRangeFiltersTo = (value) => {
    // Ensure value is between 0 and 6
    const sanitizedValue = Math.min(6, Math.max(0, parseInt(value) || 0));
    
    const updatedFilters = rangeFilters.map(range => ({ 
      ...range,
      inputValue: sanitizedValue 
    }));
    setRangeFilters(updatedFilters);
    
    // Re-filter results
    if (tableResults.length > 0) {
      const newFilteredResults = applyRangeFilters(tableResults);
      setFilteredResults(newFilteredResults);
    }
  };

  // Recursive function to generate the Cartesian product of arrays
  const cartesianProduct = (arrays) => {
    // Base case: if no arrays, return empty array
    if (arrays.length === 0) return [[]];
    
    // Check if any array is empty - if so, cartesian product is empty
    if (arrays.some(arr => !arr || arr.length === 0)) {
      console.warn('Cartesian product: One or more arrays are empty, returning empty result');
      return [];
    }
    
    // Get the Cartesian product of all arrays except the first
    const restProduct = cartesianProduct(arrays.slice(1));
    
    // Combine the first array with the product of the rest
    const result = [];
    for (const item of arrays[0]) {
      for (const items of restProduct) {
        result.push([item, ...items]);
      }
    }
    
    return result;
  };

  // Generate all permutations of planets based on multi-select
  const generatePlanetPermutations = () => {
    // Return empty array if no planets selected
    if (selectedPlanetsByPosition.length === 0) {
      console.warn('No planet positions defined');
      return [];
    }
    
    // Log selected planets for debugging
    console.log("Selected planets by position:");
    selectedPlanetsByPosition.forEach((planets, index) => {
      console.log(`Position ${index + 1}:`, planets);
    });
    
    // Check for empty positions
    const emptyPositions = selectedPlanetsByPosition
      .map((planets, index) => ({ index, planets }))
      .filter(pos => !pos.planets || pos.planets.length === 0);
    
    if (emptyPositions.length > 0) {
      console.warn('Empty planet selections found at positions:', 
        emptyPositions.map(pos => pos.index + 1));
      return [];
    }
    
    // Calculate total possible combinations
    const totalPossibleCombos = selectedPlanetsByPosition.reduce(
      (acc, planets) => acc * (planets.length || 1), 1
    );
    console.log(`Total possible planet permutations: ${totalPossibleCombos}`);
    
    // Return all permutations (cartesian product) and maintain position-based order
    const permutations = cartesianProduct(selectedPlanetsByPosition);
    
    // FIXED: Keep original position-based order instead of sorting alphabetically
    // Each permutation maintains the user's intended planet-to-position mapping
    console.log('Generated permutations (maintaining position-based order):');
    permutations.forEach((perm, index) => {
      if (index < 5) { // Only log first 5 for brevity
        console.log(`  Permutation ${index + 1}: [${perm.join(', ')}] (Position 1: ${perm[0]}, Position 2: ${perm[1]}, etc.)`);
      }
    });
    
    console.log(`Generated ${permutations.length} planet permutations (POSITION-BASED ORDER)`);
    console.log('NOTE: Each position maintains its selected planet (no alphabetical sorting)');
    
    return permutations;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Number Generator</h1>
        <div className="flex gap-2">

          <Link 
            to="/users" 
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            Back to Users
          </Link>
        </div>
      </div>

      {/* Add DataSyncStatus component */}
      <DataSyncStatus />

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Settings Section */}
        <div className="flex flex-col md:flex-row border-2 border-blue-500 rounded-md p-4 mb-4">
          <div className="w-full md:w-1/2 p-2">
            <h3 className="font-bold text-lg mb-2">Number of Planets (1-9)</h3>
            <input
              type="number"
              min="1"
              max="9"
              className="w-full border-2 border-green-500 rounded p-2"
              value={planetCount}
              onChange={(e) => {
                // Allow empty string value
                if (e.target.value === '') {
                  setPlanetCount('');
                  return;
                }
                setPlanetCount(Number(e.target.value));
              }}
            />
          </div>
          <div className="w-full md:w-1/2 p-2">
            <h3 className="font-bold text-lg mb-2">Value Range (1-100)</h3>
            <input
              type="number"
              min="1"
              max="100"
              className="w-full border-2 border-green-500 rounded p-2"
              value={valueRange}
              onChange={(e) => {
                // Allow empty string value
                if (e.target.value === '') {
                  setValueRange('');
                  return;
                }
                const value = Number(e.target.value);
                setValueRange(Math.max(1, Math.min(100, value)));
              }}
            />
          </div>
        </div>
        
        {/* Sum Filter Section */}
        <div className="flex flex-col md:flex-row border-2 border-blue-500 rounded-md p-4 mb-4">
          <div className="w-full md:w-1/2 p-2">
            <h3 className="font-bold text-lg mb-2">Minimum Sum</h3>
            <input
              type="number"
              min="0"
              max="500"
              className="w-full border-2 border-green-500 rounded p-2"
              value={minSum}
              onChange={(e) => {
                // Allow empty string for Apple's input handling
                if (e.target.value === '') {
                  setMinSum('');
                  return;
                }
                
                const value = Number(e.target.value);
                // Use null coalescing to handle NaN values
                const sanitizedValue = isNaN(value) ? 0 : value;
                // Allow any value between 0 and 500
                setMinSum(Math.min(500, Math.max(0, sanitizedValue)));
              }}
              // Handle blur to ensure we have a valid number when focus leaves
              onBlur={() => {
                if (isNaN(Number(minSum)) && minSum !== '') {
                  setMinSum('');
                }
              }}
            />
          </div>
          <div className="w-full md:w-1/2 p-2">
            <h3 className="font-bold text-lg mb-2">Maximum Sum</h3>
            <input
              type="number"
              min="0"
              max="500"
              className="w-full border-2 border-green-500 rounded p-2"
              value={maxSum}
              onChange={(e) => {
                // Allow empty string for Apple's input handling
                if (e.target.value === '') {
                  setMaxSum('');
                  return;
                }
                
                const value = Number(e.target.value);
                // Use null coalescing to handle NaN values
                const sanitizedValue = isNaN(value) ? 0 : value;
                // Allow any value between 0 and 500
                setMaxSum(Math.min(500, Math.max(0, sanitizedValue)));
              }}
              // Handle blur to ensure we have a valid number when focus leaves
              onBlur={() => {
                if (isNaN(Number(maxSum)) && maxSum !== '') {
                  setMaxSum('');
                }
              }}
            />
          </div>
        </div>
        
        {/* Max Combinations Control Section */}
        <div className="flex flex-col md:flex-row border-2 border-purple-500 rounded-md p-4 mb-4 bg-purple-50">
          <div className="w-full md:w-1/2 p-2">
            <h3 className="font-bold text-lg mb-2 text-purple-800">Maximum Combinations</h3>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="unlimitedMode"
                checked={unlimitedMode}
                onChange={(e) => setUnlimitedMode(e.target.checked)}
                className="w-4 h-4 text-purple-600"
              />
              <label htmlFor="unlimitedMode" className="text-sm font-medium text-purple-700">
                Unlimited Mode (Generate all possible combinations)
              </label>
            </div>
            {!unlimitedMode && (
              <input
                type="number"
                min="1"
                max="10000"
                className="w-full border-2 border-purple-500 rounded p-2"
                value={maxCombinations}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value > 0) {
                    setMaxCombinations(value);
                  }
                }}
                placeholder="Enter max combinations (e.g., 500, 1000)"
              />
            )}
          </div>
          <div className="w-full md:w-1/2 p-2">
            <h3 className="font-bold text-lg mb-2 text-purple-800">Performance Warning</h3>
            <div className="text-sm text-purple-700 space-y-1">
              <p>⚠️ <strong>Unlimited mode</strong> may generate thousands of combinations</p>
              <p>🐌 Large numbers can slow down your browser</p>
              <p>💡 Recommended: Start with 1000-5000 for testing</p>
              {unlimitedMode && (
                <p className="text-red-600 font-semibold">🚨 UNLIMITED MODE ACTIVE - No limits applied!</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Planet Selector Section */}
        <div className="border-2 border-blue-500 rounded-md overflow-hidden mb-4">
          <div className="flex flex-wrap">
            {Number(planetCount) > 0 ? 
              Array.from({ length: Number(planetCount) }).map((_, index) => (
                <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-auto border-b border-r border-blue-300 last:border-r-0">
                  <div className="bg-blue-100 p-2 text-center font-semibold border-b border-blue-300">
                    Planet {index + 1}
                  </div>
                  <div className="p-2 bg-teal-100">
                    <Select
                      isMulti
                      className="planet-select"
                      placeholder="Select planets..."
                      options={planetSelectOptions}
                      value={selectedPlanetsByPosition[index]?.map(value => 
                        planetSelectOptions.find(opt => opt.value === value)
                      ) || []}
                      onChange={(selectedOptions) => handlePlanetChange(index, selectedOptions)}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: '#4ade80',
                          '&:hover': { borderColor: '#16a34a' },
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: '#d1fae5',
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: '#065f46',
                          fontWeight: 500,
                        })
                      }}
                    />
                  </div>
                </div>
              )) : null
            }
          </div>
        </div>
        
        {/* Multi-Range Filter Section */}
        <div className="border-2 border-blue-500 rounded-md p-4 mb-4">
          <div className="flex flex-row justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Number Range Filters</h3>
            <div className="flex gap-2">
              <button 
                onClick={disableAllRangeFilters}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
              >
                Disable All
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm">Set All To:</span>
                <select 
                  className="border rounded px-2 py-1"
                  onChange={(e) => setAllRangeFiltersTo(e.target.value)}
                >
                  {[0,1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3">
            {rangeFilters.map((range) => (
              <div 
                key={range.id} 
                className={`border p-3 rounded-md ${range.active ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium text-sm">{range.min}-{range.max}</label>
                  <button 
                    onClick={() => toggleRangeFilter(range.id)}
                    className={`w-8 h-5 rounded-full flex items-center transition-all duration-300 ${range.active ? 'bg-blue-500 justify-end' : 'bg-gray-300 justify-start'}`}
                  >
                    <span className="block w-4 h-4 bg-white rounded-full shadow mx-0.5"></span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="0" 
                    max="6" 
                    className={`w-full border rounded p-1 text-center ${!range.active && 'opacity-50'}`}
                    value={range.inputValue} 
                    onChange={(e) => updateRangeFilterValue(range.id, e.target.value)}
                    disabled={!range.active}
                    title={`Exclude combinations with this many or more numbers in ${range.min}-${range.max} range`}
                  />
                  <span className="text-xs text-gray-500">{tableResults.length > 0 ? `${range.matchCount}/${tableResults.length}` : '0/0'}</span>
                </div>
              </div>
            ))}
          </div>

          {isRangeFilteringActive && tableResults.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
              <p className="font-medium">
                Showing {filteredResults.length} of {tableResults.length} combinations after range filtering
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Each number represents the count of numbers to exclude combinations from that range
              </p>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
          <button
            className={getButtonClass('generate')}
            onClick={() => {
              console.log('Generate button clicked');
              generateTableNumbers();
            }}
          >
            Generate Combinations
          </button>
          
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            onClick={() => {
              console.log('=== DEBUG STATE ===');
              console.log('Planet Count:', planetCount);
              console.log('Value Range:', valueRange);
              console.log('Min Sum:', minSum);
              console.log('Max Sum:', maxSum);
              console.log('Selected Planets by Position:', selectedPlanetsByPosition);
              console.log('selectedPlanetsByPosition.length:', selectedPlanetsByPosition.length);
              
              // Check for empty positions like the validation does
              const emptyPositions = selectedPlanetsByPosition
                .map((planets, index) => ({ position: index + 1, planets }))
                .filter(pos => !pos.planets || pos.planets.length === 0);
              console.log('Empty positions (debug check):', emptyPositions);
              
              console.log('Table Results Length:', tableResults.length);
              console.log('=== END DEBUG ===');
              alert(`Debug info logged to console. Empty positions: ${emptyPositions.length > 0 ? emptyPositions.map(p => p.position).join(', ') : 'None'}`);
            }}
          >
            Debug State
          </button>
          
          <button
            className={getButtonClass('reset')}
            onClick={resetFilters}
          >
            Reset All Filters
          </button>
        </div>
        
        {/* Results Section - Always show the table component */}
        <NumberGenTable
          combinations={tableResults && tableResults.length > 0 ? (isRangeFilteringActive ? filteredResults : tableResults) : []}
          onDeleteCombination={() => {}} // Add empty handler for now
          onClearAll={() => setTableResults([])} // Add clear all handler
        />
        
        {/* No Results Message - Show when results are empty after generation attempt */}
        {tableResults && tableResults.length === 0 && planetCount && valueRange && (
          <div className="text-center py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">No Combinations Generated</h3>
              <p className="text-yellow-700 mb-4">
                No valid combinations were found with the current settings.
              </p>
              <div className="text-sm text-yellow-600">
                <p>Possible reasons:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Not all planet positions have planets selected</li>
                  <li>The value range is too restrictive</li>
                  <li>The sum constraints (min/max) are too narrow</li>
                  <li>Selected planets don't have numbers that meet the criteria</li>
                </ul>
                <p className="mt-3 font-medium">Try:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Selecting planets for all positions</li>
                  <li>Increasing the value range</li>
                  <li>Adjusting the sum range</li>
                  <li>Using the Debug State button to check your selections</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NumberGen;
