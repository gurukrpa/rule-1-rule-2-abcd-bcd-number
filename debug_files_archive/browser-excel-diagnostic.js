// Browser Console Debug Script - Run this in the browser console
// to check localStorage and diagnose the Excel file display issue

console.log('🔍 EXCEL FILE DISPLAY DIAGNOSTIC');
console.log('================================');
console.log('Copy and paste this script into the browser console on the ABCD page');
console.log('');

// 1. Check localStorage for Excel data
console.log('1️⃣ Checking localStorage for Excel data...');
const localStorageKeys = Object.keys(localStorage);
const excelKeys = localStorageKeys.filter(key => key.includes('excel') || key.includes('abcd'));

console.log(`📦 Found ${excelKeys.length} Excel-related localStorage keys:`);
excelKeys.forEach((key, index) => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    console.log(`   ${index + 1}. ${key}`);
    console.log(`      → Data keys: ${Object.keys(data).join(', ')}`);
    if (data.date) console.log(`      → Date: ${data.date}`);
    if (data.fileName) console.log(`      → File: ${data.fileName}`);
  } catch (e) {
    console.log(`   ${index + 1}. ${key} (parsing error)`);
  }
});

// 2. Check current user selection
console.log('\n2️⃣ Checking current user selection...');
try {
  // Try to access React component state (if available)
  const reactFiber = document.querySelector('#root')._reactInternalInstance ||
                     document.querySelector('#root')._reactInternalFiber ||
                     Object.keys(document.querySelector('#root')).find(key => key.startsWith('__reactInternalInstance'));
  
  console.log('⚠️ React state access requires developer tools or component inspection');
} catch (e) {
  console.log('⚠️ Cannot access React state directly from console');
}

// 3. Check what the current page sees for data
console.log('\n3️⃣ Checking page data visibility...');
console.log('Navigate to the ABCD page and select a user, then check:');
console.log('- How many dates are shown in the dates list?');
console.log('- What user ID is selected?');
console.log('- Do the dates show "📊 No Excel" or "📊 Excel ✓"?');

// 4. Check network requests
console.log('\n4️⃣ Network requests to monitor...');
console.log('Open Network tab and watch for:');
console.log('- Supabase API calls to excel_data table');
console.log('- User selection API calls');
console.log('- hasExcelData function calls');

// 5. Data service debug commands
console.log('\n5️⃣ Data service debug commands...');
console.log('If dataService is available in the page, try:');
console.log('```javascript');
console.log('// Check if dataService exists');
console.log('console.log("DataService:", window.dataService || "Not available");');
console.log('');
console.log('// Check available users');
console.log('// (Replace USER_ID with actual user ID)');
console.log('await dataService.getDates("USER_ID");');
console.log('await dataService.hasExcelData("USER_ID", "2025-01-01");');
console.log('```');

console.log('\n6️⃣ localStorage Excel data checker...');
console.log('Copy this function and run it:');
console.log(`
function checkUserExcelData(userId) {
  console.log('🔍 Checking Excel data for user:', userId);
  const keys = Object.keys(localStorage).filter(key => 
    key.includes('excel') && key.includes(userId)
  );
  
  console.log('Found Excel keys:', keys.length);
  keys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      console.log('Key:', key);
      console.log('Date:', data.date);
      console.log('File:', data.fileName);
      console.log('Sets:', Object.keys(data.data?.sets || {}));
    } catch (e) {
      console.log('Error parsing:', key);
    }
  });
}

// Example usage:
// checkUserExcelData("5019aa9a-a653-49f5-b7da-f5bc9dcde985");
// checkUserExcelData("91b487fb-998f-406b-b002-b28541a3995a");
`);
