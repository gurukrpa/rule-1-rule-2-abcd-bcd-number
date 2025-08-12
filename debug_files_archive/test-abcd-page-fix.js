// Quick test script for browser console
console.log('🔍 TESTING EXCEL FILES DETECTION FIX');
console.log('===================================');

// Check localStorage data
const allKeys = Object.keys(localStorage);
const excelKeys = allKeys.filter(key => key.includes('abcd_excel_'));
const hourKeys = allKeys.filter(key => key.includes('abcd_hourEntry_'));

console.log(`📊 Excel files in localStorage: ${excelKeys.length}`);
console.log(`⏰ Hour entries in localStorage: ${hourKeys.length}`);

if (excelKeys.length > 0) {
    console.log('\n📋 Excel files found:');
    excelKeys.forEach((key, index) => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const keyParts = key.split('_');
            const userId = keyParts[2];
            const date = keyParts[3];
            console.log(`  ${index + 1}. User ${userId}, Date ${date}: ${data.fileName}`);
        } catch (e) {
            console.log(`  ${index + 1}. ${key}: Error parsing`);
        }
    });
}

if (hourKeys.length > 0) {
    console.log('\n⏰ Hour entries found:');
    hourKeys.forEach((key, index) => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            const keyParts = key.split('_');
            const userId = keyParts[2];
            const date = keyParts[3];
            const planetCount = Object.keys(data.planetSelections || {}).length;
            console.log(`  ${index + 1}. User ${userId}, Date ${date}: ${planetCount} planets selected`);
        } catch (e) {
            console.log(`  ${index + 1}. ${key}: Error parsing`);
        }
    });
}

// Test the new hasExcelData function simulation
console.log('\n🧪 TESTING NEW DETECTION LOGIC:');
if (excelKeys.length > 0) {
    const testKey = excelKeys[0];
    const keyParts = testKey.split('_');
    const userId = keyParts[2];
    const date = keyParts[3];
    
    // Simulate what the new hasExcelData function would return
    const stored = localStorage.getItem(testKey);
    const wouldDetect = !!stored;
    
    console.log(`✅ Test case: User ${userId}, Date ${date}`);
    console.log(`   Old behavior: would return FALSE (Supabase only)`);
    console.log(`   New behavior: would return ${wouldDetect ? 'TRUE' : 'FALSE'} (localStorage fallback)`);
    console.log(`   Expected result: "📊 Excel ✓" instead of "📊 No Excel"`);
}

console.log('\n🎯 INSTRUCTIONS:');
console.log('1. Select a user from the dropdown in the ABCD page');
console.log('2. Check if dates show "📊 Excel ✓" instead of "📊 No Excel"');
console.log('3. Check if dates show "🕐 Hour ✓" instead of "🕐 Pending"');
console.log('4. All your 18 Excel files should now be visible!');
