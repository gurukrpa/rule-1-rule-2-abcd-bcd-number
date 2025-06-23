// 🎯 COMPREHENSIVE RULE2COMPACT DEBUGGING SCRIPT
// Copy this into browser console on Rule2CompactPage to identify the exact issue

console.log("🔍 COMPREHENSIVE RULE2COMPACT DEBUGGING");
console.log("==========================================");

function debugRule2CompactPipeline() {
  console.log("\n📊 1. Component State Check:");
  console.log("Use React DevTools to check these values:");
  console.log("- selectedHR (should be a number, not string)");
  console.log("- loading (should be false if analysis completed)");
  console.log("- topicResults (should have array with results)");
  console.log("- error (should be empty if no errors)");

  console.log("\n🗃️ 2. DateDataCache Inspection:");
  if (typeof dateDataCache !== 'undefined') {
    console.log("✅ dateDataCache found");
    console.log("Cache size:", dateDataCache.size);
    
    if (dateDataCache.size === 0) {
      console.error("❌ CRITICAL: dateDataCache is empty!");
      console.log("💡 This means data preloading failed");
      return;
    }
    
    const dates = Array.from(dateDataCache.keys());
    console.log("Cached dates:", dates);
    
    // Check each date's data structure
    dates.forEach(date => {
      const data = dateDataCache.get(date);
      console.log(`\n📅 ${date}:`);
      console.log("- excelData exists:", !!data.excelData);
      console.log("- hourData exists:", !!data.hourData);
      console.log("- sets count:", Object.keys(data.sets || {}).length);
      console.log("- planetSelections count:", Object.keys(data.planetSelections || {}).length);
      
      if (Object.keys(data.sets || {}).length === 0) {
        console.error(`❌ ISSUE: No sets data for ${date}`);
        console.log("Raw excelData structure:", data.excelData);
      }
      
      if (Object.keys(data.planetSelections || {}).length === 0) {
        console.error(`❌ ISSUE: No planetSelections for ${date}`);
        console.log("Raw hourData structure:", data.hourData);
      }
    });
  } else {
    console.error("❌ CRITICAL: dateDataCache not found!");
    return;
  }

  console.log("\n🧪 3. Manual Extraction Test:");
  if (typeof extractFromDateAndSet !== 'undefined') {
    const testDate = Array.from(dateDataCache.keys())[0];
    const testSet = "D-1 Set-1 Matrix";
    
    console.log(`Testing: ${testDate}, ${testSet}`);
    
    // Get cached data for this date
    const cachedData = dateDataCache.get(testDate);
    console.log("Cached data for test:", {
      sets: Object.keys(cachedData.sets || {}),
      planetSelections: cachedData.planetSelections
    });
    
    // Check selectedHR in component state (need to check React DevTools)
    console.log("⚠️ Check selectedHR in React DevTools - it should be a number");
    
    const result = extractFromDateAndSet(testDate, testSet);
    console.log("Extraction result:", result);
    
    if (result.length === 0) {
      console.error("❌ EXTRACTION FAILED");
      console.log("🔍 Debugging extraction failure:");
      console.log("1. Check if selectedHR is set correctly in component");
      console.log("2. Check if planetSelections has the selectedHR key");
      console.log("3. Check if sets has the test set name");
    } else {
      console.log("✅ Extraction working!");
    }
  } else {
    console.error("❌ extractFromDateAndSet function not found");
  }

  console.log("\n🔍 4. Data Service Issues Check:");
  console.log("Check browser network tab for failed requests:");
  console.log("- Look for 404 errors (wrong table names)");
  console.log("- Look for authentication errors");
  console.log("- Look for timeout errors");

  console.log("\n🎯 5. Common Issues & Solutions:");
  console.log("If dateDataCache is empty:");
  console.log("→ Data preloading failed, check network/database");
  console.log("");
  console.log("If sets data is empty:");
  console.log("→ Excel data structure mismatch, check DataService");
  console.log("");
  console.log("If planetSelections is empty:");
  console.log("→ Hour data missing or structure wrong");
  console.log("");
  console.log("If extraction returns empty arrays:");
  console.log("→ selectedHR not matching planetSelections keys");
  console.log("→ Check React DevTools for selectedHR value");
  
  console.log("\n✅ DEBUGGING COMPLETE");
  console.log("Report findings and we'll fix the specific issue!");
}

// Run the debugging
debugRule2CompactPipeline();
