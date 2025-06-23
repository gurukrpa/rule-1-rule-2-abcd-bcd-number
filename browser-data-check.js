// 🔍 Quick Data Check - Test if data exists in the system
// Run this in browser console to check for existing data

console.log('🔍 QUICK DATA EXISTENCE CHECK');
console.log('=============================\n');

// Check localStorage for user data
const userId = localStorage.getItem('userId');
console.log('👤 User ID:', userId);

if (!userId) {
  console.log('❌ No user ID found in localStorage');
  console.log('💡 You may need to create a user first');
} else {
  console.log('✅ User ID found:', userId);
}

// Check for any Excel data in localStorage
const excelKeys = Object.keys(localStorage).filter(key => 
  key.includes('excel') || key.includes('Excel') || key.includes('data')
);

console.log('\n📊 Excel Data Keys in localStorage:');
if (excelKeys.length === 0) {
  console.log('❌ No Excel data found in localStorage');
} else {
  excelKeys.forEach(key => {
    console.log('✅', key);
  });
}

// Check for hour data
const hourKeys = Object.keys(localStorage).filter(key => 
  key.includes('hour') || key.includes('Hour') || key.includes('HR')
);

console.log('\n⏰ Hour Data Keys in localStorage:');
if (hourKeys.length === 0) {
  console.log('❌ No Hour data found in localStorage');
} else {
  hourKeys.forEach(key => {
    console.log('✅', key);
  });
}

// Check for any recent dates
const allKeys = Object.keys(localStorage);
const dateKeys = allKeys.filter(key => {
  // Look for date patterns like 2024-12-23 or similar
  return /\d{4}-\d{2}-\d{2}/.test(key);
});

console.log('\n📅 Date-related Keys:');
if (dateKeys.length === 0) {
  console.log('❌ No date-related data found');
} else {
  dateKeys.forEach(key => {
    console.log('✅', key);
  });
}

console.log('\n🎯 SUMMARY:');
console.log('===========');
if (!userId) {
  console.log('❗ ISSUE: No user ID - need to create user first');
} else if (excelKeys.length === 0) {
  console.log('❗ ISSUE: No Excel data - need to upload Excel files first');  
} else if (hourKeys.length === 0) {
  console.log('❗ ISSUE: No Hour data - need to save HR selections first');
} else {
  console.log('✅ Data exists - issue might be in data extraction logic');
}

console.log('\n💡 TO CREATE TEST DATA:');
console.log('1. Go to main page and create a user');
console.log('2. Upload some Excel files');
console.log('3. Save HR selections');
console.log('4. Then try Rule2CompactPage again');
