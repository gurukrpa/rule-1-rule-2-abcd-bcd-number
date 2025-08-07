// Debug script to test hasTopicData logic
console.log('🔍 Testing hasTopicData logic...');

// Simulate the planetsData structure based on console logs
const mockPlanetsData = {
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
  }
};

const topic = 'D-3 Set-1 Matrix';

// Test the current hasTopicData logic
console.log('\n🧪 Testing hasTopicData logic:');
console.log('planetsData[topic]:', !!mockPlanetsData[topic]);
console.log('Object.keys(planetsData[topic]):', Object.keys(mockPlanetsData[topic] || {}));

if (mockPlanetsData[topic]) {
  console.log('\n📊 Element breakdown:');
  Object.entries(mockPlanetsData[topic]).forEach(([elementCode, elementData]) => {
    console.log(`  ${elementCode}:`, Object.keys(elementData));
    const planetsWithData = Object.values(elementData).filter(planetData => planetData.hasData);
    console.log(`    Planets with data: ${planetsWithData.length}`);
  });
}

// Test the hasTopicData calculation
const hasTopicData = mockPlanetsData[topic] && 
  Object.values(mockPlanetsData[topic]).some(elementData => 
    Object.values(elementData).some(planetData => planetData.hasData)
  );

console.log('\n✅ hasTopicData result:', hasTopicData);

// Count data points
const dataPointsCount = mockPlanetsData[topic] ? 
  Object.values(mockPlanetsData[topic]).reduce((count, elementData) => 
    count + Object.values(elementData).filter(planetData => planetData.hasData).length, 0
  ) : 0;

console.log('📊 dataPointsCount:', dataPointsCount);

// Test different possible issues
console.log('\n🔍 Debugging potential issues:');

// Issue 1: Maybe the topic name doesn't match exactly
const availableTopics = Object.keys(mockPlanetsData);
console.log('Available topics:', availableTopics);
console.log('Exact match for "D-3 Set-1 Matrix":', availableTopics.includes('D-3 Set-1 Matrix'));

// Issue 2: Maybe the data structure is different
console.log('\nData structure test:');
console.log('Type of planetsData[topic]:', typeof mockPlanetsData[topic]);
console.log('Is array:', Array.isArray(mockPlanetsData[topic]));
console.log('Is object:', typeof mockPlanetsData[topic] === 'object');

// Issue 3: Test the actual logic step by step
if (mockPlanetsData[topic]) {
  console.log('\n📋 Step-by-step logic test:');
  const elementValues = Object.values(mockPlanetsData[topic]);
  console.log('elementValues length:', elementValues.length);
  
  elementValues.forEach((elementData, index) => {
    console.log(`Element ${index}:`, Object.keys(elementData));
    const planetValues = Object.values(elementData);
    const hasDataFlags = planetValues.map(p => p.hasData);
    const someHasData = hasDataFlags.some(hasData => hasData);
    console.log(`  hasData flags:`, hasDataFlags);
    console.log(`  some has data:`, someHasData);
  });
  
  const result = elementValues.some(elementData => 
    Object.values(elementData).some(planetData => planetData.hasData)
  );
  console.log('Final some() result:', result);
}
