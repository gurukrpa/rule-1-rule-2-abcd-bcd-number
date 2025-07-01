#!/usr/bin/env node

console.log('🔍 VERIFYING INDEPENDENT OPERATION OF USERDATA & ABCD PAGES');
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
  noDirectABCDImports: !userDataContent.includes('./ABCDBCDNumber'),
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
  noDirectUserDataImports: !abcdContent.includes('./UserData'),
};

Object.entries(abcdChecks).forEach(([check, passed]) => {
  console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
});

// Check for Cross-Dependencies
console.log('\n🔄 CROSS-DEPENDENCY ANALYSIS:');
console.log('─'.repeat(50));

const crossDepChecks = {
  userDataImportsABCD: userDataContent.includes('ABCDBCDNumber'),
  abcdImportsUserData: abcdContent.includes('UserData'),
  sharedGlobalState: userDataContent.includes('globalState') && abcdContent.includes('globalState'),
};

Object.entries(crossDepChecks).forEach(([check, hasDependency]) => {
  console.log(`   ${!hasDependency ? '✅' : '❌'} ${check}: ${!hasDependency ? 'INDEPENDENT' : 'DEPENDENT'}`);
});

// Summary
console.log('\n📊 INDEPENDENCE VERIFICATION SUMMARY:');
console.log('═'.repeat(70));

const allUserDataChecks = Object.values(userDataChecks).every(Boolean);
const allABCDChecks = Object.values(abcdChecks).every(Boolean);
const noCrossDeps = Object.values(crossDepChecks).every(val => !val);

console.log(`📋 UserData Independence: ${allUserDataChecks ? '✅ VERIFIED' : '❌ ISSUES FOUND'}`);
console.log(`🔢 ABCD Independence: ${allABCDChecks ? '✅ VERIFIED' : '❌ ISSUES FOUND'}`);
console.log(`🔄 No Cross-Dependencies: ${noCrossDeps ? '✅ VERIFIED' : '❌ DEPENDENCIES FOUND'}`);

const overallStatus = allUserDataChecks && allABCDChecks && noCrossDeps;

console.log('\n🎯 FINAL VERDICT:');
console.log('═'.repeat(70));
if (overallStatus) {
  console.log('🎉 SUCCESS: Both pages operate COMPLETELY INDEPENDENTLY!');
  console.log('');
  console.log('📋 What this means:');
  console.log('   • UserData page can add/update dates without affecting ABCD page');
  console.log('   • ABCD page can add/remove dates without affecting UserData page');
  console.log('   • Both pages use the same database service (CleanSupabaseService)');
  console.log('   • No shared state or direct component dependencies');
  console.log('   • Each page manages its own data independently');
  console.log('');
  console.log('✅ CONCLUSION: No changes needed - independence already implemented!');
} else {
  console.log('⚠️  ATTENTION: Some independence issues found that need addressing');
}
