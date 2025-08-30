// Debug script to test rule2AnalysisService methods

console.log('🔍 Testing rule2AnalysisService methods...');

// Test parameters
const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';
const triggerDate = '2025-08-21';
const availableTopics = [
  'D-1 Set-1 Matrix',
  'D-1 Set-2 Matrix', 
  'D-2 Set-1 Matrix',
  'D-2 Set-2 Matrix',
  'D-3 Set-1 Matrix',
  'D-3 Set-2 Matrix'
];

// Import the service (you'll need to run this in browser console)
console.log('Copy and paste this into browser console on any page:');
console.log(`
// Test the analyzeRule2 method (used by Rule1 and PlanetsAnalysis)
import('/src/services/rule2AnalysisService.js').then(async (module) => {
  const service = module.default;
  
  console.log('🔍 Testing analyzeRule2 method...');
  console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(service)));
  
  try {
    const result = await service.analyzeRule2('${userId}', '${triggerDate}', ${JSON.stringify(availableTopics)});
    console.log('✅ analyzeRule2 result:', result);
  } catch (error) {
    console.error('❌ analyzeRule2 error:', error);
  }
  
  console.log('🔍 Testing performRule2Analysis method...');
  try {
    const result2 = await service.performRule2Analysis('${userId}', '${triggerDate}', ['${triggerDate}'], 1);
    console.log('✅ performRule2Analysis result:', result2);
  } catch (error) {
    console.error('❌ performRule2Analysis error:', error);
  }
});
`);
