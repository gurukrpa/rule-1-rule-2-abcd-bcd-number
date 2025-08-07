/**
 * 🔧 COMPREHENSIVE NUMBER BOX PERSISTENCE DEBUGGER
 * Run this in browser console to diagnose and fix number box persistence issues
 */

console.log('🔧 COMPREHENSIVE NUMBER BOX PERSISTENCE DEBUGGER LOADED');

async function debugNumberBoxPersistence() {
  console.log('🚀 Starting comprehensive number box persistence debugging...');
  
  // PHASE 1: Check if we're on the right page
  const isRule1Page = window.location.pathname.includes('abcd') || 
                      document.querySelector('[data-testid="rule1-page"]') ||
                      document.title.includes('Past Days') ||
                      window.rule1PageDebug;
  
  if (!isRule1Page) {
    console.error('❌ This debugger must be run on the Rule1Page (Past Days page)');
    console.log('📍 Current location:', window.location.pathname);
    console.log('🔗 Navigate to: /abcd/{userId} and then click "Past Days"');
    return;
  }
  
  console.log('✅ Detected Rule1Page environment');
  
  // PHASE 2: Check debug interface availability
  if (!window.rule1PageDebug) {
    console.error('❌ Rule1Page debug interface not available');
    console.log('⏳ Please wait for the page to fully load and try again');
    return;
  }
  
  console.log('✅ Rule1Page debug interface available');
  
  // PHASE 3: Get current state information
  const stateInfo = window.rule1PageDebug.getStateInfo();
  console.log('📊 Current state information:', stateInfo);
  
  const { selectedUser, date, activeHR, clickedNumbers, numberPresenceStatus } = stateInfo;
  
  // PHASE 4: Validate critical dependencies
  const criticalIssues = [];
  if (!selectedUser) criticalIssues.push('Missing selectedUser');
  if (!date) criticalIssues.push('Missing date');
  if (!activeHR) criticalIssues.push('Missing activeHR');
  
  if (criticalIssues.length > 0) {
    console.error('❌ Critical dependencies missing:', criticalIssues);
    return;
  }
  
  console.log('✅ All critical dependencies available');
  
  // PHASE 5: Test database connection
  console.log('🔍 Testing database connection...');
  try {
    const dbTest = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(selectedUser, date);
    console.log('✅ Database connection successful');
    console.log('📦 Database records found:', dbTest?.length || 0);
    
    if (dbTest && dbTest.length > 0) {
      console.log('📋 Database records for current date:', dbTest);
      
      // Check HR-specific records
      const hrRecords = dbTest.filter(r => r.hr_number.toString() === activeHR.toString());
      console.log(`🎯 HR ${activeHR} specific records:`, hrRecords.length);
      
      if (hrRecords.length > 0) {
        console.log('🔍 HR-specific records:', hrRecords);
      }
    }
  } catch (dbError) {
    console.error('❌ Database connection failed:', dbError);
    return;
  }
  
  // PHASE 6: Test state restoration
  console.log('🔄 Testing state restoration...');
  try {
    await window.rule1PageDebug.forceReloadNumberBoxes();
    console.log('✅ State restoration completed');
    
    // Re-check state after restoration
    const newStateInfo = window.rule1PageDebug.getStateInfo();
    console.log('📊 State after restoration:', {
      clickedNumbersCount: Object.keys(newStateInfo.clickedNumbers).length,
      presenceStatusCount: Object.keys(newStateInfo.numberPresenceStatus).length,
      hasIncreasedState: Object.keys(newStateInfo.clickedNumbers).length > Object.keys(clickedNumbers).length
    });
    
  } catch (restoreError) {
    console.error('❌ State restoration failed:', restoreError);
  }
  
  // PHASE 7: Test clicking and persistence
  console.log('🔢 Testing number box clicking and persistence...');
  
  // Find available topics for testing
  const availableTopics = stateInfo.availableTopicsCount > 0 ? 
    Object.keys(stateInfo.allDaysData || {}) : [];
  
  if (availableTopics.length === 0) {
    console.warn('⚠️ No available topics found for testing');
  } else {
    console.log(`🎯 Testing with first available topic and date...`);
    
    // Test clicking number 1 and 7 (common test case from issue description)
    const testTopic = 'D-1 Set-1 Matrix'; // Use standard topic name
    const testDate = date;
    const testNumbers = [1, 7];
    
    console.log(`🧪 Testing clicks for numbers ${testNumbers.join(', ')} on topic "${testTopic}" for date "${testDate}"`);
    
    for (const testNumber of testNumbers) {
      try {
        console.log(`🔢 Testing click for number ${testNumber}...`);
        
        // Check initial state
        const initialKey = `${testTopic}_${testDate}_${testNumber}_HR${activeHR}`;
        const initialState = clickedNumbers[initialKey] || false;
        console.log(`📊 Initial state for ${testNumber}: ${initialState}`);
        
        // Trigger click
        await window.rule1PageDebug.testClick(testNumber, testTopic, testDate);
        
        // Wait for state update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check new state
        const newState = window.rule1PageDebug.getStateInfo();
        const newClickState = newState.clickedNumbers[initialKey] || false;
        console.log(`📊 New state for ${testNumber}: ${newClickState}`);
        
        // Verify persistence to database
        const dbAfterClick = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(selectedUser, date);
        const dbRecord = dbAfterClick?.find(r => 
          r.set_name === testTopic && 
          r.date_key === testDate && 
          r.number_value === testNumber &&
          r.hr_number.toString() === activeHR.toString()
        );
        
        console.log(`💾 Database record for ${testNumber}:`, dbRecord ? 'FOUND' : 'NOT FOUND');
        if (dbRecord) {
          console.log(`📋 Record details:`, {
            id: dbRecord.id,
            isClicked: dbRecord.is_clicked,
            isPresent: dbRecord.is_present,
            clickedAt: dbRecord.clicked_at
          });
        }
        
      } catch (testError) {
        console.error(`❌ Test failed for number ${testNumber}:`, testError);
      }
    }
  }
  
  // PHASE 8: Page refresh simulation test
  console.log('🔄 Testing page refresh persistence...');
  console.log('💡 To test page refresh:');
  console.log('   1. Click some numbers');
  console.log('   2. Refresh the page (F5 or Cmd+R)');
  console.log('   3. Navigate back to Past Days');
  console.log('   4. Check if clicked numbers are restored');
  console.log('   5. Use "🔁 Restore Clicked Numbers" button if needed');
  
  // PHASE 9: DOM verification
  console.log('🎨 Verifying DOM state...');
  const domState = window.rule1PageDebug.verifyDOMState();
  console.log('🎨 DOM verification results:', domState);
  
  // PHASE 10: Summary and recommendations
  console.log('📝 DEBUGGING SUMMARY:');
  console.log('✅ Checks completed:');
  console.log('   - Rule1Page environment detection');
  console.log('   - Debug interface availability');
  console.log('   - Critical dependencies validation');
  console.log('   - Database connection test');
  console.log('   - State restoration test');
  console.log('   - Click persistence test');
  console.log('   - DOM state verification');
  
  const finalStateInfo = window.rule1PageDebug.getStateInfo();
  console.log('📊 Final state summary:', {
    totalClickedNumbers: Object.keys(finalStateInfo.clickedNumbers).length,
    totalPresenceStatus: Object.keys(finalStateInfo.numberPresenceStatus).length,
    isFullyReady: finalStateInfo.isFullyReady,
    readinessCheck: finalStateInfo.readinessCheck
  });
  
  // PHASE 11: Specific issue analysis
  console.log('🔍 ISSUE-SPECIFIC ANALYSIS:');
  if (Object.keys(finalStateInfo.clickedNumbers).length === 0) {
    console.warn('⚠️ NO CLICKED NUMBERS IN STATE - This could indicate:');
    console.warn('   - Numbers were never clicked');
    console.warn('   - State restoration failed');
    console.warn('   - Database save/load issues');
    console.warn('   - Key format mismatches');
  } else if (Object.keys(finalStateInfo.clickedNumbers).length === 1) {
    console.warn('⚠️ ONLY 1 CLICKED NUMBER FOUND - This matches the reported issue!');
    console.warn('   - Multiple clicks may not be saving properly');
    console.warn('   - State merging issues during restoration');
    console.warn('   - Race conditions in rapid clicking');
    
    // Show the single clicked number for analysis
    const singleKey = Object.keys(finalStateInfo.clickedNumbers)[0];
    console.warn(`🔍 Single clicked number key: ${singleKey}`);
    console.warn(`🔍 Value: ${finalStateInfo.clickedNumbers[singleKey]}`);
    console.warn(`🔍 Presence: ${finalStateInfo.numberPresenceStatus[singleKey]}`);
  } else {
    console.log(`✅ ${Object.keys(finalStateInfo.clickedNumbers).length} clicked numbers found - state looks healthy`);
  }
  
  console.log('🎯 NEXT STEPS:');
  console.log('   1. Try clicking multiple numbers (1, 7) as described in the issue');
  console.log('   2. Use the "🔁 Restore Clicked Numbers" button to force restoration');
  console.log('   3. Check browser console for detailed logging during clicks');
  console.log('   4. If issue persists, the enhanced state merging should fix it');
  
  console.log('🔧 DEBUGGING COMPLETE');
}

// Auto-run the debugger
debugNumberBoxPersistence();

// Also expose it globally for manual runs
window.debugNumberBoxPersistence = debugNumberBoxPersistence;

console.log('💡 TIP: Run debugNumberBoxPersistence() anytime to re-run this comprehensive test');
