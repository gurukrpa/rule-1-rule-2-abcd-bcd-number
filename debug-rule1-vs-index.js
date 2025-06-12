// Debug Rule-1 vs IndexPage data comparison
// Run this in browser console when on Rule-1 page

console.log("🔍 Rule-1 vs IndexPage Debug Analysis");

// Check what date was clicked and what datesList is available
function debugRule1Navigation() {
  // Check localStorage for user data and dates
  const usersData = localStorage.getItem('abcd_users_data');
  if (usersData) {
    const users = JSON.parse(usersData);
    console.log("👥 Available users:", users.map(u => ({id: u.id, username: u.username})));
  }

  // Check URL params to see what date was passed
  const url = window.location.href;
  console.log("🔗 Current URL:", url);
  
  // Check if we can access React component state
  const rule1Component = document.querySelector('[data-testid="rule1-page"]') || document.querySelector('.min-h-screen');
  if (rule1Component) {
    console.log("📄 Found Rule-1 page component");
  }

  // Look for any React DevTools data
  try {
    const reactFiber = Object.keys(rule1Component || {}).find(key => key.startsWith('__reactFiber'));
    if (reactFiber) {
      console.log("⚛️ React component found, check props manually");
    }
  } catch (e) {
    console.log("❌ Could not access React internals");
  }

  return {
    url,
    hasUsers: !!usersData,
    timestamp: new Date().toISOString()
  };
}

// Check what dates are available for the current user
function checkAvailableDates(userId) {
  console.log(`📅 Checking dates for user ${userId}`);
  
  // Check Excel data
  const excelKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('excel_data_') && key.includes(`_${userId}_`)
  );
  
  const hourKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('hour_entry_') && key.includes(`_${userId}_`)
  );
  
  console.log("📊 Excel data keys:", excelKeys.length, excelKeys);
  console.log("⏰ Hour entry keys:", hourKeys.length, hourKeys);
  
  // Extract dates from keys
  const excelDates = excelKeys.map(key => {
    const match = key.match(/_(\d{4}-\d{2}-\d{2})$/);
    return match ? match[1] : null;
  }).filter(Boolean);
  
  const hourDates = hourKeys.map(key => {
    const match = key.match(/_(\d{4}-\d{2}-\d{2})$/);
    return match ? match[1] : null;
  }).filter(Boolean);
  
  // Find common dates (dates that have both Excel and Hour data)
  const commonDates = excelDates.filter(date => hourDates.includes(date));
  const sortedDates = commonDates.sort((a, b) => new Date(a) - new Date(b));
  
  console.log("📅 Excel dates:", excelDates.sort());
  console.log("⏰ Hour dates:", hourDates.sort());
  console.log("✅ Common dates (both Excel + Hour):", sortedDates);
  
  return {
    excelDates: excelDates.sort(),
    hourDates: hourDates.sort(),
    commonDates: sortedDates,
    totalCommon: sortedDates.length
  };
}

// Simulate what IndexPage window would be for a given date
function simulateIndexPageWindow(datesList, clickedDate) {
  console.log(`🎯 Simulating IndexPage window for date: ${clickedDate}`);
  console.log(`📊 Available dates: [${datesList.join(', ')}]`);
  
  const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
  const targetIdx = sortedDates.indexOf(clickedDate);
  
  let windowDates;
  if (targetIdx === -1) {
    windowDates = sortedDates.slice(-4);
    console.log("⚠️ Clicked date not found, using last 4 dates");
  } else {
    const end = targetIdx + 1;
    const start = Math.max(0, end - 4);
    windowDates = sortedDates.slice(start, end);
    console.log(`✅ Date found at index ${targetIdx}, window: start=${start}, end=${end}`);
  }
  
  console.log(`🪟 Window dates: [${windowDates.join(', ')}]`);
  console.log(`🏷️ Labels: ${windowDates.map((d, i) => ['A', 'B', 'C', 'D'][i]).join(', ')}`);
  
  return {
    sortedDates,
    targetIdx,
    windowDates,
    labels: windowDates.map((d, i) => ['A', 'B', 'C', 'D'][i])
  };
}

// Main debug function
function runRule1Debug() {
  console.log("🚀 Starting Rule-1 Debug Analysis...");
  
  const navInfo = debugRule1Navigation();
  console.log("📍 Navigation info:", navInfo);
  
  // Try to get current user from URL or localStorage
  let userId = '1'; // Default assumption
  try {
    // Look for user info in current page
    const userElements = document.querySelectorAll('*');
    for (let el of userElements) {
      if (el.textContent && el.textContent.includes('User:')) {
        const userMatch = el.textContent.match(/User:\s*(.+)/);
        if (userMatch) {
          console.log("👤 Found user in page:", userMatch[1]);
        }
      }
    }
  } catch (e) {
    console.log("Could not extract user from page");
  }
  
  const dateInfo = checkAvailableDates(userId);
  console.log("📊 Date analysis:", dateInfo);
  
  if (dateInfo.commonDates.length > 0) {
    // Test with the last common date (most likely to be clicked)
    const testDate = dateInfo.commonDates[dateInfo.commonDates.length - 1];
    console.log(`🧪 Testing with latest date: ${testDate}`);
    
    const windowInfo = simulateIndexPageWindow(dateInfo.commonDates, testDate);
    console.log("🪟 Window simulation:", windowInfo);
  }
  
  return {
    navInfo,
    dateInfo,
    timestamp: new Date().toISOString()
  };
}

// Auto-run
const debugResult = runRule1Debug();
console.log("✅ Debug complete! Check the logs above for analysis.");
console.log("💡 To re-run: runRule1Debug()");
