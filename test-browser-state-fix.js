#!/usr/bin/env node

console.log(`
🔍 BROWSER STATE VERIFICATION TEST
==================================

Instructions for browser testing:

1. Open http://localhost:5173/
2. Navigate to Past Days page for any date that shows the debug output
3. Open browser console (F12)
4. Copy and paste this test script:

---COPY FROM HERE---

// Test current state vs render
const testStateRenderSync = () => {
  console.log('🧪 [BROWSER-TEST] Starting state/render synchronization test...');
  
  // Check if debug objects are available
  if (!window.rule1PageDebug) {
    console.error('❌ window.rule1PageDebug not available - make sure you are on Rule1Page_Enhanced');
    return;
  }
  
  // Get current state
  const stateInfo = window.rule1PageDebug.getStateInfo();
  console.log('📊 Current State:', {
    clickedCount: Object.keys(stateInfo.clickedNumbers).length,
    presenceCount: Object.keys(stateInfo.numberPresenceStatus).length,
    hasData: stateInfo.hasData,
    activeHR: stateInfo.activeHR,
    selectedUser: stateInfo.selectedUser,
    date: stateInfo.date
  });
  
  // Find all number boxes in DOM
  const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent?.trim();
    return text && /^(1[0-2]|[1-9])$/.test(text);
  });
  
  console.log('🔍 DOM Analysis:', {
    totalNumberBoxes: numberBoxes.length,
    distinctNumbers: [...new Set(numberBoxes.map(btn => btn.textContent.trim()))].sort()
  });
  
  // Find styled boxes
  const styledBoxes = numberBoxes.filter(box => {
    const classes = box.className;
    return classes.includes('bg-orange') || classes.includes('bg-green');
  });
  
  console.log('🎨 Styled Boxes:', {
    styledCount: styledBoxes.length,
    styledNumbers: styledBoxes.map(box => ({
      number: box.textContent.trim(),
      classes: box.className,
      color: box.className.includes('bg-orange') ? 'ORANGE' : 
             box.className.includes('bg-green') ? 'GREEN' : 'OTHER'
    }))
  });
  
  // Check for key format consistency
  const stateKeys = Object.keys(stateInfo.clickedNumbers);
  console.log('🔑 State Keys Analysis:', {
    totalKeys: stateKeys.length,
    sampleKeys: stateKeys.slice(0, 5),
    keyFormats: stateKeys.map(key => {
      const parts = key.split('_');
      return {
        key,
        parts: parts.length,
        topicName: parts[0],
        dateKey: parts[1],
        number: parts[2],
        hr: parts[3]
      };
    }).slice(0, 3)
  });
  
  // Test the topic mapping
  if (window.rule1PageDebug.testTopicMapping) {
    console.log('🗺️ Testing topic mapping...');
    window.rule1PageDebug.testTopicMapping();
  }
  
  // Final verdict
  const isWorking = stateKeys.length > 0 && styledBoxes.length > 0;
  console.log(\`\${isWorking ? '✅' : '❌'} STATE/RENDER SYNC: \${isWorking ? 'WORKING' : 'BROKEN'}\`);
  
  if (!isWorking && stateKeys.length > 0) {
    console.log('🔧 DIAGNOSIS: State has data but no boxes are styled - likely key format mismatch');
    console.log('🔧 NEXT STEP: Check if topic names in state match topic names in render');
  }
  
  return {
    isWorking,
    stateCount: stateKeys.length,
    styledCount: styledBoxes.length,
    diagnosis: isWorking ? 'Working correctly' : 
               stateKeys.length > 0 ? 'Key format mismatch' : 'No state data'
  };
};

// Run the test
testStateRenderSync();

---COPY TO HERE---

Then run the test and report the results!
`);
