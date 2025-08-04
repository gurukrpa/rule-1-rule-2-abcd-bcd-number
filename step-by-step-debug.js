/**
 * Step-by-Step Number Box Click Debugger
 * 
 * Copy and paste these functions one by one into your browser console
 * while on the Rule-1 Enhanced page
 */

// STEP 1: Set up monitoring
console.log('🔧 Setting up number box click monitoring...');

let clickLog = [];
let saveAttempts = [];

// Monitor all clicks on the page
document.addEventListener('click', function(event) {
    const isNumberBox = event.target.dataset?.number || 
                       event.target.className?.includes('number') ||
                       /\b\d+\b/.test(event.target.textContent?.trim());
    
    if (isNumberBox) {
        const clickInfo = {
            timestamp: new Date().toISOString(),
            element: event.target,
            text: event.target.textContent?.trim(),
            classes: event.target.className,
            dataNumber: event.target.dataset?.number,
            dataHr: event.target.dataset?.hr,
            allDataAttrs: Object.fromEntries(
                [...event.target.attributes]
                .filter(attr => attr.name.startsWith('data-'))
                .map(attr => [attr.name, attr.value])
            )
        };
        
        clickLog.push(clickInfo);
        console.log('🖱️ NUMBER BOX CLICK DETECTED:', clickInfo);
        
        // Try to hook into any save operations that might happen
        setTimeout(() => {
            console.log('⏱️ 100ms after click - checking for save operations...');
        }, 100);
        
        setTimeout(() => {
            console.log('⏱️ 500ms after click - checking for save operations...');
        }, 500);
    }
}, true);

// Override console.log temporarily to catch save attempts
const originalConsoleLog = console.log;
console.log = function(...args) {
    originalConsoleLog.apply(console, args);
    
    const message = args.join(' ');
    if (message.includes('save') || message.includes('click') || message.includes('persist')) {
        saveAttempts.push({
            timestamp: new Date().toISOString(),
            message: message,
            args: args
        });
    }
};

console.log('✅ Monitoring setup complete! Now try clicking a number box...');

// STEP 2: Check what happened after clicking (run this after clicking)
function checkClickResults() {
    console.log('\n📊 CLICK ANALYSIS:');
    console.log('==================');
    console.log(`🖱️ Total clicks detected: ${clickLog.length}`);
    console.log(`💾 Save attempts detected: ${saveAttempts.length}`);
    
    if (clickLog.length > 0) {
        console.log('\n🖱️ Recent clicks:');
        clickLog.slice(-3).forEach((click, index) => {
            console.log(`  ${index + 1}. ${click.text} at ${click.timestamp}`);
            console.log(`     Classes: ${click.classes}`);
            console.log(`     Data attrs:`, click.allDataAttrs);
        });
    }
    
    if (saveAttempts.length > 0) {
        console.log('\n💾 Save attempts:');
        saveAttempts.slice(-3).forEach((attempt, index) => {
            console.log(`  ${index + 1}. ${attempt.message}`);
        });
    }
    
    return { clickLog, saveAttempts };
}

// STEP 3: Test the save/load functions directly
async function testDirectSaveLoad() {
    console.log('\n🧪 Testing direct save/load operations...');
    
    const currentUser = localStorage.getItem('currentUser');
    const selectedDate = localStorage.getItem('selectedDate') || new Date().toISOString().split('T')[0];
    
    if (!currentUser) {
        console.error('❌ No user logged in');
        return;
    }
    
    try {
        // Import the service
        const module = await import('/src/services/DualServiceManager.js');
        const dualServiceManager = module.default || module.DualServiceManager;
        
        if (!dualServiceManager) {
            console.error('❌ Could not access DualServiceManager');
            return;
        }
        
        // Test data
        const testData = {
            userId: currentUser,
            setName: 'D1-SET1',
            dateKey: selectedDate,
            numberValue: 3, // Test number 3
            hrNumber: 1,
            isClicked: true,
            isPresent: true
        };
        
        console.log('💾 Testing save with data:', testData);
        const saveResult = await dualServiceManager.saveNumberBoxClick(testData);
        console.log('✅ Save result:', saveResult);
        
        console.log('📥 Testing load...');
        const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
            currentUser, 'D1-SET1', selectedDate
        );
        console.log('✅ Load result:', loadResult);
        
        return { saveResult, loadResult };
        
    } catch (error) {
        console.error('❌ Direct test failed:', error);
    }
}

// STEP 4: Check what the Rule1Page component is doing
function inspectRule1Component() {
    console.log('\n🔍 Inspecting Rule1Page component...');
    
    // Try to find React components
    const reactElements = document.querySelectorAll('[data-reactroot] *');
    let rule1Component = null;
    
    for (let element of reactElements) {
        const reactKey = Object.keys(element).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
        if (reactKey) {
            const reactInstance = element[reactKey];
            if (reactInstance && reactInstance.type && reactInstance.type.name === 'Rule1Page_Enhanced') {
                rule1Component = reactInstance;
                break;
            }
        }
    }
    
    if (rule1Component) {
        console.log('✅ Found Rule1Page component:', rule1Component);
        console.log('📋 Component props:', rule1Component.memoizedProps);
        console.log('📋 Component state:', rule1Component.memoizedState);
    } else {
        console.log('❌ Could not find Rule1Page component');
    }
    
    return rule1Component;
}

console.log(`
📋 DEBUG FUNCTIONS LOADED:

After clicking a number box, run:
1. checkClickResults() - See what clicks were detected
2. testDirectSaveLoad() - Test save/load functions directly  
3. inspectRule1Component() - Examine the React component

The monitoring is now active. Try clicking a number box!
`);
