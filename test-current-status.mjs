// Test the current Swiss Ephemeris status
import { checkSwissEphemerisData } from './src/sandbox-vedic/vedicCompute.ts';

console.log('=== Swiss Ephemeris Status Check ===');

const status = checkSwissEphemerisData();
console.log('Available:', status.available);
console.log('Message:', status.message);

console.log('\n=== Environment Info ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

console.log('\n=== Package Check ===');
try {
  const swephPkg = require('sweph/package.json');
  console.log('sweph version:', swephPkg.version);
} catch (e) {
  console.log('sweph package.json not found');
}

try {
  const tzPkg = require('tz-lookup/package.json');
  console.log('tz-lookup version:', tzPkg.version);
} catch (e) {
  console.log('tz-lookup package.json not found');
}
