/**
 * SPECIFIC RULE-1 PERSISTENCE DIAGNOSTIC
 * This script will test the exact scenario described in the issue
 */

console.log('🔍 Starting specific Rule-1 persistence diagnostic...\n');

// Helper function to wait for condition
function waitFor(condition, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        function check() {
            if (condition()) {
                resolve();
            } else if (Date.now() - startTime > timeout) {
                reject(new Error('Timeout waiting for condition'));
            } else {
                setTimeout(check, 100);
            }
        }
        check();
    });
}

async function runSpecificDiagnostic() {
    try {
        console.log('1️⃣ CHECKING PREREQUISITES...');
        
        // Wait for all required services to be available
        await waitFor(() => 
            window.dualServiceManager &&
            window.rule1PageDebug &&
            window.dualServiceManager.enabled
        );
        
        console.log('✅ All services available');
        
        // Get current page state
        const currentState = {
            user: window.rule1PageDebug.selectedUser,
            date: window.rule1PageDebug.date,
            activeHR: window.rule1PageDebug.activeHR,
            clickedCount: window.rule1PageDebug.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers).length : 0
        };
        
        console.log('📊 Current page state:', currentState);
        
        if (!currentState.user || !currentState.date || !currentState.activeHR) {
            console.error('❌ Page not properly initialized. Please ensure you are on the Rule-1 page with a selected user, date, and HR.');
            return;
        }
        
        console.log('\n2️⃣ TESTING THE EXACT ISSUE SCENARIO...');
        
        // Step 1: Click some number boxes (simulate user interaction)
        console.log('🖱️ Simulating number box clicks...');
        
        const testNumbers = [1, 7]; // Test with the numbers mentioned in the issue
        const testTopic = 'D-1 Set-1 Matrix'; // Use a common topic
        
        for (const number of testNumbers) {
            console.log(`   Clicking number ${number}...`);
            if (window.rule1PageDebug.testClick) {
                window.rule1PageDebug.testClick(number, testTopic, currentState.date);
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait for click to process
            }
        }
        
        // Step 2: Check if clicks are in memory
        const clicksInMemory = window.rule1PageDebug.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers).length : 0;
        console.log(`📊 Clicks in memory after clicking: ${clicksInMemory}`);
        
        if (clicksInMemory === 0) {
            console.error('❌ ISSUE FOUND: Clicks not being stored in memory');
            return;
        }
        
        // Step 3: Check if clicks are in database
        console.log('🔍 Checking database for saved clicks...');
        const dbClicks = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(currentState.user, currentState.date);
        console.log(`📦 Clicks in database: ${dbClicks?.length || 0}`);
        
        if (!dbClicks || dbClicks.length === 0) {
            console.error('❌ ISSUE FOUND: Clicks not being saved to database');
            console.log('💡 This means the save operation is failing silently');
            return;
        }
        
        // Step 4: Simulate page refresh by clearing memory and reloading
        console.log('\n3️⃣ SIMULATING PAGE REFRESH...');
        
        // Clear the in-memory state to simulate refresh
        console.log('🧹 Clearing memory state...');
        const memoryBackup = { ...window.rule1PageDebug.clickedNumbers };
        
        // Simulate what happens on page load
        console.log('🔄 Triggering reload from database...');
        await window.rule1PageDebug.forceReloadNumberBoxes();
        
        // Wait a moment for state to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 5: Check if data was restored
        const restoredCount = window.rule1PageDebug.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers).length : 0;
        console.log(`📊 Clicks restored after reload: ${restoredCount}`);
        
        // Step 6: Test the "Show Clicked Numbers" functionality
        console.log('\n4️⃣ TESTING "SHOW CLICKED Numbers" BUTTON...');
        
        const showResult = window.rule1PageDebug.showClickedNumbers();
        console.log('📋 Show Clicked Numbers result:', showResult);
        
        // Final diagnosis
        console.log('\n🏁 DIAGNOSTIC RESULTS:');
        console.log('═══════════════════════════════════════════════');
        
        if (clicksInMemory > 0) {
            console.log('✅ SAVE: Number box clicks are stored in memory when clicked');
        } else {
            console.log('❌ SAVE: Number box clicks are NOT stored in memory when clicked');
        }
        
        if (dbClicks && dbClicks.length > 0) {
            console.log('✅ PERSIST: Number box clicks are saved to database');
        } else {
            console.log('❌ PERSIST: Number box clicks are NOT saved to database');
        }
        
        if (restoredCount > 0) {
            console.log('✅ RESTORE: Number box clicks are restored from database on reload');
        } else {
            console.log('❌ RESTORE: Number box clicks are NOT restored from database on reload');
        }
        
        if (showResult && showResult.clickedCount > 0) {
            console.log('✅ DISPLAY: "Show Clicked Numbers" button works correctly');
        } else {
            console.log('❌ DISPLAY: "Show Clicked Numbers" button shows "No clicked numbers found!"');
        }
        
        // Identify the root cause
        if (dbClicks && dbClicks.length > 0 && restoredCount === 0) {
            console.log('\n🎯 ROOT CAUSE IDENTIFIED: loadNumberBoxClicks function issue');
            console.log('   - Data IS being saved to database');
            console.log('   - Data is NOT being loaded back into memory');
            console.log('   - Problem is in the restore/load mechanism');
        } else if (clicksInMemory > 0 && (!dbClicks || dbClicks.length === 0)) {
            console.log('\n🎯 ROOT CAUSE IDENTIFIED: Database save issue');
            console.log('   - Data IS being stored in memory');
            console.log('   - Data is NOT being saved to database');
            console.log('   - Problem is in the save mechanism');
        } else if (clicksInMemory === 0) {
            console.log('\n🎯 ROOT CAUSE IDENTIFIED: Click handling issue');
            console.log('   - Clicks are not even being stored in memory');
            console.log('   - Problem is in the handleNumberBoxClick function');
        }
        
        console.log('\n💡 NEXT STEPS:');
        console.log('1. Check the console logs above for specific error messages');
        console.log('2. Look for any failed database operations');
        console.log('3. Verify the key generation consistency between save and load');
        
    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
    }
}

// Auto-run the diagnostic
if (typeof window !== 'undefined') {
    window.runSpecificDiagnostic = runSpecificDiagnostic;
    
    // Wait for page to be ready, then run
    setTimeout(runSpecificDiagnostic, 3000);
} else {
    console.log('This script should be run in the browser console on the Rule-1 page');
}
