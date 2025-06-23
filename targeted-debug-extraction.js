// 🎯 TARGETED RULE2COMPACT DEBUG - Data Extraction Pipeline
// Copy this into browser console on Rule2CompactPage

console.log("🔍 TARGETED DEBUGGING - Data Extraction Pipeline");
console.log("=================================================");

// Check current component state
console.log("\n1. 📊 Current State Check:");
console.log("selectedHR should be visible in React DevTools");
console.log("Look for selectedHR value - should be a number 1-24");

// Check dateDataCache in detail
console.log("\n2. 🗃️ DateDataCache Deep Inspection:");
if (typeof dateDataCache !== 'undefined' && dateDataCache.size > 0) {
  const dates = Array.from(dateDataCache.keys());
  console.log("Available dates:", dates);
  
  dates.forEach(date => {
    const data = dateDataCache.get(date);
    console.log(`\n📅 Date: ${date}`);
    console.log("- excelData exists:", !!data.excelData);
    console.log("- hourData exists:", !!data.hourData);
    console.log("- sets count:", Object.keys(data.sets || {}).length);
    console.log("- planetSelections:", data.planetSelections);
    
    // Check if sets have the expected structure
    if (data.sets && Object.keys(data.sets).length > 0) {
      const firstSet = Object.keys(data.sets)[0];
      const firstSetData = data.sets[firstSet];
      console.log(`- Sample set "${firstSet}":`, Object.keys(firstSetData || {}));
      
      if (firstSetData && Object.keys(firstSetData).length > 0) {
        const firstElement = Object.keys(firstSetData)[0];
        const elementData = firstSetData[firstElement];
        console.log(`- Sample element "${firstElement}":`, elementData);
      }
    }
  });
}

// Test extraction function manually
console.log("\n3. 🧪 Manual Extraction Test:");
if (typeof extractFromDateAndSet !== 'undefined' && dateDataCache.size > 0) {
  const testDate = Array.from(dateDataCache.keys())[0];
  const testSet = "D-1 Set-1 Matrix";
  
  console.log(`Testing extraction for ${testDate}, ${testSet}`);
  console.log("Make sure selectedHR is set in component state!");
  
  // We need to check what selectedHR value is being used
  console.log("CHECK IN REACT DEV TOOLS:");
  console.log("1. Find Rule2CompactPage component");
  console.log("2. Look for selectedHR in hooks state");
  console.log("3. Verify it's a valid number (1-24)");
  
  const result = extractFromDateAndSet(testDate, testSet);
  console.log("Manual extraction result:", result);
  
  if (result.length === 0) {
    console.log("\n❌ EMPTY RESULT - Possible causes:");
    console.log("1. selectedHR is undefined/null");
    console.log("2. planetSelections missing for selectedHR");
    console.log("3. Set data structure mismatch");
    console.log("4. Element data missing planet codes");
  }
}

// Quick diagnostic questions
console.log("\n4. 🔧 Diagnostic Questions:");
console.log("Answer these by checking React DevTools:");
console.log("Q1: What is the selectedHR value?");
console.log("Q2: Is loading still true?");
console.log("Q3: Are there any errors in console?");
console.log("Q4: Does topicResults array have any items?");

console.log("\n5. 🎯 Next Steps:");
console.log("If selectedHR is undefined/null:");
console.log("- Check if activeHR prop is being passed correctly");
console.log("- Look for useState initialization issues");
console.log("If planetSelections is empty:");
console.log("- Check if Hour Entry data exists for the date");
console.log("- Verify planet_selections structure in database");
