/**
 * DEBUG NUMBER BOX FLOW - Enhanced Debugging
 * 
 * This script helps debug the complete flow of number box click persistence
 * focusing on the specific issues you mentioned.
 * 
 * Run this in the browser console on the Rule-1 Enhanced page.
 */

console.log('🔧 NUMBER BOX FLOW DEBUGGER LOADED');
console.log('=====================================');

// Function to check the complete data flow
function debugNumberBoxFlow() {
    console.log('\n🔍 DEBUGGING NUMBER BOX DATA FLOW');
    console.log('==================================');
    
    // Step 1: Check useEffect triggers
    console.log('\n1️⃣ Checking useEffect triggers...');
    
    // Check global variables that should be available
    const globalChecks = {
        selectedUser: window.selectedUser || 'Not found',
        activeHR: window.activeHR || 'Not found',
        allDaysData: window.allDaysData ? Object.keys(window.allDaysData) : 'Not found'
    };
    
    console.log('Global variables:', globalChecks);
    
    // Step 2: Check loadNumberBoxClicks execution
    console.log('\n2️⃣ Check for loadNumberBoxClicks execution...');
    console.log('Look for these log patterns in console history:');
    console.log('   - 🧪 [USEEFFECT-DEBUG] Trigger conditions');
    console.log('   - 🧪 [USEEFFECT-DEBUG] Conditions met - calling loadNumberBoxClicks()');
    console.log('   - 🧪 HR Filtered Clicks: [array]');
    console.log('   - ✅ Loaded Click Map Keys: [array]');
    console.log('   - ✅ ActiveHR: [number]');
    
    // Step 3: Check state variables after loading
    console.log('\n3️⃣ Checking current React state...');
    
    // Try to access React state through DevTools or component inspection
    try {
        // Look for React component
        const reactRoot = document.querySelector('#root');
        console.log('React root element found:', !!reactRoot);
        
        // Check for number boxes
        const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
            const text = btn.textContent?.trim();
            return text && /^(1[0-2]|[1-9])$/.test(text);
        });
        
        console.log(`Found ${numberBoxes.length} number boxes in DOM`);
        
        // Check for styled boxes (indicating state is applied)
        const styledBoxes = numberBoxes.filter(box => {
            const classes = box.className;
            return classes.includes('bg-orange') || classes.includes('bg-green');
        });
        
        console.log(`Found ${styledBoxes.length} styled number boxes`);
        
        if (styledBoxes.length > 0) {
            console.log('✅ Some boxes are styled - state application is working');
            styledBoxes.forEach((box, index) => {
                console.log(`   Styled box ${index + 1}: ${box.textContent} - ${box.className}`);
            });
        } else {
            console.log('❌ No styled boxes found - state may not be applied to UI');
        }
        
    } catch (error) {
        console.log('Error accessing React state:', error.message);
    }
    
    // Step 4: Test a manual click
    console.log('\n4️⃣ Manual click test...');
    
    const firstBox = document.querySelector('button[title*="Click to check if number"]');
    if (firstBox) {
        console.log(`Testing click on: ${firstBox.textContent}`);
        console.log('Watch for these logs after clicking:');
        console.log('   - 🔢 [NumberBoxes] Clicked number X');
        console.log('   - 💾 [NumberBoxes] Click state persisted');
        console.log('   - 🧪 [STATE-DEBUG] STATE CHANGE DETECTED');
        
        // Simulate click
        firstBox.click();
        
        setTimeout(() => {
            console.log(`Box styling after click: ${firstBox.className}`);
        }, 500);
    } else {
        console.log('❌ No number boxes found for manual testing');
    }
}

// Function to verify key format consistency
function verifyKeyFormat() {
    console.log('\n🔑 KEY FORMAT VERIFICATION');
    console.log('===========================');
    
    console.log('Expected key format: SetName_DateKey_NumberValue_HRX');
    console.log('Example: D-1 Set-1 Matrix_2024-12-31_1_HR1');
    
    console.log('\n📋 Look for these logs in console history:');
    console.log('   - 🧪 [STATE-DEBUG] Adding to state: { boxKey: "..." }');
    console.log('   - 🧪 [RENDER-DEBUG] First box (1) state check: { boxKey: "..." }');
    
    console.log('\n🔍 Check that the keys match between:');
    console.log('   1. Database loading (Adding to state)');
    console.log('   2. UI rendering (First box state check)');
}

// Function to check DualServiceManager
function checkDualServiceManager() {
    console.log('\n💾 DUAL SERVICE MANAGER CHECK');
    console.log('==============================');
    
    if (window.dualServiceManager) {
        console.log('✅ DualServiceManager is available');
        
        // Check if it's enabled
        console.log('Service enabled:', window.dualServiceManager.enabled);
        
        // Try to get statistics if user is available
        if (window.selectedUser) {
            console.log('🔍 Getting click statistics...');
            window.dualServiceManager.getClickStatistics(window.selectedUser)
                .then(stats => {
                    console.log('📊 Click statistics:', stats);
                })
                .catch(error => {
                    console.log('❌ Error getting statistics:', error);
                });
        }
    } else {
        console.log('❌ DualServiceManager not available in window');
    }
}

// Main debugging function
function runCompleteDebugging() {
    console.log('\n🚀 RUNNING COMPLETE NUMBER BOX DEBUGGING');
    console.log('==========================================');
    
    debugNumberBoxFlow();
    setTimeout(() => {
        verifyKeyFormat();
        setTimeout(() => {
            checkDualServiceManager();
        }, 1000);
    }, 1000);
}

// Export functions for manual use
window.debugNumberBoxFlow = debugNumberBoxFlow;
window.verifyKeyFormat = verifyKeyFormat;
window.checkDualServiceManager = checkDualServiceManager;
window.runCompleteDebugging = runCompleteDebugging;

console.log('\n🎯 USAGE INSTRUCTIONS');
console.log('======================');
console.log('1. runCompleteDebugging() - Run all debugging checks');
console.log('2. debugNumberBoxFlow() - Check the data flow');
console.log('3. verifyKeyFormat() - Check key format consistency');
console.log('4. checkDualServiceManager() - Check database service');

console.log('\n⚡ QUICK START: Run runCompleteDebugging()');
