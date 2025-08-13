// Deep diagnostic for D-4 Set-1 persistence issues
// Specific to Hour 1, Topic D-4 Set-1, dates 31-7 and 4-8

async function diagnoseDFourSetOnePersistence() {
  console.log('🔍 DEEP DIAGNOSTIC: D-4 Set-1 Persistence Issue');
  console.log('=' . repeat(60));
  
  // Step 1: Check if we're on the right page
  console.log('\n1️⃣ PAGE VERIFICATION');
  console.log('-'.repeat(30));
  
  const isRule1Page = window.location.pathname.includes('rule1') || 
                     document.querySelector('h1, h2, h3')?.textContent?.includes('Past Days') ||
                     document.querySelector('[class*="rule1"]');
  
  console.log('✅ On Rule1 page:', isRule1Page);
  
  if (!window.rule1PageDebug) {
    console.log('❌ rule1PageDebug not available - page may not be loaded');
    return;
  }
  
  // Step 2: Get current context
  console.log('\n2️⃣ CURRENT CONTEXT');
  console.log('-'.repeat(30));
  
  const state = window.rule1PageDebug.getStateInfo();
  console.log('👤 Selected User:', state.selectedUser);
  console.log('⏰ Active HR:', state.activeHR);
  console.log('📅 Current Date:', state.date);
  
  // Step 3: Check the specific dates and topics
  console.log('\n3️⃣ D-4 SET-1 ANALYSIS');
  console.log('-'.repeat(30));
  
  const targetTopic = 'D-4 Set-1';
  const targetDates = ['31-7-25', '4-8-25'];
  const targetHR = '1';
  
  // Helper functions (matching the component)
  const topicKey = (name) => { 
    const m = String(name).match(/D-(\d+).*?Set-(\d+)/i); 
    return m ? `D-${m[1]}#${m[2]}` : String(name).trim(); 
  };
  
  const normHR = (hr) => { 
    const h = String(hr).replace(/^HR/i,'').trim(); 
    return `HR${parseInt(h,10)}`; 
  };
  
  const tKey = topicKey(targetTopic);
  const hrKey = normHR(targetHR);
  
  console.log('🎯 Target Analysis:');
  console.log('   Topic:', targetTopic, '→', tKey);
  console.log('   HR:', targetHR, '→', hrKey);
  console.log('   Dates:', targetDates);
  
  // Step 4: Check clicked numbers state
  console.log('\n4️⃣ CLICKED NUMBERS STATE');
  console.log('-'.repeat(30));
  
  const clickedNumbers = state.clickedNumbers || {};
  const topicState = clickedNumbers[tKey];
  
  console.log('📊 Full clickedNumbers keys:', Object.keys(clickedNumbers));
  console.log('📊 Topic state exists:', !!topicState);
  
  if (topicState) {
    console.log('📊 Topic state keys (dates):', Object.keys(topicState));
    
    targetDates.forEach(dateKey => {
      const dateState = topicState[dateKey];
      console.log(`📅 Date "${dateKey}" state:`, !!dateState);
      
      if (dateState) {
        console.log(`   HR keys:`, Object.keys(dateState));
        const hrState = dateState[hrKey];
        console.log(`   HR "${hrKey}" clicked numbers:`, hrState || 'none');
      }
    });
  }
  
  // Step 5: Check ABCD/BCD analysis data
  console.log('\n5️⃣ ABCD/BCD ANALYSIS DATA');
  console.log('-'.repeat(30));
  
  if (window.rule1PageDebug.abcdBcdAnalysis) {
    const analysis = window.rule1PageDebug.abcdBcdAnalysis;
    const topicAnalysis = analysis[tKey];
    
    console.log('📊 Analysis topics available:', Object.keys(analysis));
    console.log('📊 Target topic analysis exists:', !!topicAnalysis);
    
    if (topicAnalysis) {
      console.log('📊 Analysis dates for topic:', Object.keys(topicAnalysis));
      
      targetDates.forEach(dateKey => {
        const dateAnalysis = topicAnalysis[dateKey];
        console.log(`📅 Date "${dateKey}" analysis:`, !!dateAnalysis);
        
        if (dateAnalysis) {
          console.log(`   ABCD numbers:`, dateAnalysis.abcdNumbers || 'none');
          console.log(`   BCD numbers:`, dateAnalysis.bcdNumbers || 'none');
        }
      });
    }
  }
  
  // Step 6: Check database persistence
  console.log('\n6️⃣ DATABASE PERSISTENCE CHECK');
  console.log('-'.repeat(30));
  
  if (window.cleanSupabaseService && state.selectedUser) {
    try {
      const dbResults = await window.cleanSupabaseService.getTopicClicks(
        state.selectedUser,
        targetTopic, // Use human-readable topic name for DB query
        targetDates[0], // Check first date
        hrKey
      );
      
      console.log(`💾 Database results for ${targetTopic} on ${targetDates[0]}:`, dbResults);
      
      // Check both dates
      for (const dateKey of targetDates) {
        const dateResults = await window.cleanSupabaseService.getTopicClicks(
          state.selectedUser,
          targetTopic,
          dateKey,
          hrKey
        );
        console.log(`💾 Database results for ${dateKey}:`, dateResults?.length || 0, 'records');
        
        if (dateResults && dateResults.length > 0) {
          dateResults.forEach(record => {
            console.log(`   ${record.number_value} (clicked: ${record.is_clicked})`);
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Database check failed:', error);
    }
  }
  
  // Step 7: DOM verification
  console.log('\n7️⃣ DOM VERIFICATION');
  console.log('-'.repeat(30));
  
  // Find number boxes in the UI
  const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent?.trim();
    return text && /^(1[0-2]|[1-9])$/.test(text);
  });
  
  console.log('🔢 Total number boxes found:', numberBoxes.length);
  
  // Check for styled boxes (indicating persistence worked)
  const styledBoxes = numberBoxes.filter(box => {
    return box.className.includes('bg-orange') || 
           box.className.includes('bg-green') ||
           box.style.backgroundColor.includes('orange') ||
           box.style.backgroundColor.includes('green');
  });
  
  console.log('🎨 Styled number boxes found:', styledBoxes.length);
  
  if (styledBoxes.length > 0) {
    console.log('🎨 Styled box details:');
    styledBoxes.forEach((box, i) => {
      console.log(`   ${i+1}. Number ${box.textContent.trim()} - ${box.className}`);
    });
  }
  
  // Step 8: Test specific numbers
  console.log('\n8️⃣ SPECIFIC NUMBER TESTS');
  console.log('-'.repeat(30));
  
  const testNumbers = [8, 10]; // The specific numbers mentioned
  
  testNumbers.forEach(num => {
    console.log(`🔢 Testing number ${num}:`);
    
    // Check if it should be highlighted according to current state
    targetDates.forEach(dateKey => {
      const shouldBeHighlighted = (clickedNumbers[tKey]?.[dateKey]?.[hrKey] || []).includes(num);
      console.log(`   Date ${dateKey}: Should be highlighted = ${shouldBeHighlighted}`);
      
      // Find the actual button for this number (this is approximate)
      const numberButton = numberBoxes.find(btn => btn.textContent.trim() === num.toString());
      if (numberButton) {
        const isActuallyStyled = numberButton.className.includes('bg-orange') || 
                                numberButton.className.includes('bg-green');
        console.log(`   DOM button styled = ${isActuallyStyled}`);
        
        if (shouldBeHighlighted !== isActuallyStyled) {
          console.log(`   ⚠️ MISMATCH: State says ${shouldBeHighlighted}, DOM shows ${isActuallyStyled}`);
        }
      }
    });
  });
  
  // Step 9: Recommendations
  console.log('\n9️⃣ DIAGNOSTIC SUMMARY & RECOMMENDATIONS');
  console.log('-'.repeat(30));
  
  const hasStateData = Object.keys(clickedNumbers).length > 0;
  const hasTopicData = !!clickedNumbers[tKey];
  const hasVisualFeedback = styledBoxes.length > 0;
  
  console.log('📊 Diagnostic Results:');
  console.log('   State has data:', hasStateData);
  console.log('   Topic has data:', hasTopicData);
  console.log('   Visual feedback:', hasVisualFeedback);
  
  if (!hasStateData) {
    console.log('🔧 ISSUE: No state data loaded');
    console.log('   Try: window.rule1PageDebug.forceReloadNumberBoxes()');
  } else if (!hasTopicData) {
    console.log('🔧 ISSUE: No data for D-4 Set-1 topic');
    console.log('   Check: Topic name mapping and database records');
  } else if (!hasVisualFeedback) {
    console.log('🔧 ISSUE: State exists but no visual feedback');
    console.log('   Check: Rendering logic and shouldHighlightCell function');
  } else {
    console.log('✅ All systems appear functional');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Test manual click on numbers 8 and 10');
  console.log('2. Check browser console for React errors');
  console.log('3. Verify dates 31-7-25 and 4-8-25 are properly formatted');
  console.log('4. Check HR1 is properly set and normalized');
  
  return {
    hasStateData,
    hasTopicData,
    hasVisualFeedback,
    styledBoxCount: styledBoxes.length,
    totalBoxCount: numberBoxes.length
  };
}

// Auto-run if on Rule1 page
if (window.location.href.includes('localhost') && (
  window.location.pathname.includes('rule1') || 
  document.querySelector('h1, h2, h3')?.textContent?.includes('Past Days')
)) {
  console.log('🚀 Auto-running D-4 Set-1 diagnostic...');
  setTimeout(() => {
    diagnoseDFourSetOnePersistence();
  }, 2000); // Wait 2 seconds for page to load
}

// Make available globally
window.diagnoseDFourSetOnePersistence = diagnoseDFourSetOnePersistence;
