/**
 * Create Test Excel File for Ketu Debugging
 * This creates a minimal Excel structure to test Ketu data processing
 */

import * as XLSX from 'xlsx';
import fs from 'fs';

console.log('📝 Creating test Excel file for Ketu debugging...');

// Create test data structure matching Viboothi format
const testData = [
  // Header row (row 0)
  ['Planet', 'D-1', 'D-9', 'D-10', 'D-3', 'D-4', 'D-7', 'D-12'],
  
  // Empty row (row 1)
  [],
  
  // Planet rows (starting from row 2)
  ['Lagna', '15Ar30', '22Ta45', '8Ge12', '5Cn20', '18Le35', '12Vi08', '25Li50'],
  ['Sun', '10Ar15', '28Ta20', '14Ge40', '7Cn55', '21Le10', '16Vi25', '2Sc12'],
  ['Moon', '25Ar45', '12Ta30', '19Ge25', '11Cn40', '4Le55', '27Vi15', '13Sc30'],
  ['Mars', '8Ar20', '15Ta50', '22Ge35', '19Cn10', '26Le25', '9Vi40', '17Sc55'],
  ['Mercury', '18Ar35', '5Ta25', '11Ge50', '24Cn15', '1Le30', '14Vi45', '28Sc20'],
  ['Jupiter', '22Ar10', '29Ta40', '16Ge25', '3Cn50', '20Le15', '7Vi30', '11Sc45'],
  ['Venus', '5Ar50', '18Ta15', '25Ge40', '12Cn25', '29Le50', '22Vi35', '6Sc10'],
  ['Saturn', '12Ar25', '24Ta55', '1Ge20', '28Cn45', '15Le10', '19Vi55', '23Sc25'],
  ['Rahu', '29Ar40', '11Ta20', '18Ge45', '25Cn10', '2Le35', '16Vi20', '20Sc40'],
  ['Ketu', '29Li40', '11Sc20', '18Sg45', '25Cp10', '2Aq35', '16Pi20', '20Ar40'] // ✅ Ketu row
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(testData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Viboothi Data');

// Write file
const fileName = 'test-ketu-debug.xlsx';
XLSX.writeFile(workbook, fileName);

console.log(`✅ Created test Excel file: ${fileName}`);
console.log('📋 File contains:');
console.log('  - All 10 planets including Ketu');
console.log('  - 7 divisions (D-1 through D-12)');
console.log('  - Proper Viboothi format');
console.log('');
console.log('🧪 Test this file in UserData page to verify Ketu processing');

// Also create a test with "Kethu" spelling variation
const testDataKethu = [...testData];
testDataKethu[11] = ['Kethu', '29Li40', '11Sc20', '18Sg45', '25Cp10', '2Aq35', '16Pi20', '20Ar40']; // Kethu variation

const workbook2 = XLSX.utils.book_new();
const worksheet2 = XLSX.utils.aoa_to_sheet(testDataKethu);
XLSX.utils.book_append_sheet(workbook2, worksheet2, 'Viboothi Data');

const fileName2 = 'test-kethu-variation.xlsx';
XLSX.writeFile(workbook2, fileName2);

console.log(`✅ Created variation test file: ${fileName2}`);
console.log('📋 This file uses "Kethu" spelling to test variations');
