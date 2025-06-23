// 🔍 IMMEDIATE DEBUG - Paste this in browser console to see what's happening

console.log('🔍 IMMEDIATE ABCD/BCD DATA PIPELINE DEBUG');
console.log('==========================================');

// Check if you're on the right page
if (window.location.href.includes('localhost:5173')) {
  console.log('✅ On localhost development server');
} else {
  console.log('❌ Not on localhost - check URL');
}

// Check for debug logs that should be appearing
console.log('\n📋 EXPECTED DEBUG LOGS TO LOOK FOR:');
console.log('1. "🔍 === DATA PIPELINE DEBUG ==="');
console.log('2. "📊 [date] data: ..."');
console.log('3. "📋 Available set names in data: ..."');
console.log('4. "🔍 Debug extractFromDateAndSet for [date]"');

// Check localStorage for basic data
const userId = localStorage.getItem('userId');
console.log('\n👤 User ID:', userId);

if (userId) {
  const allKeys = Object.keys(localStorage);
  const userKeys = allKeys.filter(key => key.includes(userId));
  
  console.log('\n📊 User-related localStorage keys:');
  userKeys.forEach(key => console.log('  -', key));
  
  // Check for Excel data
  const excelKeys = userKeys.filter(key => key.includes('excel'));
  console.log('\n📋 Excel data keys:', excelKeys.length, 'found');
  
  // Check for hour data
  const hourKeys = userKeys.filter(key => key.includes('hour'));
  console.log('⏰ Hour data keys:', hourKeys.length, 'found');
  
  if (excelKeys.length === 0) {
    console.log('\n❌ ISSUE FOUND: No Excel data in localStorage');
    console.log('💡 SOLUTION: You need to upload Excel files first');
  } else if (hourKeys.length === 0) {
    console.log('\n❌ ISSUE FOUND: No Hour data in localStorage');
    console.log('💡 SOLUTION: You need to save HR selections first');
  } else {
    console.log('\n✅ Basic data exists - issue is in data extraction logic');
    
    // Check one Excel file structure
    const sampleExcelKey = excelKeys[0];
    const sampleData = JSON.parse(localStorage.getItem(sampleExcelKey));
    console.log('\n📋 Sample Excel data structure:');
    console.log('- Has data:', !!sampleData.data);
    console.log('- Has sets:', !!sampleData.data?.sets);
    console.log('- Set names:', Object.keys(sampleData.data?.sets || {}));
    
    // Check one Hour file structure
    const sampleHourKey = hourKeys[0];
    const hourData = JSON.parse(localStorage.getItem(sampleHourKey));
    console.log('\n⏰ Sample Hour data structure:');
    console.log('- Has planetSelections:', !!hourData.planetSelections);
    console.log('- HR keys:', Object.keys(hourData.planetSelections || {}));
  }
} else {
  console.log('\n❌ CRITICAL ISSUE: No user ID found');
  console.log('💡 SOLUTION: Go to main page and create/select a user first');
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. If no user ID: Go to main page and create user');
console.log('2. If no Excel/Hour data: Upload files and save HR selections');
console.log('3. If data exists: Check the debug logs in console when you run Rule2CompactPage');
console.log('4. Report back what you see!');
