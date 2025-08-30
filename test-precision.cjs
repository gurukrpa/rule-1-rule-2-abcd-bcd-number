/**
 * Precision test for Vedic calculations
 * Compare our Swiss Ephemeris calculations with Jagannatha Hora reference data
 */

const swe = require('sweph');

// Reference data from Jagannatha Hora
const referenceData = {
  'Sun': { sign: 'Leo', degree: 28.85, longitude: 148.849716, house: 8 },
  'Moon': { sign: 'Cancer', degree: 27.05, longitude: 117.046456, house: 7 },
  'Mars': { sign: 'Scorpio', degree: 12.37, longitude: 222.371886, house: 11, retrograde: true },
  'Mercury': { sign: 'Taurus', degree: 22.92, longitude: 52.915514, house: 5 },
  'Jupiter': { sign: 'Cancer', degree: 2.52, longitude: 92.522374, house: 7 },
  'Venus': { sign: 'Gemini', degree: 3.46, longitude: 63.462631, house: 6 },
  'Saturn': { sign: 'Pisces', degree: 27.98, longitude: 357.983508, house: 3 },
  'Rahu': { sign: 'Pisces', degree: 19.66, longitude: 349.660968, house: 3, retrograde: true },
  'Ketu': { sign: 'Virgo', degree: 19.66, longitude: 169.660968, house: 9, retrograde: true }
};

// Swiss Ephemeris planet IDs
const planetIds = {
  'Sun': 0,
  'Moon': 1,
  'Mercury': 2,
  'Venus': 3,
  'Mars': 4,
  'Jupiter': 5,
  'Saturn': 6,
  'Rahu': 11, // Mean Node
  'Ketu': 11  // Calculated as Rahu + 180°
};

// Zodiac signs
const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Scorpio', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Test different dates to find the one that matches the reference data
function testDate(year, month, day, hour = 12, minute = 0) {
  console.log(`\\n=== Testing Date: ${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ===`);
  
  const date = new Date(year, month - 1, day, hour, minute);
  const jd = swe.julday(year, month, day, hour + minute/60.0, 1); // 1 = Gregorian calendar
  
  console.log(`Julian Day: ${jd}`);
  
  // Set Lahiri Ayanamsa (most common in Vedic astrology)
  swe.set_sid_mode(1, 0, 0); // SE_SIDM_LAHIRI
  
  const results = {};
  let totalError = 0;
  let planetCount = 0;
  
  for (const [planetName, planetId] of Object.entries(planetIds)) {
    try {
      const flags = 64 | 2; // SEFLG_SIDEREAL | SEFLG_SWIEPH
      const result = swe.calc_ut(jd, planetId, flags);
      
      if (result.flag >= 0) {
        let longitude = result.longitude;
        
        // Special handling for Ketu (Rahu + 180°)
        if (planetName === 'Ketu') {
          longitude = (longitude + 180) % 360;
        }
        
        const signIndex = Math.floor(longitude / 30);
        const degreeInSign = longitude % 30;
        const sign = zodiacSigns[signIndex];
        
        results[planetName] = {
          longitude: longitude,
          sign: sign,
          degree: degreeInSign,
          speed: result.longitudeSpeed
        };
        
        // Compare with reference data
        const ref = referenceData[planetName];
        if (ref) {
          const longError = Math.abs(longitude - ref.longitude);
          const degreeError = Math.abs(degreeInSign - ref.degree);
          
          console.log(`${planetName}:`);
          console.log(`  Calculated: ${sign} ${degreeInSign.toFixed(2)}° (${longitude.toFixed(6)}°)`);
          console.log(`  Reference:  ${ref.sign} ${ref.degree}° (${ref.longitude}°)`);
          console.log(`  Error: ${longError.toFixed(6)}° longitude, ${degreeError.toFixed(2)}° in sign`);
          
          if (result.longitudeSpeed < 0) {
            console.log(`  Status: Retrograde (speed: ${result.longitudeSpeed.toFixed(6)}°/day)`);
          }
          
          totalError += longError;
          planetCount++;
        }
      }
    } catch (error) {
      console.error(`Error calculating ${planetName}:`, error.message);
    }
  }
  
  if (planetCount > 0) {
    const averageError = totalError / planetCount;
    console.log(`\\nAverage Error: ${averageError.toFixed(6)}°`);
    
    if (averageError < 1.0) {
      console.log(`✓ GOOD MATCH! Average error is acceptable for this date.`);
    } else {
      console.log(`⚠ Large discrepancy. This may not be the correct date.`);
    }
  }
  
  return results;
}

console.log('=== Swiss Ephemeris Vedic Calculation Test ===');
console.log('Comparing with Jagannatha Hora reference data');
console.log('Using Lahiri Ayanamsa (Chitrapaksha)');

// Test multiple dates around the probable time when these positions would occur
// Based on Sun in Leo 28.85°, this is likely mid-August
testDate(2024, 8, 20); // August 20, 2024
testDate(2024, 8, 21); // August 21, 2024  
testDate(2023, 8, 20); // August 20, 2023
testDate(2023, 8, 21); // August 21, 2023

console.log('\\n=== Analysis Complete ===');
console.log('If none of these dates match closely, the reference data may be from:');
console.log('1. A different year');
console.log('2. A different time zone');
console.log('3. A different ayanamsa system');
console.log('4. A different house system or coordinate system');
