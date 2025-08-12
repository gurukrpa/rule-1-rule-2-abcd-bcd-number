// Debug script to analyze D-3 Set-1 topic matching issue
// Run this in browser console on Planets Analysis page

console.log('🔍 Starting D-3 Set-1 topic matching debug...');

// Check if TOPIC_NUMBERS contains D-3 Set-1
const TOPIC_NUMBERS = {
  'D-1 Set-1 Matrix': { abcd: [1, 2, 4, 7, 9], bcd: [5] },
  'D-1 Set-2 Matrix': { abcd: [3, 5, 7, 10, 12], bcd: [] },
  'D-3 Set-1 Matrix': { abcd: [1, 2, 5, 9, 10], bcd: [7] },
  'D-3 Set-2 Matrix': { abcd: [3, 7, 8, 9, 10], bcd: [5, 6] },
  // ... other topics
};

console.log('✅ TOPIC_NUMBERS check:');
console.log('D-3 Set-1 Matrix exists:', 'D-3 Set-1 Matrix' in TOPIC_NUMBERS);
console.log('D-3 Set-1 Matrix data:', TOPIC_NUMBERS['D-3 Set-1 Matrix']);

// Check topic name variations that might be in Excel
const possibleVariations = [
  'D-3 Set-1 Matrix',
  'D-3 (trd) Set-1 Matrix',
  'D-3 Set-1',
  'D-3 (trd) Set-1',
  'D3 Set-1 Matrix',
  'D-3Set-1Matrix',
  'D-3 Set-1Matrix'
];

console.log('\n🔍 Checking possible topic name variations:');
possibleVariations.forEach(variation => {
  const exists = variation in TOPIC_NUMBERS;
  console.log(`${exists ? '✅' : '❌'} "${variation}": ${exists}`);
});

// Simulate getTopicNumbers function
function debugGetTopicNumbers(setName) {
  console.log(`\n🎯 Testing getTopicNumbers("${setName}"):`);
  
  const fallbackNumbers = TOPIC_NUMBERS[setName];
  if (fallbackNumbers) {
    console.log(`✅ Found in TOPIC_NUMBERS:`, fallbackNumbers);
    return fallbackNumbers;
  }
  
  console.log(`❌ NOT FOUND in TOPIC_NUMBERS`);
  console.log(`Available keys:`, Object.keys(TOPIC_NUMBERS).filter(key => key.includes('D-3')));
  return { abcd: [], bcd: [] };
}

// Test different variations
console.log('\n📊 Testing getTopicNumbers with variations:');
possibleVariations.forEach(variation => {
  debugGetTopicNumbers(variation);
});

// Check if we can extract element numbers from planet data
function testElementExtraction() {
  console.log('\n🔢 Testing element number extraction:');
  
  const testData = [
    'as-7-/su-(12 Sc 50)-(20 Ta 50)',
    'mo-3-/ma-(15 Li 30)-(10 Ge 45)',
    'hl-5-/ju-(08 Sa 20)-(25 Aq 15)',
    'gl-9-/ve-(03 Pi 10)-(18 Vi 55)'
  ];
  
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    const match = str.match(/^[a-z]+-(\d+)/);
    return match ? Number(match[1]) : null;
  };
  
  testData.forEach(data => {
    const number = extractElementNumber(data);
    console.log(`Data: "${data}" → Number: ${number}`);
  });
}

testElementExtraction();

// Final summary
console.log('\n📋 SUMMARY:');
console.log('• D-3 Set-1 Matrix exists in TOPIC_NUMBERS with data: { abcd: [1, 2, 5, 9, 10], bcd: [7] }');
console.log('• If you\'re seeing only planet names, the issue might be:');
console.log('  1. Topic name mismatch (Excel uses different format)');
console.log('  2. getTopicNumbers() not being called correctly');
console.log('  3. renderABCDBadges() not being executed');
console.log('  4. Element number extraction failing');

console.log('\n🔧 Next steps:');
console.log('1. Check browser console for topic-specific log messages');
console.log('2. Verify actual Excel topic names in uploaded data');
console.log('3. Test renderABCDBadges function manually');
