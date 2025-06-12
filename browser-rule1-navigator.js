// Copy and paste this entire script into your browser console
// while on http://localhost:5173/abcd-number/74b6ff5e-f12b-4c11-8105-bd939d60417e

console.log("🔍 COMPREHENSIVE RULE-1 BCD DIAGNOSTIC");
console.log("======================================");

function findAndClickRule1() {
  console.log("1. Scanning for Rule-1 buttons...");
  
  const buttons = document.querySelectorAll('button');
  let rule1Buttons = [];
  
  buttons.forEach((btn, i) => {
    const text = btn.textContent.trim();
    if (text.includes('Rule-1')) {
      rule1Buttons.push({
        element: btn,
        text: text,
        disabled: btn.disabled,
        classes: btn.className
      });
      console.log(`   Found Rule-1 button: "${text}" - Enabled: ${!btn.disabled}`);
    }
  });
  
  if (rule1Buttons.length === 0) {
    console.log("❌ No Rule-1 buttons found. Checking page structure...");
    
    // Check if we need to scroll or expand something
    const dateCards = document.querySelectorAll('[class*="date"], [class*="card"], .bg-white');
    console.log(`   Found ${dateCards.length} potential date cards/containers`);
    
    // Look for text that might indicate dates
    const textElements = document.querySelectorAll('*');
    const dateTexts = [];
    textElements.forEach(el => {
      const text = el.textContent;
      if (text && text.match(/\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/)) {
        dateTexts.push(text.trim());
      }
    });
    
    console.log("   Date-like text found:", [...new Set(dateTexts)]);
    return false;
  }
  
  // Find the first enabled Rule-1 button
  const enabledRule1 = rule1Buttons.find(btn => !btn.disabled);
  
  if (enabledRule1) {
    console.log("2. Clicking enabled Rule-1 button...");
    enabledRule1.element.click();
    
    // Wait for navigation and check result
    setTimeout(() => {
      checkRule1Page();
    }, 2000);
    
    return true;
  } else {
    console.log("❌ All Rule-1 buttons are disabled");
    return false;
  }
}

function checkRule1Page() {
  console.log("\n3. Checking Rule-1 page after navigation...");
  console.log("   Current URL:", window.location.href);
  
  // Check if we're on Rule-1 page
  const pageTitle = document.querySelector('h1, h2, h3');
  const pageText = pageTitle ? pageTitle.textContent : 'No title found';
  console.log("   Page title/header:", pageText);
  
  // Look for tables or data structures
  const tables = document.querySelectorAll('table');
  console.log(`   Found ${tables.length} tables`);
  
  // Check for ABCD/BCD badges
  const abcdBadges = document.querySelectorAll('.bg-green-100');
  const bcdBadges = document.querySelectorAll('.bg-blue-100');
  
  console.log(`   ABCD badges (green): ${abcdBadges.length}`);
  console.log(`   BCD badges (blue): ${bcdBadges.length}`);
  
  // List ABCD badges
  if (abcdBadges.length > 0) {
    console.log("   ABCD badge contents:");
    abcdBadges.forEach((badge, i) => {
      console.log(`     ${i + 1}: "${badge.textContent.trim()}"`);
    });
  }
  
  // List BCD badges
  if (bcdBadges.length > 0) {
    console.log("   BCD badge contents:");
    bcdBadges.forEach((badge, i) => {
      console.log(`     ${i + 1}: "${badge.textContent.trim()}"`);
    });
  } else {
    console.log("   ❌ NO BCD BADGES FOUND - This confirms the issue!");
  }
  
  // Check for console logs with data
  console.log("\n4. Monitoring for data extraction logs...");
  console.log("   Look for logs starting with '🔍 Numbers for' in console");
  console.log("   These will show the actual A, B, C, D values being compared");
  
  // Set up log monitoring
  const originalLog = console.log;
  const dataLogs = [];
  
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('Numbers for') || message.includes('D-number') || message.includes('ABCD:') || message.includes('BCD:')) {
      dataLogs.push(message);
    }
    originalLog.apply(console, args);
  };
  
  // Restore after 10 seconds and show captured logs
  setTimeout(() => {
    console.log = originalLog;
    console.log("\n5. Captured data logs:");
    if (dataLogs.length > 0) {
      dataLogs.forEach(log => console.log("   ", log));
    } else {
      console.log("   ❌ No data extraction logs found");
      console.log("   This suggests the data extraction might be failing");
    }
  }, 10000);
}

function debugLocalStorageData() {
  console.log("\n6. Checking localStorage data...");
  
  const selectedUser = localStorage.getItem('selectedUser');
  console.log("   Selected user:", selectedUser);
  
  if (selectedUser) {
    // Check dates
    const datesKey = `dates_${selectedUser}`;
    const dates = localStorage.getItem(datesKey);
    
    if (dates) {
      try {
        const datesList = JSON.parse(dates);
        console.log("   User dates:", datesList);
        
        // Check data for each date
        console.log("   Data availability:");
        datesList.forEach(date => {
          const excelKey = `excel_data_${selectedUser}_${date}`;
          const hourKey = `hour_entry_${selectedUser}_${date}`;
          
          const hasExcel = !!localStorage.getItem(excelKey);
          const hasHour = !!localStorage.getItem(hourKey);
          
          console.log(`     ${date}: Excel=${hasExcel}, Hour=${hasHour}`);
          
          // If we have data, peek at structure
          if (hasExcel) {
            try {
              const excelData = JSON.parse(localStorage.getItem(excelKey));
              const setCount = excelData?.data?.sets ? Object.keys(excelData.data.sets).length : 0;
              console.log(`       Excel sets: ${setCount}`);
            } catch (e) {
              console.log("       Excel data parse error");
            }
          }
        });
      } catch (e) {
        console.log("   Error parsing dates:", e);
      }
    }
  }
}

// Main execution
console.log("Starting diagnostic...");
debugLocalStorageData();

if (findAndClickRule1()) {
  console.log("✅ Successfully clicked Rule-1 button, waiting for page load...");
} else {
  console.log("❌ Could not find or click Rule-1 button");
  console.log("\n💡 Manual steps:");
  console.log("1. Look for date cards on the current page");
  console.log("2. Find a date card with an enabled 'Rule-1' button");
  console.log("3. Click the Rule-1 button");
  console.log("4. Run this script again on the Rule-1 page");
}

console.log("\n🚀 Available functions:");
console.log("- findAndClickRule1() - Try to click Rule-1 button");
console.log("- checkRule1Page() - Check current Rule-1 page state");
console.log("- debugLocalStorageData() - Check data availability");
