// Quick D-3 Set-1 hasTopicData fix verification
// This script tests the exact logic that's failing in the UI

console.log('🔍 Testing D-3 Set-1 hasTopicData logic fix...');

// Simulate what should be happening after Excel processing
const mockPlanetsDataAfterProcessing = {
  'D-3 Set-1 Matrix': {
    'as': {
      'Su': { value: '10', rawData: '10', hasData: true },
      'Mo': { value: '20', rawData: '20', hasData: true },
      'Ma': { value: '30', rawData: '30', hasData: true },
      'Me': { value: '', rawData: '', hasData: false },
      'Ju': { value: '', rawData: '', hasData: false },
      'Ve': { value: '', rawData: '', hasData: false },
      'Sa': { value: '', rawData: '', hasData: false },
      'Ra': { value: '', rawData: '', hasData: false },
      'Ke': { value: '', rawData: '', hasData: false }
    },
    'mo': {
      'Su': { value: '15', rawData: '15', hasData: true },
      'Mo': { value: '25', rawData: '25', hasData: true },
      'Ma': { value: '', rawData: '', hasData: false },
      'Me': { value: '', rawData: '', hasData: false },
      'Ju': { value: '', rawData: '', hasData: false },
      'Ve': { value: '', rawData: '', hasData: false },
      'Sa': { value: '', rawData: '', hasData: false },
      'Ra': { value: '', rawData: '', hasData: false },
      'Ke': { value: '', rawData: '', hasData: false }
    }
  },
  'D-3 Set-2 Matrix': {
    'as': {
      'Su': { value: '5', rawData: '5', hasData: true },
      'Mo': { value: '15', rawData: '15', hasData: true },
      'Ma': { value: '', rawData: '', hasData: false },
      'Me': { value: '', rawData: '', hasData: false },
      'Ju': { value: '', rawData: '', hasData: false },
      'Ve': { value: '', rawData: '', hasData: false },
      'Sa': { value: '', rawData: '', hasData: false },
      'Ra': { value: '', rawData: '', hasData: false },
      'Ke': { value: '', rawData: '', hasData: false }
    }
  }
};

// Test the hasTopicData logic for both D-3 sets
const testTopics = ['D-3 Set-1 Matrix', 'D-3 Set-2 Matrix'];

testTopics.forEach(topic => {
  console.log(`\n🧪 Testing: ${topic}`);
  
  const hasTopicData = mockPlanetsDataAfterProcessing[topic] && 
    Object.values(mockPlanetsDataAfterProcessing[topic]).some(elementData => 
      Object.values(elementData).some(planetData => planetData.hasData)
    );
  
  const dataPointsCount = mockPlanetsDataAfterProcessing[topic] ? 
    Object.values(mockPlanetsDataAfterProcessing[topic]).reduce((count, elementData) => 
      count + Object.values(elementData).filter(planetData => planetData.hasData).length, 0
    ) : 0;
  
  console.log(`  ✅ hasTopicData: ${hasTopicData}`);
  console.log(`  📊 dataPointsCount: ${dataPointsCount}`);
  console.log(`  🏷️ Expected UI: ${hasTopicData ? '📊 ' + dataPointsCount + ' Data Points' : '🔍 No Data in Excel'}`);
});

// Test the specific case that's failing
console.log('\n🎯 SPECIFIC D-3 SET-1 DEBUG:');
const d3Set1Topic = 'D-3 Set-1 Matrix';
const d3Set1Data = mockPlanetsDataAfterProcessing[d3Set1Topic];

console.log('1. Topic exists in data:', !!d3Set1Data);
console.log('2. Elements in topic:', d3Set1Data ? Object.keys(d3Set1Data) : 'N/A');

if (d3Set1Data) {
  console.log('3. Element analysis:');
  Object.entries(d3Set1Data).forEach(([elementCode, elementData]) => {
    const planetsWithData = Object.values(elementData).filter(planetData => planetData.hasData);
    console.log(`   ${elementCode}: ${planetsWithData.length} planets with data`);
  });
  
  // Step by step logic
  const elementValues = Object.values(d3Set1Data);
  console.log('4. Element values count:', elementValues.length);
  
  const hasAnyData = elementValues.some(elementData => 
    Object.values(elementData).some(planetData => planetData.hasData)
  );
  console.log('5. Final hasTopicData result:', hasAnyData);
}

console.log('\n✅ Test complete. If logic works here but fails in UI, it\'s a React state/timing issue.');
