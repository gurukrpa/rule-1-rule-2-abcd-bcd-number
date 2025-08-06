// Comprehensive diagnostic for gradient number box styling
// Run this in browser console when on Rule1Page_Enhanced

console.log('🔍 GRADIENT NUMBER BOX DIAGNOSTIC');
console.log('=================================');

// Check if we're on the Rule1Page
function checkPage() {
  console.log('\n📍 Page Check:');
  const url = window.location.href;
  const title = document.title;
  const h1Text = document.querySelector('h1')?.textContent || 'No H1 found';
  
  console.log(`URL: ${url}`);
  console.log(`Title: ${title}`);
  console.log(`H1: ${h1Text}`);
  
  return h1Text.includes('Past Days') || url.includes('rule1');
}

// Check for number boxes in DOM
function checkNumberBoxes() {
  console.log('\n🔢 Number Box Check:');
  
  // Look for all button elements that might be number boxes
  const allButtons = document.querySelectorAll('button');
  console.log(`Total buttons found: ${allButtons.length}`);
  
  // Look specifically for small buttons (likely number boxes)
  const smallButtons = document.querySelectorAll('button[class*="w-6 h-6"]');
  console.log(`Small buttons (w-6 h-6): ${smallButtons.length}`);
  
  // Check if any have gradient classes
  const gradientButtons = document.querySelectorAll('button[class*="bg-gradient-to-r"]');
  console.log(`Buttons with gradient: ${gradientButtons.length}`);
  
  // Check table headers for number boxes
  const tableHeaders = document.querySelectorAll('th');
  let boxesInHeaders = 0;
  
  tableHeaders.forEach((header, index) => {
    const boxes = header.querySelectorAll('button[class*="w-6 h-6"]');
    if (boxes.length > 0) {
      boxesInHeaders += boxes.length;
      console.log(`Header ${index + 1}: ${boxes.length} number boxes`);
      
      // Log classes of first box in this header
      if (boxes[0]) {
        console.log(`  First box classes: ${boxes[0].className}`);
      }
    }
  });
  
  console.log(`Total number boxes in headers: ${boxesInHeaders}`);
  return boxesInHeaders > 0;
}

// Check React state and data
function checkReactState() {
  console.log('\n⚛️ React State Check:');
  
  // Try to access React component instance
  const reactElements = document.querySelectorAll('[data-reactroot], #root');
  if (reactElements.length > 0) {
    console.log('✅ React app found');
  } else {
    console.log('❌ React app not found');
  }
  
  // Check for data attributes or state indicators
  const hasData = document.querySelector('[class*="allDaysData"]') || 
                  document.querySelector('[class*="bg-green-50"]') || 
                  document.querySelector('table');
  
  if (hasData) {
    console.log('✅ Data seems to be loaded (table/data classes found)');
  } else {
    console.log('❌ No data indicators found');
  }
}

// Test clicking functionality
function testNumberBoxClick() {
  console.log('\n🖱️ Click Test:');
  
  const numberBoxes = document.querySelectorAll('button[class*="w-6 h-6"]');
  
  if (numberBoxes.length === 0) {
    console.log('❌ No number boxes to test');
    return false;
  }
  
  const firstBox = numberBoxes[0];
  console.log(`Testing first number box: "${firstBox.textContent}"`);
  console.log(`Before click classes: ${firstBox.className}`);
  
  // Add event listener to see if click triggers
  let clickDetected = false;
  const originalOnClick = firstBox.onclick;
  
  firstBox.addEventListener('click', () => {
    clickDetected = true;
    console.log('✅ Click event detected');
    
    setTimeout(() => {
      console.log(`After click classes: ${firstBox.className}`);
      
      if (firstBox.className.includes('bg-gradient-to-r')) {
        console.log('✅ Gradient classes applied!');
      } else if (firstBox.className.includes('bg-green')) {
        console.log('⚠️ Green background applied, but not gradient');
      } else {
        console.log('❌ No color change detected');
      }
    }, 100);
  }, { once: true });
  
  // Simulate click
  firstBox.click();
  
  return true;
}

// Check CSS compilation
function checkTailwindCSS() {
  console.log('\n🎨 Tailwind CSS Check:');
  
  // Visual test element disabled - use browser dev tools instead
  console.log('📝 Visual test element disabled');
  console.log('💡 Use browser dev tools to inspect gradient elements manually');
  console.log('✅ CSS check function available (visual element disabled)');
}

// Check for date visibility (number boxes only show from 5th date)
function checkDateVisibility() {
  console.log('\n📅 Date Visibility Check:');
  
  const headers = document.querySelectorAll('th');
  let dateHeadersFound = 0;
  let headersWithBoxes = 0;
  
  headers.forEach((header, index) => {
    const headerText = header.textContent;
    const hasDateFormat = /\d+-\d+-\d+/.test(headerText);
    
    if (hasDateFormat) {
      dateHeadersFound++;
      const boxes = header.querySelectorAll('button[class*="w-6 h-6"]');
      if (boxes.length > 0) {
        headersWithBoxes++;
        console.log(`Date ${dateHeadersFound}: "${headerText}" - ${boxes.length} boxes`);
      } else {
        console.log(`Date ${dateHeadersFound}: "${headerText}" - NO BOXES (${dateHeadersFound < 5 ? 'expected - before 5th' : 'unexpected - should have boxes'})`);
      }
    }
  });
  
  console.log(`Total date headers: ${dateHeadersFound}`);
  console.log(`Headers with number boxes: ${headersWithBoxes}`);
  
  if (dateHeadersFound < 5) {
    console.log('⚠️ Less than 5 dates - number boxes only appear from 5th date onward');
  }
}

// Run all diagnostics
async function runFullDiagnostic() {
  const isOnRightPage = checkPage();
  
  if (!isOnRightPage) {
    console.log('❌ Please navigate to Rule1Page_Enhanced first (click "Past Days" on any date from 5th onward)');
    return;
  }
  
  console.log('✅ On correct page');
  
  checkReactState();
  checkDateVisibility();
  const hasBoxes = checkNumberBoxes();
  
  if (hasBoxes) {
    testNumberBoxClick();
  }
  
  checkTailwindCSS();
  
  console.log('\n📊 SUMMARY:');
  console.log('If gradient is not working, possible causes:');
  console.log('1. Tailwind CSS not including gradient classes');
  console.log('2. React state not updating properly');
  console.log('3. Number boxes not showing (need 5+ dates)');
  console.log('4. Click handler not working');
}

// Start diagnostic
runFullDiagnostic();
