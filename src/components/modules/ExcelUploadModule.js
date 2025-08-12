// ExcelUploadModule.js - Excel upload and processing functionality
// Handles file upload, parsing, and data validation

import * as XLSX from 'xlsx';
import { planetsServiceAdapter } from './PlanetsServiceAdapter';

export const processExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Process the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Process the data into the expected format
        const processedData = processWorksheetData(jsonData);
        
        resolve({
          fileName: file.name,
          data: processedData,
          uploadedAt: new Date().toISOString()
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

const processWorksheetData = (jsonData) => {
  // This function processes the raw Excel data into the expected format
  // The format should match what the application expects:
  // {
  //   sets: {
  //     "TopicName": {
  //       "ElementName": {
  //         "Su": "value", "Mo": "value", etc.
  //       }
  //     }
  //   }
  // }
  
  if (!jsonData || jsonData.length === 0) {
    return { sets: {} };
  }

  const sets = {};
  
  // Find header row (usually the first non-empty row)
  let headerRowIndex = 0;
  while (headerRowIndex < jsonData.length && (!jsonData[headerRowIndex] || jsonData[headerRowIndex].length === 0)) {
    headerRowIndex++;
  }
  
  if (headerRowIndex >= jsonData.length) {
    return { sets: {} };
  }
  
  const headers = jsonData[headerRowIndex];
  const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
  
  // Find planet columns
  const planetColumns = {};
  planets.forEach(planet => {
    const colIndex = headers.findIndex(header => 
      header && header.toString().toLowerCase().includes(planet.toLowerCase())
    );
    if (colIndex !== -1) {
      planetColumns[planet] = colIndex;
    }
  });
  
  // Process data rows
  for (let rowIndex = headerRowIndex + 1; rowIndex < jsonData.length; rowIndex++) {
    const row = jsonData[rowIndex];
    if (!row || row.length === 0) continue;
    
    // Extract topic and element information from the first few columns
    const topicName = row[0] ? row[0].toString().trim() : '';
    const elementName = row[1] ? row[1].toString().trim() : '';
    
    if (!topicName || !elementName) continue;
    
    // Initialize topic if it doesn't exist
    if (!sets[topicName]) {
      sets[topicName] = {};
    }
    
    // Initialize element if it doesn't exist
    if (!sets[topicName][elementName]) {
      sets[topicName][elementName] = {};
    }
    
    // Extract planet data
    Object.entries(planetColumns).forEach(([planet, colIndex]) => {
      const value = row[colIndex];
      if (value !== undefined && value !== null && value !== '') {
        sets[topicName][elementName][planet] = value.toString();
      }
    });
  }
  
  return { sets };
};

export const uploadExcelData = async (userId, date, excelData) => {
  try {
    await planetsServiceAdapter.saveExcelData(userId, date, excelData);
    console.log('✅ Excel data saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving Excel data:', error);
    throw error;
  }
};

export const validateExcelData = (excelData) => {
  if (!excelData || !excelData.data || !excelData.data.sets) {
    return { valid: false, error: 'Invalid Excel data structure' };
  }
  
  const sets = excelData.data.sets;
  const setNames = Object.keys(sets);
  
  if (setNames.length === 0) {
    return { valid: false, error: 'No topics found in Excel data' };
  }
  
  // Check if at least one set has valid data
  for (const setName of setNames) {
    const setData = sets[setName];
    if (Object.keys(setData).length > 0) {
      return { valid: true, topics: setNames.length };
    }
  }
  
  return { valid: false, error: 'No valid topic data found' };
};
