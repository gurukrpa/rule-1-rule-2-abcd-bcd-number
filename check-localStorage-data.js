#!/usr/bin/env node

/**
 * Check localStorage Data Script
 * Run this in browser console to check what data exists in localStorage
 */

console.log('🔍 CHECKING LOCALSTORAGE DATA FOR ABCD APPLICATION');
console.log('='.repeat(60));

// Get all localStorage keys
const allKeys = Object.keys(localStorage);
const abcdKeys = allKeys.filter(key => 
  key.includes('abcd_') || 
  key.includes('excel') || 
  key.includes('hour') || 
  key.includes('dates')
);

console.log(`📊 Total localStorage keys: ${allKeys.length}`);
console.log(`📋 ABCD-related keys: ${abcdKeys.length}`);
console.log('');

if (abcdKeys.length === 0) {
  console.log('❌ NO ABCD DATA FOUND IN LOCALSTORAGE');
  console.log('');
  console.log('💡 This explains why Rule1Page shows "No data available"');
  console.log('   Both IndexPage and Rule1Page need data to work.');
  console.log('   If IndexPage works but Rule1Page doesn\'t, there might be:');
  console.log('   1. Different data service being used');
  console.log('   2. Different data access patterns');
  console.log('   3. Cached data vs real data issue');
  console.log('');
  console.log('🔧 RECOMMENDED ACTIONS:');
  console.log('   1. Go to main ABCD page and upload Excel files');
  console.log('   2. Complete Hour Entry for each date');
  console.log('   3. Then try Rule1Page again');
} else {
  console.log('✅ FOUND ABCD DATA IN LOCALSTORAGE:');
  console.log('');
  
  // Group keys by type
  const excelKeys = abcdKeys.filter(k => k.includes('excel'));
  const hourKeys = abcdKeys.filter(k => k.includes('hour'));
  const dateKeys = abcdKeys.filter(k => k.includes('dates'));
  const otherKeys = abcdKeys.filter(k => !k.includes('excel') && !k.includes('hour') && !k.includes('dates'));
  
  console.log(`📊 Excel Data Keys (${excelKeys.length}):`);
  excelKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      console.log(`   ${key}`);
      console.log(`     - File: ${data.fileName || 'Unknown'}`);
      console.log(`     - Sets: ${data.data?.sets ? Object.keys(data.data.sets).length : 'None'}`);
      console.log(`     - Date: ${data.date || 'Unknown'}`);
    } catch (e) {
      console.log(`   ${key} - [ERROR: Invalid JSON]`);
    }
  });
  
  console.log(`\n⏰ Hour Entry Keys (${hourKeys.length}):`);
  hourKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      console.log(`   ${key}`);
      console.log(`     - Planet Selections: ${data.planetSelections ? Object.keys(data.planetSelections).length : 'None'} HRs`);
      console.log(`     - Date: ${data.date || 'Unknown'}`);
    } catch (e) {
      console.log(`   ${key} - [ERROR: Invalid JSON]`);
    }
  });
  
  console.log(`\n📅 Date Keys (${dateKeys.length}):`);
  dateKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      console.log(`   ${key}: ${Array.isArray(data) ? data.length + ' dates' : 'Invalid format'}`);
      if (Array.isArray(data)) {
        console.log(`     - Dates: ${data.slice(0, 5).join(', ')}${data.length > 5 ? '...' : ''}`);
      }
    } catch (e) {
      console.log(`   ${key} - [ERROR: Invalid JSON]`);
    }
  });
  
  if (otherKeys.length > 0) {
    console.log(`\n🔧 Other ABCD Keys (${otherKeys.length}):`);
    otherKeys.forEach(key => console.log(`   ${key}`));
  }
  
  // Check for complete data sets
  console.log('\n🔍 CHECKING FOR COMPLETE DATA SETS:');
  const userData = new Map();
  
  // Parse excel data
  excelKeys.forEach(key => {
    const match = key.match(/abcd_excel_(.+)_(.+)/);
    if (match) {
      const [, userId, date] = match;
      if (!userData.has(userId)) userData.set(userId, {});
      if (!userData.get(userId)[date]) userData.get(userId)[date] = {};
      userData.get(userId)[date].excel = true;
    }
  });
  
  // Parse hour data
  hourKeys.forEach(key => {
    const match = key.match(/abcd_hourEntry_(.+)_(.+)/);
    if (match) {
      const [, userId, date] = match;
      if (!userData.has(userId)) userData.set(userId, {});
      if (!userData.get(userId)[date]) userData.get(userId)[date] = {};
      userData.get(userId)[date].hour = true;
    }
  });
  
  let completeDataSets = 0;
  userData.forEach((dates, userId) => {
    console.log(`\n   User ${userId}:`);
    Object.entries(dates).forEach(([date, data]) => {
      const isComplete = data.excel && data.hour;
      if (isComplete) completeDataSets++;
      console.log(`     ${date}: ${data.excel ? '📊' : '❌'} Excel, ${data.hour ? '⏰' : '❌'} Hour ${isComplete ? '✅' : '❌'}`);
    });
  });
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`   Complete data sets (Excel + Hour): ${completeDataSets}`);
  console.log(`   Total users with data: ${userData.size}`);
  
  if (completeDataSets === 0) {
    console.log('\n⚠️  NO COMPLETE DATA SETS FOUND');
    console.log('   Rule1Page and IndexPage both need BOTH Excel and Hour data');
    console.log('   Upload missing data in the main ABCD page');
  } else {
    console.log('\n✅ COMPLETE DATA SETS AVAILABLE');
    console.log('   Rule1Page should work with this data');
    console.log('   If it doesn\'t, there might be a data access issue');
  }
}

console.log('\n' + '='.repeat(60));
console.log('🏁 LOCALSTORAGE CHECK COMPLETE');

// Export this for use in browser
if (typeof window !== 'undefined') {
  window.checkABCDData = () => {
    // Run the above logic
  };
}
