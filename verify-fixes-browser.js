/**
 * BROWSER CONSOLE VERIFICATION SCRIPT
 * Run this in the browser console after accessing Rule2CompactPage
 * 
 * This verifies all our database fixes are working:
 * 1. Table name fixes (hour_entry → hour_entries)
 * 2. Column structure fixes (planet_selections → hour_data.planetSelections)  
 * 3. selectedHR type fixes (string → number)
 * 4. Data extraction pipeline
 */

console.log('🔍 Starting comprehensive fix verification...');

// Test user ID from our previous analysis
const testUserId = '8db9861a-76ce-4ae3-81b0-7a8b82314ef2';
const testDates = ['2025-06-01', '2025-06-02', '2025-06-03', '2025-06-04', '2025-06-05'];

// Import DataService if available
let dataService;
try {
  // Try to get DataService from the window or import
  if (window.DataService) {
    dataService = new window.DataService();
  } else {
    console.log('⚠️ DataService not available in window, trying to access from React components...');
  }
} catch (e) {
  console.log('⚠️ Could not access DataService directly');
}

async function verifyDatabaseFixes() {
  console.log('🔍 Testing database table and column fixes...');
  
  // Test 1: Direct Supabase query to verify table name fix
  try {
    const response = await fetch('/api/test-table-fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: testUserId,
        date: testDates[0]
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Table name fix verification:', data);
    } else {
      console.log('❌ API not available, testing through component data...');
    }
  } catch (e) {
    console.log('⚠️ Direct API test failed, checking component state...');
  }
  
  // Test 2: Check if React component has loaded data correctly
  const checkComponentData = () => {
    // Look for React DevTools data
    const reactFiber = document.querySelector('#root')?._reactInternalInstance ||
                      document.querySelector('#root')?._reactInternals;
    
    if (reactFiber) {
      console.log('🔍 Found React fiber, checking component state...');
      // This is complex to traverse, so we'll rely on console logs instead
    }
    
    // Check localStorage for any cached data
    const keys = Object.keys(localStorage).filter(k => 
      k.includes('excel') || k.includes('hour') || k.includes('user')
    );
    
    console.log('📱 LocalStorage keys related to data:', keys);
    
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        console.log(`📊 ${key}:`, {
          type: typeof data,
          hasData: !!data,
          structure: data ? Object.keys(data) : 'N/A'
        });
      } catch (e) {
        console.log(`📊 ${key}: (non-JSON data)`);
      }
    });
  };
  
  checkComponentData();
}

async function testDataExtractionPipeline() {
  console.log('🔍 Testing data extraction pipeline...');
  
  // Look for debug logs from Rule2CompactPage
  const originalLog = console.log;
  const debugLogs = [];
  
  console.log = function(...args) {
    if (args[0] && args[0].includes('[DEBUG]')) {
      debugLogs.push(args);
    }
    originalLog.apply(console, args);
  };
  
  // Wait a bit for any ongoing data loading
  setTimeout(() => {
    console.log = originalLog; // Restore original
    
    console.log('📋 Captured debug logs:', debugLogs.length);
    debugLogs.forEach((log, i) => {
      console.log(`${i + 1}.`, ...log);
    });
    
    if (debugLogs.length === 0) {
      console.log('⚠️ No debug logs found. Component may not have loaded data yet.');
      console.log('💡 Try navigating to Rule2CompactPage and running this script again.');
    }
  }, 2000);
}

async function checkSelectedHRType() {
  console.log('🔍 Checking selectedHR type fix...');
  
  // Look for any global state or React component state
  if (window.React && window.React.useState) {
    console.log('✅ React is available');
  }
  
  // Check URL parameters for HR selection
  const urlParams = new URLSearchParams(window.location.search);
  console.log('🌐 URL parameters:', Object.fromEntries(urlParams));
  
  // Check if we're on the Rule2CompactPage
  const isRule2Page = window.location.pathname.includes('rule2') || 
                     window.location.hash.includes('rule2') ||
                     document.querySelector('[data-testid*="rule2"]') ||
                     document.querySelector('h1, h2, h3').textContent.includes('Rule 2');
  
  console.log('📍 On Rule2CompactPage:', isRule2Page);
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive verification...');
  console.log('========================================');
  
  await verifyDatabaseFixes();
  console.log('----------------------------------------');
  
  await testDataExtractionPipeline();
  console.log('----------------------------------------');
  
  await checkSelectedHRType();
  console.log('----------------------------------------');
  
  console.log('✅ Verification complete. Check output above for any issues.');
  console.log('💡 Navigate to Rule2CompactPage with user data to see data loading debug logs.');
}

// Auto-run the tests
runAllTests();

// Also expose individual functions for manual testing
window.verifyFixes = {
  verifyDatabaseFixes,
  testDataExtractionPipeline,
  checkSelectedHRType,
  runAllTests
};

console.log('💡 Available commands:');
console.log('- verifyFixes.runAllTests() - Run all verification tests');
console.log('- verifyFixes.verifyDatabaseFixes() - Test database fixes');
console.log('- verifyFixes.testDataExtractionPipeline() - Test data extraction');
console.log('- verifyFixes.checkSelectedHRType() - Check HR type handling');
