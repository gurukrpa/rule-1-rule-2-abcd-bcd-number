#!/usr/bin/env node

/**
 * Debug "Ke" (Ketu) data fetching issue - USERDATA PAGE ONLY
 * This script investigates why Ketu data is not fetching after Excel upload
 * SCOPE: Only UserData page, no interference with other pages
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wmfbknptxtowgwqzpfto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmJrbnB0eHRvd2d3cXpwZnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTgzNjA1MywiZXhwIjoyMDM3NDEyMDUzfQ.9YOKn45HQfCQHe9UlFOWY1jDlRYFd-FLw5FH6Q7T4g4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugKetuUserDataIssue() {
  console.log('🔍 Debugging Ketu (Ke) data issue - USERDATA PAGE ONLY\n');

  try {
    // Step 1: Check if we have any users with UserData
    console.log('1️⃣ Checking UserData users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username')
      .limit(5);

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      console.log('❌ No users found');
      return;
    }

    console.log(`✅ Found ${users.length} users`);
    users.forEach(user => console.log(`   - ${user.username} (${user.id})`));

    // Step 2: Check excel_data table for recent uploads
    console.log('\n2️⃣ Checking recent Excel uploads...');
    const { data: excelData, error: excelError } = await supabase
      .from('excel_data')
      .select('user_id, date, file_name, data')
      .order('uploaded_at', { ascending: false })
      .limit(3);

    if (excelError) throw excelError;

    if (!excelData || excelData.length === 0) {
      console.log('❌ No Excel data found');
      return;
    }

    console.log(`✅ Found ${excelData.length} Excel uploads`);

    // Step 3: Analyze each Excel upload for Ketu data
    for (const excel of excelData) {
      console.log(`\n📊 Analyzing Excel data for ${excel.user_id} on ${excel.date}:`);
      console.log(`   File: ${excel.file_name}`);

      const data = excel.data;
      if (!data || !data.sets) {
        console.log('   ❌ No sets data found');
        continue;
      }

      console.log(`   📋 Found ${Object.keys(data.sets).length} sets`);

      // Check each set for Ketu data
      Object.entries(data.sets).forEach(([setName, setData]) => {
        console.log(`\n   🎯 Set: ${setName}`);
        
        if (!setData || typeof setData !== 'object') {
          console.log('     ❌ Invalid set data');
          return;
        }

        // Check if Ketu (Ke) data exists
        const elements = Object.keys(setData);
        console.log(`     📝 Elements: ${elements.length} found`);

        // Look for Ketu data in each element
        let ketuDataFound = false;
        let ketuSamples = [];

        elements.slice(0, 5).forEach(element => { // Check first 5 elements
          const elementData = setData[element];
          if (elementData && elementData.Ke) {
            ketuDataFound = true;
            ketuSamples.push({
              element,
              ketuValue: elementData.Ke
            });
          }
        });

        if (ketuDataFound) {
          console.log(`     ✅ Ketu data found in ${ketuSamples.length} elements`);
          ketuSamples.forEach(sample => {
            console.log(`       - ${sample.element}: Ke = "${sample.ketuValue}"`);
          });
        } else {
          console.log('     ❌ No Ketu data found in this set');
          
          // Show available planets for debugging
          const firstElement = setData[elements[0]];
          if (firstElement) {
            const availablePlanets = Object.keys(firstElement);
            console.log(`     🔍 Available planets: [${availablePlanets.join(', ')}]`);
          }
        }
      });
    }

    // Step 4: Check hr_data table for UserData planet selections
    console.log('\n3️⃣ Checking hr_data for UserData planet selections...');
    const testUser = users[0];
    const { data: hrData, error: hrError } = await supabase
      .from('hr_data')
      .select('hr_number, topic, date, planet_house')
      .eq('user_id', testUser.id)
      .order('date', { ascending: false })
      .limit(10);

    if (hrError) throw hrError;

    if (hrData && hrData.length > 0) {
      console.log(`✅ Found ${hrData.length} hr_data records`);
      
      // Check for Ketu selections
      const ketuSelections = hrData.filter(record => record.planet_house === 'Ke');
      console.log(`🎯 Ketu selections: ${ketuSelections.length}`);
      
      if (ketuSelections.length > 0) {
        console.log('   Recent Ketu selections:');
        ketuSelections.slice(0, 3).forEach(record => {
          console.log(`   - ${record.date} HR-${record.hr_number.replace('HR-', '')} ${record.topic}: Ke`);
        });
      } else {
        console.log('   ❌ No Ketu selections found in hr_data');
      }
    } else {
      console.log('❌ No hr_data records found');
    }

    // Step 5: Test data retrieval simulation
    console.log('\n4️⃣ Simulating UserData page data retrieval...');
    
    if (excelData.length > 0) {
      const testExcel = excelData[0];
      console.log(`Testing with: ${testExcel.file_name} (${testExcel.date})`);
      
      // Simulate how UserData page processes Excel data
      const data = testExcel.data;
      if (data && data.sets) {
        const firstSet = Object.values(data.sets)[0];
        if (firstSet) {
          const firstElement = Object.values(firstSet)[0];
          if (firstElement && firstElement.Ke) {
            console.log('✅ Ketu data accessible in simulation');
            console.log(`   Sample Ke value: "${firstElement.Ke}"`);
            
            // Test degree format parsing
            const keValue = firstElement.Ke;
            const degreeMatch = keValue.match(/(\d+)([A-Za-z]{2})(\d+)/);
            if (degreeMatch) {
              console.log(`   ✅ Ketu degree format valid: ${degreeMatch[1]}${degreeMatch[2]}${degreeMatch[3]}`);
            } else {
              console.log(`   ❌ Ketu degree format invalid: "${keValue}"`);
            }
          } else {
            console.log('❌ Ketu data not accessible in simulation');
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error in debug process:', error);
  }
}

// Run the debug
console.log('🚀 Starting Ketu UserData Debug - NO INTERFERENCE WITH OTHER PAGES\n');
debugKetuUserDataIssue();
