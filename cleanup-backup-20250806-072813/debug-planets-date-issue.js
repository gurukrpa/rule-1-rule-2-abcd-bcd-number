// Diagnostic script to check available dates for user "sing maya"
// Run this in browser console to see what dates are available

async function checkUserDates() {
    console.log('🔍 Checking available dates for user "sing maya"...');
    
    // Check localStorage first
    const userId = 'sing maya'; // or whatever the actual user ID is
    const storageKey = `abcd_dates_${userId}`;
    
    try {
        const storedDates = localStorage.getItem(storageKey);
        if (storedDates) {
            const dates = JSON.parse(storedDates);
            console.log('📅 Dates in localStorage:', dates);
            console.log('📊 Total dates:', dates.length);
            
            // Check for July 2025 dates
            const july2025Dates = dates.filter(date => date.startsWith('2025-07'));
            console.log('🎯 July 2025 dates:', july2025Dates);
            
            // Check for specific dates
            const targetDates = ['2025-07-06', '2025-07-07', '2025-07-08'];
            targetDates.forEach(date => {
                const exists = dates.includes(date);
                console.log(`   ${date}: ${exists ? '✅ Available' : '❌ Missing'}`);
            });
            
            // Show latest dates
            const sortedDates = dates.sort((a, b) => new Date(b) - new Date(a));
            console.log('🕰️ Latest 5 dates:', sortedDates.slice(0, 5));
            
        } else {
            console.log('❌ No dates found in localStorage for key:', storageKey);
        }
    } catch (error) {
        console.error('❌ Error checking localStorage:', error);
    }
    
    // Check what the current URL parameters are
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    console.log('🔗 URL date parameter:', dateParam);
    
    // Show current Planets Analysis state if available
    if (window.location.pathname.includes('planets-analysis')) {
        console.log('🪐 Currently on Planets Analysis page');
        console.log('🔍 Expected behavior:');
        console.log('   1. If July 7 data exists → use July 7 directly');
        console.log('   2. If July 6 data exists → use July 6 (N-1 pattern)');
        console.log('   3. If neither exists → use latest available date');
    }
}

// Run the diagnostic
checkUserDates();

// Also provide manual test commands
console.log('\n🧪 Manual Test Commands:');
console.log('1. Check localStorage: localStorage.getItem("abcd_dates_sing maya")');
console.log('2. Test direct navigation: window.location.href = "/planets-analysis/sing%20maya?date=2025-07-07"');
console.log('3. Clear storage: localStorage.removeItem("abcd_dates_sing maya")');
