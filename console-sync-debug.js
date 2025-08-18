// Quick console test script to check sync data
// Run this in the browser console on any page

console.log('🔍 [Sync Debug] Starting cross-page sync diagnosis...');

async function debugSyncData() {
    try {
        // Import services
        const syncModule = await import('./src/services/crossPageSyncService.js');
        const cleanModule = await import('./src/services/CleanSupabaseService.js');
        
        const syncService = syncModule.default;
        const cleanService = cleanModule.default;
        
        console.log('✅ [Sync Debug] Services imported successfully');
        
        // Replace with actual user ID
        const userId = 'test-user-123'; // You'll need to replace this
        
        console.log('🔍 [Sync Debug] Testing with userId:', userId);
        
        // Test 1: Get all topic clicks
        console.log('🔍 [Sync Debug] Step 1: Getting all topic clicks...');
        const allClicks = await cleanService.getTopicClicks(userId);
        console.log('📊 [Sync Debug] All topic clicks:', allClicks);
        
        // Test 2: Filter for D-1 Set-1 Matrix
        const d1Set1Clicks = allClicks.filter(click => click.topic_name.includes('D-1 Set-1'));
        console.log('📊 [Sync Debug] D-1 Set-1 clicks:', d1Set1Clicks);
        
        // Test 3: Check dates
        const uniqueDates = [...new Set(allClicks.map(click => click.date_key))];
        console.log('📊 [Sync Debug] Unique dates in database:', uniqueDates);
        
        // Test 4: Get analysis results
        console.log('🔍 [Sync Debug] Step 2: Getting analysis results...');
        const analysisResults = await cleanService.getOrganizedAnalysisResults(userId);
        console.log('📊 [Sync Debug] Analysis results:', analysisResults);
        
        // Test 5: Get organized sync data
        console.log('🔍 [Sync Debug] Step 3: Getting organized sync data...');
        const syncData = await syncService.getAllClickedNumbers(userId);
        console.log('📊 [Sync Debug] Organized sync data:', syncData);
        
        // Test 6: Check specific date
        const targetDate = '2025-08-14';
        if (syncData[targetDate]) {
            console.log('✅ [Sync Debug] Found data for target date:', targetDate);
            console.log('📊 [Sync Debug] Target date data:', syncData[targetDate]);
            
            if (syncData[targetDate]['D-1 Set-1 Matrix']) {
                console.log('✅ [Sync Debug] Found D-1 Set-1 Matrix data!');
                console.log('📊 [Sync Debug] D-1 Set-1 data:', syncData[targetDate]['D-1 Set-1 Matrix']);
            }
        } else {
            console.log('❌ [Sync Debug] No data for target date:', targetDate);
            console.log('📊 [Sync Debug] Available dates:', Object.keys(syncData));
        }
        
        return {
            allClicks,
            d1Set1Clicks,
            uniqueDates,
            analysisResults,
            syncData
        };
        
    } catch (error) {
        console.error('❌ [Sync Debug] Error:', error);
        return { error: error.message };
    }
}

// Run the debug
debugSyncData().then(result => {
    console.log('🎯 [Sync Debug] Debug completed:', result);
});

console.log('💡 [Sync Debug] Check the console output above for detailed sync data analysis');
