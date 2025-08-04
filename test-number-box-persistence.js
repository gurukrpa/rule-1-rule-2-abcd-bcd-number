/**
 * Enhanced Number Box Persistence Test Script
 * Run this in your browser console on the Rule-1 Enhanced page
 * 
 * This script will:
 * 1. Monitor actual click events in real-time
 * 2. Test database save/load operations
 * 3. Provide detailed diagnostic information
 * 4. Debug the entire persistence flow
 */

async function testNumberBoxPersistence() {
    console.clear();
    console.log('🔍 Starting Enhanced Number Box Persistence Test...');
    console.log('📍 Current URL:', window.location.href);
    console.log('⏰ Test started at:', new Date().toISOString());
    
    const results = {
        serviceAvailable: false,
        userLoggedIn: false,
        numberBoxesFound: 0,
        saveTest: null,
        loadTest: null,
        clickHandlers: []
    };
    
    // Step 1: Check if we're on the correct page
    if (!window.location.href.includes('rule-1')) {
        console.error('❌ Please run this script on the Rule-1 Enhanced page');
        return results;
    }
    
    // Step 2: Check if DualServiceManager is available
    let dualServiceManager;
    try {
        // Try different ways to access the service
        if (window.dualServiceManager) {
            dualServiceManager = window.dualServiceManager;
        } else if (window.DualServiceManager) {
            dualServiceManager = window.DualServiceManager;
        } else {
            // Try to import it dynamically
            try {
                const module = await import('/src/services/DualServiceManager.js');
                dualServiceManager = module.default || module.DualServiceManager;
                console.log('📦 Imported DualServiceManager:', typeof dualServiceManager);
            } catch (importError) {
                console.error('❌ Failed to import DualServiceManager:', importError);
            }
        }
        
        if (dualServiceManager) {
            console.log('✅ DualServiceManager found:', typeof dualServiceManager);
            console.log('📋 Available methods:', Object.getOwnPropertyNames(dualServiceManager));
            results.serviceAvailable = true;
        } else {
            console.error('❌ DualServiceManager not accessible');
            return results;
        }
    } catch (error) {
        console.error('❌ DualServiceManager error:', error);
        return results;
    }
    
    // Step 3: Get current user data
    const currentUser = localStorage.getItem('currentUser');
    const selectedDate = localStorage.getItem('selectedDate') || new Date().toISOString().split('T')[0];
    
    console.log('👤 Current User:', currentUser);
    console.log('📅 Selected Date:', selectedDate);
    
    if (currentUser) {
        results.userLoggedIn = true;
    } else {
        console.error('❌ No current user found. Please make sure you\'re logged in.');
        return results;
    }
    
    // Step 4: Find and analyze number boxes
    console.log('\n🔍 Analyzing Number Box Elements...');
    
    const numberBoxSelectors = [
        '[data-number]',
        '.number-box',
        'button[class*="number"]',
        '.number-button',
        '[class*="NumberBox"]',
        'button[data-testid*="number"]'
    ];
    
    let allNumberBoxes = [];
    numberBoxSelectors.forEach(selector => {
        const boxes = document.querySelectorAll(selector);
        if (boxes.length > 0) {
            console.log(`📦 Found ${boxes.length} elements with selector: ${selector}`);
            allNumberBoxes.push(...boxes);
        }
    });
    
    // Remove duplicates
    allNumberBoxes = [...new Set(allNumberBoxes)];
    results.numberBoxesFound = allNumberBoxes.length;
    
    console.log(`📊 Total unique number boxes found: ${allNumberBoxes.length}`);
    
    if (allNumberBoxes.length > 0) {
        console.log('📋 First few number boxes:');
        allNumberBoxes.slice(0, 5).forEach((box, index) => {
            console.log(`  ${index + 1}:`, {
                text: box.textContent?.trim(),
                classes: box.className,
                dataAttrs: [...box.attributes].filter(attr => attr.name.startsWith('data-')).map(attr => `${attr.name}="${attr.value}"`),
                onclick: !!box.onclick
            });
        });
    }
    
    // Step 5: Test database operations
    console.log('\n🔄 Testing Database Operations...');
    
    const testData = {
        userId: currentUser,
        setName: 'D1-SET1',
        dateKey: selectedDate,
        numberValue: 7, // Test with number 7
        hrNumber: 1,    // Test with hour 1
        isClicked: true,
        isPresent: true
    };
    
    console.log('🧪 Test Data:', testData);
    
    // Test Save Operation
    console.log('\n💾 Testing Save Operation...');
    try {
        const saveResult = await dualServiceManager.saveNumberBoxClick(testData);
        console.log('✅ Save successful:', saveResult);
        results.saveTest = { success: true, result: saveResult };
    } catch (error) {
        console.error('❌ Save failed:', error);
        results.saveTest = { success: false, error: error.message };
    }
    
    // Test Load Operation
    console.log('\n📥 Testing Load Operation...');
    try {
        const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
            testData.userId, 
            testData.setName, 
            testData.dateKey
        );
        console.log('✅ Load successful:', loadResult);
        console.log(`📊 Found ${loadResult?.length || 0} saved clicks`);
        results.loadTest = { success: true, result: loadResult, count: loadResult?.length || 0 };
        
        // Check if our test data is in the results
        if (loadResult && loadResult.length > 0) {
            const foundClick = loadResult.find(click => 
                click.number_value === testData.numberValue && 
                click.hr_number === testData.hrNumber
            );
            
            if (foundClick) {
                console.log('🎯 Test click found in database:', foundClick);
            } else {
                console.warn('⚠️ Test click not found in loaded data');
            }
        }
    } catch (error) {
        console.error('❌ Load failed:', error);
        results.loadTest = { success: false, error: error.message };
    }
    
    // Step 6: Monitor click events
    console.log('\n👂 Setting up Click Event Monitoring...');
    
    let clickCount = 0;
    const clickHandler = async (event) => {
        clickCount++;
        console.log(`🖱️ Click ${clickCount} detected:`, {
            target: event.target,
            text: event.target.textContent?.trim(),
            classes: event.target.className,
            dataNumber: event.target.dataset?.number,
            dataHr: event.target.dataset?.hr
        });
        
        // Try to intercept the actual click handling
        if (event.target.dataset?.number) {
            console.log('🎯 Number box click detected, monitoring save operation...');
        }
    };
    
    // Add global click listener
    document.addEventListener('click', clickHandler, true);
    results.clickHandlers.push('Global click listener added');
    
    // Step 7: Check React Dev Tools
    console.log('\n⚛️ Checking React Integration...');
    
    const reactElements = document.querySelectorAll('[data-reactroot], [data-react-]');
    if (reactElements.length > 0) {
        console.log('✅ React elements detected');
    }
    
    // Try to find React Fiber
    const bodyKeys = Object.keys(document.body);
    const reactFiberKey = bodyKeys.find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
    if (reactFiberKey) {
        console.log('✅ React Fiber detected');
    }
    
    // Step 8: Summary and next steps
    console.log('\n📋 TEST SUMMARY:');
    console.log('================');
    console.log('✅ Service Manager Available:', results.serviceAvailable);
    console.log('✅ User Logged In:', results.userLoggedIn);
    console.log('📦 Number Boxes Found:', results.numberBoxesFound);
    console.log('💾 Save Test:', results.saveTest?.success ? '✅ PASSED' : '❌ FAILED');
    console.log('📥 Load Test:', results.loadTest?.success ? '✅ PASSED' : '❌ FAILED');
    console.log('👂 Click Monitoring:', results.clickHandlers.length > 0 ? '✅ ACTIVE' : '❌ INACTIVE');
    
    if (results.loadTest?.count > 0) {
        console.log(`📊 Found ${results.loadTest.count} existing saved clicks`);
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Try clicking a number box manually');
    console.log('2. Watch the console for click events');
    console.log('3. Refresh the page and run: testLoadAfterRefresh()');
    console.log('4. Use simulateClick(number, hour) to test specific clicks');
    
    // Make helper functions available globally
    window.testLoadAfterRefresh = async () => {
        console.log('\n🔄 Testing load after refresh...');
        try {
            const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
                currentUser, 'D1-SET1', selectedDate
            );
            console.log('📊 Loaded clicks after refresh:', loadResult);
            console.log(`📈 Total clicks found: ${loadResult?.length || 0}`);
            
            if (loadResult && loadResult.length > 0) {
                console.log('📋 Click details:');
                loadResult.forEach((click, index) => {
                    console.log(`  ${index + 1}. Number ${click.number_value}, Hour ${click.hr_number}, Clicked: ${click.is_clicked}`);
                });
            }
            
            return loadResult;
        } catch (error) {
            console.error('❌ Load after refresh failed:', error);
        }
    };
    
    window.simulateClick = async (number, hour = 1) => {
        console.log(`\n🖱️ Simulating click on number ${number}, hour ${hour}`);
        
        const clickData = {
            userId: currentUser,
            setName: 'D1-SET1',
            dateKey: selectedDate,
            numberValue: parseInt(number),
            hrNumber: parseInt(hour),
            isClicked: true,
            isPresent: true
        };
        
        try {
            const result = await dualServiceManager.saveNumberBoxClick(clickData);
            console.log('✅ Simulated click saved:', result);
            
            // Try to find and update the DOM element
            const numberBox = document.querySelector(`[data-number="${number}"][data-hr="${hour}"]`) ||
                             document.querySelector(`[data-number="${number}"]`);
            
            if (numberBox) {
                console.log('🎨 Found DOM element, updating visual state');
                numberBox.classList.add('clicked', 'selected', 'active');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Simulated click failed:', error);
        }
    };
    
    window.removeClickMonitor = () => {
        document.removeEventListener('click', clickHandler, true);
        console.log('👂 Click monitoring removed');
    };
    
    window.debugNumberBox = (number) => {
        const boxes = document.querySelectorAll(`[data-number="${number}"], .number-${number}, button:contains("${number}")`);
        console.log(`🔍 Debug info for number ${number}:`, boxes);
        boxes.forEach((box, index) => {
            console.log(`  Box ${index + 1}:`, {
                element: box,
                text: box.textContent,
                classes: box.className,
                attributes: [...box.attributes].map(attr => `${attr.name}="${attr.value}"`),
                eventListeners: getEventListeners ? getEventListeners(box) : 'Use DevTools to see listeners'
            });
        });
    };
    
    // Cleanup after 60 seconds
    setTimeout(() => {
        window.removeClickMonitor();
        console.log('⏰ Test monitoring ended after 60 seconds');
    }, 60000);
    
    return results;
}

// Auto-run the test
testNumberBoxPersistence().then(results => {
    console.log('\n🏁 Test completed:', results);
}).catch(error => {
    console.error('💥 Test failed:', error);
});

console.log(`
🚀 Enhanced Number Box Persistence Test Script Loaded!

Available functions:
- testLoadAfterRefresh() - Test loading saved clicks after refresh
- simulateClick(number, hour) - Simulate clicking a specific number box
- removeClickMonitor() - Stop monitoring clicks
- debugNumberBox(number) - Get detailed info about a specific number box

Instructions:
1. Watch the console output above
2. Try clicking number boxes manually
3. Refresh the page and run testLoadAfterRefresh()
4. Use simulateClick(5, 1) to test specific clicks

The script will monitor clicks for 60 seconds automatically.
`);