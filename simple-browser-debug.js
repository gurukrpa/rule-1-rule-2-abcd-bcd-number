// Simple Browser Console Number Box Debugger
// Copy and paste this directly into Chrome console on Rule-1 page

console.clear();
console.log('🔍 SIMPLE NUMBER BOX DEBUGGER');
console.log('=============================');

// Check if we're on the right page
if (!window.location.href.includes('rule-1')) {
    console.error('❌ Please navigate to Rule-1 Enhanced page first');
} else {
    console.log('✅ On Rule-1 page');
}

// Get user info from localStorage
const currentUser = localStorage.getItem('currentUser');
const selectedDate = localStorage.getItem('selectedDate') || '2025-08-01';

console.log('👤 Current User:', currentUser);
console.log('📅 Selected Date:', selectedDate);

if (!currentUser) {
    console.error('❌ No user logged in. Please log in first.');
} else {
    console.log('✅ User is logged in');
}

// Simple click monitor
let clickCount = 0;

function monitorClicks() {
    console.log('\n👂 Setting up click monitoring...');
    
    // Find number box buttons
    const numberBoxes = document.querySelectorAll('button');
    const realNumberBoxes = Array.from(numberBoxes).filter(btn => {
        const text = btn.textContent?.trim();
        return /^\d+$/.test(text) && parseInt(text) >= 1 && parseInt(text) <= 12;
    });
    
    console.log(`📦 Found ${realNumberBoxes.length} potential number boxes`);
    
    if (realNumberBoxes.length === 0) {
        console.warn('⚠️ No number boxes found. Make sure HR is selected and topics are visible');
        return;
    }
    
    // Add listeners to detect clicks
    realNumberBoxes.forEach(button => {
        button.addEventListener('click', function() {
            clickCount++;
            const number = this.textContent?.trim();
            
            console.log(`\n🖱️ CLICK #${clickCount}: Number ${number}`);
            console.log('🕐 Time:', new Date().toLocaleTimeString());
            console.log('🎯 Button:', this);
            console.log('🎨 Classes:', this.className);
            
            // Check if button changes appearance
            setTimeout(() => {
                console.log('🔄 Button after click:', this.className);
                const hasChangedStyle = this.className.includes('green') || 
                                      this.className.includes('orange') || 
                                      this.className.includes('selected') ||
                                      this.style.backgroundColor !== '';
                
                if (hasChangedStyle) {
                    console.log('✅ Button appearance changed - click detected visually');
                } else {
                    console.log('⚠️ Button appearance unchanged - might be an issue');
                }
            }, 100);
        }, true);
    });
    
    console.log('✅ Click monitoring active');
}

// Check React component state
function checkReactState() {
    console.log('\n⚛️ Checking React component state...');
    
    // Try to find React elements
    const reactElements = document.querySelectorAll('[data-reactroot] *');
    console.log(`📦 Found ${reactElements.length} React elements`);
    
    // Look for state indicators
    const stateIndicators = document.querySelectorAll('[class*="clicked"], [class*="selected"], [class*="active"]');
    console.log(`🎯 Found ${stateIndicators.length} elements with state-like classes`);
    
    // Check localStorage for any number box related data
    const storageKeys = Object.keys(localStorage).filter(key => 
        key.includes('number') || key.includes('click') || key.includes('box')
    );
    
    if (storageKeys.length > 0) {
        console.log('💾 Found number box related localStorage:');
        storageKeys.forEach(key => {
            console.log(`  ${key}:`, localStorage.getItem(key));
        });
    } else {
        console.log('📭 No number box data in localStorage');
    }
}

// Manual test without DualServiceManager
function testWithoutService() {
    console.log('\n🧪 Testing WITHOUT DualServiceManager...');
    
    // Check if clicks are being stored anywhere
    const possibleStorageKeys = [
        'clickedNumbers',
        'numberBoxClicks',
        'rule1Clicks',
        'numberPresenceStatus',
        `${currentUser}_clicks`,
        `${currentUser}_${selectedDate}_clicks`
    ];
    
    console.log('🔍 Checking possible storage locations...');
    possibleStorageKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            console.log(`📦 Found ${key}:`, value);
        }
    });
    
    // Check sessionStorage too
    console.log('🔍 Checking sessionStorage...');
    possibleStorageKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        if (value) {
            console.log(`📦 Found in session ${key}:`, value);
        }
    });
}

// Simple database test using fetch
async function testDatabaseDirect() {
    console.log('\n🗄️ Testing database directly...');
    
    try {
        // This will work if supabase is available globally
        if (window.supabase) {
            console.log('✅ Supabase client found');
            
            const { data, error } = await window.supabase
                .from('number_box_clicks')
                .select('*')
                .eq('user_id', currentUser)
                .eq('date_key', selectedDate)
                .limit(5);
            
            if (error) {
                console.log('❌ Database error:', error);
            } else {
                console.log('✅ Database query successful:', data);
                console.log(`📊 Found ${data?.length || 0} existing clicks`);
            }
        } else {
            console.log('⚠️ Supabase client not available globally');
        }
    } catch (error) {
        console.log('❌ Database test failed:', error);
    }
}

// Check if DualServiceManager exists in global scope
function checkServiceManager() {
    console.log('\n🔧 Checking for DualServiceManager...');
    
    if (window.dualServiceManager) {
        console.log('✅ Found window.dualServiceManager');
        console.log('📋 Methods:', Object.getOwnPropertyNames(window.dualServiceManager.__proto__));
        
        // Test if it's enabled
        if (window.dualServiceManager.enabled !== undefined) {
            console.log('🎛️ Service enabled:', window.dualServiceManager.enabled);
        }
        
        return window.dualServiceManager;
    } else if (window.DualServiceManager) {
        console.log('✅ Found window.DualServiceManager');
        return window.DualServiceManager;
    } else {
        console.log('❌ DualServiceManager not found in global scope');
        return null;
    }
}

// Main diagnostic function
function runDiagnostics() {
    console.log('\n🚀 Running diagnostics...');
    
    // 1. Check service manager
    const serviceManager = checkServiceManager();
    
    // 2. Monitor clicks
    monitorClicks();
    
    // 3. Check React state
    checkReactState();
    
    // 4. Test without service
    testWithoutService();
    
    // 5. Test database if possible
    testDatabaseDirect();
    
    console.log('\n📋 INSTRUCTIONS:');
    console.log('1. Click some number boxes (1-12)');
    console.log('2. Watch the console output');
    console.log('3. Refresh the page');
    console.log('4. Run: checkAfterRefresh()');
    
    // Make check function available
    window.checkAfterRefresh = function() {
        console.log('\n🔄 CHECKING AFTER REFRESH...');
        checkReactState();
        testWithoutService();
        testDatabaseDirect();
    };
    
    // Make manual click test available
    window.testClick = function(number) {
        console.log(`\n🧪 MANUAL TEST: Clicking number ${number}`);
        const buttons = document.querySelectorAll('button');
        const targetButton = Array.from(buttons).find(btn => btn.textContent?.trim() === number.toString());
        
        if (targetButton) {
            console.log('🎯 Found button:', targetButton);
            targetButton.click();
            console.log('✅ Click simulated');
        } else {
            console.log(`❌ Button for number ${number} not found`);
        }
    };
    
    console.log('\n🛠️ AVAILABLE FUNCTIONS:');
    console.log('- checkAfterRefresh() - Check state after refresh');
    console.log('- testClick(5) - Simulate clicking number 5');
}

// Auto-run diagnostics
runDiagnostics();
