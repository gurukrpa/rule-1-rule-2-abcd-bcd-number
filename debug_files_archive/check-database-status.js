/**
 * Database Status Checker
 * Run this in your browser console to see which database is active
 */

// Check database status
async function checkDatabaseStatus() {
  console.log('🔍 Checking Database Status...\n');
  
  try {
    // Import the database service switcher
    const { databaseServiceSwitcher } = await import('./src/services/DatabaseServiceSwitcher.js');
    
    // Get current service status
    const status = databaseServiceSwitcher.getServiceStatus();
    const activeService = databaseServiceSwitcher.getActiveService();
    
    console.log('📊 DATABASE STATUS REPORT:');
    console.log('════════════════════════════════════════');
    console.log(`🎯 ACTIVE DATABASE: ${status[activeService].name}`);
    console.log(`📍 Environment: ${import.meta.env.NODE_ENV || 'development'}`);
    console.log(`🔄 Dual-Service Mode: ${databaseServiceSwitcher.isDualServiceMode() ? 'ENABLED' : 'DISABLED'}`);
    console.log('');
    
    console.log('🔥 FIREBASE STATUS:');
    console.log(`   Status: ${status.firebase.enabled ? '✅ ACTIVE' : '⏸️ PAUSED'}`);
    console.log(`   Role: ${status.firebase.role}`);
    console.log(`   Description: ${status.firebase.description}`);
    console.log('');
    
    console.log('⚡ SUPABASE STATUS:');
    console.log(`   Status: ${status.supabase.enabled ? '✅ ACTIVE' : '⏸️ PAUSED'}`);
    console.log(`   Role: ${status.supabase.role}`);
    console.log(`   Description: ${status.supabase.description}`);
    console.log('');
    
    // Test database connection
    console.log('🔌 Testing Database Connection...');
    try {
      const connectionTest = await databaseServiceSwitcher.checkConnection();
      console.log(`   Connection: ${connectionTest ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
    } catch (error) {
      console.log(`   Connection: ❌ ERROR - ${error.message}`);
    }
    
    console.log('════════════════════════════════════════');
    console.log('💡 SUMMARY:');
    if (activeService === 'supabase') {
      console.log('   📝 Your app is using SUPABASE as the primary database');
      console.log('   🏠 All your data is stored in Supabase PostgreSQL');
      console.log('   🔐 Authentication is handled by Supabase Auth');
    } else if (activeService === 'firebase') {
      console.log('   📝 Your app is using FIREBASE as the primary database');
      console.log('   🏠 All your data is stored in Firebase Firestore');
      console.log('   🔐 Authentication is handled by Firebase Auth');
    }
    
    if (databaseServiceSwitcher.isDualServiceMode()) {
      console.log('   🔄 Dual-service mode provides automatic backup and failover');
    } else {
      console.log('   🎯 Single-service mode for optimal development performance');
    }
    
    return status;
    
  } catch (error) {
    console.error('❌ Error checking database status:', error);
    console.log('💡 Tip: Make sure you\'re running this in the browser console on your app page');
    return null;
  }
}

// Run the check
checkDatabaseStatus();
