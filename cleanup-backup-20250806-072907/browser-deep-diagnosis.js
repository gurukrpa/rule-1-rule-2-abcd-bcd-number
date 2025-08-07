/**
 * BROWSER DIAGNOSTIC: Deep Number Box Persistence Analysis
 * Run this script in your browser console while on the Rule1Page
 */

async function deepNumberBoxDiagnosis() {
  console.log('🔬 DEEP BROWSER DIAGNOSIS: Number Box Persistence Issue');
  console.log('='.repeat(80));
  
  const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
  const testDate = '2025-07-26'; // Adjust this to your current test date
  const hrNumber = 1; // Adjust this to your current test HR
  
  try {
    // 1. CHECK REACT STATE
    console.log('\n🧩 STEP 1: React State Analysis');
    console.log('-'.repeat(50));
    
    // Try to access React state through various methods
    const reactFiberKey = Object.keys(document.querySelector('#root')).find(key => 
      key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
    );
    
    if (reactFiberKey) {
      const reactFiber = document.querySelector('#root')[reactFiberKey];
      console.log('✅ React Fiber found');
      
      // Try to find the component state
      let currentFiber = reactFiber;
      let componentFound = false;
      
      while (currentFiber && !componentFound) {
        if (currentFiber.memoizedState || currentFiber.stateNode) {
          console.log('🎯 Component with state found:', currentFiber);
          componentFound = true;
        }
        currentFiber = currentFiber.child || currentFiber.sibling || currentFiber.return;
      }
    }
    
    // 2. CHECK WINDOW OBJECTS
    console.log('\n🌐 STEP 2: Window Object Analysis');
    console.log('-'.repeat(50));
    
    console.log('Available debug objects:');
    console.log('  window.dualServiceManager:', !!window.dualServiceManager);
    console.log('  window.reactDevTools:', !!window.reactDevTools);
    
    if (window.dualServiceManager) {
      console.log('✅ DualServiceManager available');
      
      // Test database connectivity
      try {
        console.log('🔍 Testing database connection...');
        const testData = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(userId, testDate);
        console.log('📊 Database test result:', testData);
        console.log('📊 Data type:', typeof testData);
        console.log('📊 Data length:', testData?.length);
        
        if (testData && Array.isArray(testData)) {
          console.log('📋 Sample database record:', testData[0]);
          
          // Filter for current HR
          const hrFiltered = testData.filter(item => item.hr_number.toString() === hrNumber.toString());
          console.log(`🎯 HR ${hrNumber} specific data:`, hrFiltered.length, 'records');
          
          hrFiltered.forEach((item, idx) => {
            const key = `${item.set_name}_${item.date_key}_${item.number_value}_HR${item.hr_number}`;
            console.log(`  ${idx + 1}. Key: ${key}, Clicked: ${item.is_clicked}, Present: ${item.is_present}`);
          });
          
        }
      } catch (dbError) {
        console.error('❌ Database test failed:', dbError);
      }
    }
    
    // 3. DOM ANALYSIS
    console.log('\n🎨 STEP 3: DOM State Analysis');
    console.log('-'.repeat(50));
    
    const numberBoxes = document.querySelectorAll('[data-number-box]');
    console.log(`📱 Total number boxes found: ${numberBoxes.length}`);
    
    if (numberBoxes.length > 0) {
      console.log('🔍 Number box states:');
      numberBoxes.forEach((box, idx) => {
        const number = box.dataset.numberBox;
        const isClicked = box.classList.contains('clicked') || box.style.backgroundColor.includes('orange');
        console.log(`  Box ${idx + 1}: Number ${number}, Clicked: ${isClicked}, Classes: ${box.className}`);
      });
    }
    
    // 4. LOCAL STORAGE CHECK
    console.log('\n💾 STEP 4: Local Storage Analysis');
    console.log('-'.repeat(50));
    
    console.log('Local storage keys:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes('number') || key.includes('click') || key.includes('box')) {
        console.log(`  ${key}: ${localStorage.getItem(key)}`);
      }
    }
    
    // 5. TIMING ANALYSIS
    console.log('\n⏰ STEP 5: Timing Analysis');
    console.log('-'.repeat(50));
    
    console.log('Checking page load timing...');
    console.log('  Document ready state:', document.readyState);
    console.log('  Page load time:', performance.now(), 'ms since navigation start');
    
    // 6. FORCE RELOAD TEST
    console.log('\n🔄 STEP 6: Manual Reload Test');
    console.log('-'.repeat(50));
    
    if (window.dualServiceManager) {
      console.log('🚀 Attempting manual number box reload...');
      
      try {
        const savedClicks = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(userId, testDate);
        
        if (savedClicks && Array.isArray(savedClicks)) {
          const hrClicks = savedClicks.filter(entry => entry.hr_number.toString() === hrNumber.toString());
          console.log(`📦 Found ${hrClicks.length} clicks for HR ${hrNumber}`);
          
          // Simulate the loader logic
          const newClicked = {};
          const newPresent = {};
          
          hrClicks.forEach(entry => {
            if (entry.is_clicked === true) {
              const key = `${entry.set_name}_${entry.date_key}_${entry.number_value}_HR${entry.hr_number}`;
              newClicked[key] = true;
              newPresent[key] = entry.is_present;
            }
          });
          
          console.log('🎯 Should restore these clicks:', newClicked);
          console.log('🎯 Should restore these presence states:', newPresent);
          
          // Try to apply directly to DOM
          Object.keys(newClicked).forEach(key => {
            const parts = key.split('_');
            const numberValue = parts[2];
            const boxes = Array.from(document.querySelectorAll(`[data-number-box="${numberValue}"]`));
            
            boxes.forEach(box => {
              console.log(`🎨 Applying visual state to number ${numberValue}`);
              box.style.backgroundColor = '#ff6b35';
              box.style.border = '2px solid #ff6b35';
              box.style.color = 'white';
            });
          });
          
        }
      } catch (error) {
        console.error('❌ Manual reload test failed:', error);
      }
    }
    
    // 7. PROBLEM IDENTIFICATION
    console.log('\n🚨 STEP 7: Problem Identification');
    console.log('-'.repeat(50));
    
    const issues = [];
    
    if (!window.dualServiceManager) {
      issues.push('❌ DualServiceManager not available in window');
    }
    
    if (numberBoxes.length === 0) {
      issues.push('❌ No number boxes found in DOM');
    }
    
    const hasVisuallyClickedBoxes = Array.from(numberBoxes).some(box => 
      box.style.backgroundColor.includes('orange') || box.classList.contains('clicked')
    );
    
    if (!hasVisuallyClickedBoxes) {
      issues.push('⚠️ No visually clicked number boxes found in DOM');
    }
    
    if (issues.length > 0) {
      console.log('🚨 Issues detected:');
      issues.forEach(issue => console.log(`  ${issue}`));
    } else {
      console.log('✅ No obvious issues detected - problem may be in React state timing');
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
  
  console.log('\n💡 Next Steps:');
  console.log('1. Check React DevTools for component state');
  console.log('2. Add console.log to loadSavedNumberBoxClicks function');
  console.log('3. Verify useEffect dependencies are triggering');
  console.log('4. Check if multiple instances of the component are mounting');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  deepNumberBoxDiagnosis();
} else {
  console.log('This script must be run in a browser console');
}
