// RULE-1 COMPREHENSIVE VERIFICATION
// Copy-paste this into browser console on Rule-1 page

(function() {
  console.log('🔍 RULE-1 COMPREHENSIVE VERIFICATION');
  console.log('===================================');
  
  // Helper to expand console objects
  const logExpandedObject = (obj, label) => {
    console.log(`📊 ${label}:`, JSON.parse(JSON.stringify(obj)));
  };
  
  // 1. Check if we're on Rule-1 page
  if (!window.location.pathname.includes('user') || !document.querySelector('[class*="Rule-1"]')) {
    console.log('❌ Not on Rule-1 page. Navigate to Rule-1 first.');
    return;
  }
  
  console.log('✅ On Rule-1 page');
  
  // 2. Check table structure
  const tables = document.querySelectorAll('table');
  console.log(`📋 Found ${tables.length} table(s)`);
  
  if (tables.length === 0) {
    console.log('❌ No tables found. Rule-1 may not have loaded properly.');
    return;
  }
  
  // 3. Check for formatted data in cells
  console.log('\n🔍 STEP 2 VERIFICATION: Formatted Data Display');
  console.log('================================================');
  
  const allCells = document.querySelectorAll('table td');
  let formattedCells = 0;
  let rawCells = 0;
  const formattedSamples = [];
  const rawSamples = [];
  
  allCells.forEach((cell, index) => {
    const text = cell.textContent.trim();
    if (text && text !== '-') {
      // Check for formatted pattern: element-number-/planet-sign
      if (text.match(/^\w+-\d+-\/\w+-\w+/)) {
        formattedCells++;
        if (formattedSamples.length < 5) formattedSamples.push(text);
      } 
      // Check for raw pattern with parentheses
      else if (text.includes('(') && text.includes(')') && text.includes('-')) {
        rawCells++;
        if (rawSamples.length < 5) rawSamples.push(text);
      }
    }
  });
  
  console.log(`✅ Formatted cells: ${formattedCells}`);
  console.log(`❌ Raw cells: ${rawCells}`);
  console.log('📝 Formatted samples:', formattedSamples);
  console.log('📝 Raw samples:', rawSamples);
  
  // 4. Check for ABCD/BCD badges
  console.log('\n🔍 STEP 3 VERIFICATION: ABCD/BCD Badges');
  console.log('========================================');
  
  const abcdBadges = document.querySelectorAll('.bg-green-100');
  const bcdBadges = document.querySelectorAll('.bg-blue-100');
  
  console.log(`🟢 ABCD badges found: ${abcdBadges.length}`);
  console.log(`🔵 BCD badges found: ${bcdBadges.length}`);
  
  abcdBadges.forEach((badge, i) => {
    console.log(`  ABCD ${i + 1}: "${badge.textContent.trim()}"`);
  });
  
  bcdBadges.forEach((badge, i) => {
    console.log(`  BCD ${i + 1}: "${badge.textContent.trim()}"`);
  });
  
  // 5. Inspect React component state if available
  console.log('\n🔍 INTERNAL STATE VERIFICATION');
  console.log('===============================');
  
  // Try to access React internals (if available)
  const reactElements = document.querySelectorAll('[data-reactroot], #root *');
  let reactFound = false;
  
  for (const el of reactElements) {
    const reactFiber = el._reactInternalFiber || el._reactInternalInstance;
    if (reactFiber) {
      reactFound = true;
      break;
    }
  }
  
  if (reactFound) {
    console.log('✅ React found - checking component state...');
  } else {
    console.log('⚠️ React internals not accessible');
  }
  
  // 6. Manual data inspection
  console.log('\n🔍 MANUAL DATA INSPECTION');
  console.log('==========================');
  
  // Look for patterns in table data manually
  const tableRows = document.querySelectorAll('table tbody tr');
  console.log(`📊 Found ${tableRows.length} data rows`);
  
  tableRows.forEach((row, i) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 5) {
      const elementName = cells[0].textContent.trim();
      const aData = cells[1].textContent.trim();
      const bData = cells[2].textContent.trim();
      const cData = cells[3].textContent.trim();
      const dData = cells[4].textContent.trim();
      
      // Extract numbers for manual ABCD/BCD check
      const extractNumber = (data) => {
        const match = data.match(/^\w+-(\d+)-/);
        return match ? parseInt(match[1], 10) : null;
      };
      
      const aNum = extractNumber(aData);
      const bNum = extractNumber(bData);
      const cNum = extractNumber(cData);
      const dNum = extractNumber(dData);
      
      if (dNum !== null) {
        let abcdCount = 0;
        const occurrences = [];
        
        if (aNum === dNum) { abcdCount++; occurrences.push('A'); }
        if (bNum === dNum) { abcdCount++; occurrences.push('B'); }
        if (cNum === dNum) { abcdCount++; occurrences.push('C'); }
        
        const qualifiesABCD = abcdCount >= 2;
        
        const inB = bNum === dNum;
        const inC = cNum === dNum;
        const bdPairOnly = inB && !inC;
        const cdPairOnly = inC && !inB;
        const qualifiesBCD = (bdPairOnly || cdPairOnly) && !qualifiesABCD;
        
        if (qualifiesABCD || qualifiesBCD) {
          console.log(`✅ ${elementName} (${dNum}): ABCD(${qualifiesABCD ? occurrences.join(',') : 'no'}), BCD(${qualifiesBCD ? (bdPairOnly ? 'B-D' : 'C-D') : 'no'})`);
        } else {
          console.log(`⚪ ${elementName} (${dNum}): No qualification - appears in ${abcdCount}/3 days (${occurrences.join(',')})`);
        }
      }
    }
  });
  
  // 7. Summary and recommendations
  console.log('\n📋 VERIFICATION SUMMARY');
  console.log('========================');
  
  const step2Success = formattedCells > 0;
  const step3Success = abcdBadges.length > 0 || bcdBadges.length > 0;
  
  console.log(`Step 2 (Formatting): ${step2Success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Step 3 (ABCD/BCD): ${step3Success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!step2Success) {
    console.log('🔧 Step 2 Issue: Formatted data not displaying. Check getElementData() function.');
  }
  
  if (!step3Success) {
    console.log('🔧 Step 3 Issue: No ABCD/BCD badges found. Possible causes:');
    console.log('   - No qualifying numbers in current data');
    console.log('   - Analysis logic not triggering');
    console.log('   - Badge rendering not working');
    console.log('   💡 Try switching HR tabs to see if different data qualifies');
  }
  
  // 8. Next steps
  console.log('\n🚀 NEXT STEPS');
  console.log('==============');
  
  if (step2Success && step3Success) {
    console.log('🎉 ALL STEPS WORKING! Rule-1 implementation is complete.');
  } else {
    console.log('🔧 DEBUGGING NEEDED:');
    if (!step2Success) {
      console.log('   1. Fix Step 2: Check formatted data extraction and display');
    }
    if (!step3Success) {
      console.log('   2. Fix Step 3: Check ABCD/BCD analysis and badge rendering');
      console.log('   3. Try creating test data with obvious ABCD/BCD patterns');
    }
  }
  
  return {
    step2: step2Success,
    step3: step3Success,
    formattedCells,
    abcdBadges: abcdBadges.length,
    bcdBadges: bcdBadges.length,
    totalRows: tableRows.length
  };
  
})();
