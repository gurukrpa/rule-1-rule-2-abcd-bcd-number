// Quick script to count cells with data in Excel files
import XLSX from 'xlsx';
import fs from 'fs';

function countCellsWithData(filePath) {
  try {
    console.log(`\n📊 Checking: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found');
      return;
    }

    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    let dataCount = 0;
    let totalCells = (range.e.r + 1) * (range.e.c + 1);
    
    // Count all cells with data
    for (let row = 0; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v !== null && cell.v !== undefined && cell.v.toString().trim() !== '') {
          dataCount++;
        }
      }
    }
    
    console.log(`📈 Results:`);
    console.log(`   - Total cells: ${totalCells}`);
    console.log(`   - Cells with data: ${dataCount}`);
    console.log(`   - Empty cells: ${totalCells - dataCount}`);
    console.log(`   - Matches 3030 requirement: ${dataCount === 3030 ? '✅ YES' : '❌ NO'}`);
    
    if (dataCount !== 3030) {
      console.log(`   - Difference: ${dataCount - 3030} cells`);
    }
    
    return dataCount;
    
  } catch (error) {
    console.log(`❌ Error reading file: ${error.message}`);
  }
}

// Check both files
console.log('🔍 Excel Cell Counter\n');

// Update these paths to match your actual file locations
const file1 = '/Users/gurukrpasharma/Desktop/singapore upload excel sheets for software/viboothi: Vishnu upload excel/april-2025/3-4-2025.xlsx';
const file2 = '/Users/gurukrpasharma/Desktop/singapore upload excel sheets for software/abcd-bcd num upload/may-2025 /19-5-25.xlsx';

countCellsWithData(file1);
countCellsWithData(file2);

console.log('\n✅ Cell count check complete!');
