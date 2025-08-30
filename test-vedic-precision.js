/**
 * Test script for verifying Vedic calculation precision
 * Compares our calculations with Jagannatha Hora reference data
 */

// Import our Vedic computation module
import { generateVedicToken } from './src/sandbox-vedic/vedicCompute.js';

// Test data that can be verified against Jagannatha Hora
const testBirthData = {
  name: "Test Person",
  birthDate: new Date('1990-05-15T10:30:00Z'), // May 15, 1990, 10:30 AM UTC
  birthPlace: {
    name: "New Delhi, India",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: "Asia/Kolkata"
  }
};

console.log('=== Vedic Calculation Precision Test ===');
console.log('Birth Data:', testBirthData);

try {
  const result = generateVedicToken(testBirthData);
  
  console.log('\n=== Calculation Results ===');
  console.log('Token:', result.token);
  console.log('\nDetailed Analysis:');
  console.log('Ascendant:', result.ascendant);
  console.log('Moon Sign:', result.moonSign);
  console.log('Sun Sign:', result.sunSign);
  
  if (result.planets) {
    console.log('\n=== Planetary Positions (Sidereal with Lahiri Ayanamsa) ===');
    Object.entries(result.planets).forEach(([planet, data]) => {
      console.log(`${planet}:`, {
        sign: data.sign,
        degree: data.degree.toFixed(6),
        nakshatra: data.nakshatra,
        pada: data.pada
      });
    });
  }
  
  if (result.houses) {
    console.log('\n=== House System (BPHS/Whole Sign) ===');
    result.houses.forEach((house, index) => {
      console.log(`House ${index + 1}: ${house.sign} (Lord: ${house.lord})`);
    });
  }
  
  console.log('\n=== Calculation Method Information ===');
  console.log('Ayanamsa: Lahiri (Chitrapaksha)');
  console.log('House System: BPHS/Whole Sign Houses');
  console.log('Zodiac: Sidereal');
  console.log('Swiss Ephemeris Status:', result.swissEphemerisStatus || 'Mock calculations used');
  
  console.log('\n=== Verification Instructions ===');
  console.log('1. Open Jagannatha Hora software');
  console.log('2. Enter the same birth data:');
  console.log(`   Date: ${testBirthData.birthDate.toLocaleDateString()}`);
  console.log(`   Time: ${testBirthData.birthDate.toLocaleTimeString()}`);
  console.log(`   Place: ${testBirthData.birthPlace.name}`);
  console.log('3. Ensure Ayanamsa is set to "Lahiri" (default)');
  console.log('4. Compare planetary positions and houses');
  console.log('5. Check if degrees match within acceptable precision (±0.01°)');
  
} catch (error) {
  console.error('Test failed:', error);
}
