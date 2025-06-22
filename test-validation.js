import XLSX from 'xlsx';

// Test the Excel validation with the sample file
const testExcelValidation = (filePath) => {
  try {
    console.log(`🧪 Testing validation with: ${filePath}`);
    
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    console.log(`📐 Sheet Range: ${range.s.r}-${range.e.r} rows, ${range.s.c}-${range.e.c} columns`);
    
    // Count data cells
    let dataCount = 0;
    for (let row = 0; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell && cell.v !== null && cell.v !== undefined && String(cell.v).trim() !== '') {
          dataCount++;
        }
      }
    }
    
    console.log(`📊 Total cells with data: ${dataCount}`);
    console.log(`🎯 Matches 3030 requirement: ${dataCount === 3030 ? '✅ YES' : '❌ NO'}`);
    
    if (dataCount !== 3030) {
      console.log(`   📉 Difference: ${dataCount - 3030} cells`);
    }
    
    // Count topics
    let topicCount = 0;
    for (let row = 0; row <= range.e.r; row++) {
      const firstCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      const firstCellValue = firstCell ? String(firstCell.v).trim() : '';
      
      if (firstCellValue.includes('Matrix') && firstCellValue.match(/D-\d+.*Set-\d+.*Matrix/i)) {
        topicCount++;
      }
    }
    
    console.log(`🏷️ Topics found: ${topicCount}/30`);
    console.log(`✅ Validation test complete`);
    
    return { dataCount, topicCount, isValid: dataCount === 3030 && topicCount === 30 };
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return null;
  }
};

// Test with the sample file
const sampleFile = '/Users/gurukrpasharma/Desktop/singapore upload excel sheets for software/abcd-bcd num upload/may-2025 /22-5-25.xlsx';
const result = testExcelValidation(sampleFile);

if (result) {
  console.log(`\n📋 Final Result:`);
  console.log(`   - File should ${result.isValid ? 'PASS' : 'FAIL'} validation`);
  console.log(`   - Data cells: ${result.dataCount}`);
  console.log(`   - Topics: ${result.topicCount}`);
}
