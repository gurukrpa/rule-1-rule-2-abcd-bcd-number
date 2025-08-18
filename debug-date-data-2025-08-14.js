// Debug script to check data for specific date 2025-08-14
// Run this in browser console to check what data exists

console.clear();
console.log('🔍 Debugging data for date 2025-08-14...');

async function debugSpecificDate() {
    try {
        // Import fresh services
        const timestamp = Date.now();
        const syncModule = await import(`./src/services/crossPageSyncService.js?v=${timestamp}`);
        const cleanModule = await import(`./src/services/CleanSupabaseService.js?v=${timestamp}`);
        
        const syncService = syncModule.default;
        const cleanService = cleanModule.default;
        
        console.log('✅ Services imported successfully');
        
        // Test with a real user ID (you can replace this with your actual user ID)
        const userId = 'test-user'; // Replace with your actual user ID
        
        console.log(`🔍 Checking data for user: ${userId}`);
        
        // 1. Get raw topic clicks data
        console.log('\n📊 Step 1: Getting raw topic clicks...');
        const allTopicClicks = await cleanService.getTopicClicks(userId);
        console.log('Raw topic clicks:', allTopicClicks);
        
        // 2. Filter for specific date 2025-08-14
        console.log('\n📊 Step 2: Filtering for date 2025-08-14...');
        const targetDate = '2025-08-14';
        const filteredClicks = allTopicClicks.filter(click => {
            console.log(`Checking click date: ${click.date_key} vs target: ${targetDate}`);
            return click.date_key === targetDate || 
                   click.date_key === '14-8-25' || 
                   click.date_key === '14-08-2025' ||
                   click.date_key === '2025-8-14';
        });
        console.log('Filtered clicks for 2025-08-14:', filteredClicks);
        
        // 3. Check different date formats
        console.log('\n📊 Step 3: Checking various date formats...');
        const possibleDates = ['2025-08-14', '14-8-25', '14-08-2025', '2025-8-14', '08-14-2025'];
        
        for (const dateFormat of possibleDates) {
            const matches = allTopicClicks.filter(click => click.date_key === dateFormat);
            if (matches.length > 0) {
                console.log(`✅ Found ${matches.length} clicks for date format "${dateFormat}":`, matches);
            } else {
                console.log(`❌ No clicks found for date format "${dateFormat}"`);
            }
        }
        
        // 4. Get organized sync data
        console.log('\n📊 Step 4: Getting organized sync data...');
        const syncData = await syncService.getAllClickedNumbers(userId);
        console.log('Organized sync data:', syncData);
        
        // 5. Check if 2025-08-14 exists in sync data
        if (syncData && syncData['2025-08-14']) {
            console.log('✅ Found 2025-08-14 in sync data:', syncData['2025-08-14']);
        } else {
            console.log('❌ 2025-08-14 not found in sync data');
            console.log('Available dates in sync data:', Object.keys(syncData || {}));
        }
        
        // 6. Check for D-1 Set-1 specifically
        console.log('\n📊 Step 5: Checking D-1 Set-1 data...');
        if (syncData && syncData['2025-08-14'] && syncData['2025-08-14']['D-1'] && syncData['2025-08-14']['D-1']['Set-1']) {
            console.log('✅ Found D-1 Set-1 data:', syncData['2025-08-14']['D-1']['Set-1']);
        } else {
            console.log('❌ D-1 Set-1 data not found for 2025-08-14');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
        console.error('Full error:', error.stack);
    }
}

// Run the debug
debugSpecificDate();

console.log('\n💡 If no data is found, the issue might be:');
console.log('1. Date format mismatch between storage and lookup');
console.log('2. Wrong user ID being used');
console.log('3. Data was stored with a different date key format');
console.log('4. Data is in the database but not being retrieved correctly');
