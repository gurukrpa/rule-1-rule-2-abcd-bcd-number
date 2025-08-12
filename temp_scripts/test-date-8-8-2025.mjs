// Test script for date 8-8-2025 lottery sync
// Run with: node test-date-8-8-2025.mjs

console.log('🎯 Testing Lottery Sync for Date: 8-8-2025\n');

// Inline implementation of the mod-9 mapping function
function mapNumberToPlanet(number) {
  const planets = ['Ma', 'Su', 'Mo', 'Ju', 'Ra', 'Me', 'Ve', 'Ke', 'Sa'];
  const index = number % 9;
  return planets[index];
}

// Test 1: Direct number mapping for 8-8-2025
console.log('📊 Method 1: Direct Date Number Mapping');
console.log('Date: 8-8-2025');

// Convert date components to numbers
const day = 8;
const month = 8; 
const year = 2025;

console.log(`Day: ${day} → ${mapNumberToPlanet(day)} (${day} % 9 = ${day % 9})`);
console.log(`Month: ${month} → ${mapNumberToPlanet(month)} (${month} % 9 = ${month % 9})`);
console.log(`Year: ${year} → ${mapNumberToPlanet(year)} (${year} % 9 = ${year % 9})`);

// Test 2: Date as concatenated number
const dateNumber = parseInt('882025');
console.log(`\nDate as number: ${dateNumber} → ${mapNumberToPlanet(dateNumber)} (${dateNumber} % 9 = ${dateNumber % 9})`);

// Test 3: Date as sum
const dateSum = day + month + year;
console.log(`Date sum: ${day}+${month}+${year} = ${dateSum} → ${mapNumberToPlanet(dateSum)} (${dateSum} % 9 = ${dateSum % 9})`);

// Test 4: Hypothetical lottery numbers that might have been drawn on 8-8-2025
console.log('\n🎲 Method 2: Hypothetical Lottery Numbers for 8-8-2025');
const hypotheticalNumbers = [8, 16, 24, 32, 40, 48]; // All multiples of 8 for the date
console.log(`Hypothetical draw: ${hypotheticalNumbers.join(', ')}`);
hypotheticalNumbers.forEach(num => {
  const planet = mapNumberToPlanet(num);
  console.log(`  ${num} → ${planet} (${num} % 9 = ${num % 9})`);
});

// Test different number patterns that might appear in lottery
console.log('\n🎯 Method 3: Common Lottery Number Patterns');
const commonPatterns = [
  { name: 'Sequential from 8', numbers: [8, 9, 10, 11, 12, 13] },
  { name: 'Multiples of 8', numbers: [8, 16, 24, 32, 40, 48] },
  { name: 'Date-based', numbers: [8, 8, 20, 25, 31, 44] },
  { name: 'Random sample', numbers: [7, 14, 21, 28, 35, 42] }
];

commonPatterns.forEach(pattern => {
  console.log(`\n${pattern.name}: ${pattern.numbers.join(', ')}`);
  pattern.numbers.forEach(num => {
    const planet = mapNumberToPlanet(num);
    console.log(`  ${num} → ${planet}`);
  });
});

console.log('\n✅ Analysis Complete!');
console.log('\n📋 Planet Mapping Reference:');
console.log('  0,9,18,27,36,45 → Ma (Mars)');
console.log('  1,10,19,28,37,46 → Su (Sun)');
console.log('  2,11,20,29,38,47 → Mo (Moon)');
console.log('  3,12,21,30,39,48 → Ju (Jupiter)');
console.log('  4,13,22,31,40,49 → Ra (Rahu)');
console.log('  5,14,23,32,41,50 → Me (Mercury)');
console.log('  6,15,24,33,42,51 → Ve (Venus)');
console.log('  7,16,25,34,43,52 → Ke (Ketu)');
console.log('  8,17,26,35,44,53 → Sa (Saturn)');
