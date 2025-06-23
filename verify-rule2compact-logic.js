// Manual Verification of Rule2CompactPage ABCD/BCD Analysis
// Based on user-provided test data from 2025-06-05

console.log('🔍 Manual Verification of ABCD/BCD Analysis');
console.log('='.repeat(60));

// Test data provided by user
const testData = {
  triggerDate: '2025-06-05',
  abcdSequence: {
    A: '2025-06-01',
    B: '2025-06-02', 
    C: '2025-06-03',
    D: '2025-06-04'
  },
  setName: 'D-1 Set-1 Matrix',
  reportedResults: {
    abcdNumbers: [7, 10],
    bcdNumbers: [3, 6, 8]
  },
  matrixData: {
    'Lagna': {
      A: 'as-5-/ra-(29 Li 39)-(29 Aq 49)',
      B: 'as-5-/sa-(06 Sc 18)-(06 Pi 07)', 
      C: 'as-8-/su-(29 Li 39)-(07 Ta 24)',
      D: 'as-7-/me-(29 Li 39)-(28 Ar 13)'
    },
    'Moon': {
      A: 'mo-12-/ra-(02 Pi 18)-(29 Aq 49)',
      B: 'mo-10-/sa-(16 Ge 04)-(06 Pi 07)',
      C: 'mo-3-/su-(02 Pi 18)-(07 Ta 24)', 
      D: 'mo-2-/me-(02 Pi 18)-(28 Ar 13)'
    },
    'Hora Lagna': {
      A: 'hl-11-/ra-(22 Ar 45)-(29 Aq 49)',
      B: 'hl-12-/sa-(29 Ar 11)-(06 Pi 07)',
      C: 'hl-2-/su-(22 Ar 45)-(07 Ta 24)',
      D: 'hl-1-/me-(22 Ar 45)-(28 Ar 13)'
    },
    'Ghati Lagna': {
      A: 'gl-5-/ra-(01 Li 29)-(29 Aq 49)',
      B: 'gl-6-/sa-(07 Li 27)-(06 Pi 07)',
      C: 'gl-8-/su-(01 Li 29)-(07 Ta 24)',
      D: 'gl-7-/me-(01 Li 29)-(28 Ar 13)'
    },
    'Vighati Lagna': {
      A: 'vig-3-/ra-(15 Sg 09)-(29 Aq 49)',
      B: 'vig-4-/sa-(18 Sg 48)-(06 Pi 07)',
      C: 'vig-6-/su-(15 Sg 09)-(07 Ta 24)',
      D: 'vig-5-/me-(15 Sg 09)-(28 Ar 13)'
    },
    'Varnada Lagna': {
      A: 'var-4-/ra-(29 Sc 39)-(29 Aq 49)',
      B: 'var-4-/sa-(06 Sg 18)-(06 Pi 07)',
      C: 'var-7-/su-(29 Sc 39)-(07 Ta 24)',
      D: 'var-6-/me-(29 Sc 39)-(28 Ar 13)'
    },
    'Sree Lagna': {
      A: 'sl-5-/ra-(01 Li 49)-(29 Aq 49)',
      B: 'sl-9-/sa-(20 Cn 07)-(06 Pi 07)',
      C: 'sl-8-/su-(01 Li 49)-(07 Ta 24)',
      D: 'sl-7-/me-(01 Li 49)-(28 Ar 13)'
    },
    'Pranapada Lagna': {
      A: 'pp-7-/ra-(15 Le 36)-(29 Aq 49)',
      B: 'pp-8-/sa-(19 Le 16)-(06 Pi 07)',
      C: 'pp-10-/su-(15 Le 36)-(07 Ta 24)',
      D: 'pp-9-/me-(15 Le 36)-(28 Ar 13)'
    },
    'Indu Lagna': {
      A: 'in-11-/ra-(02 Ar 18)-(29 Aq 49)',
      B: 'in-6-/sa-(16 Li 04)-(06 Pi 07)',
      C: 'in-2-/su-(02 Ar 18)-(07 Ta 24)',
      D: 'in-1-/me-(02 Ar 18)-(28 Ar 13)'
    }
  }
};

// Extract element numbers function (same as Rule2CompactPage)
const extractElementNumber = (str) => {
  if (typeof str !== 'string') return null;
  const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
  return match ? Number(match[1]) : null;
};

console.log('\n1. EXTRACTING NUMBERS FROM EACH DAY:');
console.log('=' .repeat(40));

// Extract numbers from each day
const dayNumbers = {};
['A', 'B', 'C', 'D'].forEach(day => {
  const numbers = new Set();
  Object.entries(testData.matrixData).forEach(([element, dayData]) => {
    const elementStr = dayData[day];
    const number = extractElementNumber(elementStr);
    if (number !== null) {
      numbers.add(number);
    }
  });
  dayNumbers[day] = Array.from(numbers).sort((a, b) => a - b);
  console.log(`${day}-day (${testData.abcdSequence[day]}): [${dayNumbers[day].join(', ')}]`);
});

console.log('\n2. DETAILED ELEMENT ANALYSIS:');
console.log('=' .repeat(40));

Object.entries(testData.matrixData).forEach(([element, dayData]) => {
  console.log(`\n${element}:`);
  ['A', 'B', 'C', 'D'].forEach(day => {
    const number = extractElementNumber(dayData[day]);
    console.log(`  ${day}: ${dayData[day]} → ${number}`);
  });
});

console.log('\n3. ABCD ANALYSIS (≥2 occurrences in A,B,C days):');
console.log('=' .repeat(40));

const abcdCandidates = dayNumbers.D.filter(dNum => {
  let count = 0;
  if (dayNumbers.A.includes(dNum)) count++;
  if (dayNumbers.B.includes(dNum)) count++;
  if (dayNumbers.C.includes(dNum)) count++;
  
  const qualified = count >= 2;
  console.log(`D-day number ${dNum}: appears in ${count}/3 ABC days → ${qualified ? '✅ ABCD' : '❌ Not ABCD'}`);
  
  if (qualified) {
    const days = [];
    if (dayNumbers.A.includes(dNum)) days.push('A');
    if (dayNumbers.B.includes(dNum)) days.push('B');
    if (dayNumbers.C.includes(dNum)) days.push('C');
    console.log(`   → Found in days: ${days.join(', ')}`);
  }
  
  return qualified;
});

console.log(`\n✅ ABCD Numbers: [${abcdCandidates.join(', ')}]`);

console.log('\n4. BCD ANALYSIS (exclusive B-D or C-D pairs):');
console.log('=' .repeat(40));

const bcdCandidates = dayNumbers.D.filter(dNum => {
  const inA = dayNumbers.A.includes(dNum);
  const inB = dayNumbers.B.includes(dNum);
  const inC = dayNumbers.C.includes(dNum);
  
  // BCD qualification: (B-D pair only) OR (C-D pair only) - exclude if in both B and C
  const bOnlyPair = inB && !inC; // B-D pair but NOT in C
  const cOnlyPair = inC && !inB; // C-D pair but NOT in B
  const qualified = bOnlyPair || cOnlyPair;
  
  console.log(`D-day number ${dNum}: A(${inA ? '✅' : '❌'}) B(${inB ? '✅' : '❌'}) C(${inC ? '✅' : '❌'}) → ${qualified ? '✅ BCD' : '❌ Not BCD'}`);
  
  if (qualified) {
    if (bOnlyPair) console.log(`   → B-D exclusive pair (not in C)`);
    if (cOnlyPair) console.log(`   → C-D exclusive pair (not in B)`);
  } else if (inB && inC) {
    console.log(`   → Rejected: appears in both B and C (not exclusive)`);
  } else if (!inB && !inC) {
    console.log(`   → Rejected: not in B or C`);
  }
  
  return qualified;
});

console.log(`\n✅ BCD Candidates: [${bcdCandidates.join(', ')}]`);

console.log('\n5. MUTUAL EXCLUSIVITY (ABCD takes priority):');
console.log('=' .repeat(40));

const finalBcdNumbers = bcdCandidates.filter(num => {
  const excluded = abcdCandidates.includes(num);
  if (excluded) {
    console.log(`❌ Number ${num} excluded from BCD (already in ABCD)`);
  } else {
    console.log(`✅ Number ${num} included in final BCD`);
  }
  return !excluded;
});

console.log('\n6. FINAL RESULTS:');
console.log('=' .repeat(40));
console.log(`✅ Final ABCD Numbers: [${abcdCandidates.join(', ')}]`);
console.log(`✅ Final BCD Numbers: [${finalBcdNumbers.join(', ')}]`);

console.log('\n7. COMPARISON WITH REPORTED RESULTS:');
console.log('=' .repeat(40));

const reportedABCD = testData.reportedResults.abcdNumbers;
const reportedBCD = testData.reportedResults.bcdNumbers;

console.log(`Reported ABCD: [${reportedABCD.join(', ')}]`);
console.log(`Calculated ABCD: [${abcdCandidates.join(', ')}]`);
console.log(`ABCD Match: ${JSON.stringify(reportedABCD) === JSON.stringify(abcdCandidates) ? '✅ CORRECT' : '❌ MISMATCH'}`);

console.log(`\nReported BCD: [${reportedBCD.join(', ')}]`);
console.log(`Calculated BCD: [${finalBcdNumbers.join(', ')}]`);
console.log(`BCD Match: ${JSON.stringify(reportedBCD) === JSON.stringify(finalBcdNumbers) ? '✅ CORRECT' : '❌ MISMATCH'}`);

console.log('\n8. VERIFICATION SUMMARY:');
console.log('=' .repeat(40));

if (JSON.stringify(reportedABCD) === JSON.stringify(abcdCandidates) && 
    JSON.stringify(reportedBCD) === JSON.stringify(finalBcdNumbers)) {
  console.log('🎉 VERIFICATION PASSED: Rule2CompactPage logic is working correctly!');
  console.log('✅ ABCD numbers correctly identified');
  console.log('✅ BCD numbers correctly identified'); 
  console.log('✅ Mutual exclusivity properly applied');
} else {
  console.log('⚠️ VERIFICATION FAILED: There are discrepancies in the results');
  console.log('🔍 Please check the analysis above for details');
}

console.log('\n🎯 CONCLUSION: Rule2CompactPage ABCD/BCD analysis logic verification complete.');
