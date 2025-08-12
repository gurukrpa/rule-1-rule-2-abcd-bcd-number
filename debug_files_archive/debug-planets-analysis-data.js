#!/usr/bin/env node

/**
 * Debug script to diagnose why Planets Analysis shows red dots instead of green dots
 * This helps identify if the issue is with:
 * 1. Missing realAnalysisData (need to run Rule2CompactPage first)
 * 2. Missing database data
 * 3. TOPIC_NUMBERS fallback issues
 * 4. User configuration problems
 */

console.log('🔍 PLANETS ANALYSIS DATA DIAGNOSTIC');
console.log('=====================================\n');

console.log('📋 RED DOTS vs GREEN DOTS LOGIC:');
console.log('✅ GREEN DOT (●): hasData = true (abcd.length > 0 || bcd.length > 0)');
console.log('❌ RED DOT (○): hasData = false (empty arrays from getTopicNumbersWithNormalization)');
console.log('');

console.log('🔍 DATA SOURCE PRIORITY (in getTopicNumbers function):');
console.log('1. 🎯 Real Analysis Data (from Rule2CompactPage/PastDays analysis)');
console.log('2. 🗄️ Database Numbers (from Supabase)');
console.log('3. 📋 Fallback Hardcoded Numbers (TOPIC_NUMBERS object)');
console.log('');

console.log('🚨 COMMON CAUSES OF RED DOTS:');
console.log('');

console.log('❌ CAUSE 1: No Real Analysis Data Available');
console.log('   → You haven\'t run Rule2CompactPage analysis yet');
console.log('   → Solution: Navigate to Rule2CompactPage and run analysis');
console.log('   → This populates realAnalysisData for current session');
console.log('');

console.log('❌ CAUSE 2: Incomplete Real Analysis Data');
console.log('   → Rule2 analysis ran but found no meaningful ABCD/BCD numbers');
console.log('   → Data gets marked as "incomplete"');
console.log('   → System skips to fallback sources');
console.log('');

console.log('❌ CAUSE 3: Missing User Configuration');
console.log('   → User ID not found in URL parameters');
console.log('   → Database queries fail without proper user context');
console.log('   → Check URL format: ?user=your-user-id&hr=your-hr');
console.log('');

console.log('❌ CAUSE 4: Topic Name Mismatch in Fallback');
console.log('   → Excel topics don\'t match TOPIC_NUMBERS object keys');
console.log('   → Example: Excel has "D-1 Set-1" but TOPIC_NUMBERS expects "D-1 Set-1 Matrix"');
console.log('   → Already fixed with Matrix word variations');
console.log('');

console.log('❌ CAUSE 5: Empty Database Data');
console.log('   → No ABCD/BCD numbers stored in Supabase for this user');
console.log('   → Database queries return empty results');
console.log('   → Falls back to TOPIC_NUMBERS (should work if properly configured)');
console.log('');

console.log('🔧 DIAGNOSTIC STEPS:');
console.log('');

console.log('STEP 1: Check Browser Console');
console.log('   → Open Planets Analysis page');
console.log('   → Look for console messages:');
console.log('     ✅ "🎯 [Topic: D-1 Set-1 Matrix] Using REAL ANALYSIS numbers"');
console.log('     ✅ "🗄️ [Topic: D-1 Set-1 Matrix] Using DATABASE numbers"');
console.log('     ✅ "⚠️ [Topic: D-1 Set-1 Matrix] Using FALLBACK numbers"');
console.log('     ❌ "❌ [Topic: D-1 Set-1 Matrix] NO ABCD/BCD NUMBERS FOUND"');
console.log('');

console.log('STEP 2: Check URL Parameters');
console.log('   → Ensure URL has proper user and hr parameters');
console.log('   → Example: http://localhost:5173/?user=your-user-id&hr=12');
console.log('');

console.log('STEP 3: Run Rule2CompactPage Analysis');
console.log('   → Navigate to Rule2CompactPage');
console.log('   → Select proper HR and dates');
console.log('   → Run analysis to populate realAnalysisData');
console.log('   → Return to Planets Analysis page');
console.log('');

console.log('STEP 4: Check Data in Console');
console.log('   → On Planets Analysis page, run in console:');
console.log('     window.realAnalysisData');
console.log('     window.databaseTopicNumbers');
console.log('   → Should show populated data objects');
console.log('');

console.log('🚀 IMMEDIATE SOLUTIONS:');
console.log('');

console.log('SOLUTION A: Run Rule2 Analysis First');
console.log('   1. Navigate to Rule2CompactPage');
console.log('   2. Select dates with at least 4 days of data');
console.log('   3. Select HR period (1-24)');
console.log('   4. Click "Analyze ABCD-BCD Numbers"');
console.log('   5. Wait for analysis to complete');
console.log('   6. Return to Planets Analysis page');
console.log('   7. Should now see green dots (●)');
console.log('');

console.log('SOLUTION B: Check User Switch');
console.log('   → If current user has insufficient data:');
console.log('   → Switch to a user with complete data');
console.log('   → Known working users from documentation:');
console.log('     - 8db9861a-76ce-4ae3-81b0-7a8b82314ef2');
console.log('     - e57d8c46-0186-4749-b18d-9e170aaa5fce');
console.log('     - 2dc97157-e7d5-43b2-93b2-ee3c6252b3dd');
console.log('');

console.log('SOLUTION C: Force Fallback Testing');
console.log('   → Even without real analysis data, TOPIC_NUMBERS should provide fallback');
console.log('   → If still seeing red dots, there may be a topic name issue');
console.log('   → Check console for exact topic names being looked up');
console.log('');

console.log('📊 VALIDATION TEST:');
console.log('After applying solution, verify:');
console.log('✅ Topic selector shows green dots (●) instead of red dots (○)');
console.log('✅ Console shows "Using REAL ANALYSIS numbers" or "Using FALLBACK numbers"');
console.log('✅ ABCD/BCD badges appear in planet matrix display');
console.log('✅ Hour switching works without losing data');
console.log('');

console.log('🔧 If problems persist:');
console.log('1. Check debug-red-dots-issue.html for interactive diagnostics');
console.log('2. Examine browser console for specific error messages');
console.log('3. Verify user has uploaded proper Excel data with all D-numbers');
console.log('4. Ensure development server is running properly');
console.log('');

console.log('✅ This diagnostic should help identify and resolve the red dots issue!');
