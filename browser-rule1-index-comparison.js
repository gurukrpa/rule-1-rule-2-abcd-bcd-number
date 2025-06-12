// Browser console script to debug Rule-1 vs IndexPage data differences
// Copy and paste this into browser console when on the main page

console.log("🔍 Starting Rule-1 vs IndexPage Data Comparison Debug");

function analyzeDataDifference() {
  console.log("=".repeat(80));
  console.log("🔍 RULE-1 vs INDEXPAGE DATA ANALYSIS");
  console.log("=".repeat(80));

  // Step 1: Check what user is currently selected
  let currentUser = null;
  try {
    // Try to find user selection in the page
    const userSelects = document.querySelectorAll('select');
    for (let select of userSelects) {
      if (select.value && select.value !== '') {
        currentUser = select.value;
        console.log(`👤 Found selected user: ${currentUser}`);
        break;
      }
    }
    
    if (!currentUser) {
      // Try to get from any visible text
      const userTexts = document.querySelectorAll('*');
      for (let el of userTexts) {
        if (el.textContent && el.textContent.includes('User:')) {
          const match = el.textContent.match(/User:\s*(.+?)(?:\s|$)/);
          if (match) {
            currentUser = match[1];
            console.log(`👤 Found user from text: ${currentUser}`);
            break;
          }
        }
      }
    }
    
    if (!currentUser) {
      currentUser = '1'; // Default fallback
      console.log(`👤 Using default user: ${currentUser}`);
    }
  } catch (e) {
    currentUser = '1';
    console.log(`👤 Error finding user, using default: ${currentUser}`);
  }

  // Step 2: Get all available dates for this user
  function getAllUserDates(userId) {
    console.log(`📅 Analyzing dates for user ${userId}...`);
    
    // Get all localStorage keys for this user
    const allKeys = Object.keys(localStorage);
    
    // Excel data keys
    const excelKeys = allKeys.filter(key => 
      key.startsWith('excel_data_') && key.includes(`_${userId}_`)
    );
    
    // Hour entry keys  
    const hourKeys = allKeys.filter(key => 
      key.startsWith('hour_entry_') && key.includes(`_${userId}_`)
    );
    
    console.log(`📊 Found ${excelKeys.length} Excel files, ${hourKeys.length} Hour entries`);
    
    // Extract dates
    const excelDates = excelKeys.map(key => {
      const match = key.match(/_(\d{4}-\d{2}-\d{2})$/);
      return match ? match[1] : null;
    }).filter(Boolean);
    
    const hourDates = hourKeys.map(key => {
      const match = key.match(/_(\d{4}-\d{2}-\d{2})$/);
      return match ? match[1] : null;
    }).filter(Boolean);
    
    // Find dates with BOTH Excel and Hour data
    const commonDates = excelDates.filter(date => hourDates.includes(date));
    const sortedDates = commonDates.sort((a, b) => new Date(a) - new Date(b));
    
    console.log(`📅 Excel dates: [${excelDates.sort().join(', ')}]`);
    console.log(`⏰ Hour dates: [${hourDates.sort().join(', ')}]`);
    console.log(`✅ Common dates (both): [${sortedDates.join(', ')}]`);
    
    return {
      excelDates: excelDates.sort(),
      hourDates: hourDates.sort(),
      commonDates: sortedDates,
      sortedDates
    };
  }

  // Step 3: Simulate IndexPage window logic
  function simulateIndexPageWindow(datesList, clickedDate) {
    console.log(`🪟 Simulating IndexPage window for clicked date: ${clickedDate}`);
    console.log(`📊 Available dates: [${datesList.join(', ')}]`);
    
    const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
    const targetIdx = sortedDates.indexOf(clickedDate);
    
    console.log(`🎯 Target date "${clickedDate}" found at index: ${targetIdx}`);
    
    let windowDates;
    if (targetIdx === -1) {
      windowDates = sortedDates.slice(-4);
      console.log(`⚠️ Date not found, using last 4: [${windowDates.join(', ')}]`);
    } else {
      const end = targetIdx + 1;
      const start = Math.max(0, end - 4);
      windowDates = sortedDates.slice(start, end);
      console.log(`✅ Window slice(${start}, ${end}): [${windowDates.join(', ')}]`);
    }
    
    const labels = windowDates.map((d, i) => ['A', 'B', 'C', 'D'][i]);
    console.log(`🏷️ A-B-C-D labels: [${labels.join(', ')}]`);
    
    return {
      sortedDates,
      targetIdx,
      windowDates,
      labels,
      mapping: windowDates.map((d, i) => `${labels[i]}=${d}`)
    };
  }

  // Step 4: Check what date would be clicked (latest date)
  const dateData = getAllUserDates(currentUser);
  
  if (dateData.commonDates.length === 0) {
    console.log("❌ No dates with both Excel and Hour data found!");
    return;
  }
  
  // Test with the latest date (most likely to be clicked in Rule-1)
  const latestDate = dateData.commonDates[dateData.commonDates.length - 1];
  console.log(`📅 Testing with latest date: ${latestDate}`);
  
  const indexPageWindow = simulateIndexPageWindow(dateData.commonDates, latestDate);
  
  // Step 5: Compare with Rule-1 expected behavior
  console.log("\n" + "=".repeat(60));
  console.log("🆚 RULE-1 vs INDEXPAGE COMPARISON");
  console.log("=".repeat(60));
  
  console.log(`📊 IndexPage would show:`);
  console.log(`   Dates: [${indexPageWindow.windowDates.join(', ')}]`);
  console.log(`   Labels: [${indexPageWindow.labels.join(', ')}]`);
  console.log(`   Mapping: [${indexPageWindow.mapping.join(', ')}]`);
  
  console.log(`📊 Rule-1 should show the SAME data if:`);
  console.log(`   - Same user: ${currentUser}`);
  console.log(`   - Same clicked date: ${latestDate}`);
  console.log(`   - Same datesList: [${dateData.commonDates.join(', ')}]`);
  
  // Step 6: Look for actual Rule-1 data in console logs
  console.log("\n📝 NEXT STEPS:");
  console.log("1. Navigate to Rule-1 page and check console logs");
  console.log("2. Compare the logged window dates with IndexPage expected dates");
  console.log("3. If different, check why Rule-1 date/datesList differs");
  
  // Step 7: Test different scenarios
  console.log("\n🧪 TESTING OTHER DATES:");
  for (let i = Math.max(0, dateData.commonDates.length - 3); i < dateData.commonDates.length; i++) {
    const testDate = dateData.commonDates[i];
    const window = simulateIndexPageWindow(dateData.commonDates, testDate);
    console.log(`📅 ${testDate} → [${window.windowDates.join(', ')}] → [${window.labels.join(', ')}]`);
  }
  
  return {
    currentUser,
    dateData,
    latestDate,
    indexPageWindow,
    testResults: "Check console above for detailed analysis"
  };
}

// Auto-run the analysis
const result = analyzeDataDifference();
console.log("\n✅ Analysis complete! Result:", result);

// Helper function to manually test any date
window.testRule1Date = function(date) {
  console.log(`🧪 Manual test for date: ${date}`);
  const dateData = getAllUserDates(result.currentUser);
  return simulateIndexPageWindow(dateData.commonDates, date);
};

console.log("\n💡 Usage:");
console.log("- Run: analyzeDataDifference() to re-run analysis");
console.log("- Run: testRule1Date('2025-06-02') to test specific date");
