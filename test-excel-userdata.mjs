#!/usr/bin/env node

/**
 * Test Excel File Validation for UserData Page
 * This script will try to read and validate your specific Excel file
 * using the same logic as the UserData page ExcelUpload component
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const EXCEL_FILE_PATH = '/Users/gurukrpasharma/Desktop/singapore upload excel sheets for software/viboothi: Vishnu upload excel/july/3-7-25.xlsx';

console.log('🧪 TESTING EXCEL FILE FOR USERDATA PAGE');
console.log('='.repeat(60));
console.log(`📂 File: ${EXCEL_FILE_PATH}`);

// Check if file exists
if (!fs.existsSync(EXCEL_FILE_PATH)) {
  console.log('❌ File not found!');
  console.log('   Please check the file path and make sure the file exists.');
  process.exit(1);
}

console.log('✅ File found, proceeding with analysis...\n');

try {
  // Read the Excel file
  const workbook = XLSX.readFile(EXCEL_FILE_PATH);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  console.log(`📊 BASIC FILE INFO:`);
  console.log(`   Sheet name: ${workbook.SheetNames[0]}`);
  console.log(`   Total rows: ${range.e.r + 1}`);
  console.log(`   Total columns: ${range.e.c + 1}`);
  console.log(`   Range: ${worksheet['!ref']}\n`);
  
  // Analyze structure similar to ExcelUpload component
  console.log(`🔍 STRUCTURE ANALYSIS:`);
  
  // Check row 0 for division headers
  console.log(`\n📋 Row 0 (Division Headers):`);
  const divisionHeaders = [];
  for (let col = 1; col <= Math.min(25, range.e.c); col++) {
    const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
    if (headerCell && headerCell.v) {
      let division = headerCell.v.toString().trim();
      // Clean up division names (remove extra text in parentheses)
      division = division.replace(/\s*\([^)]*\)/, '');
      divisionHeaders[col] = division;
      console.log(`   Column ${String.fromCharCode(65 + col)}: "${division}"`);
    }
  }
  
  // Find planet rows (should start from row 2, 0-based)
  console.log(`\n🌍 PLANET ROWS (starting from row 2):`);
  const expectedPlanets = ['Lagna', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];
  const planetRows = [];
  
  for (let row = 2; row <= Math.min(12, range.e.r); row++) {
    const planetCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
    if (planetCell && planetCell.v) {
      const planetName = planetCell.v.toString().trim();
      console.log(`   Row ${row + 1}: "${planetName}" ${expectedPlanets.includes(planetName) ? '✅' : '❓'}`);
      if (expectedPlanets.includes(planetName)) {
        planetRows.push({ row, name: planetName });
      }
    }
  }
  
  console.log(`\n📈 VALIDATION RESULTS:`);
  console.log(`   Expected planets: ${expectedPlanets.length}`);
  console.log(`   Found planets: ${planetRows.length}`);
  console.log(`   Status: ${planetRows.length === 9 ? '✅ VALID' : '❌ INVALID'}`);
  
  if (planetRows.length !== 9) {
    const missing = expectedPlanets.filter(p => !planetRows.find(pr => pr.name === p));
    console.log(`   Missing planets: ${missing.join(', ')}`);
  }
  
  // Count data cells for each planet
  console.log(`\n📊 DATA CELL ANALYSIS:`);
  let totalDataCount = 0;
  
  planetRows.forEach(({ row, name }) => {
    let planetDataCount = 0;
    const sampleData = [];
    
    for (let col = 1; col <= Math.min(24, range.e.c); col++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
      if (cell && cell.v !== null && cell.v !== undefined && cell.v.toString().trim() !== '') {
        planetDataCount++;
        totalDataCount++;
        
        // Collect first 3 samples for display
        if (sampleData.length < 3) {
          sampleData.push(cell.v.toString().trim());
        }
      }
    }
    
    console.log(`   ${name}: ${planetDataCount} divisions ${planetDataCount >= 20 ? '✅' : '⚠️'}`);
    if (sampleData.length > 0) {
      console.log(`     Sample data: ${sampleData.join(', ')}`);
    }
  });
  
  console.log(`\n🎯 FINAL VALIDATION:`);
  console.log(`   Total data cells: ${totalDataCount}`);
  console.log(`   Required minimum: 180`);
  console.log(`   Target: ~216`);
  console.log(`   Status: ${totalDataCount >= 180 ? '✅ PASSED' : '❌ FAILED'}`);
  
  // Test degree format parsing
  console.log(`\n🔧 DEGREE FORMAT TEST:`);
  let validDegreeCount = 0;
  let invalidDegreeCount = 0;
  const sampleParsedData = [];
  
  planetRows.slice(0, 2).forEach(({ row, name }) => {
    for (let col = 1; col <= Math.min(5, range.e.c); col++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
      if (cell && cell.v) {
        const value = cell.v.toString().trim();
        
        // Test degree parsing logic from ExcelUpload component
        const degreeMatch = value.match(/\d+([A-Za-z]{2})\d+/);
        if (degreeMatch) {
          const house = degreeMatch[1];
          validDegreeCount++;
          sampleParsedData.push(`${value} → ${house}`);
        } else {
          invalidDegreeCount++;
          sampleParsedData.push(`${value} → INVALID`);
        }
      }
    }
  });
  
  console.log(`   Valid degree formats: ${validDegreeCount}`);
  console.log(`   Invalid degree formats: ${invalidDegreeCount}`);
  console.log(`   Sample parsing:`);
  sampleParsedData.slice(0, 5).forEach(sample => {
    console.log(`     ${sample}`);
  });
  
  console.log(`\n${'='.repeat(60)}`);
  
  if (planetRows.length === 9 && totalDataCount >= 180) {
    console.log(`🎉 SUCCESS! Your Excel file should work with UserData page!`);
    console.log(`   ✅ Correct number of planets (${planetRows.length})`);
    console.log(`   ✅ Sufficient data cells (${totalDataCount})`);
    console.log(`   ✅ Valid viboothi format structure`);
  } else {
    console.log(`❌ ISSUES FOUND:`);
    if (planetRows.length !== 9) {
      console.log(`   ❌ Wrong number of planets: ${planetRows.length}/9`);
    }
    if (totalDataCount < 180) {
      console.log(`   ❌ Insufficient data: ${totalDataCount}/180`);
    }
  }
  
} catch (error) {
  console.error(`❌ Error reading Excel file:`, error.message);
  console.log(`\n💡 Possible issues:`);
  console.log(`   - File might be corrupted`);
  console.log(`   - File might not be a valid Excel format`);
  console.log(`   - Permission issues`);
}
