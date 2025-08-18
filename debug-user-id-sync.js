// Debug script to check what user ID the sync service is using
// Run this in browser console on PlanetsAnalysis page

console.clear();
console.log('🔍 Debugging user ID and sync data...');

// Check what user ID is being used in the current session
console.log('Current URL user ID:', window.location.pathname.split('/').pop());

// Check localStorage for any stored user data
console.log('LocalStorage user data:', localStorage.getItem('userId') || 'Not found');
console.log('SessionStorage user data:', sessionStorage.getItem('userId') || 'Not found');

// Test sync with the actual user ID from database
async function testSyncWithRealUserId() {
    try {
        console.log('\n🧪 Testing sync with real user ID from database...');
        
        const realUserId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
        console.log('Using user ID:', realUserId);
        
        // Import fresh sync service
        const timestamp = Date.now();
        const syncModule = await import(`./src/services/crossPageSyncService.js?v=${timestamp}`);
        const syncService = syncModule.default;
        
        // Get sync data for real user ID
        const syncData = await syncService.getAllClickedNumbers(realUserId);
        console.log('✅ Sync data for real user ID:', syncData);
        
        // Check specifically for 2025-08-14
        if (syncData && syncData['2025-08-14']) {
            console.log('✅ Found data for 2025-08-14:', syncData['2025-08-14']);
        } else {
            console.log('❌ No data found for 2025-08-14');
            console.log('Available dates:', Object.keys(syncData || {}));
        }
        
        // Check for D-1 Set-1 data on any date
        const datesWithD1 = Object.keys(syncData || {}).filter(date => {
            return syncData[date] && (
                syncData[date]['D-1'] || 
                syncData[date]['D-1 Set-1'] ||
                syncData[date]['D-1 Set-1 Matrix']
            );
        });
        
        if (datesWithD1.length > 0) {
            console.log('✅ Found D-1 data on dates:', datesWithD1);
            datesWithD1.forEach(date => {
                console.log(`D-1 data for ${date}:`, syncData[date]);
            });
        } else {
            console.log('❌ No D-1 Set-1 data found on any date');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testSyncWithRealUserId();

console.log('\n💡 Next steps:');
console.log('1. Check if the application is using the correct user ID');
console.log('2. Verify if data for 2025-08-14 actually exists');
console.log('3. Check topic name matching (D-1 vs D-1 Set-1 Matrix)');
