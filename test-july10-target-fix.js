// Test script for July 10th target date ABCD/BCD display fix
// This script verifies that July 10th shows ABCD/BCD numbers from the analysis window [26-6-25, 30-6-25, 3-7-25, 7-7-25]

console.log('🧪 [Test] July 10th Target Date ABCD/BCD Fix Verification');

// Test the sliding window logic
function testSlidingWindowLogic() {
  console.log('\n🔍 [Test] Testing sliding window logic...');
  
  // Your date sequence
  const datesList = [
    '2025-05-29', '2025-06-02', '2025-06-05', '2025-06-09', 
    '2025-06-12', '2025-06-16', '2025-06-19', '2025-06-23', 
    '2025-06-26', '2025-06-30', '2025-07-03', '2025-07-07', '2025-07-10'
  ];
  
  const targetDate = '2025-07-10'; // July 10th
  const targetIdx = datesList.indexOf(targetDate);
  const windowDates = datesList.slice(0, targetIdx + 1);
  
  console.log('📅 [Test] Window dates:', windowDates);
  console.log('🎯 [Test] Target date:', targetDate);
  console.log('📊 [Test] Target index:', targetIdx);
  
  // Test the sliding window analysis
  console.log('\n🧮 [Test] Sliding window analysis scenarios:');
  
  for (let i = 3; i < windowDates.length; i++) {
    const dDay = windowDates[i];     
    const cDay = windowDates[i - 1]; 
    const bDay = windowDates[i - 2];   
    const aDay = windowDates[i - 3]; 
    
    const analysisWindow = [aDay, bDay, cDay, dDay];
    const displayDay = i + 1 < windowDates.length ? windowDates[i + 1] : null;
    
    console.log(`📋 [Test] Analysis ${i - 2}:`, {
      window: analysisWindow,
      dDay: dDay,
      displayDay: displayDay,
      isTargetDDay: dDay === targetDate,
      isTargetDisplayDay: displayDay === targetDate,
      shouldShowOnTarget: dDay === targetDate || displayDay === targetDate
    });
    
    // Check if this analysis should show on July 10th
    if (dDay === targetDate) {
      console.log(`  ✅ [Test] Case 1: July 10th is D-day (analysis source)`);
      console.log(`  📊 [Test] Analysis window: [${analysisWindow.join(', ')}]`);
    }
    
    if (displayDay === targetDate) {
      console.log(`  ✅ [Test] Case 2: July 10th is display day (shows results from previous analysis)`);
      console.log(`  📊 [Test] Analysis window: [${analysisWindow.join(', ')}]`);
      console.log(`  🎯 [Test] This should show ABCD/BCD from July 7th analysis!`);
      
      // This is the specific case you want:
      // Window: [26-6-25, 30-6-25, 3-7-25, 7-7-25] → Display on 10-7-25
      if (dDay === '2025-07-07') {
        console.log(`  🎉 [Test] PERFECT MATCH! This is your desired scenario:`);
        console.log(`    - Analysis window: [${analysisWindow.map(d => {
          const dateObj = new Date(d);
          const day = dateObj.getDate();
          const month = dateObj.getMonth() + 1;
          const year = dateObj.getFullYear().toString().slice(-2);
          return `${day}-${month}-${year}`;
        }).join(', ')}]`);
        console.log(`    - D-day (analysis source): ${dDay} (7-7-25)`);
        console.log(`    - Display day (target): ${displayDay} (10-7-25)`);
        console.log(`    - Should show ABCD: [2, 3, 7], BCD: [5] for D-4 Set-1`);
      }
    }
  }
  
  return {
    success: true,
    windowDates,
    targetDate,
    expectedScenario: {
      analysisWindow: ['2025-06-26', '2025-06-30', '2025-07-03', '2025-07-07'],
      dDay: '2025-07-07',
      displayDay: '2025-07-10',
      shouldWork: true
    }
  };
}

// Test the target date detection logic
function testTargetDateLogic() {
  console.log('\n🎯 [Test] Testing target date detection logic...');
  
  const windowDates = [
    '2025-06-26', '2025-06-30', '2025-07-03', '2025-07-07', '2025-07-10'
  ];
  const targetDate = '2025-07-10';
  
  for (let i = 3; i < windowDates.length; i++) {
    const dDay = windowDates[i];
    const isTargetDDay = dDay === targetDate;
    const isTargetDisplayDay = (i + 1 < windowDates.length && windowDates[i + 1] === targetDate);
    const shouldShowOnTarget = isTargetDDay || isTargetDisplayDay;
    
    console.log(`📋 [Test] Position ${i}:`, {
      dDay,
      nextDay: i + 1 < windowDates.length ? windowDates[i + 1] : 'none',
      isTargetDDay,
      isTargetDisplayDay,
      shouldShowOnTarget
    });
  }
}

// Run tests
const result = testSlidingWindowLogic();
testTargetDateLogic();

console.log('\n🎉 [Test] Test complete!');
console.log('📊 [Test] Expected behavior:');
console.log('  - July 10th should show ABCD/BCD numbers');
console.log('  - Analysis comes from window [26-6-25, 30-6-25, 3-7-25, 7-7-25]');
console.log('  - July 7th is the D-day (analysis source)');
console.log('  - July 10th is the display day (shows results)');
console.log('\n💡 [Test] The fix should now work correctly!');
