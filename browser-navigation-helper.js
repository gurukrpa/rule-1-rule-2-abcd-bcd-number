// Browser script to help debug Rule-1 vs IndexPage navigation
// Paste this in browser console after loading the main page

console.log("🚀 Rule-1 vs IndexPage Navigation Helper");

function findNavigationButtons() {
  console.log("🔍 Searching for navigation buttons...");
  
  // Look for buttons containing "Rule-1" or "Index" text
  const allButtons = document.querySelectorAll('button');
  const allLinks = document.querySelectorAll('a');
  const allElements = [...allButtons, ...allLinks];
  
  const indexButtons = [];
  const rule1Buttons = [];
  
  allElements.forEach((el, i) => {
    const text = el.textContent?.toLowerCase() || '';
    const className = el.className?.toLowerCase() || '';
    const id = el.id?.toLowerCase() || '';
    
    if (text.includes('index') || text.includes('analyze') || className.includes('index')) {
      indexButtons.push({
        element: el,
        text: el.textContent,
        className: el.className,
        onClick: el.onclick?.toString(),
        type: 'INDEX'
      });
    }
    
    if (text.includes('rule') || text.includes('rule-1') || className.includes('rule')) {
      rule1Buttons.push({
        element: el,
        text: el.textContent,
        className: el.className,
        onClick: el.onclick?.toString(),
        type: 'RULE-1'
      });
    }
  });
  
  console.log("📊 Found IndexPage buttons:", indexButtons.length);
  indexButtons.forEach((btn, i) => {
    console.log(`   ${i+1}. "${btn.text}" (${btn.className})`);
  });
  
  console.log("🔗 Found Rule-1 buttons:", rule1Buttons.length);
  rule1Buttons.forEach((btn, i) => {
    console.log(`   ${i+1}. "${btn.text}" (${btn.className})`);
  });
  
  return { indexButtons, rule1Buttons };
}

function clickIndexButton(dateText) {
  console.log(`🏠 Attempting to click IndexPage button for date: ${dateText}`);
  
  const buttons = document.querySelectorAll('button');
  for (let btn of buttons) {
    if (btn.textContent.includes('Analyze') || btn.textContent.includes('Index')) {
      // Find the parent row to get the date
      const row = btn.closest('tr') || btn.closest('.date-row') || btn.closest('div');
      if (row && row.textContent.includes(dateText)) {
        console.log(`✅ Clicking IndexPage button for ${dateText}`);
        btn.click();
        return true;
      }
    }
  }
  
  console.log(`❌ Could not find IndexPage button for ${dateText}`);
  return false;
}

function clickRule1Button(dateText) {
  console.log(`🔗 Attempting to click Rule-1 button for date: ${dateText}`);
  
  const buttons = document.querySelectorAll('button');
  for (let btn of buttons) {
    if (btn.textContent.includes('Rule') || btn.textContent.includes('🔗')) {
      // Find the parent row to get the date
      const row = btn.closest('tr') || btn.closest('.date-row') || btn.closest('div');
      if (row && row.textContent.includes(dateText)) {
        console.log(`✅ Clicking Rule-1 button for ${dateText}`);
        btn.click();
        return true;
      }
    }
  }
  
  console.log(`❌ Could not find Rule-1 button for ${dateText}`);
  return false;
}

function testSameDateBothPages(dateText = '2025-06-02') {
  console.log(`🧪 Testing SAME date on both pages: ${dateText}`);
  console.log("=" * 50);
  
  // First click IndexPage
  console.log("🏠 Step 1: Testing IndexPage...");
  if (clickIndexButton(dateText)) {
    setTimeout(() => {
      console.log("🔙 Going back from IndexPage...");
      // Look for back button
      const backBtn = document.querySelector('button[onclick*="back"]') || 
                     document.querySelector('button:contains("Back")') ||
                     Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Back'));
      if (backBtn) {
        backBtn.click();
        setTimeout(() => {
          console.log("🔗 Step 2: Testing Rule-1...");
          clickRule1Button(dateText);
        }, 1000);
      }
    }, 2000);
  }
}

// Auto-run
const navButtons = findNavigationButtons();

console.log("\n💡 Available commands:");
console.log("- findNavigationButtons() - Find all navigation buttons");
console.log("- clickIndexButton('2025-06-02') - Click IndexPage for specific date");
console.log("- clickRule1Button('2025-06-02') - Click Rule-1 for specific date");
console.log("- testSameDateBothPages('2025-06-02') - Test same date on both pages");

// Make functions available globally
window.findNavigationButtons = findNavigationButtons;
window.clickIndexButton = clickIndexButton;
window.clickRule1Button = clickRule1Button;
window.testSameDateBothPages = testSameDateBothPages;
