// Investigate IndexPage Topic Display and ABCD/BCD Numbers
// This script checks:
// 1. If IndexPage shows all 30 topics 
// 2. If ABCD/BCD numbers are properly displayed there
// 3. How those numbers get from IndexPage to Rule2Page

console.log('🔍 INVESTIGATING INDEXPAGE TOPIC DISPLAY AND ABCD/BCD NUMBERS');
console.log('='.repeat(70));

// Run this script in browser console when you're on IndexPage
// First check if we're on the IndexPage
const header = document.querySelector('h1');
if (header && header.textContent.includes('Astrological Index Matrix')) {
  console.log('✅ We are on IndexPage - starting investigation...');
  
  // 1. Check how many topics are displayed
  console.log('\n📊 STEP 1: CHECKING DISPLAYED TOPICS');
  console.log('-'.repeat(40));
  
  const topicHeaders = document.querySelectorAll('h2');
  const displayedTopics = Array.from(topicHeaders)
    .map(h => h.textContent.trim())
    .filter(text => text.includes('Matrix'));
  
  console.log(`Found ${displayedTopics.length} topics displayed on IndexPage:`);
  displayedTopics.forEach((topic, i) => {
    console.log(`  ${i + 1}. ${topic}`);
  });
  
  // Check if this includes the missing topics mentioned in the issue
  const missingTopics = ['D-3', 'D-5', 'D-7', 'D-10', 'D-12', 'D-27', 'D-30', 'D-60'];
  console.log('\n🔍 Checking for previously missing topics:');
  missingTopics.forEach(topicPrefix => {
    const found = displayedTopics.some(topic => topic.includes(topicPrefix));
    console.log(`  ${topicPrefix}: ${found ? '✅ FOUND' : '❌ MISSING'}`);
  });
  
  // 2. Check ABCD/BCD indicators in the matrices
  console.log('\n🎯 STEP 2: CHECKING ABCD/BCD INDICATORS');
  console.log('-'.repeat(40));
  
  const abcdBadges = document.querySelectorAll('.bg-green-200');
  const bcdBadges = document.querySelectorAll('.bg-blue-200');
  
  console.log(`Found ${abcdBadges.length} ABCD indicators and ${bcdBadges.length} BCD indicators`);
  
  if (abcdBadges.length > 0) {
    console.log('\n✅ ABCD numbers found in IndexPage:');
    const abcdNumbers = Array.from(abcdBadges).map((badge, i) => {
      const cell = badge.closest('td');
      const numberText = cell ? cell.textContent : 'unknown';
      console.log(`  ${i + 1}. ${numberText}`);
      return numberText;
    });
  } else {
    console.log('❌ No ABCD numbers found in IndexPage');
  }
  
  if (bcdBadges.length > 0) {
    console.log('\n✅ BCD numbers found in IndexPage:');
    const bcdNumbers = Array.from(bcdBadges).map((badge, i) => {
      const cell = badge.closest('td');
      const numberText = cell ? cell.textContent : 'unknown';
      console.log(`  ${i + 1}. ${numberText}`);
      return numberText;
    });
  } else {
    console.log('❌ No BCD numbers found in IndexPage');
  }
  
  // 3. Check HR tabs and active HR
  console.log('\n🏠 STEP 3: CHECKING HR TABS AND SELECTION');
  console.log('-'.repeat(40));
  
  const hrTabs = document.querySelectorAll('[class*="cursor-pointer"][class*="border"]');
  const activeTabs = Array.from(hrTabs).filter(tab => 
    tab.className.includes('bg-blue-500') || tab.className.includes('bg-purple-500')
  );
  
  console.log(`Found ${hrTabs.length} HR tabs total`);
  console.log(`Found ${activeTabs.length} active HR tabs`);
  
  if (activeTabs.length > 0) {
    const activeHR = activeTabs[0].textContent.trim();
    console.log(`Active HR: ${activeHR}`);
  } else {
    console.log('⚠️ No active HR selected - this may be why no ABCD/BCD numbers show');
  }
  
  // 4. Check Extract Numbers button status
  console.log('\n🚀 STEP 4: CHECKING EXTRACT NUMBERS BUTTON');
  console.log('-'.repeat(40));
  
  const extractButton = document.querySelector('button[class*="purple"]');
  if (extractButton) {
    const buttonText = extractButton.textContent;
    const isDisabled = extractButton.disabled;
    const classes = extractButton.className;
    
    console.log(`Extract Numbers Button: "${buttonText}"`);
    console.log(`Is Disabled: ${isDisabled}`);
    console.log(`Button Classes: ${classes}`);
    
    if (isDisabled) {
      console.log('⚠️ Extract Numbers button is disabled');
      console.log('  This means either:');
      console.log('  - Less than 5 dates total');
      console.log('  - No HR selected');
      console.log('  - Missing data for required dates');
    } else {
      console.log('✅ Extract Numbers button is enabled and ready');
    }
  } else {
    console.log('❌ Extract Numbers button not found');
  }
  
  // 5. Check React component state if possible
  console.log('\n⚛️ STEP 5: REACT STATE INVESTIGATION');
  console.log('-'.repeat(40));
  
  try {
    // Try to find React component data
    const appRoot = document.querySelector('#root');
    if (appRoot && appRoot._reactInternalFiber) {
      console.log('✅ React component found - checking state...');
      // This is a simplified check - in reality, React state access is more complex
    } else {
      console.log('ℹ️ React component state not directly accessible via DOM');
    }
    
    // Check for any console errors
    const consoleErrors = window.performance?.getEntriesByType?.('navigation');
    if (consoleErrors) {
      console.log('📊 Navigation performance data available');
    }
    
  } catch (e) {
    console.log('ℹ️ React state investigation skipped (no direct access)');
  }
  
  // 6. Summary and recommendations
  console.log('\n📋 STEP 6: INVESTIGATION SUMMARY');
  console.log('='.repeat(40));
  
  const topicCount = displayedTopics.length;
  const hasAbcdBcd = (abcdBadges.length + bcdBadges.length) > 0;
  const hasActiveHR = activeTabs.length > 0;
  
  console.log(`📊 Topics displayed: ${topicCount}/30 expected`);
  console.log(`🎯 ABCD/BCD indicators: ${hasAbcdBcd ? 'YES' : 'NO'}`);
  console.log(`🏠 Active HR selected: ${hasActiveHR ? 'YES' : 'NO'}`);
  
  if (topicCount === 30 && hasAbcdBcd && hasActiveHR) {
    console.log('\n🎉 IndexPage appears to be working correctly!');
    console.log('✅ All 30 topics are displayed');
    console.log('✅ ABCD/BCD numbers are visible');
    console.log('✅ HR is properly selected');
    console.log('\n🔄 Next step: Test Rule-2 navigation by clicking "Extract Numbers"');
  } else {
    console.log('\n⚠️ Issues found:');
    if (topicCount < 30) {
      console.log(`❌ Only ${topicCount}/30 topics displayed`);
      console.log('   → Check Excel data upload for all dates');
      console.log('   → Verify TOPIC_ORDER array in IndexPage.jsx');
    }
    if (!hasAbcdBcd) {
      console.log('❌ No ABCD/BCD numbers visible');
      console.log('   → Check if analysis is running');
      console.log('   → Verify data is available for A, B, C, D dates');
    }
    if (!hasActiveHR) {
      console.log('❌ No HR selected');
      console.log('   → Select an HR tab to view data');
      console.log('   → Check if Hour Entry data exists');
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🔍 INDEXPAGE INVESTIGATION COMPLETE');
  
} else {
  console.log('❌ Not on IndexPage. Please navigate to IndexPage first by:');
  console.log('   1. Go to ABCD main page');
  console.log('   2. Click "Index" button for any date');
  console.log('   3. Run this script again');
}
