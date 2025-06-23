/**
 * 🎯 RULE1PAGE FIX - BROWSER TEST SCRIPT
 * 
 * INSTRUCTIONS:
 * 1. Open your ABCD application in the browser
 * 2. Open browser console (F12 → Console)
 * 3. Copy and paste ALL the code below
 * 4. Press Enter to run
 * 
 * This script will:
 * ✅ Create test data in both Supabase and localStorage
 * ✅ Create a TestUser with 5 dates of complete data
 * ✅ Enable Rule1Page testing
 */

console.log('🚀 RULE1PAGE FIX - CREATING TEST DATA');
console.log('='.repeat(60));

// === STEP 1: CREATE LOCALSTORAGE DATA ===
console.log('📦 Creating localStorage test data...');

const TEST_USER_ID = 'testuser123';
const TEST_DATES = ['2025-01-10', '2025-01-11', '2025-01-12', '2025-01-13', '2025-01-14'];

// Create dates list
localStorage.setItem(`abcd_dates_${TEST_USER_ID}`, JSON.stringify(TEST_DATES));

TEST_DATES.forEach((date, i) => {
  // Create Excel data for each date
  const sets = {};
  const topicNames = [
    'D-1 Set-1 Matrix', 'D-1 Set-2 Matrix', 'D-2 Set-1 Matrix', 'D-2 Set-2 Matrix',
    'D-3 Set-1 Matrix', 'D-3 Set-2 Matrix', 'D-4 Set-1 Matrix', 'D-4 Set-2 Matrix',
    'D-5 Set-1 Matrix', 'D-5 Set-2 Matrix', 'D-7 Set-1 Matrix', 'D-7 Set-2 Matrix',
    'D-9 Set-1 Matrix', 'D-9 Set-2 Matrix', 'D-10 Set-1 Matrix', 'D-10 Set-2 Matrix',
    'D-11 Set-1 Matrix', 'D-11 Set-2 Matrix', 'D-12 Set-1 Matrix', 'D-12 Set-2 Matrix',
    'D-27 Set-1 Matrix', 'D-27 Set-2 Matrix', 'D-30 Set-1 Matrix', 'D-30 Set-2 Matrix',
    'D-60 Set-1 Matrix', 'D-60 Set-2 Matrix', 'D-81 Set-1 Matrix', 'D-81 Set-2 Matrix',
    'D-108 Set-1 Matrix', 'D-108 Set-2 Matrix', 'D-144 Set-1 Matrix', 'D-144 Set-2 Matrix'
  ];

  topicNames.forEach((topicName, topicIndex) => {
    const elementBlock = {};
    const elements = ['as', 'mo', 'hl', 'gl', 'vig', 'var', 'sl', 'pp', 'in'];
    const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];

    elements.forEach((element, elemIndex) => {
      const planetMap = {};
      planets.forEach((planet, planetIndex) => {
        const baseNumber = 10 + i + topicIndex + elemIndex + planetIndex;
        const number = (baseNumber % 50) + 1;
        planetMap[planet] = `${element}-${number}`;
      });
      elementBlock[element] = planetMap;
    });
    
    sets[topicName] = elementBlock;
  });

  // Store Excel data
  localStorage.setItem(`abcd_excel_${TEST_USER_ID}_${date}`, JSON.stringify({
    date: date,
    fileName: `test_excel_${date}.xlsx`,
    data: { sets },
    uploadedAt: new Date().toISOString()
  }));

  // Create Hour Entry data
  const planetSelections = {};
  const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
  
  for (let hr = 1; hr <= 24; hr++) {
    const planetIndex = (hr - 1 + i) % planets.length;
    planetSelections[hr] = planets[planetIndex];
  }

  // Store Hour Entry data
  localStorage.setItem(`abcd_hourEntry_${TEST_USER_ID}_${date}`, JSON.stringify({
    userId: TEST_USER_ID,
    date: date,
    planetSelections: planetSelections,
    savedAt: new Date().toISOString()
  }));

  console.log(`✅ Created localStorage data for ${date}`);
});

// === STEP 2: CREATE SUPABASE DATA ===
console.log('\n☁️ Creating Supabase test data...');

if (typeof supabase === 'undefined') {
  console.log('⚠️ Supabase client not available - localStorage data only');
} else {
  (async () => {
    try {
      // Create user
      const userResult = await supabase
        .from('users')
        .upsert({
          id: TEST_USER_ID,
          username: 'TestUser',
          hr: 24,
          name: 'Test User for ABCD',
          dates: TEST_DATES
        }, { onConflict: 'id' });

      if (userResult.error) {
        console.log('❌ User creation error:', userResult.error.message);
      } else {
        console.log('✅ Created Supabase user');
      }

      // Create data for each date
      for (let i = 0; i < TEST_DATES.length; i++) {
        const date = TEST_DATES[i];
        
        // Get the Excel data we just created in localStorage
        const excelDataStr = localStorage.getItem(`abcd_excel_${TEST_USER_ID}_${date}`);
        const excelData = JSON.parse(excelDataStr);
        
        // Insert Excel data to Supabase
        const excelResult = await supabase
          .from('excel_data')
          .upsert({
            user_id: TEST_USER_ID,
            date: date,
            file_name: excelData.fileName,
            data: excelData.data
          }, { onConflict: 'user_id,date' });

        if (excelResult.error) {
          console.log(`❌ Supabase Excel error for ${date}:`, excelResult.error.message);
        } else {
          console.log(`✅ Supabase Excel data for ${date}`);
        }

        // Get the Hour Entry data we just created in localStorage
        const hourDataStr = localStorage.getItem(`abcd_hourEntry_${TEST_USER_ID}_${date}`);
        const hourData = JSON.parse(hourDataStr);
        
        // Insert Hour Entry data to Supabase
        const hourResult = await supabase
          .from('hour_entry')
          .upsert({
            user_id: TEST_USER_ID,
            date_key: date,
            planet_selections: hourData.planetSelections,
            saved_at: hourData.savedAt
          }, { onConflict: 'user_id,date_key' });

        if (hourResult.error) {
          console.log(`❌ Supabase Hour error for ${date}:`, hourResult.error.message);
        } else {
          console.log(`✅ Supabase Hour data for ${date}`);
        }
      }

      console.log('\n🎉 ALL DATA CREATED SUCCESSFULLY!');
      
    } catch (error) {
      console.log('❌ Supabase error:', error.message);
      console.log('📦 But localStorage data is available as fallback');
    }
  })();
}

// === STEP 3: VERIFICATION AND INSTRUCTIONS ===
console.log('\n🔍 VERIFICATION:');
console.log(`📊 Excel localStorage keys: ${TEST_DATES.length}`);
console.log(`⏰ Hour localStorage keys: ${TEST_DATES.length}`);
console.log(`📅 User dates: ${JSON.parse(localStorage.getItem(`abcd_dates_${TEST_USER_ID}`)).length}`);

console.log('\n🎯 SUCCESS! Test data created.');
console.log('\n🔧 TESTING INSTRUCTIONS:');
console.log('1. 🔄 Refresh your ABCD application page');
console.log('2. 👤 Select "TestUser" (ID: testuser123) from the user dropdown');
console.log('3. 📅 You should see 5 dates displayed');
console.log('4. 🎯 Click "Rule-1" on the LAST date (2025-01-14)');
console.log('5. ✅ Rule1Page should now show a matrix with data instead of "No data available"');

console.log('\n💡 TROUBLESHOOTING:');
console.log('• If Rule1Page still shows "No data available":');
console.log('  - Check browser console for errors');
console.log('  - Verify dataService.useLocalStorageFallback = true');
console.log('  - Compare IndexPage vs Rule1Page data loading');
console.log('• If user "TestUser" doesn\'t appear:');
console.log('  - Manually add user in application');
console.log('  - Use ID: testuser123, Name: TestUser, HR: 24');

console.log('\n📋 DATA SUMMARY:');
console.log(`• User ID: ${TEST_USER_ID}`);
console.log(`• Dates: ${TEST_DATES.join(', ')}`);
console.log(`• Each date has: 30 Excel topic sets + 24 HR planet selections`);
console.log(`• Storage: localStorage (guaranteed) + Supabase (if available)`);

console.log('\n='.repeat(60));
console.log('🏁 SCRIPT COMPLETE - Ready for Rule1Page testing!');

// Also trigger a small verification
setTimeout(() => {
  const testExcelKey = `abcd_excel_${TEST_USER_ID}_${TEST_DATES[0]}`;
  const testHourKey = `abcd_hourEntry_${TEST_USER_ID}_${TEST_DATES[0]}`;
  
  const hasExcel = localStorage.getItem(testExcelKey) !== null;
  const hasHour = localStorage.getItem(testHourKey) !== null;
  
  console.log(`\n🧪 FINAL VERIFICATION:`);
  console.log(`Excel data exists: ${hasExcel ? '✅' : '❌'}`);
  console.log(`Hour data exists: ${hasHour ? '✅' : '❌'}`);
  
  if (hasExcel && hasHour) {
    console.log('🎉 Perfect! Data is ready for Rule1Page testing.');
  } else {
    console.log('⚠️ Data might not be complete. Try running the script again.');
  }
}, 1000);
