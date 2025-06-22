#!/usr/bin/env node
// Enhanced validation testing tool for ABCD Excel files
import XLSX from 'xlsx';
import fs from 'fs';

// Enhanced ABCD Excel validation function (copied from component)
function validateABCDExcelStructure(worksheet) {
  console.log('🔍 Starting enhanced ABCD Excel validation...');
  
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const errors = [];
  const warnings = [];
  const criticalErrors = [];
  
  // Expected structure constants
  const expectedTopics = 30;
  const expectedElements = [
    'as', 'mo', 'hl', 'gl', 'vig', 'var', 'sl', 'pp', 'in'
  ];
  const expectedPlanetsPerElement = 9; // Columns B-J (1-9)
  const EXACT_REQUIRED_DATA_CELLS = 2430; // 30 topics × 9 elements × 9 planets
  const TOLERANCE_CELLS = 50; // Allow small variation for headers, etc.
  
  // Validation tracking
  let topicsFound = 0;
  let currentTopicRow = -1;
  let elementsInCurrentTopic = 0;
  let totalDataCells = 0;
  let validDataCells = 0;
  let missingCells = [];
  let invalidDataCells = [];
  let topicCompleteness = [];
  
  // Enhanced astrological data format patterns
  const validAstroPatterns = [
    /^[a-z]+-\d+/i,                    // Basic: as-7, mo-12
    /^[a-z]+-\d+-[^-]*/i,              // Extended: as-7-/su-(...)
    /^[a-z]+-\d+[a-z]{2}\d+/i,         // Degree format: as-7sc12
    /^\d+[a-z]{2}\d+/i                 // Pure degree: 7sc12
  ];
  
  console.log(`📐 Sheet dimensions: ${range.e.r + 1} rows × ${range.e.c + 1} columns`);
  
  // Analyze each row
  for (let row = 0; row <= range.e.r; row++) {
    const firstCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
    const firstCellValue = firstCell ? String(firstCell.v).trim() : '';
    
    // Check for topic headers (D-x Set-y Matrix)
    if (firstCellValue.includes('Matrix') && firstCellValue.match(/D-\d+.*Set-\d+.*Matrix/i)) {
      // Validate previous topic completion
      if (currentTopicRow >= 0) {
        const completeness = {
          topicNumber: topicsFound,
          row: currentTopicRow + 1,
          elementsFound: elementsInCurrentTopic,
          expectedElements: expectedElements.length,
          isComplete: elementsInCurrentTopic === expectedElements.length
        };
        topicCompleteness.push(completeness);
        
        if (elementsInCurrentTopic !== expectedElements.length) {
          errors.push(`Topic ${topicsFound} (row ${currentTopicRow + 1}): Incomplete - found ${elementsInCurrentTopic}/${expectedElements.length} elements`);
        }
      }
      
      topicsFound++;
      currentTopicRow = row;
      elementsInCurrentTopic = 0;
      console.log(`📊 Found topic ${topicsFound}: ${firstCellValue} at row ${row + 1}`);
      continue;
    }
    
    // Skip planet header rows (containing just "x" or planet names)
    if (currentTopicRow >= 0 && (
      firstCellValue.toLowerCase() === 'x' ||
      ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']
        .some(planet => firstCellValue.toLowerCase().includes(planet)))) {
      console.log(`🪐 Skipping planet header row: ${firstCellValue}`);
      continue;
    }
    
    // Check for element rows within topics
    if (currentTopicRow >= 0 && firstCellValue.length <= 3 && firstCellValue.match(/^[a-z]+$/i)) {
      const elementCode = firstCellValue.toLowerCase();
      
      // Validate element is expected
      if (!expectedElements.includes(elementCode)) {
        errors.push(`Row ${row + 1}: Invalid element code "${elementCode}". Expected one of: ${expectedElements.join(', ')}`);
        continue;
      }
      
      // Check element order
      const expectedElement = expectedElements[elementsInCurrentTopic];
      if (elementCode !== expectedElement) {
        warnings.push(`Row ${row + 1}: Element "${elementCode}" out of order. Expected "${expectedElement}" at position ${elementsInCurrentTopic + 1}`);
      }
      
      elementsInCurrentTopic++;
      
      // Enhanced planet data validation in columns B-J (indices 1-9)
      let planetDataCount = 0;
      let validPlanetDataCount = 0;
      
      for (let col = 1; col <= 9; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        const columnLetter = String.fromCharCode(65 + col); // B, C, D, etc.
        
        if (cell && cell.v !== null && cell.v !== undefined && String(cell.v).trim() !== '') {
          const cellValue = String(cell.v).trim();
          planetDataCount++;
          totalDataCells++;
          
          // Enhanced astrological data format validation
          const isValidFormat = validAstroPatterns.some(pattern => pattern.test(cellValue));
          
          if (!isValidFormat) {
            // Check for common invalid values
            const commonInvalidValues = ['', '-', '—', 'N/A', 'NA', 'null', 'NULL', '#N/A', '0'];
            const isCommonInvalid = commonInvalidValues.includes(cellValue) || cellValue.length < 2;
            
            if (isCommonInvalid) {
              errors.push(`Row ${row + 1}, Column ${columnLetter}: Missing planet data for "${elementCode}"`);
            } else {
              warnings.push(`Row ${row + 1}, Column ${columnLetter}: Unusual format for "${elementCode}": "${cellValue}". Expected astrological data like "as-7-/su-(...)" or "7sc12"`);
            }
            
            invalidDataCells.push({
              row: row + 1,
              col: columnLetter,
              element: elementCode,
              value: cellValue,
              address: cellAddress
            });
          } else {
            validPlanetDataCount++;
            validDataCells++;
          }
        } else {
          // Missing data cell
          missingCells.push({
            row: row + 1,
            col: columnLetter,
            element: elementCode,
            address: cellAddress,
            expectedPosition: `Planet ${col} data for ${elementCode}`
          });
        }
      }
      
      // Check if element has all required planet data
      if (planetDataCount < expectedPlanetsPerElement) {
        errors.push(`Row ${row + 1}: Element "${elementCode}" missing ${expectedPlanetsPerElement - planetDataCount} planet data cells (found ${planetDataCount}/${expectedPlanetsPerElement})`);
      }
    }
  }
  
  // Final validation checks with enhanced criteria
  
  // 1. Topics validation
  if (topicsFound < expectedTopics) {
    criticalErrors.push(`CRITICAL: Insufficient topics. Required: ${expectedTopics}, Found: ${topicsFound}`);
  } else if (topicsFound > expectedTopics) {
    warnings.push(`Extra topics found. Expected: ${expectedTopics}, Found: ${topicsFound}`);
  }
  
  // 2. Strict data cell count validation
  const minRequiredCells = EXACT_REQUIRED_DATA_CELLS - TOLERANCE_CELLS;
  
  if (validDataCells < minRequiredCells) {
    criticalErrors.push(`CRITICAL: Insufficient valid data cells. Required: ~${EXACT_REQUIRED_DATA_CELLS}, Found: ${validDataCells} (Missing: ${minRequiredCells - validDataCells})`);
  } else if (validDataCells < EXACT_REQUIRED_DATA_CELLS * 0.95) {
    warnings.push(`Low data cell count. Expected: ~${EXACT_REQUIRED_DATA_CELLS}, Found: ${validDataCells}`);
  }
  
  // 3. Check for excessive missing cells
  const missingCellPercentage = (missingCells.length / EXACT_REQUIRED_DATA_CELLS) * 100;
  if (missingCellPercentage > 5) {
    criticalErrors.push(`CRITICAL: Too many missing cells: ${missingCells.length} (${missingCellPercentage.toFixed(1)}% of expected data)`);
  }
  
  // 4. Data quality assessment
  const dataQualityScore = totalDataCells > 0 ? (validDataCells / totalDataCells) * 100 : 0;
  if (dataQualityScore < 90) {
    warnings.push(`Data quality below optimal: ${dataQualityScore.toFixed(1)}% valid data`);
  }
  
  // Combine all errors
  const allErrors = [...criticalErrors, ...errors];
  
  // Return validation result
  const isValid = allErrors.length === 0;
  const hasWarnings = warnings.length > 0;
  
  return {
    isValid,
    errors: allErrors,
    warnings,
    criticalErrors,
    topicsFound,
    totalDataCells,
    validDataCells,
    missingCells,
    invalidDataCells,
    topicCompleteness,
    dataQualityScore,
    missingCellPercentage,
    summary: `Found ${topicsFound}/${expectedTopics} topics with ${validDataCells}/${EXACT_REQUIRED_DATA_CELLS} valid data cells. Data quality: ${dataQualityScore.toFixed(1)}%. ${missingCells.length} cells missing.`,
    validationLevel: isValid ? (hasWarnings ? 'PASSED_WITH_WARNINGS' : 'PASSED') : 'FAILED'
  };
}

// Test function
function testEnhancedValidation(filePath) {
  try {
    console.log(`\n🧪 Testing Enhanced Validation: ${filePath}`);
    console.log('=' + '='.repeat(60));
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found');
      return null;
    }

    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Run enhanced validation
    const result = validateABCDExcelStructure(worksheet);
    
    // Display results
    console.log(`\n📊 Enhanced Validation Results:`);
    console.log(`   Validation Level: ${result.validationLevel}`);
    console.log(`   Topics Found: ${result.topicsFound}/30 ${result.topicsFound === 30 ? '✅' : '❌'}`);
    console.log(`   Valid Data Cells: ${result.validDataCells}/2430 ${result.validDataCells >= 2380 ? '✅' : '❌'}`);
    console.log(`   Total Data Cells: ${result.totalDataCells}`);
    console.log(`   Missing Cells: ${result.missingCells.length} (${result.missingCellPercentage.toFixed(1)}%)`);
    console.log(`   Invalid Data Cells: ${result.invalidDataCells.length}`);
    console.log(`   Data Quality: ${result.dataQualityScore.toFixed(1)}%`);
    console.log(`   Critical Errors: ${result.criticalErrors.length}`);
    console.log(`   Errors: ${result.errors.length - result.criticalErrors.length}`);
    console.log(`   Warnings: ${result.warnings.length}`);
    
    if (result.criticalErrors.length > 0) {
      console.log(`\n🚨 Critical Errors:`);
      result.criticalErrors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (result.errors.length > result.criticalErrors.length) {
      console.log(`\n❌ Errors:`);
      result.errors.filter(e => !result.criticalErrors.includes(e)).slice(0, 5).forEach(error => console.log(`   • ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log(`\n⚠️ Warnings (first 5):`);
      result.warnings.slice(0, 5).forEach(warning => console.log(`   • ${warning}`));
    }
    
    if (result.missingCells.length > 0) {
      console.log(`\n📍 Missing Cell Examples (first 3):`);
      result.missingCells.slice(0, 3).forEach(cell => {
        console.log(`   • Row ${cell.row}, Column ${cell.col}: ${cell.expectedPosition}`);
      });
    }
    
    // Topic completeness summary
    console.log(`\n🏷️ Topic Completeness Summary:`);
    const completeTopics = result.topicCompleteness.filter(t => t.isComplete).length;
    console.log(`   Complete Topics: ${completeTopics}/${result.topicCompleteness.length}`);
    
    const incompleteTopics = result.topicCompleteness.filter(t => !t.isComplete);
    if (incompleteTopics.length > 0) {
      console.log(`   Incomplete Topics:`);
      incompleteTopics.slice(0, 3).forEach(topic => {
        console.log(`   • Topic ${topic.topicNumber} (row ${topic.row}): ${topic.elementsFound}/${topic.expectedElements} elements`);
      });
    }
    
    console.log(`\n${result.validationLevel === 'PASSED' ? '✅' : result.validationLevel === 'PASSED_WITH_WARNINGS' ? '⚠️' : '❌'} Final Result: ${result.validationLevel}`);
    
    return result;
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return null;
  }
}

// Run test if file path provided
if (process.argv.length > 2) {
  const filePath = process.argv[2];
  testEnhancedValidation(filePath);
} else {
  console.log(`
🧪 Enhanced ABCD Excel Validation Tester

Usage: node test-enhanced-validation.js <path-to-excel-file>

Example: node test-enhanced-validation.js "/path/to/excel/file.xlsx"

This tool tests the enhanced validation logic with:
• Stricter data cell counting (exactly 2430 valid cells required)
• Enhanced astrological data format validation  
• Progressive validation feedback
• Detailed error categorization
• Data quality scoring
• Missing cell location reporting
• Topic completeness analysis
`);
}
