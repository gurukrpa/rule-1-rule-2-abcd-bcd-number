#!/usr/bin/env node

/**
 * 🔧 DEBUG: Rule2CompactPage ABCD/BCD Numbers Issue
 * 
 * This script debugs why Rule2CompactPage is not showing ABCD/BCD numbers
 * Run this in the browser console when on Rule2CompactPage
 */

console.log('🔍 DEBUGGING RULE2COMPACTPAGE ABCD/BCD NUMBERS ISSUE');
console.log('=====================================================');

// Check if we're on the Rule2CompactPage
const isRule2CompactPage = window.location.pathname.includes('rule2') || 
                          document.querySelector('[class*="Rule2"]') ||
                          document.querySelector('h1').textContent.includes('Rule-2 Compact');

console.log('📍 On Rule2CompactPage:', isRule2CompactPage);

if (!isRule2CompactPage) {
  console.log('❌ Not on Rule2CompactPage. Please navigate to Rule2CompactPage first.');
  console.log('💡 Click the "Rule-2" button on a 5th+ date to access Rule2CompactPage');
} else {
  console.log('✅ On Rule2CompactPage - proceeding with debug...');
}

// Debug function to check data extraction pipeline
function debugRule2CompactDataPipeline() {
  console.log('\n🔍 DEBUGGING DATA EXTRACTION PIPELINE');
  console.log('=====================================');
  
  // Check if React components are accessible
  try {
    // Look for React Fiber to access component state
    const reactFiber = document.querySelector('#root')._reactInternalInstance || 
                      document.querySelector('#root')._reactInternals ||
                      Object.keys(document.querySelector('#root')).find(key => key.startsWith('__reactInternalInstance'));
    
    if (reactFiber) {
      console.log('✅ React Fiber found - can access component state');
    } else {
      console.log('❌ React Fiber not found - using alternative methods');
    }
  } catch (e) {
    console.log('❌ Error accessing React:', e.message);
  }
  
  // Check for common state indicators
  const stateElements = {
    loadingElement: document.querySelector('[class*="loading"], [class*="spinner"]'),
    errorElement: document.querySelector('[class*="error"]'),
    topicResults: document.querySelectorAll('[class*="topic"], .bg-green-50, .bg-gray-50'),
    abcdElements: document.querySelectorAll('.bg-green-100'),
    bcdElements: document.querySelectorAll('.bg-blue-100'),
    summarySection: document.querySelector('[class*="summary"]')
  };
  
  console.log('\n📊 UI ELEMENT STATUS:');
  console.log('Loading element:', !!stateElements.loadingElement);
  console.log('Error element:', !!stateElements.errorElement);
  console.log('Topic result elements:', stateElements.topicResults.length);
  console.log('ABCD elements (green):', stateElements.abcdElements.length);
  console.log('BCD elements (blue):', stateElements.bcdElements.length);
  console.log('Summary section:', !!stateElements.summarySection);
  
  // Check for error messages
  if (stateElements.errorElement) {
    console.log('\n❌ ERROR FOUND:');
    console.log('Error text:', stateElements.errorElement.textContent);
  }
  
  // Check topic results content
  if (stateElements.topicResults.length > 0) {
    console.log('\n📋 TOPIC RESULTS SAMPLE:');
    Array.from(stateElements.topicResults).slice(0, 3).forEach((element, index) => {
      console.log(`Topic ${index + 1}:`, element.textContent.substring(0, 100) + '...');
    });
  }
  
  return stateElements;
}

// Debug function to check for specific "No D-day numbers" error
function debugDDayNumbersError() {
  console.log('\n🔍 CHECKING FOR "NO D-DAY NUMBERS" ERROR');
  console.log('=========================================');
  
  const errorMessages = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent.includes('No D-day numbers') || 
    el.textContent.includes('Error: No D-day') ||
    el.textContent.includes('No source numbers')
  );
  
  console.log('Error message count:', errorMessages.length);
  
  errorMessages.forEach((element, index) => {
    console.log(`Error ${index + 1}:`, element.textContent);
    console.log('Element:', element);
  });
  
  return errorMessages;
}

// Debug function to check localStorage data
function debugLocalStorageData() {
  console.log('\n🔍 CHECKING LOCALSTORAGE DATA');
  console.log('==============================');
  
  const relevantKeys = Object.keys(localStorage).filter(key => 
    key.includes('excel') || 
    key.includes('hour') || 
    key.includes('user') ||
    key.includes('date')
  );
  
  console.log('Relevant localStorage keys:', relevantKeys.length);
  
  relevantKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      console.log(`${key}:`, {
        exists: !!data,
        type: typeof data,
        keys: data && typeof data === 'object' ? Object.keys(data) : 'N/A'
      });
    } catch (e) {
      console.log(`${key}: (parsing error)`, localStorage.getItem(key)?.substring(0, 50));
    }
  });
  
  return relevantKeys;
}

// Check browser console for React errors
function checkBrowserConsoleErrors() {
  console.log('\n🔍 CHECKING FOR CONSOLE ERRORS');
  console.log('===============================');
  
  // Save original console.error to capture errors
  const originalError = console.error;
  const capturedErrors = [];
  
  console.error = function(...args) {
    capturedErrors.push(args);
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.log('Captured errors in last few seconds:', capturedErrors.length);
    capturedErrors.forEach((error, index) => {
      console.log(`Error ${index + 1}:`, error);
    });
    
    // Restore original console.error
    console.error = originalError;
  }, 3000);
}

// Main debug function
function runFullRule2CompactDebug() {
  console.log('\n🚀 STARTING FULL RULE2COMPACT DEBUG');
  console.log('===================================');
  
  const uiElements = debugRule2CompactDataPipeline();
  const errorMessages = debugDDayNumbersError();
  const storageKeys = debugLocalStorageData();
  
  checkBrowserConsoleErrors();
  
  console.log('\n📋 DEBUG SUMMARY:');
  console.log('=================');
  console.log('✅ UI Elements found:', Object.values(uiElements).filter(Boolean).length > 0);
  console.log('❌ Error messages found:', errorMessages.length);
  console.log('💾 localStorage keys found:', storageKeys.length);
  
  if (errorMessages.length > 0) {
    console.log('\n🎯 LIKELY ISSUE: Data extraction pipeline failure');
    console.log('💡 Check that Excel and Hour Entry data exists for the 4 ABCD dates');
  } else if (uiElements.topicResults.length === 0) {
    console.log('\n🎯 LIKELY ISSUE: Component not rendering properly');
    console.log('💡 Check React component state and props');
  } else {
    console.log('\n✅ No obvious issues found - data might be loading correctly');
  }
  
  return {
    uiElements,
    errorMessages,
    storageKeys
  };
}

// Auto-run if we're on Rule2CompactPage
if (isRule2CompactPage) {
  setTimeout(() => {
    runFullRule2CompactDebug();
  }, 2000); // Wait 2 seconds for component to load
}

// Export for manual use
window.debugRule2Compact = runFullRule2CompactDebug;
window.debugDDayError = debugDDayNumbersError;
window.debugDataPipeline = debugRule2CompactDataPipeline;

console.log('\n💡 MANUAL USAGE:');
console.log('================');
console.log('🔧 debugRule2Compact() - Run full debug');
console.log('🔧 debugDDayError() - Check for D-day errors');
console.log('🔧 debugDataPipeline() - Check data extraction');
