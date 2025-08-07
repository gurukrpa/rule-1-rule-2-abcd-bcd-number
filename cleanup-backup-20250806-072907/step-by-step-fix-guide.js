/**
 * STEP-BY-STEP RULE-1 PERSISTENCE FIX GUIDE
 * This script provides a guided approach to fixing the issue
 */

console.log('📋 RULE-1 PERSISTENCE FIX - STEP BY STEP GUIDE');
console.log('═══════════════════════════════════════════════════════════════════\n');

// Check what's currently available
function checkCurrentContext() {
    console.log('🔍 CHECKING CURRENT CONTEXT...\n');
    
    const context = {
        location: window.location.href,
        dualServiceManager: !!window.dualServiceManager,
        dualServiceEnabled: window.dualServiceManager?.enabled,
        rule1PageDebug: !!window.rule1PageDebug,
        rule1PageState: window.rule1PageDebug ? {
            selectedUser: window.rule1PageDebug.selectedUser,
            date: window.rule1PageDebug.date,
            activeHR: window.rule1PageDebug.activeHR
        } : null
    };
    
    console.log('📊 Current Context:', context);
    
    if (context.location.includes('localhost:5173') && 
        !context.location.includes('test-persistence-ui.html')) {
        
        if (context.dualServiceManager && context.rule1PageDebug) {
            console.log('✅ You are on the main application page with services loaded');
            return 'MAIN_APP_READY';
        } else {
            console.log('⚠️ You are on the main application but services not loaded');
            return 'MAIN_APP_NOT_READY';
        }
    } else if (context.location.includes('test-persistence-ui.html')) {
        console.log('ℹ️ You are on the test UI page');
        return 'TEST_UI_PAGE';
    } else {
        console.log('❌ You are not on the correct page');
        return 'WRONG_PAGE';
    }
}

function provideNextSteps(contextStatus) {
    console.log('\n📋 NEXT STEPS BASED ON YOUR CURRENT CONTEXT:\n');
    
    switch (contextStatus) {
        case 'MAIN_APP_READY':
            console.log('✅ PERFECT! You can run the diagnostic now.');
            console.log('\n🚀 RUN THIS COMMAND:');
            console.log('window.rule1PersistenceDebugger.runFullDiagnostic()');
            break;
            
        case 'MAIN_APP_NOT_READY':
            console.log('⚠️ Services not loaded yet. You need to navigate to Rule-1 page.');
            console.log('\n📍 FOLLOW THESE STEPS:');
            console.log('1. Go to the main page: http://localhost:5173/');
            console.log('2. Select a user from the list');
            console.log('3. Click on "Past Days" button for any date (5th date or later)');
            console.log('4. Wait for the Rule-1 page to fully load');
            console.log('5. Come back and run this script again');
            break;
            
        case 'TEST_UI_PAGE':
            console.log('ℹ️ You are on the test UI page.');
            console.log('\n📍 FOLLOW THESE STEPS:');
            console.log('1. Open a new tab and go to: http://localhost:5173/');
            console.log('2. Select a user from the list');
            console.log('3. Click on "Past Days" button for any date (5th date or later)');
            console.log('4. Come back to this tab and run the diagnostic');
            break;
            
        case 'WRONG_PAGE':
            console.log('❌ You need to navigate to the correct application.');
            console.log('\n📍 FOLLOW THESE STEPS:');
            console.log('1. Make sure the development server is running');
            console.log('2. Go to: http://localhost:5173/');
            console.log('3. Select a user from the list');
            console.log('4. Click on "Past Days" button for any date (5th date or later)');
            console.log('5. Run this script again');
            break;
    }
}

function quickTest() {
    console.log('\n🧪 QUICK CONTEXT TEST...\n');
    
    const contextStatus = checkCurrentContext();
    
    if (contextStatus === 'MAIN_APP_READY') {
        console.log('🎯 RUNNING QUICK PERSISTENCE TEST...\n');
        
        // Test 1: Check if we can access current page state
        const pageState = {
            user: window.rule1PageDebug.selectedUser,
            date: window.rule1PageDebug.date,
            activeHR: window.rule1PageDebug.activeHR,
            clickedCount: window.rule1PageDebug.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers).length : 0
        };
        
        console.log('📊 Current Page State:', pageState);
        
        if (!pageState.user || !pageState.date || !pageState.activeHR) {
            console.log('⚠️ Page state incomplete. Try selecting user/date/HR first.');
            return;
        }
        
        // Test 2: Check database connectivity
        window.dualServiceManager.getAllNumberBoxClicksForUserDate(pageState.user, pageState.date)
            .then(clicks => {
                console.log('✅ Database test passed:', clicks?.length || 0, 'existing clicks');
                
                // Test 3: Check if "Show Clicked Numbers" works
                if (window.rule1PageDebug.showClickedNumbers) {
                    const showResult = window.rule1PageDebug.showClickedNumbers();
                    console.log('📊 Show Clicked Numbers result:', showResult);
                    
                    if (showResult.clickedCount === 0) {
                        console.log('\n🎯 ISSUE CONFIRMED: "Show Clicked Numbers" returns 0');
                        console.log('💡 This is the exact issue described in the problem');
                        
                        // Provide specific fix
                        console.log('\n🔧 TRYING AUTOMATIC FIX...');
                        
                        // Try to reload number box clicks
                        return window.rule1PageDebug.forceReloadNumberBoxes()
                            .then(() => {
                                console.log('🔄 Forced reload completed');
                                
                                // Check again
                                const afterReload = window.rule1PageDebug.showClickedNumbers();
                                console.log('📊 After reload result:', afterReload);
                                
                                if (afterReload.clickedCount > 0) {
                                    console.log('✅ ISSUE FIXED! Number box clicks are now visible.');
                                } else {
                                    console.log('❌ Issue persists. Need deeper investigation.');
                                    console.log('\n📋 TO RUN FULL DIAGNOSTIC:');
                                    console.log('window.rule1PersistenceDebugger.runFullDiagnostic()');
                                }
                            });
                    } else {
                        console.log('✅ Show Clicked Numbers is working correctly');
                        console.log('💡 The issue may not be present currently');
                    }
                } else {
                    console.log('❌ showClickedNumbers function not available');
                }
            })
            .catch(error => {
                console.error('❌ Database test failed:', error);
                console.log('💡 This indicates a database connectivity issue');
            });
            
    } else {
        provideNextSteps(contextStatus);
    }
}

// Auto-run the context check
const contextStatus = checkCurrentContext();
provideNextSteps(contextStatus);

// If ready, also run quick test
if (contextStatus === 'MAIN_APP_READY') {
    setTimeout(quickTest, 1000);
}

// Export functions for manual use
if (typeof window !== 'undefined') {
    window.rule1FixGuide = {
        checkContext: checkCurrentContext,
        quickTest: quickTest,
        provideSteps: provideNextSteps
    };
}
