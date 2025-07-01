#!/usr/bin/env node
// Debug Rule-2 Missing Topics - Real-Time Investigation
// This script analyzes why only 14 topics appear instead of 30

console.log('🔍 RULE-2 MISSING TOPICS - REAL-TIME INVESTIGATION');
console.log('='.repeat(70));

console.log('📊 CURRENT SITUATION:');
console.log('• Only 14 topics showing instead of expected 30');
console.log('• Missing: D-3, D-5, D-7, D-10, D-12, D-27, D-30, D-60 series');
console.log('• Present: D-1, D-4, D-9, D-11, D-81, D-108, D-144 series');

console.log('\n✅ FIXES ALREADY APPLIED:');
console.log('• Topic name standardization (removed annotations)');
console.log('• Natural topic sorting');
console.log('• ABCD/BCD fallback enhancement');
console.log('• Rule2AnalysisService.js topic list updated');
console.log('• Rule1Page_Enhanced.jsx topic list updated');

console.log('\n🎯 POSSIBLE ROOT CAUSES:');
console.log('1. ❌ Excel data missing for certain D-X topics');
console.log('2. ❌ Hour Entry data missing for trigger date');
console.log('3. ❌ Data extraction filtering out topics with no numbers');
console.log('4. ❌ Cache issues preventing updated topic list from loading');
console.log('5. ❌ Different service being used that still has old topic names');

console.log('\n🔍 DEBUGGING STEPS TO PERFORM:');

console.log('\n📋 1. CHECK EXCEL DATA AVAILABILITY:');
console.log('In browser console, run:');
console.log('```javascript');
console.log('// Check what topics exist in Excel data for D-day');
console.log('const dDay = "2025-06-26"; // Your trigger date');
console.log('const userId = "your-user-id";');
console.log('');
console.log('// Check localStorage for Excel data');
console.log('const excelKey = `excel_data_${userId}_${dDay}`;');
console.log('const excelData = JSON.parse(localStorage.getItem(excelKey) || "null");');
console.log('');
console.log('if (excelData?.sets) {');
console.log('  console.log("📊 Available topics in Excel data:", Object.keys(excelData.sets));');
console.log('  console.log("📊 Total topics found:", Object.keys(excelData.sets).length);');
console.log('  ');
console.log('  // Check specifically for missing topics');
console.log('  const missingTopics = ["D-3 Set-1 Matrix", "D-3 Set-2 Matrix", "D-5 Set-1 Matrix", "D-5 Set-2 Matrix"];');
console.log('  missingTopics.forEach(topic => {');
console.log('    const exists = Object.keys(excelData.sets).includes(topic);');
console.log('    console.log(`🔍 ${topic}: ${exists ? "✅ FOUND" : "❌ MISSING"}`);');
console.log('  });');
console.log('} else {');
console.log('  console.log("❌ No Excel data found for", dDay);');
console.log('}');
console.log('```');

console.log('\n📋 2. CHECK HOUR ENTRY DATA:');
console.log('```javascript');
console.log('// Check Hour Entry data');
console.log('const hourKey = `hour_entries_${userId}_${dDay}`;');
console.log('const hourData = JSON.parse(localStorage.getItem(hourKey) || "null");');
console.log('');
console.log('if (hourData?.planetSelections) {');
console.log('  console.log("🕐 Available HR periods:", Object.keys(hourData.planetSelections));');
console.log('  console.log("🕐 Hour data exists: ✅");');
console.log('} else {');
console.log('  console.log("❌ No Hour Entry data found for", dDay);');
console.log('}');
console.log('```');

console.log('\n📋 3. CHECK RULE2 ANALYSIS SERVICE:');
console.log('```javascript');
console.log('// In browser console during Rule-2 analysis, look for these logs:');
console.log('// "🔍 getAllAvailableSets for [date]:"');
console.log('// "✅ Filtered available sets:"');
console.log('// These logs will show exactly which topics are being filtered');
console.log('```');

console.log('\n📋 4. CHECK CACHING ISSUES:');
console.log('Hard refresh the browser:');
console.log('• Windows/Linux: Ctrl + Shift + R');
console.log('• Mac: Cmd + Shift + R');
console.log('• Or clear localStorage: localStorage.clear()');

console.log('\n📋 5. CHECK DATA UPLOAD STATUS:');
console.log('• Ensure Excel file contains ALL 30 D-X topics');
console.log('• Ensure Hour Entry data uploaded for trigger date');
console.log('• Check if missing topics have actual planet data');

console.log('\n🎯 MOST LIKELY CAUSES:');
console.log('1. 🎯 Excel data only contains 14 topics, not 30');
console.log('2. 🎯 Topics exist but have no planet data (empty sets)');
console.log('3. 🎯 Date-specific issue - some dates have more topics than others');

console.log('\n💡 QUICK TEST:');
console.log('Try Rule-2 analysis on a different date to see if:');
console.log('• Same 14 topics appear (system-wide filtering)');
console.log('• Different topic count appears (date-specific data issue)');

console.log('\n🚀 NEXT STEPS:');
console.log('1. Run the browser console checks above');
console.log('2. Report back the results');
console.log('3. We can then target the specific root cause');

console.log('\n📊 EXPECTED vs ACTUAL:');
console.log('Expected 30 topics: D-1, D-3, D-4, D-5, D-7, D-9, D-10, D-11, D-12, D-27, D-30, D-60, D-81, D-108, D-144 (×2 each)');
console.log('Actual 14 topics: D-1, D-4, D-9, D-11, D-81, D-108, D-144 (×2 each)');
console.log('Missing: D-3, D-5, D-7, D-10, D-12, D-27, D-30, D-60 (×2 each = 16 topics)');

console.log('\n='.repeat(70));
