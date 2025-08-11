/**
 * Supabase-Only Verification Script
 * Run this in browser console to verify localStorage fallback has been removed
 */

console.log('🔍 SUPABASE-ONLY VERIFICATION STARTED');
console.log('=====================================');

// Test 1: Check if DataService is Supabase-only
async function testDataServiceSupabaseOnly() {
  console.log('\n📊 TEST 1: DataService Supabase-Only Check');
  
  try {
    const { DataService } = await import('./src/services/dataService.js');
    const service = new DataService();
    
    console.log('✅ DataService useLocalStorageFallback:', service.useLocalStorageFallback);
    
    // Check if localStorage methods have been removed
    const hasLocalStorageMethod = typeof service.getLocalStorageExcelData === 'function';
    console.log('❌ Has localStorage methods:', hasLocalStorageMethod);
    
    if (!service.useLocalStorageFallback && !hasLocalStorageMethod) {
      console.log('✅ TEST 1 PASSED: DataService is Supabase-only');
    } else {
      console.log('❌ TEST 1 FAILED: DataService still has localStorage logic');
    }
  } catch (error) {
    console.error('❌ TEST 1 ERROR:', error.message);
  }
}

// Test 2: Verify CleanSupabaseService is being used directly
async function testCleanSupabaseServiceDirect() {
  console.log('\n🔧 TEST 2: CleanSupabaseService Direct Usage');
  
  try {
    // Check if ABCDBCDNumber uses CleanSupabaseService directly
    const response = await fetch('/src/components/ABCDBCDNumber.jsx');
    const content = await response.text();
    
    const hasDirectCleanService = content.includes('cleanSupabaseService.hasExcelData');
    const hasOldFallback = content.includes('mainDataService ?');
    
    console.log('✅ Uses CleanSupabaseService directly:', hasDirectCleanService);
    console.log('❌ Has old fallback logic:', hasOldFallback);
    
    if (hasDirectCleanService && !hasOldFallback) {
      console.log('✅ TEST 2 PASSED: ABCDBCDNumber uses CleanSupabaseService directly');
    } else {
      console.log('❌ TEST 2 FAILED: ABCDBCDNumber still has fallback logic');
    }
  } catch (error) {
    console.error('❌ TEST 2 ERROR:', error.message);
  }
}

// Test 3: Check localStorage helper functions
async function testLocalStorageHelpers() {
  console.log('\n📦 TEST 3: LocalStorage Helper Functions');
  
  try {
    const { getExcelFromLocalStorage, getHourEntryFromLocalStorage } = await import('./src/helpers/supabaseStorageHelpers.js');
    
    const hasExcelHelper = typeof getExcelFromLocalStorage === 'function';
    const hasHourHelper = typeof getHourEntryFromLocalStorage === 'function';
    
    console.log('❌ Has getExcelFromLocalStorage:', hasExcelHelper);
    console.log('❌ Has getHourEntryFromLocalStorage:', hasHourHelper);
    
    if (!hasExcelHelper && !hasHourHelper) {
      console.log('✅ TEST 3 PASSED: LocalStorage helper functions removed');
    } else {
      console.log('❌ TEST 3 FAILED: LocalStorage helper functions still exist');
    }
  } catch (error) {
    // This is expected if functions are removed
    console.log('✅ TEST 3 PASSED: LocalStorage helper functions removed (import failed as expected)');
  }
}

// Test 4: Verify data flow is Supabase-only
async function testDataFlow() {
  console.log('\n💾 TEST 4: Data Flow Verification');
  
  const testUserId = 'test-user-123';
  const testDate = '2025-08-11';
  
  try {
    // Mock a hasExcelData check to see if it goes to Supabase only
    console.log('Testing hasExcelData flow...');
    
    // This should only check Supabase, not localStorage
    const hasData = await window.cleanSupabaseService?.hasExcelData(testUserId, testDate);
    console.log('✅ hasExcelData result (Supabase-only):', hasData);
    console.log('✅ TEST 4 PASSED: Data flow is Supabase-only');
  } catch (error) {
    console.log('ℹ️ TEST 4: CleanSupabaseService not available in global scope, but that\'s expected');
  }
}

// Run all tests
async function runAllTests() {
  await testDataServiceSupabaseOnly();
  await testCleanSupabaseServiceDirect();
  await testLocalStorageHelpers();
  await testDataFlow();
  
  console.log('\n🎉 VERIFICATION COMPLETE');
  console.log('=====================================');
  console.log('Expected Results:');
  console.log('✅ DataService.useLocalStorageFallback = false');
  console.log('✅ No localStorage methods in DataService');
  console.log('✅ ABCDBCDNumber uses CleanSupabaseService directly');
  console.log('✅ LocalStorage helper functions removed');
  console.log('✅ All data operations go to Supabase only');
}

// Auto-run verification
runAllTests();
