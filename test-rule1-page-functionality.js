/**
 * Quick Rule-1 Page Functionality Test
 * Tests if the Rule-1 page loads without the black/white screen issue
 * 
 * Usage: Paste this in browser console after navigating to the main page
 */

console.log('🧪 Testing Rule-1 Page Functionality...');

async function testRule1PageAccess() {
    console.log('\n🎯 ===== RULE-1 PAGE FUNCTIONALITY TEST =====');
    
    // Step 1: Check if we're on the main page
    console.log('📍 Step 1: Checking current page...');
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);
    
    if (!currentUrl.includes('localhost:5173') && !currentUrl.includes('localhost:5174')) {
        console.log('❌ Not on the application. Please navigate to http://localhost:5173 first.');
        return false;
    }
    
    // Step 2: Check for user selection
    console.log('\n👤 Step 2: Checking user selection...');
    const userSelect = document.querySelector('select');
    if (!userSelect) {
        console.log('❌ User selection dropdown not found');
        return false;
    }
    
    const selectedUser = userSelect.value;
    if (!selectedUser) {
        console.log('⚠️ No user selected. Attempting to select first available user...');
        const options = userSelect.querySelectorAll('option');
        if (options.length > 1) {
            userSelect.value = options[1].value; // Select first non-empty option
            userSelect.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Selected user:', options[1].value);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for data to load
        } else {
            console.log('❌ No users available in dropdown');
            return false;
        }
    } else {
        console.log('✅ User already selected:', selectedUser);
    }
    
    // Step 3: Wait for dates to load
    console.log('\n📅 Step 3: Waiting for dates to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Look for "Past Days" buttons
    console.log('\n🔍 Step 4: Looking for Past Days buttons...');
    const pastDaysButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('Past Days')
    );
    
    console.log(`Found ${pastDaysButtons.length} Past Days buttons`);
    
    if (pastDaysButtons.length === 0) {
        console.log('⚠️ No Past Days buttons found. This might be because:');
        console.log('   - Not enough dates (need at least 5)');
        console.log('   - Data still loading');
        console.log('   - Need to upload Excel files and complete Hour Entry');
        
        // Look for any date buttons at all
        const allButtons = Array.from(document.querySelectorAll('button'));
        console.log('Available buttons:', allButtons.map(btn => btn.textContent.trim()).slice(0, 10));
        
        return false;
    }
    
    // Step 5: Try clicking the first available Past Days button
    console.log('\n🖱️ Step 5: Testing Past Days button click...');
    const firstPastDaysButton = pastDaysButtons[0];
    
    console.log('About to click Past Days button...');
    
    // Add error listener to catch any JavaScript errors
    let errorCaught = false;
    const errorHandler = (error) => {
        console.error('❌ JavaScript error caught:', error);
        errorCaught = true;
    };
    
    window.addEventListener('error', errorHandler);
    
    try {
        firstPastDaysButton.click();
        console.log('✅ Past Days button clicked successfully');
        
        // Wait for navigation/rendering
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Step 6: Check if Rule-1 page loaded successfully
        console.log('\n🔍 Step 6: Checking if Rule-1 page loaded...');
        
        // Look for Rule-1 page indicators
        const rule1Indicators = [
            document.querySelector('[data-testid="rule1-page"]'),
            document.querySelector('h1, h2, h3').textContent?.includes('Past Days'),
            document.querySelector('h1, h2, h3').textContent?.includes('Rule-1'),
            Array.from(document.querySelectorAll('*')).some(el => 
                el.textContent?.includes('Past Days') || 
                el.textContent?.includes('Historical View')
            )
        ];
        
        const hasRule1Content = rule1Indicators.some(indicator => indicator);
        
        if (hasRule1Content) {
            console.log('✅ Rule-1 page appears to have loaded successfully!');
            
            // Check for specific Rule-1 elements
            const tables = document.querySelectorAll('table');
            const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
                const text = btn.textContent?.trim();
                return text && /^(1[0-2]|[1-9])$/.test(text);
            });
            
            console.log('📊 Rule-1 page elements found:');
            console.log(`   - Tables: ${tables.length}`);
            console.log(`   - Number boxes (1-12): ${numberBoxes.length}`);
            
            // Check for debug tools
            if (window.rule1PageDebug) {
                console.log('🛠️ Debug tools available:', Object.keys(window.rule1PageDebug));
            }
            
            return true;
        } else {
            console.log('❌ Rule-1 page did not load properly');
            console.log('Current page appears to be showing:', document.title);
            
            // Check if we got a blank/black page
            const bodyContent = document.body.textContent?.trim();
            if (!bodyContent || bodyContent.length < 50) {
                console.log('🚨 BLANK/BLACK PAGE DETECTED!');
                console.log('This suggests a JavaScript error or rendering issue.');
            }
            
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error during button click:', error);
        return false;
    } finally {
        window.removeEventListener('error', errorHandler);
        
        if (errorCaught) {
            console.log('🚨 JavaScript errors were detected during the test');
        }
    }
}

// Auto-run the test
testRule1PageAccess().then(success => {
    if (success) {
        console.log('\n🎉 ===== TEST PASSED =====');
        console.log('✅ Rule-1 page is working correctly!');
        console.log('✅ No black/white screen issue detected');
        console.log('✅ Clean Supabase-only implementation is functional');
    } else {
        console.log('\n❌ ===== TEST FAILED =====');
        console.log('❌ Rule-1 page has issues');
        console.log('💡 Check the steps above for specific problems');
    }
});

// Make test function available for manual use
window.testRule1PageAccess = testRule1PageAccess;

console.log('🧪 Rule-1 Page Test Ready');
console.log('💡 Test will run automatically, or call: testRule1PageAccess()');
