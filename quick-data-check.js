// Quick localStorage data verification
// Run this in browser console to check if we have test data available

console.log('📊 QUICK DATA VERIFICATION');
console.log('=========================');

// Get all localStorage keys
const allKeys = Object.keys(localStorage);
console.log('🔑 All localStorage keys:', allKeys.length);

// Filter for our app's keys
const appKeys = {
  dates: allKeys.filter(k => k.startsWith('dates_')),
  excel: allKeys.filter(k => k.startsWith('excelData_')),
  hours: allKeys.filter(k => k.startsWith('hourEntry_'))
};

console.log('📋 App data keys:', appKeys);

// Get users
const users = appKeys.dates.map(k => k.replace('dates_', ''));
console.log('👥 Users found:', users);

if (users.length === 0) {
  console.log('❌ NO USERS FOUND');
  console.log('💡 You need to:');
  console.log('  1. Go to http://localhost:5173');
  console.log('  2. Create/select a user');
  console.log('  3. Add at least 4 dates');
  console.log('  4. Upload Excel data for each date');
  console.log('  5. Complete Hour Entry for each date');
  console.log('  6. Then test IndexPage');
} else {
  // Check first user's data
  const testUser = users[0];
  const dates = JSON.parse(localStorage.getItem(`dates_${testUser}`) || '[]');
  
  console.log(`🎯 Test user: ${testUser}`);
  console.log(`📅 Dates (${dates.length}):`, dates);
  
  let completeCount = 0;
  dates.forEach(date => {
    const hasExcel = localStorage.getItem(`excelData_${testUser}_${date}`) !== null;
    const hasHour = localStorage.getItem(`hourEntry_${testUser}_${date}`) !== null;
    const complete = hasExcel && hasHour;
    
    console.log(`📊 ${date}: Excel=${hasExcel ? '✅' : '❌'}, Hour=${hasHour ? '✅' : '❌'}, Complete=${complete ? '✅' : '❌'}`);
    
    if (complete) completeCount++;
  });
  
  console.log(`✅ Complete dates: ${completeCount}/${dates.length}`);
  
  if (completeCount >= 4) {
    console.log('🎉 READY FOR INDEXPAGE TEST!');
    console.log(`🔗 Navigate to: /user/${testUser}/index/${dates[3]}`);
    console.log('👀 Watch console for ABCD-BCD analysis debug logs');
  } else {
    console.log('⚠️ Need at least 4 complete dates for IndexPage analysis');
    console.log('📝 Add more dates with Excel + Hour Entry data');
  }
}

// Test if we're on IndexPage
if (window.location.pathname.includes('/index/')) {
  console.log('🎯 CURRENTLY ON INDEXPAGE');
  console.log('👀 Check console for analysis debug logs');
  console.log('🔍 Look for logs with: 🔍, 🧮, 🎯, 🎨');
} else {
  console.log('📍 Current page:', window.location.pathname);
}
