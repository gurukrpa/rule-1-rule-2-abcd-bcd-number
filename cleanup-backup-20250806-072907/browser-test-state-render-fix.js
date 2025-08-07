/**
 * COMPREHENSIVE BROWSER TEST SCRIPT
 * Tests the state/render mismatch fix for number box clicks
 * 
 * INSTRUCTIONS:
 * 1. Open browser console (F12)
 * 2. Navigate to Rule 1 Page Enhanced
 * 3. Paste this entire script in the console
 * 4. Press Enter to run the test
 */

console.log('🧪 COMPREHENSIVE STATE/RENDER MISMATCH TEST STARTING...\n');

// Test function
async function testStateRenderSync() {
  console.log('🔍 Phase 1: Initial State Analysis');
  
  // Get current state
  const initialState = Object.keys(window.clickedNumbers || {});
  console.log(`📊 Initial state has ${initialState.length} clicked boxes`);
  
  if (initialState.length > 0) {
    console.log('🔑 Sample state keys:', initialState.slice(0, 3));
  }
  
  // Count visually clicked boxes
  const clickedBoxes = document.querySelectorAll('button[style*="rgb(255, 0, 0)"], button[style*="red"]');
  console.log(`🎨 Visual: ${clickedBoxes.length} boxes appear clicked (red)`);
  
  // Count highlighted cells
  const highlightedCells = document.querySelectorAll('.clicked-cell, [style*="background-color: rgba(255, 0, 0"]');
  console.log(`✨ Visual: ${highlightedCells.length} cells appear highlighted`);
  
  console.log('\n🔍 Phase 2: State/Visual Consistency Check');
  
  if (initialState.length === clickedBoxes.length && clickedBoxes.length === highlightedCells.length) {
    console.log('✅ STATE/RENDER SYNC: All counts match! Fix appears successful.');
  } else {
    console.log('⚠️  STATE/RENDER MISMATCH still detected:');
    console.log(`   State: ${initialState.length}, Visual boxes: ${clickedBoxes.length}, Highlighted cells: ${highlightedCells.length}`);
  }
  
  console.log('\n🔍 Phase 3: Testing New Click Behavior');
  
  // Find a number box to test click behavior
  const numberBoxes = document.querySelectorAll('button[onclick*="handleNumberBoxClick"]');
  
  if (numberBoxes.length === 0) {
    console.log('❌ No number boxes found for testing');
    return;
  }
  
  console.log(`📦 Found ${numberBoxes.length} number boxes for testing`);
  
  // Test clicking a box
  const testBox = numberBoxes[Math.floor(Math.random() * Math.min(10, numberBoxes.length))];
  console.log('🖱️  Testing click behavior on a random box...');
  
  // Get before state
  const beforeState = Object.keys(window.clickedNumbers || {}).length;
  const beforeVisual = document.querySelectorAll('button[style*="rgb(255, 0, 0)"], button[style*="red"]').length;
  
  // Simulate click
  testBox.click();
  
  // Wait a moment for state update
  setTimeout(() => {
    const afterState = Object.keys(window.clickedNumbers || {}).length;
    const afterVisual = document.querySelectorAll('button[style*="rgb(255, 0, 0)"], button[style*="red"]').length;
    
    console.log('\n📊 Click Test Results:');
    console.log(`   Before: State=${beforeState}, Visual=${beforeVisual}`);
    console.log(`   After:  State=${afterState}, Visual=${afterVisual}`);
    
    const stateChanged = afterState !== beforeState;
    const visualChanged = afterVisual !== beforeVisual;
    const syncMaintained = afterState === afterVisual;
    
    console.log(`   State Changed: ${stateChanged ? '✅' : '❌'}`);
    console.log(`   Visual Changed: ${visualChanged ? '✅' : '❌'}`);
    console.log(`   Sync Maintained: ${syncMaintained ? '✅' : '❌'}`);
    
    if (stateChanged && visualChanged && syncMaintained) {
      console.log('\n🎉 SUCCESS: Click behavior working correctly!');
      console.log('✅ State updates properly');
      console.log('✅ Visual updates properly'); 
      console.log('✅ State and visual remain in sync');
    } else {
      console.log('\n⚠️  ISSUE: Click behavior needs attention');
    }
    
    console.log('\n🔍 Phase 4: Key Format Verification');
    
    // Check if keys are using clean topic names
    const currentKeys = Object.keys(window.clickedNumbers || {});
    const sampleKey = currentKeys[0];
    
    if (sampleKey) {
      console.log(`🔑 Sample key format: "${sampleKey}"`);
      
      // Check if key contains annotations (should NOT contain "(trd)")
      if (sampleKey.includes('(trd)') || sampleKey.includes('(')) {
        console.log('❌ Key still contains annotations - fix may be incomplete');
      } else {
        console.log('✅ Key uses clean format - fix appears successful');
      }
    }
    
    console.log('\n🎯 FINAL ASSESSMENT:');
    console.log('='.repeat(50));
    
    const finalState = Object.keys(window.clickedNumbers || {}).length;
    const finalVisual = document.querySelectorAll('button[style*="rgb(255, 0, 0)"], button[style*="red"]').length;
    const finalHighlighted = document.querySelectorAll('.clicked-cell, [style*="background-color: rgba(255, 0, 0"]').length;
    
    if (finalState === finalVisual && finalVisual === finalHighlighted) {
      console.log('🎉 STATE/RENDER MISMATCH FIX: ✅ SUCCESSFUL');
      console.log(`   All components in sync: ${finalState} clicked boxes`);
    } else {
      console.log('⚠️  STATE/RENDER MISMATCH FIX: ❌ NEEDS MORE WORK');
      console.log(`   State: ${finalState}, Visual: ${finalVisual}, Highlighted: ${finalHighlighted}`);
    }
    
    console.log('\n🚀 Test complete! Check the UI to verify the fix.');
    
  }, 1000);
}

// Auto-run if on the correct page
if (window.location.pathname.includes('rule1') || document.querySelector('button[onclick*="handleNumberBoxClick"]')) {
  console.log('✅ Detected Rule 1 page - running test...\n');
  testStateRenderSync();
} else {
  console.log('❌ Please navigate to Rule 1 Page Enhanced first, then run: testStateRenderSync()');
  window.testStateRenderSync = testStateRenderSync;
}
