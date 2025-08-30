// Browser Console Debug Script for PlanetsAnalysisPage
// Run this in the browser console when on PlanetsAnalysisPage

console.log('🔍 [DEBUG] PlanetsAnalysisPage Number Display Debug');
console.log('=' .repeat(60));

// Check if we're on the right page
if (window.location.pathname.includes('planets')) {
  console.log('✅ On PlanetsAnalysisPage');
  
  // Check React state (assuming React dev tools)
  const reactRoot = document.querySelector('#root')._reactInternalInstance || 
                   document.querySelector('#root').__reactInternalInstance ||
                   document.querySelector('#root')._reactInternals;
  
  if (reactRoot) {
    console.log('✅ React app found');
    
    // Try to access component state
    try {
      // Check for data in localStorage or state
      console.log('📊 Checking for analysis data...');
      
      // Check if the numbers are in the DOM but hidden
      const numberButtons = document.querySelectorAll('button[class*="px-2"][class*="py-0.5"]');
      console.log(`🔍 Found ${numberButtons.length} number buttons in DOM`);
      
      if (numberButtons.length > 0) {
        console.log('✅ Number buttons exist! They might be hidden or styled out of view');
        numberButtons.forEach((btn, index) => {
          console.log(`Button ${index}: "${btn.textContent}" - visible: ${btn.offsetWidth > 0 && btn.offsetHeight > 0}`);
        });
      } else {
        console.log('❌ No number buttons found in DOM');
      }
      
      // Check for ABCD/BCD containers
      const abcdContainers = document.querySelectorAll('div[class*="bg-blue-50"]');
      console.log(`🔍 Found ${abcdContainers.length} blue background containers (should contain numbers)`);
      
      abcdContainers.forEach((container, index) => {
        console.log(`Container ${index}:`, container.textContent.trim());
      });
      
    } catch (error) {
      console.log('❌ Error accessing component state:', error);
    }
  } else {
    console.log('❌ React app not found');
  }
} else {
  console.log('❌ Not on PlanetsAnalysisPage');
  console.log('Current path:', window.location.pathname);
}

// Also check for any console errors
console.log('🔍 Check browser console for any error messages related to PlanetsAnalysisPage or rule2AnalysisService');
