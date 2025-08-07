// Diagnostic script for testing clickable number boxes functionality
// Run this in browser console on Rule1Page_Enhanced

console.log('🔍 CLICKABLE NUMBER BOXES DIAGNOSTIC');
console.log('====================================');

// Check if we're on the right page
const isRule1Page = window.location.href.includes('rule1') || document.querySelector('[data-testid="rule1-page"]') || document.querySelector('h1').textContent.includes('Past Days');

if (!isRule1Page) {
  console.log('⚠️ Navigate to Rule1Page_Enhanced first (click Past Days on any date from 5th onward)');
} else {
  console.log('✅ On Rule1Page_Enhanced');
}

// Test database table exists
async function testTopicClicksTable() {
  console.log('\n📊 Testing topic_clicks table...');
  
  try {
    const { supabase } = window;
    if (!supabase) {
      console.log('❌ Supabase client not found');
      return false;
    }

    // Try to query the table
    const { data, error } = await supabase
      .from('topic_clicks')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ topic_clicks table does not exist or has issues:', error.message);
      console.log('💡 Run the create-topic-clicks-browser.js script first');
      return false;
    }

    console.log('✅ topic_clicks table exists and is accessible');
    console.log(`📊 Sample data count: ${data.length}`);
    return true;
    
  } catch (err) {
    console.log('❌ Exception testing table:', err);
    return false;
  }
}

// Check if number boxes are visible
function checkNumberBoxes() {
  console.log('\n🔢 Checking for clickable number boxes...');
  
  const numberBoxes = document.querySelectorAll('button[class*="w-6 h-6"]');
  console.log(`Found ${numberBoxes.length} potential number box buttons`);
  
  if (numberBoxes.length > 0) {
    console.log('✅ Number boxes found in DOM');
    
    // Check if they're in the right location (table headers)
    const tableHeaders = document.querySelectorAll('th');
    let boxesInHeaders = 0;
    
    tableHeaders.forEach(header => {
      const boxes = header.querySelectorAll('button[class*="w-6 h-6"]');
      if (boxes.length > 0) {
        boxesInHeaders += boxes.length;
      }
    });
    
    console.log(`📍 Number boxes in table headers: ${boxesInHeaders}`);
    
    if (boxesInHeaders > 0) {
      console.log('✅ Number boxes correctly positioned in table headers');
    } else {
      console.log('⚠️ Number boxes not found in table headers');
    }
    
  } else {
    console.log('❌ No number boxes found');
    console.log('💡 Make sure you have dates from 5th onward (number boxes only show from 5th date)');
  }
}

// Test clicking a number box
async function testNumberBoxClick() {
  console.log('\n🖱️ Testing number box click functionality...');
  
  const numberBoxes = document.querySelectorAll('button[class*="w-6 h-6"]');
  
  if (numberBoxes.length === 0) {
    console.log('❌ No number boxes to test');
    return;
  }
  
  const firstBox = numberBoxes[0];
  console.log('🎯 Testing click on first number box...');
  
  // Simulate click
  try {
    firstBox.click();
    console.log('✅ Click event triggered');
    
    // Wait a moment for the async operation
    setTimeout(() => {
      if (firstBox.classList.contains('bg-green-500')) {
        console.log('✅ Number box changed to clicked state (green)');
      } else {
        console.log('⚠️ Number box did not change to clicked state');
      }
    }, 1000);
    
  } catch (err) {
    console.log('❌ Error clicking number box:', err);
  }
}

// Check ABCD/BCD data availability
function checkAbcdBcdData() {
  console.log('\n📊 Checking ABCD/BCD data availability...');
  
  const abcdElements = document.querySelectorAll('[class*="text-green-600"]');
  const bcdElements = document.querySelectorAll('[class*="text-blue-600"]');
  
  console.log(`Found ${abcdElements.length} ABCD displays`);
  console.log(`Found ${bcdElements.length} BCD displays`);
  
  if (abcdElements.length > 0 || bcdElements.length > 0) {
    console.log('✅ ABCD/BCD data is being displayed');
  } else {
    console.log('⚠️ No ABCD/BCD data visible - this is needed for matching logic');
  }
}

// Run all tests
async function runAllTests() {
  const tableExists = await testTopicClicksTable();
  checkNumberBoxes();
  checkAbcdBcdData();
  
  if (tableExists) {
    setTimeout(testNumberBoxClick, 2000);
  }
}

// Start the diagnostic
runAllTests();