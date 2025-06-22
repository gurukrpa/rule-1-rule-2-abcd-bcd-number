// 📋 ABCD Excel Template Structure - Strict Validation
// Based on template analysis: 30 sets × 9 elements × 9 planets = 2430 data cells
// Template: /Users/gurukrpasharma/Desktop/singapore upload excel sheets for software/abcd-bcd num upload/june-2025/12-6-25.xlsx

export const ABCD_TEMPLATE_STRUCTURE = {
  // Expected structure constants
  EXPECTED_TOPICS: 30,
  EXPECTED_ELEMENTS_PER_TOPIC: 9,
  EXPECTED_PLANETS_PER_ELEMENT: 9,
  EXACT_REQUIRED_DATA_CELLS: 2430, // 30 × 9 × 9
  TOLERANCE_CELLS: 50, // Buffer for headers and formatting
  
  // Required element codes in exact order
  REQUIRED_ELEMENTS: [
    'as', 'mo', 'hl', 'gl', 'vig', 'var', 'sl', 'pp', 'in'
  ],
  
  // Valid astrological data patterns
  VALID_ASTRO_PATTERNS: [
    /^[a-z]+-\d+/i,                    // Basic: as-7, mo-12
    /^[a-z]+-\d+-[^-]*/i,              // Extended: as-7-/su-(...)
    /^[a-z]+-\d+[a-z]{2}\d+/i,         // Degree format: as-7sc12
    /^\d+[a-z]{2}\d+/i                 // Pure degree: 7sc12
  ],
  
  // Set header pattern - matches template exactly
  SET_HEADER_PATTERN: /^D-\d+(\s+\([^)]+\))?\s+Set-\d+\s+Matrix$/i,
  
  // Planet header indicators
  PLANET_HEADERS: ['x', 'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'],
  
  // Common invalid values to detect
  INVALID_VALUES: ['', '-', '—', 'N/A', 'NA', 'null', 'NULL', '#N/A', '0']
};

// Strict ABCD Excel validation function - Matches template exactly
export function validateExcelStructure(jsonData, fileName) {
  console.log(`🔍 STRICT ABCD VALIDATION: Analyzing ${fileName}`);
  console.log(`📊 Data structure: ${jsonData.length} rows`);
  
  const errors = [];
  const warnings = [];
  const criticalErrors = [];
  
  // Use structure constants
  const { 
    EXPECTED_TOPICS, 
    EXPECTED_ELEMENTS_PER_TOPIC,
    EXPECTED_PLANETS_PER_ELEMENT,
    EXACT_REQUIRED_DATA_CELLS,
    TOLERANCE_CELLS,
    REQUIRED_ELEMENTS,
    VALID_ASTRO_PATTERNS,
    SET_HEADER_PATTERN,
    PLANET_HEADERS,
    INVALID_VALUES
  } = ABCD_TEMPLATE_STRUCTURE;
  
  // Validation tracking
  let topicsFound = 0;
  let currentTopicRow = -1;
  let elementsInCurrentTopic = 0;
  let totalDataCells = 0;
  let validDataCells = 0;
  let missingCells = [];
  let invalidDataCells = [];
  let topicCompleteness = [];
  
  console.log(`📐 Analyzing ${jsonData.length} rows for ABCD structure...`);
  
  // Analyze each row
  for (let row = 0; row < jsonData.length; row++) {
    const firstCell = jsonData[row] ? jsonData[row][0] : null;
    const firstCellValue = firstCell ? String(firstCell).trim() : '';
    
    // Skip empty rows
    if (!firstCellValue) continue;
    
    // Check for topic headers (D-x Set-y Matrix)
    if (SET_HEADER_PATTERN.test(firstCellValue)) {
      // Validate previous topic completion
      if (currentTopicRow >= 0) {
        const completeness = {
          topicNumber: topicsFound,
          row: currentTopicRow + 1,
          elementsFound: elementsInCurrentTopic,
          expectedElements: EXPECTED_ELEMENTS_PER_TOPIC,
          isComplete: elementsInCurrentTopic === EXPECTED_ELEMENTS_PER_TOPIC
        };
        topicCompleteness.push(completeness);
        
        if (elementsInCurrentTopic !== EXPECTED_ELEMENTS_PER_TOPIC) {
          errors.push(`Topic ${topicsFound} (row ${currentTopicRow + 1}): Incomplete - found ${elementsInCurrentTopic}/${EXPECTED_ELEMENTS_PER_TOPIC} elements`);
        }
      }
      
      topicsFound++;
      currentTopicRow = row;
      elementsInCurrentTopic = 0;
      continue;
    }
    
    // Skip planet header rows (containing just "x" or planet names)
    if (currentTopicRow >= 0 && (
      firstCellValue.toLowerCase() === 'x' ||
      PLANET_HEADERS.some(planet => firstCellValue.toLowerCase().includes(planet)))) {
      continue;
    }
    
    // Check for element rows within topics
    if (currentTopicRow >= 0 && firstCellValue.length <= 3 && firstCellValue.match(/^[a-z]+$/i)) {
      const elementCode = firstCellValue.toLowerCase();
      
      // Validate element is expected
      if (!REQUIRED_ELEMENTS.includes(elementCode)) {
        errors.push(`Row ${row + 1}: Invalid element code "${elementCode}". Expected one of: ${REQUIRED_ELEMENTS.join(', ')}`);
        continue;
      }
      
      // Check element order
      const expectedElement = REQUIRED_ELEMENTS[elementsInCurrentTopic];
      if (elementCode !== expectedElement) {
        warnings.push(`Row ${row + 1}: Element "${elementCode}" out of order. Expected "${expectedElement}" at position ${elementsInCurrentTopic + 1}`);
      }
      
      elementsInCurrentTopic++;
      
      // Validate planet data in columns B-J (indices 1-9)
      let planetDataCount = 0;
      let validPlanetDataCount = 0;
      
      for (let col = 1; col <= EXPECTED_PLANETS_PER_ELEMENT; col++) {
        const cell = jsonData[row] ? jsonData[row][col] : null;
        const columnLetter = String.fromCharCode(65 + col); // B, C, D, etc.
        
        if (cell && cell !== null && cell !== undefined && String(cell).trim() !== '') {
          const cellValue = String(cell).trim();
          planetDataCount++;
          totalDataCells++;
          
          // Validate astrological data format
          const isValidFormat = VALID_ASTRO_PATTERNS.some(pattern => pattern.test(cellValue));
          
          if (!isValidFormat) {
            // Check for common invalid values
            const isCommonInvalid = INVALID_VALUES.includes(cellValue) || cellValue.length < 2;
            
            if (isCommonInvalid) {
              errors.push(`Row ${row + 1}, Column ${columnLetter}: Missing planet data for "${elementCode}"`);
            } else {
              warnings.push(`Row ${row + 1}, Column ${columnLetter}: Unusual format for "${elementCode}": "${cellValue}". Expected astrological data like "as-7-/su-(...)" or "7sc12"`);
            }
            
            invalidDataCells.push({
              row: row + 1,
              col: columnLetter,
              element: elementCode,
              value: cellValue
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
            expectedPosition: `Planet ${col} data for ${elementCode}`
          });
        }
      }
      
      // Check if element has all required planet data
      if (planetDataCount < EXPECTED_PLANETS_PER_ELEMENT) {
        errors.push(`Row ${row + 1}: Element "${elementCode}" missing ${EXPECTED_PLANETS_PER_ELEMENT - planetDataCount} planet data cells (found ${planetDataCount}/${EXPECTED_PLANETS_PER_ELEMENT})`);
      }
    }
  }
  
  // Final validation checks with enhanced criteria
  
  // 1. Topics validation
  if (topicsFound < EXPECTED_TOPICS) {
    criticalErrors.push(`CRITICAL: Insufficient topics. Required: ${EXPECTED_TOPICS}, Found: ${topicsFound}`);
  } else if (topicsFound > EXPECTED_TOPICS) {
    warnings.push(`Extra topics found. Expected: ${EXPECTED_TOPICS}, Found: ${topicsFound}`);
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
  
  console.log(`✅ VALIDATION COMPLETE:`);
  console.log(`   Topics Found: ${topicsFound}/${EXPECTED_TOPICS} ${topicsFound === EXPECTED_TOPICS ? '✅' : '❌'}`);
  console.log(`   Valid Data Cells: ${validDataCells}/${EXACT_REQUIRED_DATA_CELLS} ${validDataCells >= minRequiredCells ? '✅' : '❌'}`);
  console.log(`   Data Quality: ${dataQualityScore.toFixed(1)}%`);
  console.log(`   Result: ${isValid ? (hasWarnings ? 'PASSED_WITH_WARNINGS' : 'PASSED') : 'FAILED'}`);
  
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
    summary: `Found ${topicsFound}/${EXPECTED_TOPICS} topics with ${validDataCells}/${EXACT_REQUIRED_DATA_CELLS} valid data cells. Data quality: ${dataQualityScore.toFixed(1)}%. ${missingCells.length} cells missing.`,
    validationLevel: isValid ? (hasWarnings ? 'PASSED_WITH_WARNINGS' : 'PASSED') : 'FAILED',
    setHeaders: [] // Keep for compatibility
  };
}

// Generate comprehensive validation report
export function generateValidationReport(validation, fileName) {
  let report = `📋 ABCD EXCEL VALIDATION REPORT\n`;
  report += `File: ${fileName}\n`;
  report += `Status: ${validation.isValid ? '✅ PASSED' : '❌ FAILED'}\n`;
  report += `Validation Level: ${validation.validationLevel || 'UNKNOWN'}\n\n`;
  
  // Summary section
  report += `📊 VALIDATION SUMMARY:\n`;
  report += `   Topics Found: ${validation.topicsFound || 0}/${ABCD_TEMPLATE_STRUCTURE.EXPECTED_TOPICS}\n`;
  report += `   Valid Data Cells: ${validation.validDataCells || 0}/${ABCD_TEMPLATE_STRUCTURE.EXACT_REQUIRED_DATA_CELLS}\n`;
  report += `   Data Quality: ${validation.dataQualityScore ? validation.dataQualityScore.toFixed(1) : '0.0'}%\n`;
  report += `   Missing Cells: ${validation.missingCells ? validation.missingCells.length : 0}\n`;
  report += `   Invalid Data Cells: ${validation.invalidDataCells ? validation.invalidDataCells.length : 0}\n\n`;
  
  // Critical errors
  if (validation.criticalErrors && validation.criticalErrors.length > 0) {
    report += `🚨 CRITICAL ERRORS (${validation.criticalErrors.length}) - Must be fixed:\n`;
    validation.criticalErrors.forEach((error, index) => {
      report += `${index + 1}. ${error}\n`;
    });
    report += '\n';
  }
  
  // Standard errors
  if (validation.errors && validation.errors.length > 0) {
    report += `❌ ERRORS (${validation.errors.length}):\n`;
    validation.errors.slice(0, 10).forEach((error, index) => {
      report += `${index + 1}. ${error}\n`;
    });
    if (validation.errors.length > 10) {
      report += `... and ${validation.errors.length - 10} more errors\n`;
    }
    report += '\n';
  }
  
  // Warnings
  if (validation.warnings && validation.warnings.length > 0) {
    report += `⚠️ WARNINGS (${validation.warnings.length}):\n`;
    validation.warnings.slice(0, 5).forEach((warning, index) => {
      report += `${index + 1}. ${warning}\n`;
    });
    if (validation.warnings.length > 5) {
      report += `... and ${validation.warnings.length - 5} more warnings\n`;
    }
    report += '\n';
  }
  
  // Missing cells summary
  if (validation.missingCells && validation.missingCells.length > 0) {
    report += `📍 MISSING DATA LOCATIONS (${Math.min(validation.missingCells.length, 10)} shown):\n`;
    validation.missingCells.slice(0, 10).forEach((missing, index) => {
      report += `${index + 1}. Row ${missing.row}, Column ${missing.col}: ${missing.expectedPosition}\n`;
    });
    if (validation.missingCells.length > 10) {
      report += `... and ${validation.missingCells.length - 10} more missing cells\n`;
    }
    report += '\n';
  }
  
  // Requirements section
  report += `📋 TEMPLATE REQUIREMENTS:\n`;
  report += `• Must have exactly ${ABCD_TEMPLATE_STRUCTURE.EXPECTED_TOPICS} topics with headers like "D-1 Set-1 Matrix"\n`;
  report += `• Each topic must have ${ABCD_TEMPLATE_STRUCTURE.EXPECTED_ELEMENTS_PER_TOPIC} elements: ${ABCD_TEMPLATE_STRUCTURE.REQUIRED_ELEMENTS.join(', ')}\n`;
  report += `• Each element must have ${ABCD_TEMPLATE_STRUCTURE.EXPECTED_PLANETS_PER_ELEMENT} planet data cells in columns B-J\n`;
  report += `• Planet data must be in valid astrological format (e.g., "as-7-/su-(...)", "7sc12")\n`;
  report += `• Total expected data cells: ${ABCD_TEMPLATE_STRUCTURE.EXACT_REQUIRED_DATA_CELLS}\n`;
  
  return report;
}
