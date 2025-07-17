// Test Supabase connection status
console.log('🔄 Testing Supabase Connection...');

// Test 1: Check if Supabase client is available
import { supabase } from './src/supabaseClient.js';
console.log('✅ Supabase client loaded');

// Test 2: Check DatabaseServiceSwitcher
import { databaseServiceSwitcher } from './src/services/DatabaseServiceSwitcher.js';
console.log('✅ DatabaseServiceSwitcher loaded');

// Test 3: Check current service status
const serviceStatus = databaseServiceSwitcher.getServiceStatus();
console.log('📊 Service Status:', serviceStatus);

// Test 4: Check active service
const activeService = databaseServiceSwitcher.getActiveService();
console.log('🎯 Active Service:', activeService);

// Test 5: Test connection
databaseServiceSwitcher.checkConnection()
  .then(isConnected => {
    console.log(`${isConnected ? '✅' : '❌'} Connection Status: ${isConnected ? 'HEALTHY' : 'FAILED'}`);
    
    if (isConnected) {
      console.log('🎉 SUCCESS: Supabase is active and connected!');
      console.log('📱 Application Status:');
      console.log('   • Authentication: Supabase Auth');
      console.log('   • Database: Supabase PostgreSQL');
      console.log('   • URL: http://localhost:5173');
      console.log('   • Ready for testing!');
    } else {
      console.log('❌ ISSUE: Connection failed');
    }
  })
  .catch(error => {
    console.error('❌ Connection test failed:', error);
  });
