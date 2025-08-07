import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://quvkqtfygkvdjnqitwmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dmtxdGZ5Z2t2ZGpucWl0d21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MTU1MjYsImV4cCI6MjA0OTM5MTUyNn0.j6LUhtaRGP5FfWlCTOXWjt5j_Xf3_YFwPH-CvV3uGWM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugKetuDataIssue() {
  console.log('🔍 Debug: Investigating "Ke" (Ketu) data fetching issue after Excel upload');
  console.log('================================================================================');

  // 1. Check users
  console.log('\n📊 Step 1: Checking available users...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(5);

  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
    return;
  }

  console.log(`✅ Found ${users.length} users`);
  const testUser = users[0];
  console.log(`🧪 Using test user: ${testUser.username} (ID: ${testUser.id})`);

  // 2. Check Excel data structure
  console.log('\n📋 Step 2: Checking Excel data structure...');
  const { data: excelData, error: excelError } = await supabase
    .from('excel_data')
    .select('*')
    .eq('user_id', testUser.id)
    .limit(1);

  if (excelError) {
    console.error('❌ Error fetching Excel data:', excelError);
    return;
  }

  if (excelData.length === 0) {
    console.log('⚠️ No Excel data found for this user');
    console.log('💡 Creating test Excel data with Ketu data...');
    
    // Create test Excel data with all 9 planets including Ketu
    const testExcelData = {
      user_id: testUser.id,
      date: '2024-12-30',
      file_name: 'debug-ketu-test.xlsx',
      data: {
        sets: {
          'D-1 Set-1 Matrix': {
            'Lagna': {
              'Su': 'as-10/test',
              'Mo': 'as-11/test',
              'Ma': 'as-12/test',
              'Me': 'as-13/test',
              'Ju': 'as-14/test',
              'Ve': 'as-15/test',
              'Sa': 'as-16/test',
              'Ra': 'as-17/test',
              'Ke': 'as-18/test'  // ⭐ KETU DATA
            },
            'Moon': {
              'Su': 'mo-20/test',
              'Mo': 'mo-21/test',
              'Ma': 'mo-22/test',
              'Me': 'mo-23/test',
              'Ju': 'mo-24/test',
              'Ve': 'mo-25/test',
              'Sa': 'mo-26/test',
              'Ra': 'mo-27/test',
              'Ke': 'mo-28/test'  // ⭐ KETU DATA
            }
          }
        }
      }
    };

    const { error: insertError } = await supabase
      .from('excel_data')
      .upsert(testExcelData, { onConflict: 'user_id,date' });

    if (insertError) {
      console.error('❌ Error creating test data:', insertError);
      return;
    }

    console.log('✅ Test Excel data created with Ketu data');
    
    // Re-fetch the data
    const { data: newExcelData } = await supabase
      .from('excel_data')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('date', '2024-12-30')
      .single();
    
    console.log('📋 Analyzing created Excel data structure...');
    analyzeExcelDataStructure(newExcelData);
  } else {
    console.log(`✅ Found ${excelData.length} Excel data records`);
    const testRecord = excelData[0];
    console.log(`📅 Analyzing Excel data for date: ${testRecord.date}`);
    analyzeExcelDataStructure(testRecord);
  }

  // 3. Test data retrieval methods
  console.log('\n🔍 Step 3: Testing data retrieval methods...');
  await testDataRetrievalMethods(testUser.id, '2024-12-30');

  // 4. Test specific planet data access
  console.log('\n🌟 Step 4: Testing specific planet data access...');
  await testPlanetDataAccess(testUser.id, '2024-12-30');
}

function analyzeExcelDataStructure(excelRecord) {
  console.log('\n🔍 Excel Data Structure Analysis:');
  console.log(`   - User ID: ${excelRecord.user_id}`);
  console.log(`   - Date: ${excelRecord.date}`);
  console.log(`   - File Name: ${excelRecord.file_name}`);
  console.log(`   - Data Type: ${typeof excelRecord.data}`);
  
  if (excelRecord.data) {
    console.log(`   - Has 'sets' property: ${!!excelRecord.data.sets}`);
    
    if (excelRecord.data.sets) {
      const sets = excelRecord.data.sets;
      console.log(`   - Number of sets: ${Object.keys(sets).length}`);
      console.log(`   - Set names: ${Object.keys(sets).join(', ')}`);
      
      // Check first set for planet data
      const firstSetName = Object.keys(sets)[0];
      if (firstSetName) {
        const firstSet = sets[firstSetName];
        console.log(`\n   🎯 Analyzing first set: "${firstSetName}"`);
        console.log(`      - Elements: ${Object.keys(firstSet).length}`);
        
        // Check first element for planet data
        const firstElementName = Object.keys(firstSet)[0];
        if (firstElementName) {
          const firstElement = firstSet[firstElementName];
          console.log(`      - First element: "${firstElementName}"`);
          console.log(`      - Planets in first element: ${Object.keys(firstElement).join(', ')}`);
          
          // Specifically check for Ketu data
          if (firstElement['Ke']) {
            console.log(`      ✅ KETU DATA FOUND: "${firstElement['Ke']}"`);
          } else {
            console.log(`      ❌ KETU DATA MISSING in first element`);
          }
          
          // Check all planets
          const allPlanets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
          const missingPlanets = allPlanets.filter(planet => !firstElement[planet]);
          if (missingPlanets.length > 0) {
            console.log(`      ⚠️ Missing planets: ${missingPlanets.join(', ')}`);
          } else {
            console.log(`      ✅ All 9 planets present in first element`);
          }
        }
      }
    }
  }
}

async function testDataRetrievalMethods(userId, date) {
  console.log(`\n🔄 Testing data retrieval for User ${userId}, Date ${date}:`);
  
  // Method 1: Direct database query
  console.log('\n   Method 1: Direct database query');
  const { data: directData, error: directError } = await supabase
    .from('excel_data')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (directError) {
    console.log(`   ❌ Direct query error: ${directError.message}`);
  } else {
    console.log(`   ✅ Direct query successful`);
    const ketuDataExists = checkKetuInData(directData.data);
    console.log(`   🌟 Ketu data exists: ${ketuDataExists}`);
  }

  // Method 2: Simulate CleanSupabaseService method
  console.log('\n   Method 2: CleanSupabaseService simulation');
  try {
    const serviceData = await simulateCleanSupabaseService(userId, date);
    if (serviceData) {
      console.log(`   ✅ Service simulation successful`);
      const ketuDataExists = checkKetuInData(serviceData);
      console.log(`   🌟 Ketu data exists: ${ketuDataExists}`);
    } else {
      console.log(`   ❌ Service simulation returned null`);
    }
  } catch (error) {
    console.log(`   ❌ Service simulation error: ${error.message}`);
  }
}

async function simulateCleanSupabaseService(userId, date) {
  try {
    const { data, error } = await supabase
      .from('excel_data')
      .select('data')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error) throw error;
    return data?.data || null;
  } catch (error) {
    console.error('❌ Error in simulateCleanSupabaseService:', error);
    return null;
  }
}

function checkKetuInData(data) {
  if (!data || !data.sets) return false;
  
  let ketuFound = false;
  Object.values(data.sets).forEach(set => {
    Object.values(set).forEach(element => {
      if (element['Ke']) {
        ketuFound = true;
      }
    });
  });
  
  return ketuFound;
}

async function testPlanetDataAccess(userId, date) {
  console.log(`\n🌟 Testing specific planet data access:`);
  
  const { data: excelData } = await supabase
    .from('excel_data')
    .select('data')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (!excelData || !excelData.data?.sets) {
    console.log('   ❌ No Excel data available for testing');
    return;
  }

  const sets = excelData.data.sets;
  const setName = Object.keys(sets)[0]; // Test first set
  const setData = sets[setName];
  
  console.log(`   🎯 Testing set: "${setName}"`);
  
  const allPlanets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
  const results = {};
  
  Object.entries(setData).forEach(([elementName, planetData]) => {
    console.log(`\n      📊 Element: "${elementName}"`);
    
    allPlanets.forEach(planet => {
      const hasData = !!planetData[planet];
      results[planet] = results[planet] || 0;
      if (hasData) results[planet]++;
      
      console.log(`         ${planet}: ${hasData ? '✅' : '❌'} ${planetData[planet] || 'N/A'}`);
    });
  });
  
  console.log(`\n   📊 Planet Data Summary across all elements:`);
  allPlanets.forEach(planet => {
    const count = results[planet] || 0;
    const elementCount = Object.keys(setData).length;
    console.log(`      ${planet}: ${count}/${elementCount} elements have data`);
  });
  
  // Special focus on Ketu
  const ketuCount = results['Ke'] || 0;
  const totalElements = Object.keys(setData).length;
  console.log(`\n   🎯 KETU ANALYSIS:`);
  console.log(`      - Elements with Ketu data: ${ketuCount}/${totalElements}`);
  console.log(`      - Ketu data completeness: ${((ketuCount/totalElements)*100).toFixed(1)}%`);
  
  if (ketuCount === 0) {
    console.log(`      ❌ ISSUE CONFIRMED: No Ketu data found in any elements`);
    console.log(`      💡 This suggests Ketu data is not being saved during Excel upload`);
  } else if (ketuCount < totalElements) {
    console.log(`      ⚠️ PARTIAL ISSUE: Ketu data missing in some elements`);
  } else {
    console.log(`      ✅ Ketu data is complete across all elements`);
  }
}

// Run the debug script
debugKetuDataIssue().catch(console.error);
