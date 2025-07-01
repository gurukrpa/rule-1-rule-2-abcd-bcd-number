// verify-abcd-bcd-fix.js
// Quick verification script to check if the ABCD/BCD numbers are showing correctly

console.log('🔍 VERIFYING ABCD/BCD NUMBERS FIX...\n');

// Check if we're on the Planets Analysis page
const isOnPlanetsPage = window.location.pathname.includes('/planets-analysis') || 
                       window.location.pathname === '/' ||
                       document.title.includes('Planets');

if (!isOnPlanetsPage) {
  console.log('⚠️ Please navigate to the Planets Analysis page first');
  console.log('🔗 URL: http://localhost:5173/planets-analysis');
} else {
  console.log('✅ On Planets Analysis page');
}

// Function to check the current numbers being displayed
function checkDisplayedNumbers() {
  console.log('\n📊 CHECKING DISPLAYED NUMBERS...');
  
  // Look for ABCD/BCD number displays
  const abcdElements = document.querySelectorAll('[class*="green"], [class*="ABCD"]');
  const bcdElements = document.querySelectorAll('[class*="blue"], [class*="BCD"]');
  
  console.log(`Found ${abcdElements.length} ABCD elements and ${bcdElements.length} BCD elements`);
  
  // Check for status banners
  const statusBanners = document.querySelectorAll('[class*="DATABASE"], [class*="FALLBACK"]');
  statusBanners.forEach(banner => {
    console.log(`📋 Status: ${banner.textContent.trim()}`);
  });
  
  // Look for specific D-1 set numbers
  const d1Elements = document.querySelectorAll('*');
  let foundD1Numbers = [];
  
  d1Elements.forEach(el => {
    const text = el.textContent;
    if (text.includes('D-1') && (text.includes('ABCD') || text.includes('BCD'))) {
      foundD1Numbers.push(text.trim());
    }
  });
  
  console.log('\n🎯 D-1 SET NUMBERS FOUND:');
  foundD1Numbers.forEach(text => console.log(`  ${text}`));
  
  // Check for the expected numbers [10, 12], [4, 11]
  const hasExpectedNumbers = foundD1Numbers.some(text => 
    text.includes('10') && text.includes('12') && text.includes('4') && text.includes('11')
  );
  
  if (hasExpectedNumbers) {
    console.log('\n🎉 SUCCESS! Found expected numbers [10, 12], [4, 11]');
  } else {
    console.log('\n⚠️ Expected numbers [10, 12], [4, 11] not found in display');
  }
}

// Function to test the database service
async function testDatabaseService() {
  try {
    console.log('\n🧪 TESTING DATABASE SERVICE...');
    
    // Try to import the database service
    const { abcdBcdDatabaseService } = await import('/src/services/abcdBcdDatabaseService.js');
    
    const result = await abcdBcdDatabaseService.getAllTopicNumbers();
    
    if (result.success) {
      console.log('✅ Database service working');
      const d1Set1 = result.data.topicNumbers['D-1 Set-1 Matrix'];
      const d1Set2 = result.data.topicNumbers['D-1 Set-2 Matrix'];
      
      if (d1Set1 && d1Set2) {
        console.log(`📊 D-1 Set-1: ABCD[${d1Set1.abcd.join(', ')}] BCD[${d1Set1.bcd.join(', ')}]`);
        console.log(`📊 D-1 Set-2: ABCD[${d1Set2.abcd.join(', ')}] BCD[${d1Set2.bcd.join(', ')}]`);
        
        const correctNumbers = d1Set1.abcd.includes(10) && d1Set1.abcd.includes(12) && 
                              d1Set1.bcd.includes(4) && d1Set1.bcd.includes(11);
        
        if (correctNumbers) {
          console.log('🎯 Database has correct numbers!');
        } else {
          console.log('⚠️ Database numbers need updating');
        }
      }
    } else {
      console.log('❌ Database service failed:', result.error);
      console.log('💡 Using fallback numbers (should still show correct values)');
    }
  } catch (error) {
    console.log('❌ Database service error:', error.message);
    console.log('💡 Using fallback numbers (should still show correct values)');
  }
}

// Function to check component state
function checkComponentState() {
  console.log('\n🔧 CHECKING COMPONENT STATE...');
  
  // Look for React components in the DOM
  const reactRoot = document.querySelector('#root');
  if (reactRoot) {
    console.log('✅ React app mounted');
    
    // Check for any error messages
    const errorElements = document.querySelectorAll('[class*="error"], [class*="red"]');
    if (errorElements.length > 0) {
      console.log(`⚠️ Found ${errorElements.length} error elements`);
    } else {
      console.log('✅ No error elements found');
    }
    
    // Check for loading states
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spin"]');
    if (loadingElements.length > 0) {
      console.log(`🔄 Found ${loadingElements.length} loading elements`);
    } else {
      console.log('✅ No loading elements found');
    }
  } else {
    console.log('❌ React app not found');
  }
}

// Main verification function
async function runVerification() {
  console.log('='.repeat(50));
  console.log('🔍 ABCD/BCD NUMBERS VERIFICATION');
  console.log('='.repeat(50));
  
  checkComponentState();
  checkDisplayedNumbers();
  await testDatabaseService();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 VERIFICATION COMPLETE');
  console.log('='.repeat(50));
  
  console.log('\n💡 EXPECTED RESULTS:');
  console.log('  ✅ D-1 Set-1 Matrix: ABCD[10, 12] BCD[4, 11]');
  console.log('  ✅ D-1 Set-2 Matrix: ABCD[10, 12] BCD[4, 11]');
  console.log('  ✅ Green badges for numbers 10, 12');
  console.log('  ✅ Blue badges for numbers 4, 11');
  console.log('  ✅ Status banner showing either "DATABASE ACTIVE" or "FALLBACK MODE"');
  
  console.log('\n🚀 If you see the expected results, the fix is working correctly!');
}

// Auto-run verification
runVerification();
