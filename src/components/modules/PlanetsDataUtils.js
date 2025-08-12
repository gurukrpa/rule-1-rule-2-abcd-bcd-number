// PlanetsDataUtils.js - Core data processing utilities for Planets Analysis
// Handles data extraction, formatting, and number processing

export const extractElementNumber = (str) => {
  if (typeof str !== 'string') return null;
  const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
  return match ? Number(match[1]) : null;
};

export const formatPlanetData = (rawData) => {
  if (!rawData || typeof rawData !== 'string') return rawData;
  // Extract and format the planet data for display
  return rawData;
};

export const buildTargetData = (excelData, hourData, activeHR) => {
  if (!excelData?.data?.sets || !hourData?.planetSelections) {
    return null;
  }

  const selectedPlanet = hourData.planetSelections[activeHR];
  if (!selectedPlanet) {
    return null;
  }

  console.log(`🎯 [Planets] Building target data for HR${activeHR}, selected planet: ${selectedPlanet}`);

  const targetSets = {};
  
  Object.entries(excelData.data.sets).forEach(([setName, setData]) => {
    const targetElements = {};
    
    Object.entries(setData).forEach(([elementName, planetData]) => {
      const rawData = planetData[selectedPlanet];
      if (rawData) {
        targetElements[elementName] = {
          rawData,
          extractedNumber: extractElementNumber(rawData)
        };
      }
    });
    
    if (Object.keys(targetElements).length > 0) {
      targetSets[setName] = targetElements;
    }
  });

  const result = {
    selectedPlanet,
    sets: targetSets
  };

  console.log(`✅ [Planets] Target data built:`, {
    selectedPlanet,
    setsCount: Object.keys(targetSets).length
  });

  return result;
};

// Natural sorting function for topic names (D-1, D-3, D-10, etc.)
// ✅ FIXED: Now handles annotated topic names like "D-3 (trd) Set-1 Matrix"
const naturalTopicSort = (topics) => {
  return topics.sort((a, b) => {
    // Extract the numeric part from "D-X" pattern (supports annotations)
    const extractNumber = (topic) => {
      // Enhanced pattern: D-NUMBER with optional annotations like (trd), (pv), (sh), (Trd)
      const match = topic.match(/D-(\d+)(?:\s*\([^)]*\))?/);
      return match ? parseInt(match[1], 10) : 0;
    };
    
    // Extract set number (Set-1 vs Set-2)
    const extractSetNumber = (topic) => {
      const match = topic.match(/Set-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };
    
    const numA = extractNumber(a);
    const numB = extractNumber(b);
    
    // First sort by the D-number
    if (numA !== numB) {
      return numA - numB;
    }
    
    // If D-numbers are equal, sort by Set number
    const setA = extractSetNumber(a);
    const setB = extractSetNumber(b);
    
    if (setA !== setB) {
      return setA - setB;
    }
    
    // If both D-number and Set number are equal, sort alphabetically
    return a.localeCompare(b);
  });
};

export const extractAvailableTopics = (planetsData) => {
  if (!planetsData?.data?.sets) return [];
  
  return naturalTopicSort(Object.keys(planetsData.data.sets));
};
