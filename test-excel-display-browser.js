// Browser console script to check Excel data display for each date on ABCD page

console.log('🔍 CHECKING EXCEL DATA DISPLAY ON ABCD PAGE');
console.log('============================================');

// Check if we're on the ABCD page
const pageTitle = document.querySelector('h1');
if (pageTitle && pageTitle.textContent.includes('ABCD BCD Number')) {
  console.log('✅ On ABCD page');
  
  // Check dates list
  const datesList = document.querySelector('h3:contains("📅 Dates List")');
  if (datesList) {
    console.log('✅ Dates list found');
    
    // Find all Excel buttons
    const excelButtons = document.querySelectorAll('label[for*="excel-upload"]');
    console.log(`📊 Found ${excelButtons.length} Excel buttons`);
    
    excelButtons.forEach((button, index) => {
      const buttonText = button.textContent.trim();
      const hasCheckmark = buttonText.includes('✓');
      
      console.log(`📅 Date ${index + 1}:`);
      console.log(`   📊 Excel button: "${buttonText}"`);
      console.log(`   ✅ Has checkmark: ${hasCheckmark}`);
      console.log(`   🎨 Classes: ${button.className}`);
      
      // Check if it's green (uploaded) or purple (not uploaded)
      const isGreen = button.className.includes('bg-green');
      const isPurple = button.className.includes('bg-purple');
      console.log(`   🟢 Green (uploaded): ${isGreen}`);
      console.log(`   🟣 Purple (not uploaded): ${isPurple}`);
    });
    
    // Find all Hour Entry buttons
    const hourButtons = document.querySelectorAll('button:contains("Hour Entry")');
    console.log(`⏰ Found ${hourButtons.length} Hour Entry buttons`);
    
    hourButtons.forEach((button, index) => {
      const buttonText = button.textContent.trim();
      const hasCheckmark = buttonText.includes('✓');
      
      console.log(`📅 Date ${index + 1}:`);
      console.log(`   ⏰ Hour Entry button: "${buttonText}"`);
      console.log(`   ✅ Has checkmark: ${hasCheckmark}`);
      console.log(`   🎨 Classes: ${button.className}`);
    });
    
  } else {
    console.log('❌ Dates list not found');
  }
} else {
  console.log('❌ Not on ABCD page');
  console.log('Please navigate to the ABCD page and run this script again');
}

// Additional check: Look for the header info
const headerInfo = document.querySelector('.text-purple-800');
if (headerInfo) {
  console.log('📋 Header info found:');
  console.log(headerInfo.textContent);
}

console.log('\n🎯 WHAT YOU SHOULD SEE:');
console.log('======================');
console.log('Each date should show:');
console.log('- Excel button: "📊 Excel ✓" with green background if uploaded');
console.log('- Excel button: "📊 Excel" with purple background if not uploaded');
console.log('- Hour Entry button: "⏰ Hour Entry ✓" with blue background if completed');
console.log('- Hour Entry button: "⏰ Hour Entry" with blue background if not completed');
console.log('- The checkmark (✓) is the "Excel data display" indicator!');
