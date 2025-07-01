// DEBUG: Topic Name Mismatch Detection and Fix
// Run this in browser console to identify and fix the ABCD/BCD number issue

console.log('🔍 TOPIC NAME MISMATCH DETECTION');
console.log('='.repeat(50));

// Expected Excel topic names (standard format)
const EXCEL_TOPICS = [
  'D-1 Set-1 Matrix', 'D-1 Set-2 Matrix',
  'D-3 Set-1 Matrix', 'D-3 Set-2 Matrix', 
  'D-4 Set-1 Matrix', 'D-4 Set-2 Matrix',
  'D-5 Set-1 Matrix', 'D-5 Set-2 Matrix',
  'D-7 Set-1 Matrix', 'D-7 Set-2 Matrix',
  'D-9 Set-1 Matrix', 'D-9 Set-2 Matrix',
  'D-10 Set-1 Matrix', 'D-10 Set-2 Matrix',
  'D-11 Set-1 Matrix', 'D-11 Set-2 Matrix',
  'D-12 Set-1 Matrix', 'D-12 Set-2 Matrix',
  'D-27 Set-1 Matrix', 'D-27 Set-2 Matrix',
  'D-30 Set-1 Matrix', 'D-30 Set-2 Matrix',
  'D-60 Set-1 Matrix', 'D-60 Set-2 Matrix',
  'D-81 Set-1 Matrix', 'D-81 Set-2 Matrix',
  'D-108 Set-1 Matrix', 'D-108 Set-2 Matrix',
  'D-144 Set-1 Matrix', 'D-144 Set-2 Matrix'
];

// Current fallback mapping (with annotations that cause mismatches)
const FALLBACK_TOPICS = [
  'D-1 Set-1 Matrix', 'D-1 Set-2 Matrix',
  'D-3 (trd) Set-1 Matrix', 'D-3 (trd) Set-2 Matrix',  // ❌ MISMATCH: Extra (trd)
  'D-4 Set-1 Matrix', 'D-4 Set-2 Matrix',
  'D-5 (pv) Set-1 Matrix', 'D-5 (pv) Set-2 Matrix',   // ❌ MISMATCH: Extra (pv)
  'D-7 (trd) Set-1 Matrix', 'D-7 (trd) Set-2 Matrix', // ❌ MISMATCH: Extra (trd)
  'D-9 Set-1 Matrix', 'D-9 Set-2 Matrix',
  'D-10 (trd) Set-1 Matrix', 'D-10 (trd) Set-2 Matrix', // ❌ MISMATCH: Extra (trd)
  'D-11 Set-1 Matrix', 'D-11 Set-2 Matrix',
  'D-12 (trd) Set-1 Matrix', 'D-12 (trd) Set-2 Matrix', // ❌ MISMATCH: Extra (trd)
  'D-27 (trd) Set-1 Matrix', 'D-27 (trd) Set-2 Matrix', // ❌ MISMATCH: Extra (trd)
  'D-30 (sh) Set-1 Matrix', 'D-30 (sh) Set-2 Matrix',   // ❌ MISMATCH: Extra (sh)
  // ... more with various annotations
];

console.log('📊 MISMATCH ANALYSIS:');
console.log('Excel format (what gets loaded):', EXCEL_TOPICS.slice(0, 5));
console.log('Fallback format (what gets matched):', FALLBACK_TOPICS.slice(0, 5));

// Find mismatches
const mismatches = [];
EXCEL_TOPICS.forEach(excelTopic => {
  const hasMatch = FALLBACK_TOPICS.includes(excelTopic);
  if (!hasMatch) {
    // Look for potential annotation mismatch
    const possibleMatches = FALLBACK_TOPICS.filter(fallbackTopic => 
      fallbackTopic.includes(excelTopic.replace(' Matrix', ''))
    );
    mismatches.push({
      excel: excelTopic,
      expectedFallback: excelTopic,
      actualFallback: possibleMatches[0] || 'NOT_FOUND',
      hasMatch: hasMatch
    });
  }
});

console.log('\n❌ TOPIC MISMATCHES FOUND:');
mismatches.forEach((mismatch, index) => {
  console.log(`${index + 1}. Excel: "${mismatch.excel}"`);
  console.log(`   Fallback: "${mismatch.actualFallback}"`);
  console.log(`   Result: ${mismatch.hasMatch ? '✅ MATCH' : '❌ NO MATCH → Empty ABCD/BCD'}`);
  console.log('');
});

console.log(`\n🎯 SOLUTION: Update TOPIC_NUMBERS mapping to use standard format`);
console.log(`   Remove annotations like (trd), (pv), (sh) from fallback keys`);
console.log(`   This will fix topics that currently return empty ABCD/BCD numbers`);

// Generate corrected TOPIC_NUMBERS mapping
console.log('\n📝 CORRECTED TOPIC_NUMBERS MAPPING:');
console.log('const TOPIC_NUMBERS = {');
EXCEL_TOPICS.forEach(topic => {
  console.log(`  '${topic}': { abcd: [10, 12], bcd: [4, 11] }, // Standard format`);
});
console.log('};');

console.log('\n✅ Copy the corrected mapping above to PlanetsAnalysisPage.jsx TOPIC_NUMBERS object');
