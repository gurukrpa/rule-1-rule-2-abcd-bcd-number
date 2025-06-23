// BROWSER CONSOLE TEST SCRIPT
// Copy and paste this into browser console on Rule2CompactPage to verify the fix

console.log("🔧 TESTING ABCD/BCD FIX VERIFICATION");
console.log("=====================================");

// Function to test data extraction
function testDataExtraction() {
  console.log("\n📊 1. Checking dateDataCache...");
  
  if (typeof dateDataCache === 'undefined') {
    console.error("❌ dateDataCache not found - make sure you're on Rule2CompactPage");
    return;
  }
  
  console.log("✅ dateDataCache found:", dateDataCache);
  console.log("📈 Cache size:", dateDataCache.size);
  
  // Get all cached dates
  const cachedDates = Array.from(dateDataCache.keys());
  console.log("📅 Cached dates:", cachedDates);
  
  if (cachedDates.length === 0) {
    console.warn("⚠️ No dates in cache - try loading data first");
    return;
  }
  
  // Test first cached date
  const testDate = cachedDates[0];
  console.log(`\n🧪 2. Testing data for ${testDate}...`);
  
  const cachedData = dateDataCache.get(testDate);
  console.log("📋 Cached data structure:", cachedData);
  
  if (!cachedData) {
    console.error("❌ No cached data found");
    return;
  }
  
  // Check data components
  console.log("📊 Excel data exists:", !!cachedData.excelData);
  console.log("⏰ Hour data exists:", !!cachedData.hourData);
  console.log("📁 Sets object:", cachedData.sets);
  console.log("🪐 Planet selections:", cachedData.planetSelections);
  
  // Check sets structure
  const setNames = Object.keys(cachedData.sets || {});
  console.log("📂 Available sets:", setNames);
  
  if (setNames.length === 0) {
    console.error("❌ No sets found - this is the bug!");
    console.log("🔍 Raw excel data structure:", cachedData.excelData);
    return;
  }
  
  console.log("✅ Sets found - bug appears to be fixed!");
  
  // Test extraction function
  console.log("\n🎯 3. Testing extractFromDateAndSet...");
  
  if (typeof extractFromDateAndSet === 'undefined') {
    console.error("❌ extractFromDateAndSet function not found");
    return;
  }
  
  const testSet = setNames[0];
  console.log(`🧪 Testing with set: ${testSet}`);
  
  try {
    const result = extractFromDateAndSet(testDate, testSet);
    console.log("📊 Extraction result:", result);
    
    if (result && result.length > 0) {
      console.log("✅ SUCCESS! Numbers extracted:", result);
      console.log("🎉 ABCD/BCD bug appears to be FIXED!");
    } else {
      console.warn("⚠️ Empty result - may need further investigation");
    }
  } catch (error) {
    console.error("❌ Extraction failed:", error);
  }
}

// Function to test ABCD/BCD analysis
function testABCDAnalysis() {
  console.log("\n🔬 4. Testing ABCD/BCD Analysis...");
  
  if (typeof analyzeABCDNumbers === 'undefined') {
    console.error("❌ analyzeABCDNumbers function not found");
    return;
  }
  
  // Test with sample data
  const testNumbers = [5, 6, 7, 7, 7]; // Known working test case
  
  try {
    const result = analyzeABCDNumbers(testNumbers);
    console.log("🧮 ABCD Analysis result:", result);
    
    if (result.abcdNumbers && result.bcdNumbers) {
      console.log("✅ ABCD Numbers:", result.abcdNumbers);
      console.log("✅ BCD Numbers:", result.bcdNumbers);
      console.log("📊 Qualification Rate:", result.qualificationRate);
      console.log("🎉 ABCD/BCD analysis working correctly!");
    }
  } catch (error) {
    console.error("❌ ABCD analysis failed:", error);
  }
}

// Run all tests
testDataExtraction();
testABCDAnalysis();

console.log("\n🏁 TEST COMPLETE");
console.log("================");
console.log("💡 If you see 'SUCCESS! Numbers extracted' above, the bug is fixed!");
console.log("💡 If you see errors, check the console output for debugging info");
