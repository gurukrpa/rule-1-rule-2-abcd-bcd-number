#!/usr/bin/env node

/**
 * Test ABCD/BCD Database Service
 * Quick test to verify the service can connect and fetch data
 */

console.log('🔍 Testing ABCD/BCD Database Service...');
console.log('======================================');

try {
  // Import the database service
  const { abcdBcdDatabaseService } = await import('./src/services/abcdBcdDatabaseService.js');
  
  console.log('✅ Service imported successfully');
  console.log('🔄 Fetching ABCD/BCD numbers from database...');
  
  const result = await abcdBcdDatabaseService.getAllTopicNumbers();
  
  console.log('📊 Database service result:', {
    success: result.success,
    totalTopics: result.data?.totalTopics || 0,
    source: result.data?.source || 'none',
    error: result.error || 'none'
  });
  
  if (result.success && result.data?.topicNumbers) {
    console.log('\n📋 Available Topics:');
    const topics = Object.keys(result.data.topicNumbers);
    console.log(`   Total: ${topics.length} topics`);
    
    // Show first 5 topics as sample
    const sampleTopics = topics.slice(0, 5);
    console.log('\n📋 Sample Topics and Numbers:');
    
    sampleTopics.forEach(topic => {
      const numbers = result.data.topicNumbers[topic];
      console.log(`   ${topic}:`);
      console.log(`     ABCD: [${numbers.abcd.join(', ')}]`);
      console.log(`     BCD:  [${numbers.bcd.join(', ')}]`);
    });
    
    console.log('\n🎉 SUCCESS! Database service is working correctly.');
    console.log('💡 The PlanetsAnalysisPage should now display ABCD/BCD badges.');
    
  } else {
    console.log('\n⚠️  Database service returned no data or failed');
    console.log('💡 The component will use fallback hardcoded numbers');
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }
  }
  
} catch (error) {
  console.error('\n❌ Service test failed:', error.message);
  console.log('💡 This means the database connection has issues');
  console.log('🔧 The component should still work with fallback numbers');
}

console.log('\n🏁 Test completed');
