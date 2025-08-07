/**
 * TIMING & KEY MISMATCH DIAGNOSTIC
 * 
 * This script diagnoses the specific timing issue where reverseTopicMatcher
 * isn't ready when renderNumberBoxes() executes, causing key format mismatches.
 */

console.log('🕐 TIMING & KEY MISMATCH DIAGNOSTIC');
console.log('===================================');
console.log('');

console.log('🎯 SPECIFIC ISSUE: Key format mismatch between restore and render');
console.log('');

console.log('📋 PROBLEM SEQUENCE:');
console.log('1. Page loads → loadNumberBoxClicks() restores: "D-1 Set-1 Matrix_2025-07-21_6_HR1"');
console.log('2. renderNumberBoxes() runs before reverseTopicMatcher ready');
console.log('3. Generates mismatched key: "D-1 (trd) Set-1 Matrix_2025-07-21_6_HR1"');
console.log('4. clickedNumbers state doesn\'t recognize restored keys');
console.log('5. Number boxes don\'t show as clicked despite database restore');
console.log('');

console.log('🔍 DIAGNOSTIC COMMANDS FOR BROWSER CONSOLE:');
console.log('============================================');
console.log('');

console.log('// 1. Check if reverseTopicMatcher is ready');
console.log('console.log("reverseTopicMatcher size:", window.rule1PageDebug?.getStateInfo()?.reverseTopicMatcher?.size || "Not available");');
console.log('');

console.log('// 2. Check current clicked numbers keys');
console.log('const state = window.rule1PageDebug?.getStateInfo();');
console.log('console.log("Clicked numbers keys:", Object.keys(state?.clickedNumbers || {}));');
console.log('');

console.log('// 3. Test key format variations');
console.log('const testKeys = [');
console.log('  "D-1 Set-1 Matrix_2025-07-21_6_HR1",      // Clean format');
console.log('  "D-1 (trd) Set-1 Matrix_2025-07-21_6_HR1", // Annotated format');
console.log('  "D-3 Set-1 Matrix_2025-07-21_7_HR1",');
console.log('  "D-3 (fri) Set-1 Matrix_2025-07-21_7_HR1"');
console.log('];');
console.log('testKeys.forEach(key => {');
console.log('  const exists = state?.clickedNumbers?.hasOwnProperty(key);');
console.log('  console.log(`Key "${key}": ${exists ? "EXISTS" : "MISSING"}`);');
console.log('});');
console.log('');

console.log('// 4. Check reverseTopicMatcher mappings');
console.log('if (window.rule1PageDebug) {');
console.log('  const reverseMapper = window.rule1PageDebug.getStateInfo()?.reverseTopicMatcher;');
console.log('  if (reverseMapper) {');
console.log('    console.log("Topic mappings:");');
console.log('    reverseMapper.forEach((clean, annotated) => {');
console.log('      console.log(`  "${annotated}" → "${clean}"`);');
console.log('    });');
console.log('  } else {');
console.log('    console.log("❌ reverseTopicMatcher not available");');
console.log('  }');
console.log('}');
console.log('');

console.log('// 5. Force timing-aware reload');
console.log('if (window.rule1PageDebug?.forceReloadNumberBoxes) {');
console.log('  console.log("🔄 Force reloading with timing awareness...");');
console.log('  await window.rule1PageDebug.forceReloadNumberBoxes();');
console.log('  console.log("✅ Reload complete - check if keys now match");');
console.log('}');
console.log('');

console.log('🔧 VERIFICATION STEPS:');
console.log('======================');
console.log('');

console.log('STEP 1: Check Current State');
console.log('---------------------------');
console.log('1. Open Rule-1 page with number boxes visible');
console.log('2. Open browser console (F12)');
console.log('3. Run: window.rule1PageDebug.getStateInfo()');
console.log('4. Note the reverseTopicMatcher size and clickedNumbers keys');
console.log('');

console.log('STEP 2: Test Key Variations'); 
console.log('---------------------------');
console.log('1. Copy the diagnostic commands above into console');
console.log('2. Check which key format exists in clickedNumbers');
console.log('3. Compare with what renderNumberBoxes() would generate');
console.log('');

console.log('STEP 3: Verify Timing Guards');
console.log('----------------------------');
console.log('1. Refresh the page and watch console logs');
console.log('2. Look for: "⏳ [RENDER-GUARD] renderNumberBoxes called but reverseTopicMatcher not ready"');
console.log('3. Look for: "🎬 [TRIGGER] All dependencies ready, loading clicks..."');
console.log('4. Ensure the trigger comes BEFORE any render attempts');
console.log('');

console.log('STEP 4: Test Manual Restore');
console.log('---------------------------');
console.log('1. Click "Restore Clicked Numbers" button');
console.log('2. Check if previously clicked numbers become visible');
console.log('3. If not, the timing/key mismatch is confirmed');
console.log('');

console.log('🎯 EXPECTED FIXES IN CURRENT CODE:');
console.log('==================================');
console.log('');

console.log('✅ TIMING GUARD: renderNumberBoxes() checks reverseTopicMatcher.size > 0');
console.log('✅ KEY NORMALIZATION: Uses cleanTopicName = reverseTopicMatcher.get(setName)');
console.log('✅ DEPENDENCY TRIGGER: loadNumberBoxClicks waits for all dependencies');
console.log('✅ CONSISTENT KEYS: Both restore and render use same clean topic name');
console.log('');

console.log('🚨 IF ISSUE PERSISTS:');
console.log('=====================');
console.log('');

console.log('LIKELY CAUSES:');
console.log('1. reverseTopicMatcher still not ready during render');
console.log('2. Race condition between state updates');
console.log('3. Component re-rendering before data is fully restored');
console.log('');

console.log('ADDITIONAL FIXES:');
console.log('1. Increase delay in useEffect from 200ms to 500ms');
console.log('2. Add loading state to prevent premature rendering');
console.log('3. Force re-render after successful data restoration');
console.log('');

console.log('🔄 MANUAL RECOVERY:');
console.log('===================');
console.log('');

console.log('If number boxes still don\'t show as clicked:');
console.log('1. Click "Restore Clicked Numbers" button');
console.log('2. Or run: await window.rule1PageDebug.forceReloadNumberBoxes()');
console.log('3. This will re-trigger the restore with proper timing');
console.log('');

console.log('============================================');
console.log('END OF TIMING DIAGNOSTIC');
console.log('============================================');
