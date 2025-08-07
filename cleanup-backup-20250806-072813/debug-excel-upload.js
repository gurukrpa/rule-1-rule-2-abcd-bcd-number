// Debug Excel Upload Issues - Comprehensive Test
// This script tests the Excel upload functionality to identify the "some topics are not fetching data" issue

console.log('🔍 Starting Excel Upload Debug Test...');

// Test topic mapping and data retrieval issues
function debugTopicDataRetrieval() {
    console.log('\n=== TESTING TOPIC DATA RETRIEVAL ===');
    
    // Sample topic names that commonly have issues
    const problematicTopics = [
        'D-1 Set-1 Matrix',
        'D-1 Set-2 Matrix', 
        'D-2 Set-1 Matrix',
        'D-3 Set-1 Matrix',
        'D-4 Set-1 Matrix',
        'D-5 Set-1 Matrix'
    ];
    
    // Sample Excel data structure
    const mockExcelData = {
        sets: {
            'D-1 Set-1 Matrix': {
                'lagna': { 1: 'me', 2: 've', 3: 'ju', 4: 'sa', 5: 'ma' },
                'moon': { 6: 'me', 7: 've', 8: 'ju', 9: 'sa', 10: 'ma' }
            },
            'D-1 Set-2 Matrix': {
                'lagna': { 1: 'me', 2: 've', 3: 'ju', 4: 'sa', 5: 'ma' },
                'moon': { 6: 'me', 7: 've', 8: 'ju', 9: 'sa', 10: 'ma' }
            },
            'D-3 Set-1 Matrix': {
                'lagna': { 1: 'me', 2: 've', 3: 'ju', 4: 'sa', 5: 'ma' },
                'moon': { 6: 'me', 7: 've', 8: 'ju', 9: 'sa', 10: 'ma' }
            }
        }
    };
    
    // Test each problematic topic
    problematicTopics.forEach(topicName => {
        console.log(`\n🔍 Testing topic: "${topicName}"`);
        
        // Check if topic exists in mock data
        const hasData = mockExcelData.sets[topicName];
        console.log(`  📊 Has data in Excel: ${hasData ? '✅ Yes' : '❌ No'}`);
        
        if (hasData) {
            const elements = Object.keys(hasData);
            console.log(`  📝 Elements found: ${elements.join(', ')}`);
            
            // Test element mapping
            elements.forEach(elementName => {
                const elementData = hasData[elementName];
                const houseCount = Object.keys(elementData).length;
                console.log(`    📋 ${elementName}: ${houseCount} houses`);
            });
        }
        
        // Test topic name variations that might cause matching issues
        const variations = [
            topicName,
            topicName.toLowerCase(),
            topicName.replace(/\s+/g, ' '),
            topicName.trim(),
            topicName.replace('Matrix', '').trim(),
            topicName.replace('Set-', 'Set '),
            topicName.replace('D-', 'D')
        ];
        
        console.log(`  🔄 Topic name variations tested:`, variations.length);
    });
}

// Test element name mapping issues
function debugElementMapping() {
    console.log('\n=== TESTING ELEMENT NAME MAPPING ===');
    
    const commonExcelElementNames = [
        'lagna', 'ascendant', 'as',
        'moon', 'mo',
        'hora lagna', 'hl',
        'ghati lagna', 'gl',
        'vighati lagna', 'vig',
        'varnada lagna', 'var',
        'sree lagna', 'sl',
        'pranapada lagna', 'pp',
        'indu lagna', 'in'
    ];
    
    // Enhanced element name mapping (from PlanetsAnalysisPage)
    const elementNameMapping = {
        'as': 'as',
        'mo': 'mo', 
        'hl': 'hl',
        'gl': 'gl',
        'vig': 'vig',
        'var': 'var',
        'sl': 'sl',
        'pp': 'pp',
        'in': 'in',
        'lagna': 'as',
        'ascendant': 'as',
        'moon': 'mo',
        'hora lagna': 'hl',
        'ghati lagna': 'gl', 
        'vighati lagna': 'vig',
        'varnada lagna': 'var',
        'sree lagna': 'sl',
        'pranapada lagna': 'pp',
        'indu lagna': 'in'
    };
    
    commonExcelElementNames.forEach(elementName => {
        const mapped = elementNameMapping[elementName.toLowerCase()];
        console.log(`  📋 "${elementName}" → ${mapped ? `"${mapped}" ✅` : '❌ NO MAPPING'}`);
    });
}

// Test hasTopicData function logic
function debugHasTopicDataLogic() {
    console.log('\n=== TESTING hasTopicData LOGIC ===');
    
    // Mock planets data structure
    const mockPlanetsData = {
        'D-1 Set-1 Matrix': {
            'as': { 1: 'me', 2: 've', 3: 'ju' },
            'mo': { 6: 'me', 7: 've', 8: 'ju' }
        },
        'D-3 Set-1 Matrix': {
            'as': { 1: 'me', 2: 've' },
            'mo': { }  // Empty object - potential issue
        }
    };
    
    // Test hasTopicData logic for each topic
    Object.keys(mockPlanetsData).forEach(topicName => {
        console.log(`\n🔍 Testing hasTopicData for: "${topicName}"`);
        
        const topicData = mockPlanetsData[topicName];
        console.log(`  📊 Topic data:`, topicData);
        
        // Test different hasTopicData logic variations
        const hasDataV1 = topicData && Object.keys(topicData).length > 0;
        const hasDataV2 = topicData && Object.values(topicData).some(elementData => 
            elementData && Object.keys(elementData).length > 0
        );
        const hasDataV3 = topicData && Object.entries(topicData).some(([element, data]) => 
            data && typeof data === 'object' && Object.keys(data).length > 0
        );
        
        console.log(`  📋 hasTopicData V1 (simple): ${hasDataV1 ? '✅' : '❌'}`);
        console.log(`  📋 hasTopicData V2 (values): ${hasDataV2 ? '✅' : '❌'}`);
        console.log(`  📋 hasTopicData V3 (entries): ${hasDataV3 ? '✅' : '❌'}`);
        
        // Detailed analysis
        Object.keys(topicData).forEach(element => {
            const elementData = topicData[element];
            const elementHasData = elementData && Object.keys(elementData).length > 0;
            console.log(`    📝 ${element}: ${elementHasData ? '✅' : '❌'} (${Object.keys(elementData || {}).length} houses)`);
        });
    });
}

// Run all debug tests
debugTopicDataRetrieval();
debugElementMapping();
debugHasTopicDataLogic();

console.log('\n✅ Excel Upload Debug Test Complete!');
console.log('\n💡 NEXT STEPS:');
console.log('1. Check browser console for actual errors during Excel upload');
console.log('2. Verify topic name matching between Excel and display');  
console.log('3. Test hasTopicData function with real uploaded data');
console.log('4. Confirm element mapping is working correctly');
