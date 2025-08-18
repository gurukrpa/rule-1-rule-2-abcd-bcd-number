// 🔧 MANUAL SYNC TEST - Paste this in browser console
console.clear();
console.log('=== MANUAL SYNC TEST ===');

// Test the sync directly
const testSync = async () => {
  try {
    console.log('1. Testing sync service...');
    
    // Import the service
    const module = await import('./src/services/crossPageSyncService.js');
    const crossPageSyncService = module.default;
    
    console.log('2. Sync service loaded');
    
    // Test with your user ID
    const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
    console.log('3. Getting clicked numbers for user:', userId);
    
    const syncData = await crossPageSyncService.getAllClickedNumbers(userId);
    console.log('4. ✅ Sync data retrieved:', syncData);
    
    // Check August 14th specifically
    if (syncData['2025-08-14']) {
      console.log('5. 📅 August 14th data found:', syncData['2025-08-14']);
      
      if (syncData['2025-08-14']['D-1 Set-1 Matrix']) {
        const d1Data = syncData['2025-08-14']['D-1 Set-1 Matrix'];
        console.log('6. 🎯 D-1 Set-1 Matrix data:', d1Data);
        console.log('7. 🔢 Clicked numbers:', d1Data.clickedNumbers);
      } else {
        console.log('6. ❌ No D-1 Set-1 Matrix data found');
      }
    } else {
      console.log('5. ❌ No August 14th data found');
      console.log('Available dates:', Object.keys(syncData));
    }
    
  } catch (error) {
    console.error('❌ Sync test failed:', error);
  }
};

testSync();
