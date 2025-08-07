// Key Mismatch Investigation Tool
// This script helps identify discrepancies between database keys and UI rendering keys

console.log('🔍 KEY MISMATCH INVESTIGATION TOOL - STARTING...');

const investigateKeyMismatch = async () => {
  console.log('='.repeat(80));
  console.log('🔍 KEY MISMATCH INVESTIGATION');
  console.log('='.repeat(80));
  
  // Check if we're in the Rule1Page context
  if (!window.rule1PageDebug) {
    console.error('❌ window.rule1PageDebug not available. Make sure you are on Rule1Page.');
    return;
  }
  
  const debug = window.rule1PageDebug;
  const dualService = window.dualServiceManager;
  
  if (!dualService) {
    console.error('❌ window.dualServiceManager not available.');
    return;
  }
  
  // Get current state info
  const stateInfo = debug.getStateInfo();
  console.log('📊 CURRENT STATE INFO:', stateInfo);
  
  if (!stateInfo.isFullyReady) {
    console.warn('⚠️ Page not fully ready. Missing:', 
      Object.entries(stateInfo.readinessCheck)
        .filter(([key, ready]) => !ready)
        .map(([key]) => key)
    );
  }
  
  const { selectedUser, date, activeHR } = stateInfo;
  
  // Phase 1: Get database records
  console.log('\n📥 PHASE 1: FETCHING DATABASE RECORDS');
  console.log('-'.repeat(50));
  
  try {
    const dbRecords = await dualService.getAllNumberBoxClicksForUserDate(selectedUser, date);
    console.log('📦 Raw database records:', {
      type: typeof dbRecords,
      isArray: Array.isArray(dbRecords),
      length: dbRecords?.length || 0,
      sample: dbRecords?.[0] || null
    });
    
    if (!dbRecords || !Array.isArray(dbRecords) || dbRecords.length === 0) {
      console.log('ℹ️ No database records found. Make sure you have clicked some number boxes.');
      return;
    }
    
    // Filter for current HR
    const hrRecords = dbRecords.filter(record => 
      String(record.hr_number) === String(activeHR)
    );
    
    console.log(`🎯 HR ${activeHR} specific records:`, {
      totalRecords: dbRecords.length,
      hrSpecificRecords: hrRecords.length,
      hrRecords: hrRecords.slice(0, 5) // Show first 5
    });
    
    // Phase 2: Analyze stored keys
    console.log('\n🔑 PHASE 2: ANALYZING STORED KEYS');
    console.log('-'.repeat(50));
    
    const storedKeys = [];
    hrRecords.forEach((record, index) => {
      const key = `${record.set_name}_${record.date_key}_${record.number_value}_HR${record.hr_number}`;
      storedKeys.push({
        index,
        key,
        components: {
          setName: `"${record.set_name}"`,
          dateKey: `"${record.date_key}"`, 
          numberValue: record.number_value,
          hrNumber: record.hr_number
        },
        rawRecord: record,
        isClicked: record.is_clicked === true,
        isPresent: record.is_present
      });
    });
    
    console.log('🔑 STORED KEYS ANALYSIS:', {
      totalKeys: storedKeys.length,
      clickedKeys: storedKeys.filter(k => k.isClicked).length,
      keyPattern: 'setName_dateKey_numberValue_HRhrNumber',
      sampleKeys: storedKeys.slice(0, 3).map(k => k.key)
    });
    
    // Phase 3: Generate expected render keys
    console.log('\n🎨 PHASE 3: ANALYZING EXPECTED RENDER KEYS');
    console.log('-'.repeat(50));
    
    const availableTopics = debug.availableTopics || [];
    const expectedRenderKeys = [];
    
    // Generate keys for all available topics and numbers 1-12
    availableTopics.forEach(topic => {
      for (let num = 1; num <= 12; num++) {
        const expectedKey = `${topic}_${date}_${num}_HR${activeHR}`;
        expectedRenderKeys.push({
          key: expectedKey,
          components: {
            setName: `"${topic}"`,
            dateKey: `"${date}"`,
            numberValue: num,
            hrNumber: activeHR
          },
          topic,
          number: num
        });
      }
    });
    
    console.log('🎨 EXPECTED RENDER KEYS:', {
      totalTopics: availableTopics.length,
      keysPerTopic: 12,
      totalExpectedKeys: expectedRenderKeys.length,
      keyPattern: 'setName_dateKey_numberValue_HRhrNumber',
      sampleKeys: expectedRenderKeys.slice(0, 3).map(k => k.key),
      firstTopic: availableTopics[0] || 'none'
    });
    
    // Phase 4: Compare stored vs expected keys
    console.log('\n🔍 PHASE 4: COMPARING STORED VS EXPECTED KEYS');
    console.log('-'.repeat(50));
    
    const comparison = {
      exactMatches: [],
      storedButNotExpected: [],
      expectedButNotStored: [],
      componentMismatches: []
    };
    
    const storedKeyStrings = storedKeys.map(k => k.key);
    const expectedKeyStrings = expectedRenderKeys.map(k => k.key);
    
    // Find exact matches
    storedKeys.forEach(stored => {
      if (expectedKeyStrings.includes(stored.key)) {
        comparison.exactMatches.push({
          key: stored.key,
          stored: stored,
          expected: expectedRenderKeys.find(e => e.key === stored.key)
        });
      } else {
        comparison.storedButNotExpected.push(stored);
      }
    });
    
    // Find expected but not stored
    expectedRenderKeys.forEach(expected => {
      if (!storedKeyStrings.includes(expected.key)) {
        comparison.expectedButNotStored.push(expected);
      }
    });
    
    // Analyze component-level mismatches
    storedKeys.forEach(stored => {
      expectedRenderKeys.forEach(expected => {
        if (stored.key !== expected.key) {
          const componentDiffs = [];
          
          if (stored.components.setName !== expected.components.setName) {
            componentDiffs.push({
              component: 'setName',
              stored: stored.components.setName,
              expected: expected.components.setName
            });
          }
          
          if (stored.components.dateKey !== expected.components.dateKey) {
            componentDiffs.push({
              component: 'dateKey', 
              stored: stored.components.dateKey,
              expected: expected.components.dateKey
            });
          }
          
          if (stored.components.numberValue !== expected.components.numberValue) {
            componentDiffs.push({
              component: 'numberValue',
              stored: stored.components.numberValue,
              expected: expected.components.numberValue
            });
          }
          
          if (stored.components.hrNumber !== expected.components.hrNumber) {
            componentDiffs.push({
              component: 'hrNumber',
              stored: stored.components.hrNumber,
              expected: expected.components.hrNumber
            });
          }
          
          if (componentDiffs.length > 0 && componentDiffs.length < 4) {
            // Only minor differences - potential matches
            comparison.componentMismatches.push({
              storedKey: stored.key,
              expectedKey: expected.key,
              differences: componentDiffs,
              stored: stored,
              expected: expected
            });
          }
        }
      });
    });
    
    console.log('🔍 COMPARISON RESULTS:', {
      exactMatches: comparison.exactMatches.length,
      storedButNotExpected: comparison.storedButNotExpected.length,
      expectedButNotStored: comparison.expectedButNotStored.length,
      componentMismatches: comparison.componentMismatches.length
    });
    
    // Phase 5: Detailed analysis of mismatches
    console.log('\n🚨 PHASE 5: DETAILED MISMATCH ANALYSIS');
    console.log('-'.repeat(50));
    
    if (comparison.exactMatches.length > 0) {
      console.log('✅ EXACT MATCHES FOUND:', comparison.exactMatches.length);
      comparison.exactMatches.slice(0, 3).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.key}`);
      });
    }
    
    if (comparison.storedButNotExpected.length > 0) {
      console.log('❌ STORED BUT NOT EXPECTED (Database keys not found in render):', 
        comparison.storedButNotExpected.length);
      comparison.storedButNotExpected.slice(0, 3).forEach(stored => {
        console.log(`   🔑 DB Key: ${stored.key}`);
        console.log(`      Components: Set="${stored.components.setName.slice(1, -1)}", Date="${stored.components.dateKey.slice(1, -1)}", Num=${stored.components.numberValue}, HR=${stored.components.hrNumber}`);
      });
    }
    
    if (comparison.expectedButNotStored.length > 0) {
      console.log('❌ EXPECTED BUT NOT STORED (Render keys not found in database):',
        comparison.expectedButNotStored.length);
      comparison.expectedButNotStored.slice(0, 3).forEach(expected => {
        console.log(`   🎨 Render Key: ${expected.key}`);
        console.log(`      Components: Set="${expected.components.setName.slice(1, -1)}", Date="${expected.components.dateKey.slice(1, -1)}", Num=${expected.components.numberValue}, HR=${expected.components.hrNumber}`);
      });
    }
    
    if (comparison.componentMismatches.length > 0) {
      console.log('🔧 COMPONENT MISMATCHES (Keys with minor differences):',
        comparison.componentMismatches.length);
      comparison.componentMismatches.slice(0, 5).forEach(mismatch => {
        console.log(`   🔄 Near Match:`);
        console.log(`      DB:     ${mismatch.storedKey}`);
        console.log(`      Render: ${mismatch.expectedKey}`);
        console.log(`      Diffs:  ${mismatch.differences.map(d => `${d.component}: ${d.stored} → ${d.expected}`).join(', ')}`);
      });
    }
    
    // Phase 6: Root cause analysis
    console.log('\n🎯 PHASE 6: ROOT CAUSE ANALYSIS');
    console.log('-'.repeat(50));
    
    const rootCauses = [];
    
    // Check for date format differences
    const storedDates = [...new Set(storedKeys.map(k => k.components.dateKey))];
    const expectedDates = [...new Set(expectedRenderKeys.map(k => k.components.dateKey))];
    if (JSON.stringify(storedDates) !== JSON.stringify(expectedDates)) {
      rootCauses.push({
        issue: 'Date Format Mismatch',
        details: `Stored: ${storedDates.join(', ')} vs Expected: ${expectedDates.join(', ')}`
      });
    }
    
    // Check for topic name differences
    const storedTopics = [...new Set(storedKeys.map(k => k.components.setName))];
    const expectedTopics = [...new Set(expectedRenderKeys.map(k => k.components.setName))];
    if (storedTopics.length !== expectedTopics.length) {
      rootCauses.push({
        issue: 'Topic Count Mismatch',
        details: `Stored topics: ${storedTopics.length}, Expected topics: ${expectedTopics.length}`
      });
    }
    
    // Check for HR format differences
    const storedHRs = [...new Set(storedKeys.map(k => k.components.hrNumber))];
    const expectedHRs = [...new Set(expectedRenderKeys.map(k => k.components.hrNumber))];
    if (JSON.stringify(storedHRs) !== JSON.stringify(expectedHRs)) {
      rootCauses.push({
        issue: 'HR Format Mismatch',
        details: `Stored: [${storedHRs.join(', ')}] vs Expected: [${expectedHRs.join(', ')}]`
      });
    }
    
    console.log('🎯 IDENTIFIED ROOT CAUSES:', rootCauses.length);
    rootCauses.forEach((cause, i) => {
      console.log(`   ${i + 1}. ${cause.issue}: ${cause.details}`);
    });
    
    // Phase 7: Recommendations
    console.log('\n💡 PHASE 7: RECOMMENDATIONS');
    console.log('-'.repeat(50));
    
    const recommendations = [];
    
    if (comparison.exactMatches.length === 0 && comparison.componentMismatches.length > 0) {
      recommendations.push('🔧 COMPONENT MISMATCH: Check individual component formatting (date, topic names, HR format)');
    }
    
    if (comparison.storedButNotExpected.length > 0) {
      recommendations.push('🗃️ DATABASE CLEANUP: Some database keys don\'t match current render pattern');
    }
    
    if (comparison.expectedButNotStored.length > 0) {
      recommendations.push('💾 SAVE ISSUE: New clicks may not be saving with correct key format');
    }
    
    if (rootCauses.length > 0) {
      recommendations.push('🎯 FIX ROOT CAUSES: Address the identified root causes above');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ NO ISSUES FOUND: Keys appear to match correctly');
    }
    
    console.log('💡 RECOMMENDATIONS:');
    recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    
    // Return summary for programmatic use
    return {
      dbRecords: dbRecords.length,
      hrRecords: hrRecords.length,
      storedKeys: storedKeys.length,
      expectedKeys: expectedRenderKeys.length,
      exactMatches: comparison.exactMatches.length,
      mismatches: comparison.storedButNotExpected.length + comparison.expectedButNotStored.length,
      rootCauses: rootCauses.length,
      recommendations,
      comparison
    };
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
    return null;
  }
};

// Auto-run if we detect Rule1Page context
if (typeof window !== 'undefined' && window.rule1PageDebug) {
  console.log('🚀 Auto-running key mismatch investigation...');
  investigateKeyMismatch().then(result => {
    if (result) {
      console.log('\n🎉 INVESTIGATION COMPLETE!');
      console.log('Summary:', {
        dbRecords: result.dbRecords,
        matches: result.exactMatches,
        mismatches: result.mismatches,
        recommendations: result.recommendations.length
      });
    }
  });
} else {
  console.log('ℹ️ Run this script on Rule1Page, or call investigateKeyMismatch() manually');
}

// Export for manual use
if (typeof window !== 'undefined') {
  window.investigateKeyMismatch = investigateKeyMismatch;
}
