#!/usr/bin/env node

// test-rule2-planets-priority-system.mjs
// Comprehensive test to verify Rule2 → Planets real data priority system

import { readFileSync } from 'fs';

console.log('🧪 Testing Rule2 → Planets Priority System');
console.log('==========================================');

/**
 * Test 1: Verify PlanetsAnalysisPage Integration Components
 */
function testIntegrationComponents() {
  console.log('\n📋 Test 1: Integration Components Verification');
  
  const planetsPath = '/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main/src/components/PlanetsAnalysisPage.jsx';
  const content = readFileSync(planetsPath, 'utf8');
  
  const tests = [
    {
      name: 'Real Analysis Data State',
      pattern: /const \[realAnalysisData, setRealAnalysisData\] = useState\(null\)/,
      required: true
    },
    {
      name: 'Priority System Comment',
      pattern: /Priority 1: Use real analysis data/,
      required: true
    },
    {
      name: 'Real Numbers Check',
      pattern: /realAnalysisData && realAnalysisData\.topicNumbers/,
      required: true
    },
    {
      name: 'REAL ANALYSIS numbers log',
      pattern: /Using REAL ANALYSIS numbers/,
      required: true
    },
    {
      name: 'PlanetsAnalysisDataService Import',
      pattern: /PlanetsAnalysisDataService/,
      required: true
    },
    {
      name: 'D-1 Set-1 Verification Section',
      pattern: /D-1 Set-1 Matrix Verification/,
      required: true
    },
    {
      name: 'Refresh Rule2 Analysis Button',
      pattern: /Refresh Rule2 Analysis/,
      required: true
    },
    {
      name: 'REAL ANALYSIS ACTIVE Status',
      pattern: /REAL ANALYSIS ACTIVE/,
      required: true
    },
    {
      name: 'FALLBACK MODE Status',
      pattern: /FALLBACK MODE/,
      required: true
    }
  ];
  
  let passCount = 0;
  tests.forEach(test => {
    const found = test.pattern.test(content);
    const status = found ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${status} ${test.name}`);
    if (found) passCount++;
  });
  
  console.log(`\n📊 Integration Components: ${passCount}/${tests.length} PASSED`);
  return passCount === tests.length;
}

/**
 * Test 2: Verify Priority System Logic
 */
function testPrioritySystemLogic() {
  console.log('\n🎯 Test 2: Priority System Logic Verification');
  
  const planetsPath = '/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main/src/components/PlanetsAnalysisPage.jsx';
  const content = readFileSync(planetsPath, 'utf8');
  
  // Extract getTopicNumbers function
  const functionMatch = content.match(/const getTopicNumbers = \([^}]+\) => \{([\s\S]*?)\n  \}/);
  
  if (!functionMatch) {
    console.log('   ❌ FAIL getTopicNumbers function not found');
    return false;
  }
  
  const functionBody = functionMatch[1];
  
  const priorityTests = [
    {
      name: 'Priority 1: Real Analysis Data Check',
      pattern: /realAnalysisData && realAnalysisData\.topicNumbers/,
      found: priorityTests => functionBody.includes('realAnalysisData && realAnalysisData.topicNumbers')
    },
    {
      name: 'Real Numbers Validation',
      pattern: /realNumbers && \(realNumbers\.abcd\.length > 0 \|\| realNumbers\.bcd\.length > 0\)/,
      found: () => functionBody.includes('realNumbers.abcd.length > 0 || realNumbers.bcd.length > 0')
    },
    {
      name: 'Priority Order (Real Before Fallback)',
      pattern: /realAnalysisData.*databaseTopicNumbers/s,
      found: () => {
        const realIndex = functionBody.indexOf('realAnalysisData');
        const dbIndex = functionBody.indexOf('databaseTopicNumbers');
        return realIndex > 0 && dbIndex > 0 && realIndex < dbIndex;
      }
    },
    {
      name: 'Fallback to Hardcoded',
      pattern: /hardcodedTopicNumbers/,
      found: () => functionBody.includes('hardcodedTopicNumbers')
    }
  ];
  
  let passCount = 0;
  priorityTests.forEach(test => {
    const found = test.found();
    const status = found ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${status} ${test.name}`);
    if (found) passCount++;
  });
  
  console.log(`\n📊 Priority System: ${passCount}/${priorityTests.length} PASSED`);
  return passCount === priorityTests.length;
}

/**
 * Test 3: Verify Fallback Numbers Configuration
 */
function testFallbackConfiguration() {
  console.log('\n🔒 Test 3: Fallback Numbers Configuration');
  
  const planetsPath = '/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main/src/components/PlanetsAnalysisPage.jsx';
  const content = readFileSync(planetsPath, 'utf8');
  
  // Check for D-1 Set-1 Matrix fallback numbers
  const fallbackMatch = content.match(/'D-1 Set-1 Matrix':\s*\{\s*abcd:\s*\[([^\]]+)\],\s*bcd:\s*\[([^\]]+)\]/);
  
  if (fallbackMatch) {
    const abcdNumbers = fallbackMatch[1].trim();
    const bcdNumbers = fallbackMatch[2].trim();
    
    console.log(`   ✅ PASS Fallback ABCD numbers: [${abcdNumbers}]`);
    console.log(`   ✅ PASS Fallback BCD numbers: [${bcdNumbers}]`);
    
    // Verify these are the expected fallback numbers
    const expectedABCD = '10, 12';
    const expectedBCD = '4, 11';
    
    const abcdMatch = abcdNumbers === expectedABCD;
    const bcdMatch = bcdNumbers === expectedBCD;
    
    console.log(`   ${abcdMatch ? '✅' : '❌'} Fallback ABCD matches expected: [${expectedABCD}]`);
    console.log(`   ${bcdMatch ? '✅' : '❌'} Fallback BCD matches expected: [${expectedBCD}]`);
    
    return abcdMatch && bcdMatch;
  } else {
    console.log('   ❌ FAIL D-1 Set-1 Matrix fallback configuration not found');
    return false;
  }
}

/**
 * Test 4: Verify Service Integration
 */
function testServiceIntegration() {
  console.log('\n🔧 Test 4: Service Integration Verification');
  
  const servicesPath = '/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main/src/services';
  
  const requiredServices = [
    'planetsAnalysisDataService.js',
    'rule2AnalysisService.js', 
    'CleanSupabaseService.js'
  ];
  
  let allServicesExist = true;
  
  requiredServices.forEach(service => {
    try {
      const servicePath = `${servicesPath}/${service}`;
      const content = readFileSync(servicePath, 'utf8');
      console.log(`   ✅ PASS ${service} exists and readable`);
      
      // Check for key methods
      if (service === 'planetsAnalysisDataService.js') {
        const hasGetLatest = content.includes('getLatestAnalysisNumbers');
        console.log(`   ${hasGetLatest ? '✅' : '❌'} getLatestAnalysisNumbers method found`);
      }
      
      if (service === 'rule2AnalysisService.js') {
        const hasPerformAnalysis = content.includes('performRule2Analysis');
        console.log(`   ${hasPerformAnalysis ? '✅' : '❌'} performRule2Analysis method found`);
      }
      
    } catch (error) {
      console.log(`   ❌ FAIL ${service} not found or not readable`);
      allServicesExist = false;
    }
  });
  
  return allServicesExist;
}

/**
 * Test 5: Create Manual Test Instructions
 */
function createManualTestInstructions() {
  console.log('\n📝 Test 5: Manual Testing Instructions');
  
  const instructions = [
    '1. Open browser: http://localhost:5173',
    '2. Navigate to PlanetsAnalysisPage',
    '3. Look for D-1 Set-1 Matrix section',
    '4. Check initial status: should show "⚠ FALLBACK MODE"',
    '5. Click "🎯 Refresh Rule2 Analysis" button',
    '6. Wait for analysis completion',
    '7. Verify status changes to "🎯 REAL ANALYSIS ACTIVE"',
    '8. Check D-1 Set-1 Matrix numbers change from fallback',
    '9. Open browser console and look for:',
    '   - "🎯 [Topic: D-1 Set-1 Matrix] Using REAL ANALYSIS numbers"',
    '   - NOT "🔗 [Topic: D-1 Set-1 Matrix] Using HARDCODED numbers"'
  ];
  
  instructions.forEach(instruction => {
    console.log(`   📋 ${instruction}`);
  });
  
  return true;
}

/**
 * Main Test Runner
 */
async function runAllTests() {
  console.log('🚀 Starting comprehensive Rule2 → Planets integration tests...\n');
  
  const tests = [
    { name: 'Integration Components', test: testIntegrationComponents },
    { name: 'Priority System Logic', test: testPrioritySystemLogic },
    { name: 'Fallback Configuration', test: testFallbackConfiguration },
    { name: 'Service Integration', test: testServiceIntegration },
    { name: 'Manual Test Instructions', test: createManualTestInstructions }
  ];
  
  let totalPassed = 0;
  let totalTests = tests.length;
  
  for (const { name, test } of tests) {
    try {
      const passed = test();
      if (passed) {
        totalPassed++;
        console.log(`\n✅ ${name}: PASSED`);
      } else {
        console.log(`\n❌ ${name}: FAILED`);
      }
    } catch (error) {
      console.log(`\n💥 ${name}: ERROR - ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`🎯 FINAL RESULTS: ${totalPassed}/${totalTests} tests PASSED`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED - Integration is ready for manual verification!');
    console.log('📋 Next: Open browser and test the actual Rule2 → Planets data flow');
  } else {
    console.log('⚠️  Some tests failed - review the issues above before manual testing');
  }
  
  console.log('\n🔍 Expected Manual Test Result:');
  console.log('   Before: D-1 Set-1 Matrix ABCD: [10, 12], BCD: [4, 11] (fallback)');
  console.log('   After:  D-1 Set-1 Matrix ABCD: [1,2,4,7,9], BCD: [5] (real data)');
}

// Run the tests
runAllTests().catch(console.error);
