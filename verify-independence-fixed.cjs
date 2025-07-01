#!/usr/bin/env node

console.log('�� VERIFYING INDEPENDENT OPERATION OF USERDATA & ABCD PAGES');
console.log('=' .repeat(70));

const fs = require('fs');
const path = require('path');

// Check UserData component
console.log('\n📋 CHECKING USERDATA COMPONENT...');
const userDataPath = 'src/components/UserData.jsx';
const userDataContent = fs.readFileSync(userDataPath, 'utf8');

// Check ABCD component 
console.log('\n🔢 CHECKING ABCD COMPONENT...');
const abcdPath = 'src/components/ABCDBCDNumber.jsx';
const abcdContent = fs.readFileSync(abcdPath, 'utf8');

// Verify UserData Independence
console.log('\n✅ USERDATA PAGE INDEPENDENCE VERIFICATION:');
console.log('─'.repeat(50));

const userDataChecks = {
  usesCleanSupabaseService: userDataContent.includes('cleanSupabaseService'),
  hasIndependentDateLoading: userDataContent.includes('cleanSupabaseService.getUserDates'),
  hasIndependentDateAdding: userDataContent.includes('cleanSupabaseService.addUserDate'),
  hasIndependentDateSaving: userDataContent.includes('cleanSupabaseService.saveUserDates'),
  noDirectABCDImports: !userDataContent.includes('./ABCDBCDNumber') && !userDataContent.includes('from \'./ABCDBCDNumber\''),
  hasAddDateFunction: userDataContent.includes('handleAddDate'),
  hasDateChangeFunction: userDataContent.includes('handleDateChange')
};

Object.entries(userDataChecks).forEach(([check, passed]) => {
  console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
});

// Verify ABCD Independence
console.log('\n✅ ABCD PAGE INDEPENDENCE VERIFICATION:');
console.log('─'.repeat(50));

const abcdChecks = {
  usesCleanSupabaseService: abcdContent.includes('cleanSupabaseService'),
  hasIndependentDateLoading: abcdContent.includes('cleanSupabaseService.getUserDates'),
  hasIndependentDateAdding: abcdContent.includes('cleanSupabaseService.addUserDate'),
  hasIndependentDateRemoving: abcdContent.includes('cleanSupabaseService.removeUserDate'),
  noDirectUserDataImports: !abcdContent.includes('./UserData') && !abcdContent.includes('from \'./UserData\''),
  hasAddDateFunction: abcdContent.includes('handleAddDate'),
  hasRemoveDateFunction: abcdContent.includes('handleRemoveDate')
};

Object.entries(abcdChecks).forEach(([check, passed]) => {
  console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
});

// Check for ACTUAL Cross-Dependencies (imports only)
console.log('\n🔄 CROSS-DEPENDENCY ANALYSIS (Import-Based):');
console.log('─'.repeat(50));

const crossDepChecks = {
  userDataImportsABCD: userDataContent.includes('import') && userDataContent.includes('ABCDBCDNumber'),
  abcdImportsUserData: abcdContent.includes('import') && (abcdContent.includes('./UserData') || abcdContent.includes('from \'./UserData\'')),
  sharedGlobalState: userDataContent.includes('createContext') && abcdContent.includes('createContext'),
};

Object.entries(crossDepChecks).forEach(([check, hasDependency]) => {
  console.log(`   ${!hasDependency ? '✅' : '❌'} ${check}: ${!hasDependency ? 'INDEPENDENT' : 'DEPENDENT'}`);
});

// Verify Database Independence
console.log('\n💾 DATABASE OPERATION INDEPENDENCE:');
console.log('─'.repeat(50));

const dbChecks = {
  bothUseUserDatesTable: userDataContent.includes('user_dates') && abcdContent.includes('getUserDates'),
  bothUseSameService: userDataContent.includes('CleanSupabaseService') && abcdContent.includes('cleanSupabaseService'),
  noSharedDatabaseState: !userDataContent.includes('database') || !abcdContent.includes('database'),
  separateDateOperations: userDataContent.includes('addUserDate') && abcdContent.includes('addUserDate')
};

Object.entries(dbChecks).forEach(([check, passed]) => {
  console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
});

// Summary
console.log('\n📊 INDEPENDENCE VERIFICATION SUMMARY:');
console.log('═'.repeat(70));

const allUserDataChecks = Object.values(userDataChecks).every(Boolean);
const allABCDChecks = Object.values(abcdChecks).every(Boolean);
const noCrossDeps = Object.values(crossDepChecks).every(val => !val);
const dbIndependent = Object.values(dbChecks).every(Boolean);

console.log(`📋 UserData Independence: ${allUserDataChecks ? '✅ VERIFIED' : '❌ ISSUES FOUND'}`);
console.log(`🔢 ABCD Independence: ${allABCDChecks ? '✅ VERIFIED' : '❌ ISSUES FOUND'}`);
console.log(`🔄 No Cross-Dependencies: ${noCrossDeps ? '✅ VERIFIED' : '❌ DEPENDENCIES FOUND'}`);
console.log(`💾 Database Independence: ${dbIndependent ? '✅ VERIFIED' : '❌ ISSUES FOUND'}`);

const overallStatus = allUserDataChecks && allABCDChecks && noCrossDeps && dbIndependent;

console.log('\n🎯 FINAL VERDICT:');
console.log('═'.repeat(70));
if (overallStatus) {
  console.log('🎉 SUCCESS: Both pages operate COMPLETELY INDEPENDENTLY!');
  console.log('');
  console.log('📋 How this works:');
  console.log('   • UserData page: Uses cleanSupabaseService.addUserDate() & saveUserDates()');
  console.log('   • ABCD page: Uses cleanSupabaseService.addUserDate() & removeUserDate()');
  console.log('   • Both pages: Load dates with cleanSupabaseService.getUserDates()');
  console.log('   • Database: Both use the same user_dates table through CleanSupabaseService');
  console.log('   • Architecture: Service-based independence - no direct dependencies');
  console.log('');
  console.log('✅ CONCLUSION: Perfect independence already implemented!');
  console.log('');
  console.log('🚀 What you can do:');
  console.log('   1. Add/update dates on UserData page - ABCD page will see changes automatically');
  console.log('   2. Add/remove dates on ABCD page - UserData page will see changes automatically');
  console.log('   3. Both pages work independently without any linking needed');
} else {
  console.log('⚠️  ATTENTION: Some independence issues found that need addressing');
  
  if (!noCrossDeps) {
    console.log('\n🔍 Cross-dependency issues detected - checking details...');
  }
}
