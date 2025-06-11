/**
 * DataService Testing and Migration Demo
 * 
 * To use this in your browser console or component:
 * 1. Import the functions you need
 * 2. Run the demos to see how the migration works
 * 3. Use the migration helper to migrate your real data
 */

import { dataService } from '../services/dataService';
import { 
  auditLocalStorageData, 
  migrateUserToSupabase, 
  testDataService,
  backupUserData 
} from '../utils/migrationHelper';

// Demo: How to use the DataService
export const demoDataService = async () => {
  console.log('🚀 DataService Demo Started');
  
  const testUserId = 'demo-user-123';
  const testDate = '2025-06-11';
  
  try {
    // 1. Add some dates
    console.log('📅 Adding dates...');
    await dataService.saveDates(testUserId, ['2025-06-11', '2025-06-10', '2025-06-09']);
    
    // 2. Add Excel data
    console.log('📊 Adding Excel data...');
    const excelData = {
      fileName: 'demo.xlsx',
      data: {
        sets: {
          'D-1 Set-1 Matrix': {
            'Lagna': {
              'Su': 'hl-7-123',
              'Mo': 'gc-4-456',
              'Ma': 'var-9-789'
            },
            'Moon': {
              'Su': 'sl-2-111',
              'Mo': 'pp-6-222',
              'Ma': 'in-8-333'
            }
          }
        }
      },
      uploadedAt: new Date().toISOString()
    };
    await dataService.saveExcelData(testUserId, testDate, excelData);
    
    // 3. Add hour entry
    console.log('🕐 Adding hour entry...');
    const hourEntry = {
      planetSelections: {
        1: 'Su',  // HR-1 -> Sun
        2: 'Mo',  // HR-2 -> Moon
        3: 'Ma'   // HR-3 -> Mars
      },
      savedAt: new Date().toISOString()
    };
    await dataService.saveHourEntry(testUserId, testDate, hourEntry);
    
    // 4. Retrieve the data
    console.log('📥 Retrieving data...');
    const dates = await dataService.getDates(testUserId);
    const excel = await dataService.getExcelData(testUserId, testDate);
    const hour = await dataService.getHourEntry(testUserId, testDate);
    
    console.log('✅ Demo Results:', {
      dates,
      excel,
      hour
    });
    
    // 5. Check existence
    const hasExcel = await dataService.hasExcelData(testUserId, testDate);
    const hasHour = await dataService.hasHourEntry(testUserId, testDate);
    console.log('🔍 Existence checks:', { hasExcel, hasHour });
    
    // 6. Clean up
    console.log('🧹 Cleaning up demo data...');
    await dataService.deleteDataForDate(testUserId, testDate);
    await dataService.saveDates(testUserId, []); // Clear dates
    
    console.log('🎉 Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
};

// Demo: Migration workflow
export const demoMigration = async (realUserId) => {
  console.log('🔄 Migration Demo for user:', realUserId);
  
  try {
    // 1. Audit current localStorage data
    console.log('1️⃣ Auditing localStorage data...');
    const audit = auditLocalStorageData(realUserId);
    
    // 2. Create backup before migration
    console.log('2️⃣ Creating backup...');
    await backupUserData(realUserId);
    
    // 3. Test the DataService
    console.log('3️⃣ Testing DataService...');
    const testResult = await testDataService(realUserId);
    
    if (!testResult.success) {
      console.error('❌ DataService test failed, aborting migration');
      return;
    }
    
    // 4. Perform migration
    console.log('4️⃣ Performing migration...');
    const migrationResult = await migrateUserToSupabase(realUserId);
    
    if (migrationResult.success) {
      console.log('✅ Migration completed successfully!');
      console.log('📋 Migration summary:', migrationResult);
    } else {
      console.log('❌ Migration failed:', migrationResult.error);
    }
    
  } catch (error) {
    console.error('💥 Migration demo failed:', error);
  }
};

// Utility: Compare localStorage vs Supabase data
export const compareData = async (userId) => {
  console.log('🔍 Comparing localStorage vs Supabase data for user:', userId);
  
  const comparison = {
    dates: {},
    excel: {},
    hourEntries: {}
  };
  
  try {
    // Compare dates
    const localDates = dataService.getLocalStorageDates(userId);
    const supabaseDates = await dataService.getDates(userId);
    
    comparison.dates = {
      localStorage: localDates,
      supabase: supabaseDates,
      match: JSON.stringify(localDates.sort()) === JSON.stringify(supabaseDates.sort())
    };
    
    // Compare Excel and hour data for each date
    const allDates = [...new Set([...localDates, ...supabaseDates])];
    
    for (const date of allDates) {
      // Excel comparison
      const localExcel = dataService.getLocalStorageExcelData(userId, date);
      const supabaseExcel = await dataService.getExcelData(userId, date);
      
      comparison.excel[date] = {
        localStorage: !!localExcel,
        supabase: !!supabaseExcel,
        match: !!localExcel === !!supabaseExcel
      };
      
      // Hour entry comparison
      const localHour = dataService.getLocalStorageHourEntry(userId, date);
      const supabaseHour = await dataService.getHourEntry(userId, date);
      
      comparison.hourEntries[date] = {
        localStorage: !!localHour,
        supabase: !!supabaseHour,
        match: !!localHour === !!supabaseHour
      };
    }
    
    console.log('📊 Comparison results:', comparison);
    return comparison;
    
  } catch (error) {
    console.error('❌ Comparison failed:', error);
    return { error: error.message };
  }
};

// Instructions for manual testing
export const showInstructions = () => {
  console.log(`
🛠️  DATASERVICE TESTING INSTRUCTIONS

1. Demo the DataService:
   demoDataService()

2. Audit your localStorage data:
   auditLocalStorageData('your-user-id')

3. Compare localStorage vs Supabase:
   compareData('your-user-id')

4. Migrate your data:
   demoMigration('your-user-id')

5. Test with real user ID:
   testDataService('your-user-id')

📋 Available in browser console as:
   window.dataServiceDemo = { demo, migrate, compare, instructions }
  `);
};

// Make available in browser for testing
if (typeof window !== 'undefined') {
  window.dataServiceDemo = {
    demo: demoDataService,
    migrate: demoMigration,
    compare: compareData,
    instructions: showInstructions
  };
  
  console.log('🧪 DataService Demo loaded! Run: dataServiceDemo.instructions()');
}
