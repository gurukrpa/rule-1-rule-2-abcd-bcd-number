/**
 * RULE2COMPACTPAGE VERIFICATION SCRIPT
 * Copy and paste this into the browser console when on Rule2CompactPage
 * This will verify that our database fixes are working in the UI
 */

console.log('🚀 RULE2COMPACTPAGE VERIFICATION STARTING...');
console.log('==============================================');

// Test configuration
const testUserId = '8db9861a-76ce-4ae3-81b0-7a8b82314ef2';
const testDates = ['2025-06-01', '2025-06-02', '2025-06-03', '2025-06-04', '2025-06-05'];

// 1. Verify we're on the right page
console.log('\n1️⃣ Page Verification:');
const pageInfo = {
  url: window.location.href,
  pathname: window.location.pathname,
  hash: window.location.hash,
  title: document.title,
  hasRule2Content: document.body.textContent.includes('Rule 2') || 
                   document.body.textContent.includes('ABCD') ||
                   document.body.textContent.includes('BCD'),
  hasCompactPage: !!document.querySelector('[class*="compact"]') || 
                  document.body.textContent.includes('Compact')
};
console.log('📍 Page Info:', pageInfo);

// 2. Check for React DevTools and component state
console.log('\n2️⃣ React Component Verification:');
const reactInfo = {
  reactAvailable: !!window.React,
  reactDevToolsAvailable: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
  hasReactRoot: !!document.querySelector('#root')?._reactInternals
};
console.log('⚛️ React Info:', reactInfo);

// 3. Monitor console for our debug logs
console.log('\n3️⃣ Debug Log Monitor:');
let debugLogsFound = [];
const originalLog = console.log;

// Temporarily capture debug logs
const logCapture = function(...args) {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('[DEBUG]')) {
    debugLogsFound.push({
      timestamp: new Date().toISOString(),
      message: args[0],
      data: args[1]
    });
  }
  originalLog.apply(console, args);
};

console.log = logCapture;

// Restore after 5 seconds and report
setTimeout(() => {
  console.log = originalLog;
  
  console.log('\n📊 Debug Logs Captured:', debugLogsFound.length);
  debugLogsFound.forEach((log, i) => {
    console.log(`${i + 1}. [${log.timestamp}] ${log.message}`);
    if (log.data) {
      console.log('   Data:', log.data);
    }
  });
  
  if (debugLogsFound.length === 0) {
    console.log('⚠️ No debug logs found. This could mean:');
    console.log('   - Component hasn\'t loaded data yet');
    console.log('   - Not on Rule2CompactPage');
    console.log('   - User/date selection hasn\'t triggered data loading');
  }
}, 5000);

// 4. Check localStorage for cached data
console.log('\n4️⃣ LocalStorage Data Check:');
const localStorageData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.includes('excel') || key.includes('hour') || key.includes('user') || key.includes('date')) {
    try {
      localStorageData[key] = JSON.parse(localStorage.getItem(key));
    } catch (e) {
      localStorageData[key] = localStorage.getItem(key);
    }
  }
}
console.log('💾 Relevant localStorage:', Object.keys(localStorageData));

// 5. Check for error messages in the UI
console.log('\n5️⃣ UI Error Check:');
const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .text-red-500, .text-red-600');
const errorTexts = Array.from(errorElements).map(el => el.textContent.trim()).filter(text => text.length > 0);
console.log('🚨 Error messages found:', errorTexts);

// 6. Look for ABCD/BCD number displays
console.log('\n6️⃣ ABCD/BCD Number Display Check:');
const numberDisplays = Array.from(document.querySelectorAll('*')).filter(el => {
  const text = el.textContent;
  return text.includes('ABCD') || text.includes('BCD') || text.includes('Numbers');
}).map(el => ({
  tag: el.tagName,
  className: el.className,
  text: el.textContent.substring(0, 100) + (el.textContent.length > 100 ? '...' : '')
}));
console.log('🔢 Number displays found:', numberDisplays.length);
numberDisplays.slice(0, 5).forEach((display, i) => {
  console.log(`${i + 1}. ${display.tag}.${display.className}: ${display.text}`);
});

// 7. Check if data loading is in progress
console.log('\n7️⃣ Loading State Check:');
const loadingIndicators = {
  progressBars: document.querySelectorAll('[class*="progress"], [role="progressbar"]').length,
  spinners: document.querySelectorAll('[class*="spin"], [class*="loading"]').length,
  loadingText: Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent.includes('Loading') || el.textContent.includes('Analyzing')
  ).length
};
console.log('⏳ Loading indicators:', loadingIndicators);

// 8. Manual data service test
console.log('\n8️⃣ Manual DataService Test:');
if (window.DataService) {
  console.log('📊 DataService available, testing...');
  const dataService = new window.DataService();
  
  // Test data retrieval
  Promise.all([
    dataService.getExcelData(testUserId, testDates[0]).catch(e => ({ error: e.message })),
    dataService.getHourEntry(testUserId, testDates[0]).catch(e => ({ error: e.message }))
  ]).then(([excelResult, hourResult]) => {
    console.log('📊 Manual test results:', {
      excel: excelResult ? {
        hasData: !!excelResult,
        hasSets: !!excelResult.sets,
        error: excelResult.error
      } : 'No data',
      hour: hourResult ? {
        hasData: !!hourResult,
        hasPlanetSelections: !!hourResult.planetSelections,
        error: hourResult.error
      } : 'No data'
    });
  });
} else {
  console.log('⚠️ DataService not available in window scope');
}

console.log('\n✅ VERIFICATION COMPLETE');
console.log('========================');
console.log('💡 If you see debug logs above, our fixes are working!');
console.log('💡 If no debug logs, try selecting a user and date range.');
console.log('💡 Navigate to Rule2CompactPage if not already there.');
