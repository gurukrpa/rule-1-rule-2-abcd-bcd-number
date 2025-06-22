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

  const extractHouseFromDegree = (value) => {
    if (!value) return null;
    const match = value.toString().match(/\d+([A-Za-z]{2})\d+/);
    return match ? match[1] : null;
  };

  const validateCellCount = (worksheet, range) => {
    let dataCount = 0;
    
    // Count all cells with data across all rows and columns
    for (let row = 0; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        // Count cell if it has data (not empty, not null, not undefined)
        if (cell && cell.v !== null && cell.v !== undefined && cell.v.toString().trim() !== '') {
          dataCount++;
        }
      }
    }
    
    if (dataCount !== 3030) {
      throw new Error(`Data is missing. Expected 3030 cells with data, found ${dataCount} cells.`);
    }
    
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

          const processedData = {};
          const range = XLSX.utils.decode_range(worksheet['!ref']);

          // Validate that there are exactly 3030 cells with data
          validateCellCount(worksheet, range);

          // Process each row (starting from row 1, skipping header)
          for (let row = 1; row <= range.e.r; row++) {
            const planetCell = worksheet[`A${row + 1}`]; // Add 1 to skip header
            if (!planetCell) continue;

            const planet = (planetCell.w || planetCell.v).toString().trim();
            if (!validatePlanet(planet)) {
              throw new Error(`Invalid planet "${planet}" in row ${row + 1}`);
            }

            const planetShort = planetMappings[planet];

            // Ensure data for this planet is isolated
            if (!processedData[planetShort]) {
              processedData[planetShort] = {};
            }

            // Process each column (starting from column B)
            for (let col = 1; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col }); // Use `row` directly
              const cell = worksheet[cellAddress];

              if (cell) {
                const house = extractHouseFromDegree(cell.w || cell.v);
                if (!house) {
                  throw new Error(`Invalid house format in row ${row + 1}, column ${XLSX.utils.encode_col(col)}`);
                }
                if (!validateHouse(house)) {
                  throw new Error(`Invalid house "${house}" in row ${row + 1}, column ${XLSX.utils.encode_col(col)}`);
                }

                const division = getDivisionFromColumn(col);
                if (division) {
                  // Only update if no manual input exists for this division
                  processedData[planetShort][division] = house;
                }
              }
            }
          }

          onDataUploaded(processedData, file.name); // Pass file name to callback
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