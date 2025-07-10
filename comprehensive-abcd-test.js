// Comprehensive ABCD Page Test
// Run this in the browser console to test the current state

async function testABCDPage() {
    console.log('🔍 Starting Comprehensive ABCD Page Test');
    
    // Check current page
    console.log('Current URL:', window.location.href);
    
    // Check if user is logged in
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
        console.log('❌ No user logged in. Please log in first.');
        return;
    }
    
    const user = JSON.parse(userInfo);
    console.log('✅ User logged in:', user.displayName || user.email);
    console.log('User ID:', user.uid);
    
    // Check if this is the sing maya user
    if (user.uid === '5019aa9a-a653-49f5-b7da-f5bc9dcde985') {
        console.log('✅ This is the sing maya user we\'re testing');
    } else {
        console.log('ℹ️  This is not the sing maya user. User ID:', user.uid);
    }
    
    // Look for dates display
    const datesElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('📅 Dates:')
    );
    
    if (datesElements.length > 0) {
        datesElements.forEach((el, index) => {
            console.log(`Dates display ${index + 1}:`, el.textContent);
        });
    } else {
        console.log('❌ No dates display found');
    }
    
    // Check for ABCD component
    const abcdComponent = document.querySelector('[data-testid="abcd-bcd-number"]');
    if (abcdComponent) {
        console.log('✅ ABCD component found');
    } else {
        console.log('❌ ABCD component not found');
    }
    
    // Check for any loading indicators
    const loadingElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && (el.textContent.includes('Loading') || el.textContent.includes('loading'))
    );
    
    if (loadingElements.length > 0) {
        console.log('Loading indicators found:', loadingElements.map(el => el.textContent));
    } else {
        console.log('No loading indicators found');
    }
    
    console.log('🔍 Test complete');
}

// Run the test
testABCDPage();
