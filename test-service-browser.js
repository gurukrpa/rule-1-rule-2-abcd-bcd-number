// Test CleanFirebaseService directly in browser console
// This will help us verify the service is working correctly

async function testCleanFirebaseService() {
    console.log('🧪 Testing CleanFirebaseService in browser...');
    
    // Check if the service is available
    if (typeof window.cleanFirebaseService === 'undefined') {
        console.log('❌ CleanFirebaseService not available in global scope');
        console.log('This is normal - the service is imported in components');
        return;
    }
    
    // Test the service
    const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    
    try {
        console.log('🔍 Testing getUserDates for sing maya user...');
        const dates = await window.cleanFirebaseService.getUserDates(userId, 'ABCD');
        console.log('✅ getUserDates result:', dates);
        console.log('📅 Dates count:', dates ? dates.length : 0);
    } catch (error) {
        console.error('❌ Error testing getUserDates:', error);
    }
}

// Run the test
testCleanFirebaseService();
