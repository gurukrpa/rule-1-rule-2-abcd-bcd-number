// Test script for viboothi Excel format validation
const XLSX = require('xlsx');

// Viboothi format validation function
function validateViboothiFormat(worksheet, range) {
  let dataCount = 0;
  const expectedPlanets = ['Lagna', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];
  const planetRows = [];
  
  // Find planet rows (should start from row 2, 0-based)
  for (let row = 2; row <= Math.min(10, range.e.r); row++) {
    const planetCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
    if (planetCell && planetCell.v) {
      const planetName = planetCell.v.toString().trim();
      if (expectedPlanets.includes(planetName)) {
        planetRows.push({ row, name: planetName });
      }
    }
  }
  
  if (planetRows.length !== 9) {
    throw new Error(`Invalid viboothi format. Expected 9 planets, found ${planetRows.length}. Missing: ${expectedPlanets.filter(p => !planetRows.find(pr => pr.name === p)).join(', ')}`);
  }
  
  // Count data cells for each planet (should have 24 divisions)
  planetRows.forEach(({ row, name }) => {
    let planetDataCount = 0;
    for (let col = 1; col <= Math.min(24, range.e.c); col++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
      if (cell && cell.v !== null && cell.v !== undefined && cell.v.toString().trim() !== '') {
        planetDataCount++;
        dataCount++;
      }
    }
    
    if (planetDataCount < 20) {
      console.warn(`Warning: ${name} has only ${planetDataCount} divisions (expected ~24)`);
    }
  });
  
  if (dataCount < 180) {
    throw new Error(`Insufficient viboothi data. Expected ~216 cells (9 planets × 24 divisions), found ${dataCount} cells.`);
  }
  
  console.log(`✅ Viboothi format validated: ${dataCount} data cells across ${planetRows.length} planets`);
  return dataCount;
}

// Extract house from viboothi degree format
function extractHouseFromViboothiDegree(value) {
  if (!value) return null;
  
  const valueStr = value.toString().trim();
  const houses = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];
  
  // Handle viboothi degree format like "9Vi42", "27Pi20", etc.
  const degreeMatch = valueStr.match(/\d+([A-Za-z]{2})\d+/);
  if (degreeMatch) {
    return degreeMatch[1];
  }
  
  // Handle direct house format if present
  if (houses.includes(valueStr)) {
    return valueStr;
  }
  
  return null;
}

// Process viboothi format
function processViboothiFormat(worksheet, range) {
  const processedData = {};
  const viboothiPlanetMapping = {
    'Lagna': 'Lg',
    'Sun': 'Su',
    'Moon': 'Mo', 
    'Mars': 'Ma',
    'Mercury': 'Me',
    'Jupiter': 'Ju',
    'Venus': 'Ve',
    'Saturn': 'Sa',
    'Rahu': 'Ra',
    'Ketu': 'Ke'
  };
  
  // Get division headers from row 0
  const divisionHeaders = [];
  for (let col = 1; col <= range.e.c; col++) {
    const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
    if (headerCell && headerCell.v) {
      let division = headerCell.v.toString().trim();
      // Clean up division names (remove extra text in parentheses)
      division = division.replace(/\s*\([^)]*\)/, '');
      divisionHeaders[col] = division;
    }
  }
  
  // Process planet rows (starting from row 2)
  for (let row = 2; row <= Math.min(10, range.e.r); row++) {
    const planetCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
    if (!planetCell || !planetCell.v) continue;
    
    const planetName = planetCell.v.toString().trim();
    const planetShort = viboothiPlanetMapping[planetName];
    
    if (!planetShort) {
      console.warn(`Unknown planet: ${planetName}`);
      continue;
    }
    
    processedData[planetShort] = {};
    
    // Process each division column
    for (let col = 1; col <= range.e.c; col++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
      if (cell && cell.v) {
        const house = extractHouseFromViboothiDegree(cell.v);
        const division = divisionHeaders[col];
        
        if (house && division) {
          processedData[planetShort][division] = house;
        }
      }
    }
  }
  
  return processedData;
}

// Test with the viboothi file
async function testViboothiFormat() {
  try {
    console.log('🔍 Testing Viboothi Excel Format...');
    
    const filePath = '/Users/gurukrpasharma/Desktop/singapore upload excel sheets for software/viboothi: Vishnu upload excel/april-2025/3-4-2025.xlsx';
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    console.log(`📊 File dimensions: ${range.e.r + 1} rows × ${range.e.c + 1} columns`);
    
    // Validate format
    const dataCount = validateViboothiFormat(worksheet, range);
    
    // Process data
    const processedData = processViboothiFormat(worksheet, range);
    
    console.log('\n📋 Processed Data Summary:');
    console.log(`Planets processed: ${Object.keys(processedData).length}`);
    
    // Show sample data for first few planets
    Object.entries(processedData).slice(0, 3).forEach(([planet, divisions]) => {
      console.log(`${planet}: ${Object.keys(divisions).length} divisions`);
      console.log(`  Sample: ${Object.entries(divisions).slice(0, 3).map(([div, house]) => `${div}=${house}`).join(', ')}`);
    });
    
    console.log('\n✅ Viboothi format test completed successfully!');
    return processedData;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
}

// Run the test
testViboothiFormat();
