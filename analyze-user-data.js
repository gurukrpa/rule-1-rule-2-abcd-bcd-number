// 🎯 Analyze User-Provided ABCD Data
// Apply ABCD/BCD logic to the actual user data

import { performAbcdBcdAnalysis } from './src/utils/abcdBcdAnalysis.js';

console.log('🎯 ABCD/BCD Analysis of User-Provided Data');
console.log('==========================================\n');

// Extract numbers from the user data
// Format: element-number-/planet-(position)-(position)
const extractNumber = (dataString) => {
  const match = dataString.match(/^[a-z]+-(\d+)-\//);
  return match ? parseInt(match[1]) : null;
};

// User data organized by date
const userData = {
  // A-day: 2025-06-02-Ra
  'A': {
    'Lagna': 'as-5-/ra-(29 Li 39)-(29 Aq 49)',
    'Moon': 'mo-12-/ra-(02 Pi 18)-(29 Aq 49)',
    'Hora Lagna': 'hl-11-/ra-(22 Ar 45)-(29 Aq 49)',
    'Ghati Lagna': 'gl-5-/ra-(01 Li 29)-(29 Aq 49)',
    'Vighati Lagna': 'vig-3-/ra-(15 Sg 09)-(29 Aq 49)',
    'Varnada Lagna': 'var-4-/ra-(29 Sc 39)-(29 Aq 49)',
    'Sree Lagna': 'sl-5-/ra-(01 Li 49)-(29 Aq 49)',
    'Pranapada Lagna': 'pp-7-/ra-(15 Le 36)-(29 Aq 49)',
    'Indu Lagna': 'in-11-/ra-(02 Ar 18)-(29 Aq 49)'
  },
  
  // B-day: 2025-06-03-Sa
  'B': {
    'Lagna': 'as-5-/sa-(06 Sc 18)-(06 Pi 07)',
    'Moon': 'mo-10-/sa-(16 Ge 04)-(06 Pi 07)',
    'Hora Lagna': 'hl-12-/sa-(29 Ar 11)-(06 Pi 07)',
    'Ghati Lagna': 'gl-6-/sa-(07 Li 27)-(06 Pi 07)',
    'Vighati Lagna': 'vig-4-/sa-(18 Sg 48)-(06 Pi 07)',
    'Varnada Lagna': 'var-4-/sa-(06 Sg 18)-(06 Pi 07)',
    'Sree Lagna': 'sl-9-/sa-(20 Cn 07)-(06 Pi 07)',
    'Pranapada Lagna': 'pp-8-/sa-(19 Le 16)-(06 Pi 07)',
    'Indu Lagna': 'in-6-/sa-(16 Li 04)-(06 Pi 07)'
  },
  
  // C-day: 2025-06-04-Su
  'C': {
    'Lagna': 'as-8-/su-(29 Li 39)-(07 Ta 24)',
    'Moon': 'mo-3-/su-(02 Pi 18)-(07 Ta 24)',
    'Hora Lagna': 'hl-2-/su-(22 Ar 45)-(07 Ta 24)',
    'Ghati Lagna': 'gl-8-/su-(01 Li 29)-(07 Ta 24)',
    'Vighati Lagna': 'vig-6-/su-(15 Sg 09)-(07 Ta 24)',
    'Varnada Lagna': 'var-7-/su-(29 Sc 39)-(07 Ta 24)',
    'Sree Lagna': 'sl-8-/su-(01 Li 49)-(07 Ta 24)',
    'Pranapada Lagna': 'pp-10-/su-(15 Le 36)-(07 Ta 24)',
    'Indu Lagna': 'in-2-/su-(02 Ar 18)-(07 Ta 24)'
  },
  
  // D-day: 2025-06-05-Me
  'D': {
    'Lagna': 'as-7-/me-(29 Li 39)-(28 Ar 13)',
    'Moon': 'mo-2-/me-(02 Pi 18)-(28 Ar 13)',
    'Hora Lagna': 'hl-1-/me-(22 Ar 45)-(28 Ar 13)',
    'Ghati Lagna': 'gl-7-/me-(01 Li 29)-(28 Ar 13)',
    'Vighati Lagna': 'vig-5-/me-(15 Sg 09)-(28 Ar 13)',
    'Varnada Lagna': 'var-6-/me-(29 Sc 39)-(28 Ar 13)',
    'Sree Lagna': 'sl-7-/me-(01 Li 49)-(28 Ar 13)',
    'Pranapada Lagna': 'pp-9-/me-(15 Le 36)-(28 Ar 13)',
    'Indu Lagna': 'in-1-/me-(02 Ar 18)-(28 Ar 13)'
  }
};

// Extract numbers for each day
const aDayNumbers = Object.values(userData.A).map(extractNumber).filter(n => n !== null);
const bDayNumbers = Object.values(userData.B).map(extractNumber).filter(n => n !== null);
const cDayNumbers = Object.values(userData.C).map(extractNumber).filter(n => n !== null);
const dDayNumbers = Object.values(userData.D).map(extractNumber).filter(n => n !== null);

console.log('📊 Extracted Numbers:');
console.log('====================');
console.log(`A-day (2025-06-02): [${aDayNumbers.join(', ')}]`);
console.log(`B-day (2025-06-03): [${bDayNumbers.join(', ')}]`);
console.log(`C-day (2025-06-04): [${cDayNumbers.join(', ')}]`);
console.log(`D-day (2025-06-05): [${dDayNumbers.join(', ')}]`);
console.log('');

// Perform ABCD/BCD analysis
const analysis = performAbcdBcdAnalysis(
  aDayNumbers,
  bDayNumbers,
  cDayNumbers,
  dDayNumbers,
  {
    includeDetailedAnalysis: true,
    logResults: false,
    setName: 'User Data Analysis'
  }
);

console.log('🎯 ABCD/BCD ANALYSIS RESULTS:');
console.log('=============================');
console.log(`✅ ABCD Numbers: [${analysis.abcdNumbers.join(', ')}] (${analysis.abcdNumbers.length} total)`);
console.log(`✅ BCD Numbers: [${analysis.bcdNumbers.join(', ')}] (${analysis.bcdNumbers.length} total)`);
console.log('');

console.log('📈 Summary Statistics:');
console.log(`   • D-day count: ${analysis.summary.dDayCount}`);
console.log(`   • ABCD count: ${analysis.summary.abcdCount}`);
console.log(`   • BCD count: ${analysis.summary.bcdCount}`);
console.log(`   • Total qualified: ${analysis.summary.totalQualified}`);
console.log(`   • Qualification rate: ${analysis.summary.qualificationRate}%`);
console.log('');

console.log('🔍 DETAILED BREAKDOWN BY NUMBER:');
console.log('=================================');
for (const [num, details] of Object.entries(analysis.detailedAnalysis)) {
  const status = details.qualified ? '✅' : '❌';
  const type = details.type ? `[${details.type}]` : '';
  console.log(`${status} Number ${num} ${type}: ${details.reason}`);
}

console.log('');
console.log('📚 LOGIC EXPLANATION:');
console.log('=====================');
console.log('• ABCD Rule: D-day numbers appearing in ≥2 of A, B, C days');
console.log('• BCD Rule: D-day numbers in exclusive B-D or C-D pairs (not both B and C)');
console.log('• Priority: ABCD takes precedence over BCD');
console.log('• Exclusivity: Numbers cannot qualify for both ABCD and BCD');

console.log('');
console.log('🎯 ELEMENT-WISE BREAKDOWN:');
console.log('==========================');

const elements = Object.keys(userData.A);
elements.forEach(element => {
  const aNum = extractNumber(userData.A[element]);
  const bNum = extractNumber(userData.B[element]);
  const cNum = extractNumber(userData.C[element]);
  const dNum = extractNumber(userData.D[element]);
  
  // Check if D-day number appears in A, B, or C days (anywhere in those day's numbers)
  const inA = aDayNumbers.includes(dNum);
  const inB = bDayNumbers.includes(dNum);
  const inC = cDayNumbers.includes(dNum);
  const abcCount = [inA, inB, inC].filter(Boolean).length;
  
  let qualification = 'None';
  let details = '';
  
  if (abcCount >= 2) {
    qualification = 'ABCD';
    const occurrences = [];
    if (inA) occurrences.push('A');
    if (inB) occurrences.push('B');
    if (inC) occurrences.push('C');
    details = ` (in ${occurrences.join(', ')})`;
  } else {
    const bdPairOnly = inB && !inC;
    const cdPairOnly = inC && !inB;
    if (bdPairOnly) {
      qualification = 'BCD';
      details = ' (B-D pair only)';
    } else if (cdPairOnly) {
      qualification = 'BCD';
      details = ' (C-D pair only)';
    }
  }
  
  console.log(`${element.padEnd(16)}: A=${aNum}, B=${bNum}, C=${cNum}, D=${dNum} → ${qualification}${details}`);
});
