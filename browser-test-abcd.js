// Browser Console Test for ABCD Page
// Copy and paste this into the browser console on the ABCD page

console.log('🔍 Starting ABCD Page Debug Test');

// Check if we're on the ABCD page
console.log('Current URL:', window.location.href);
console.log('Current path:', window.location.pathname);

// Check if ABCDBCDNumber component is rendered
const abcdElements = document.querySelectorAll('[data-testid="abcd-bcd-number"]');
console.log('ABCD components found:', abcdElements.length);

// Check for dates display
const datesElements = document.querySelectorAll('*');
const datesText = Array.from(datesElements).find(el => 
    el.textContent && el.textContent.includes('📅 Dates:')
);
if (datesText) {
    console.log('Found dates text:', datesText.textContent);
} else {
    console.log('❌ No dates text found');
}

// Check if user is logged in
const userInfo = localStorage.getItem('userInfo');
if (userInfo) {
    const user = JSON.parse(userInfo);
    console.log('User logged in:', user.displayName || user.email);
    console.log('User ID:', user.uid);
} else {
    console.log('❌ No user logged in');
}

// Check if Firebase is loaded
if (typeof window.firebase !== 'undefined') {
    console.log('✅ Firebase loaded');
} else {
    console.log('❌ Firebase not loaded');
}

console.log('🔍 Debug test complete');
