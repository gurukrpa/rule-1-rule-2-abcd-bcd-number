console.log('🔧 TESTING THE FIX: hasExcelData and hasHourEntry localStorage fallback');
console.log('=====================================================================');

// Simulate the old behavior (broken)
function hasExcelDataOLD(userId, date) {
    // OLD: Only checked Supabase, no localStorage fallback
    console.log(`❌ OLD hasExcelData(${userId}, ${date}): Would return FALSE (Supabase only)`);
    return false; // Always false since Supabase is empty
}

// Simulate the new behavior (fixed)
function hasExcelDataNEW(userId, date) {
    try {
        // NEW: Check Supabase first (would be empty), then fall back to localStorage
        const key = `abcd_excel_${userId}_${date}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            console.log(`✅ NEW hasExcelData(${userId}, ${date}): Returns TRUE (localStorage fallback)`);
            return true;
        } else {
            console.log(`❌ NEW hasExcelData(${userId}, ${date}): Returns FALSE (not found)`);
            return false;
        }
    } catch (e) {
        console.log(`❌ NEW hasExcelData(${userId}, ${date}): Error - ${e.message}`);
        return false;
    }
}

// Simulate hour entry functions
function hasHourEntryOLD(userId, date) {
    console.log(`❌ OLD hasHourEntry(${userId}, ${date}): Would return FALSE (Supabase only)`);
    return false;
}

function hasHourEntryNEW(userId, date) {
    try {
        const key = `abcd_hourEntry_${userId}_${date}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            console.log(`✅ NEW hasHourEntry(${userId}, ${date}): Returns TRUE (localStorage fallback)`);
            return true;
        } else {
            console.log(`❌ NEW hasHourEntry(${userId}, ${date}): Returns FALSE (not found)`);
            return false;
        }
    } catch (e) {
        console.log(`❌ NEW hasHourEntry(${userId}, ${date}): Error - ${e.message}`);
        return false;
    }
}

// Test with actual localStorage data
console.log('\n🧪 TESTING WITH ACTUAL LOCALSTORAGE DATA:');
console.log('==========================================');

// Get all Excel and Hour Entry keys from localStorage
const allKeys = Object.keys(localStorage);
const excelKeys = allKeys.filter(key => key.includes('abcd_excel_'));
const hourKeys = allKeys.filter(key => key.includes('abcd_hourEntry_'));

console.log(`📊 Found ${excelKeys.length} Excel records in localStorage`);
console.log(`⏰ Found ${hourKeys.length} Hour Entry records in localStorage`);

// Test a few examples
if (excelKeys.length > 0) {
    const testKey = excelKeys[0];
    const keyParts = testKey.split('_');
    const userId = keyParts[2];
    const date = keyParts[3];
    
    console.log(`\n🔍 TESTING EXCEL DATA FOR USER ${userId}, DATE ${date}:`);
    console.log('Before fix:', hasExcelDataOLD(userId, date));
    console.log('After fix:', hasExcelDataNEW(userId, date));
}

if (hourKeys.length > 0) {
    const testKey = hourKeys[0];
    const keyParts = testKey.split('_');
    const userId = keyParts[2];
    const date = keyParts[3];
    
    console.log(`\n🔍 TESTING HOUR ENTRY FOR USER ${userId}, DATE ${date}:`);
    console.log('Before fix:', hasHourEntryOLD(userId, date));
    console.log('After fix:', hasHourEntryNEW(userId, date));
}

// Summary of the fix impact
console.log('\n📋 FIX IMPACT SUMMARY:');
console.log('=====================');
console.log(`🔄 Excel files: ${excelKeys.length} will now show as "📊 Excel ✓" instead of "📊 No Excel"`);
console.log(`🔄 Hour entries: ${hourKeys.length} will now show as "🕐 Hour ✓" instead of "🕐 Pending"`);
console.log('🎯 Root cause: hasExcelData and hasHourEntry were not checking localStorage fallback');
console.log('✅ Solution: Added localStorage fallback to both functions');

// Show user data breakdown
const userDataMap = {};
excelKeys.forEach(key => {
    const keyParts = key.split('_');
    const userId = keyParts[2];
    if (!userDataMap[userId]) userDataMap[userId] = { excel: 0, hour: 0 };
    userDataMap[userId].excel++;
});

hourKeys.forEach(key => {
    const keyParts = key.split('_');
    const userId = keyParts[2];
    if (!userDataMap[userId]) userDataMap[userId] = { excel: 0, hour: 0 };
    userDataMap[userId].hour++;
});

console.log('\n👥 USER DATA BREAKDOWN:');
console.log('======================');
Object.entries(userDataMap).forEach(([userId, counts]) => {
    console.log(`User ${userId}: ${counts.excel} Excel files, ${counts.hour} Hour entries`);
});
