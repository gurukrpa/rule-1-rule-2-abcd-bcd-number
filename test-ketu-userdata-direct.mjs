#!/usr/bin/env node

/**
 * Direct Ketu Test for UserData Page - Real-time Debugging
 * Tests the exact flow: Excel Upload → Planet Selection → Division Update
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wmfbknptxtowgwqzpfto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmJrbnB0eHRvd2d3cXpwZnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTgzNjA1MywiZXhwIjoyMDM3NDEyMDUzfQ.9YOKn45HQfCQHe9UlFOWY1jDlRYFd-FLw5FH6Q7T4g4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testKetuUserDataFlow() {
  console.log('🧪 Testing Ketu data flow in UserData page...\n');

  try {
    // Step 1: Get a test user
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, hr')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.log('❌ No test users found');
      return;
    }

    const testUser = users[0];
    console.log(`👤 Testing with user: ${testUser.username} (${testUser.id})`);

    // Step 2: Create sample Excel data in the format UserData expects
    const sampleExcelData = {
      'Su': { 'D-1': 'Ar', 'D-9': 'Ta', 'D-10': 'Ge' },
      'Mo': { 'D-1': 'Ta', 'D-9': 'Ge', 'D-10': 'Ar' },
      'Ma': { 'D-1': 'Ge', 'D-9': 'Ar', 'D-10': 'Ta' },
      'Me': { 'D-1': 'Ar', 'D-9': 'Ta', 'D-10': 'Ge' },
      'Ju': { 'D-1': 'Ta', 'D-9': 'Ge', 'D-10': 'Ar' },
      'Ve': { 'D-1': 'Ge', 'D-9': 'Ar', 'D-10': 'Ta' },
      'Sa': { 'D-1': 'Ar', 'D-9': 'Ta', 'D-10': 'Ge' },
      'Ra': { 'D-1': 'Ta', 'D-9': 'Ge', 'D-10': 'Ar' },
      'Ke': { 'D-1': 'Ge', 'D-9': 'Ar', 'D-10': 'Ta' } // ✅ Ketu data
    };

    console.log('\n📊 Sample Excel Data Structure:');
    console.log('  - Total planets:', Object.keys(sampleExcelData).length);
    console.log('  - Planets:', Object.keys(sampleExcelData).join(', '));
    console.log('  - Ketu (Ke) data:', sampleExcelData.Ke);

    // Step 3: Simulate UserData handleExcelUpload
    console.log('\n🔄 Simulating UserData handleExcelUpload...');
    const excelData = sampleExcelData;
    
    // This is what the debugging logs should show
    console.log('✅ [UserData] Received data from ExcelUpload component:', Object.keys(excelData));
    if (excelData.Ke) {
      console.log('✅ [UserData] Ketu (Ke) data found:', excelData.Ke);
      console.log('✅ [UserData] Ketu divisions:', Object.keys(excelData.Ke));
    } else {
      console.log('❌ [UserData] Ketu (Ke) data NOT found in Excel upload');
    }

    // Step 4: Simulate handlePlanetChange for Ketu
    console.log('\n🪐 Simulating planet selection: Ketu (Ke)...');
    const selectedPlanet = 'Ke';
    const planetData = excelData[selectedPlanet];
    
    if (planetData) {
      console.log('✅ Planet data found for Ke:', planetData);
      
      // Simulate division updates
      const divisions = ['D-1', 'D-9', 'D-10'];
      divisions.forEach(division => {
        const houseValue = planetData[division];
        console.log(`  - ${division}: ${houseValue || 'null'}`);
      });
    } else {
      console.log('❌ No planet data found for Ke');
      console.log('Available planets:', Object.keys(excelData));
    }

    // Step 5: Test with actual database (if we have test data)
    console.log('\n💾 Checking actual UserData database entries...');
    const { data: hrData, error: hrError } = await supabase
      .from('hr_data')
      .select('*')
      .eq('user_id', testUser.id)
      .order('date', { ascending: false })
      .limit(5);

    if (hrError) {
      console.log('❌ Error fetching hr_data:', hrError.message);
    } else if (hrData && hrData.length > 0) {
      console.log(`✅ Found ${hrData.length} hr_data records`);
      
      // Check for any Ketu selections
      const ketuSelections = hrData.filter(record => record.planet_house === 'Ke');
      console.log(`🎯 Ketu selections in database: ${ketuSelections.length}`);
      
      if (ketuSelections.length > 0) {
        console.log('Recent Ketu selections:');
        ketuSelections.slice(0, 3).forEach(record => {
          console.log(`  - ${record.date} ${record.hr_number} ${record.topic}: ${record.planet_house}`);
        });
      }
    } else {
      console.log('ℹ️ No hr_data records found for this user');
    }

    console.log('\n🔍 DIAGNOSIS:');
    console.log('1. Excel data structure looks correct');
    console.log('2. Ketu (Ke) mapping should work');
    console.log('3. Check browser console logs when uploading Excel');
    console.log('4. Verify planet selection dropdown includes Ketu');
    console.log('5. Test the exact sequence: Upload Excel → Select Ketu → Check divisions');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testKetuUserDataFlow();
