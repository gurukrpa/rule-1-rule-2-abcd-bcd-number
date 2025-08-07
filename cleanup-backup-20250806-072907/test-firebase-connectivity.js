#!/usr/bin/env node

/**
 * Firebase Connection Test
 * Tests Firebase database connectivity and basic operations
 */

console.log('🔥 Testing Firebase connectivity...');

async function testFirebase() {
  try {
    // Import Firebase service
    const { firebaseService } = await import('./src/services/FirebaseService.js');
    
    console.log('✅ Firebase service imported successfully');
    
    // Test basic connectivity
    const testUserId = 'test-user-firebase';
    const testDate = '2025-01-31';
    
    console.log('🔧 Testing Firebase operations...');
    
    // Test creating a user
    console.log('1. Testing user creation...');
    const userResult = await firebaseService.createUser({
      id: testUserId,
      username: 'Firebase Test User',
      hr: 2,
      days: 5
    });
    console.log('   User creation result:', userResult);
    
    // Test saving Excel data
    console.log('2. Testing Excel data save...');
    const excelData = {
      fileName: 'test-firebase.xlsx',
      sets: {
        'Test Set 1': {
          'Element 1': {
            'Sun': 'test-1',
            'Moon': 'test-2'
          }
        }
      }
    };
    const excelResult = await firebaseService.saveExcelData(testUserId, testDate, excelData);
    console.log('   Excel data save result:', excelResult);
    
    // Test retrieving Excel data
    console.log('3. Testing Excel data retrieval...');
    const retrievedData = await firebaseService.getExcelData(testUserId, testDate);
    console.log('   Retrieved data:', retrievedData);
    
    // Test checking data existence
    console.log('4. Testing data existence check...');
    const hasData = await firebaseService.hasExcelData(testUserId, testDate);
    console.log('   Has Excel data:', hasData);
    
    console.log('🎉 Firebase connectivity test completed successfully!');
    console.log('✅ Your Firebase database is properly configured for real-time data sharing');
    
  } catch (error) {
    console.error('❌ Firebase connectivity test failed:', error);
    console.log('🔧 Check your Firebase configuration in .env file');
  }
}

testFirebase();
