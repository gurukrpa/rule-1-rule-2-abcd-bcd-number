#!/usr/bin/env node

/**
 * Analyze UserData Excel Upload Format
 * This script analyzes the ExcelUpload component used in UserData page to understand:
 * 1. What format the Excel file should have
 * 2. What validation is performed
 * 3. How the data is processed
 */

console.log('🔍 ANALYZING USERDATA EXCEL UPLOAD FORMAT\n');

// Based on ExcelUpload.jsx analysis
console.log('📊 EXCEL FORMAT EXPECTED BY USERDATA PAGE:');
console.log('='.repeat(50));

console.log('\n📝 FILE FORMAT: Viboothi Format');
console.log('   - Expected planets: 9 (Lagna, Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu)');
console.log('   - Expected divisions: ~24 per planet');
console.log('   - Total expected data cells: ~216 (9 × 24)');
console.log('   - Minimum threshold: 180 cells (with tolerance)');

console.log('\n📋 STRUCTURE:');
console.log('   Row 0: Division headers (Navamsa, Dashamsa, etc.)');
console.log('   Row 1: [Usually empty or meta info]');
console.log('   Row 2+: Planet rows with degree data');

console.log('\n🌍 PLANET MAPPING:');
const planetMapping = {
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

Object.entries(planetMapping).forEach(([full, short]) => {
  console.log(`   ${full} → ${short}`);
});

console.log('\n📐 DATA FORMAT:');
console.log('   - Degree format: "9Vi42", "27Pi20" (degrees + house + minutes)');
console.log('   - House extraction: Vi, Pi, Ar, Ta, etc. (2-letter house codes)');
console.log('   - Alternative: Direct house format if present');

console.log('\n✅ VALIDATION RULES:');
console.log('   1. Must have exactly 9 planets');
console.log('   2. Each planet should have ~24 divisions (20+ minimum with tolerance)');
console.log('   3. Total data cells should be ≥ 180 (target: ~216)');
console.log('   4. Degree format must be parseable to extract house');

console.log('\n🔄 PROCESSING:');
console.log('   1. Read division headers from row 0');
console.log('   2. Find planet rows starting from row 2');
console.log('   3. Extract house from degree format for each division');
console.log('   4. Create planet → division → house mapping');

console.log('\n📤 OUTPUT FORMAT:');
console.log('   {');
console.log('     "Su": { "Navamsa": "Vi", "Dashamsa": "Pi", ... },');
console.log('     "Mo": { "Navamsa": "Ar", "Dashamsa": "Ta", ... },');
console.log('     ...');
console.log('   }');

console.log('\n🎯 USAGE IN USERDATA:');
console.log('   - Calls handleExcelUpload(data, fileName)');
console.log('   - Sets excelData state');
console.log('   - Used to auto-populate planet selections');
console.log('   - When user selects a planet, divisions get auto-filled');

console.log('\n⚠️  IMPORTANT NOTES:');
console.log('   - This is DIFFERENT from ABCD format used in ABCDBCDNumber page');
console.log('   - No validation for ABCD matrix structure');
console.log('   - No topic/element validation');
console.log('   - Focus is on planet-division-house mapping');

console.log('\n🔧 TO TEST YOUR EXCEL FILE:');
console.log('   1. Make sure you have 9 planet rows');
console.log('   2. Each planet should have degree data in format like "9Vi42"');
console.log('   3. Division headers should be in first row');
console.log('   4. At least 180 data cells with valid degree values');

console.log('\n✨ SAMPLE EXCEL STRUCTURE:');
console.log('   A     B        C         D        ...');
console.log('   --    -------  --------  -------  ...');
console.log('   [*]   Navamsa  Dashamsa  Hora     ...');
console.log('   [*]   [empty]  [empty]   [empty]  ...');
console.log('   Lagna 9Vi42    27Pi20    15Ar30   ...');
console.log('   Sun   12Ta15   3Ge45     22Cn10   ...');
console.log('   Moon  18Le30   8Vi55     5Li25    ...');
console.log('   ...');

console.log('\n' + '='.repeat(50));
console.log('🎯 Ready to test your Excel file with UserData page!');
