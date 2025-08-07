/**
 * Excel Data Extraction Debug Script for Future Planets Analysis
 * 
 * Run this in browser console after uploading Excel file to debug extraction issues
 */

console.log('🧪 EXCEL DEBUG: Future Planets Analysis Data Extraction');

// Debug function to check Excel processing
function debugExcelExtraction() {
  console.log('\n📊 DEBUGGING EXCEL DATA EXTRACTION:');
  
  // Check if Excel data is loaded
  const excelData = window.excelData || null;
  if (!excelData) {
    console.log('❌ No Excel data found. Upload an Excel file first.');
    return;
  }
  
  console.log('✅ Excel data found:', excelData.fileName);
  console.log('📅 Uploaded at:', excelData.uploadedAt);
  
  // Check raw sets data
  const sets = excelData.sets || {};
  console.log(`\n📋 RAW SETS DATA (${Object.keys(sets).length} sets):`);
  Object.keys(sets).forEach((setName, index) => {
    const setData = sets[setName];
    const elementCount = Object.keys(setData).length;
    const totalDataPoints = Object.values(setData).reduce((total, elementData) => 
      total + Object.keys(elementData).length, 0);
    
    console.log(`  ${index + 1}. ${setName}:`);
    console.log(`     📝 Elements: ${elementCount} (${Object.keys(setData).join(', ')})`);
    console.log(`     🪐 Data points: ${totalDataPoints}`);
    
    // Check each element
    Object.keys(setData).forEach(elementName => {
      const elementData = setData[elementName];
      const planets = Object.keys(elementData);
      console.log(`       ${elementName}: ${planets.length} planets (${planets.join(', ')})`);
    });
  });
  
  // Check processed planets data
  const planetsData = window.planetsData || {};
  console.log(`\n🪐 PROCESSED PLANETS DATA (${Object.keys(planetsData).length} topics):`);
  
  // Expected topics check
  const expectedTopics = [
    'D-1 Set-1 Matrix', 'D-1 Set-2 Matrix',
    'D-3 Set-1 Matrix', 'D-3 Set-2 Matrix',
    'D-4 Set-1 Matrix', 'D-4 Set-2 Matrix',
    'D-5 Set-1 Matrix', 'D-5 Set-2 Matrix',
    'D-7 Set-1 Matrix', 'D-7 Set-2 Matrix',
    'D-9 Set-1 Matrix', 'D-9 Set-2 Matrix',
    'D-10 Set-1 Matrix', 'D-10 Set-2 Matrix',
    'D-11 Set-1 Matrix', 'D-11 Set-2 Matrix',
    'D-12 Set-1 Matrix', 'D-12 Set-2 Matrix',
    'D-27 Set-1 Matrix', 'D-27 Set-2 Matrix',
    'D-30 Set-1 Matrix', 'D-30 Set-2 Matrix',
    'D-60 Set-1 Matrix', 'D-60 Set-2 Matrix',
    'D-81 Set-1 Matrix', 'D-81 Set-2 Matrix',
    'D-108 Set-1 Matrix', 'D-108 Set-2 Matrix',
    'D-144 Set-1 Matrix', 'D-144 Set-2 Matrix'
  ];
  
  const topicsWithData = Object.keys(planetsData).filter(topic => {
    return Object.values(planetsData[topic] || {}).some(elementData => 
      Object.values(elementData).some(planetData => planetData.hasData)
    );
  });
  
  const missingTopics = expectedTopics.filter(topic => !topicsWithData.includes(topic));
  
  console.log(`✅ Topics with data: ${topicsWithData.length}/${expectedTopics.length}`);
  console.log(`📊 Topics with data:`, topicsWithData);
  
  if (missingTopics.length > 0) {
    console.log(`❌ Missing topics (${missingTopics.length}):`, missingTopics);
  }
  
  // Check specific problem topic
  const problemTopic = 'D-3 Set-1 Matrix';
  if (planetsData[problemTopic]) {
    console.log(`\n🔍 DEBUGGING: ${problemTopic}`);
    const topicData = planetsData[problemTopic];
    
    Object.keys(topicData).forEach(elementCode => {
      const elementData = topicData[elementCode];
      const dataCount = Object.values(elementData).filter(pd => pd.hasData).length;
      console.log(`  ${elementCode}: ${dataCount}/9 planets with data`);
      
      if (dataCount > 0) {
        const planetsWithData = Object.keys(elementData).filter(pc => elementData[pc].hasData);
        console.log(`    Data planets: ${planetsWithData.join(', ')}`);
      }
    });
  } else {
    console.log(`❌ ${problemTopic} not found in processed data`);
  }
  
  // Element mapping check
  console.log('\n📝 ELEMENT MAPPING CHECK:');
  const elements = ['as', 'mo', 'hl', 'gl', 'vig', 'var', 'sl', 'pp', 'in'];
  const elementNames = {
    'as': 'Lagna',
    'mo': 'Moon',
    'hl': 'Hora Lagna',
    'gl': 'Ghati Lagna',
    'vig': 'Vighati Lagna',
    'var': 'Varnada Lagna',
    'sl': 'Sree Lagna',
    'pp': 'Pranapada Lagna',
    'in': 'Indu Lagna'
  };
  
  elements.forEach(code => {
    const expectedName = elementNames[code];
    const foundInExcel = Object.values(sets).some(setData => 
      Object.keys(setData).includes(expectedName)
    );
    console.log(`  ${code} -> ${expectedName}: ${foundInExcel ? '✅ Found' : '❌ Missing'} in Excel`);
  });
}

// Check element code processing
function debugElementProcessing() {
  console.log('\n🔍 ELEMENT PROCESSING DEBUG:');
  
  const excelData = window.excelData || null;
  if (!excelData) {
    console.log('❌ No Excel data available');
    return;
  }
  
  // Check all unique element names found in Excel
  const allElementNames = new Set();
  Object.values(excelData.sets || {}).forEach(setData => {
    Object.keys(setData).forEach(elementName => {
      allElementNames.add(elementName);
    });
  });
  
  console.log('📝 All element names found in Excel:', Array.from(allElementNames));
  
  // Check mapping
  const elementNameMapping = {
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
  
  Array.from(allElementNames).forEach(name => {
    const nameLower = name.toLowerCase();
    const mapped = elementNameMapping[nameLower];
    console.log(`  "${name}" -> ${mapped || 'NOT MAPPED'}`);
  });
}

// Export functions for use
window.debugExcelExtraction = debugExcelExtraction;
window.debugElementProcessing = debugElementProcessing;

console.log('\n🔧 Debug functions loaded:');
console.log('  debugExcelExtraction() - Check full data extraction');
console.log('  debugElementProcessing() - Check element name mapping');
console.log('\n💡 Upload an Excel file first, then run: debugExcelExtraction()');
