import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { planets, houses, planetMappings, getDivisionFromColumn } from '../utils/constants';

function ExcelUpload({ 
  onDataUploaded, 
  icon = '⬆️', 
  showIcon = true, 
  isUploaded = false, 
  formatConfig = null // Add format configuration parameter
}) {
  const [error, setError] = useState(null);

  const validatePlanet = (planet) => {
    return !!planetMappings[planet?.toString().trim()];
  };

  const validateHouse = (house) => {
    return houses.includes(house?.toString().trim());
  };

  const extractHouseFromViboothiDegree = (value) => {
    if (!value) return null;
    
    const valueStr = value.toString().trim();
    
    // Handle viboothi degree format like "9Vi42", "27Pi20", etc.
    const degreeMatch = valueStr.match(/\d+([A-Za-z]{2})\d+/);
    if (degreeMatch) {
      return degreeMatch[1]; // Extract the house abbreviation (Vi, Pi, etc.)
    }
    
    // Handle direct house format if present
    if (houses.includes(valueStr)) {
      return valueStr;
    }
    
    return null;
  };

  const processViboothiFormat = (worksheet, range) => {
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
      'Ketu': 'Ke',
      // ✅ Add common Ketu variations
      'Kethu': 'Ke',
      'KETU': 'Ke',
      'KETHU': 'Ke',
      'ketu': 'Ke',
      'kethu': 'Ke',
      // ✅ Add other Lagna variations (all map to Lg)
      'Bhava Lagna': 'Lg',
      'Hora Lagna': 'Lg',
      'Ghati Lagna': 'Lg',
      'Vighati Lagna': 'Lg',
      'Varnada Lagna': 'Lg',
      'Sree Lagna': 'Lg',
      'Pranapada Lagna': 'Lg',
      'Indu Lagna': 'Lg'
    };
    
    // Get division headers from row 1 (0-based index)
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
    
    // ✅ CONFIGURABLE ROW PROCESSING: Respect formatConfig for row range
    // Default range: rows 2-19 (Excel rows 3-20)
    // UserData range: rows 2-19 (Excel rows 3-20) to include Ketu at row 12
    let startRow = 2; // 0-based: Excel row 3
    let endRow = Math.min(19, range.e.r); // 0-based: Excel row 20 (inclusive)
    
    if (formatConfig && formatConfig.rowRange) {
      startRow = formatConfig.rowRange.start - 1; // Convert to 0-based
      endRow = Math.min(formatConfig.rowRange.end - 1, range.e.r); // Convert to 0-based
      console.log(`🔧 [ExcelUpload] Using custom row range: Excel rows ${formatConfig.rowRange.start}-${formatConfig.rowRange.end} (0-based: ${startRow}-${endRow})`);
    } else {
      console.log(`🔧 [ExcelUpload] Using default row range: Excel rows 3-20 (0-based: ${startRow}-${endRow})`);
    }
    
    console.log('🔍 [ExcelUpload] Processing planet rows...');
    for (let row = startRow; row <= endRow; row++) {
      const planetCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      if (!planetCell || !planetCell.v) continue;
      
      const planetName = planetCell.v.toString().trim();
      console.log(`🔍 [ExcelUpload] Found planet name: "${planetName}" at row ${row + 1}`);
      
      // ✅ Try exact match first, then try case variations
      let planetShort = viboothiPlanetMapping[planetName];
      
      if (!planetShort) {
        // Try case-insensitive lookup
        const planetKey = Object.keys(viboothiPlanetMapping).find(
          key => key.toLowerCase() === planetName.toLowerCase()
        );
        if (planetKey) {
          planetShort = viboothiPlanetMapping[planetKey];
          console.log(`🔍 [ExcelUpload] Found case-insensitive match: "${planetKey}" -> "${planetShort}"`);
        }
      }
      
      console.log(`🔍 [ExcelUpload] Mapped to short code: "${planetShort}"`);
      
      if (!planetShort) {
        console.warn(`❌ [ExcelUpload] Unknown planet: "${planetName}"`);
        console.warn(`❌ [ExcelUpload] Available mappings:`, Object.keys(viboothiPlanetMapping));
        continue;
      }
      
      // ✅ Only process main planets, skip additional Lagna variations for UserData
      const mainPlanets = ['Lg', 'Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
      if (!mainPlanets.includes(planetShort)) {
        console.log(`🔍 [ExcelUpload] Skipping additional planet: "${planetName}" (${planetShort}) - not in main 10`);
        continue;
      }
      
      // ✅ Skip duplicate Lagna entries (only process the first one)
      if (planetShort === 'Lg' && processedData[planetShort]) {
        console.log(`🔍 [ExcelUpload] Skipping duplicate Lagna: "${planetName}"`);
        continue;
      }
      
      processedData[planetShort] = {};
      console.log(`✅ [ExcelUpload] Created data structure for planet: "${planetShort}"`);
      
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
    
    console.log('🔍 [ExcelUpload] Final processed data structure:');
    console.log('  - Total planets processed:', Object.keys(processedData).length);
    console.log('  - Planet keys:', Object.keys(processedData));
    console.log('  - Ketu data check:', processedData.Ke ? 'EXISTS' : 'MISSING');
    if (processedData.Ke) {
      console.log('  - Ketu divisions:', Object.keys(processedData.Ke));
    }
    
    return processedData;
  };

  const validateViboothiFormat = (worksheet, range) => {
    // Viboothi format validation: 9 planets × 24 divisions = 216 data cells
    let dataCount = 0;
    // ✅ FIXED: Include Ketu in expected planets list
    const expectedPlanets = ['Lagna', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const planetRows = [];
    
    // ✅ CONFIGURABLE VALIDATION: Respect formatConfig for row range during validation
    let validationStartRow = 2;
    let validationEndRow = Math.min(10, range.e.r);
    
    if (formatConfig && formatConfig.rowRange) {
      validationStartRow = formatConfig.rowRange.start - 1; // Convert to 0-based
      validationEndRow = Math.min(formatConfig.rowRange.end - 1, range.e.r); // Convert to 0-based, but use reasonable max for validation
      console.log(`🔧 [ExcelUpload] Using custom validation range: Excel rows ${formatConfig.rowRange.start}-${Math.min(formatConfig.rowRange.end, range.e.r + 1)} (0-based: ${validationStartRow}-${validationEndRow})`);
    } else {
      console.log(`🔧 [ExcelUpload] Using default validation range: Excel rows 3-11 (0-based: ${validationStartRow}-${validationEndRow})`);
    }
    
    // Find planet rows (should start from configured row range)
    for (let row = validationStartRow; row <= validationEndRow; row++) {
      const planetCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      if (planetCell && planetCell.v) {
        const planetName = planetCell.v.toString().trim();
        if (expectedPlanets.includes(planetName)) {
          planetRows.push({ row, name: planetName });
        }
      }
    }
    
    // ✅ FLEXIBLE VALIDATION: Allow different planet counts based on formatConfig
    let expectedPlanetCount = 9;
    if (formatConfig && formatConfig.expectedPlanets) {
      expectedPlanetCount = formatConfig.expectedPlanets;
    }
    
    if (planetRows.length < expectedPlanetCount) {
      const foundPlanets = planetRows.map(p => p.name);
      const missingPlanets = expectedPlanets.filter(p => !foundPlanets.includes(p));
      console.warn(`⚠️ [ExcelUpload] Expected ${expectedPlanetCount} planets, found ${planetRows.length}. Missing: ${missingPlanets.join(', ')}`);
      console.warn(`⚠️ [ExcelUpload] Found planets: ${foundPlanets.join(', ')}`);
      
      // Only throw error if critically insufficient (less than 8 planets)
      if (planetRows.length < 8) {
        throw new Error(`Invalid viboothi format. Expected at least 8 planets, found ${planetRows.length}. Missing: ${missingPlanets.join(', ')}`);
      }
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
      
      if (planetDataCount < 20) { // Allow some tolerance for optional divisions
        console.warn(`Warning: ${name} has only ${planetDataCount} divisions (expected ~24)`);
      }
    });
    
    // ✅ FLEXIBLE VALIDATION: Adjust minimum data threshold based on found planets
    const minimumDataCells = Math.max(180, planetRows.length * 20); // At least 20 data cells per planet
    if (dataCount < minimumDataCells) {
      throw new Error(`Insufficient viboothi data. Expected ~${planetRows.length * 24} cells (${planetRows.length} planets × 24 divisions), found ${dataCount} cells.`);
    }
    
    console.log(`✅ Viboothi format validated: ${dataCount} data cells across ${planetRows.length} planets`);
    return dataCount;
  };

  const handleFileUpload = (event) => {
    try {
      setError(null);
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];

          const range = XLSX.utils.decode_range(worksheet['!ref']);

          // Validate viboothi format (9 planets × 24 divisions)
          validateViboothiFormat(worksheet, range);

          // Process viboothi format data
          const processedData = processViboothiFormat(worksheet, range);

          onDataUploaded(processedData, file.name);
          event.target.value = null; // Reset file input
        } catch (error) {
          console.error('Excel processing error:', error);
          setError(error.message);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('File upload error:', error);
      setError(error.message);
    }
  };

  return (
    <label className="cursor-pointer inline-flex items-center">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />
      <span 
        className={`inline-block p-1 rounded hover:bg-gray-100 ${
          isUploaded ? 'text-green-600' : 'text-blue-600'
        }`}
        title={isUploaded ? 'View uploaded data' : 'Upload Excel file'}
      >
        <span className="text-xl">{icon}</span>
      </span>
      {error && (
        <span className="ml-2 text-xs text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

export default ExcelUpload;