// Real-time Number Box Click Debugging Script
// Copy and paste this into your browser console while on Rule-1 page

console.log('🔍 REAL-TIME NUMBER BOX CLICK DEBUGGING');
console.log('=====================================');

// Monitor number box clicks in real-time
let clickCount = 0;
let savedClicks = {};
let loadedClicks = {};

// Override the handleNumberBoxClick function to add debugging
async function debugNumberBoxClick() {
  // First, let's check if we're on the right page
  const currentUrl = window.location.href;
  console.log('📍 Current URL:', currentUrl);
  
  // Check if DualServiceManager is available
  try {
    const { dualServiceManager } = await import('/src/services/DualServiceManager.js');
    console.log('✅ DualServiceManager available');
    console.log('📊 Service enabled:', dualServiceManager.enabled);
    
    // Test table access
    const tableCheck = await dualServiceManager.createTableIfNotExists();
    console.log('🗄️ Table status:', tableCheck);
    
    if (!tableCheck.success) {
      console.log('❌ TABLE ISSUE:', tableCheck.message);
      return;
    }
    
    console.log('✅ Database table is accessible');
    
    // Now let's monitor clicks
    console.log('\n🎯 CLICK MONITORING SETUP');
    console.log('Click any number box (1-12) and watch the logs...');
    
    // Find all number box buttons
    const numberBoxes = document.querySelectorAll('button[title*="Click to check if number"]');
    console.log(`📦 Found ${numberBoxes.length} number boxes on page`);
    
    if (numberBoxes.length === 0) {
      console.log('⚠️ No number boxes found. Make sure you are on Rule-1 page and HR is selected');
      return;
    }
    
    // Add click monitoring to each number box
    numberBoxes.forEach((button, index) => {
      const originalOnClick = button.onclick;
      
      button.addEventListener('click', async function(event) {
        clickCount++;
        const numberText = button.textContent;
        console.log(`\n🔢 CLICK #${clickCount}: Number ${numberText}`);
        console.log('🕐 Time:', new Date().toLocaleTimeString());
        
        // Call original click handler first
        if (originalOnClick) {
          await originalOnClick.call(this, event);
        }
        
        // Then check what was saved
        setTimeout(async () => {
          console.log(`   💾 Checking if number ${numberText} was saved to database...`);
          
          // Get current user and date from the page
          const userSelect = document.querySelector('select[value]') || document.querySelector('select');
          const selectedUser = userSelect ? userSelect.value : 'unknown';
          
          // Get active HR
          const hrSelect = document.querySelector('select[title*="HR"]') || document.querySelector('select[id*="hr"]');
          const activeHR = hrSelect ? hrSelect.value : '1';
          
          // Get current date (this might need adjustment based on your page structure)
          const dateElements = document.querySelectorAll('[class*="date"]');
          const currentDate = '2025-08-01'; // Default for testing
          
          console.log(`   📋 Context: User=${selectedUser}, HR=${activeHR}, Date=${currentDate}`);
          
          // Try to load what was saved
          try {
            const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
              selectedUser,
              currentDate
            );
            
            console.log(`   📥 Loaded from database:`, loadResult);
            
            // Check if our click is in the results
            const ourClick = loadResult.find(click => 
              click.number_value == numberText && 
              click.hr_number == activeHR
            );
            
            if (ourClick) {
              console.log(`   ✅ SUCCESS: Number ${numberText} found in database!`);
              savedClicks[`${numberText}_HR${activeHR}`] = ourClick;
            } else {
              console.log(`   ❌ PROBLEM: Number ${numberText} NOT found in database`);
              console.log(`   🔍 Available numbers in database:`, loadResult.map(c => c.number_value));
            }
            
          } catch (error) {
            console.log(`   ❌ DATABASE ERROR:`, error);
          }
        }, 500); // Wait 500ms for save to complete
      });
    });
    
    // Test refresh simulation
    console.log('\n🔄 REFRESH TEST SETUP');
    console.log('Type testRefresh() in console after clicking some numbers');
    
    window.testRefresh = async function() {
      console.log('\n🔄 SIMULATING PAGE REFRESH...');
      console.log('Loading what should be persisted...');
      
      // Get current context
      const userSelect = document.querySelector('select[value]') || document.querySelector('select');
      const selectedUser = userSelect ? userSelect.value : 'unknown';
      const currentDate = '2025-08-01';
      
      try {
        const loadResult = await dualServiceManager.getAllNumberBoxClicksForUserDate(
          selectedUser,
          currentDate
        );
        
        console.log('📥 What would be loaded after refresh:', loadResult);
        
        if (loadResult.length > 0) {
          console.log('✅ PERSISTENCE WORKING: Found saved clicks');
          loadResult.forEach(click => {
            console.log(`   • Number ${click.number_value} HR${click.hr_number} (${click.is_present ? 'Present' : 'Not Present'})`);
          });
        } else {
          console.log('❌ PERSISTENCE NOT WORKING: No saved clicks found');
        }
        
        loadedClicks = loadResult;
        
      } catch (error) {
        console.log('❌ REFRESH TEST ERROR:', error);
      }
    };
    
    console.log('\n📋 INSTRUCTIONS:');
    console.log('1. Click some number boxes (1-12)');
    console.log('2. Watch the real-time logs above');
    console.log('3. Type: testRefresh()');
    console.log('4. Compare what was saved vs what loads');
    
  } catch (error) {
    console.log('❌ SETUP ERROR:', error);
  }
}

// Run the debug setup
debugNumberBoxClick();
