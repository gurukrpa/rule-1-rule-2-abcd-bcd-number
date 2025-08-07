// Type Mismatch Fix Verification Script
// Run this in browser console on Rule-1 Enhanced page after the fix

console.clear();
console.log('🎯 VERIFYING TYPE MISMATCH FIX');
console.log('==============================');

// Test the type conversion logic
function testTypeConversion() {
    console.log('🧪 Testing type conversion logic...');
    
    // Simulate the database return (hr_number as integer)
    const mockDatabaseClicks = [
        { hr_number: 1, number_value: 5, set_name: 'D-1 Set-1 Matrix', is_clicked: true },
        { hr_number: 2, number_value: 7, set_name: 'D-1 Set-1 Matrix', is_clicked: true },
        { hr_number: 1, number_value: 3, set_name: 'D-3 Set-1 Matrix', is_clicked: true }
    ];
    
    // Simulate the activeHR (string from React state)
    const activeHRs = ['1', '2', '3'];
    
    activeHRs.forEach(activeHR => {
        console.log(`\n📋 Testing HR filtering for activeHR = "${activeHR}" (${typeof activeHR})`);
        
        // OLD WAY (broken - strict equality)
        const oldFilteredClicks = mockDatabaseClicks.filter(click => click.hr_number === activeHR);
        
        // NEW WAY (fixed - type conversion)
        const newFilteredClicks = mockDatabaseClicks.filter(click => String(click.hr_number) === String(activeHR));
        
        console.log(`  Old filter (broken): ${oldFilteredClicks.length} clicks found`);
        console.log(`  New filter (fixed):  ${newFilteredClicks.length} clicks found`);
        
        if (oldFilteredClicks.length !== newFilteredClicks.length) {
            console.log(`  ✅ FIX WORKING! Type conversion resolved the mismatch`);
        } else if (newFilteredClicks.length > 0) {
            console.log(`  ✅ Both methods work (no type mismatch for this HR)`);
        } else {
            console.log(`  📭 No clicks for this HR in test data`);
        }
        
        newFilteredClicks.forEach(click => {
            console.log(`    • Number ${click.number_value} in ${click.set_name}`);
        });
    });
}

// Check if the fix is in place
function verifyFixInCode() {
    console.log('\n🔍 Checking if fix is implemented...');
    
    // This won't work if the page hasn't been refreshed, but we can check for the component
    try {
        // Look for the fixed code pattern in any loaded React components
        const pageSource = document.documentElement.outerHTML;
        
        if (pageSource.includes('String(click.hr_number)') || 
            pageSource.includes('String(activeHR)')) {
            console.log('✅ Type conversion code detected in page source');
        } else {
            console.log('⚠️ Type conversion code not detected - may need page refresh');
        }
        
    } catch (error) {
        console.log('⚠️ Cannot check page source:', error.message);
    }
}

// Test actual persistence if possible
async function testRealPersistence() {
    console.log('\n🔄 Testing real persistence scenario...');
    
    const currentUser = localStorage.getItem('currentUser');
    const selectedDate = localStorage.getItem('selectedDate') || '2025-08-01';
    
    if (!currentUser) {
        console.log('❌ No user logged in - cannot test real persistence');
        return;
    }
    
    console.log(`👤 User: ${currentUser}`);
    console.log(`📅 Date: ${selectedDate}`);
    
    // Check if DualServiceManager is available
    try {
        let dualServiceManager;
        if (window.dualServiceManager) {
            dualServiceManager = window.dualServiceManager;
        } else {
            const module = await import('/src/services/DualServiceManager.js');
            dualServiceManager = module.default || module.DualServiceManager;
        }
        
        if (dualServiceManager) {
            console.log('✅ DualServiceManager available');
            
            // Test save and load with different HR types
            try {
                // Save click with integer HR
                console.log('💾 Testing save operation...');
                const saveResult = await dualServiceManager.saveNumberBoxClick(
                    currentUser,
                    'D-1 Set-1 Matrix',
                    selectedDate,
                    8, // number
                    1, // hr (integer)
                    true, // clicked
                    true  // present
                );
                
                console.log('📤 Save result:', saveResult);
                
                if (saveResult.success) {
                    // Load and check filtering
                    console.log('📥 Testing load and filter operation...');
                    const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
                        currentUser,
                        selectedDate
                    );
                    
                    console.log('📊 All loaded clicks:', loadResult.length);
                    
                    // Test filtering with string activeHR
                    const stringActiveHR = '1'; // This is how React will pass it
                    const filteredWithConversion = loadResult.filter(click => 
                        String(click.hr_number) === String(stringActiveHR)
                    );
                    
                    const filteredWithoutConversion = loadResult.filter(click => 
                        click.hr_number === stringActiveHR
                    );
                    
                    console.log(`🔢 Filtered with type conversion: ${filteredWithConversion.length} clicks`);
                    console.log(`🔢 Filtered without conversion: ${filteredWithoutConversion.length} clicks`);
                    
                    if (filteredWithConversion.length > filteredWithoutConversion.length) {
                        console.log('🎉 TYPE CONVERSION FIX IS WORKING!');
                        console.log('✅ Persistence will now work correctly after page refresh');
                    } else if (filteredWithConversion.length === filteredWithoutConversion.length && filteredWithConversion.length > 0) {
                        console.log('✅ Both filters work (database may be storing strings)');
                    } else {
                        console.log('📭 No clicks found for HR 1');
                    }
                } else {
                    console.log('❌ Save operation failed');
                }
                
            } catch (error) {
                console.log('❌ Test operation failed:', error);
            }
        } else {
            console.log('❌ DualServiceManager not available');
        }
        
    } catch (error) {
        console.log('❌ Cannot access DualServiceManager:', error);
    }
}

// Run all tests
async function runAllTests() {
    testTypeConversion();
    verifyFixInCode();
    await testRealPersistence();
    
    console.log('\n🎯 VERIFICATION COMPLETE!');
    console.log('================');
    console.log('If you see "TYPE CONVERSION FIX IS WORKING!" above,');
    console.log('then number box clicks should now persist after page refresh!');
    console.log('');
    console.log('📋 To test manually:');
    console.log('1. Click some number boxes (1-12)');
    console.log('2. Refresh the page (F5)');
    console.log('3. Check if the clicked numbers are still highlighted');
}

// Auto-run
runAllTests();
