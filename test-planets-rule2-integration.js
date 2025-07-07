// Test Rule-2 Integration in PlanetsAnalysisPage
// Copy and paste this into browser console to test the functionality

console.log('🧪 Testing PlanetsAnalysisPage Rule-2 Integration...');

// 1. Check if the page loaded without errors
const planetsPageElements = {
  dateGrid: document.querySelector('[class*="grid"][class*="gap-2"]'),
  statusIndicator: document.querySelector('[class*="rounded-full"]'),
  hrTabs: document.querySelector('[class*="flex-wrap"]'),
  excelUpload: document.querySelector('input[type="file"]'),
  analysisResults: document.querySelector('[class*="planets"]') || document.querySelector('[class*="analysis"]')
};

console.log('📋 Page Elements Check:', {
  dateGrid: !!planetsPageElements.dateGrid,
  statusIndicator: !!planetsPageElements.statusIndicator,
  hrTabs: !!planetsPageElements.hrTabs,
  excelUpload: !!planetsPageElements.excelUpload,
  analysisResults: !!planetsPageElements.analysisResults
});

// 2. Check for JavaScript errors
const errorMessages = [];
const originalError = console.error;
console.error = function(...args) {
  errorMessages.push(args.join(' '));
  originalError.apply(console, args);
};

// 3. Look for Rule-2 related log messages
const rule2Logs = [];
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  if (message.includes('Rule-2') || message.includes('[PlanetsAnalysis]')) {
    rule2Logs.push(message);
  }
  originalLog.apply(console, args);
};

// 4. Check if state looks correct (if React DevTools available)
setTimeout(() => {
  console.log('📊 Test Results after 3 seconds:');
  console.log('  ✅ Errors:', errorMessages.length === 0 ? 'None' : errorMessages);
  console.log('  📡 Rule-2 Logs:', rule2Logs.length > 0 ? rule2Logs : 'No Rule-2 activity detected');
  
  // Restore original functions
  console.error = originalError;
  console.log = originalLog;
  
  console.log('🎯 Next Steps:');
  console.log('  1. Select a user with data');
  console.log('  2. Choose a date in position 4+');
  console.log('  3. Select an HR period');
  console.log('  4. Upload Excel file to see ABCD/BCD badges');
}, 3000);

console.log('✅ Test script loaded. Results will appear in 3 seconds...');
