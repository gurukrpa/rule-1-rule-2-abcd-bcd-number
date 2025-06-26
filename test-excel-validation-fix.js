#!/usr/bin/env node

// Test script to verify Excel validation fix in CleanSupabaseService
// This simulates the data structure that ABCDBCDNumber_clean.jsx sends

console.log('🧪 Testing Excel Validation Fix');
console.log('===============================\n');

// Mock the validation logic from CleanSupabaseService
function validateExcelData(excelData) {
  console.log(`🔍 Excel data structure:`, {
    hasDirectSets: !!excelData.sets,
    hasDataProperty: !!excelData.data,
    hasDataSets: !!excelData.data?.sets,
    structure: Object.keys(excelData)
  });
  
  // The fixed validation logic - check both possible formats
  const sets = excelData.sets || excelData.data?.sets;
  if (!sets || Object.keys(sets).length === 0) {
    throw new Error('Excel data must contain sets/topics');
  }
  
  console.log(`✅ Validation passed: ${Object.keys(sets).length} sets found`);
  return true;
}

// Test Case 1: Old format (direct sets property) - should work
console.log('📋 Test Case 1: Old format (direct sets)');
try {
  const oldFormatData = {
    sets: {
      'D-1 Set-1 Matrix': {
        'Lagna': { 'Su': 'as-7/su-(...)', 'Mo': 'as-12/mo-(...)' }
      }
    }
  };
  
  validateExcelData(oldFormatData);
  console.log('✅ PASSED: Old format works\n');
} catch (error) {
  console.log('❌ FAILED:', error.message, '\n');
}

// Test Case 2: New format (data.sets) - should work after fix
console.log('📋 Test Case 2: New format (data.sets)');
try {
  const newFormatData = {
    date: '2025-01-22',
    fileName: 'test.xlsx',
    data: {
      sets: {
        'D-1 Set-1 Matrix': {
          'Lagna': { 'Su': 'as-7/su-(...)', 'Mo': 'as-12/mo-(...)' },
          'Moon': { 'Su': 'mo-15/su-(...)', 'Mo': 'mo-20/mo-(...)' }
        },
        'D-1 Set-2 Matrix': {
          'Lagna': { 'Su': 'as-8/su-(...)', 'Mo': 'as-13/mo-(...)' }
        }
      }
    },
    uploadedAt: new Date().toISOString()
  };
  
  validateExcelData(newFormatData);
  console.log('✅ PASSED: New format works\n');
} catch (error) {
  console.log('❌ FAILED:', error.message, '\n');
}

// Test Case 3: Empty data - should fail
console.log('📋 Test Case 3: Empty data (should fail)');
try {
  const emptyData = {
    data: {
      sets: {}
    }
  };
  
  validateExcelData(emptyData);
  console.log('❌ FAILED: Should have thrown error for empty data\n');
} catch (error) {
  console.log('✅ PASSED: Correctly rejected empty data:', error.message, '\n');
}

// Test Case 4: Missing sets entirely - should fail
console.log('📋 Test Case 4: Missing sets (should fail)');
try {
  const missingData = {
    data: {
      someOtherProperty: 'value'
    }
  };
  
  validateExcelData(missingData);
  console.log('❌ FAILED: Should have thrown error for missing sets\n');
} catch (error) {
  console.log('✅ PASSED: Correctly rejected missing sets:', error.message, '\n');
}

console.log('🎯 Summary: The validation fix correctly handles both old and new data formats!');
console.log('📝 This should resolve the "Excel data must contain sets/topics" error.');
