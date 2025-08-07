/**
 * Simple Number Box Testing Extension
 * Save this as a .js file and load it via DevTools Sources tab
 */

// Main testing function
function runNumberBoxTests() {
    console.log('🚀 STARTING NUMBER BOX TESTS');
    console.log('============================');
    
    // Test 1: Check if we're on the right page
    console.log('\n📍 Test 1: Page Check');
    const hasNumberBoxes = document.querySelectorAll('button').length > 0;
    const hasRule1Debug = !!window.rule1PageDebug;
    const hasDbService = !!window.dualServiceManager;
    
    console.log('✓ Has buttons:', hasNumberBoxes);
    console.log('✓ Has debug functions:', hasRule1Debug);
    console.log('✓ Has database service:', hasDbService);
    
    if (!hasRule1Debug) {
        console.log('❌ Not on Rule1Page or debug functions not loaded');
        return;
    }
    
    // Test 2: Check current state
    console.log('\n📊 Test 2: Current State');
    const state = window.rule1PageDebug.getStateInfo();
    console.log('Current state:', state);
    
    // Test 3: Find number boxes
    console.log('\n📦 Test 3: Number Box Detection');
    const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
        const text = btn.textContent?.trim();
        return text && /^(1[0-2]|[1-9])$/.test(text);
    });
    
    console.log(`Found ${numberBoxes.length} number boxes`);
    
    if (numberBoxes.length === 0) {
        console.log('❌ No number boxes found');
        return;
    }
    
    // Test 4: Click test
    console.log('\n🖱️ Test 4: Click Test');
    const testBox = numberBoxes[0];
    const testNumber = testBox.textContent.trim();
    
    console.log(`Testing click on number ${testNumber}`);
    testBox.click();
    
    // Test 5: Verify state change
    setTimeout(() => {
        console.log('\n🔍 Test 5: State Verification');
        const newState = window.rule1PageDebug.getStateInfo();
        const hasClickedNumbers = Object.keys(newState.clickedNumbers).length > 0;
        
        console.log('Has clicked numbers:', hasClickedNumbers);
        console.log('Clicked numbers count:', Object.keys(newState.clickedNumbers).length);
        
        if (hasClickedNumbers) {
            console.log('✅ Click test PASSED');
        } else {
            console.log('❌ Click test FAILED');
        }
        
        // Test 6: Visual verification
        console.log('\n🎨 Test 6: Visual Verification');
        const domState = window.rule1PageDebug.verifyDOMState();
        console.log('Styled boxes count:', domState.styledBoxes.length);
        
        if (domState.styledBoxes.length > 0) {
            console.log('✅ Visual styling WORKING');
        } else {
            console.log('❌ Visual styling NOT WORKING');
        }
        
        // Test 7: Database check
        if (hasDbService && state.selectedUser && state.date) {
            console.log('\n💾 Test 7: Database Check');
            window.dualServiceManager.getAllNumberBoxClicksForUserDate(state.selectedUser, state.date)
                .then(dbData => {
                    console.log('Database records:', dbData?.length || 0);
                    
                    if (dbData && dbData.length > 0) {
                        console.log('✅ Database persistence WORKING');
                    } else {
                        console.log('❌ Database persistence NOT WORKING');
                    }
                    
                    // Final summary
                    console.log('\n📋 FINAL SUMMARY');
                    console.log('================');
                    console.log('Page setup:', hasRule1Debug ? '✅' : '❌');
                    console.log('Number boxes:', numberBoxes.length > 0 ? '✅' : '❌');
                    console.log('Click handling:', hasClickedNumbers ? '✅' : '❌');
                    console.log('Visual styling:', domState.styledBoxes.length > 0 ? '✅' : '❌');
                    console.log('Database save:', (dbData && dbData.length > 0) ? '✅' : '❌');
                    
                    console.log('\n🔄 NEXT STEP: Refresh page and run again to test persistence');
                })
                .catch(error => {
                    console.error('❌ Database check failed:', error);
                });
        }
        
    }, 1000);
}

// Simple diagnostic function
function quickDiagnostic() {
    console.log('🔍 QUICK DIAGNOSTIC');
    console.log('===================');
    
    if (!window.rule1PageDebug) {
        console.log('❌ Not on Rule1Page or debug functions not available');
        return;
    }
    
    const state = window.rule1PageDebug.getStateInfo();
    const domState = window.rule1PageDebug.verifyDOMState();
    
    console.log('📊 State Info:');
    console.log('  - User:', state.selectedUser);
    console.log('  - Date:', state.date);
    console.log('  - HR:', state.activeHR);
    console.log('  - Clicked numbers:', Object.keys(state.clickedNumbers).length);
    console.log('  - Styled boxes:', domState.styledBoxes.length);
    
    if (Object.keys(state.clickedNumbers).length > 0 && domState.styledBoxes.length > 0) {
        console.log('✅ Number box persistence appears to be working');
    } else if (Object.keys(state.clickedNumbers).length > 0) {
        console.log('⚠️ State exists but visual styling may have issues');
    } else {
        console.log('❌ No clicked state found - try clicking some number boxes first');
    }
}

// Force reload test
function testForceReload() {
    console.log('🔄 TESTING FORCE RELOAD');
    console.log('=======================');
    
    if (!window.rule1PageDebug) {
        console.log('❌ Debug functions not available');
        return;
    }
    
    window.rule1PageDebug.forceReloadNumberBoxes()
        .then(() => {
            console.log('✅ Force reload completed');
            
            setTimeout(() => {
                const state = window.rule1PageDebug.getStateInfo();
                const domState = window.rule1PageDebug.verifyDOMState();
                
                console.log('Post-reload results:');
                console.log('  - Clicked numbers:', Object.keys(state.clickedNumbers).length);
                console.log('  - Styled boxes:', domState.styledBoxes.length);
                
                if (Object.keys(state.clickedNumbers).length > 0 && domState.styledBoxes.length > 0) {
                    console.log('✅ Force reload successful');
                } else {
                    console.log('❌ Force reload had issues');
                }
            }, 1000);
        })
        .catch(error => {
            console.error('❌ Force reload failed:', error);
        });
}

// Expose functions globally
window.numberBoxTesting = {
    runAll: runNumberBoxTests,
    quick: quickDiagnostic,
    forceReload: testForceReload
};

console.log('🔧 Number Box Testing Functions Loaded');
console.log('Available commands:');
console.log('  - numberBoxTesting.runAll()     // Run all tests');
console.log('  - numberBoxTesting.quick()      // Quick diagnostic');
console.log('  - numberBoxTesting.forceReload() // Test force reload');
console.log('  - runNumberBoxTests()           // Direct function call');
