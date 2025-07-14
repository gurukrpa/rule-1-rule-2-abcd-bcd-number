// Live Ketu Data Debugging Script - Targeted Fix
// This script identifies the exact issue with Ketu data not populating divisions

console.log('🔍 KETU DIVISION POPULATION DEBUG');
console.log('='.repeat(50));

// 1. Test data structure that should work
const testExcelData = {
    'Ke': {
        'D1': 'Ar',
        'D2': 'Ta', 
        'D3': 'Ge',
        'D4': 'Ca',
        'D5': 'Le'
    }
};

const testDates = {
    1: '2025-07-02',
    2: '2025-07-03',
    3: '2025-07-04'
};

const testHrData = [
    // Main planet entries
    { hr_number: 'HR-1', topic: 'DAY-1', date: '2025-07-02', planet_house: null },
    { hr_number: 'HR-2', topic: 'DAY-3', date: '2025-07-04', planet_house: null },
    
    // Division entries
    { hr_number: 'HR-1', topic: 'D1', date: '2025-07-02', planet_house: null },
    { hr_number: 'HR-1', topic: 'D2', date: '2025-07-02', planet_house: null },
    { hr_number: 'HR-1', topic: 'D3', date: '2025-07-02', planet_house: null },
    
    { hr_number: 'HR-2', topic: 'D1', date: '2025-07-04', planet_house: null },
    { hr_number: 'HR-2', topic: 'D2', date: '2025-07-04', planet_house: null },
    { hr_number: 'HR-2', topic: 'D3', date: '2025-07-04', planet_house: null },
];

const divisions = ['D1', 'D2', 'D3', 'D4', 'D5'];

console.log('\n1️⃣ TEST DATA STRUCTURE:');
console.log('✅ Excel Data:', testExcelData);
console.log('✅ Dates:', testDates);
console.log('✅ HR Data Entries:', testHrData.length);

// 2. Simulate the planet change logic exactly as in UserData.jsx
function simulatePlanetChange(hr, day, value, excelData, dates, hrData) {
    console.log(`\n🔍 SIMULATING: HR-${hr}, Day-${day}, Planet: "${value}"`);
    
    const updatedData = [...hrData];
    
    // Update main planet entry
    const planetEntry = updatedData.find(
        item => item.hr_number === `HR-${hr}` && item.topic === `DAY-${day}`
    );
    
    if (planetEntry) {
        console.log(`✅ Found main planet entry: ${planetEntry.hr_number} ${planetEntry.topic}`);
        planetEntry.planet_house = value;
    } else {
        console.log(`❌ Main planet entry NOT found for HR-${hr} DAY-${day}`);
    }
    
    // Process Excel data for divisions
    if (excelData && value) {
        console.log(`🔍 Processing Excel data for planet: "${value}"`);
        console.log(`🔍 Excel data keys:`, Object.keys(excelData));
        
        const planetData = excelData[value];
        if (planetData) {
            console.log(`✅ Found planet data:`, planetData);
            console.log(`✅ Available divisions:`, Object.keys(planetData));
            
            let divisionUpdates = 0;
            divisions.forEach(division => {
                console.log(`\n  🔍 Looking for division: ${division}`);
                console.log(`  🔍 Date from dates[${day}]:`, dates[day]);
                
                const divisionEntry = updatedData.find(
                    item => item.hr_number === `HR-${hr}` &&
                           item.topic === division &&
                           item.date === dates[day]
                );
                
                if (divisionEntry) {
                    const houseValue = planetData[division];
                    divisionEntry.planet_house = houseValue || null;
                    console.log(`    ✅ UPDATED ${division}: "${houseValue}"`);
                    divisionUpdates++;
                } else {
                    console.log(`    ❌ Division entry NOT found for:`);
                    console.log(`       HR: HR-${hr}, Topic: ${division}, Date: ${dates[day]}`);
                    
                    // Debug: Show what entries DO exist
                    const similarEntries = updatedData.filter(
                        item => item.hr_number === `HR-${hr}` && item.topic === division
                    );
                    console.log(`    🔍 Similar entries (same HR, same topic):`, similarEntries);
                }
            });
            
            console.log(`\n  📊 SUMMARY: Updated ${divisionUpdates} divisions out of ${divisions.length}`);
            
        } else {
            console.log(`❌ No planet data found for "${value}"`);
        }
    } else {
        console.log(`❌ Missing excelData or value`);
    }
    
    return updatedData;
}

// 3. Test the simulation
console.log('\n2️⃣ TESTING PLANET CHANGE LOGIC:');

// Test case 1: HR-2, Day-3, Ketu (as shown in your screenshot)
const result = simulatePlanetChange(2, 3, 'Ke', testExcelData, testDates, testHrData);

console.log('\n3️⃣ FINAL RESULT:');
const updatedDivisions = result.filter(item => 
    item.hr_number === 'HR-2' && 
    divisions.includes(item.topic) && 
    item.planet_house !== null
);

console.log(`✅ Successfully updated divisions: ${updatedDivisions.length}`);
updatedDivisions.forEach(item => {
    console.log(`  - ${item.topic}: ${item.planet_house}`);
});

console.log('\n4️⃣ POTENTIAL ISSUES TO CHECK:');
console.log('❌ Date format mismatch between dates[] and hrData entries');
console.log('❌ Division entries missing from hrData array');
console.log('❌ Excel data structure different than expected');
console.log('❌ Planet short code mismatch (Ke vs Ketu)');

console.log('\n5️⃣ BROWSER TESTING INSTRUCTIONS:');
console.log('1. Open UserData page with browser console');
console.log('2. After uploading Excel, run this in console:');
console.log('   console.log("Excel Data:", window.excelData);');
console.log('3. After selecting Ketu, run this in console:');
console.log('   console.log("HR Data:", window.hrData);');
console.log('   console.log("Dates:", window.dates);');
console.log('4. Check the exact format and matching logic');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Compare actual data structure with test data');
console.log('2. Verify date formats match exactly');
console.log('3. Ensure division entries exist in hrData');
console.log('4. Check Excel upload creates correct planet keys');
