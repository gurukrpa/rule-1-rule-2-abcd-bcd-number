// Debug script to run in browser console to check IndexPage state
// Run this after navigating to the Index page

console.log('🔍 DEBUGGING INDEXPAGE COLOR CODING ISSUE');
console.log('==========================================');

// Check if we're on the IndexPage
if (window.location.pathname.includes('index') || document.title.includes('Index')) {
  console.log('✅ On IndexPage');
  
  // Check localStorage data
  console.log('📊 LocalStorage Data Check:');
  const userIds = Object.keys(localStorage).filter(key => 
    key.startsWith('dates_') || 
    key.startsWith('excelData_') || 
    key.startsWith('hourEntry_')
  );
  
  console.log('🔑 Found localStorage keys:', userIds);
  
  // Check for specific user data
  const testUserId = userIds.find(key => key.startsWith('dates_'))?.replace('dates_', '');
  if (testUserId) {
    console.log(`👤 Test User ID: ${testUserId}`);
    
    const datesKey = `dates_${testUserId}`;
    const dates = JSON.parse(localStorage.getItem(datesKey) || '[]');
    console.log('📅 Available dates:', dates);
    
    // Check data for each date
    dates.forEach(date => {
      const excelKey = `excelData_${testUserId}_${date}`;
      const hourKey = `hourEntry_${testUserId}_${date}`;
      
      const excelData = localStorage.getItem(excelKey);
      const hourData = localStorage.getItem(hourKey);
      
      console.log(`📊 Data for ${date}:`, {
        hasExcel: !!excelData,
        hasHour: !!hourData,
        excelSets: excelData ? Object.keys(JSON.parse(excelData)?.data?.sets || {}) : [],
        hourPlanets: hourData ? Object.keys(JSON.parse(hourData)?.planetSelections || {}) : []
      });
    });
  }
  
  // Check React component state if available
  if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    console.log('🔍 Attempting to access React component state...');
    // This is a bit hacky but might work for debugging
    const reactFiber = document.querySelector('[data-reactroot]')?._reactInternalFiber ||
                       document.querySelector('#root')?._reactInternalFiber;
    if (reactFiber) {
      console.log('⚛️ Found React fiber, but state inspection is complex in production');
    }
  }
  
} else {
  console.log('❌ Not on IndexPage - navigate to Index page first');
  console.log('Current path:', window.location.pathname);
}

console.log('🎯 Next steps:');
console.log('1. Navigate to a user');
console.log('2. Click on a date to open IndexPage');
console.log('3. Check console for debug logs');
console.log('4. Look for ABCD-BCD analysis logs');
