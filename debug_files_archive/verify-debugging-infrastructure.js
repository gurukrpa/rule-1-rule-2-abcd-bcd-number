/**
 * DEBUGGING VERIFICATION SCRIPT
 * 
 * This script verifies that the comprehensive debugging infrastructure
 * is properly implemented in the Rule1Page_Enhanced.jsx component.
 */

console.log('🔍 DEBUGGING INFRASTRUCTURE VERIFICATION');
console.log('========================================');

// Check if the state debugging script is already loaded
function checkStateDebuggingScript() {
    console.log('\n1️⃣ Checking state debugging script...');
    
    if (window.stateDebugger) {
        console.log('✅ State debugging script is loaded');
        console.log('   Available functions:', Object.keys(window.stateDebugger));
        return true;
    } else {
        console.log('⚠️ State debugging script not detected');
        console.log('💡 Load the state-debugging-script.js in console for enhanced monitoring');
        return false;
    }
}

// Check for debugging interface
function checkDebuggingInterface() {
    console.log('\n2️⃣ Checking debugging interface...');
    
    const debugPanel = document.getElementById('state-debug-panel');
    if (debugPanel) {
        console.log('✅ Debug interface panel found');
        return true;
    } else {
        console.log('⚠️ Debug interface panel not found');
        console.log('💡 The interface may not be created yet - it appears after page load');
        return false;
    }
}

// Check for React component debugging functions
function checkReactDebugging() {
    console.log('\n3️⃣ Checking React debugging functions...');
    
    const functions = [
        'debugNumberBoxState',
        'clearStateDebugLogs',
        'testNumberBoxPersistence'
    ];
    
    const available = functions.filter(fn => typeof window[fn] === 'function');
    
    console.log(`Available debugging functions: ${available.length}/${functions.length}`);
    available.forEach(fn => console.log(`   ✅ ${fn}`));
    
    const missing = functions.filter(fn => typeof window[fn] !== 'function');
    missing.forEach(fn => console.log(`   ❌ ${fn}`));
    
    return available.length > 0;
}

// Check for DualServiceManager
function checkDualServiceManager() {
    console.log('\n4️⃣ Checking DualServiceManager...');
    
    if (window.dualServiceManager) {
        console.log('✅ DualServiceManager is available globally');
        
        // Check if it's enabled
        const enabled = window.dualServiceManager.enabled;
        console.log(`   Enabled: ${enabled ? '✅' : '❌'}`);
        
        return true;
    } else {
        console.log('❌ DualServiceManager not available globally');
        console.log('💡 This may be normal - it might be available within React components only');
        return false;
    }
}

// Check for number box elements
function checkNumberBoxElements() {
    console.log('\n5️⃣ Checking number box elements...');
    
    const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
        const text = btn.textContent?.trim();
        return text && /^(1[0-2]|[1-9])$/.test(text);
    });
    
    console.log(`Found ${numberBoxes.length} number box elements`);
    
    if (numberBoxes.length > 0) {
        console.log('✅ Number boxes are present');
        
        // Check if any are styled (indicating persistence is working)
        const styledBoxes = numberBoxes.filter(box => {
            const classes = box.className;
            return classes.includes('bg-orange') || classes.includes('bg-green');
        });
        
        console.log(`   Styled boxes: ${styledBoxes.length}`);
        
        return true;
    } else {
        console.log('❌ No number boxes found');
        console.log('💡 Navigate to Rule-1 Enhanced page first');
        return false;
    }
}

// Check console for debugging logs
function checkConsoleDebugging() {
    console.log('\n6️⃣ Checking for debugging log patterns...');
    
    console.log('📋 Look for these patterns in console history:');
    console.log('   - 🧪 [STATE-DEBUG] messages from loadNumberBoxClicks()');
    console.log('   - 🔄 [NumberBoxes] messages from click handlers');
    console.log('   - ✅ [NumberBoxes] Successfully loaded X persisted clicks');
    console.log('   - ⚠️ [STATE-DEBUG] STATE/RENDER MISMATCH warnings');
    
    console.log('\n💡 If you don\'t see these patterns, the debugging may not be active');
    console.log('💡 Try clicking a number box to trigger debugging logs');
}

// Load state debugging script if not present
function loadStateDebuggingScript() {
    console.log('\n🔧 Loading state debugging script...');
    
    const script = document.createElement('script');
    script.src = '/state-debugging-script.js';
    script.onload = () => {
        console.log('✅ State debugging script loaded successfully');
    };
    script.onerror = () => {
        console.log('❌ Failed to load state debugging script');
        console.log('💡 Copy and paste the script content manually into console');
    };
    
    document.head.appendChild(script);
}

// Main verification function
function runDebuggingVerification() {
    console.log('🚀 Starting debugging infrastructure verification...\n');
    
    const results = {
        stateScript: checkStateDebuggingScript(),
        debugInterface: checkDebuggingInterface(),
        reactFunctions: checkReactDebugging(),
        dualService: checkDualServiceManager(),
        numberBoxes: checkNumberBoxElements()
    };
    
    checkConsoleDebugging();
    
    const passing = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    console.log('\n🎯 VERIFICATION SUMMARY');
    console.log('=======================');
    console.log(`Passing: ${passing}/${total} checks`);
    
    Object.entries(results).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
    });
    
    if (passing < total) {
        console.log('\n🔧 RECOMMENDED ACTIONS:');
        
        if (!results.stateScript) {
            console.log('1. Load state-debugging-script.js in console');
        }
        
        if (!results.numberBoxes) {
            console.log('2. Navigate to ABCD BCD Number page and click "Past Days"');
        }
        
        if (!results.dualService) {
            console.log('3. Check if DualServiceManager is properly imported in components');
        }
        
        console.log('4. Run comprehensive-number-box-test.js for detailed testing');
    } else {
        console.log('\n🎉 All checks passed! Debugging infrastructure is ready');
        console.log('💡 Run runComprehensiveTest() to test number box persistence');
    }
    
    return results;
}

// Export for manual use
window.verifyDebugging = runDebuggingVerification;
window.loadStateDebugging = loadStateDebuggingScript;

// Auto-run verification
runDebuggingVerification();
