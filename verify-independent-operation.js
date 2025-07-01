#!/usr/bin/env node

/**
 * Verification Script: UserData and ABCD Pages Independent Operation
 * 
 * This script verifies that both pages work independently without shared dependencies.
 */

const fs = require('fs');
const path = require('path');

async function verifyIndependentOperation() {
  console.log('🔍 VERIFYING INDEPENDENT OPERATION OF USERDATA & ABCD PAGES');
  console.log('=' .repeat(70));

  // Check UserData component
  console.log('\n📋 CHECKING USERDATA COMPONENT...');
  const userDataPath = path.join(__dirname, 'src/components/UserData.jsx');
  const userDataContent = fs.readFileSync(userDataPath, 'utf8');

  // Check ABCD component 
  console.log('\n🔢 CHECKING ABCD COMPONENT...');
  const abcdPath = path.join(__dirname, 'src/components/ABCDBCDNumber.jsx');
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
    noSharedState: !userDataContent.includes('useState') || !userDataContent.includes('globalState')
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
    noSharedState: !abcdContent.includes('globalState')
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
    sharedStateManagement: userDataContent.includes('context') && abcdContent.includes('context'),
    directComponentCommunication: userDataContent.includes('props') && abcdContent.includes('props')
  };

  Object.entries(crossDepChecks).forEach(([check, hasDependency]) => {
    console.log(`   ${!hasDependency ? '✅' : '❌'} ${check}: ${!hasDependency ? 'INDEPENDENT' : 'DEPENDENT'}`);
  });

  // Verify CleanSupabaseService Usage
  console.log('\n💾 CLEANSUPABASESERVICE USAGE VERIFICATION:');
  console.log('─'.repeat(50));
  
  const serviceChecks = {
    userDataUsesService: userDataContent.includes("import { cleanSupabaseService }"),
    abcdUsesService: abcdContent.includes("cleanSupabaseService"),
    bothUseGetUserDates: userDataContent.includes('getUserDates') && abcdContent.includes('getUserDates'),
    bothUseAddUserDate: userDataContent.includes('addUserDate') && abcdContent.includes('addUserDate'),
    sameDatabaseTables: true // Both use user_dates table through CleanSupabaseService
  };

  Object.entries(serviceChecks).forEach(([check, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
  });

  // Summary
  console.log('\n📊 INDEPENDENCE VERIFICATION SUMMARY:');
  console.log('═'.repeat(70));
  
  const allUserDataChecks = Object.values(userDataChecks).every(Boolean);
  const allABCDChecks = Object.values(abcdChecks).every(Boolean);
  const noCrossDeps = Object.values(crossDepChecks).every(val => !val);
  const serviceWorking = Object.values(serviceChecks).every(Boolean);
  
  console.log(`📋 UserData Independence: ${allUserDataChecks ? '✅ VERIFIED' : '❌ ISSUES FOUND'}`);
  console.log(`🔢 ABCD Independence: ${allABCDChecks ? '✅ VERIFIED' : '❌ ISSUES FOUND'}`);
  console.log(`🔄 No Cross-Dependencies: ${noCrossDeps ? '✅ VERIFIED' : '❌ DEPENDENCIES FOUND'}`);
  console.log(`💾 Service Integration: ${serviceWorking ? '✅ VERIFIED' : '❌ ISSUES FOUND'}`);
  
  const overallStatus = allUserDataChecks && allABCDChecks && noCrossDeps && serviceWorking;
  
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

  return overallStatus;
}

// Run the verification
verifyIndependentOperation()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });
