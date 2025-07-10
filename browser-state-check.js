// Browser State Verification Script
// Copy and paste this into the browser console

console.log('🔍 Verifying ABCD Page State');
console.log('Current URL:', window.location.href);

// Check if we're on the correct ABCD page
if (window.location.pathname.includes('abcd-number/5019aa9a-a653-49f5-b7da-f5bc9dcde985')) {
    console.log('✅ On correct ABCD page for sing maya user');
    
    // Look for dates display
    setTimeout(() => {
        const datesText = document.body.innerText;
        const datesMatch = datesText.match(/📅 Dates: (\d+)/);
        
        if (datesMatch) {
            const datesCount = parseInt(datesMatch[1]);
            console.log(`📅 Found dates display: ${datesCount}`);
            
            if (datesCount === 13) {
                console.log('🎉 SUCCESS! ABCD page shows 13 dates - Fix is working!');
            } else if (datesCount === 0) {
                console.log('❌ Still showing 0 dates - may need to refresh or investigate');
            } else {
                console.log(`ℹ️  Shows ${datesCount} dates - unexpected but not 0`);
            }
        } else {
            console.log('❌ Could not find dates display in page');
            
            // Show what we can find
            const userInfo = document.body.innerText.includes('✅ User:');
            const hrInfo = document.body.innerText.includes('🏠 HR Numbers:');
            
            console.log('User info found:', userInfo);
            console.log('HR info found:', hrInfo);
            
            if (!userInfo && !hrInfo) {
                console.log('Page may still be loading...');
            }
        }
    }, 2000);
    
} else {
    console.log('❌ Not on the correct ABCD page');
    console.log('Expected: /abcd-number/5019aa9a-a653-49f5-b7da-f5bc9dcde985');
    console.log('Current:', window.location.pathname);
}

console.log('⏳ Checking in 2 seconds...');
