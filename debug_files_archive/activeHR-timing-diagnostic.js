/**
 * ActiveHR Timing Diagnostic Script
 * This script specifically tests the activeHR availability timing issue
 */

function checkActiveHRTiming() {
  console.log('🕐 ACTIVE HR TIMING DIAGNOSTIC');
  console.log('==============================');
  
  if (!window.rule1PageDebug) {
    console.log('❌ rule1PageDebug not available');
    return;
  }
  
  const state = window.rule1PageDebug.getStateInfo();
  console.log('Current State:', {
    selectedUser: state.selectedUser,
    date: state.date,
    activeHR: state.activeHR,
    allDaysDataKeys: state.allDaysDataKeys,
    hasClickedNumbers: Object.keys(state.clickedNumbers).length > 0
  });
  
  // Check if activeHR is properly set
  if (!state.activeHR) {
    console.log('🔍 ActiveHR Issue Detected:');
    console.log('  - activeHR is null/undefined');
    console.log('  - This prevents proper click restoration');
    console.log('  - Looking for available HRs in data...');
    
    // Try to find available HRs
    if (state.allDaysDataKeys > 0) {
      console.log('  - Data is available, checking for HRs...');
      // This would need access to actual data structure
    } else {
      console.log('  - No data available yet');
    }
  } else {
    console.log('✅ ActiveHR is properly set:', state.activeHR);
    
    // Check if there are database records for this HR
    if (window.dualServiceManager && state.selectedUser && state.date) {
      console.log('🔍 Checking database records for this HR...');
      
      window.dualServiceManager.getAllNumberBoxClicksForUserDate(state.selectedUser, state.date)
        .then(records => {
          if (records && records.length > 0) {
            const hrRecords = records.filter(r => r.hr_number.toString() === state.activeHR.toString());
            console.log(`📊 Database Analysis:`, {
              totalRecords: records.length,
              recordsForCurrentHR: hrRecords.length,
              currentHR: state.activeHR,
              allHRsInDatabase: [...new Set(records.map(r => r.hr_number.toString()))]
            });
            
            if (hrRecords.length > 0) {
              console.log('✅ Database has records for current HR');
              console.log('🔍 Sample records:', hrRecords.slice(0, 3));
              
              // Check if state matches database
              if (Object.keys(state.clickedNumbers).length === 0) {
                console.log('❌ TIMING ISSUE CONFIRMED:');
                console.log('  - Database has records');
                console.log('  - But React state is empty');
                console.log('  - This indicates loader ran before activeHR was ready');
                
                console.log('🔧 Attempting manual restoration...');
                window.rule1PageDebug.forceReloadNumberBoxes()
                  .then(() => {
                    console.log('✅ Manual restoration completed');
                    
                    // Check state again
                    setTimeout(() => {
                      const newState = window.rule1PageDebug.getStateInfo();
                      if (Object.keys(newState.clickedNumbers).length > 0) {
                        console.log('✅ RESTORATION SUCCESSFUL!');
                        console.log('  - State now has', Object.keys(newState.clickedNumbers).length, 'clicked numbers');
                      } else {
                        console.log('❌ Restoration failed - state still empty');
                      }
                    }, 1000);
                  })
                  .catch(error => {
                    console.error('❌ Manual restoration failed:', error);
                  });
              } else {
                console.log('✅ State properly matches database');
              }
            } else {
              console.log('ℹ️ No database records for current HR');
            }
          } else {
            console.log('ℹ️ No database records found');
          }
        })
        .catch(error => {
          console.error('❌ Database check failed:', error);
        });
    }
  }
  
  // Additional timing checks
  console.log('\n🕐 Component Lifecycle Timing:');
  console.log('Expected sequence:');
  console.log('1. Component mounts');
  console.log('2. Data loading begins');
  console.log('3. activeHR gets set from data');
  console.log('4. Number box loader runs');
  console.log('5. Clicks are restored');
  
  console.log('\nProblem sequence:');
  console.log('1. Component mounts');
  console.log('2. Number box loader runs (activeHR = null)');
  console.log('3. Data loading completes');
  console.log('4. activeHR gets set (too late)');
  console.log('5. Loader doesn\'t re-run, clicks not restored');
}

// Auto-run timing check
function monitorActiveHRChanges() {
  console.log('📡 Starting ActiveHR Monitor...');
  
  let lastActiveHR = null;
  let checkCount = 0;
  
  const monitor = setInterval(() => {
    checkCount++;
    
    if (window.rule1PageDebug) {
      const currentActiveHR = window.rule1PageDebug.activeHR;
      
      if (currentActiveHR !== lastActiveHR) {
        console.log(`🔄 [Monitor #${checkCount}] ActiveHR changed:`, {
          from: lastActiveHR,
          to: currentActiveHR,
          timestamp: new Date().toISOString()
        });
        
        lastActiveHR = currentActiveHR;
        
        if (currentActiveHR) {
          console.log('✅ ActiveHR is now available - this is when loader should run');
          
          // Check if clicks need to be restored
          const state = window.rule1PageDebug.getStateInfo();
          if (Object.keys(state.clickedNumbers).length === 0) {
            console.log('🔧 Triggering restoration now that activeHR is available...');
            window.rule1PageDebug.forceReloadNumberBoxes();
          }
        }
      }
    }
    
    // Stop after 30 seconds
    if (checkCount > 60) {
      clearInterval(monitor);
      console.log('📡 ActiveHR Monitor stopped after 30 seconds');
    }
  }, 500);
  
  return monitor;
}

// Expose functions
if (typeof window !== 'undefined') {
  window.checkActiveHRTiming = checkActiveHRTiming;
  window.monitorActiveHRChanges = monitorActiveHRChanges;
  
  console.log('🔧 ActiveHR Timing Tools Ready');
  console.log('Available commands:');
  console.log('  - checkActiveHRTiming()     // Check current timing state');
  console.log('  - monitorActiveHRChanges()  // Monitor activeHR changes over time');
}
