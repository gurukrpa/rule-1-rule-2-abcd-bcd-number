// Create a simple test Excel file for Planets Analysis
// This will generate an Excel file that includes D-3 Set-1 Matrix data

import * as XLSX from 'xlsx';

console.log('🔧 Creating test Excel file for Planets Analysis...');

// Create test data structure
const testData = [
    // Headers
    ['', 'Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'],
    
    // D-1 Set-1 Matrix
    ['D-1 Set-1 Matrix'],
    ['as', 'as-1-/su-(12Sc50)', 'as-2-/mo-(15Li30)', 'as-4-/ma-(08Sa20)', 'as-7-/me-(03Pi10)', 'as-9-/ju-(18Vi55)', 'as-5-/ve-(21Ar30)', 'as-6-/sa-(14Ge45)', 'as-8-/ra-(07Cn25)', 'as-3-/ke-(29Le40)'],
    ['mo', 'mo-2-/su-(12Sc50)', 'mo-1-/mo-(15Li30)', 'mo-7-/ma-(08Sa20)', 'mo-4-/me-(03Pi10)', 'mo-9-/ju-(18Vi55)', 'mo-5-/ve-(21Ar30)', 'mo-6-/sa-(14Ge45)', 'mo-8-/ra-(07Cn25)', 'mo-3-/ke-(29Le40)'],
    ['hl', 'hl-9-/su-(12Sc50)', 'hl-4-/mo-(15Li30)', 'hl-2-/ma-(08Sa20)', 'hl-7-/me-(03Pi10)', 'hl-1-/ju-(18Vi55)', 'hl-5-/ve-(21Ar30)', 'hl-6-/sa-(14Ge45)', 'hl-8-/ra-(07Cn25)', 'hl-3-/ke-(29Le40)'],
    ['gl', 'gl-7-/su-(12Sc50)', 'gl-9-/mo-(15Li30)', 'gl-4-/ma-(08Sa20)', 'gl-2-/me-(03Pi10)', 'gl-1-/ju-(18Vi55)', 'gl-5-/ve-(21Ar30)', 'gl-6-/sa-(14Ge45)', 'gl-8-/ra-(07Cn25)', 'gl-3-/ke-(29Le40)'],
    ['vig', 'vig-4-/su-(12Sc50)', 'vig-7-/mo-(15Li30)', 'vig-9-/ma-(08Sa20)', 'vig-2-/me-(03Pi10)', 'vig-1-/ju-(18Vi55)', 'vig-5-/ve-(21Ar30)', 'vig-6-/sa-(14Ge45)', 'vig-8-/ra-(07Cn25)', 'vig-3-/ke-(29Le40)'],
    ['var', 'var-2-/su-(12Sc50)', 'var-4-/mo-(15Li30)', 'var-7-/ma-(08Sa20)', 'var-9-/me-(03Pi10)', 'var-1-/ju-(18Vi55)', 'var-5-/ve-(21Ar30)', 'var-6-/sa-(14Ge45)', 'var-8-/ra-(07Cn25)', 'var-3-/ke-(29Le40)'],
    ['sl', 'sl-1-/su-(12Sc50)', 'sl-2-/mo-(15Li30)', 'sl-4-/ma-(08Sa20)', 'sl-7-/me-(03Pi10)', 'sl-9-/ju-(18Vi55)', 'sl-5-/ve-(21Ar30)', 'sl-6-/sa-(14Ge45)', 'sl-8-/ra-(07Cn25)', 'sl-3-/ke-(29Le40)'],
    ['pp', 'pp-9-/su-(12Sc50)', 'pp-1-/mo-(15Li30)', 'pp-2-/ma-(08Sa20)', 'pp-4-/me-(03Pi10)', 'pp-7-/ju-(18Vi55)', 'pp-5-/ve-(21Ar30)', 'pp-6-/sa-(14Ge45)', 'pp-8-/ra-(07Cn25)', 'pp-3-/ke-(29Le40)'],
    ['in', 'in-7-/su-(12Sc50)', 'in-9-/mo-(15Li30)', 'in-1-/ma-(08Sa20)', 'in-2-/me-(03Pi10)', 'in-4-/ju-(18Vi55)', 'in-5-/ve-(21Ar30)', 'in-6-/sa-(14Ge45)', 'in-8-/ra-(07Cn25)', 'in-3-/ke-(29Le40)'],
    
    // D-3 Set-1 Matrix (the specific topic we're testing)
    [''],
    ['D-3 Set-1 Matrix'],
    ['as', 'as-1-/su-(12Sc50)', 'as-2-/mo-(15Li30)', 'as-5-/ma-(08Sa20)', 'as-9-/me-(03Pi10)', 'as-10-/ju-(18Vi55)', 'as-7-/ve-(21Ar30)', 'as-6-/sa-(14Ge45)', 'as-8-/ra-(07Cn25)', 'as-3-/ke-(29Le40)'],
    ['mo', 'mo-2-/su-(12Sc50)', 'mo-1-/mo-(15Li30)', 'mo-9-/ma-(08Sa20)', 'mo-5-/me-(03Pi10)', 'mo-10-/ju-(18Vi55)', 'mo-7-/ve-(21Ar30)', 'mo-6-/sa-(14Ge45)', 'mo-8-/ra-(07Cn25)', 'mo-3-/ke-(29Le40)'],
    ['hl', 'hl-10-/su-(12Sc50)', 'hl-5-/mo-(15Li30)', 'hl-1-/ma-(08Sa20)', 'hl-2-/me-(03Pi10)', 'hl-9-/ju-(18Vi55)', 'hl-7-/ve-(21Ar30)', 'hl-6-/sa-(14Ge45)', 'hl-8-/ra-(07Cn25)', 'hl-3-/ke-(29Le40)'],
    ['gl', 'gl-9-/su-(12Sc50)', 'gl-10-/mo-(15Li30)', 'gl-5-/ma-(08Sa20)', 'gl-1-/me-(03Pi10)', 'gl-2-/ju-(18Vi55)', 'gl-7-/ve-(21Ar30)', 'gl-6-/sa-(14Ge45)', 'gl-8-/ra-(07Cn25)', 'gl-3-/ke-(29Le40)'],
    ['vig', 'vig-5-/su-(12Sc50)', 'vig-9-/mo-(15Li30)', 'vig-10-/ma-(08Sa20)', 'vig-1-/me-(03Pi10)', 'vig-2-/ju-(18Vi55)', 'vig-7-/ve-(21Ar30)', 'vig-6-/sa-(14Ge45)', 'vig-8-/ra-(07Cn25)', 'vig-3-/ke-(29Le40)'],
    ['var', 'var-1-/su-(12Sc50)', 'var-5-/mo-(15Li30)', 'var-9-/ma-(08Sa20)', 'var-10-/me-(03Pi10)', 'var-2-/ju-(18Vi55)', 'var-7-/ve-(21Ar30)', 'var-6-/sa-(14Ge45)', 'var-8-/ra-(07Cn25)', 'var-3-/ke-(29Le40)'],
    ['sl', 'sl-2-/su-(12Sc50)', 'sl-1-/mo-(15Li30)', 'sl-5-/ma-(08Sa20)', 'sl-9-/me-(03Pi10)', 'sl-10-/ju-(18Vi55)', 'sl-7-/ve-(21Ar30)', 'sl-6-/sa-(14Ge45)', 'sl-8-/ra-(07Cn25)', 'sl-3-/ke-(29Le40)'],
    ['pp', 'pp-10-/su-(12Sc50)', 'pp-2-/mo-(15Li30)', 'pp-1-/ma-(08Sa20)', 'pp-5-/me-(03Pi10)', 'pp-9-/ju-(18Vi55)', 'pp-7-/ve-(21Ar30)', 'pp-6-/sa-(14Ge45)', 'pp-8-/ra-(07Cn25)', 'pp-3-/ke-(29Le40)'],
    ['in', 'in-9-/su-(12Sc50)', 'in-10-/mo-(15Li30)', 'in-2-/ma-(08Sa20)', 'in-1-/me-(03Pi10)', 'in-5-/ju-(18Vi55)', 'in-7-/ve-(21Ar30)', 'in-6-/sa-(14Ge45)', 'in-8-/ra-(07Cn25)', 'in-3-/ke-(29Le40)'],
    
    // D-3 Set-2 Matrix (for comparison)
    [''],
    ['D-3 Set-2 Matrix'],
    ['as', 'as-3-/su-(12Sc50)', 'as-7-/mo-(15Li30)', 'as-8-/ma-(08Sa20)', 'as-9-/me-(03Pi10)', 'as-10-/ju-(18Vi55)', 'as-5-/ve-(21Ar30)', 'as-6-/sa-(14Ge45)', 'as-1-/ra-(07Cn25)', 'as-2-/ke-(29Le40)'],
    ['mo', 'mo-7-/su-(12Sc50)', 'mo-3-/mo-(15Li30)', 'mo-9-/ma-(08Sa20)', 'mo-8-/me-(03Pi10)', 'mo-10-/ju-(18Vi55)', 'mo-5-/ve-(21Ar30)', 'mo-6-/sa-(14Ge45)', 'mo-1-/ra-(07Cn25)', 'mo-2-/ke-(29Le40)'],
    ['hl', 'hl-10-/su-(12Sc50)', 'hl-8-/mo-(15Li30)', 'hl-3-/ma-(08Sa20)', 'hl-7-/me-(03Pi10)', 'hl-9-/ju-(18Vi55)', 'hl-5-/ve-(21Ar30)', 'hl-6-/sa-(14Ge45)', 'hl-1-/ra-(07Cn25)', 'hl-2-/ke-(29Le40)'],
    ['gl', 'gl-9-/su-(12Sc50)', 'gl-10-/mo-(15Li30)', 'gl-8-/ma-(08Sa20)', 'gl-3-/me-(03Pi10)', 'gl-7-/ju-(18Vi55)', 'gl-5-/ve-(21Ar30)', 'gl-6-/sa-(14Ge45)', 'gl-1-/ra-(07Cn25)', 'gl-2-/ke-(29Le40)'],
    ['vig', 'vig-8-/su-(12Sc50)', 'vig-9-/mo-(15Li30)', 'vig-10-/ma-(08Sa20)', 'vig-3-/me-(03Pi10)', 'vig-7-/ju-(18Vi55)', 'vig-5-/ve-(21Ar30)', 'vig-6-/sa-(14Ge45)', 'vig-1-/ra-(07Cn25)', 'vig-2-/ke-(29Le40)'],
    ['var', 'var-3-/su-(12Sc50)', 'var-8-/mo-(15Li30)', 'var-9-/ma-(08Sa20)', 'var-10-/me-(03Pi10)', 'var-7-/ju-(18Vi55)', 'var-5-/ve-(21Ar30)', 'var-6-/sa-(14Ge45)', 'var-1-/ra-(07Cn25)', 'var-2-/ke-(29Le40)'],
    ['sl', 'sl-7-/su-(12Sc50)', 'sl-3-/mo-(15Li30)', 'sl-8-/ma-(08Sa20)', 'sl-9-/me-(03Pi10)', 'sl-10-/ju-(18Vi55)', 'sl-5-/ve-(21Ar30)', 'sl-6-/sa-(14Ge45)', 'sl-1-/ra-(07Cn25)', 'sl-2-/ke-(29Le40)'],
    ['pp', 'pp-10-/su-(12Sc50)', 'pp-7-/mo-(15Li30)', 'pp-3-/ma-(08Sa20)', 'pp-8-/me-(03Pi10)', 'pp-9-/ju-(18Vi55)', 'pp-5-/ve-(21Ar30)', 'pp-6-/sa-(14Ge45)', 'pp-1-/ra-(07Cn25)', 'pp-2-/ke-(29Le40)'],
    ['in', 'in-9-/su-(12Sc50)', 'in-10-/mo-(15Li30)', 'in-7-/ma-(08Sa20)', 'in-3-/me-(03Pi10)', 'in-8-/ju-(18Vi55)', 'in-5-/ve-(21Ar30)', 'in-6-/sa-(14Ge45)', 'in-1-/ra-(07Cn25)', 'in-2-/ke-(29Le40)']
];

console.log('📊 Test Excel Data Structure:');
console.log(`   - Total rows: ${testData.length}`);
console.log(`   - Topics included: D-1 Set-1, D-3 Set-1, D-3 Set-2`);
console.log(`   - Elements per topic: 9 (as, mo, hl, gl, vig, var, sl, pp, in)`);
console.log(`   - Planets per element: 9 (Su, Mo, Ma, Me, Ju, Ve, Sa, Ra, Ke)`);

// Expected ABCD/BCD numbers for verification
console.log('\n🎯 Expected ABCD/BCD Numbers:');
console.log('   D-1 Set-1 Matrix: ABCD [1,2,4,7,9], BCD [5]');
console.log('   D-3 Set-1 Matrix: ABCD [1,2,5,9,10], BCD [7]');
console.log('   D-3 Set-2 Matrix: ABCD [3,7,8,9,10], BCD [5,6]');

// Examples of data that should get ABCD/BCD badges
console.log('\n🏷️ Expected Badge Examples for D-3 Set-1:');
console.log('   - as-1-/su-(...) → ABCD badge (number 1)');
console.log('   - as-2-/mo-(...) → ABCD badge (number 2)');
console.log('   - as-5-/ma-(...) → ABCD badge (number 5)');
console.log('   - hl-7-/ve-(...) → BCD badge (number 7)');
console.log('   - as-9-/me-(...) → ABCD badge (number 9)');
console.log('   - as-10-/ju-(...) → ABCD badge (number 10)');
console.log('   - as-3-/ke-(...) → No badge (number 3 not in ABCD/BCD)');

console.log('\n✅ Test Excel file data structure created successfully!');
console.log('Copy this data into an Excel file manually or use it for testing the upload functionality.');

export { testData };
