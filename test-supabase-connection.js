// Quick test to verify Supabase connection has been reestablished
import { databaseServiceSwitcher } from './src/services/DatabaseServiceSwitcher.js';

console.log('🔄 Testing Supabase Connection Status...');

// Check current service status
console.log('📊 Current Service Status:');
console.log(databaseServiceSwitcher.getServiceStatus());

// Test connection
databaseServiceSwitcher.checkConnection()
  .then(isConnected => {
    console.log(`✅ Supabase Connection: ${isConnected ? 'HEALTHY' : 'FAILED'}`);
    if (isConnected) {
      console.log('🎉 SUCCESS: Supabase has been successfully reconnected!');
      console.log('📋 Next steps:');
      console.log('   • Visit http://localhost:5173 to use the application');
      console.log('   • Firebase is now paused but can be reactivated if needed');
      console.log('   • All data operations now use Supabase');
    } else {
      console.log('❌ ISSUE: Supabase connection failed');
    }
  })
  .catch(error => {
    console.error('❌ Connection test failed:', error);
  });
