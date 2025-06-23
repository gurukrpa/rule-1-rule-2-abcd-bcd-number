// 🎯 COMPREHENSIVE RULE2COMPACT FAILURE ANALYSIS
// Copy this into browser console after the page loads

console.log("🎯 COMPREHENSIVE RULE2COMPACT FAILURE ANALYSIS");
console.log("===============================================");

// Function to run comprehensive checks
function comprehensiveAnalysis() {
  console.log("\n1. 📊 Component State Check:");
  console.log("Open React DevTools and check Rule2CompactPage state:");
  console.log("- loading: should be false when analysis completes");
  console.log("- topicResults: should be an array with 30 items");
  console.log("- selectedHR: should be 1 (number, not string)");
  console.log("- error: should be empty string if no errors");

  console.log("\n2. 🗃️ DateDataCache Check:");
  if (typeof dateDataCache !== 'undefined') {
    console.log("✅ dateDataCache exists");
    console.log("Cache size:", dateDataCache.size);
    
    if (dateDataCache.size > 0) {
      const dates = Array.from(dateDataCache.keys());
      console.log("Cached dates:", dates);
      
      // Check each date's data
      dates.forEach(date => {
        const data = dateDataCache.get(date);
        console.log(`\n📅 ${date}:`);
        console.log("- excelData:", !!data.excelData);
        console.log("- hourData:", !!data.hourData);
        console.log("- sets count:", Object.keys(data.sets || {}).length);
        console.log("- planetSelections count:", Object.keys(data.planetSelections || {}).length);
        
        // Critical checks
        if (Object.keys(data.sets || {}).length === 0) {
          console.error(`❌ CRITICAL: No sets for ${date}`);
          console.log("ExcelData structure:", data.excelData);
        }
        
        if (Object.keys(data.planetSelections || {}).length === 0) {
          console.error(`❌ CRITICAL: No planetSelections for ${date}`);
          console.log("HourData structure:", data.hourData);
        }
      });
    } else {
      console.error("❌ CRITICAL: dateDataCache is empty!");
    }
  } else {
    console.error("❌ CRITICAL: dateDataCache not found!");
  }

  console.log("\n3. 🔧 Extraction Test:");
  if (typeof extractFromDateAndSet !== 'undefined' && typeof dateDataCache !== 'undefined' && dateDataCache.size > 0) {
    const testDate = Array.from(dateDataCache.keys())[0];
    const testSet = "D-1 Set-1 Matrix";
    
    console.log(`Testing extraction: ${testDate}, ${testSet}`);
    try {
      const result = extractFromDateAndSet(testDate, testSet);
      console.log("Extraction result:", result);
      
      if (result.length === 0) {
        console.error("❌ Extraction returned empty array");
        console.log("Check console for extraction debug logs");
      } else {
        console.log("✅ Extraction working!");
      }
    } catch (error) {
      console.error("❌ Extraction failed:", error);
    }
  }

  console.log("\n4. 🌐 Network & Database Issues:");
  console.log("Check Network tab in DevTools for:");
  console.log("- Failed requests to Supabase");
  console.log("- 404 errors (wrong table names)");
  console.log("- 401/403 errors (authentication issues)");
  console.log("- Timeout errors");

  console.log("\n5. 📋 Console Error Analysis:");
  console.log("Look for these specific error patterns:");
  console.log("- 'relation \"hour_entry\" does not exist' (table name issue)");
  console.log("- 'planetSelections is undefined' (column structure issue)");
  console.log("- 'Cannot read property' errors (data structure mismatches)");
  console.log("- Network or CORS errors");

  console.log("\n6. 🎯 Expected Debug Output:");
  console.log("You should see these messages in console:");
  console.log("- '🔍 [DEBUG] Data received for [date]'");
  console.log("- 'directSetsCount: [number > 0]'");
  console.log("- 'planetSelectionsCount: [number > 0]'");
  console.log("- If missing, data loading failed");

  console.log("\n✅ ANALYSIS COMPLETE");
  console.log("Compare results above with expectations!");
}

// Run analysis after a delay to let the page load
if (document.readyState === 'loading') {
  console.log("⏳ Page loading, will run analysis in 5 seconds...");
  setTimeout(comprehensiveAnalysis, 5000);
} else {
  console.log("⏳ Running analysis in 3 seconds...");
  setTimeout(comprehensiveAnalysis, 3000);
}
