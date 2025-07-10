// Complete ABCD Testing Script
// Run this in the browser console to test the full flow

console.log('🚀 Starting Complete ABCD Testing...');

// First, check if we're on the right page
console.log('Current URL:', window.location.href);

// Check if we're logged in
const userInfo = localStorage.getItem('userInfo');
if (userInfo) {
    const user = JSON.parse(userInfo);
    console.log('✅ User logged in:', user.displayName || user.email);
    console.log('User ID:', user.uid);
    
    if (user.uid === '5019aa9a-a653-49f5-b7da-f5bc9dcde985') {
        console.log('✅ This is the sing maya user!');
    } else {
        console.log('ℹ️  This is not the sing maya user');
        console.log('Current user:', user.uid);
        console.log('Expected user:', '5019aa9a-a653-49f5-b7da-f5bc9dcde985');
    }
} else {
    console.log('❌ No user logged in');
}

// Navigate to the ABCD page for the sing maya user
function navigateToABCDPage() {
    const targetUrl = '/abcd-bcd-number/5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    console.log('🔄 Navigating to:', targetUrl);
    window.location.href = targetUrl;
}

// Check if we need to navigate
if (!window.location.pathname.includes('abcd-bcd-number')) {
    console.log('🔄 Not on ABCD page, navigating...');
    navigateToABCDPage();
} else {
    console.log('✅ Already on ABCD page');
    
    // Check for the dates display
    setTimeout(() => {
        const datesElements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent && el.textContent.includes('📅 Dates:')
        );
        
        if (datesElements.length > 0) {
            datesElements.forEach((el, index) => {
                console.log(`📅 Dates display ${index + 1}:`, el.textContent);
            });
        } else {
            console.log('❌ No dates display found');
        }
    }, 2000);
}

console.log('🔍 Testing complete');
