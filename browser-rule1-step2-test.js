// BROWSER CONSOLE TEST for Rule-1 Step 2
// Copy-paste this entire code into browser console after opening http://localhost:5173/

(function() {
  console.log('🧪 RULE-1 STEP 2 TEST - Display Formatted Data');
  console.log('================================================');
  
  // Step 1: Check for users and data
  const userData = localStorage.getItem('abcd_users_data');
  if (!userData) {
    console.log('❌ No users found. Creating test user...');
    
    // Create a test user
    const testUser = {
      id: 999,
      username: 'TestUser',
      hr: 3
    };
    
    localStorage.setItem('abcd_users_data', JSON.stringify([testUser]));
    console.log('✅ Test user created:', testUser);
  }
  
  const users = JSON.parse(localStorage.getItem('abcd_users_data') || '[]');
  const testUser = users[0];
  
  if (!testUser) {
    console.log('❌ Still no user available');
    return;
  }
  
  console.log('👤 Using test user:', testUser.username, 'ID:', testUser.id);
  
  // Step 2: Check for dates
  const datesKey = `abcd_dates_${testUser.id}`;
  let dates = JSON.parse(localStorage.getItem(datesKey) || '[]');
  
  if (dates.length < 5) {
    console.log('📅 Creating test dates (need 5+ for Rule-1)...');
    dates = [
      '2025-01-01',
      '2025-01-02', 
      '2025-01-03',
      '2025-01-04',
      '2025-01-05'
    ];
    localStorage.setItem(datesKey, JSON.stringify(dates));
    console.log('✅ Test dates created:', dates);
  }
  
  const sortedDates = dates.sort((a, b) => new Date(a) - new Date(b));
  const rule1Date = sortedDates[sortedDates.length - 1];
  
  console.log('🎯 Rule-1 test date:', rule1Date);
  
  // Step 3: Create minimal test data for all dates
  dates.forEach((date, index) => {
    const excelKey = `abcd_excelData_${testUser.id}_${date}`;
    const hourKey = `abcd_hourEntry_${testUser.id}_${date}`;
    
    // Check if data already exists
    if (!localStorage.getItem(excelKey)) {
      console.log(`📊 Creating Excel data for ${date}...`);
      
      const excelData = {
        data: {
          sets: {
            'D-1 Set-1 Matrix': {
              'Lagna': {
                'Su': `as-${7 + index}-/su-(${10 + index} Sc 03)-(17 Ta 58)`,
                'Mo': `as-${8 + index}-/mo-(${11 + index} Ar 15)-(25 Le 42)`,
                'Ma': `as-${9 + index}-/ma-(${12 + index} Pi 27)-(03 Vi 36)`
              },
              'Moon': {
                'Su': `mo-${5 + index}-/su-(${15 + index} Ge 48)-(22 Cp 19)`,
                'Mo': `mo-${6 + index}-/mo-(${16 + index} Ta 33)-(08 Aq 51)`,
                'Ma': `mo-${7 + index}-/ma-(${17 + index} Cn 12)-(14 Sg 28)`
              },
              'Vighati Lagna': {
                'Su': `vig-${3 + index}-/su-(${19 + index} Ar 60)-(05 Pi 43)`,
                'Mo': `vig-${4 + index}-/mo-(${20 + index} Li 25)-(11 Sc 17)`,
                'Ra': `vig-${3 + index}-/ra-(${19 + index} Ar 60)-(24 Le 36)`
              }
            }
          }
        }
      };
      
      localStorage.setItem(excelKey, JSON.stringify(excelData));
    }
    
    // Create hour entry data
    if (!localStorage.getItem(hourKey)) {
      console.log(`⏰ Creating Hour Entry for ${date}...`);
      
      const hourData = {
        planetSelections: {
          '1': 'Su',
          '2': 'Mo', 
          '3': 'Ra'
        }
      };
      
      localStorage.setItem(hourKey, JSON.stringify(hourData));
    }
  });
  
  console.log('✅ All test data ready!');
  console.log('');
  console.log('🚀 NEXT STEPS:');
  console.log(`1. Navigate to: /user/${testUser.id}`);
  console.log(`2. Click Rule-1 button for date ${rule1Date}`);
  console.log(`3. Watch console for "📊 Extracted formatted data"`);
  console.log(`4. Check table shows format: element-number-/planet-sign`);
  console.log('');
  console.log('💡 Run checkRule1Display() after Rule-1 page loads to verify Step 2');
  
  // Helper function to check the Rule-1 display
  window.checkRule1Display = function() {
    console.log('🔍 CHECKING RULE-1 STEP 2 DISPLAY...');
    
    // Look for formatted data in table cells
    const cells = document.querySelectorAll('table td');
    let formattedCount = 0;
    let rawCount = 0;
    const samples = [];
    
    cells.forEach(cell => {
      const text = cell.textContent.trim();
      if (text && text !== '-') {
        // Check if it matches our new format: element-number-/planet-sign
        if (text.match(/^\w+-\d+-\/\w+-\w+/)) {
          formattedCount++;
          if (samples.length < 3) samples.push(`✅ ${text}`);
        } else if (text.includes('(') && text.includes(')')) {
          rawCount++;
          if (samples.length < 3) samples.push(`❌ ${text}`);
        }
      }
    });
    
    console.log('📊 STEP 2 RESULTS:');
    console.log(`   Formatted cells: ${formattedCount}`);
    console.log(`   Raw cells: ${rawCount}`);
    console.log('   Samples:');
    samples.forEach(sample => console.log(`   ${sample}`));
    
    if (formattedCount > 0) {
      console.log('🎉 SUCCESS: Step 2 working - formatted data is displaying!');
    } else if (rawCount > 0) {
      console.log('⚠️ ISSUE: Still showing raw data, formatted data not displaying');
    } else {
      console.log('❓ UNCLEAR: No data found in table cells');
    }
    
    return { formatted: formattedCount, raw: rawCount };
  };
  
  // Auto-navigate if on home page
  if (window.location.pathname === '/') {
    console.log('🚀 Auto-navigating to user page...');
    window.location.href = `/user/${testUser.id}`;
  }
  
})();
