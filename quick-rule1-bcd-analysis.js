// Quick analysis of Rule1Page BCD logic
// Run this in browser console while on Rule1Page

console.log('🔍 RULE1PAGE BCD ANALYSIS');
console.log('========================');

// Function to analyze the current data and understand BCD behavior
async function analyzeRule1BCDLogic() {
  try {
    console.log('📊 Analyzing visible data on Rule1Page...');
    
    // Extract the visible data from the table
    const tables = document.querySelectorAll('table');
    if (tables.length === 0) {
      console.log('❌ No tables found on the page');
      return;
    }
    
    const table = tables[0]; // First table
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    console.log('📋 Table headers:', headers);
    
    // Find column indices
    const aIndex = headers.findIndex(h => h.includes('(A)'));
    const bIndex = headers.findIndex(h => h.includes('(B)'));
    const cIndex = headers.findIndex(h => h.includes('(C)'));
    const dIndex = headers.findIndex(h => h.includes('(D)'));
    
    console.log(`📍 Column indices: A=${aIndex}, B=${bIndex}, C=${cIndex}, D=${dIndex}`);
    
    if (dIndex === -1) {
      console.log('❌ No D-day column found');
      return;
    }
    
    // Extract data from each row
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const analysisData = [];
    
    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length <= dIndex) return;
      
      const elementName = cells[0]?.textContent.trim();
      const aData = aIndex >= 0 ? cells[aIndex]?.textContent.trim() : '';
      const bData = bIndex >= 0 ? cells[bIndex]?.textContent.trim() : '';
      const cData = cIndex >= 0 ? cells[cIndex]?.textContent.trim() : '';
      const dData = cells[dIndex]?.textContent.trim();
      
      // Extract numbers from each cell
      const extractNumber = (str) => {
        if (!str) return null;
        const match = str.match(/[a-z]+-(\d+)-/);
        return match ? parseInt(match[1]) : null;
      };
      
      const aNum = extractNumber(aData);
      const bNum = extractNumber(bData);
      const cNum = extractNumber(cData);
      const dNum = extractNumber(dData);
      
      if (dNum !== null) {
        const inA = aNum === dNum;
        const inB = bNum === dNum;
        const inC = cNum === dNum;
        const appearances = [inA, inB, inC].filter(Boolean).length;
        
        // ABCD logic: appears in ≥2 of A,B,C
        const isABCD = appearances >= 2;
        
        // BCD logic: appears in B XOR C (but not A, and not both B and C)
        const isBCDCandidate = ((inB && !inA && !inC) || (inC && !inA && !inB));
        const isBCD = isBCDCandidate && !isABCD; // ABCD takes priority
        
        analysisData.push({
          element: elementName,
          dNumber: dNum,
          inA, inB, inC,
          appearances,
          isABCD,
          isBCDCandidate,
          isBCD,
          hasABCDBadge: dData.includes('abcd-'),
          hasBCDBadge: dData.includes('bcd-')
        });
        
        console.log(`🔢 ${elementName}: D=${dNum}, A=${inA}, B=${inB}, C=${inC}, appearances=${appearances}`);
        console.log(`   → ABCD: ${isABCD}, BCD candidate: ${isBCDCandidate}, Final BCD: ${isBCD}`);
        console.log(`   → Badges: ABCD=${dData.includes('abcd-')}, BCD=${dData.includes('bcd-')}`);
      }
    });
    
    // Summary
    const abcdCount = analysisData.filter(d => d.isABCD).length;
    const bcdCandidateCount = analysisData.filter(d => d.isBCDCandidate).length;
    const finalBcdCount = analysisData.filter(d => d.isBCD).length;
    const visibleABCDBadges = analysisData.filter(d => d.hasABCDBadge).length;
    const visibleBCDBadges = analysisData.filter(d => d.hasBCDBadge).length;
    
    console.log('\n📊 ANALYSIS SUMMARY:');
    console.log(`🟢 Numbers qualifying for ABCD: ${abcdCount}`);
    console.log(`🔵 Numbers that could be BCD: ${bcdCandidateCount}`);
    console.log(`🔵 Final BCD numbers (after ABCD priority): ${finalBcdCount}`);
    console.log(`👀 Visible ABCD badges: ${visibleABCDBadges}`);
    console.log(`👀 Visible BCD badges: ${visibleBCDBadges}`);
    
    if (finalBcdCount === 0) {
      console.log('\n✅ EXPECTED BEHAVIOR: No BCD numbers qualified');
      console.log('   This means all qualifying numbers became ABCD (≥2 appearances)');
      console.log('   BCD requires exclusive B-D or C-D pairs with no A appearance');
    } else if (visibleBCDBadges < finalBcdCount) {
      console.log('\n⚠️ POTENTIAL ISSUE: BCD numbers should qualify but badges not showing');
      console.log('   Check formatABCDResult function and BCD logic implementation');
    }
    
    // Check for specific BCD scenarios
    const potentialBCDScenarios = analysisData.filter(d => 
      (d.inB && !d.inA && !d.inC) || (d.inC && !d.inA && !d.inB)
    );
    
    if (potentialBCDScenarios.length > 0) {
      console.log('\n🎯 POTENTIAL BCD SCENARIOS FOUND:');
      potentialBCDScenarios.forEach(d => {
        console.log(`   ${d.element}: D=${d.dNumber}, exclusive ${d.inB ? 'B-D' : 'C-D'} pair`);
        if (d.isABCD) {
          console.log(`     → Became ABCD instead (appears in ${d.appearances} of A,B,C)`);
        }
      });
    }
    
    return analysisData;
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  }
}

// Run the analysis
analyzeRule1BCDLogic().then(data => {
  console.log('\n🎉 Analysis complete! Check results above.');
  if (data) {
    window.rule1Analysis = data; // Store for further inspection
    console.log('💾 Data stored in window.rule1Analysis for detailed inspection');
  }
});
