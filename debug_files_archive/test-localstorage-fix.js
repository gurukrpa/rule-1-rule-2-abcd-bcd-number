// Test script for localStorage fallback fix
// Run this in browser console to test the Excel display fix

console.log('🔧 TESTING LOCALSTORAGE FALLBACK FIX');
console.log('==================================');

// Function to test the fix
async function testLocalStorageFallback() {
  console.log('1️⃣ Testing hasExcelData vs getExcelData consistency...');
  
  // Check what's in localStorage
  const localStorageKeys = Object.keys(localStorage);
  const excelKeys = localStorageKeys.filter(key => key.includes('excel') && key.includes('abcd'));
  const hourKeys = localStorageKeys.filter(key => key.includes('hourEntry') && key.includes('abcd'));
  
  console.log(`📦 Found ${excelKeys.length} Excel keys in localStorage`);
  console.log(`📦 Found ${hourKeys.length} Hour Entry keys in localStorage`);
  
  if (excelKeys.length === 0) {
    console.log('⚠️ No Excel data in localStorage - this might be why you see only 2 files');
    console.log('💡 Try uploading an Excel file first, then run this test again');
    return;
  }
  
  // Test the first Excel key
  const testExcelKey = excelKeys[0];
  console.log(`🧪 Testing with key: ${testExcelKey}`);
  
  // Extract userId and date from key pattern: abcd_excel_${userId}_${date}
  const parts = testExcelKey.split('_');
  if (parts.length >= 4) {
    const userId = parts[2];
    const date = parts[3];
    
    console.log(`👤 User ID: ${userId}`);
    console.log(`📅 Date: ${date}`);
    
    // Test if dataService is available
    if (typeof window.dataService !== 'undefined') {
      console.log('✅ DataService found, testing hasExcelData vs getExcelData...');
      
      try {
        const hasExcel = await window.dataService.hasExcelData(userId, date);
        const getExcel = await window.dataService.getExcelData(userId, date);
        
        console.log(`📊 hasExcelData result: ${hasExcel}`);
        console.log(`📊 getExcelData result: ${getExcel ? 'Found data' : 'No data'}`);
        
        if (!hasExcel && getExcel) {
          console.log('❌ MISMATCH DETECTED: hasExcelData = false but getExcelData = found data');
          console.log('🔧 This was the bug causing "No Excel" display');
        } else if (hasExcel && getExcel) {
          console.log('✅ FIXED: Both functions agree that data exists');
        } else if (!hasExcel && !getExcel) {
          console.log('✅ Consistent: Both functions agree no data exists');
        }
        
      } catch (error) {
        console.error('❌ Test failed:', error);
      }
    } else {
      console.log('⚠️ DataService not available in window scope');
      console.log('💡 This test should be run on the ABCD page where dataService is loaded');
    }
  } else {
    console.log('❌ Could not parse localStorage key format');
  }
}

// Test localStorage data access directly
function testLocalStorageDirectly() {
  console.log('\n2️⃣ Testing localStorage access directly...');
  
  const excelKeys = Object.keys(localStorage).filter(key => key.includes('excel') && key.includes('abcd'));
  
  excelKeys.slice(0, 5).forEach((key, index) => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      console.log(`${index + 1}. ${key}`);
      console.log(`   File: ${data.fileName}`);
      console.log(`   Date: ${data.date}`);
      console.log(`   Sets: ${Object.keys(data.data?.sets || {}).length} topics`);
    } catch (e) {
      console.log(`${index + 1}. ${key} (parsing error)`);
    }
  });
  
  if (excelKeys.length > 5) {
    console.log(`... and ${excelKeys.length - 5} more Excel files`);
  }
}

// Run tests
testLocalStorageDirectly();
testLocalStorageFallback();

console.log('\n📋 SUMMARY:');
console.log('If the fix worked, you should now see "📊 Excel ✓" for dates that have Excel data in localStorage');
console.log('Refresh the ABCD page and check if more Excel files are now showing as uploaded');
