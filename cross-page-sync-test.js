/**
 * Cross-Page Sync Debug Test Script
 * 
 * Run this in browser console on Planet Analysis page to test sync functionality
 * after clicking numbers in Rule-1 page
 */

console.log('🧪 [SYNC-TEST] Cross-Page Sync Debug Test Started');

// Test 1: Check current sync state
function checkSyncState() {
  console.log('📊 [SYNC-TEST] Current Sync State:', {
    localClickedNumbers: window.localClickedNumbers || 'undefined',
    rule1SyncData: window.rule1SyncData || 'undefined',
    syncEnabled: window.syncEnabled || 'undefined',
    selectedDate: window.selectedDate || 'undefined',
    selectedHour: window.selectedHour || 'undefined'
  });
}

// Test 2: Simulate Rule-1 click event
function simulateRule1Click(topicName, number, hour = 'HR1') {
  const testEvent = {
    type: 'rule1-click',
    data: {
      topic: topicName,
      number: number,
      date: new Date().toISOString().split('T')[0],
      hour: hour,
      timestamp: Date.now()
    }
  };
  
  console.log('🔄 [SYNC-TEST] Simulating Rule-1 click:', testEvent);
  window.postMessage(testEvent, '*');
}

// Test 3: Simulate Rule-1 unclick event
function simulateRule1Unclick(topicName, number, hour = 'HR1') {
  const testEvent = {
    type: 'rule1-unclick',
    data: {
      topic: topicName,
      number: number,
      date: new Date().toISOString().split('T')[0],
      hour: hour,
      timestamp: Date.now()
    }
  };
  
  console.log('🔄 [SYNC-TEST] Simulating Rule-1 unclick:', testEvent);
  window.postMessage(testEvent, '*');
}

// Test 4: Check if number should be displayed
function testDisplayLogic(topicName, number) {
  console.log(`🎯 [SYNC-TEST] Testing display logic for ${topicName} number ${number}`);
  
  // Mock rawData object
  const mockRawData = `${number}°00'00"`;
  
  // Test the logic manually
  const shouldDisplay = checkIfShouldDisplay(topicName, mockRawData);
  console.log(`📊 [SYNC-TEST] Should display result:`, shouldDisplay);
  
  return shouldDisplay;
}

// Helper function to check display logic
function checkIfShouldDisplay(topicName, rawData) {
  if (!rawData) return false;
  
  // Extract number (simplified version)
  const match = rawData.match(/(\d+)°/);
  const number = match ? parseInt(match[1]) : null;
  if (!number) return false;
  
  // Check local clicks
  if (window.localClickedNumbers && window.localClickedNumbers[topicName]) {
    if (window.localClickedNumbers[topicName].includes(number)) {
      return { display: true, source: 'local' };
    }
  }
  
  // Check sync data
  if (window.rule1SyncData && window.selectedDate) {
    const dateData = window.rule1SyncData[window.selectedDate];
    if (dateData && dateData[topicName]) {
      const syncData = dateData[topicName];
      if (syncData.clickedNumbers && syncData.clickedNumbers.includes(number)) {
        return { display: true, source: 'sync' };
      }
    }
  }
  
  return { display: false, source: 'none' };
}

// Test 5: Monitor events
function startEventMonitoring() {
  console.log('👂 [SYNC-TEST] Starting event monitoring...');
  
  const originalPostMessage = window.postMessage;
  window.postMessage = function(message, targetOrigin) {
    if (message.type && (message.type.includes('rule1') || message.type.includes('planet'))) {
      console.log('📡 [SYNC-TEST] Event detected:', message);
    }
    return originalPostMessage.call(this, message, targetOrigin);
  };
  
  // Also listen for all message events
  window.addEventListener('message', (event) => {
    if (event.data.type && (event.data.type.includes('rule1') || event.data.type.includes('planet'))) {
      console.log('📨 [SYNC-TEST] Message received:', event.data);
    }
  });
}

// Run initial tests
console.log('🚀 [SYNC-TEST] Running initial diagnostics...');
checkSyncState();
startEventMonitoring();

console.log(`
🧪 [SYNC-TEST] Test Functions Available:
- checkSyncState() - Check current sync state
- simulateRule1Click('D-1 Set-1 Matrix', 8) - Test click event
- simulateRule1Unclick('D-1 Set-1 Matrix', 8) - Test unclick event  
- testDisplayLogic('D-1 Set-1 Matrix', 8) - Test display logic
- startEventMonitoring() - Monitor all sync events

Example usage:
simulateRule1Click('D-1 Set-1 Matrix', 8, 'HR1');
`);
