// Simple Swiss Ephemeris test
console.log('=== Swiss Ephemeris Test ===\n');

let swe = null;
let tzlookup = null;

console.log('1. Testing sweph package...');
try {
  swe = require('sweph');
  console.log('   ✓ sweph loaded successfully');
  console.log('   Version:', require('sweph/package.json').version);
} catch (error) {
  console.log('   ✗ sweph failed to load:', error.message);
}

console.log('\n2. Testing tz-lookup package...');
try {
  tzlookup = require('tz-lookup');
  console.log('   ✓ tz-lookup loaded successfully');
  console.log('   Version:', require('tz-lookup/package.json').version);
} catch (error) {
  console.log('   ✗ tz-lookup failed to load:', error.message);
}

if (swe) {
  console.log('\n3. Testing Swiss Ephemeris functionality...');
  try {
    const testJD = 2451545.0; // J2000.0
    const sunCalc = swe.calc_ut(testJD, 0, 2);
    if (sunCalc.flag >= 0) {
      console.log('   ✓ Calculation successful');
      console.log('   Sun longitude:', sunCalc.longitude.toFixed(6));
    } else {
      console.log('   ✗ Calculation failed, flag:', sunCalc.flag);
    }
  } catch (error) {
    console.log('   ✗ Calculation error:', error.message);
  }
}

if (tzlookup) {
  console.log('\n4. Testing timezone lookup...');
  try {
    const nyTz = tzlookup(40.7128, -74.0060);
    console.log('   ✓ Timezone lookup successful');
    console.log('   New York timezone:', nyTz);
  } catch (error) {
    console.log('   ✗ Timezone lookup error:', error.message);
  }
}

console.log('\n=== Results ===');
console.log('Swiss Ephemeris:', swe ? 'Available' : 'Not Available');
console.log('Timezone Lookup:', tzlookup ? 'Available' : 'Not Available');
