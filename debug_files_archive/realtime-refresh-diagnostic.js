/**
 * REAL-TIME PAGE REFRESH DIAGNOSTIC
 * Run this immediately after page refresh to see what's happening
 */

console.log('🔍 STARTING REAL-TIME PAGE REFRESH DIAGNOSTIC');
console.log('='.repeat(60));

const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
const testDate = '2025-06-26'; // Based on your logs
const hrNumber = 1;

// Monitor for when DualServiceManager becomes available
let checkCount = 0;
const maxChecks = 20;

const checkForServices = () => {
  checkCount++;
  console.log(`🔍 Check ${checkCount}/${maxChecks} - Service availability:`, {
    dualServiceManager: !!window.dualServiceManager,
    rule1PageDebug: !!window.rule1PageDebug,
    timestamp: new Date().toISOString()
  });

  if (window.dualServiceManager) {
    console.log('✅ DualServiceManager found, testing database connection...');
    
    // Test database immediately
    window.dualServiceManager.getAllNumberBoxClicksForUserDate(userId, testDate)
      .then(savedClicks => {
        console.log('📊 IMMEDIATE DATABASE TEST RESULT:', {
          type: typeof savedClicks,
          isArray: Array.isArray(savedClicks),
          length: savedClicks?.length || 0,
          rawData: savedClicks
        });

        if (savedClicks && savedClicks.length > 0) {
          const hrClicks = savedClicks.filter(entry => 
            entry.hr_number.toString() === hrNumber.toString()
          );
          
          console.log(`🎯 HR ${hrNumber} SPECIFIC CLICKS:`, {
            totalClicks: savedClicks.length,
            hrSpecificClicks: hrClicks.length,
            hrClicksData: hrClicks
          });

          if (hrClicks.length > 0) {
            console.log('🔑 KEY GENERATION TEST:');
            hrClicks.forEach((entry, idx) => {
              const key = `${entry.set_name}_${entry.date_key}_${entry.number_value}_HR${entry.hr_number}`;
              console.log(`  ${idx + 1}. Key: ${key}`, {
                isClicked: entry.is_clicked,
                isPresent: entry.is_present,
                shouldRestore: entry.is_clicked === true
              });
            });
          }
        } else {
          console.warn('⚠️ NO SAVED CLICKS FOUND - Check if clicks were actually saved');
        }
      })
      .catch(error => {
        console.error('❌ Database test failed:', error);
      });

    // Stop checking once services are found
    return;
  }

  if (checkCount < maxChecks) {
    setTimeout(checkForServices, 500);
  } else {
    console.error('❌ Services not found after maximum attempts');
  }
};

// Start monitoring immediately
checkForServices();

// Monitor React state changes
let reactStateCheckCount = 0;
const monitorReactState = () => {
  reactStateCheckCount++;
  
  if (window.rule1PageDebug) {
    console.log(`🧩 REACT STATE CHECK ${reactStateCheckCount}:`, {
      clickedNumbers: Object.keys(window.rule1PageDebug.clickedNumbers).length,
      numberPresenceStatus: Object.keys(window.rule1PageDebug.numberPresenceStatus).length,
      selectedUser: window.rule1PageDebug.selectedUser,
      date: window.rule1PageDebug.date,
      activeHR: window.rule1PageDebug.activeHR,
      allDaysDataKeys: Object.keys(window.rule1PageDebug.allDaysData).length,
      availableTopicsCount: window.rule1PageDebug.availableTopics.length,
      timestamp: new Date().toISOString()
    });

    if (Object.keys(window.rule1PageDebug.clickedNumbers).length > 0) {
      console.log('✅ CLICKED NUMBERS FOUND IN STATE:', window.rule1PageDebug.clickedNumbers);
      
      // Check DOM visual state
      setTimeout(() => {
        const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
          const text = btn.textContent?.trim();
          return text && /^(1[0-2]|[1-9])$/.test(text);
        });

        const styledBoxes = numberBoxes.filter(box => {
          return box.className.includes('bg-orange') || 
                 box.className.includes('bg-green') ||
                 box.style.backgroundColor.includes('orange') ||
                 box.style.backgroundColor.includes('green');
        });

        console.log('🎨 DOM VISUAL STATE:', {
          totalNumberBoxes: numberBoxes.length,
          styledBoxes: styledBoxes.length,
          styledBoxDetails: styledBoxes.map(box => ({
            number: box.textContent?.trim(),
            className: box.className,
            style: box.style.cssText
          }))
        });

        if (Object.keys(window.rule1PageDebug.clickedNumbers).length > 0 && styledBoxes.length === 0) {
          console.error('🚨 STATE/VISUAL MISMATCH DETECTED!');
          console.error('   - React state has clicked numbers but no boxes are visually styled');
          console.error('   - This indicates a rendering problem');
        }
      }, 1000);
      
    } else {
      console.log('⚠️ No clicked numbers in React state yet');
    }
  } else if (reactStateCheckCount < 10) {
    setTimeout(monitorReactState, 1000);
  }
};

// Start monitoring React state
setTimeout(monitorReactState, 2000);

// Look for loader logs in console
console.log('🔍 WATCHING FOR LOADER LOGS...');
console.log('Look for logs starting with:');
console.log('  - 🚀 [LOADER-xxx] Starting comprehensive number box loader');
console.log('  - 📦 [LOADER-xxx] Database response');
console.log('  - 🔄 [LOADER-xxx] Applying state changes');
console.log('  - ✅ [LOADER-xxx] Number box loading completed successfully');

// Manual trigger function
window.manualTriggerLoader = () => {
  if (window.rule1PageDebug && window.rule1PageDebug.forceReloadNumberBoxes) {
    console.log('🔄 MANUALLY TRIGGERING LOADER...');
    window.rule1PageDebug.forceReloadNumberBoxes();
  } else {
    console.error('❌ Manual trigger not available');
  }
};

console.log('💡 MANUAL TESTING:');
console.log('  - Run window.manualTriggerLoader() to manually trigger the loader');
console.log('  - Check browser console for detailed loader execution logs');
console.log('  - Look for useEffect trigger logs');

// Set up a comprehensive state monitor
setInterval(() => {
  if (window.rule1PageDebug) {
    const currentState = {
      clickedCount: Object.keys(window.rule1PageDebug.clickedNumbers).length,
      presenceCount: Object.keys(window.rule1PageDebug.numberPresenceStatus).length
    };
    
    if (currentState.clickedCount > 0) {
      console.log('🔄 [MONITOR] State still present:', currentState);
    }
  }
}, 5000);

console.log('✅ Real-time diagnostic monitoring started');
