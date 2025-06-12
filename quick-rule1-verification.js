// QUICK RULE-1 VERIFICATION SCRIPT
// Copy this entire block and paste into browser console on Rule-1 page

console.log('🧪 QUICK RULE-1 VERIFICATION');
console.log('============================');

// Check if we're on the right page
if (!document.querySelector('h1') || !document.querySelector('h1').textContent.includes('Rule-1')) {
  console.log('❌ Not on Rule-1 page. Navigate to Rule-1 first.');
} else {
  console.log('✅ On Rule-1 Analysis page');
  
  // Check tables
  const tables = document.querySelectorAll('table');
  console.log(`📋 Tables found: ${tables.length}`);
  
  if (tables.length > 0) {
    // Check data cells
    const dataCells = document.querySelectorAll('table td');
    let formattedCount = 0;
    let totalDataCells = 0;
    const samples = [];
    
    dataCells.forEach(cell => {
      const text = cell.textContent.trim();
      if (text && text !== '-' && !text.includes('Element')) {
        totalDataCells++;
        // Check for our formatted pattern: element-number-/planet-sign
        if (text.match(/^\w+-\d+-\/\w+-\w+/)) {
          formattedCount++;
          if (samples.length < 3) samples.push(text);
        }
      }
    });
    
    console.log(`📊 Data cells: ${totalDataCells}, Formatted: ${formattedCount}`);
    console.log('📝 Formatted samples:', samples);
    
    // Check for ABCD/BCD badges
    const greenBadges = document.querySelectorAll('.bg-green-100');
    const blueBadges = document.querySelectorAll('.bg-blue-100');
    console.log(`🟢 Green badges (ABCD): ${greenBadges.length}`);
    console.log(`🔵 Blue badges (BCD): ${blueBadges.length}`);
    
    // Show badge content
    greenBadges.forEach((badge, i) => {
      console.log(`   Green ${i+1}: "${badge.textContent.trim()}"`);
    });
    blueBadges.forEach((badge, i) => {
      console.log(`   Blue ${i+1}: "${badge.textContent.trim()}"`);
    });
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`Step 2 (Formatted Data): ${formattedCount > 0 ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`Step 3 (ABCD/BCD Badges): ${(greenBadges.length + blueBadges.length) > 0 ? '✅ WORKING' : '❌ NOT WORKING'}`);
    
    if (formattedCount === 0) {
      console.log('🔧 Step 2 Issue: No formatted data found. Data may be showing in raw format.');
    }
    
    if (greenBadges.length + blueBadges.length === 0) {
      console.log('🔧 Step 3 Issue: No ABCD/BCD badges found. Analysis may not be finding qualifying numbers.');
      console.log('💡 Try switching between HR tabs to see if different HRs have qualifying numbers.');
    }
  } else {
    console.log('❌ No tables found');
  }
}

// Also check HR selector
const hrButtons = document.querySelectorAll('button');
const hrSelectorButtons = Array.from(hrButtons).filter(btn => btn.textContent.includes('HR'));
console.log(`⚙️ HR selector buttons found: ${hrSelectorButtons.length}`);
if (hrSelectorButtons.length > 0) {
  console.log('💡 Try clicking different HR buttons to test different planet selections');
}
