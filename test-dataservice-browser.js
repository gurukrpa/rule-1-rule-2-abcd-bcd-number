// 🧪 Test DataService directly in browser console
// Copy this into browser console to test our DataService fixes

console.log("🧪 TESTING DATASERVICE DIRECTLY");
console.log("===============================");

async function testDataService() {
  console.log("\n1. 🔧 Creating DataService instance...");
  
  // Import and create DataService
  try {
    // Try to access the DataService from the global scope or import it
    if (typeof DataService === 'undefined') {
      console.log("Importing DataService...");
      // In a real browser environment, we might need to access it differently
      console.log("⚠️ DataService not directly accessible. Checking if it's used in components...");
      return;
    }
    
    const dataService = new DataService();
    console.log("✅ DataService created");
    
    console.log("\n2. 📊 Testing Excel data retrieval...");
    const testUserId = '8db9861a-76ce-4ae3-81b0-7a8b82314ef2';
    const testDate = '2025-06-04';
    
    console.log(`Testing: User ${testUserId}, Date ${testDate}`);
    
    // Test Excel data
    console.log("Fetching Excel data...");
    const excelData = await dataService.getExcelData(testUserId, testDate);
    console.log("Excel data result:", excelData);
    
    if (excelData) {
      console.log("Excel data structure:", {
        hasDirectSets: !!excelData.sets,
        hasNestedSets: !!excelData.data?.sets,
        directSetsCount: Object.keys(excelData.sets || {}).length,
        nestedSetsCount: Object.keys(excelData.data?.sets || {}).length
      });
    }
    
    // Test Hour data  
    console.log("\n3. ⏰ Testing Hour data retrieval...");
    console.log("Fetching Hour data...");
    const hourData = await dataService.getHourEntry(testUserId, testDate);
    console.log("Hour data result:", hourData);
    
    if (hourData) {
      console.log("Hour data structure:", {
        hasPlanetSelections: !!hourData.planetSelections,
        planetSelectionsCount: Object.keys(hourData.planetSelections || {}).length,
        structure: Object.keys(hourData)
      });
    }
    
    console.log("\n🎯 DataService Test Results:");
    if (excelData && hourData) {
      console.log("✅ Both Excel and Hour data retrieved successfully");
      console.log("✅ DataService fixes appear to be working");
    } else {
      console.log("❌ DataService retrieval failed");
      console.log("❌ This explains why Rule2CompactPage shows 0 topics");
    }
    
  } catch (error) {
    console.error("❌ DataService test failed:", error);
    console.log("This indicates a fundamental issue with our DataService fixes");
  }
}

// Note: This test requires DataService to be accessible in browser
console.log("📝 Note: This test checks if DataService works correctly");
console.log("If DataService is not accessible, check React DevTools Network tab instead");
console.log("Look for requests to Supabase and their responses");

// Try to run the test
testDataService().catch(console.error);
