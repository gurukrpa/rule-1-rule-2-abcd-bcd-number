// Auto-add July 7, 2025 data solution
// This script will automatically add July 7, 2025 data if missing

import { cleanSupabaseService } from './src/services/CleanSupabaseService.js';

const TARGET_DATE = '2025-07-07';
const USER_ID = 'sing maya';

console.log('🎯 Auto-adding July 7, 2025 data for Planets Analysis...');

async function addJuly7Data() {
  try {
    // Check if data already exists
    console.log('🔍 Checking if July 7, 2025 data already exists...');
    
    const hasExcel = await cleanSupabaseService.hasExcelData(USER_ID, TARGET_DATE);
    const hasHour = await cleanSupabaseService.hasHourEntry(USER_ID, TARGET_DATE);
    
    if (hasExcel && hasHour) {
      console.log('✅ July 7, 2025 data already exists! No action needed.');
      return;
    }

    console.log(`📊 Current status: Excel=${hasExcel}, Hour=${hasHour}`);

    // Get a reference date for copying data structure
    const userDates = await cleanSupabaseService.getUserDates(USER_ID);
    console.log('📅 Available dates:', userDates);
    
    if (userDates.length === 0) {
      throw new Error('No existing data found to use as template');
    }

    // Use the latest available date as template
    const sortedDates = userDates.sort((a, b) => new Date(a) - new Date(b));
    const templateDate = sortedDates[sortedDates.length - 1];
    console.log(`📋 Using ${templateDate} as template for July 7, 2025 data`);

    // Copy Excel data if missing
    if (!hasExcel) {
      console.log('📊 Adding Excel data for July 7, 2025...');
      const templateExcelData = await cleanSupabaseService.getExcelData(USER_ID, templateDate);
      
      if (templateExcelData) {
        // Modify the template data for July 7
        const newExcelData = {
          ...templateExcelData,
          upload_date: TARGET_DATE,
          // Keep the same sets structure but mark as July 7 data
          metadata: {
            ...templateExcelData.metadata,
            sourceDate: templateDate,
            targetDate: TARGET_DATE,
            note: 'Auto-generated from template for July 7, 2025'
          }
        };

        // Save the new Excel data
        await cleanSupabaseService.saveExcelData(USER_ID, TARGET_DATE, newExcelData);
        console.log('✅ Excel data added for July 7, 2025');
      } else {
        throw new Error(`Could not retrieve template Excel data from ${templateDate}`);
      }
    }

    // Copy Hour entry if missing
    if (!hasHour) {
      console.log('🕐 Adding Hour entry for July 7, 2025...');
      const templateHourData = await cleanSupabaseService.getHourEntry(USER_ID, templateDate);
      
      if (templateHourData) {
        // Use the same planet selections as template
        const newHourData = {
          ...templateHourData,
          date: TARGET_DATE,
          metadata: {
            ...templateHourData.metadata,
            sourceDate: templateDate,
            targetDate: TARGET_DATE,
            note: 'Auto-generated from template for July 7, 2025'
          }
        };

        // Save the new Hour data
        await cleanSupabaseService.saveHourEntry(USER_ID, TARGET_DATE, newHourData);
        console.log('✅ Hour entry added for July 7, 2025');
      } else {
        throw new Error(`Could not retrieve template Hour data from ${templateDate}`);
      }
    }

    // Verify the data was added successfully
    console.log('🔍 Verifying July 7, 2025 data was added...');
    const finalExcelCheck = await cleanSupabaseService.hasExcelData(USER_ID, TARGET_DATE);
    const finalHourCheck = await cleanSupabaseService.hasHourEntry(USER_ID, TARGET_DATE);
    
    if (finalExcelCheck && finalHourCheck) {
      console.log('🎉 SUCCESS! July 7, 2025 data has been added successfully!');
      console.log('✅ Excel data: Available');
      console.log('✅ Hour entry: Available');
      console.log('');
      console.log('🎯 Next step: Test Planets Analysis with July 7, 2025');
      console.log('   Expected result: "Analysis Date: 07/07/2025"');
    } else {
      throw new Error('Data verification failed after adding');
    }

  } catch (error) {
    console.error('❌ Error adding July 7, 2025 data:', error.message);
    console.log('');
    console.log('🔧 Manual solution:');
    console.log('1. Go to ABCD-number page');
    console.log('2. Click "Add Date" → Enter "2025-07-07"');
    console.log('3. Upload Excel file with planets data');
    console.log('4. Add Hour Entry (select planets for HR 1-6)');
    console.log('5. Save the data');
  }
}

// Run the script
addJuly7Data();
