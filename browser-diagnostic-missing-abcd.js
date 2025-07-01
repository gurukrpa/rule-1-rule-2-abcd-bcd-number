#!/usr/bin/env node
/**
 * BROWSER DIAGNOSTIC: Paste this into browser console on PlanetsAnalysisPage
 * to identify which topics are missing ABCD/BCD numbers
 */

console.log(`
// ===== PASTE THIS INTO BROWSER CONSOLE ON PLANETSANALYSISPAGE =====

(() => {
  console.log('🔍 DIAGNOSING: Missing ABCD/BCD Numbers in PlanetsAnalysisPage');
  console.log('='.repeat(60));
  
  // Check if planetsData exists (after Excel upload)
  if (typeof planetsData === 'undefined' || !planetsData?.sets) {
    console.log('❌ No planetsData found. Please:');
    console.log('1. Upload an Excel file first');
    console.log('2. Open browser console after upload');
    console.log('3. Run this diagnostic again');
    return;
  }
  
  console.log('✅ Found planetsData with sets:', Object.keys(planetsData.sets));
  console.log('');
  
  // Check each topic for ABCD/BCD numbers
  const topicsWithNumbers = [];
  const topicsWithoutNumbers = [];
  
  Object.keys(planetsData.sets).forEach(setName => {
    // This simulates the getTopicNumbers function behavior
    const hasNumbers = typeof getTopicNumbers === 'function' ? 
      (() => {
        const numbers = getTopicNumbers(setName);
        return numbers.abcd.length > 0 || numbers.bcd.length > 0;
      })() : false;
    
    if (hasNumbers) {
      topicsWithNumbers.push(setName);
    } else {
      topicsWithoutNumbers.push(setName);
    }
  });
  
  console.log('📊 ANALYSIS RESULTS:');
  console.log(\`✅ Topics WITH ABCD/BCD numbers: \${topicsWithNumbers.length}\`);
  console.log(\`❌ Topics WITHOUT ABCD/BCD numbers: \${topicsWithoutNumbers.length}\`);
  console.log('');
  
  if (topicsWithNumbers.length > 0) {
    console.log('✅ TOPICS WITH NUMBERS:');
    topicsWithNumbers.forEach(topic => {
      console.log(\`  ✅ \${topic}\`);
    });
    console.log('');
  }
  
  if (topicsWithoutNumbers.length > 0) {
    console.log('❌ TOPICS WITHOUT NUMBERS:');
    topicsWithoutNumbers.forEach(topic => {
      console.log(\`  ❌ \${topic}\`);
    });
    console.log('');
    
    console.log('🔧 TO FIX MISSING TOPICS:');
    console.log('Add these topics to the TOPIC_NUMBERS object in PlanetsAnalysisPage.jsx:');
    console.log('');
    topicsWithoutNumbers.forEach(topic => {
      console.log(\`'\${topic}': { abcd: [1, 2, 3], bcd: [4, 5] }, // Add appropriate numbers\`);
    });
    console.log('');
  }
  
  console.log('💡 NEXT STEPS:');
  if (topicsWithoutNumbers.length > 0) {
    console.log('1. Copy the missing topic definitions above');
    console.log('2. Add them to TOPIC_NUMBERS object in PlanetsAnalysisPage.jsx');
    console.log('3. Replace [1, 2, 3] and [4, 5] with actual ABCD/BCD numbers');
    console.log('4. Refresh page and test again');
  } else {
    console.log('✅ All topics have ABCD/BCD numbers defined!');
    console.log('If you still don\\'t see badges, check element extraction logic.');
  }
})();

// ===== END OF DIAGNOSTIC SCRIPT =====
`);

console.log('📋 INSTRUCTIONS:');
console.log('1. Open your browser on PlanetsAnalysisPage');
console.log('2. Upload an Excel file with your topics');
console.log('3. Open browser console (F12)');
console.log('4. Copy and paste the script above into the console');
console.log('5. Press Enter to run the diagnostic');
console.log('6. Follow the recommendations to add missing topics');
