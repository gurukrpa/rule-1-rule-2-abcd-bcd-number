/**
 * Clean Supabase-Only Number Box Click Persistence Test
 * Tests the fixed Rule-1 page number box persistence without localStorage fallbacks
 * 
 * Usage: Paste this in browser console after navigating to Rule-1 page
 */

console.log('🧪 Starting Clean Supabase-Only Persistence Test...');

// Test configuration
const TEST_CONFIG = {
    testUser: 'sing_maya',
    testDate: '2025-08-01',
    testNumbers: [1, 7, 11], // Numbers to click for testing
    testTopic: 'D-1 Set-1 Matrix' // Topic to test with
};

async function runPersistenceTest() {
    console.log('\n🎯 ===== CLEAN SUPABASE-ONLY PERSISTENCE TEST =====');
    console.log('Testing Rule-1 page number box click persistence');
    console.log('Configuration:', TEST_CONFIG);
    
    // Step 1: Verify we're on Rule-1 page
    console.log('\n📍 Step 1: Verifying Rule-1 page...');
    if (!window.location.pathname.includes('rule-1') && !document.querySelector('[data-testid="rule1-page"]')) {
        console.log('❌ Not on Rule-1 page. Please navigate to Rule-1 page first.');
        console.log('💡 Instructions:');
        console.log('   1. Go to main page');
        console.log('   2. Click on any 5th+ date');
        console.log('   3. Click "Past Days" button');
        console.log('   4. Run this test again');
        return false;
    }
    console.log('✅ Rule-1 page detected');
    
    // Step 2: Check if debug tools are available
    console.log('\n🔧 Step 2: Checking debug tools...');
    if (!window.rule1PageDebug) {
        console.log('⚠️ Debug tools not found, waiting for component to initialize...');
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    if (!window.rule1PageDebug) {
        console.log('❌ Rule1Page debug tools not available');
        console.log('💡 Make sure you\'re on the Enhanced Rule1Page');
        return false;
    }
    console.log('✅ Debug tools found:', Object.keys(window.rule1PageDebug));
    
    // Step 3: Check system readiness
    console.log('\n⚙️ Step 3: Checking system readiness...');
    const readiness = window.rule1PageDebug.checkReadiness();
    console.log('System readiness:', readiness);
    
    if (!readiness.isFullyReady) {
        console.log('⚠️ System not fully ready:', readiness.readinessCheck);
        console.log('💡 Waiting for data to load...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const retryReadiness = window.rule1PageDebug.checkReadiness();
        if (!retryReadiness.isFullyReady) {
            console.log('❌ System still not ready after wait:', retryReadiness.readinessCheck);
            return false;
        }
    }
    console.log('✅ System fully ready for testing');
    
    // Step 4: Verify DualServiceManager (Supabase persistence)
    console.log('\n💾 Step 4: Verifying Supabase persistence service...');
    if (!window.dualServiceManager) {
        console.log('❌ DualServiceManager not available');
        return false;
    }
    console.log('✅ DualServiceManager available');
    
    // Test database connection
    try {
        const testResult = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(
            TEST_CONFIG.testUser,
            TEST_CONFIG.testDate
        );
        console.log('✅ Database connection working:', testResult ? testResult.length + ' records found' : 'No records');
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        return false;
    }
    
    // Step 5: Test number box clicking and persistence
    console.log('\n🔢 Step 5: Testing number box clicks...');
    
    // Clear any existing clicks first
    console.log('🧹 Clearing existing test clicks...');
    for (const num of TEST_CONFIG.testNumbers) {
        try {
            await window.dualServiceManager.deleteNumberBoxClick({
                user_id: TEST_CONFIG.testUser,
                date_key: TEST_CONFIG.testDate,
                hr_number: readiness.readinessCheck.activeHR,
                number_value: num,
                set_name: TEST_CONFIG.testTopic
            });
        } catch (e) {
            // Ignore errors - might not exist
        }
    }
    
    // Get initial state
    const initialClicks = window.rule1PageDebug.showClickedNumbers();
    console.log('Initial clicked numbers:', initialClicks.clickedCount);
    
    // Find and click test numbers
    const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
        const text = btn.textContent?.trim();
        return text && /^(1[0-2]|[1-9])$/.test(text);
    });
    
    console.log('Found number boxes:', numberBoxes.length);
    
    let clickedCount = 0;
    for (const num of TEST_CONFIG.testNumbers) {
        const button = numberBoxes.find(btn => btn.textContent?.trim() === num.toString());
        if (button) {
            console.log(`🖱️ Clicking number ${num}...`);
            button.click();
            clickedCount++;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for persistence
        } else {
            console.log(`⚠️ Number ${num} button not found`);
        }
    }
    
    console.log(`✅ Clicked ${clickedCount} number boxes`);
    
    // Step 6: Verify immediate state
    console.log('\n📊 Step 6: Verifying immediate state...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for state updates
    
    const afterClickState = window.rule1PageDebug.showClickedNumbers();
    console.log('After clicking state:', afterClickState.clickedCount);
    
    if (afterClickState.clickedCount !== clickedCount) {
        console.log(`⚠️ State mismatch: Expected ${clickedCount}, got ${afterClickState.clickedCount}`);
    } else {
        console.log('✅ Immediate state correct');
    }
    
    // Step 7: Test persistence with manual reload
    console.log('\n🔄 Step 7: Testing persistence after reload...');
    console.log('💡 To complete the test:');
    console.log('   1. Press F5 or Ctrl+R to refresh the page');
    console.log('   2. Wait for the page to fully load');
    console.log('   3. Run: testPersistenceVerification()');
    console.log('   4. Check if clicked numbers remain highlighted');
    
    // Store test data for verification after refresh
    window.testPersistenceData = {
        expectedClicks: clickedCount,
        testNumbers: TEST_CONFIG.testNumbers,
        testUser: TEST_CONFIG.testUser,
        testDate: TEST_CONFIG.testDate,
        timestamp: new Date().toISOString()
    };
    
    console.log('✅ Test setup complete. Please refresh the page to test persistence.');
    return true;
}

async function testPersistenceVerification() {
    console.log('\n🔍 ===== PERSISTENCE VERIFICATION =====');
    
    if (!window.testPersistenceData) {
        console.log('❌ No test data found. Please run runPersistenceTest() first.');
        return false;
    }
    
    const testData = window.testPersistenceData;
    console.log('Verifying persistence for test:', testData);
    
    // Wait for component to initialize after refresh
    console.log('⏳ Waiting for component initialization...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (!window.rule1PageDebug) {
        console.log('❌ Debug tools not available after refresh');
        return false;
    }
    
    // Check restored state
    const restoredState = window.rule1PageDebug.showClickedNumbers();
    console.log('Restored state after refresh:', restoredState.clickedCount);
    
    // Check visual state in DOM
    const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
        const text = btn.textContent?.trim();
        return text && /^(1[0-2]|[1-9])$/.test(text);
    });
    
    const visuallyHighlighted = numberBoxes.filter(btn => {
        return btn.className.includes('bg-orange') || btn.className.includes('bg-green');
    });
    
    console.log('Visually highlighted boxes:', visuallyHighlighted.length);
    console.log('Highlighted numbers:', visuallyHighlighted.map(btn => btn.textContent?.trim()));
    
    // Verify results
    const success = restoredState.clickedCount === testData.expectedClicks && 
                   visuallyHighlighted.length === testData.expectedClicks;
    
    if (success) {
        console.log('🎉 ===== PERSISTENCE TEST PASSED =====');
        console.log('✅ Number box clicks successfully persisted through page refresh');
        console.log('✅ Visual state correctly restored');
        console.log('✅ Clean Supabase-only implementation working');
    } else {
        console.log('❌ ===== PERSISTENCE TEST FAILED =====');
        console.log(`Expected: ${testData.expectedClicks} clicks`);
        console.log(`Restored: ${restoredState.clickedCount} clicks`);
        console.log(`Visually highlighted: ${visuallyHighlighted.length} boxes`);
    }
    
    return success;
}

// Make functions available globally
window.runPersistenceTest = runPersistenceTest;
window.testPersistenceVerification = testPersistenceVerification;

console.log('🧪 Test functions ready:');
console.log('   - runPersistenceTest() - Run initial test');
console.log('   - testPersistenceVerification() - Verify after refresh');
console.log('\n💡 Start with: runPersistenceTest()');
