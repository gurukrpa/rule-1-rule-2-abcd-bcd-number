// Test formatABCDResult function for Rule-1 page
console.log('🧪 Testing formatABCDResult function for Rule-1');

// Mock the formatABCDResult function to test different data formats
function formatABCDResult(numbers, elementName, type, mockDData) {
  if (!numbers || numbers.length === 0) return '';
  
  // Convert element name to code
  const elementCodes = {
    'Lagna': 'as',
    'Moon': 'mo',
    'Hora Lagna': 'hl',
    'Ghati Lagna': 'gl',
    'Vighati Lagna': 'vig',
    'Varnada Lagna': 'var',
    'Sree Lagna': 'sl',
    'Pranapada Lagna': 'pp',
    'Indu Lagna': 'in'
  };
  
  const elementCode = elementCodes[elementName] || elementName.toLowerCase();
  
  // For each number, try to extract sign abbreviation from D-day data  
  return numbers.map(number => {
    let signCode = '';
    
    // Use mock D-day data for testing
    const dData = mockDData;
    
    if (dData && typeof dData === 'string') {
      // Try to extract sign from various possible formats:
      // 1. Look for patterns like "(10 Sc 03)" or "(17 Ta 58)"
      const degreePattern = /\((\d+)\s+([A-Za-z]{2})\s+\d+\)/g;
      const matches = [...dData.matchAll(degreePattern)];
      
      for (const match of matches) {
        if (parseInt(match[1]) === number) {
          signCode = match[2].toLowerCase();
          break;
        }
      }        // 2. If no degree pattern found, try to extract from number+sign patterns
        if (!signCode) {
          // Look for patterns like "as-7Sc34" or "12Ta56" where number is followed by sign
          const numberSignPattern = new RegExp(`${number}([A-Za-z]{2})\\d*`, 'i');
          const signMatch = dData.match(numberSignPattern);
          if (signMatch) {
            // Verify it's a valid zodiac sign
            const validSigns = ['ar', 'ta', 'ge', 'cn', 'le', 'vi', 'li', 'sc', 'sg', 'cp', 'aq', 'pi'];
            const foundSign = signMatch[1].toLowerCase();
            if (validSigns.includes(foundSign)) {
              signCode = foundSign;
            }
          }
        }
        
        // 3. Try reverse pattern: sign followed by number (like "Sc10" or "Ta17")
        if (!signCode) {
          const signNumberPattern = new RegExp(`([A-Za-z]{2})${number}(?:\\D|$)`, 'i');
          const signMatch = dData.match(signNumberPattern);
          if (signMatch) {
            const validSigns = ['ar', 'ta', 'ge', 'cn', 'le', 'vi', 'li', 'sc', 'sg', 'cp', 'aq', 'pi'];
            const foundSign = signMatch[1].toLowerCase();
            if (validSigns.includes(foundSign)) {
              signCode = foundSign;
            }
          }
        }
    }
    
    // Format: abcd-as-7-sc or bcd-hl-1-ta
    return `${type.toLowerCase()}-${elementCode}-${number}${signCode ? '-' + signCode : ''}`;
  }).join(', ');
}

// Test cases with different data formats
const testCases = [
  {
    name: 'Degree format with parentheses',
    data: 'as-7/su-(10 Sc 03)-(17 Ta 58)',
    numbers: [10, 17],
    element: 'Lagna',
    type: 'ABCD',
    expected: 'abcd-as-10-sc, abcd-as-17-ta'
  },
  {
    name: 'Simple format without parentheses',
    data: 'as-7/su-12',
    numbers: [7],
    element: 'Lagna', 
    type: 'ABCD',
    expected: 'abcd-as-7' // No sign extractable from this format
  },
  {
    name: 'Number with sign pattern',
    data: 'as-7Sc34/su-12Ta56',
    numbers: [7, 12],
    element: 'Lagna',
    type: 'BCD',
    expected: 'bcd-as-7-sc, bcd-as-12-ta'
  },
  {
    name: 'Mixed format',
    data: 'hl-15/mo-(8 Vi 22)-(3 Ar 45)',
    numbers: [8, 3, 15],
    element: 'Hora Lagna',
    type: 'ABCD',
    expected: 'abcd-hl-8-vi, abcd-hl-3-ar, abcd-hl-15' // 15 has no sign in parentheses
  },
  {
    name: 'No signs available',
    data: 'as-7/su-12',
    numbers: [9], // Number not in data
    element: 'Moon',
    type: 'BCD',
    expected: 'bcd-mo-9' // No sign extractable
  }
];

console.log('\n📋 Running formatABCDResult tests:\n');

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`Data: "${test.data}"`);
  console.log(`Numbers: [${test.numbers.join(', ')}]`);
  console.log(`Element: ${test.element}, Type: ${test.type}`);
  
  const result = formatABCDResult(test.numbers, test.element, test.type, test.data);
  console.log(`Result: "${result}"`);
  console.log(`Expected: "${test.expected}"`);
  console.log(`Match: ${result === test.expected ? '✅' : '❌'}`);
  console.log('---');
});

console.log('\n🔍 Pattern Explanation:');
console.log('1. First tries degree format: "(10 Sc 03)" → number=10, sign=sc');
console.log('2. Then tries number+sign: "7Sc34" → number=7, sign=sc');  
console.log('3. Finally tries any valid sign: first valid 2-letter pattern');
console.log('4. Valid signs: ar, ta, ge, cn, le, vi, li, sc, sg, cp, aq, pi');

console.log('\n✅ formatABCDResult function test completed');
