// ===== BROWSER CONSOLE DEBUG SCRIPT FOR CROSS-PAGE SYNC =====
// Copy and paste this entire script into the browser console (F12 -> Console tab)

console.clear();
console.log('🔍 Starting Cross-Page Sync Debug...');

// Step 1: Clear all cached modules
if ('webkitURL' in window) {
    console.log('🧹 Attempting to clear module cache...');
}

// Step 2: Force import fresh modules
async function debugCrossPageSync() {
    try {
        console.log('📦 Step 1: Importing crossPageSyncService with cache-busting...');
        
        // Import with timestamp to bypass cache
        const timestamp = Date.now();
        const syncModule = await import(`./src/services/crossPageSyncService.js?v=${timestamp}`);
        const syncService = syncModule.default;
        
        console.log('✅ Sync service imported:', syncService);
        console.log('📋 Service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(syncService)));
        
        // Step 3: Check cleanSupabaseService
        console.log('📦 Step 2: Checking cleanSupabaseService...');
        console.log('✅ CleanSupabaseService:', syncService.cleanSupabaseService);
        console.log('📋 CleanSupabaseService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(syncService.cleanSupabaseService)));
        
        // Step 4: Test the method that's causing issues
        console.log('🧪 Step 3: Testing getAllClickedNumbers method...');
        
        if (typeof syncService.getAllClickedNumbers === 'function') {
            console.log('✅ getAllClickedNumbers method exists');
            
            // Try to call it with a test user
            try {
                const result = await syncService.getAllClickedNumbers('test-user-debug');
                console.log('✅ Method call successful!', result);
            } catch (methodError) {
                console.error('❌ Method call failed:', methodError);
                console.error('📜 Error stack:', methodError.stack);
            }
        } else {
            console.error('❌ getAllClickedNumbers method does not exist!');
        }
        
        // Step 5: Check if the problematic method name exists anywhere
        console.log('🔍 Step 4: Checking for getAllTopicClicksByUser...');
        if (typeof syncService.getAllTopicClicksByUser === 'function') {
            console.error('❌ Found problematic method getAllTopicClicksByUser - this should not exist!');
        } else {
            console.log('✅ Problematic method getAllTopicClicksByUser does not exist (good)');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
        console.error('📜 Full error stack:', error.stack);
    }
}

// Step 6: Run the debug
debugCrossPageSync();

console.log('🎯 Debug script complete. Check the output above for results.');
console.log('💡 If you still see the getAllTopicClicksByUser error, it might be cached in localStorage or sessionStorage.');

// Step 7: Clear any stored sync data
try {
    localStorage.removeItem('crossPageSyncData');
    sessionStorage.removeItem('crossPageSyncData');
    console.log('🧹 Cleared any stored sync data from localStorage/sessionStorage');
} catch (e) {
    console.log('⚠️ Could not clear storage:', e.message);
}
