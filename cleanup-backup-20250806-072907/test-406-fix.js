/**
 * TEST 406 ERROR FIX - Number Box Click Persistence
 * 
 * This script verifies that the 406 error has been resolved
 * and number box clicks are working properly.
 */

console.log('🔧 TESTING 406 ERROR FIX');
console.log('========================');

// Function to test the DualServiceManager
async function test406Fix() {
    console.log('\n1️⃣ Checking DualServiceManager availability...');
    
    if (!window.dualServiceManager) {
        console.log('❌ DualServiceManager not available');
        return;
    }
    
    console.log('✅ DualServiceManager available');
    console.log('Service enabled:', window.dualServiceManager.enabled);
    
    // Test a sample save operation
    console.log('\n2️⃣ Testing sample save operation...');
    
    try {
        const testSave = await window.dualServiceManager.saveNumberBoxClick(
            'test_user_' + Date.now(),
            'D-1 Set-1 Matrix',
            '2025-07-17',
            1,
            1,
            true,
            true
        );
        
        if (testSave.success) {
            console.log('✅ Test save successful - 406 error is fixed!');
        } else {
            console.log('❌ Test save failed:', testSave.error);
        }
    } catch (error) {
        console.log('❌ Test save error:', error.message);
        
        if (error.message.includes('406')) {
            console.log('⚠️  406 error still present - table may need manual fix');
        }
    }
    
    // Test loading clicks
    console.log('\n3️⃣ Testing load operation...');
    
    try {
        const testLoad = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(
            'test_user',
            '2025-07-17'
        );
        
        console.log('✅ Test load successful:', Array.isArray(testLoad) ? `${testLoad.length} records` : 'No data');
    } catch (error) {
        console.log('❌ Test load error:', error.message);
    }
}

// Function to test actual number box clicking
function testNumberBoxClicking() {
    console.log('\n4️⃣ Testing actual number box clicking...');
    
    // Find number boxes
    const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
        const text = btn.textContent?.trim();
        return text && /^(1[0-2]|[1-9])$/.test(text);
    });
    
    console.log(`Found ${numberBoxes.length} number boxes`);
    
    if (numberBoxes.length > 0) {
        const firstBox = numberBoxes[0];
        console.log(`Testing click on box: ${firstBox.textContent}`);
        
        // Monitor for errors during click
        const originalError = window.onerror;
        let errorOccurred = false;
        
        window.onerror = function(message, source, lineno, colno, error) {
            if (message.includes('406')) {
                console.log('❌ 406 error detected during number box click');
                errorOccurred = true;
            }
            if (originalError) originalError.apply(this, arguments);
        };
        
        // Click the box
        firstBox.click();
        
        setTimeout(() => {
            if (!errorOccurred) {
                console.log('✅ Number box click completed without 406 error');
            }
            window.onerror = originalError;
        }, 2000);
    }
}

// Function to check for network errors in console
function checkNetworkErrors() {
    console.log('\n5️⃣ Checking for recent network errors...');
    
    // Note: We can't access network logs directly, but we can advise the user
    console.log('Check the Network tab in DevTools for:');
    console.log('• Any requests returning 406 status');
    console.log('• Failed requests to Supabase');
    console.log('• Look for requests to number_box_clicks table');
}

// Main test function
async function runComplete406Test() {
    console.log('🚀 RUNNING COMPLETE 406 FIX TEST');
    console.log('================================');
    
    await test406Fix();
    testNumberBoxClicking();
    checkNetworkErrors();
    
    console.log('\n✅ 406 Fix Test Complete');
    console.log('========================');
    console.log('If no errors appeared above, the 406 issue is resolved!');
}

// Export functions
window.test406Fix = test406Fix;
window.testNumberBoxClicking = testNumberBoxClicking;
window.runComplete406Test = runComplete406Test;

console.log('\n🎯 AVAILABLE TEST FUNCTIONS');
console.log('===========================');
console.log('• test406Fix() - Test DualServiceManager operations');
console.log('• testNumberBoxClicking() - Test actual number box clicks');
console.log('• runComplete406Test() - Run all tests');
console.log('');
console.log('⚡ QUICK START: Run runComplete406Test()');

// Auto-run if on Rule-1 page
if (window.location.pathname.includes('rule1') || document.querySelector('h1')?.textContent?.includes('Rule')) {
    console.log('\n🔄 Auto-running test on Rule-1 page...');
    setTimeout(runComplete406Test, 2000);
}
