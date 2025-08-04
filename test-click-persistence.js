/**
 * SIMPLE RULE-1 NUMBER BOX CLICK TEST
 * Run this in the browser console to test save/load functionality
 */

async function testNumberBoxClickPersistence() {
    console.log('🔬 TESTING NUMBER BOX CLICK PERSISTENCE...\n');
    
    // Check if we have the required services
    if (!window.dualServiceManager) {
        console.error('❌ DualServiceManager not found in window');
        return;
    }
    
    if (!window.dualServiceManager.enabled) {
        console.error('❌ DualServiceManager is disabled');
        return;
    }
    
    // Test data
    const testUserId = '1';  // Use actual user ID from your system
    const testSetName = 'D-1 Set-1 Matrix';
    const testDateKey = '2025-01-20';  // Use actual date from your system
    const testNumberValue = 6;
    const testHrNumber = 1;
    const testIsPresent = true;
    
    console.log('📋 Test parameters:', {
        userId: testUserId,
        setName: testSetName,  
        dateKey: testDateKey,
        numberValue: testNumberValue,
        hrNumber: testHrNumber,
        isPresent: testIsPresent
    });
    
    try {
        // Step 1: Clear any existing data for this test
        console.log('\n1️⃣ CLEARING EXISTING TEST DATA...');
        await window.dualServiceManager.clearNumberBoxClicksForDate(testUserId, testDateKey);
        console.log('✅ Cleared existing data');
        
        // Step 2: Save a test click
        console.log('\n2️⃣ SAVING TEST CLICK...');
        const saveResult = await window.dualServiceManager.saveNumberBoxClick(
            testUserId, testSetName, testDateKey, testNumberValue, testHrNumber, true, testIsPresent
        );
        
        if (saveResult.success) {
            console.log('✅ Save successful:', saveResult);
        } else {
            console.error('❌ Save failed:', saveResult);
            return;
        }
        
        // Step 3: Load the saved click
        console.log('\n3️⃣ LOADING SAVED CLICKS...');
        const loadedClicks = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(testUserId, testDateKey);
        
        console.log('📦 Loaded clicks:', loadedClicks);
        
        if (loadedClicks && loadedClicks.length > 0) {
            console.log('✅ Load successful - found', loadedClicks.length, 'records');
            
            const testRecord = loadedClicks.find(record => 
                record.number_value === testNumberValue && 
                record.hr_number === testHrNumber &&
                record.set_name === testSetName
            );
            
            if (testRecord) {
                console.log('✅ Test record found:', testRecord);
                
                // Verify the record data
                const isValid = 
                    testRecord.user_id === testUserId &&
                    testRecord.set_name === testSetName &&
                    testRecord.date_key === testDateKey &&
                    testRecord.number_value === testNumberValue &&
                    testRecord.hr_number === testHrNumber &&
                    testRecord.is_clicked === true &&
                    testRecord.is_present === testIsPresent;
                    
                if (isValid) {
                    console.log('✅ PERSISTENCE TEST PASSED - Data saved and loaded correctly!');
                } else {
                    console.error('❌ PERSISTENCE TEST FAILED - Data corruption detected');
                    console.log('Expected:', { testUserId, testSetName, testDateKey, testNumberValue, testHrNumber, isClicked: true, testIsPresent });
                    console.log('Actual:', testRecord);
                }
            } else {
                console.error('❌ PERSISTENCE TEST FAILED - Test record not found in loaded data');
            }
        } else {
            console.error('❌ PERSISTENCE TEST FAILED - No data loaded');
        }
        
        // Step 4: Test the Rule1Page load mechanism
        console.log('\n4️⃣ TESTING RULE1PAGE LOAD MECHANISM...');
        if (window.rule1PageDebug?.forceReloadNumberBoxes) {
            console.log('🔄 Triggering Rule1Page reload...');
            await window.rule1PageDebug.forceReloadNumberBoxes();
            
            // Check if the data appeared in the UI state
            setTimeout(() => {
                const clickedCount = window.rule1PageDebug.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers).length : 0;
                console.log('📊 UI state after reload:', {
                    clickedNumbersCount: clickedCount,
                    firstFewKeys: window.rule1PageDebug.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers).slice(0, 3) : []
                });
                
                if (clickedCount > 0) {
                    console.log('✅ UI LOAD TEST PASSED - Data appeared in UI state');
                } else {
                    console.log('❌ UI LOAD TEST FAILED - Data not appearing in UI state');
                    console.log('💡 This indicates an issue with the loadNumberBoxClicks function or key generation');
                }
            }, 1000);
        } else {
            console.log('❌ Rule1Page debug functions not available');
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
if (typeof window !== 'undefined') {
    window.testNumberBoxClickPersistence = testNumberBoxClickPersistence;
    console.log('🔬 Number box click persistence test ready!');
    console.log('📞 Run: window.testNumberBoxClickPersistence()');
} else {
    console.log('This script should be run in the browser console on the Rule-1 page');
}
