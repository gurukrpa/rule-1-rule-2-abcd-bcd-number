#!/usr/bin/env node

// 🔍 Debug Rule2CompactPage Data Extraction Issue
// This script helps diagnose why extractFromDateAndSet() returns empty arrays

console.log('🔍 RULE2COMPACTPAGE DATA EXTRACTION DEBUG');
console.log('=========================================');
console.log('');

console.log('📋 ISSUE SUMMARY:');
console.log('✅ Issue: "Error: No D-day numbers found" for all 30 topics');
console.log('✅ Location: Rule2CompactPage.jsx - processSetAnalysis() function');
console.log('✅ Trigger: dDayNumbers.length === 0 in line ~175');
console.log('✅ Root Cause: extractFromDateAndSet() returns empty arrays');
console.log('');

console.log('🎯 DATA FLOW ANALYSIS:');
console.log('======================');
console.log('');
console.log('1. PRELOAD PHASE (preloadDateData):');
console.log('   → dataService.getExcelData(userId, targetDate)');
console.log('   → dataService.getHourEntry(userId, targetDate)');
console.log('   → Store in dateDataCache.set(targetDate, {...})');
console.log('');

console.log('2. EXTRACTION PHASE (extractFromDateAndSet):');
console.log('   → dateDataCache.get(targetDate)');
console.log('   → Extract sets and planetSelections');
console.log('   → Find setData = sets[setName]');
console.log('   → Find selectedPlanet = planetSelections[selectedHR]');
console.log('   → Extract numbers from setData[element][selectedPlanet]');
console.log('');

console.log('🚨 POTENTIAL FAILURE POINTS:');
console.log('=============================');
console.log('');
console.log('A. DATA SERVICE ISSUES:');
console.log('   ❌ dataService.getExcelData() returns null/undefined');
console.log('   ❌ dataService.getHourEntry() returns null/undefined');
console.log('   ❌ Data exists but with different structure than expected');
console.log('');

console.log('B. CACHE ISSUES:');
console.log('   ❌ dateDataCache.get() returns null/undefined');
console.log('   ❌ Cache data missing sets or planetSelections');
console.log('   ❌ Cache data structure malformed');
console.log('');

console.log('C. DATA STRUCTURE ISSUES:');
console.log('   ❌ excelData.data.sets vs excelData.sets mismatch');
console.log('   ❌ hourData.planetSelections vs different structure');
console.log('   ❌ Set names dont match TOPIC_ORDER');
console.log('   ❌ Element names or planet codes mismatch');
console.log('');

console.log('🔧 DEBUGGING SCRIPT FOR BROWSER CONSOLE:');
console.log('========================================');
console.log('');
console.log('// Copy/paste this into browser console on Rule2CompactPage:');
console.log('');
console.log('// 1. Check dateDataCache contents');
console.log('console.log("🔍 dateDataCache contents:", dateDataCache);');
console.log('');
console.log('// 2. Check specific date data');
console.log('const testDate = "2025-06-30"; // Replace with actual D-day');
console.log('const cachedData = dateDataCache.get(testDate);');
console.log('console.log(`📊 Data for ${testDate}:`, cachedData);');
console.log('');
console.log('// 3. Check data structure');
console.log('if (cachedData) {');
console.log('  console.log("Excel data:", cachedData.excelData);');
console.log('  console.log("Hour data:", cachedData.hourData);');
console.log('  console.log("Sets:", Object.keys(cachedData.sets || {}));');
console.log('  console.log("Planet selections:", cachedData.planetSelections);');
console.log('}');
console.log('');
console.log('// 4. Test extractFromDateAndSet for one set');
console.log('const testSet = "D-1 Set-1 Matrix";');
console.log('const testResult = extractFromDateAndSet(testDate, testSet);');
console.log('console.log(`🧪 Test extraction for ${testSet}:`, testResult);');
console.log('');

console.log('🎯 EXPECTED OUTPUTS:');
console.log('===================');
console.log('');
console.log('✅ WORKING CASE:');
console.log('   dateDataCache: Map with 4 entries (A, B, C, D days)');
console.log('   cachedData: { excelData: {...}, hourData: {...}, sets: {...}, planetSelections: {...} }');
console.log('   sets: ["D-1 Set-1 Matrix", "D-1 Set-2 Matrix", ...]');
console.log('   planetSelections: {"1": "Su", "2": "Mo", ...}');
console.log('   extractFromDateAndSet result: [5, 6, 7, 8, ...] (numbers array)');
console.log('');
console.log('❌ FAILING CASE:');
console.log('   dateDataCache: Map (might be empty or incomplete)');
console.log('   cachedData: null/undefined or missing properties');
console.log('   sets: {} (empty object) or missing expected set names');
console.log('   planetSelections: {} (empty object) or missing HR selections');
console.log('   extractFromDateAndSet result: [] (empty array)');
console.log('');

console.log('🚀 QUICK FIX APPROACH:');
console.log('======================');
console.log('');
console.log('1. IDENTIFY: Use browser console debug script above');
console.log('2. LOCATE: Find exactly which step returns empty/null');
console.log('3. COMPARE: Check test data vs live app data structure');
console.log('4. FIX: Adjust data service or cache structure');
console.log('5. VERIFY: Confirm extractFromDateAndSet returns numbers');
console.log('');

console.log('💡 MOST LIKELY FIXES:');
console.log('=====================');
console.log('');
console.log('A. Data Service Fix:');
console.log('   • Check if DataService.getExcelData() returns correct structure');
console.log('   • Verify if data exists in Supabase/localStorage for test dates');
console.log('   • Ensure fallback logic works properly');
console.log('');
console.log('B. Cache Structure Fix:');
console.log('   • Fix dateDataCache.set() to store correct structure');
console.log('   • Ensure sets and planetSelections are properly extracted');
console.log('   • Check if Excel data nested under .data property');
console.log('');
console.log('C. Data Format Fix:');
console.log('   • Verify Excel data structure: excelData.sets vs excelData.data.sets');
console.log('   • Check Hour data structure: hourData.planetSelections');
console.log('   • Ensure topic names match TOPIC_ORDER exactly');
console.log('');

console.log('✅ Once this issue is fixed, Rule2CompactPage should work perfectly!');
console.log('');
