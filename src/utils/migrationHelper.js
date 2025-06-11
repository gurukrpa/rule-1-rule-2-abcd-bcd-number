/**
 * Migration Helper - Utilities to help migrate from localStorage to DataService
 * Run these functions to gradually migrate your data
 */

import { dataService } from '../services/dataService';

/**
 * Check what data exists in localStorage for debugging
 */
export const auditLocalStorageData = (userId) => {
  console.log('🔍 Auditing localStorage data for user:', userId);
  
  const audit = {
    userId,
    dates: [],
    excelFiles: [],
    hourEntries: [],
    otherData: []
  };
  
  // Check for dates
  const datesKey = `abcd_dates_${userId}`;
  const dates = localStorage.getItem(datesKey);
  if (dates) {
    try {
      audit.dates = JSON.parse(dates);
      console.log('📅 Found dates:', audit.dates);
    } catch (e) {
      console.log('❌ Invalid dates JSON');
    }
  }
  
  // Check localStorage for all keys related to this user
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(userId)) {
      const value = localStorage.getItem(key);
      
      if (key.includes('abcd_excel_')) {
        const date = key.replace(`abcd_excel_${userId}_`, '');
        audit.excelFiles.push({ date, size: value.length });
      } else if (key.includes('abcd_hourEntry_')) {
        const date = key.replace(`abcd_hourEntry_${userId}_`, '');
        audit.hourEntries.push({ date, size: value.length });
      } else if (!key.includes('abcd_dates_')) {
        audit.otherData.push({ key, size: value.length });
      }
    }
  }
  
  console.log('📊 Audit Results:', audit);
  return audit;
};

/**
 * Migrate a specific user's data from localStorage to Supabase
 */
export const migrateUserToSupabase = async (userId) => {
  console.log('🚀 Starting migration for user:', userId);
  
  try {
    const result = await dataService.migrateUserData(userId);
    
    if (result.success) {
      console.log('✅ Migration successful!', result);
      
      // Verify the migration
      const verificationResult = await verifyMigration(userId);
      console.log('🔍 Verification results:', verificationResult);
      
      return { success: true, ...result, verification: verificationResult };
    } else {
      console.log('❌ Migration failed:', result.error);
      return result;
    }
  } catch (error) {
    console.error('💥 Migration error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify that data was migrated correctly
 */
export const verifyMigration = async (userId) => {
  console.log('🔍 Verifying migration for user:', userId);
  
  const verification = {
    dates: { localStorage: 0, supabase: 0, match: false },
    excel: { localStorage: 0, supabase: 0, matches: [] },
    hourEntries: { localStorage: 0, supabase: 0, matches: [] }
  };
  
  try {
    // Check dates
    const localDates = dataService.getLocalStorageDates(userId);
    const supabaseDates = await dataService.getDates(userId);
    
    verification.dates.localStorage = localDates.length;
    verification.dates.supabase = supabaseDates.length;
    verification.dates.match = localDates.length === supabaseDates.length;
    
    // Check Excel data for each date
    for (const date of localDates) {
      const localExcel = dataService.getLocalStorageExcelData(userId, date);
      const supabaseExcel = await dataService.getExcelData(userId, date);
      
      if (localExcel) verification.excel.localStorage++;
      if (supabaseExcel) verification.excel.supabase++;
      
      verification.excel.matches.push({
        date,
        localStorage: !!localExcel,
        supabase: !!supabaseExcel,
        match: !!localExcel === !!supabaseExcel
      });
      
      // Check hour entries
      const localHour = dataService.getLocalStorageHourEntry(userId, date);
      const supabaseHour = await dataService.getHourEntry(userId, date);
      
      if (localHour) verification.hourEntries.localStorage++;
      if (supabaseHour) verification.hourEntries.supabase++;
      
      verification.hourEntries.matches.push({
        date,
        localStorage: !!localHour,
        supabase: !!supabaseHour,
        match: !!localHour === !!supabaseHour
      });
    }
    
    console.log('✅ Verification complete:', verification);
    return verification;
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return { error: error.message };
  }
};

/**
 * Test the DataService with a simple round-trip
 */
export const testDataService = async (userId) => {
  console.log('🧪 Testing DataService with user:', userId);
  
  const testDate = '2025-01-15';
  const testExcelData = {
    fileName: 'test.xlsx',
    data: { sets: { 'Test Set': { element1: { Su: 'test-1', Mo: 'test-2' } } } },
    uploadedAt: new Date().toISOString()
  };
  const testHourEntry = {
    planetSelections: { 1: 'Su', 2: 'Mo', 3: 'Ma' },
    savedAt: new Date().toISOString()
  };
  
  try {
    // Test saving
    await dataService.saveDates(userId, [testDate]);
    await dataService.saveExcelData(userId, testDate, testExcelData);
    await dataService.saveHourEntry(userId, testDate, testHourEntry);
    
    console.log('✅ Test data saved');
    
    // Test loading
    const dates = await dataService.getDates(userId);
    const excel = await dataService.getExcelData(userId, testDate);
    const hourEntry = await dataService.getHourEntry(userId, testDate);
    
    console.log('📥 Retrieved data:', { dates, excel, hourEntry });
    
    // Test checking existence
    const hasExcel = await dataService.hasExcelData(userId, testDate);
    const hasHour = await dataService.hasHourEntry(userId, testDate);
    
    console.log('🔍 Existence checks:', { hasExcel, hasHour });
    
    // Cleanup test data
    await dataService.deleteDataForDate(userId, testDate);
    console.log('🧹 Test data cleaned up');
    
    return { success: true, message: 'All tests passed!' };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export all user data for backup
 */
export const backupUserData = async (userId) => {
  console.log('💾 Creating backup for user:', userId);
  
  try {
    const backup = await dataService.exportUserData(userId);
    
    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-${userId}-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup created and downloaded');
    return backup;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
};

// Usage examples for the browser console:
if (typeof window !== 'undefined') {
  window.migrationHelper = {
    audit: auditLocalStorageData,
    migrate: migrateUserToSupabase,
    verify: verifyMigration,
    test: testDataService,
    backup: backupUserData
  };
  
  console.log('🛠️ Migration Helper loaded! Use:');
  console.log('   migrationHelper.audit("userId") - Check localStorage data');
  console.log('   migrationHelper.migrate("userId") - Migrate to Supabase');
  console.log('   migrationHelper.verify("userId") - Verify migration');
  console.log('   migrationHelper.test("userId") - Test DataService');
  console.log('   migrationHelper.backup("userId") - Download backup');
}
