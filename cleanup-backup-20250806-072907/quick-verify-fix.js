/**
 * 🚀 QUICK VERIFICATION: Number Box Persistence Fix
 * 
 * Copy and paste this into browser console on the Rule1Page (Past Days)
 * to quickly verify the persistence fix is working
 */

console.log('🚀 QUICK VERIFICATION: Starting persistence fix test...');

async function quickVerifyFix() {
    // Check if we have debug interface
    if (!window.rule1PageDebug) {
        console.error('❌ Please navigate to Rule1Page (Past Days) first');
        return;
    }
    
    console.log('✅ Debug interface found');
    
    try {
        // Step 1: Clear existing state
        console.log('\n🧹 Step 1: Clearing existing clicks...');
        await window.rule1PageDebug.clearAllClicks();
        console.log('✅ State cleared');
        
        // Step 2: Click two numbers (1 and 7 - the failing scenario)
        console.log('\n🖱️ Step 2: Clicking numbers 1 and 7...');
        
        const click1 = await window.rule1PageDebug.simulateNumberClick(1);
        console.log('📊 Click 1 result:', click1);
        
        await new Promise(r => setTimeout(r, 300)); // Brief pause
        
        const click7 = await window.rule1PageDebug.simulateNumberClick(7);
        console.log('📊 Click 7 result:', click7);
        
        // Step 3: Check immediate state
        console.log('\n🔍 Step 3: Checking immediate state...');
        const currentState = window.rule1PageDebug.getStateInfo();
        const clickedCount = Object.keys(currentState.clickedNumbers).length;
        console.log(`📊 Clicked numbers: ${Object.keys(currentState.clickedNumbers).join(', ')}`);
        console.log(`📊 Total count: ${clickedCount}`);
        
        if (clickedCount === 2) {
            console.log('✅ Immediate state correct: Both numbers present');
        } else {
            console.error('❌ Immediate state wrong: Expected 2, got', clickedCount);
            return;
        }
        
        // Step 4: Test persistence by reloading
        console.log('\n🔄 Step 4: Testing persistence (force reload)...');
        await new Promise(r => setTimeout(r, 1000)); // Wait for DB saves
        
        await window.rule1PageDebug.forceReload();
        await new Promise(r => setTimeout(r, 500)); // Wait for reload
        
        // Step 5: Check final state
        console.log('\n🏁 Step 5: Checking persistence...');
        const finalState = window.rule1PageDebug.getStateInfo();
        const finalCount = Object.keys(finalState.clickedNumbers).length;
        const finalNumbers = Object.keys(finalState.clickedNumbers);
        
        console.log(`📊 Final clicked numbers: ${finalNumbers.join(', ')}`);
        console.log(`📊 Final count: ${finalCount}`);
        
        // Verify the fix
        if (finalCount === 2 && finalNumbers.includes('1') && finalNumbers.includes('7')) {
            console.log('\n🎉 SUCCESS! Fix verified:');
            console.log('✅ Both numbers (1, 7) clicked');
            console.log('✅ Both numbers persisted');
            console.log('✅ Both numbers restored after reload');
            console.log('✅ Issue is FIXED! 🎊');
        } else {
            console.error('\n❌ FAILURE! Issue still exists:');
            console.error(`❌ Expected: [1, 7] (count: 2)`);
            console.error(`❌ Got: [${finalNumbers.join(', ')}] (count: ${finalCount})`);
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Auto-run
quickVerifyFix();

// Also expose for manual execution
window.quickVerifyFix = quickVerifyFix;
