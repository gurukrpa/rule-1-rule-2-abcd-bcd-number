/**
 * REAL-TIME Number Box Click Debugger
 * 
 * This script will monitor the EXACT same code path that Rule1Page uses
 * Run this in browser console on the Rule-1 Enhanced page
 */

console.clear();
console.log('🚀 Real-time Number Box Click Debugger Started');
console.log('📍 URL:', window.location.href);

// Check if we're on the right page
if (!window.location.href.includes('rule-1')) {
    console.error('❌ Please run this on the Rule-1 Enhanced page');
} else {
    console.log('✅ Correct page detected');
}

// Global variables to track state
let dualServiceManager = null;
let currentUser = null;
let selectedDate = null;
let activeHR = null;

// Initialize the debugging environment
async function initializeDebugger() {
    console.log('\n🔧 Initializing debugger...');
    
    // Get user and date info
    currentUser = localStorage.getItem('currentUser');
    selectedDate = localStorage.getItem('selectedDate') || new Date().toISOString().split('T')[0];
    
    console.log('👤 Current User:', currentUser);
    console.log('📅 Selected Date:', selectedDate);
    
    if (!currentUser) {
        console.error('❌ No user logged in. Please log in first.');
        return false;
    }
    
    // Try to get DualServiceManager
    try {
        if (window.dualServiceManager) {
            dualServiceManager = window.dualServiceManager;
        } else {
            const module = await import('/src/services/DualServiceManager.js');
            dualServiceManager = module.default || module.DualServiceManager;
        }
        
        if (dualServiceManager) {
            console.log('✅ DualServiceManager loaded');
            console.log('📋 Methods:', Object.getOwnPropertyNames(dualServiceManager.__proto__));
            return true;
        } else {
            console.error('❌ Could not access DualServiceManager');
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading DualServiceManager:', error);
        return false;
    }
}

// Test the exact API used by Rule1Page
async function testRealAPI() {
    console.log('\n🧪 Testing the EXACT API used by Rule1Page...');
    
    // These are the exact parameters that Rule1Page passes
    const testParams = {
        userId: currentUser,
        setName: 'D-1 Set-1 Matrix',  // This matches Rule1Page
        dateKey: selectedDate,
        numberValue: 5,  // Test number 5
        hrNumber: 1,     // Test HR 1
        isClicked: true,
        isPresent: true
    };
    
    console.log('📝 Test parameters:', testParams);
    
    try {
        // Call with individual parameters (the way Rule1Page does it)
        console.log('🔄 Calling saveNumberBoxClick with individual parameters...');
        const saveResult = await dualServiceManager.saveNumberBoxClick(
            testParams.userId,
            testParams.setName,
            testParams.dateKey,
            testParams.numberValue,
            testParams.hrNumber,
            testParams.isClicked,
            testParams.isPresent
        );
        
        console.log('✅ Save result:', saveResult);
        
        if (saveResult.success) {
            console.log('🎉 Save successful! Testing load...');
            
            // Test load
            const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
                testParams.userId,
                testParams.dateKey
            );
            
            console.log('📥 Load result:', loadResult);
            console.log(`📊 Found ${loadResult?.length || 0} total clicks`);
            
            // Look for our specific click
            const ourClick = loadResult?.find(click => 
                click.set_name === testParams.setName &&
                click.number_value === testParams.numberValue &&
                click.hr_number === testParams.hrNumber
            );
            
            if (ourClick) {
                console.log('🎯 Our test click found:', ourClick);
                return true;
            } else {
                console.warn('⚠️ Our test click not found in results');
                return false;
            }
        } else {
            console.error('❌ Save failed:', saveResult);
            return false;
        }
        
    } catch (error) {
        console.error('💥 Exception during API test:', error);
        return false;
    }
}

// Monitor actual number box clicks
function setupClickMonitoring() {
    console.log('\n👂 Setting up click monitoring...');
    
    let clickCount = 0;
    
    const clickHandler = async (event) => {
        // Check if this looks like a number box click
        const target = event.target;
        const isNumberBox = target.tagName === 'BUTTON' && 
                          /^\d+$/.test(target.textContent?.trim()) &&
                          target.className.includes('w-6 h-6');
        
        if (isNumberBox) {
            clickCount++;
            const number = parseInt(target.textContent.trim());
            
            console.log(`\n🖱️ NUMBER BOX CLICK ${clickCount} DETECTED!`);
            console.log('🎯 Target:', target);
            console.log('🔢 Number:', number);
            console.log('🎨 Classes:', target.className);
            
            // Try to figure out which topic/date this belongs to
            const tableCell = target.closest('th');
            if (tableCell) {
                console.log('📍 Found parent table header');
                
                // Look for topic and date information
                const table = target.closest('table');
                if (table) {
                    const topicHeader = table.querySelector('caption, .topic-name');
                    console.log('📋 Topic context:', topicHeader?.textContent || 'Unknown');
                }
            }
            
            // Wait a moment for the click handler to execute
            setTimeout(async () => {
                console.log('⏱️ 500ms after click - checking if save was triggered...');
                
                // Check if any new database entries were created
                try {
                    const recentClicks = await dualServiceManager.getAllNumberBoxClicksForUserDate(
                        currentUser,
                        selectedDate
                    );
                    console.log(`📊 Current total clicks in database: ${recentClicks?.length || 0}`);
                    
                    // Look for clicks from the last 5 seconds
                    const recent = recentClicks?.filter(click => {
                        const clickTime = new Date(click.clicked_at || click.updated_at);
                        const now = new Date();
                        return (now - clickTime) < 5000; // Within 5 seconds
                    });
                    
                    if (recent && recent.length > 0) {
                        console.log('🎉 RECENT DATABASE ACTIVITY DETECTED!');
                        recent.forEach((click, index) => {
                            console.log(`  ${index + 1}. Number ${click.number_value}, Set: ${click.set_name}, HR: ${click.hr_number}`);
                        });
                    } else {
                        console.warn('⚠️ No recent database activity detected');
                    }
                } catch (error) {
                    console.error('❌ Error checking database:', error);
                }
            }, 500);
        }
    };
    
    // Add the listener
    document.addEventListener('click', clickHandler, true);
    console.log('✅ Click monitoring active');
    
    // Return cleanup function
    return () => {
        document.removeEventListener('click', clickHandler, true);
        console.log('👂 Click monitoring stopped');
    };
}

// Manual test function
async function testManualClick(number = 3, setName = 'D-1 Set-1 Matrix', hr = 1) {
    console.log(`\n🔧 Manual Test: Simulating click on number ${number}`);
    
    if (!dualServiceManager || !currentUser) {
        console.error('❌ Debugger not initialized. Run: await initializeDebugger()');
        return;
    }
    
    try {
        // Test save
        const saveResult = await dualServiceManager.saveNumberBoxClick(
            currentUser,
            setName,
            selectedDate,
            number,
            hr,
            true,  // isClicked
            true   // isPresent
        );
        
        console.log('💾 Save result:', saveResult);
        
        if (saveResult.success) {
            // Test immediate load
            const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
                currentUser,
                selectedDate
            );
            console.log('📥 Immediate load result:', loadResult?.length, 'clicks');
            
            // Try to find this specific click
            const thisClick = loadResult?.find(c => 
                c.number_value === number && 
                c.set_name === setName && 
                c.hr_number === hr
            );
            
            if (thisClick) {
                console.log('✅ Click found in database:', thisClick);
                
                // Now test what happens on "refresh" (reload)
                console.log('🔄 Testing refresh scenario...');
                const refreshLoadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
                    currentUser,
                    selectedDate
                );
                
                const afterRefreshClick = refreshLoadResult?.find(c => 
                    c.number_value === number && 
                    c.set_name === setName && 
                    c.hr_number === hr
                );
                
                if (afterRefreshClick) {
                    console.log('🎉 SUCCESS! Click persists after refresh simulation');
                    return true;
                } else {
                    console.error('❌ FAILURE! Click lost after refresh simulation');
                    return false;
                }
            } else {
                console.error('❌ Click not found in database immediately after save');
                return false;
            }
        } else {
            console.error('❌ Save failed:', saveResult);
            return false;
        }
        
    } catch (error) {
        console.error('💥 Manual test failed:', error);
        return false;
    }
}

// Check current state
async function checkCurrentState() {
    console.log('\n📊 Checking current state...');
    
    if (!dualServiceManager || !currentUser) {
        console.error('❌ Debugger not initialized');
        return;
    }
    
    try {
        const allClicks = await dualServiceManager.getAllNumberBoxClicksForUserDate(
            currentUser,
            selectedDate
        );
        
        console.log(`📈 Total clicks in database: ${allClicks?.length || 0}`);
        
        if (allClicks && allClicks.length > 0) {
            console.log('📋 Existing clicks:');
            allClicks.forEach((click, index) => {
                console.log(`  ${index + 1}. Number ${click.number_value}, Set: ${click.set_name}, HR: ${click.hr_number}, Time: ${click.clicked_at}`);
            });
        } else {
            console.log('📭 No existing clicks found');
        }
        
        return allClicks;
    } catch (error) {
        console.error('❌ Error checking state:', error);
    }
}

// Auto-initialize and start monitoring
initializeDebugger().then(success => {
    if (success) {
        console.log('\n🎉 Debugger initialized successfully!');
        
        // Check current state
        checkCurrentState();
        
        // Start monitoring
        const stopMonitoring = setupClickMonitoring();
        
        // Make functions available globally
        window.testManualClick = testManualClick;
        window.checkCurrentState = checkCurrentState;
        window.testRealAPI = testRealAPI;
        window.stopClickMonitoring = stopMonitoring;
        
        console.log(`
📋 DEBUGGER READY!

Available functions:
- testManualClick(number, setName, hr) - Test clicking a specific number
- checkCurrentState() - Check current database state  
- testRealAPI() - Test the exact API used by Rule1Page
- stopClickMonitoring() - Stop monitoring clicks

Example usage:
- testManualClick(5, 'D-1 Set-1 Matrix', 1)
- checkCurrentState()

Now try clicking some number boxes manually and watch the console!
        `);
        
    } else {
        console.error('❌ Debugger initialization failed');
    }
}).catch(error => {
    console.error('💥 Debugger startup failed:', error);
});
