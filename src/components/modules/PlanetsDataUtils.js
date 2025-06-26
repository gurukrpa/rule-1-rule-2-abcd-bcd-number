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

export const extractAvailableTopics = (planetsData) => {
  if (!planetsData?.data?.sets) return [];
  
  return Object.keys(planetsData.data.sets).sort();
};
