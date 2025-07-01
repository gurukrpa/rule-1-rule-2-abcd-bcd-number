#!/usr/bin/env node
// 🔍 Debug Script: Check Planets Analysis ABCD/BCD Dynamic Loading
// This script verifies why dynamic numbers aren't loading correctly

console.log('🔍 DEBUGGING PLANETS ANALYSIS DYNAMIC ABCD/BCD LOADING');
console.log('======================================================\n');

// Check if we're in the right environment
const fs = require('fs');
const path = require('path');

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

async function debugPlanetsAnalysis() {
  console.log('📋 STEP 1: Checking Component Implementation');
  console.log('===========================================');

  // Check PlanetsAnalysisPageSimple.jsx
  const planetsSimplePath = 'src/components/PlanetsAnalysisPageSimple.jsx';
  if (checkFileExists(planetsSimplePath)) {
    console.log('✅ PlanetsAnalysisPageSimple.jsx exists');
    
    const content = readFile(planetsSimplePath);
    if (content) {
      // Check for dynamic service integration
      const hasDynamicService = content.includes('PlanetsAnalysisDataService');
      const hasAnalysisData = content.includes('analysisData');
      const hasRenderBadges = content.includes('renderABCDBadges');
      const hasGetTopicNumbers = content.includes('getTopicNumbers');
      const hasLoadAnalysisData = content.includes('loadAnalysisData');
      
      console.log(`   - Dynamic service import: ${hasDynamicService ? '✅' : '❌'}`);
      console.log(`   - Analysis data state: ${hasAnalysisData ? '✅' : '❌'}`);
      console.log(`   - Render badges function: ${hasRenderBadges ? '✅' : '❌'}`);
      console.log(`   - Get topic numbers function: ${hasGetTopicNumbers ? '✅' : '❌'}`);
      console.log(`   - Load analysis data function: ${hasLoadAnalysisData ? '✅' : '❌'}`);
      
      // Check for hardcoded fallback
      const hardcodedPattern = /\[(\d+,\s*)*\d+\]/g;
      const hardcodedMatches = content.match(hardcodedPattern);
      if (hardcodedMatches) {
        console.log(`   - Hardcoded fallback arrays found: ${hardcodedMatches.length}`);
        hardcodedMatches.forEach((match, i) => {
          console.log(`     ${i + 1}. ${match}`);
        });
      }
    }
  } else {
    console.log('❌ PlanetsAnalysisPageSimple.jsx not found');
  }

  console.log('\n📋 STEP 2: Checking Service Implementation');
  console.log('=========================================');

  // Check PlanetsAnalysisDataService
  const servicePath = 'src/services/planetsAnalysisDataService.js';
  if (checkFileExists(servicePath)) {
    console.log('✅ planetsAnalysisDataService.js exists');
    
    const serviceContent = readFile(servicePath);
    if (serviceContent) {
      const hasGetLatestAnalysis = serviceContent.includes('getLatestAnalysisNumbers');
      const hasGetTopicNumbers = serviceContent.includes('getTopicNumbers');
      const hasFormatAnalysisResult = serviceContent.includes('formatAnalysisResult');
      const hasRule2Import = serviceContent.includes('rule2AnalysisService');
      const hasRealTimeImport = serviceContent.includes('RealTimeRule2AnalysisService');
      
      console.log(`   - getLatestAnalysisNumbers method: ${hasGetLatestAnalysis ? '✅' : '❌'}`);
      console.log(`   - getTopicNumbers method: ${hasGetTopicNumbers ? '✅' : '❌'}`);
      console.log(`   - formatAnalysisResult method: ${hasFormatAnalysisResult ? '✅' : '❌'}`);
      console.log(`   - rule2AnalysisService import: ${hasRule2Import ? '✅' : '❌'}`);
      console.log(`   - RealTimeRule2AnalysisService import: ${hasRealTimeImport ? '✅' : '❌'}`);
    }
  } else {
    console.log('❌ planetsAnalysisDataService.js not found');
  }

  console.log('\n📋 STEP 3: Checking Dependencies');
  console.log('===============================');

  // Check rule2AnalysisService
  const rule2Path = 'src/services/rule2AnalysisService.js';
  console.log(`   - rule2AnalysisService.js: ${checkFileExists(rule2Path) ? '✅' : '❌'}`);

  // Check realTimeRule2AnalysisService
  const realTimePath = 'src/services/realTimeRule2AnalysisService.js';
  console.log(`   - realTimeRule2AnalysisService.js: ${checkFileExists(realTimePath) ? '✅' : '❌'}`);

  // Check CleanSupabaseService
  const cleanSupabasePath = 'src/services/CleanSupabaseService.js';
  console.log(`   - CleanSupabaseService.js: ${checkFileExists(cleanSupabasePath) ? '✅' : '❌'}`);

  console.log('\n📋 STEP 4: Expected vs Actual Values');
  console.log('===================================');
  
  console.log('📊 CURRENT STATUS:');
  console.log('   - Component shows: [6, 8, 11] and [9, 10] (hardcoded fallback)');
  console.log('   - Expected to show: [10, 12] and [4, 11] (dynamic from database)');
  console.log('   - Target date: 2025-06-30');
  console.log('   - Target user: planets-test-user-2025');

  console.log('\n📋 STEP 5: Browser Console Debugging Steps');
  console.log('==========================================');
  
  console.log('🔧 To debug in browser:');
  console.log('1. Open: http://localhost:5173/planets-analysis/planets-test-user-2025');
  console.log('2. Open DevTools Console (F12)');
  console.log('3. Look for these console messages:');
  console.log('   - "🔍 [PlanetsAnalysisSimple] Loading latest ABCD/BCD analysis..."');
  console.log('   - "🔍 [PlanetsAnalysisSimple] Using user: planets-test-user-2025"');
  console.log('   - "✅ [PlanetsAnalysisSimple] Analysis data loaded:"');
  console.log('');
  console.log('4. If you see errors, check:');
  console.log('   - localStorage has selectedUser and dates data');
  console.log('   - Database has analysis results for 2025-06-30');
  console.log('   - Service methods are being called correctly');

  console.log('\n📋 STEP 6: Manual Browser Test Commands');
  console.log('======================================');
  
  console.log('🧪 Paste these in browser console to test:');
  console.log('');
  console.log('// Check localStorage state');
  console.log('console.log("Selected User:", localStorage.getItem("selectedUser"));');
  console.log('console.log("Active HR:", localStorage.getItem("activeHR"));');
  console.log('const user = "planets-test-user-2025";');
  console.log('console.log("User dates:", localStorage.getItem(`dates_${user}`));');
  console.log('');
  console.log('// Test service directly (if available)');
  console.log('if (window.PlanetsAnalysisDataService) {');
  console.log('  const testResult = await window.PlanetsAnalysisDataService.getLatestAnalysisNumbers(');
  console.log('    "planets-test-user-2025",');
  console.log('    ["2025-06-26", "2025-06-27", "2025-06-28", "2025-06-29", "2025-06-30"],');
  console.log('    1');
  console.log('  );');
  console.log('  console.log("Service result:", testResult);');
  console.log('}');

  console.log('\n📋 STEP 7: Next Actions');
  console.log('======================');
  
  console.log('Based on the results above:');
  console.log('');
  console.log('If components are properly implemented:');
  console.log('  → Check browser console for service call errors');
  console.log('  → Verify database has expected test data');
  console.log('  → Check if localStorage has correct user/dates');
  console.log('');
  console.log('If service calls are failing:');
  console.log('  → Check import paths and dependencies');
  console.log('  → Verify rule2AnalysisService is working');
  console.log('  → Check database connectivity');
  console.log('');
  console.log('If data exists but not loading:');
  console.log('  → Check date format compatibility');
  console.log('  → Verify user ID matching');
  console.log('  → Check if analysis results have expected structure');
}

// Run the debug
debugPlanetsAnalysis().catch(console.error);
