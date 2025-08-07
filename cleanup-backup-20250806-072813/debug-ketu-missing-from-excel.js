// URGENT KETU DEBUGGING - Missing from Excel Data
// The issue is that Ketu is not being processed during Excel upload

console.log('🚨 KETU MISSING FROM EXCEL DATA DIAGNOSTIC');
console.log('=' .repeat(60));

console.log('\n📊 BROWSER CONSOLE DEBUGGING:');
console.log('1. In browser console, check:');
console.log('   window.excelData');
console.log('   Object.keys(window.excelData)');
console.log('');
console.log('2. Expected to see: ["Lg", "Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke"]');
console.log('3. Currently seeing: ["Lg", "Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra"]');
console.log('4. MISSING: "Ke" (Ketu)');

console.log('\n🔍 EXCEL FILE STRUCTURE ISSUES:');
console.log('❌ Ketu row might be:');
console.log('   - Missing from Excel file');
console.log('   - Misspelled (check: Ketu, Kethu, KETU, etc.)');
console.log('   - In wrong row position');
console.log('   - Empty or has different formatting');

console.log('\n🧪 TEST INSTRUCTIONS:');
console.log('1. Upload Excel file in UserData page');
console.log('2. In browser console, run:');
console.log('   console.log("Raw Excel Data:", window.excelData);');
console.log('3. Check if "Ke" key exists');
console.log('4. If missing, check your Excel file row for "Ketu"');

console.log('\n📋 EXCEL FILE REQUIREMENTS:');
console.log('- Row structure should be:');
console.log('  Row 1: Headers (D1, D2, D3, ...)');
console.log('  Row 2: Lagna data');
console.log('  Row 3: Sun data');
console.log('  Row 4: Moon data');
console.log('  Row 5: Mars data');
console.log('  Row 6: Mercury data');
console.log('  Row 7: Jupiter data');
console.log('  Row 8: Venus data');
console.log('  Row 9: Saturn data');
console.log('  Row 10: Rahu data');
console.log('  Row 11: Ketu data ← CHECK THIS ROW');

console.log('\n🔧 NEXT STEPS:');
console.log('1. Check your Excel file has "Ketu" in column A around row 11');
console.log('2. Verify the spelling exactly matches supported variations');
console.log('3. Re-upload and check browser console for "[ExcelUpload]" messages');
console.log('4. Look for "Found planet name: Ketu" message');
