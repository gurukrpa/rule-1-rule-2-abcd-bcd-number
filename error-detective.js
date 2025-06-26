#!/usr/bin/env node

/**
 * Advanced Error Detective Script
 * Find the exact location of "Cannot convert undefined or null to object" error
 */

console.log('🕵️ Advanced Error Detective - Searching for the culprit...\n');

// Common sources of this error
const errorSources = [
  'Object.keys(undefined)',
  'Object.values(null)', 
  'Object.entries(undefined)',
  'Object.assign(null)',
  'Object.getOwnPropertyNames(undefined)',
  'for...in loop on null/undefined',
  'Object destructuring on null/undefined'
];

console.log('🎯 Common Error Sources:');
errorSources.forEach((source, index) => {
  console.log(`${index + 1}. ${source}`);
});

console.log('\n🔍 Testing Each Scenario:\n');

// Test each scenario
errorSources.forEach((source, index) => {
  console.log(`${index + 1}. Testing: ${source}`);
  
  try {
    switch (index) {
      case 0:
        Object.keys(undefined);
        break;
      case 1:
        Object.values(null);
        break;
      case 2:
        Object.entries(undefined);
        break;
      case 3:
        Object.assign(null, {});
        break;
      case 4:
        Object.getOwnPropertyNames(undefined);
        break;
      case 5:
        for (let key in null) { /* loop */ }
        break;
      case 6:
        const { prop } = null;
        break;
    }
    console.log(`   ✅ Passed (shouldn't happen)`);
  } catch (error) {
    if (error.message.includes('Cannot convert undefined or null to object')) {
      console.log(`   🎯 MATCH! This produces the exact error`);
    } else {
      console.log(`   ❌ Different error: ${error.message}`);
    }
  }
  console.log('');
});

console.log('🧐 Most Likely Locations in React Code:\n');

const reactPatterns = [
  'Object.keys(props) // when props is null',
  'Object.entries(state) // when state is null', 
  'Object.values(data) // when data is null/undefined',
  '{...spreadObject} // when spreadObject is null',
  'for (const key in obj) // when obj is null',
  'Object.assign(target, source) // when target/source is null'
];

reactPatterns.forEach((pattern, index) => {
  console.log(`${index + 1}. ${pattern}`);
});

console.log('\n🔧 Debug Strategy:\n');
console.log('1. 🔍 Check browser dev console for stack trace');
console.log('2. 🎯 Look for the exact line number in error');
console.log('3. 🕵️ Search for Object.* calls around that line');
console.log('4. 🛡️ Add null checks before Object operations');
console.log('5. 🧪 Test with console.log to verify object existence');

console.log('\n🚨 Immediate Actions Needed:\n');
console.log('1. Open browser dev console (F12)');
console.log('2. Navigate to Console tab');
console.log('3. Look for red error with stack trace');
console.log('4. Note the exact file and line number');
console.log('5. Search PlanetsAnalysisPage.jsx for that line');

console.log('\n🎮 Browser Debug Commands:\n');
console.log('Open console and run:');
console.log('```javascript');
console.log('// Check if objects exist');
console.log('console.log("planetsData:", window.planetsData);');
console.log('console.log("hourData:", window.hourData);');
console.log('console.log("rule1LatestData:", window.rule1LatestData);');
console.log('```');

console.log('\n📋 Common React Error Patterns to Check:\n');

const reactChecks = [
  {
    pattern: 'useEffect(() => { Object.keys(data) }, [data])',
    fix: 'useEffect(() => { if(data) Object.keys(data) }, [data])'
  },
  {
    pattern: 'const items = Object.entries(props.data || {})',
    fix: 'const items = Object.entries(props.data || {})'
  },
  {
    pattern: 'return Object.values(state)',
    fix: 'return Object.values(state || {})'
  }
];

reactChecks.forEach((check, index) => {
  console.log(`${index + 1}. PATTERN: ${check.pattern}`);
  console.log(`   FIX: ${check.fix}\n`);
});

console.log('🚀 Ready to hunt down this bug! Check the browser console next.');
