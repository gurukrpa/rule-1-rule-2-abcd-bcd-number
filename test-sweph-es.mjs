// Swiss Ephemeris ES Module Test
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

console.log('=== Swiss Ephemeris ES Module Test ===\n');

let swe = null;
let tzlookup = null;

console.log('1. Testing sweph package...');
try {
  swe = require('sweph');
  console.log('   ✓ sweph loaded successfully');
  
  // Try to get version
  try {
    const pkg = require('sweph/package.json');
    console.log('   Version:', pkg.version);
  } catch (e) {
    console.log('   Version: Unable to determine');
  }
} catch (error) {
  console.log('   ✗ sweph failed to load:', error.message);
  
  // Check if it's a compilation issue
  if (error.message.includes('binding')) {
    console.log('   Note: This may be a native module compilation issue');
    console.log('   Try: npm rebuild sweph');
  }
}

console.log('\n2. Testing tz-lookup package...');
try {
  tzlookup = require('tz-lookup');
  console.log('   ✓ tz-lookup loaded successfully');
  
  try {
    const pkg = require('tz-lookup/package.json');
    console.log('   Version:', pkg.version);
  } catch (e) {
    console.log('   Version: Unable to determine');
  }
} catch (error) {
  console.log('   ✗ tz-lookup failed to load:', error.message);
}

if (swe) {
  console.log('\n3. Testing Swiss Ephemeris functionality...');
  try {
    const testJD = 2451545.0; // J2000.0
    console.log('   Testing calculation for JD:', testJD);
    
    const sunCalc = swe.calc_ut(testJD, 0, 2);
    
    if (sunCalc.flag >= 0 && sunCalc.data) {
      console.log('   ✓ Calculation successful');
      console.log('   Sun longitude:', sunCalc.data[0].toFixed(6), '°');
      console.log('   Calculation flag:', sunCalc.flag);
      
      if (sunCalc.error && sunCalc.error.includes('Moshier')) {
        console.log('   Note: Using built-in Moshier ephemeris (accurate but not highest precision)');
      }
    } else {
      console.log('   ✗ Calculation failed, flag:', sunCalc.flag);
      console.log('   This usually means ephemeris data files are missing');
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

console.log('\n=== Final Status ===');
console.log('Swiss Ephemeris (sweph):', swe ? '✓ Available' : '✗ Not Available');
console.log('Timezone Lookup (tz-lookup):', tzlookup ? '✓ Available' : '✗ Not Available');

if (!swe) {
  console.log('\n📋 Troubleshooting Steps:');
  console.log('1. Check installation: npm list sweph');
  console.log('2. Reinstall package: npm install sweph');
  console.log('3. Rebuild native modules: npm rebuild sweph');
  console.log('4. Check Node.js version compatibility');
}

// Update the checkSwissEphemerisData function status
const status = {
  available: swe !== null && tzlookup !== null,
  swephLoaded: swe !== null,
  tzLookupLoaded: tzlookup !== null,
  message: swe ? 'Swiss Ephemeris loaded successfully' : 'Swiss Ephemeris not available - using mock calculations'
};

console.log('\n🎯 For Vedic Sandbox:', status.message);
