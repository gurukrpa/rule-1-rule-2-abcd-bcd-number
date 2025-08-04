/**
 * EMERGENCY DIAGNOSTIC: Run this immediately after page refresh
 * This will help identify the exact issue with number box persistence
 */

async function emergencyDiagnostic() {
  console.log('🚨 EMERGENCY DIAGNOSTIC - Number Box Persistence Issue');
  console.log('='.repeat(70));
  
  // Wait for services to be available
  let attempts = 0;
  while (!window.dualServiceManager && attempts < 20) {
    console.log(`⏳ Waiting for services... attempt ${attempts + 1}/20`);
    await new Promise(resolve => setTimeout(resolve, 500));
    attempts++;
  }
  
  if (!window.dualServiceManager) {
    console.error('❌ DualServiceManager not available after 10 seconds');
    return;
  }
  
  console.log('✅ DualServiceManager available, starting tests...');
  
  // Test different date formats that might be used
  const possibleDates = [
    '2025-06-26',
    '2025-07-26', 
    '26-06-2025',
    '26-07-2025',
    'Jun 26, 2025',
    'Jul 26, 2025'
  ];
  
  const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
  
  console.log('🔍 Testing different date formats...');
  
  for (const testDate of possibleDates) {
    try {
      const result = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(userId, testDate);
      
      if (result && result.length > 0) {
        console.log(`✅ FOUND DATA FOR DATE: "${testDate}"`);
        console.log(`   Records: ${result.length}`);
        console.log(`   Sample:`, result[0]);
        
        // Test HR filtering
        const hr1Clicks = result.filter(entry => entry.hr_number.toString() === '1');
        const hr2Clicks = result.filter(entry => entry.hr_number.toString() === '2');
        
        console.log(`   HR 1 clicks: ${hr1Clicks.length}`);
        console.log(`   HR 2 clicks: ${hr2Clicks.length}`);
        
        if (hr1Clicks.length > 0) {
          console.log(`   HR 1 sample:`, hr1Clicks[0]);
          
          // Test key generation
          const key = `${hr1Clicks[0].set_name}_${hr1Clicks[0].date_key}_${hr1Clicks[0].number_value}_HR${hr1Clicks[0].hr_number}`;
          console.log(`   Expected key: ${key}`);
        }
        
      } else {
        console.log(`❌ No data for date: "${testDate}"`);
      }
    } catch (error) {
      console.error(`❌ Error testing date "${testDate}":`, error);
    }
  }
  
  // Check current page state
  console.log('\n🔍 Current Page State Analysis');
  console.log('-'.repeat(40));
  
  if (window.rule1PageDebug) {
    console.log('Current React state:', {
      selectedUser: window.rule1PageDebug.selectedUser,
      date: window.rule1PageDebug.date,
      activeHR: window.rule1PageDebug.activeHR,
      clickedNumbers: Object.keys(window.rule1PageDebug.clickedNumbers).length,
      numberPresenceStatus: Object.keys(window.rule1PageDebug.numberPresenceStatus).length,
      allDaysDataKeys: Object.keys(window.rule1PageDebug.allDaysData).length,
      availableTopics: window.rule1PageDebug.availableTopics.length
    });
    
    // Test with current page state
    const currentDate = window.rule1PageDebug.date;
    const currentUser = window.rule1PageDebug.selectedUser;
    
    if (currentDate && currentUser) {
      console.log(`\n🧪 Testing with current page values: User="${currentUser}", Date="${currentDate}"`);
      
      try {
        const currentResult = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(currentUser, currentDate);
        console.log('Result for current page state:', {
          type: typeof currentResult,
          isArray: Array.isArray(currentResult),
          length: currentResult?.length || 0,
          data: currentResult
        });
        
        if (currentResult && currentResult.length > 0) {
          console.log('🎯 SUCCESS - Data found for current page state!');
          console.log('   This means the issue is in the React state restoration logic');
          
          // Test manual restoration
          const hrClicks = currentResult.filter(entry => 
            entry.hr_number.toString() === (window.rule1PageDebug.activeHR || '1').toString()
          );
          
          if (hrClicks.length > 0) {
            console.log('🔧 ATTEMPTING MANUAL STATE RESTORATION...');
            
            const newClicked = {};
            const newPresent = {};
            
            hrClicks.forEach(entry => {
              if (entry.is_clicked === true) {
                const key = `${entry.set_name}_${entry.date_key}_${entry.number_value}_HR${entry.hr_number}`;
                newClicked[key] = true;
                newPresent[key] = entry.is_present;
                console.log(`   Will restore: ${key} (present: ${entry.is_present})`);
              }
            });
            
            console.log('Manual restoration data:', { newClicked, newPresent });
            
            // Try to trigger the debug reload function
            if (window.rule1PageDebug.forceReloadNumberBoxes) {
              console.log('🔄 Triggering manual reload...');
              await window.rule1PageDebug.forceReloadNumberBoxes();
            }
          }
          
        } else {
          console.log('❌ No data found for current page state');
          console.log('   This means clicks were not saved or there\'s a date format mismatch');
        }
        
      } catch (error) {
        console.error('❌ Error testing current page state:', error);
      }
    }
  } else {
    console.log('❌ rule1PageDebug not available');
  }
  
  // DOM inspection
  console.log('\n🎨 DOM State Analysis');
  console.log('-'.repeat(40));
  
  const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent?.trim();
    return text && /^(1[0-2]|[1-9])$/.test(text);
  });
  
  const styledBoxes = numberBoxes.filter(box => {
    return box.className.includes('bg-orange') || 
           box.className.includes('bg-green') ||
           box.style.backgroundColor.includes('orange') ||
           box.style.backgroundColor.includes('green');
  });
  
  console.log('DOM analysis:', {
    totalNumberBoxes: numberBoxes.length,
    styledBoxes: styledBoxes.length,
    percentageStyled: numberBoxes.length > 0 ? ((styledBoxes.length / numberBoxes.length) * 100).toFixed(1) + '%' : '0%'
  });
  
  if (styledBoxes.length > 0) {
    console.log('Styled boxes details:', styledBoxes.map(box => ({
      number: box.textContent?.trim(),
      className: box.className,
      hasOrange: box.className.includes('bg-orange'),
      hasGreen: box.className.includes('bg-green')
    })));
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('1. Check the date format being used in your clicks vs. what the loader expects');
  console.log('2. Look for loader execution logs in console (🚀 [LOADER-xxx])');
  console.log('3. Verify the useEffect is actually triggering after page refresh');
  console.log('4. Check if there are any JavaScript errors preventing the loader from running');
  
  console.log('\n🧪 Manual test commands:');
  console.log('window.rule1PageDebug.forceReloadNumberBoxes() - Force reload saved clicks');
  console.log('window.manualTriggerLoader() - Trigger loader manually (if available)');
}

// Auto-run
emergencyDiagnostic();
