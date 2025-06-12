// Quick BCD Debug Test
// This tests if the issue is with the logic or data

console.log("🔍 QUICK BCD DEBUG TEST");

// Based on the screenshot, let's test with actual visible data
const testData = {
  // From the screenshot we can see:
  // Lagna: as-7-/su-(10 Sc 03)-(17 Ta 58) -> D=7
  // Moon: mo-10-/su-(09 Le 45)-(17 Ta 58) -> D=10  
  // Hora Lagna: hl-1-/su-(02 Ta 45)-(17 Ta 58) -> D=1
  
  testCases: [
    {
      element: 'Lagna',
      dNumber: 7,
      // We need to guess A, B, C values since they're not visible in screenshot
      // Let's test various scenarios
      scenarios: [
        { A: 7, B: 15, C: 3, desc: 'D appears in A (should be ABCD if A+B or A+C, or none if only A)' },
        { A: 15, B: 7, C: 3, desc: 'D appears in B only (should be BCD)' },
        { A: 15, B: 3, C: 7, desc: 'D appears in C only (should be BCD)' },
        { A: 7, B: 7, C: 3, desc: 'D appears in A and B (should be ABCD)' },
      ]
    },
    {
      element: 'Moon', 
      dNumber: 10,
      scenarios: [
        { A: 10, B: 22, C: 5, desc: 'D appears in A only (should be none)' },
        { A: 22, B: 10, C: 5, desc: 'D appears in B only (should be BCD)' },
        { A: 22, B: 5, C: 10, desc: 'D appears in C only (should be BCD)' },
      ]
    },
    {
      element: 'Hora Lagna',
      dNumber: 1,
      scenarios: [
        { A: 1, B: 8, C: 12, desc: 'D appears in A only (should be none)' },
        { A: 8, B: 1, C: 12, desc: 'D appears in B only (should be BCD)' },
        { A: 8, B: 12, C: 1, desc: 'D appears in C only (should be BCD)' },
      ]
    }
  ]
};

testData.testCases.forEach(testCase => {
  console.log(`\n🧪 Testing ${testCase.element} (D=${testCase.dNumber}):`);
  
  testCase.scenarios.forEach((scenario, i) => {
    const { A, B, C, desc } = scenario;
    const dNumber = testCase.dNumber;
    
    const inA = A === dNumber;
    const inB = B === dNumber;
    const inC = C === dNumber;
    
    const appearances = [inA, inB, inC].filter(Boolean).length;
    
    let result = 'None';
    if (appearances >= 2) {
      result = 'ABCD';
    } else if (appearances === 1) {
      if ((inB && !inC) || (inC && !inB)) {
        result = 'BCD';
      }
    }
    
    console.log(`  Scenario ${i + 1}: ${desc}`);
    console.log(`    A=${A}, B=${B}, C=${C}, D=${dNumber}`);
    console.log(`    Appears in: A=${inA}, B=${inB}, C=${inC} (${appearances} total)`);
    console.log(`    Result: ${result}`);
    
    if (result === 'BCD') {
      console.log(`    ✅ Should show BLUE BCD badge`);
    } else if (result === 'ABCD') {
      console.log(`    ✅ Should show GREEN ABCD badge`);
    } else {
      console.log(`    ❌ No badge should show`);
    }
  });
});

console.log(`\n💡 DEBUGGING STEPS:`);
console.log(`1. Check browser console on Rule-1 page for debug logs`);
console.log(`2. Look for "🔍 Debug [Element]-HR1:" messages`);
console.log(`3. Verify that BCD arrays have values when expected`);
console.log(`4. If BCD arrays are empty, the issue is in the BCD logic`);
console.log(`5. If BCD arrays have values but no blue badges show, it's a rendering issue`);
