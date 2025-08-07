/**
 * COMPREHENSIVE NUMBER BOX PERSISTENCE TEST
 * Run this in browser console after the fix
 */

async function testNumberBoxPersistence() {
  console.log('🧪 COMPREHENSIVE NUMBER BOX PERSISTENCE TEST');
  console.log('='.repeat(60));
  
  const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
  const testDate = '2025-07-26';
  const hrNumber = 1;
  
  try {
    // 1. TEST ENVIRONMENT CHECK
    console.log('\n🔍 STEP 1: Environment Check');
    console.log('-'.repeat(40));
    
    const checks = {
      dualServiceManager: !!window.dualServiceManager,
      rule1PageDebug: !!window.rule1PageDebug,
      reactApp: !!document.querySelector('#root'),
      numberBoxes: document.querySelectorAll('button').length
    };
    
    console.log('Environment checks:', checks);
    
    if (!checks.dualServiceManager) {
      console.error('❌ DualServiceManager not available');
      return;
    }
    
    // 2. DATABASE TEST
    console.log('\n📊 STEP 2: Database Connectivity Test');
    console.log('-'.repeat(40));
    
    const savedClicks = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(userId, testDate);
    console.log('Database response:', {
      type: typeof savedClicks,
      isArray: Array.isArray(savedClicks),
      length: savedClicks?.length || 0
    });
    
    if (savedClicks && savedClicks.length > 0) {
      const hrClicks = savedClicks.filter(entry => entry.hr_number.toString() === hrNumber.toString());
      console.log(`HR ${hrNumber} specific clicks: ${hrClicks.length}/${savedClicks.length}`);
      
      if (hrClicks.length > 0) {
        console.log('Sample click record:', hrClicks[0]);
      }
    }
    
    // 3. REACT STATE TEST
    console.log('\n🧩 STEP 3: React State Test');
    console.log('-'.repeat(40));
    
    if (window.rule1PageDebug) {
      const state = {
        clickedCount: Object.keys(window.rule1PageDebug.clickedNumbers).length,
        presenceCount: Object.keys(window.rule1PageDebug.numberPresenceStatus).length,
        selectedUser: window.rule1PageDebug.selectedUser,
        date: window.rule1PageDebug.date,
        activeHR: window.rule1PageDebug.activeHR,
        dataKeys: Object.keys(window.rule1PageDebug.allDaysData).length,
        topics: window.rule1PageDebug.availableTopics.length
      };
      
      console.log('React state snapshot:', state);
      
      if (state.clickedCount > 0) {
        console.log('Sample clicked numbers:', 
          Object.keys(window.rule1PageDebug.clickedNumbers).slice(0, 3)
        );
      }
    }
    
    // 4. DOM VISUAL TEST
    console.log('\n🎨 STEP 4: DOM Visual Test');
    console.log('-'.repeat(40));
    
    const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
      const text = btn.textContent?.trim();
      return text && /^(1[0-2]|[1-9])$/.test(text);
    });
    
    const styledBoxes = numberBoxes.filter(box => {
      const hasOrangeStyle = box.className.includes('bg-orange') || 
                            box.style.backgroundColor.includes('orange');
      const hasGreenStyle = box.className.includes('bg-green') || 
                           box.style.backgroundColor.includes('green');
      return hasOrangeStyle || hasGreenStyle;
    });
    
    console.log('DOM analysis:', {
      totalNumberBoxes: numberBoxes.length,
      styledBoxes: styledBoxes.length,
      percentageStyled: ((styledBoxes.length / numberBoxes.length) * 100).toFixed(1) + '%'
    });
    
    // 5. MANUAL CLICK TEST
    console.log('\n🖱️ STEP 5: Manual Click Test');
    console.log('-'.repeat(40));
    
    if (numberBoxes.length > 0 && window.rule1PageDebug) {
      const testBox = numberBoxes[0];
      const testNumber = parseInt(testBox.textContent);
      
      console.log(`Testing click on number ${testNumber}...`);
      
      const beforeState = Object.keys(window.rule1PageDebug.clickedNumbers).length;
      
      // Simulate click
      testBox.click();
      
      // Check after small delay
      setTimeout(() => {
        const afterState = Object.keys(window.rule1PageDebug.clickedNumbers).length;
        console.log('Click test result:', {
          before: beforeState,
          after: afterState,
          changed: afterState !== beforeState,
          boxStyleChanged: testBox.className.includes('bg-orange') || testBox.className.includes('bg-green')
        });
      }, 500);
    }
    
    // 6. FORCE RELOAD TEST
    console.log('\n🔄 STEP 6: Force Reload Test');
    console.log('-'.repeat(40));
    
    if (window.rule1PageDebug && window.rule1PageDebug.forceReloadNumberBoxes) {
      console.log('Testing force reload...');
      await window.rule1PageDebug.forceReloadNumberBoxes();
      
      // Check results after delay
      setTimeout(() => {
        const reloadedState = {
          clickedCount: Object.keys(window.rule1PageDebug.clickedNumbers).length,
          presenceCount: Object.keys(window.rule1PageDebug.numberPresenceStatus).length
        };
        
        console.log('Force reload result:', reloadedState);
        
        // Check visual updates
        const updatedStyledBoxes = Array.from(document.querySelectorAll('button')).filter(box => {
          const text = box.textContent?.trim();
          if (!/^(1[0-2]|[1-9])$/.test(text)) return false;
          return box.className.includes('bg-orange') || box.className.includes('bg-green');
        });
        
        console.log('Visual update result:', {
          styledBoxesAfterReload: updatedStyledBoxes.length
        });
      }, 1000);
    }
    
    // 7. RECOMMENDATIONS
    console.log('\n💡 STEP 7: Recommendations');
    console.log('-'.repeat(40));
    
    console.log('To test the fix completely:');
    console.log('1. Click some number boxes (1-12) in the UI');
    console.log('2. Refresh the page');
    console.log('3. Check if the clicked numbers are restored with orange/green colors');
    console.log('4. Use window.rule1PageDebug.forceReloadNumberBoxes() to manually test');
    console.log('5. Check browser console for detailed loader logs');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Auto-run test
if (typeof window !== 'undefined') {
  testNumberBoxPersistence();
} else {
  console.log('This test must be run in a browser console');
}
