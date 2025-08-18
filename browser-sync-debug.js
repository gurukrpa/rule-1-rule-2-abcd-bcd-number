// 🔧 BROWSER CONSOLE DEBUG: Paste this in browser console to test sync
console.clear();
console.log('=== CROSS-PAGE SYNC DEBUG ===');

// Test 1: Check if sync service is available
try {
  console.log('1. Testing sync service...');
  
  // Find the window/component state
  const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
  console.log('User ID:', userId);
  
  // Test 2: Manual sync data load
  console.log('2. Manually loading sync data...');
  
  // This should be available if crossPageSyncService is imported
  if (window.crossPageSyncService) {
    window.crossPageSyncService.getAllClickedNumbers(userId)
      .then(data => {
        console.log('✅ Sync data loaded:', data);
        
        // Test 3: Check specific date
        const targetDate = '2025-08-17';
        const dateData = data[targetDate];
        console.log(`📅 Data for ${targetDate}:`, dateData);
        
        if (dateData && dateData['D-1 Set-1 Matrix']) {
          const topicData = dateData['D-1 Set-1 Matrix'];
          console.log('🎯 D-1 Set-1 Matrix data:', topicData);
          console.log('🔢 Clicked numbers:', topicData.clickedNumbers);
        }
      })
      .catch(err => {
        console.error('❌ Sync error:', err);
      });
  } else {
    console.log('⚠️ crossPageSyncService not available in window');
    console.log('Available on window:', Object.keys(window).filter(k => k.includes('sync')));
  }
  
} catch (error) {
  console.error('Debug error:', error);
}

// Test 4: Check React component state
console.log('3. Checking React component states...');
try {
  // Look for React DevTools or component instances
  const reactFiber = document.querySelector('[data-reactroot]')?._reactInternalFiber ||
                    document.querySelector('#root')?._reactInternalFiber;
  
  if (reactFiber) {
    console.log('✅ React app found');
  } else {
    console.log('⚠️ React app structure not found');
  }
} catch (e) {
  console.log('React inspection failed:', e.message);
}

console.log('=== DEBUG COMPLETE ===');
