// Browser Console Test for Rule-1 BCD Issue
// Copy and paste this into your browser console while on the ABCD page

console.log("🔍 RULE-1 BCD ISSUE DIAGNOSTIC");
console.log("==============================");

// Check current page and data
function diagnosticTest() {
  console.log("1. Current page check:");
  console.log("   URL:", window.location.href);
  console.log("   Title:", document.title);
  
  // Check if we're on the main ABCD page
  const isOnABCDPage = window.location.pathname.includes('abcd-number');
  console.log("   On ABCD page:", isOnABCDPage);
  
  if (isOnABCDPage) {
    console.log("\n2. Looking for Rule-1 button...");
    const rule1Buttons = document.querySelectorAll('button');
    let rule1Button = null;
    
    rule1Buttons.forEach((btn, i) => {
      if (btn.textContent.includes('Rule-1')) {
        rule1Button = btn;
        console.log(`   Found Rule-1 button ${i + 1}:`, btn.textContent.trim());
        console.log(`   Enabled:`, !btn.disabled);
        console.log(`   Classes:`, btn.className);
      }
    });
    
    if (rule1Button) {
      console.log("\n3. Checking user data...");
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
            console.log("   Number of dates:", datesList.length);
            
            if (datesList.length >= 5) {
              console.log("   ✅ Sufficient dates for Rule-1");
              
              // Check data availability for dates
              console.log("\n4. Checking data availability...");
              const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
              
              sortedDates.forEach((date, index) => {
                const excelKey = `excel_data_${selectedUser}_${date}`;
                const hourKey = `hour_entry_${selectedUser}_${date}`;
                
                const hasExcel = !!localStorage.getItem(excelKey);
                const hasHour = !!localStorage.getItem(hourKey);
                
                console.log(`   Date ${index + 1} (${date}): Excel=${hasExcel}, Hour=${hasHour}`);
              });
              
              console.log("\n💡 SUGGESTED ACTION:");
              console.log("   Click the Rule-1 button to navigate to Rule-1 page");
              console.log("   Then open console again and look for:");
              console.log("   - Messages starting with '🔍 Numbers for'");
              console.log("   - Messages starting with 'D-number'");
              console.log("   - Check if any BCD numbers are found");
              
            } else {
              console.log("   ❌ Not enough dates for Rule-1 (need at least 5)");
            }
          } catch (e) {
            console.log("   ❌ Error parsing dates:", e);
          }
        } else {
          console.log("   ❌ No dates found for user");
        }
      } else {
        console.log("   ❌ No user selected");
      }
    } else {
      console.log("   ❌ No Rule-1 button found");
    }
  } else {
    console.log("   Not on ABCD page. Navigate to ABCD page first.");
  }
  
  console.log("\n🎯 NEXT STEPS:");
  console.log("1. If you see a Rule-1 button, click it");
  console.log("2. Open console on Rule-1 page");
  console.log("3. Look for '🔍 Numbers for' messages");
  console.log("4. Check what A, B, C, D values are shown");
  console.log("5. See if any have appearances > 0");
}

// Also add a function to manually trigger Rule-1 if button is found
function clickRule1Button() {
  const rule1Buttons = document.querySelectorAll('button');
  let rule1Button = null;
  
  rule1Buttons.forEach(btn => {
    if (btn.textContent.includes('Rule-1') && !btn.disabled) {
      rule1Button = btn;
    }
  });
  
  if (rule1Button) {
    console.log("🎯 Clicking Rule-1 button...");
    rule1Button.click();
    
    // Wait a bit then check for BCD data
    setTimeout(() => {
      console.log("\n🔍 Checking for BCD data on Rule-1 page...");
      const bcdBadges = document.querySelectorAll('.bg-blue-100');
      console.log(`Found ${bcdBadges.length} BCD badges`);
      
      if (bcdBadges.length === 0) {
        console.log("❌ No BCD badges found. Check console for data extraction logs.");
      } else {
        bcdBadges.forEach((badge, i) => {
          console.log(`BCD Badge ${i + 1}:`, badge.textContent.trim());
        });
      }
    }, 2000);
  } else {
    console.log("❌ No enabled Rule-1 button found");
  }
}

// Run the diagnostic
diagnosticTest();

console.log("\n🚀 Available functions:");
console.log("- diagnosticTest() - Run full diagnostic");
console.log("- clickRule1Button() - Auto-click Rule-1 button");
