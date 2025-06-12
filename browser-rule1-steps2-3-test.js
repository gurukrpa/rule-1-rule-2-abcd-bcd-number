// COMPREHENSIVE TEST for Rule-1 Steps 2 & 3
// Copy-paste this entire code into browser console after opening http://localhost:5173/

(function() {
  console.log('🧪 RULE-1 STEPS 2 & 3 COMPREHENSIVE TEST');
  console.log('==========================================');
  
  // Step 1: Setup test data with ABCD/BCD scenarios
  const userData = localStorage.getItem('abcd_users_data');
  if (!userData) {
    console.log('❌ No users found. Creating test user...');
    
    const testUser = {
      id: 999,
      username: 'TestUser_ABCD',
      hr: 3
    };
    
    localStorage.setItem('abcd_users_data', JSON.stringify([testUser]));
    console.log('✅ Test user created:', testUser);
  }
  
  const users = JSON.parse(localStorage.getItem('abcd_users_data') || '[]');
  const testUser = users[0];
  
  if (!testUser) {
    console.log('❌ Still no user available');
    return;
  }
  
  console.log('👤 Using test user:', testUser.username, 'ID:', testUser.id);
  
  // Step 2: Create specific test dates and data for ABCD/BCD testing
  const datesKey = `abcd_dates_${testUser.id}`;
  const dates = [
    '2025-01-01', // A
    '2025-01-02', // B  
    '2025-01-03', // C
    '2025-01-04', // D
    '2025-01-05'  // Rule-1 trigger date (5th)
  ];
  
  localStorage.setItem(datesKey, JSON.stringify(dates));
  console.log('✅ Test dates created for ABCD analysis:', dates);
  
  // Step 3: Create specific Excel/Hour data to test ABCD/BCD scenarios
  const testScenarios = {
    // Scenario 1: ABCD qualifying number (number 7 appears in A, B, C, D)
    'Lagna': {
      'A': 'as-7-/su-(10 Sc 03)-(17 Ta 58)',  // number 7
      'B': 'as-7-/mo-(11 Ar 15)-(25 Le 42)',  // number 7 (appears in A,B,C,D → ABCD)
      'C': 'as-7-/ma-(12 Pi 27)-(03 Vi 36)',  // number 7
      'D': 'as-7-/su-(13 Ge 48)-(22 Cp 19)'   // number 7
    },
    // Scenario 2: BCD qualifying number (number 5 appears in B, D but NOT C)
    'Moon': {
      'A': 'mo-3-/su-(15 Ge 48)-(22 Cp 19)',  // number 3
      'B': 'mo-5-/mo-(16 Ta 33)-(08 Aq 51)',  // number 5 (B-D pair → BCD)
      'C': 'mo-8-/ma-(17 Cn 12)-(14 Sg 28)',  // number 8 (different)
      'D': 'mo-5-/ra-(18 Li 25)-(11 Sc 17)'   // number 5
    },
    // Scenario 3: No qualification (number 9 appears only in D)
    'Vighati Lagna': {
      'A': 'vig-1-/su-(19 Ar 60)-(05 Pi 43)', // number 1
      'B': 'vig-2-/mo-(20 Li 25)-(11 Sc 17)', // number 2
      'C': 'vig-3-/ma-(21 Cp 15)-(24 Le 36)', // number 3
      'D': 'vig-9-/ra-(22 Aq 45)-(30 Sg 12)'  // number 9 (only in D → no qualification)
    }
  };
  
  console.log('🎯 Creating test scenarios:');
  console.log('   Lagna: ABCD scenario (number 7 in A,B,C,D)');
  console.log('   Moon: BCD scenario (number 5 in B,D only)');
  console.log('   Vighati Lagna: No qualification (number 9 in D only)');
  
  dates.forEach((date, index) => {
    const dateLabel = ['A', 'B', 'C', 'D', 'Trigger'][index];
    const excelKey = `abcd_excelData_${testUser.id}_${date}`;
    const hourKey = `abcd_hourEntry_${testUser.id}_${date}`;
    
    if (index < 4) { // Only create data for A, B, C, D (not trigger date)
      console.log(`📊 Creating data for ${date} (${dateLabel})...`);
      
      const excelData = {
        data: {
          sets: {
            'D-1 Set-1 Matrix': {
              'Lagna': {
                'Su': testScenarios['Lagna'][dateLabel],
                'Mo': `as-${index + 10}-/mo-(25 Le 42)-(30 Vi 18)`,
                'Ma': `as-${index + 20}-/ma-(35 Sg 55)-(40 Cp 22)`
              },
              'Moon': {
                'Su': testScenarios['Moon'][dateLabel],
                'Mo': `mo-${index + 15}-/mo-(28 Ar 33)-(12 Ta 47)`,
                'Ra': `mo-${index + 25}-/ra-(38 Ge 21)-(45 Cn 15)`
              },
              'Vighati Lagna': {
                'Su': testScenarios['Vighati Lagna'][dateLabel],
                'Mo': `vig-${index + 12}-/mo-(31 Pi 28)-(18 Ar 35)`,
                'Ra': `vig-${index + 22}-/ra-(41 Vi 42)-(52 Li 29)`
              }
            }
          }
        }
      };
      
      localStorage.setItem(excelKey, JSON.stringify(excelData));
      
      // Create hour entry data (always use Su for consistency in testing)
      const hourData = {
        planetSelections: {
          '1': 'Su',
          '2': 'Mo', 
          '3': 'Ra'
        }
      };
      
      localStorage.setItem(hourKey, JSON.stringify(hourData));
    }
  });
  
  console.log('✅ All test data ready for ABCD/BCD analysis!');
  console.log('');
  console.log('🚀 TESTING STEPS:');
  console.log(`1. Navigate to: /user/${testUser.id}`);
  console.log(`2. Click Rule-1 button for date ${dates[4]}`);
  console.log(`3. Watch console for Step 2 & 3 logs`);
  console.log(`4. Check table shows: formatted data + ABCD/BCD badges`);
  console.log('');
  console.log('💡 Run verifyRule1Analysis() after Rule-1 page loads');
  
  // Comprehensive verification function
  window.verifyRule1Analysis = function() {
    console.log('🔍 COMPREHENSIVE RULE-1 VERIFICATION (Steps 2 & 3)');
    console.log('==================================================');
    
    // Step 2 Verification: Check formatted data display
    console.log('📋 STEP 2 VERIFICATION: Formatted Data Display');
    const cells = document.querySelectorAll('table td');
    let formattedCount = 0;
    let rawCount = 0;
    const step2Samples = [];
    
    cells.forEach(cell => {
      const text = cell.textContent.trim();
      if (text && text !== '-') {
        // Check if it matches our new format: element-number-/planet-sign
        if (text.match(/^\w+-\d+-\/\w+-\w+/)) {
          formattedCount++;
          if (step2Samples.length < 3) step2Samples.push(`✅ ${text}`);
        } else if (text.includes('(') && text.includes(')')) {
          rawCount++;
          if (step2Samples.length < 3) step2Samples.push(`❌ ${text}`);
        }
      }
    });
    
    console.log(`   Formatted cells: ${formattedCount}`);
    console.log(`   Raw cells: ${rawCount}`);
    console.log('   Samples:', step2Samples);
    
    // Step 3 Verification: Check ABCD/BCD badges
    console.log('');
    console.log('🎯 STEP 3 VERIFICATION: ABCD/BCD Analysis & Badges');
    
    const abcdBadges = document.querySelectorAll('.bg-green-100');
    const bcdBadges = document.querySelectorAll('.bg-blue-100');
    
    console.log(`   ABCD badges found: ${abcdBadges.length}`);
    console.log(`   BCD badges found: ${bcdBadges.length}`);
    
    // Check specific expected results
    let lagnaAbcdFound = false;
    let moonBcdFound = false;
    let vighatiNoBadges = true;
    
    abcdBadges.forEach(badge => {
      const text = badge.textContent.trim();
      console.log(`   ✅ ABCD badge: ${text}`);
      if (text.includes('abcd-as-7')) lagnaAbcdFound = true;
    });
    
    bcdBadges.forEach(badge => {
      const text = badge.textContent.trim();
      console.log(`   🔵 BCD badge: ${text}`);
      if (text.includes('bcd-mo-5')) moonBcdFound = true;
    });
    
    // Check if Vighati Lagna row has no badges (as expected)
    const vighatiRow = Array.from(document.querySelectorAll('tr')).find(row => 
      row.textContent.includes('Vighati Lagna')
    );
    if (vighatiRow) {
      const vighatiaBadges = vighatiRow.querySelectorAll('.bg-green-100, .bg-blue-100');
      vighatiNoBadges = vighatiaBadges.length === 0;
      console.log(`   ⚪ Vighati Lagna badges: ${vighatiaBadges.length} (should be 0)`);
    }
    
    // Final assessment
    console.log('');
    console.log('📊 FINAL VERIFICATION RESULTS:');
    console.log(`   Step 2 (Formatted Display): ${formattedCount > 0 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Step 3 (ABCD Analysis): ${lagnaAbcdFound ? '✅ PASS' : '❌ FAIL'} (Lagna number 7)`);
    console.log(`   Step 3 (BCD Analysis): ${moonBcdFound ? '✅ PASS' : '❌ FAIL'} (Moon number 5)`);
    console.log(`   Step 3 (No Qualification): ${vighatiNoBadges ? '✅ PASS' : '❌ FAIL'} (Vighati Lagna)`);
    
    const overallSuccess = formattedCount > 0 && lagnaAbcdFound && moonBcdFound && vighatiNoBadges;
    console.log(`   OVERALL: ${overallSuccess ? '🎉 ALL TESTS PASS!' : '⚠️ SOME TESTS FAILED'}`);
    
    return {
      step2: formattedCount > 0,
      step3_abcd: lagnaAbcdFound,
      step3_bcd: moonBcdFound,
      step3_none: vighatiNoBadges,
      overall: overallSuccess
    };
  };
  
  // Auto-navigate if on home page
  if (window.location.pathname === '/') {
    console.log('🚀 Auto-navigating to user page...');
    window.location.href = `/user/${testUser.id}`;
  }
  
})();
