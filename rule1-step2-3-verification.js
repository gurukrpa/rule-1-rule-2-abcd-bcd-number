// RULE-1 STEPS 2 & 3 VERIFICATION SCRIPT
// Navigate to Rule-1 page first, then run: verifyRule1Steps()

console.log('🧪 Rule-1 Steps 2 & 3 Verification Script Loaded');
console.log('Usage: verifyRule1Steps()');

window.verifyRule1Steps = function() {
  console.log('🔍 RULE-1 STEPS 2 & 3 VERIFICATION');
  console.log('==================================');
  
  // Check if we're on the right page
  const title = document.querySelector('h1');
  if (!title || !title.textContent.includes('Rule-1')) {
    console.log('❌ Not on Rule-1 page. Navigate to Rule-1 first.');
    console.log('📍 Current page:', window.location.pathname);
    return { error: 'Not on Rule-1 page' };
  }
  
  console.log('✅ On Rule-1 Analysis page');
  
  // Check for data processing completion
  console.log('');
  console.log('📋 STEP 2 VERIFICATION: Formatted Data Display');
  
  const tables = document.querySelectorAll('table');
  console.log(`📊 Tables found: ${tables.length}`);
  
  if (tables.length === 0) {
    console.log('❌ No tables found');
    return { error: 'No tables found' };
  }
  
  // Analyze table data
  const dataCells = document.querySelectorAll('table td');
  let formattedDataCount = 0;
  let rawDataCount = 0;
  let totalDataCells = 0;
  const formattedSamples = [];
  const rawSamples = [];
  
  dataCells.forEach(cell => {
    const text = cell.textContent.trim();
    if (text && text !== '-' && !text.includes('Element') && !text.includes('ABCD') && !text.includes('BCD')) {
      totalDataCells++;
      
      // Check for new formatted pattern: element-number-/planet-sign
      if (text.match(/^\w+-\d+-\/\w+-\w+/)) {
        formattedDataCount++;
        if (formattedSamples.length < 3) {
          formattedSamples.push(text);
        }
      } 
      // Check for old raw pattern with parentheses
      else if (text.includes('(') && text.includes(')')) {
        rawDataCount++;
        if (rawSamples.length < 3) {
          rawSamples.push(text);
        }
      }
    }
  });
  
  console.log(`   Total data cells: ${totalDataCells}`);
  console.log(`   Formatted cells: ${formattedDataCount}`);
  console.log(`   Raw cells: ${rawDataCount}`);
  console.log(`   Formatted samples:`, formattedSamples);
  console.log(`   Raw samples:`, rawSamples);
  
  // Check ABCD/BCD badges (Step 3)
  console.log('');
  console.log('🎯 STEP 3 VERIFICATION: ABCD/BCD Analysis & Badges');
  
  const abcdBadges = document.querySelectorAll('.bg-green-100');
  const bcdBadges = document.querySelectorAll('.bg-blue-100');
  
  console.log(`   ABCD badges (green): ${abcdBadges.length}`);
  console.log(`   BCD badges (blue): ${bcdBadges.length}`);
  
  // List badge contents
  abcdBadges.forEach((badge, i) => {
    console.log(`   🟢 ABCD ${i+1}: "${badge.textContent.trim()}"`);
  });
  
  bcdBadges.forEach((badge, i) => {
    console.log(`   🔵 BCD ${i+1}: "${badge.textContent.trim()}"`);
  });
  
  // Overall assessment
  console.log('');
  console.log('📊 VERIFICATION RESULTS:');
  
  const step2Pass = formattedDataCount > 0;
  const step3Pass = (abcdBadges.length > 0) || (bcdBadges.length > 0);
  
  console.log(`   Step 2 (Formatted Data): ${step2Pass ? '✅ PASS' : '❌ FAIL'} (${formattedDataCount}/${totalDataCells} formatted)`);
  console.log(`   Step 3 (ABCD/BCD Analysis): ${step3Pass ? '✅ PASS' : '❌ FAIL'} (${abcdBadges.length + bcdBadges.length} badges total)`);
  
  const overallPass = step2Pass && step3Pass;
  console.log(`   OVERALL: ${overallPass ? '🎉 SUCCESS!' : '⚠️ NEEDS ATTENTION'}`);
  
  if (!step2Pass) {
    console.log('');
    console.log('🔧 STEP 2 DEBUGGING TIPS:');
    console.log('   - Check console for "🔍 Starting data extraction for A, B, C, D"');
    console.log('   - Check console for "📋 Structured results for table display"');
    console.log('   - Verify getElementData() returns formatted data');
  }
  
  if (!step3Pass) {
    console.log('');
    console.log('🔧 STEP 3 DEBUGGING TIPS:');
    console.log('   - Check console for "🔍 Starting ABCD/BCD analysis..."');
    console.log('   - Check console for "🎉 ABCD/BCD analysis complete!"');
    console.log('   - Verify ABCD/BCD arrays are populated');
  }
  
  return {
    step2: step2Pass,
    step3: step3Pass,
    overall: overallPass,
    details: {
      formattedData: formattedDataCount,
      totalData: totalDataCells,
      abcdBadges: abcdBadges.length,
      bcdBadges: bcdBadges.length,
      formattedSamples,
      rawSamples
    }
  };
};

console.log('✅ Verification function ready. Run verifyRule1Steps() after navigating to Rule-1 page.');
