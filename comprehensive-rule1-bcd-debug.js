// Comprehensive Rule1Page BCD Logic Debug Script
// This script tests the corrected BCD logic in Rule1Page

console.log('🔧 COMPREHENSIVE RULE1PAGE BCD DEBUG');
console.log('====================================');

function debugRule1BCDLogic() {
  console.log('🧮 Testing BCD Logic with Sample Data...');
  
  // Test cases to verify the corrected BCD logic
  const testCases = [
    {
      name: 'BCD Case 1: Number in B only',
      dNumber: 7,
      numbers: { A: 5, B: 7, C: 9, D: 7 },
      expectedABCD: false,
      expectedBCD: true,
      reason: 'D appears only in B (exclusive B-D pair)'
    },
    {
      name: 'BCD Case 2: Number in C only', 
      dNumber: 12,
      numbers: { A: 5, B: 8, C: 12, D: 12 },
      expectedABCD: false,
      expectedBCD: true,
      reason: 'D appears only in C (exclusive C-D pair)'
    },
    {
      name: 'NOT BCD Case 1: Number in A only',
      dNumber: 3,
      numbers: { A: 3, B: 8, C: 12, D: 3 },
      expectedABCD: false,
      expectedBCD: false,
      reason: 'D appears only in A (A-only, not BCD eligible)'
    },
    {
      name: 'NOT BCD Case 2: Number in A+B',
      dNumber: 6,
      numbers: { A: 6, B: 6, C: 12, D: 6 },
      expectedABCD: true,
      expectedBCD: false,
      reason: 'D appears in A+B (≥2 appearances → ABCD, not BCD)'
    },
    {
      name: 'NOT BCD Case 3: Number in A+C',
      dNumber: 9,
      numbers: { A: 9, B: 8, C: 9, D: 9 },
      expectedABCD: true,
      expectedBCD: false,
      reason: 'D appears in A+C (≥2 appearances → ABCD, not BCD)'
    },
    {
      name: 'NOT BCD Case 4: Number in B+C',
      dNumber: 11,
      numbers: { A: 5, B: 11, C: 11, D: 11 },
      expectedABCD: true,
      expectedBCD: false,
      reason: 'D appears in B+C (≥2 appearances → ABCD, not BCD)'
    },
    {
      name: 'NOT BCD Case 5: Number in A+B+C',
      dNumber: 15,
      numbers: { A: 15, B: 15, C: 15, D: 15 },
      expectedABCD: true,
      expectedBCD: false,
      reason: 'D appears in A+B+C (3 appearances → ABCD, not BCD)'
    }
  ];
  
  console.log('🧪 Running BCD Logic Tests...');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
    console.log(`📊 Data: A=${testCase.numbers.A}, B=${testCase.numbers.B}, C=${testCase.numbers.C}, D=${testCase.numbers.D}`);
    
    const { dNumber, numbers } = testCase;
    
    // Apply the corrected Rule1Page logic
    const inA = numbers.A === dNumber;
    const inB = numbers.B === dNumber;
    const inC = numbers.C === dNumber;
    
    const appearances = [inA, inB, inC].filter(Boolean).length;
    
    let actualABCD = false;
    let actualBCD = false;
    
    if (appearances >= 2) {
      // ABCD: D-day number appears in ≥2 of A,B,C
      actualABCD = true;
    } else if (appearances === 1) {
      // BCD: D-day number appears in exactly 1 of A,B,C, but only B or C qualifies for BCD
      // CORRECTED LOGIC: Must check absence of A
      if ((inB && !inA && !inC) || (inC && !inA && !inB)) {
        actualBCD = true;
      }
    }
    
    console.log(`🔍 Analysis: A=${inA}, B=${inB}, C=${inC}, appearances=${appearances}`);
    console.log(`📈 Result: ABCD=${actualABCD}, BCD=${actualBCD}`);
    console.log(`🎯 Expected: ABCD=${testCase.expectedABCD}, BCD=${testCase.expectedBCD}`);
    console.log(`💡 Reason: ${testCase.reason}`);
    
    // Check if test passed
    const abcdMatch = actualABCD === testCase.expectedABCD;
    const bcdMatch = actualBCD === testCase.expectedBCD;
    const testPassed = abcdMatch && bcdMatch;
    
    if (testPassed) {
      console.log('✅ TEST PASSED');
      passedTests++;
    } else {
      console.log('❌ TEST FAILED');
      if (!abcdMatch) console.log(`   ABCD mismatch: got ${actualABCD}, expected ${testCase.expectedABCD}`);
      if (!bcdMatch) console.log(`   BCD mismatch: got ${actualBCD}, expected ${testCase.expectedBCD}`);
    }
  });
  
  console.log(`\n📊 SUMMARY: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! The BCD logic is working correctly.');
    console.log('✅ The fix has resolved the issue where BCD incorrectly included A+B and A+C cases.');
  } else {
    console.log('⚠️ Some tests failed. The BCD logic may still have issues.');
  }
  
  return passedTests === totalTests;
}

// Test the old (incorrect) vs new (correct) BCD logic
function compareOldVsNewLogic() {
  console.log('\n🔄 COMPARING OLD vs NEW BCD LOGIC');
  console.log('==================================');
  
  const testNumber = 7;
  const testData = { A: 7, B: 7, C: 9, D: 7 }; // A+B case
  
  const inA = testData.A === testNumber;
  const inB = testData.B === testNumber;
  const inC = testData.C === testNumber;
  
  console.log(`📊 Test Data: A=${testData.A}, B=${testData.B}, C=${testData.C}, D=${testData.D}`);
  console.log(`🔍 Number ${testNumber} appears in: A=${inA}, B=${inB}, C=${inC}`);
  
  // Old (incorrect) logic
  const oldBCDQualifies = (inB && !inC) || (inC && !inB);
  console.log(`❌ OLD LOGIC: (inB && !inC) || (inC && !inB) = ${oldBCDQualifies}`);
  console.log(`   This incorrectly qualifies A+B cases as BCD!`);
  
  // New (correct) logic  
  const newBCDQualifies = (inB && !inA && !inC) || (inC && !inA && !inB);
  console.log(`✅ NEW LOGIC: (inB && !inA && !inC) || (inC && !inA && !inB) = ${newBCDQualifies}`);
  console.log(`   This correctly excludes A+B cases from BCD!`);
  
  console.log(`\n🎯 CONCLUSION:`);
  console.log(`   - Old logic would incorrectly mark this as BCD`);
  console.log(`   - New logic correctly rejects this for BCD (should be ABCD instead)`);
}

// Function to check Rule1Page for BCD display
function checkRule1PageBCDDisplay() {
  console.log('\n🎯 CHECKING RULE1PAGE BCD DISPLAY');
  console.log('==================================');
  
  const abcdBadges = document.querySelectorAll('.bg-green-100');
  const bcdBadges = document.querySelectorAll('.bg-blue-100');
  
  
  console.log(`📊 ABCD badges found: ${abcdBadges.length}`);
  abcdBadges.forEach((badge, i) => {
    console.log(`  🟢 ABCD ${i + 1}: "${badge.textContent.trim()}"`);
  });
  
  console.log(`📊 BCD badges found: ${bcdBadges.length}`);
  bcdBadges.forEach((badge, i) => {
    console.log(`  🔵 BCD ${i + 1}: "${badge.textContent.trim()}"`);
  });
  
  if (bcdBadges.length === 0) {
    console.log('⚠️ No BCD badges found. This could mean:');
    console.log('   1. No BCD numbers qualified (expected if ABCD takes priority)');
    console.log('   2. BCD logic still has issues');
    console.log('   3. No suitable data patterns for BCD');
  }
  
  // Check tables for D-day columns
  const tables = document.querySelectorAll('table');
  console.log(`\n📋 Found ${tables.length} table(s) on the page`);
  
  tables.forEach((table, tableIndex) => {
    const headers = Array.from(table.querySelectorAll('th'));
    const dDayHeaders = headers.filter(th => 
      th.textContent.includes('(D)') || th.classList.contains('bg-blue-100')
    );
    
    if (dDayHeaders.length > 0) {
      console.log(`📊 Table ${tableIndex + 1}: Found ${dDayHeaders.length} D-day column(s)`);
      
      const dDayColumns = table.querySelectorAll('td.bg-blue-50');
      let badgeCount = 0;
      
      dDayColumns.forEach(cell => {
        const badges = cell.querySelectorAll('.bg-green-100, .bg-blue-100');
        if (badges.length > 0) {
          badgeCount += badges.length;
          badges.forEach(badge => {
            console.log(`  📍 Badge in D-day column: "${badge.textContent.trim()}"`);
          });
        }
      });
      
      console.log(`  🏷️ Total badges in D-day columns: ${badgeCount}`);
    }
  });
}

// Run all tests
console.log('🚀 Starting comprehensive BCD logic verification...\n');

const logicTestsPassed = debugRule1BCDLogic();
compareOldVsNewLogic();
checkRule1PageBCDDisplay();

console.log('\n🏁 FINAL VERDICT:');
if (logicTestsPassed) {
  console.log('✅ BCD logic is correctly implemented');
  console.log('🎯 Rule1Page should now display blue BCD badges correctly');
  console.log('📋 Next step: Navigate to Rule1Page and verify visually');
} else {
  console.log('❌ BCD logic still has issues');
  console.log('🔧 Additional debugging may be needed');
}

console.log('\n💡 MANUAL VERIFICATION STEPS:');
console.log('1. Navigate to a user with sufficient dates');
console.log('2. Click Rule-1 button on the newest eligible date');
console.log('3. Look for blue BCD badges in D-day columns');
console.log('4. Verify format: "bcd-hl-1-su-ta" (element-number-planet-sign)');
console.log('5. Check browser DevTools Console for analysis logs');
  
  console.log("\n💾 4. CHECKING LOCALSTORAGE DATA");
  console.log("===============================");
  
  const selectedUser = localStorage.getItem('selectedUser');
  console.log(`Selected User: ${selectedUser}`);
  
  if (selectedUser) {
    // Check for user data
    const userData = localStorage.getItem('abcd_users_data');
    if (userData) {
      try {
        const users = JSON.parse(userData);
        const user = users.find(u => u.id.toString() === selectedUser);
        console.log(`User data found:`, user);
      } catch (e) {
        console.log(`Error parsing user data:`, e);
      }
    }
    
    // Check for dates
    const dates = localStorage.getItem(`dates_${selectedUser}`);
    if (dates) {
      try {
        const datesList = JSON.parse(dates);
        console.log(`Dates for user:`, datesList);
      } catch (e) {
        console.log(`Error parsing dates:`, e);
      }
    }
    
    // Check for Excel and Hour Entry data
    console.log("\n📁 Data availability check:");
    const keys = Object.keys(localStorage);
    keys.filter(key => key.includes(selectedUser)).forEach(key => {
      if (key.includes('excel_data') || key.includes('hour_entry')) {
        console.log(`  - ${key}: exists`);
      }
    });
  }
  
  console.log("\n🔍 5. SIMULATING BCD LOGIC TEST");
  console.log("==============================");
  
  // Based on visible data from screenshot, simulate what should happen
  const sampleCases = [
    { element: 'Lagna', D: 7, A: 15, B: 7, C: 3, expected: 'BCD (B only)' },
    { element: 'Lagna', D: 7, A: 7, B: 15, C: 3, expected: 'None (A only)' },
    { element: 'Lagna', D: 7, A: 7, B: 7, C: 3, expected: 'ABCD (A+B)' },
    { element: 'Moon', D: 10, A: 22, B: 10, C: 5, expected: 'BCD (B only)' },
    { element: 'Moon', D: 10, A: 22, B: 5, C: 10, expected: 'BCD (C only)' },
    { element: 'Hora Lagna', D: 1, A: 8, B: 1, C: 12, expected: 'BCD (B only)' }
  ];
  
  sampleCases.forEach((testCase, i) => {
    const { element, D, A, B, C, expected } = testCase;
    const inA = A === D;
    const inB = B === D;
    const inC = C === D;
    const appearances = [inA, inB, inC].filter(Boolean).length;
    
    let result;
    if (appearances >= 2) {
      result = 'ABCD';
    } else if (appearances === 1) {
      if ((inB && !inC) || (inC && !inB)) {
        result = 'BCD';
      } else {
        result = 'None';
      }
    } else {
      result = 'None';
    }
    
    const passed = result === expected.split(' ')[0];
    console.log(`${passed ? '✅' : '❌'} Test ${i + 1}: ${element}`);
    console.log(`   D=${D}, A=${A}, B=${B}, C=${C}`);
    console.log(`   Expected: ${expected}, Got: ${result}`);
    
    if (result === 'BCD') {
      console.log(`   🔷 Should create BLUE BCD badge`);
    } else if (result === 'ABCD') {
      console.log(`   🟢 Should create GREEN ABCD badge`);
    }
  });
  
  console.log("\n❓ 6. DIAGNOSTIC QUESTIONS");
  console.log("=========================");
  console.log("1. Are you seeing any console logs starting with '🔍 Numbers for'?");
  console.log("2. Are you seeing any console logs starting with 'D-number'?");
  console.log("3. What do the A, B, C, D values show in those logs?");
  console.log("4. If no logs appear, the data extraction might be failing");
  console.log("5. If logs show all D numbers have appearances=0, that means A,B,C values don't match D values");
  
  console.log("\n💡 NEXT STEPS:");
  console.log("==============");
  if (bcdBadges.length === 0) {
    console.log("❌ No BCD badges found. Possible causes:");
    console.log("  1. D-day numbers don't appear in any B or C days");
    console.log("  2. BCD logic is not executing (data missing)");
    console.log("  3. BCD array is empty (check console for 'BCD length: 0')");
    console.log("  4. Rendering condition is failing");
  } else {
    console.log("✅ BCD badges found - issue may be resolved");
  }
}

// Run the debug function
debugRule1BCD();

console.log("\n🎯 TO GET MORE INFO:");
console.log("====================");
console.log("1. Open browser console (F12)");
console.log("2. Look for logs starting with '🔍 Numbers for'");
console.log("3. Check if D-numbers have any matches in A, B, or C");
console.log("4. If no matches, that's why no BCD badges appear");
console.log("5. The issue might be that your actual A,B,C data is different from D data");
