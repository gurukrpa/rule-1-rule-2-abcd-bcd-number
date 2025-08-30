#!/usr/bin/env node

// Test Swiss Ephemeris integration
console.log('=== Swiss Ephemeris Integration Test ===\n');

const { createRequire } = require('module');
const require = createRequire(import.meta.url || __filename);

let swe = null;
let tzlookup = null;

try {
  console.log('1. Testing Swiss Ephemeris package installation...');
  swe = require('sweph');
  console.log('   ✓ Swiss Ephemeris (sweph) package is installed');
  console.log('   Package version:', require('sweph/package.json').version);
} catch (error) {
  console.log('   ✗ Swiss Ephemeris (sweph) package not found');
  console.log('   Error:', error.message);
  console.log('   Installation: npm install sweph');
}

try {
  console.log('\n2. Testing timezone lookup package installation...');
  tzlookup = require('tz-lookup');
  console.log('   ✓ Timezone lookup (tz-lookup) package is installed');
  console.log('   Package version:', require('tz-lookup/package.json').version);
} catch (error) {
  console.log('   ✗ Timezone lookup (tz-lookup) package not found');
  console.log('   Error:', error.message);
  console.log('   Installation: npm install tz-lookup');
}

if (swe) {
  console.log('\n3. Testing Swiss Ephemeris functionality...');
  try {
    // Test basic calculation
    const testJD = 2451545.0; // J2000.0
    console.log('   Testing Julian Day:', testJD);
    
    const sunCalc = swe.calc_ut(testJD, 0, 2); // Sun calculation
    if (sunCalc.flag >= 0) {
      console.log('   ✓ Swiss Ephemeris calculation successful');
      console.log('   Sun longitude at J2000.0:', sunCalc.longitude.toFixed(6), '°');
    } else {
      console.log('   ✗ Swiss Ephemeris calculation failed (flag:', sunCalc.flag, ')');
      console.log('   This usually means ephemeris data files (.se1) are missing');
    }
  } catch (error) {
    console.log('   ✗ Swiss Ephemeris calculation error:', error.message);
  }
}

if (tzlookup) {
  console.log('\n4. Testing timezone lookup functionality...');
  try {
    const newYorkTz = tzlookup(40.7128, -74.0060);
    console.log('   ✓ Timezone lookup working');
    console.log('   New York timezone:', newYorkTz);
  } catch (error) {
    console.log('   ✗ Timezone lookup error:', error.message);
  }
}

console.log('\n=== Test Summary ===');
console.log('- Swiss Ephemeris package:', swe ? '✓ Installed' : '✗ Missing');
console.log('- Timezone lookup package:', tzlookup ? '✓ Installed' : '✗ Missing');

if (swe && tzlookup) {
  console.log('\n🎉 All packages are installed! The Vedic sandbox will use real astronomical calculations.');
  console.log('\nNote: For the most accurate calculations, download Swiss Ephemeris data files (.se1)');
  console.log('and place them in: src/sandbox-vedic/ephe/');
} else {
  console.log('\n⚠️ Some packages are missing. The Vedic sandbox will use mock calculations.');
  console.log('Run the installation commands above to enable real astronomical calculations.');
}

console.log('\n=== Token Format Example ===');
console.log('Expected format: as-K-ascSign-key');
console.log('Example tokens:');
console.log('- sun-1-ar-D-1 → as-1-ar-su (Sun in 1st house, Aries ascendant)');
console.log('- moon-7-li-D-1 → as-7-ar-mo (Moon in 7th house, Aries ascendant)');
console.log('- jupiter-10-ca-D-9 → as-10-ar-ju (Jupiter in 10th house, Navamsa)');
