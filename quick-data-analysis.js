// Quick localStorage data analysis for Rule-1 debugging
// Run this in browser console to check data availability

function quickDataAnalysis() {
  console.log("🔍 QUICK DATA ANALYSIS FOR RULE-1 DEBUG");
  console.log("=".repeat(50));
  
  // Check all localStorage keys
  const allKeys = Object.keys(localStorage);
  console.log(`📊 Total localStorage keys: ${allKeys.length}`);
  
  // Find user data
  const userKeys = allKeys.filter(k => k.includes('users_data'));
  console.log(`👥 User data keys: ${userKeys.length}`, userKeys);
  
  if (userKeys.length > 0) {
    try {
      const userData = JSON.parse(localStorage.getItem(userKeys[0]));
      console.log(`👤 Available users:`, userData.map(u => `${u.id}: ${u.username}`));
    } catch (e) {
      console.log("❌ Error parsing user data");
    }
  }
  
  // Check Excel and Hour data for user 1
  const userId = '1';
  const excelKeys = allKeys.filter(k => k.startsWith('excel_data_') && k.includes(`_${userId}_`));
  const hourKeys = allKeys.filter(k => k.startsWith('hour_entry_') && k.includes(`_${userId}_`));
  
  console.log(`📊 User ${userId} Excel files: ${excelKeys.length}`);
  console.log(`⏰ User ${userId} Hour entries: ${hourKeys.length}`);
  
  // Extract dates
  const excelDates = excelKeys.map(k => k.match(/_(\d{4}-\d{2}-\d{2})$/)?.[1]).filter(Boolean).sort();
  const hourDates = hourKeys.map(k => k.match(/_(\d{4}-\d{2}-\d{2})$/)?.[1]).filter(Boolean).sort();
  const commonDates = excelDates.filter(d => hourDates.includes(d)).sort();
  
  console.log(`📅 Excel dates: [${excelDates.join(', ')}]`);
  console.log(`⏰ Hour dates: [${hourDates.join(', ')}]`);
  console.log(`✅ Common dates: [${commonDates.join(', ')}]`);
  
  // Test window logic for each date
  console.log(`\n🪟 WINDOW ANALYSIS:`);
  commonDates.forEach((date, i) => {
    const sortedDates = [...commonDates];
    const targetIdx = sortedDates.indexOf(date);
    const end = targetIdx + 1;
    const start = Math.max(0, end - 4);
    const window = sortedDates.slice(start, end);
    
    console.log(`📅 ${date} (${i+1}th): idx=${targetIdx}, window=[${window.join(', ')}] (${window.length} dates)`);
    
    if (window.length < 4) {
      console.log(`   ⚠️ Only ${window.length} dates - D column will be missing!`);
    }
  });
  
  // Find the date that would give a proper 4-date window
  const proper4DateWindows = commonDates.filter((date, i) => i >= 3); // 4th date onwards
  console.log(`\n✅ Dates that would give proper 4-date A-B-C-D window: [${proper4DateWindows.join(', ')}]`);
  
  if (proper4DateWindows.length === 0) {
    console.log(`❌ NO dates would give a proper 4-date window! Need at least 4 dates total.`);
  }
  
  return {
    totalKeys: allKeys.length,
    excelDates,
    hourDates,
    commonDates,
    proper4DateWindows
  };
}

// Auto-run
const analysis = quickDataAnalysis();
console.log("\n📋 SUMMARY:", analysis);

// Make available globally
window.quickDataAnalysis = quickDataAnalysis;
