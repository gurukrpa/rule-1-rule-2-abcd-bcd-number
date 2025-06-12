// Debug BCD Issue - Live Data Analysis
// Run this in browser console while on Rule-1 page

console.log("🔍 DEBUGGING BCD ISSUE ON RULE-1 PAGE");
console.log("====================================");

// Check if we're on Rule-1 page
if (window.location.pathname.includes('rule1') || document.querySelector('[data-testid="rule1-page"]') || document.title.includes('Rule') || document.querySelector('h2')?.textContent?.includes('Rule')) {
  
  console.log("✅ On Rule-1 page, starting debug...");
  
  // Function to analyze actual data structure
  function analyzeABCDData() {
    console.log("\n📊 ANALYZING ACTUAL ABCD DATA STRUCTURE");
    console.log("=======================================");
    
    // Try to find React component state
    const reactRoot = document.querySelector('#root');
    if (reactRoot && reactRoot._reactInternalFiber) {
      console.log("Found React fiber, searching for component state...");
    }
    
    // Look for any ABCD data in global scope or console logs
    if (window.processedData) {
      console.log("Found processedData:", window.processedData);
    }
    
    // Check localStorage for any relevant data
    const abcdData = localStorage.getItem('abcd_users_data');
    const selectedUser = localStorage.getItem('selectedUser');
    const dates = localStorage.getItem('dates');
    
    console.log("📂 LocalStorage Data:");
    console.log("- selectedUser:", selectedUser);
    console.log("- has abcd_users_data:", !!abcdData);
    console.log("- has dates:", !!dates);
    
    if (abcdData) {
      try {
        const userData = JSON.parse(abcdData);
        console.log("- abcd_users_data sample:", userData.slice(0, 2));
      } catch (e) {
        console.log("- abcd_users_data parse error:", e.message);
      }
    }
  }
  
  // Function to simulate BCD logic test
  function testBCDLogicWithSampleData() {
    console.log("\n🧪 TESTING BCD LOGIC WITH SAMPLE DATA");
    console.log("====================================");
    
    // Sample data based on the screenshot
    const sampleData = {
      A: { Lagna: { 1: 7 }, Moon: { 1: 10 }, 'Hora Lagna': { 1: 1 } },
      B: { Lagna: { 1: 15 }, Moon: { 1: 22 }, 'Hora Lagna': { 1: 8 } },
      C: { Lagna: { 1: 3 }, Moon: { 1: 5 }, 'Hora Lagna': { 1: 12 } },
      D: { Lagna: { 1: 7 }, Moon: { 1: 10 }, 'Hora Lagna': { 1: 1 } }
    };
    
    console.log("Sample numbers:", sampleData);
    
    Object.keys(sampleData.D).forEach(element => {
      const dNumber = sampleData.D[element][1];
      const aNumber = sampleData.A[element][1];
      const bNumber = sampleData.B[element][1];
      const cNumber = sampleData.C[element][1];
      
      const inA = aNumber === dNumber;
      const inB = bNumber === dNumber;
      const inC = cNumber === dNumber;
      
      const appearances = [inA, inB, inC].filter(Boolean).length;
      
      console.log(`\n🔍 ${element}:`);
      console.log(`   D=${dNumber}, A=${aNumber}, B=${bNumber}, C=${cNumber}`);
      console.log(`   Appears in: A=${inA}, B=${inB}, C=${inC} (${appearances} total)`);
      
      if (appearances >= 2) {
        console.log(`   ✅ ABCD qualified (≥2 appearances)`);
      } else if (appearances === 1) {
        if ((inB && !inC) || (inC && !inB)) {
          console.log(`   ✅ BCD qualified (appears only in ${inB ? 'B' : 'C'})`);
        } else if (inA && !inB && !inC) {
          console.log(`   ❌ A-only (not BCD eligible)`);
        }
      } else {
        console.log(`   ❌ No qualification`);
      }
    });
  }
  
  // Function to check what's actually being rendered
  function checkRenderedBadges() {
    console.log("\n🎨 CHECKING RENDERED BADGES");
    console.log("===========================");
    
    const abcdBadges = document.querySelectorAll('.bg-green-100');
    const bcdBadges = document.querySelectorAll('.bg-blue-100');
    
    console.log(`Found ${abcdBadges.length} green ABCD badges`);
    console.log(`Found ${bcdBadges.length} blue BCD badges`);
    
    abcdBadges.forEach((badge, i) => {
      console.log(`ABCD Badge ${i + 1}:`, badge.textContent.trim());
    });
    
    bcdBadges.forEach((badge, i) => {
      console.log(`BCD Badge ${i + 1}:`, badge.textContent.trim());
    });
    
    // Check for any other potential badge containers
    const allBadges = document.querySelectorAll('[class*="bg-"][class*="100"]');
    console.log(`Total badge-like elements: ${allBadges.length}`);
  }
  
  // Function to monitor console for ABCD/BCD logs
  function monitorConsoleLogs() {
    console.log("\n📱 MONITORING CONSOLE LOGS");
    console.log("==========================");
    console.log("Watch for BCD-related logs when you interact with the page...");
    
    // Override console.log temporarily to catch ABCD/BCD logs
    const originalLog = console.log;
    const bcdLogs = [];
    
    console.log = function(...args) {
      const message = args.join(' ');
      if (message.includes('BCD') || message.includes('ABCD') || message.includes('D-number')) {
        bcdLogs.push(message);
      }
      originalLog.apply(console, args);
    };
    
    // Restore after 10 seconds
    setTimeout(() => {
      console.log = originalLog;
      console.log("\n📊 Captured BCD-related logs:");
      bcdLogs.forEach(log => console.log("  ", log));
    }, 10000);
  }
  
  // Run all debug functions
  analyzeABCDData();
  testBCDLogicWithSampleData();
  checkRenderedBadges();
  monitorConsoleLogs();
  
  console.log("\n💡 NEXT STEPS:");
  console.log("1. If no BCD badges found, the issue is in the rendering logic");
  console.log("2. If BCD numbers are found but not displayed, check formatABCDResult");
  console.log("3. If no BCD numbers generated, the logic needs adjustment");
  console.log("4. Check browser network tab for any data loading issues");
  
} else {
  console.log("❌ Not on Rule-1 page. Please navigate to Rule-1 page first.");
}

// Additional helper to trigger data reload
console.log("\n🔄 To trigger data reload, run: window.location.reload()");
