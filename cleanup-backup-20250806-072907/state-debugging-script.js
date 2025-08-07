/**
 * STATE DEBUGGING SCRIPT FOR NUMBER BOX CLICKS
 * 
 * This script adds comprehensive debugging to verify that clickedNumbers 
 * and numberPresenceStatus state variables are correctly updated during 
 * the loadNumberBoxClicks() process.
 * 
 * Run this in the browser console while on the Rule-1 Enhanced page
 * to monitor state changes in real-time.
 */

// Check if we're on the correct page
if (!window.location.pathname.includes('abcd') && !document.querySelector('[data-testid="rule1-page"]')) {
    console.warn('⚠️ This debugging script is intended for the Rule-1 Enhanced page');
    console.log('📍 Navigate to the ABCD/BCD Number page and click "Past Days" to use this script');
}

console.log('🧪 STATE DEBUGGING SCRIPT LOADED');
console.log('📋 This script will monitor React state updates for number box clicks');

// 1. Monitor React DevTools (if available)
function checkReactDevTools() {
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('✅ React DevTools detected - enhanced debugging available');
        return true;
    } else {
        console.log('⚠️ React DevTools not detected - basic debugging only');
        return false;
    }
}

// 2. Find React component instance
function findReactComponent() {
    // Try to find the Rule1Page component
    const possibleSelectors = [
        '[data-testid="rule1-page"]',
        '.rule1-page',
        '[class*="Rule1"]',
        'main',
        '#root > div'
    ];
    
    for (const selector of possibleSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            // Try to get React fiber
            const fiberKey = Object.keys(element).find(key => 
                key.startsWith('__reactFiber') || 
                key.startsWith('__reactInternalInstance')
            );
            
            if (fiberKey) {
                console.log(`🔍 Found React component via ${selector}`);
                return element[fiberKey];
            }
        }
    }
    
    console.log('❌ Could not find React component instance');
    return null;
}

// 3. Monitor state changes using MutationObserver
function setupStateMonitoring() {
    console.log('🔄 Setting up state change monitoring...');
    
    // Monitor DOM changes that might indicate state updates
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Look for number box styling changes
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.textContent && /^(1[0-2]|[1-9])$/.test(target.textContent.trim())) {
                    console.log(`🎨 Number box ${target.textContent} class changed:`, {
                        old: mutation.oldValue,
                        new: target.className,
                        element: target
                    });
                }
            }
            
            // Look for table cell changes
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                const target = mutation.target;
                if (target.tagName === 'TD' || target.closest('td')) {
                    const cell = target.tagName === 'TD' ? target : target.closest('td');
                    if (cell.style.border || cell.className.includes('border')) {
                        console.log('🎯 Table cell styling changed:', {
                            content: cell.textContent?.trim(),
                            className: cell.className,
                            style: cell.style.cssText
                        });
                    }
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['class', 'style']
    });
    
    console.log('✅ State monitoring active');
    return observer;
}

// 4. Debug function to manually trigger state analysis
window.debugNumberBoxState = function() {
    console.log('\n🔍 MANUAL STATE ANALYSIS');
    console.log('========================');
    
    // Find all number boxes
    const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
        const text = btn.textContent?.trim();
        return text && /^(1[0-2]|[1-9])$/.test(text);
    });
    
    console.log(`📦 Found ${numberBoxes.length} number boxes`);
    
    // Analyze each number box
    numberBoxes.forEach((box, index) => {
        const number = box.textContent.trim();
        const classes = box.className;
        const isClicked = classes.includes('bg-orange') || classes.includes('bg-green');
        const isPresent = classes.includes('bg-green');
        
        console.log(`Box ${index + 1} (${number}):`, {
            isClicked,
            isPresent,
            classes,
            element: box
        });
    });
    
    // Find table cells with highlights
    const highlightedCells = Array.from(document.querySelectorAll('td')).filter(cell => {
        return cell.style.border || cell.className.includes('border-orange') || cell.className.includes('bg-orange');
    });
    
    console.log(`🎯 Found ${highlightedCells.length} highlighted table cells`);
    
    highlightedCells.forEach((cell, index) => {
        console.log(`Highlighted cell ${index + 1}:`, {
            content: cell.textContent?.trim(),
            className: cell.className,
            style: cell.style.cssText,
            element: cell
        });
    });
    
    return {
        numberBoxes: numberBoxes.length,
        highlightedCells: highlightedCells.length,
        boxes: numberBoxes,
        cells: highlightedCells
    };
};

// 5. Hook into console.log to catch React state logs
const originalLog = console.log;
console.log = function(...args) {
    // Check for our specific number box logs
    const message = args[0];
    if (typeof message === 'string' && message.includes('[NumberBoxes]')) {
        // Add enhanced debugging
        if (message.includes('Successfully loaded') && message.includes('persisted number box clicks')) {
            setTimeout(() => {
                console.log('🔍 POST-LOAD STATE VERIFICATION:');
                const analysis = window.debugNumberBoxState();
                console.log('📊 Analysis results:', analysis);
            }, 100);
        }
        
        if (message.includes('Number box state changed')) {
            setTimeout(() => {
                console.log('🔄 POST-CHANGE STATE VERIFICATION:');
                const analysis = window.debugNumberBoxState();
                console.log('📊 Change analysis:', analysis);
            }, 50);
        }
    }
    
    // Call original log
    originalLog.apply(console, args);
};

// 6. Monitor for page navigation and component mounting
function setupPageMonitoring() {
    // Monitor for Rule-1 page loads
    const checkForRule1Page = () => {
        const hasNumberBoxes = document.querySelectorAll('button').length > 0;
        const hasDataTables = document.querySelectorAll('table').length > 0;
        
        if (hasNumberBoxes && hasDataTables) {
            console.log('✅ Rule-1 page detected - starting state monitoring');
            setTimeout(() => {
                const analysis = window.debugNumberBoxState();
                console.log('📊 Initial page state:', analysis);
            }, 1000);
        }
    };
    
    // Check immediately
    checkForRule1Page();
    
    // Check after navigation
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(checkForRule1Page, 500);
    };
    
    const originalReplaceState = history.replaceState;
    history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(checkForRule1Page, 500);
    };
    
    window.addEventListener('popstate', () => {
        setTimeout(checkForRule1Page, 500);
    });
}

// 7. Create debugging interface (visual panel disabled)
function createDebuggingInterface() {
    // Visual debug panel disabled - debug functions available in console only
    console.log('💡 Debug interface loaded (console-only mode)');
    console.log('💡 Use window.debugNumberBoxState() to analyze state');
}

// 8. Clear logs function
window.clearStateDebugLogs = function() {
    console.clear();
    console.log('🧪 STATE DEBUGGING SCRIPT ACTIVE');
    console.log('📋 Logs cleared - monitoring continues...');
};

// 9. Initialize everything
function initializeStateDebugging() {
    console.log('🚀 Initializing comprehensive state debugging...');
    
    checkReactDevTools();
    findReactComponent();
    setupStateMonitoring();
    setupPageMonitoring();
    createDebuggingInterface();
    
    console.log('✅ State debugging initialization complete');
    console.log('💡 Use window.debugNumberBoxState() to manually analyze state');
    console.log('💡 Watch console for automatic state change detection');
}

// Start the debugging
initializeStateDebugging();

// Export for manual use
window.stateDebugger = {
    analyze: window.debugNumberBoxState,
    clear: window.clearStateDebugLogs,
    monitor: setupStateMonitoring,
    component: findReactComponent
};

console.log('\n🎯 STATE DEBUGGING ACTIVE');
console.log('============================');
console.log('1. Navigate to Rule-1 Enhanced page');
console.log('2. Click on number boxes (1-12)');
console.log('3. Watch console for state change logs');
console.log('4. Use window.debugNumberBoxState() for manual analysis');
console.log('5. Visual debug panel disabled - use console commands');
console.log('6. All debug functions available via window.stateDebugger object');
