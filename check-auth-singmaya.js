// Check Authentication and Login sing maya user
// Run this in the browser console

async function checkAndLoginSingMaya() {
    console.log('🔐 Checking authentication state...');
    
    // Check if user is already logged in
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const user = JSON.parse(userInfo);
        console.log('✅ User already logged in:', user.displayName || user.email);
        console.log('User ID:', user.uid);
        
        if (user.uid === '5019aa9a-a653-49f5-b7da-f5bc9dcde985') {
            console.log('✅ This is the sing maya user - perfect!');
            return true;
        } else {
            console.log('ℹ️  This is not the sing maya user');
            console.log('Need to log in with sing maya user');
        }
    } else {
        console.log('❌ No user logged in');
    }
    
    // Check if we need to navigate to login
    if (!window.location.pathname.includes('login')) {
        console.log('🔄 Navigate to login page first');
        console.log('Current path:', window.location.pathname);
        console.log('Please navigate to the login page and log in with sing maya user');
    }
    
    return false;
}

// Check if we're logged in with the right user
checkAndLoginSingMaya();
