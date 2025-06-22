// Script to analyze Excel structure for ABCD page validation
import XLSX from 'xlsx';
import fs from 'fs';

function analyzeExcelStructure(filePath) {
  try {
    console.log(`\n📊 Analyzing Excel Structure: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found');
      return;
    }

    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    console.log(`📐 Sheet Range: ${range.s.r}-${range.e.r} rows, ${range.s.c}-${range.e.c} columns`);
    console.log(`📏 Total Cells: ${(range.e.r + 1) * (range.e.c + 1)}`);
    
    // Analyze structure
    let topicHeaders = [];
    let elementRows = [];
    let emptyCells = [];
    let dataCount = 0;
    
    // Check each row for patterns
    for (let row = 0; row <= range.e.r; row++) {
      const firstCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      const firstCellValue = firstCell ? String(firstCell.v).trim() : '';
      
      // Check for topic headers (D-x Set-y Matrix)
      if (firstCellValue.includes('Matrix') && firstCellValue.match(/D-\d+.*Set-\d+.*Matrix/)) {
        topicHeaders.push({
          row: row + 1,
          content: firstCellValue
        });
        console.log(`🏷️  Topic Header at Row ${row + 1}: ${firstCellValue}`);
      }
      
      // Check for element rows (as, mo, hl, etc.)
      if (firstCellValue.length <= 3 && firstCellValue.match(/^[a-z]+$/i)) {
        elementRows.push({
          row: row + 1,
          element: firstCellValue,
          dataInRow: 0
        });
        
        // Count data cells in this element row
        let rowDataCount = 0;
        for (let col = 1; col <= range.e.c; col++) {
          const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
          if (cell && cell.v !== null && cell.v !== undefined && String(cell.v).trim() !== '') {
            rowDataCount++;
            dataCount++;
          } else {
            emptyCells.push({
              row: row + 1,
              col: col + 1,
              address: XLSX.utils.encode_cell({ r: row, c: col })
            });
          }
        }
        elementRows[elementRows.length - 1].dataInRow = rowDataCount;
      }
      
      // Count all data cells
      for (let col = 0; col <= range.e.c; col++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell && cell.v !== null && cell.v !== undefined && String(cell.v).trim() !== '') {
          if (!firstCellValue.includes('Matrix') && !firstCellValue.match(/^[a-z]+$/i)) {
            dataCount++;
          }
        }
      }
    }
    
    console.log(`\n📈 Analysis Results:`);
    console.log(`   - Topic headers found: ${topicHeaders.length}`);
    console.log(`   - Element rows found: ${elementRows.length}`);
    console.log(`   - Total cells with data: ${dataCount}`);
    console.log(`   - Empty cells in element rows: ${emptyCells.length}`);
    
    // Show topic structure
    console.log(`\n🏷️  Topic Headers:`);
    topicHeaders.forEach((topic, index) => {
      console.log(`   ${index + 1}. Row ${topic.row}: ${topic.content}`);
    });
    
    // Show element structure
    console.log(`\n🧱 Element Rows (with data counts):`);
    elementRows.forEach(element => {
      const status = element.dataInRow === 9 ? '✅' : '❌';
      console.log(`   ${status} Row ${element.row}: ${element.element} (${element.dataInRow}/9 cells filled)`);
    });
    
    // Show missing cells (first 10)
    if (emptyCells.length > 0) {
      console.log(`\n❌ Missing/Empty Cells (showing first 10):`);
      emptyCells.slice(0, 10).forEach(cell => {
        console.log(`   - ${cell.address} (Row ${cell.row}, Col ${cell.col})`);
      });
      if (emptyCells.length > 10) {
        console.log(`   ... and ${emptyCells.length - 10} more empty cells`);
      }
    }
    
    // Expected structure analysis
    const expectedTopics = 30; // Based on your codebase
    const expectedElementsPerTopic = 9;
    const expectedPlanetsPerElement = 9;
    const expectedTotalDataCells = expectedTopics * expectedElementsPerTopic * expectedPlanetsPerElement;
    
    console.log(`\n🎯 Expected vs Actual:`);
    console.log(`   - Expected topics: ${expectedTopics}, Found: ${topicHeaders.length}`);
    console.log(`   - Expected total data cells: ${expectedTotalDataCells}, Found: ${dataCount}`);
    console.log(`   - Match 3030 requirement: ${dataCount === 3030 ? '✅ YES' : '❌ NO'}`);
    
    return {
      topicHeaders,
      elementRows,
      emptyCells,
      dataCount,
      isValid: topicHeaders.length === expectedTopics && emptyCells.length === 0
    };
    
  } catch (error) {
    console.log(`❌ Error analyzing file: ${error.message}`);
    return null;
  }
}

// Analyze the sample file
const sampleFile = '/Users/gurukrpasharma/Desktop/singapore upload excel sheets for software/abcd-bcd num upload/may-2025 /22-5-25.xlsx';
const analysis = analyzeExcelStructure(sampleFile);

console.log('\n✅ Excel structure analysis complete!');

if (analysis) {
  console.log(`\n📋 Summary for Validation Rules:`);
  console.log(`   - File has ${analysis.topicHeaders.length} topics`);
  console.log(`   - File has ${analysis.elementRows.length} element rows`);
  console.log(`   - File has ${analysis.emptyCells.length} missing cells`);
  console.log(`   - Validation should ${analysis.isValid ? 'PASS' : 'FAIL'}`);
}
