// Check implementation status
// This script can be run in the browser console to verify the hour-specific data implementation

console.log('🔬 Checking hour-specific data implementation status...');

// Check if the page is loading the new functionality
const checkImplementation = () => {
    // Look for evidence of the new implementation
    const indicators = {
        pageLoaded: !!document.querySelector('h1'),
        userInfoVisible: !!document.querySelector('[class*="bg-blue-50"]'),
        hourTabsVisible: !!document.querySelector('[class*="hour-card"]'),
        realAnalysisIndicator: !!document.querySelector('[class*="bg-green-50"]'),
        hourSwitchingAvailable: !!document.querySelector('button[class*="HR"]'),
        statusMessages: document.querySelectorAll('.bg-green-50, .bg-yellow-50, .bg-red-50').length
    };
    
    console.log('📊 Page Status Indicators:', indicators);
    
    // Check localStorage for user data
    const userDataKeys = Object.keys(localStorage).filter(key => 
        key.includes('planets-test-user') || key.includes('abcd_dates')
    );
    console.log('💾 LocalStorage Data:', userDataKeys);
    
    // Check for error messages
    const errorElements = document.querySelectorAll('.bg-red-50, .border-red-400');
    if (errorElements.length > 0) {
        console.log('❌ Error Elements Found:', errorElements.length);
        errorElements.forEach((el, i) => {
            console.log(`   Error ${i + 1}:`, el.textContent.trim().substring(0, 100));
        });
    }
    
    // Check for success messages
    const successElements = document.querySelectorAll('.bg-green-50, .border-green-400');
    if (successElements.length > 0) {
        console.log('✅ Success Elements Found:', successElements.length);
        successElements.forEach((el, i) => {
            console.log(`   Success ${i + 1}:`, el.textContent.trim().substring(0, 100));
        });
    }
    
    return indicators;
};

// Run the check
const status = checkImplementation();

// Provide recommendations
if (status.pageLoaded) {
    console.log('✅ Page loaded successfully');
    
    if (status.hourTabsVisible) {
        console.log('✅ Hour tabs are visible - multi-hour functionality detected');
    } else {
        console.log('⚠️ No hour tabs visible - may be single hour user or loading issue');
    }
    
    if (status.realAnalysisIndicator) {
        console.log('✅ Real analysis indicator found - new implementation may be working');
    } else {
        console.log('⚠️ No real analysis indicator - check if data loading is working');
    }
} else {
    console.log('❌ Page not fully loaded - wait and try again');
}

console.log('🎯 To test hour-specific data manually:');
console.log('   1. Look for hour tabs (HR 1, HR 2, etc.)');
console.log('   2. Click different hours and check if ABCD/BCD numbers change');
console.log('   3. Look for green dots (●) vs red dots (○) in hour tabs');
console.log('   4. Check browser console for RealTimeRule2AnalysisService logs');
