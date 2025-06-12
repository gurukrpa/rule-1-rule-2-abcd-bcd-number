// Quick test for Rule-1 Step 2 - Display Formatted Data
// Run this in browser console after navigating to app

// Test navigation and data display
console.log('🧪 TESTING RULE-1 STEP 2 - Display Formatted Data');

// Check if we're on the main page
if (window.location.pathname === '/') {
  console.log('✅ On main page - checking for users');
  
  // Check for user data
  const userData = localStorage.getItem('abcd_users_data');
  if (userData) {
    const users = JSON.parse(userData);
    console.log('👥 Available users:', users.length);
    
    if (users.length > 0) {
      const testUser = users[0];
      console.log('🎯 Testing with user:', testUser.username, 'ID:', testUser.id);
      
      // Check if user has dates
      const datesKey = `abcd_dates_${testUser.id}`;
      const dates = JSON.parse(localStorage.getItem(datesKey) || '[]');
      console.log('📅 User dates:', dates);
      
      if (dates.length >= 5) {
        const sortedDates = dates.sort((a, b) => new Date(a) - new Date(b));
        const rule1Date = sortedDates[sortedDates.length - 1]; // Latest date
        
        console.log('🔗 Rule-1 available for date:', rule1Date);
        console.log('📋 To test Step 2:');
        console.log(`   1. Navigate to /user/${testUser.id}`);
        console.log(`   2. Click Rule-1 button for date ${rule1Date}`);
        console.log(`   3. Check console for formatted data logs`);
        console.log(`   4. Verify table displays: element-number-/planet-sign format`);
        
        // Auto-navigate if we can
        if (testUser.id) {
          console.log('🚀 Auto-navigating to user page...');
          window.location.href = `/user/${testUser.id}`;
        }
      } else {
        console.log('⚠️ User needs at least 5 dates for Rule-1 testing');
      }
    } else {
      console.log('❌ No users found - need to create test data');
    }
  } else {
    console.log('❌ No user data found');
  }
} else {
  console.log('ℹ️ Not on main page, current path:', window.location.pathname);
  
  // If on user page, look for Rule-1 button
  if (window.location.pathname.includes('/user/')) {
    console.log('👤 On user page - looking for Rule-1 buttons');
    
    // Wait for page to load
    setTimeout(() => {
      const rule1Buttons = document.querySelectorAll('button[title*="Rule-1"], button:contains("Rule-1")');
      console.log('🔍 Found Rule-1 buttons:', rule1Buttons.length);
      
      if (rule1Buttons.length > 0) {
        console.log('✅ Rule-1 buttons available - click one to test Step 2');
      }
    }, 1000);
  }
}

// Helper function to check formatted data in Rule-1 page
window.checkRule1FormattedData = function() {
  console.log('🔍 Checking Rule-1 formatted data...');
  
  // Look for table cells with formatted data
  const tableCells = document.querySelectorAll('table td');
  const formattedDataSamples = [];
  
  tableCells.forEach(cell => {
    const text = cell.textContent.trim();
    // Look for our format: element-number-/planet-sign
    if (text.match(/^\w+-\d+-\/\w+-\w+/)) {
      formattedDataSamples.push(text);
    }
  });
  
  console.log('📊 Formatted data samples found:', formattedDataSamples.length);
  formattedDataSamples.slice(0, 5).forEach((sample, i) => {
    console.log(`   ${i + 1}. ${sample}`);
  });
  
  if (formattedDataSamples.length > 0) {
    console.log('✅ STEP 2 SUCCESS: Formatted data is displaying in table!');
  } else {
    console.log('❌ STEP 2 ISSUE: No formatted data found in table');
    console.log('   Raw data samples:');
    Array.from(tableCells).slice(0, 5).forEach((cell, i) => {
      const text = cell.textContent.trim();
      if (text && text !== '-' && text.length > 5) {
        console.log(`   ${i + 1}. ${text}`);
      }
    });
  }
};

console.log('✨ Script loaded! Use checkRule1FormattedData() on Rule-1 page to verify Step 2');
