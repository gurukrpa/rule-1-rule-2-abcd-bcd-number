/**
 * Simple Ketu Test - UserData Page Only
 * Testing the exact data structure issue without external dependencies
 */

console.log('🧪 Testing Ketu Excel Issue for UserData Page');
console.log('');

// Simulate the viboothiPlanetMapping from ExcelUpload component
const viboothiPlanetMapping = {
  'Lagna': 'Lg',
  'Sun': 'Su',
  'Moon': 'Mo', 
  'Mars': 'Ma',
  'Mercury': 'Me',
  'Jupiter': 'Ju',
  'Venus': 'Ve',
  'Saturn': 'Sa',
  'Rahu': 'Ra',
  'Ketu': 'Ke'  // ✅ Ketu should map to 'Ke'
};

// Simulate divisions from UserData
const divisions = [
  "D-1", "D-9", "D-10", "D-3", "D-4", "D-7", "D-12", 
  "D-27", "D-30", "D-60", "D-5", "D-11", "D-81", 
  "D-108", "D-144"
];

// Test 1: Check planet mapping
console.log('1️⃣ Testing planet mappings:');
console.log('  - Available mappings:', Object.keys(viboothiPlanetMapping));
console.log('  - Ketu mapping:', viboothiPlanetMapping['Ketu']);
console.log('  - Expected result: "Ke"');
console.log('');

// Test 2: Simulate the exact data structure that should be created
console.log('2️⃣ Simulating Excel data structure:');
const simulatedExcelData = {};

// Create data for all planets including Ketu
Object.entries(viboothiPlanetMapping).forEach(([planetName, planetCode]) => {
  simulatedExcelData[planetCode] = {};
  
  // Add sample division data
  divisions.slice(0, 5).forEach(division => {
    simulatedExcelData[planetCode][division] = 'Ar'; // Sample house
  });
  
  console.log(`  ✅ Created data for ${planetName} (${planetCode})`);
});

console.log('');
console.log('3️⃣ Testing Ketu data access:');
console.log('  - excelData.Ke exists:', !!simulatedExcelData.Ke);
console.log('  - excelData["Ke"] exists:', !!simulatedExcelData["Ke"]);
console.log('  - Ketu divisions:', simulatedExcelData.Ke ? Object.keys(simulatedExcelData.Ke) : 'NONE');
console.log('');

// Test 3: Test how UserData would access this data
console.log('4️⃣ Simulating UserData planet selection:');
const testPlanet = 'Ke';
const planetData = simulatedExcelData[testPlanet];

console.log(`  - Selected planet: "${testPlanet}"`);
console.log(`  - Planet data found:`, !!planetData);

if (planetData) {
  console.log(`  - Available divisions:`, Object.keys(planetData));
  console.log(`  - Sample D-1 value:`, planetData['D-1']);
  console.log('  ✅ Ketu data would work correctly');
} else {
  console.log('  ❌ Ketu data would NOT work');
  console.log('  - Available planets:', Object.keys(simulatedExcelData));
}

console.log('');
console.log('🔍 DIAGNOSIS COMPLETE');
console.log('If this test shows Ketu working but the real Excel upload doesn\'t,');
console.log('the issue is likely in the Excel file format or the actual planet names in the file.');
