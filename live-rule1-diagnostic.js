// Quick diagnostic for current page state
console.log("🔍 LIVE RULE-1 BCD DIAGNOSTIC");
console.log("=============================");

function quickDiagnostic() {
  console.log("1. Current page state:");
  console.log("   URL:", window.location.href);
  console.log("   Path:", window.location.pathname);
  
  // Check for dates and Rule-1 buttons
  const buttons = document.querySelectorAll('button');
  const rule1Buttons = [];
  
  buttons.forEach((btn, i) => {
    const text = btn.textContent.trim();
    if (text.includes('Rule-1')) {
      rule1Buttons.push({
        index: i,
        text: text,
        disabled: btn.disabled,
        className: btn.className
      });
    }
  });
  
  console.log("2. Rule-1 buttons found:", rule1Buttons.length);
  rule1Buttons.forEach((btn, i) => {
    console.log(`   Button ${i + 1}: "${btn.text}" - Enabled: ${!btn.disabled}`);
  });
  
  // Check localStorage for user data
  const selectedUser = localStorage.getItem('selectedUser');
  console.log("3. Selected user:", selectedUser);
  
  if (selectedUser) {
    const datesKey = `dates_${selectedUser}`;
    const dates = localStorage.getItem(datesKey);
    
    if (dates) {
      try {
        const datesList = JSON.parse(dates);
        console.log("4. User dates:", datesList);
        console.log("   Total dates:", datesList.length);
        
        if (datesList.length >= 5) {
          console.log("   ✅ Sufficient dates for Rule-1");
          
          // Sort dates to find which ones are eligible
          const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
          sortedDates.forEach((date, index) => {
            const eligible = index >= 4;
            console.log(`   Date ${index + 1} (${date}): Rule-1 ${eligible ? 'eligible' : 'not eligible'}`);
          });
        } else {
          console.log("   ❌ Not enough dates for Rule-1");
        }
      } catch (e) {
        console.log("   Error parsing dates:", e);
      }
    }
  }
  
  console.log("\n🎯 Next steps:");
  if (rule1Buttons.length > 0) {
    console.log("- Click an enabled Rule-1 button to see the BCD issue");
  } else {
    console.log("- No Rule-1 buttons found - may need to add dates first");
  }
}

// Auto-click Rule-1 if available
function autoClickRule1() {
  const buttons = document.querySelectorAll('button');
  let rule1Button = null;
  
  buttons.forEach(btn => {
    if (btn.textContent.includes('Rule-1') && !btn.disabled) {
      rule1Button = btn;
    }
  });
  
  if (rule1Button) {
    console.log("🎯 Auto-clicking Rule-1 button...");
    rule1Button.click();
    
    // Wait and then check for BCD issue
    setTimeout(() => {
      console.log("\n🔍 Checking Rule-1 page for BCD badges...");
      const abcdBadges = document.querySelectorAll('.bg-green-100');
      const bcdBadges = document.querySelectorAll('.bg-blue-100');
      
      console.log(`Found ${abcdBadges.length} green ABCD badges`);
      console.log(`Found ${bcdBadges.length} blue BCD badges`);
      
      if (bcdBadges.length === 0) {
        console.log("❌ BCD ISSUE CONFIRMED: No blue BCD badges found");
        console.log("Looking for console logs with number data...");
        
        // Try to find the data extraction logs
        setTimeout(() => {
          console.log("💡 Look for console logs starting with '🔍 Numbers for' to see the actual A,B,C,D values");
        }, 1000);
      } else {
        console.log("✅ BCD badges found - issue may be resolved");
        bcdBadges.forEach((badge, i) => {
          console.log(`BCD Badge ${i + 1}:`, badge.textContent.trim());
        });
      }
    }, 2000);
  } else {
    console.log("❌ No enabled Rule-1 button found");
  }
}

// Run diagnostic
quickDiagnostic();

// Provide manual functions
console.log("\n🚀 Available functions:");
console.log("- quickDiagnostic() - Check current state");
console.log("- autoClickRule1() - Auto-click Rule-1 button");

export { quickDiagnostic, autoClickRule1 };
