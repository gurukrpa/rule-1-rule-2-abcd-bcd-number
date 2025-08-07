/**
 * RULE-1 NUMBER BOX CLICK PERSISTENCE DEBUG TOOL
 * This script will help diagnose why number box clicks aren't being saved/loaded properly
 */

console.log('🔍 Starting Rule-1 Number Box Click Debug Analysis...\n');

// Test the database connection and table existence
async function checkDatabaseTable() {
    console.log('1️⃣ CHECKING DATABASE TABLE...');
    
    try {
        // Test if we can access the DualServiceManager
        if (typeof window !== 'undefined' && window.dualServiceManager) {
            console.log('✅ DualServiceManager found in window');
            
            // Check if service is enabled
            console.log('📊 Service enabled:', window.dualServiceManager.enabled);
            
            // Try to get table stats
            const testUserId = '1'; // Use a test user ID
            const testDate = '2025-01-20'; // Use today's date
            
            console.log(`🔍 Testing database access with userId: ${testUserId}, date: ${testDate}`);
            
            const clicks = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(testUserId, testDate);
            console.log('✅ Database query successful, returned:', clicks?.length || 0, 'records');
            
            if (clicks && clicks.length > 0) {
                console.log('📋 Sample records:');
                clicks.slice(0, 3).forEach((record, index) => {
                    console.log(`  ${index + 1}:`, {
                        id: record.id,
                        set_name: record.set_name,  
                        number_value: record.number_value,
                        hr_number: record.hr_number,
                        is_clicked: record.is_clicked,
                        is_present: record.is_present
                    });
                });
            }
            
        } else {
            console.log('❌ DualServiceManager not found in window');
            console.log('   Available on window:', Object.keys(window).filter(k => k.includes('dual') || k.includes('Service')));
        }
        
    } catch (error) {
        console.error('❌ Database check failed:', error);
    }
    
    console.log('');
}

// Test the click handling mechanism
async function testClickHandling() {
    console.log('2️⃣ TESTING CLICK HANDLING...');
    
    try {
        // Check if handleNumberBoxClick is accessible
        if (typeof window !== 'undefined' && window.rule1PageDebug?.testClick) {
            console.log('✅ Test click function found');
            
            // Test clicking a number
            console.log('🖱️ Testing click on number 6 for topic "D-1 Set-1 Matrix" on date "2025-01-20"');
            
            // This should trigger the actual click handling
            window.rule1PageDebug.testClick(6, 'D-1 Set-1 Matrix', '2025-01-20');
            
            console.log('✅ Click test initiated (check console for detailed logs)');
            
        } else {
            console.log('❌ Test click function not available');
            console.log('   Available debug functions:', window.rule1PageDebug ? Object.keys(window.rule1PageDebug) : 'none');
        }
        
    } catch (error) {
        console.error('❌ Click handling test failed:', error);
    }
    
    console.log('');
}

// Test the load mechanism
async function testLoadMechanism() {
    console.log('3️⃣ TESTING LOAD MECHANISM...');
    
    try {
        if (typeof window !== 'undefined' && window.rule1PageDebug?.forceReloadNumberBoxes) {
            console.log('✅ Force reload function found');
            
            console.log('🔄 Testing number box reload...');
            await window.rule1PageDebug.forceReloadNumberBoxes();
            
            console.log('✅ Reload test completed (check console for detailed logs)');
            
        } else {
            console.log('❌ Force reload function not available');
        }
        
    } catch (error) {
        console.error('❌ Load mechanism test failed:', error);
    }
    
    console.log('');
}

// Check the current state
function checkCurrentState() {
    console.log('4️⃣ CHECKING CURRENT STATE...');
    
    try {
        if (typeof window !== 'undefined' && window.rule1PageDebug) {
            
            console.log('📊 Current clicked numbers count:', window.rule1PageDebug.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers).length : 0);
            
            if (window.rule1PageDebug.clickedNumbers) {
                const clickedKeys = Object.keys(window.rule1PageDebug.clickedNumbers);
                console.log('🔑 Current clicked keys (first 5):', clickedKeys.slice(0, 5));
            }
            
            console.log('👤 Selected user:', window.rule1PageDebug.selectedUser);
            console.log('📅 Date:', window.rule1PageDebug.date);
            console.log('⏰ Active HR:', window.rule1PageDebug.activeHR);
            
        } else {
            console.log('❌ Rule1PageDebug not available');
        }
        
    } catch (error) {
        console.error('❌ State check failed:', error);
    }
    
    console.log('');
}

// Run all tests
async function runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE DEBUG TESTS...\n');
    
    await checkDatabaseTable();
    await testClickHandling();
    await testLoadMechanism();
    checkCurrentState();
    
    console.log('✅ DEBUG ANALYSIS COMPLETE!');
    console.log('\n📋 SUMMARY:');
    console.log('1. Check above logs for any database connection issues');
    console.log('2. Look for any errors in click handling');
    console.log('3. Verify that load mechanism is working');
    console.log('4. Confirm current state shows expected values');
    console.log('\n💡 NEXT STEPS:');
    console.log('- If database is empty, try clicking some number boxes first');
    console.log('- If clicks aren\'t being saved, check the save mechanism');
    console.log('- If clicks aren\'t being loaded, check the load mechanism');
    console.log('- Use "Show Clicked Numbers" button to see what\'s currently tracked');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    // Wait a bit for the page to fully load
    setTimeout(runAllTests, 2000);
} else {
    console.log('This script should be run in the browser console on the Rule-1 page');
}

// Export for manual execution
if (typeof window !== 'undefined') {
    window.debugNumberBoxPersistence = runAllTests;
}