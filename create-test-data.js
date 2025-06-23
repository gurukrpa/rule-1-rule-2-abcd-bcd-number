#!/usr/bin/env node

/**
 * Create Test Data for ABCD Application
 * This creates both Excel and Hour Entry data in localStorage/Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://azkqdfrsyzcjmvuqgzwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6a3FkZnJzeXpjam12dXFnend0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMTEzNjEsImV4cCI6MjA1MDc4NzM2MX0.dRKQDRwJLwTrYB2ZhILiV4E6RVZ6L0Rj6C6SdDEOu2M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestData() {
  console.log('🚀 CREATING TEST DATA FOR ABCD APPLICATION');
  console.log('='.repeat(60));

  // Test user and dates
  const TEST_USER_ID = 'testuser123';
  const TEST_DATES = [
    '2025-01-10',
    '2025-01-11', 
    '2025-01-12',
    '2025-01-13',
    '2025-01-14'
  ];

  try {
    // 1. Create/ensure user exists
    console.log('👤 Creating test user...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', TEST_USER_ID)
      .single();

    if (!existingUser) {
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: TEST_USER_ID,
          username: 'TestUser',
          hr: 24, // Full 24-hour range
          name: 'Test User for ABCD'
        }]);

      if (userError) {
        console.log('❌ Error creating user:', userError.message);
        return false;
      }
      console.log('✅ Created test user');
    } else {
      console.log('✅ Test user already exists');
    }

    // 2. Create Excel data for each date
    console.log('\n📊 Creating Excel data...');
    for (let i = 0; i < TEST_DATES.length; i++) {
      const date = TEST_DATES[i];
      const dayOffset = i; // Make data unique per date

      // Create 30 topic sets with realistic data
      const sets = {};
      const topicNames = [
        'D-1 Set-1 Matrix', 'D-1 Set-2 Matrix',
        'D-2 Set-1 Matrix', 'D-2 Set-2 Matrix',
        'D-3 Set-1 Matrix', 'D-3 Set-2 Matrix',
        'D-4 Set-1 Matrix', 'D-4 Set-2 Matrix',
        'D-5 Set-1 Matrix', 'D-5 Set-2 Matrix',
        'D-7 Set-1 Matrix', 'D-7 Set-2 Matrix',
        'D-9 Set-1 Matrix', 'D-9 Set-2 Matrix',
        'D-10 Set-1 Matrix', 'D-10 Set-2 Matrix',
        'D-11 Set-1 Matrix', 'D-11 Set-2 Matrix',
        'D-12 Set-1 Matrix', 'D-12 Set-2 Matrix',
        'D-27 Set-1 Matrix', 'D-27 Set-2 Matrix',
        'D-30 Set-1 Matrix', 'D-30 Set-2 Matrix',
        'D-60 Set-1 Matrix', 'D-60 Set-2 Matrix',
        'D-81 Set-1 Matrix', 'D-81 Set-2 Matrix',
        'D-108 Set-1 Matrix', 'D-108 Set-2 Matrix',
        'D-144 Set-1 Matrix', 'D-144 Set-2 Matrix'
      ];

      topicNames.forEach((topicName, topicIndex) => {
        const elementBlock = {};
        
        // Standard 9 elements for each topic
        const elements = ['as', 'mo', 'hl', 'gl', 'vig', 'var', 'sl', 'pp', 'in'];
        const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];

        elements.forEach((element, elemIndex) => {
          const planetMap = {};
          planets.forEach((planet, planetIndex) => {
            // Generate unique numbers for each date/topic/element/planet combination
            const baseNumber = 10 + dayOffset + topicIndex + elemIndex + planetIndex;
            const number = (baseNumber % 50) + 1; // Keep numbers 1-50
            planetMap[planet] = `${element}-${number}`;
          });
          elementBlock[element] = planetMap;
        });
        
        sets[topicName] = elementBlock;
      });

      const excelData = {
        user_id: TEST_USER_ID,
        date: date,
        file_name: `test_excel_${date}.xlsx`,
        data: { sets } // Store as JSON in 'data' column
      };

      const { error: excelError } = await supabase
        .from('excel_data')
        .upsert(excelData, { onConflict: 'user_id,date' });

      if (excelError) {
        console.log(`❌ Error creating Excel data for ${date}:`, excelError.message);
        return false;
      }
      console.log(`✅ Created Excel data for ${date} (${Object.keys(sets).length} sets)`);
    }

    // 3. Create Hour Entry data for each date
    console.log('\n⏰ Creating Hour Entry data...');
    for (let i = 0; i < TEST_DATES.length; i++) {
      const date = TEST_DATES[i];
      
      // Create planet selections for 24 hours
      const planetSelections = {};
      const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
      
      for (let hr = 1; hr <= 24; hr++) {
        // Cycle through planets with some variation per date
        const planetIndex = (hr - 1 + i) % planets.length;
        planetSelections[hr] = planets[planetIndex];
      }

      const hourData = {
        user_id: TEST_USER_ID,
        date_key: date,
        planet_selections: planetSelections,
        saved_at: new Date().toISOString()
      };

      const { error: hourError } = await supabase
        .from('hour_entry')
        .upsert(hourData, { onConflict: 'user_id,date_key' });

      if (hourError) {
        console.log(`❌ Error creating Hour Entry for ${date}:`, hourError.message);
        return false;
      }
      console.log(`✅ Created Hour Entry for ${date} (${Object.keys(planetSelections).length} HR selections)`);
    }

    // 4. Update user dates
    console.log('\n📅 Updating user dates list...');
    const { error: datesError } = await supabase
      .from('users')
      .update({ dates: TEST_DATES })
      .eq('id', TEST_USER_ID);

    if (datesError) {
      console.log('❌ Error updating user dates:', datesError.message);
      return false;
    }
    console.log('✅ Updated user dates list');

    // 5. Verification
    console.log('\n🔍 VERIFICATION:');
    const { data: verifyExcel } = await supabase
      .from('excel_data')
      .select('date, file_name')
      .eq('user_id', TEST_USER_ID);
    
    const { data: verifyHour } = await supabase
      .from('hour_entry')
      .select('date_key')
      .eq('user_id', TEST_USER_ID);

    console.log(`📊 Excel data entries: ${verifyExcel?.length || 0}`);
    console.log(`⏰ Hour entry entries: ${verifyHour?.length || 0}`);
    
    // Check for complete sets
    let completeSets = 0;
    TEST_DATES.forEach(date => {
      const hasExcel = verifyExcel?.some(e => e.date === date);
      const hasHour = verifyHour?.some(h => h.date_key === date);
      if (hasExcel && hasHour) completeSets++;
      console.log(`   ${date}: ${hasExcel ? '📊' : '❌'} Excel, ${hasHour ? '⏰' : '❌'} Hour ${hasExcel && hasHour ? '✅' : '❌'}`);
    });

    console.log(`\n🎯 SUMMARY:`);
    console.log(`   Complete data sets: ${completeSets}/${TEST_DATES.length}`);
    console.log(`   User ID: ${TEST_USER_ID}`);
    console.log(`   Date range: ${TEST_DATES[0]} to ${TEST_DATES[TEST_DATES.length - 1]}`);

    if (completeSets === TEST_DATES.length) {
      console.log('\n🎉 SUCCESS! Test data created successfully');
      console.log('\n🔧 NEXT STEPS:');
      console.log('   1. Refresh your ABCD application');
      console.log('   2. Select "TestUser" in the user dropdown');
      console.log('   3. You should see 5 dates with green status');
      console.log('   4. Click "Index" or "Rule-1" on any date');
      console.log('   5. Both should now show data instead of "No data available"');
      console.log('\n💡 If IndexPage works but Rule1Page still shows "No data":');
      console.log('   - There might be a different data service being used');
      console.log('   - Check the browser console for data loading errors');
      console.log('   - Verify both components use the same dataService instance');
    } else {
      console.log('\n⚠️ WARNING: Some data sets incomplete');
      console.log('   Check error messages above for details');
    }

    return true;

  } catch (error) {
    console.error('❌ FAILED to create test data:', error);
    return false;
  }
}

// Also create localStorage version for compatibility
function createLocalStorageTestData() {
  console.log('\n📦 ALSO CREATING LOCALSTORAGE BACKUP DATA...');
  
  const TEST_USER_ID = 'testuser123';
  const TEST_DATES = [
    '2025-01-10',
    '2025-01-11', 
    '2025-01-12',
    '2025-01-13',
    '2025-01-14'
  ];

  console.log('🚨 COPY AND PASTE THIS INTO BROWSER CONSOLE:');
  console.log('='.repeat(60));
  console.log('// === START COPY FROM HERE ===');
  
  // Generate localStorage commands
  TEST_DATES.forEach((date, i) => {
    const dayOffset = i;
    
    // Excel data
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
          const baseNumber = 10 + dayOffset + topicIndex + elemIndex + planetIndex;
          const number = (baseNumber % 50) + 1;
          planetMap[planet] = `${element}-${number}`;
        });
        elementBlock[element] = planetMap;
      });
      
      sets[topicName] = elementBlock;
    });

    console.log(`localStorage.setItem('abcd_excel_${TEST_USER_ID}_${date}', JSON.stringify(${JSON.stringify({
      date: date,
      fileName: `test_excel_${date}.xlsx`,
      data: { sets },
      uploadedAt: new Date().toISOString()
    })}));`);

    // Hour entry data
    const planetSelections = {};
    const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
    
    for (let hr = 1; hr <= 24; hr++) {
      const planetIndex = (hr - 1 + i) % planets.length;
      planetSelections[hr] = planets[planetIndex];
    }

    console.log(`localStorage.setItem('abcd_hourEntry_${TEST_USER_ID}_${date}', JSON.stringify(${JSON.stringify({
      userId: TEST_USER_ID,
      date: date,
      planetSelections: planetSelections,
      savedAt: new Date().toISOString()
    })}));`);
  });

  // Dates list
  console.log(`localStorage.setItem('abcd_dates_${TEST_USER_ID}', JSON.stringify(${JSON.stringify(TEST_DATES)}));`);
  
  console.log('console.log("✅ localStorage test data created!");');
  console.log('// === END COPY ===');
  console.log('='.repeat(60));
}

// Run the script
if (require.main === module) {
  createTestData()
    .then(success => {
      if (success) {
        createLocalStorageTestData();
        console.log('\n🏁 ALL DONE! Test data creation complete.');
      } else {
        console.log('\n💥 FAILED! Check error messages above.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 SCRIPT FAILED:', error);
      process.exit(1);
    });
}
