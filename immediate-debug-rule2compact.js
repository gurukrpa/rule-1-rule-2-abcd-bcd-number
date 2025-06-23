// 🚨 IMMEDIATE RULE2COMPACTPAGE DEBUGGING SCRIPT
// Copy this into browser console while on Rule2CompactPage to diagnose the issue

console.log("🔍 IMMEDIATE DEBUGGING - Rule2CompactPage ABCD/BCD Issue");
console.log("=========================================================");

// 1. Check if dateDataCache exists and has data
console.log("\n📊 1. DateDataCache Status:");
if (typeof dateDataCache !== 'undefined') {
  console.log("✅ dateDataCache found");
  console.log("📈 Cache size:", dateDataCache.size);
  
  if (dateDataCache.size > 0) {
    const dates = Array.from(dateDataCache.keys());
    console.log("📅 Cached dates:", dates);
    
    // Check first date's data structure
    const firstDate = dates[0];
    const data = dateDataCache.get(firstDate);
    console.log(`📋 Sample data for ${firstDate}:`, data);
    
    if (data && data.sets) {
      console.log("📁 Available sets:", Object.keys(data.sets));
    } else {
      console.error("❌ No sets found in cached data - this is the bug!");
    }
  } else {
    console.error("❌ DateDataCache is empty - data not preloaded");
  }
} else {
  console.error("❌ dateDataCache not found - wrong page or not loaded");
}

// 2. Check if analysis state has results
console.log("\n📊 2. Component State Analysis:");
console.log("Note: Use React Developer Tools to inspect component state");
console.log("Look for: topicResults, analysisInfo, loading state");

// 3. Test a simple extraction
console.log("\n🧪 3. Manual Extraction Test:");
if (typeof extractFromDateAndSet !== 'undefined' && typeof dateDataCache !== 'undefined' && dateDataCache.size > 0) {
  const testDate = Array.from(dateDataCache.keys())[0];
  const testSet = "D-1 Set-1 Matrix";
  
  try {
    const result = extractFromDateAndSet(testDate, testSet);
    console.log(`🎯 Manual extraction test for ${testSet}:`, result);
    
    if (result.length === 0) {
      console.error("❌ Manual extraction returned empty array - pipeline issue");
      
      // Deep dive into the data
      const cachedData = dateDataCache.get(testDate);
      console.log("🔍 Deep data inspection:");
      console.log("- cachedData.sets:", cachedData?.sets);
      console.log("- cachedData.excelData:", cachedData?.excelData);
      console.log("- cachedData.planetSelections:", cachedData?.planetSelections);
    } else {
      console.log("✅ Manual extraction working - may be a UI issue");
    }
  } catch (error) {
    console.error("❌ Manual extraction failed:", error);
  }
} else {
  console.warn("⚠️ Cannot test extraction - missing functions or data");
}

// 4. Check current selectedHR
console.log("\n⏰ 4. HR Selection Check:");
console.log("Look in React Dev Tools for 'selectedHR' value");
console.log("Should be 1-24, if undefined or invalid, this could cause issues");

// 5. Quick fix test
console.log("\n🔧 5. Quick Fix Test:");
console.log("If you see data in cache but extraction fails:");
console.log("1. Check if excelData.sets vs excelData.data.sets mismatch");
console.log("2. Verify planetSelections structure");
console.log("3. Check if selectedHR has valid value");

console.log("\n🎯 DEBUGGING COMPLETE");
console.log("Copy results above and report findings!");
