// 🔍 Targeted Debug for Rule2CompactPage Data Issue
// This will help us see exactly what data Rule2CompactPage is trying to access

console.log('🎯 TARGETED RULE2COMPACTPAGE DEBUG');
console.log('================================');

// Check what user ID is being used
const userId = localStorage.getItem('userId');
console.log('👤 Current User ID:', userId);

if (userId) {
    // Get all localStorage keys for this user
    const allKeys = Object.keys(localStorage);
    const userKeys = allKeys.filter(key => key.includes(userId));
    
    console.log('\n📊 ALL USER KEYS:');
    userKeys.forEach(key => console.log('  -', key));
    
    // Check Excel keys specifically
    const excelKeys = userKeys.filter(key => key.includes('excel'));
    console.log('\n📋 EXCEL KEYS:', excelKeys);
    
    // Check Hour keys specifically  
    const hourKeys = userKeys.filter(key => key.includes('hour'));
    console.log('\n⏰ HOUR KEYS:', hourKeys);
    
    // Let's see what dates we have data for
    const datePattern = /(\d{4}-\d{2}-\d{2})/;
    const datesWithData = new Set();
    
    userKeys.forEach(key => {
        const match = key.match(datePattern);
        if (match) {
            datesWithData.add(match[1]);
        }
    });
    
    console.log('\n📅 DATES WITH DATA:', Array.from(datesWithData).sort());
    
    // Check one Excel file structure
    if (excelKeys.length > 0) {
        const sampleKey = excelKeys[0];
        const sampleData = JSON.parse(localStorage.getItem(sampleKey));
        console.log('\n📋 SAMPLE EXCEL STRUCTURE:');
        console.log('Key:', sampleKey);
        console.log('Data structure:', {
            hasData: !!sampleData.data,
            hasSets: !!sampleData.data?.sets,
            setNames: Object.keys(sampleData.data?.sets || {}),
            sampleSetStructure: sampleData.data?.sets ? Object.keys(sampleData.data.sets)[0] : 'none'
        });
        
        // Check one set's structure
        if (sampleData.data?.sets) {
            const firstSetName = Object.keys(sampleData.data.sets)[0];
            const firstSet = sampleData.data.sets[firstSetName];
            console.log('\nFirst set (' + firstSetName + ') structure:');
            console.log('Elements:', Object.keys(firstSet));
            
            if (Object.keys(firstSet).length > 0) {
                const firstElement = Object.keys(firstSet)[0];
                const elementData = firstSet[firstElement];
                console.log('First element (' + firstElement + ') planets:', Object.keys(elementData));
                console.log('Sample values:', elementData);
            }
        }
    }
    
    // Check one Hour file structure
    if (hourKeys.length > 0) {
        const sampleKey = hourKeys[0];
        const sampleData = JSON.parse(localStorage.getItem(sampleKey));
        console.log('\n⏰ SAMPLE HOUR STRUCTURE:');
        console.log('Key:', sampleKey);
        console.log('Data structure:', {
            hasPlanetSelections: !!sampleData.planetSelections,
            hrKeys: Object.keys(sampleData.planetSelections || {}),
            planetSelections: sampleData.planetSelections
        });
    }
    
} else {
    console.log('❌ No user ID found!');
}

// Function to test data extraction similar to Rule2CompactPage
function testDataExtraction(targetDate, setName, selectedHR) {
    console.log(`\n🧪 TESTING DATA EXTRACTION:`);
    console.log(`Date: ${targetDate}, Set: ${setName}, HR: ${selectedHR}`);
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.log('❌ No user ID');
        return [];
    }
    
    const excelKey = `${userId}_excel_${targetDate}`;
    const hourKey = `${userId}_hour_${targetDate}`;
    
    console.log('Looking for keys:', { excelKey, hourKey });
    
    const excelData = localStorage.getItem(excelKey);
    const hourData = localStorage.getItem(hourKey);
    
    console.log('Found data:', { 
        hasExcel: !!excelData, 
        hasHour: !!hourData 
    });
    
    if (!excelData || !hourData) {
        console.log('❌ Missing data for', targetDate);
        return [];
    }
    
    const parsedExcel = JSON.parse(excelData);
    const parsedHour = JSON.parse(hourData);
    
    const sets = parsedExcel.data?.sets || {};
    const planetSelections = parsedHour.planetSelections || {};
    
    console.log('Parsed data:', {
        setsCount: Object.keys(sets).length,
        setNames: Object.keys(sets),
        planetSelections
    });
    
    const setData = sets[setName];
    if (!setData) {
        console.log('❌ Set not found:', setName);
        console.log('Available sets:', Object.keys(sets));
        return [];
    }
    
    const selectedPlanet = planetSelections[selectedHR];
    if (!selectedPlanet) {
        console.log('❌ No planet for HR:', selectedHR);
        console.log('Available HRs:', Object.keys(planetSelections));
        return [];
    }
    
    console.log('✅ Using planet:', selectedPlanet, 'for HR:', selectedHR);
    
    const allNumbers = new Set();
    
    // Extract numbers similar to Rule2CompactPage
    Object.entries(setData).forEach(([elementName, planetData]) => {
        const rawString = planetData[selectedPlanet];
        if (rawString) {
            const match = rawString.match(/^[a-z]+-(\d+)[\/\-]/);
            const elementNumber = match ? Number(match[1]) : null;
            if (elementNumber !== null) {
                allNumbers.add(elementNumber);
                console.log(`  📝 ${elementName}: "${rawString}" → ${elementNumber}`);
            }
        }
    });
    
    const result = Array.from(allNumbers).sort((a, b) => a - b);
    console.log('✅ Extracted numbers:', result);
    return result;
}

// Test with our created data
console.log('\n🧪 TESTING WITH CREATED DATA:');
const testDates = ['2025-06-20', '2025-06-21', '2025-06-22', '2025-06-23'];
testDates.forEach(date => {
    testDataExtraction(date, 'D-1 Set-1 Matrix', '1');
});
