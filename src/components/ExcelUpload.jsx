import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { planets, houses, planetMappings, getDivisionFromColumn } from '../utils/constants';

function ExcelUpload({ onDataUploaded, icon = '⬆️', showIcon = true, isUploaded = false }) {
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
  };

  const validateViboothiFormat = (worksheet, range) => {
    // Viboothi format validation: 9 planets × 24 divisions = 216 data cells
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
      
      if (planetDataCount < 20) { // Allow some tolerance for optional divisions
        console.warn(`Warning: ${name} has only ${planetDataCount} divisions (expected ~24)`);
      }
    });
    
    if (dataCount < 180) { // Minimum threshold with tolerance
      throw new Error(`Insufficient viboothi data. Expected ~216 cells (9 planets × 24 divisions), found ${dataCount} cells.`);
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