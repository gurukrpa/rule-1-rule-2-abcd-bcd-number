/**
 * Number Box Persistence Diagnostic Script
 * Comprehensive analysis of number box click persistence after page refresh
 * 
 * Run this in browser console after navigating to Rule1Page_Enhanced
 */

async function numberBoxPersistenceDiagnostic() {
  console.log('🔍 NUMBER BOX PERSISTENCE DIAGNOSTIC');
  console.log('=====================================');
  
  // 1. Check if we're on the right page
  const isRule1Page = window.location.pathname.includes('rule') || document.querySelector('[data-testid="rule1-page"]') || document.title.includes('Rule');
  console.log(`📍 Current Page: ${isRule1Page ? 'Rule1 Page ✅' : 'Not Rule1 Page ❌'}`);
  
  if (!isRule1Page) {
    console.log('⚠️  Please navigate to Rule1Page_Enhanced first');
    return;
  }
  
  // 2. Check for debug functions
  console.log('\n🛠️  Debug Functions Check:');
  if (window.rule1PageDebug) {
    console.log('✅ rule1PageDebug object found');
    console.log('Available functions:', Object.keys(window.rule1PageDebug));
    
    // Check current state
    const { clickedNumbers, numberPresenceStatus, selectedUser, date, activeHR, allDaysData, availableTopics } = window.rule1PageDebug;
    
    console.log('\n📊 Current State Analysis:');
    console.log(`👤 Selected User: ${selectedUser}`);
    console.log(`📅 Date: ${date}`);
    console.log(`⏰ Active HR: ${activeHR}`);
    console.log(`📈 All Days Data Keys: ${Object.keys(allDaysData || {}).length}`);
    console.log(`🎯 Available Topics: ${availableTopics?.length || 0}`);
    console.log(`🔢 Clicked Numbers: ${Object.keys(clickedNumbers || {}).length}`);
    console.log(`✅ Number Presence Status: ${Object.keys(numberPresenceStatus || {}).length}`);
    
    if (Object.keys(clickedNumbers || {}).length > 0) {
      console.log('\n🎯 Current Clicked Numbers State:');
      Object.entries(clickedNumbers).forEach(([key, value]) => {
        const presence = numberPresenceStatus[key];
        console.log(`  ${key}: clicked=${value}, present=${presence}`);
      });
    }
    
  } else {
    console.log('❌ rule1PageDebug object not found');
    console.log('   The page may not be fully loaded or debug functions not exposed');
  }
  
  // 3. Check DOM state
  console.log('\n🎨 DOM State Analysis:');
  const numberBoxes = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent?.trim();
    return text && /^(1[0-2]|[1-9])$/.test(text);
  });
  
  console.log(`📦 Total Number Boxes Found: ${numberBoxes.length}`);
  
  if (numberBoxes.length > 0) {
    // Check styled boxes
    const orangeBoxes = numberBoxes.filter(box => box.className.includes('bg-orange'));
    const greenBoxes = numberBoxes.filter(box => box.className.includes('bg-green'));
    const styledBoxes = [...orangeBoxes, ...greenBoxes];
    
    console.log(`🟠 Orange Boxes (clicked + present): ${orangeBoxes.length}`);
    console.log(`🟢 Green Boxes (clicked + present): ${greenBoxes.length}`);
    console.log(`🎨 Total Styled Boxes: ${styledBoxes.length}`);
    
    if (styledBoxes.length > 0) {
      console.log('\n🎯 Styled Boxes Details:');
      styledBoxes.forEach(box => {
        console.log(`  Button "${box.textContent}" - Classes: ${box.className}`);
      });
    }
  }
  
  // 4. Database check
  console.log('\n💾 Database Persistence Check:');
  if (window.rule1PageDebug && window.rule1PageDebug.selectedUser && window.rule1PageDebug.date) {
    try {
      // Try to access the database service
      if (window.dualServiceManager) {
        console.log('✅ dualServiceManager found');
        const dbData = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(
          window.rule1PageDebug.selectedUser, 
          window.rule1PageDebug.date
        );
        
        console.log(`📦 Database Records Found: ${dbData?.length || 0}`);
        if (dbData && dbData.length > 0) {
          console.log('Database Records:');
          dbData.forEach((record, index) => {
            console.log(`  ${index + 1}. ${record.set_name}_${record.date_key}_${record.number_value}_HR${record.hr_number}: clicked=${record.is_clicked}, present=${record.is_present}`);
          });
          
          // Check for current HR
          const currentHR = window.rule1PageDebug.activeHR || '1';
          const hrRecords = dbData.filter(r => r.hr_number.toString() === currentHR.toString());
          console.log(`\n🎯 Records for Current HR ${currentHR}: ${hrRecords.length}`);
          
        } else {
          console.log('❌ No database records found');
        }
        
      } else {
        console.log('❌ dualServiceManager not accessible from window');
        console.log('   Trying alternative access methods...');
        
        // Try to trigger manual reload
        if (window.rule1PageDebug.forceReloadNumberBoxes) {
          console.log('🔄 Attempting manual reload...');
          await window.rule1PageDebug.forceReloadNumberBoxes();
        }
      }
      
    } catch (error) {
      console.error('❌ Database check failed:', error);
    }
  }
  
  // 5. Manual Test Suggestion
  console.log('\n🧪 Manual Test Suggestion:');
  console.log('1. Click a few number boxes to save some states');
  console.log('2. Refresh the page (Cmd+R or F5)');
  console.log('3. Run this diagnostic again');
  console.log('4. Check if the clicked states are restored');
  
  // 6. State Restoration Test
  if (window.rule1PageDebug && window.rule1PageDebug.forceReloadNumberBoxes) {
    console.log('\n🔄 Testing State Restoration:');
    try {
      await window.rule1PageDebug.forceReloadNumberBoxes();
      console.log('✅ Manual state reload completed');
      console.log('   Check the number boxes to see if states are restored');
    } catch (error) {
      console.error('❌ Manual state reload failed:', error);
    }
  }
  
  console.log('\n📋 Diagnostic Complete');
  console.log('====================');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('🔧 Number Box Persistence Diagnostic Ready');
  console.log('Run: numberBoxPersistenceDiagnostic()');
  
  // Expose to global scope
  window.numberBoxPersistenceDiagnostic = numberBoxPersistenceDiagnostic;
  
  // Auto-run after a short delay to allow page to load
  setTimeout(() => {
    if (document.readyState === 'complete') {
      console.log('🚀 Auto-running diagnostic...');
      numberBoxPersistenceDiagnostic();
    }
  }, 2000);
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { numberBoxPersistenceDiagnostic };
}
