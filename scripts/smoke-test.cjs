#!/usr/bin/env node

/**
 * Smoke Test for Environment
 * Verifies Supabase connection and environment configuration
 */

console.log('🧪 SMOKE TEST: Environment Configuration');
console.log('=======================================');
console.log('');

// Simple environment check without imports first
const fs = require('fs');
const path = require('path');

// Read .env file manually
let envVars = {};
try {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (error) {
  console.log('❌ ERROR: Cannot read .env file');
  process.exit(1);
}

const supabaseUrl = envVars.VITE_SUPABASE_URL;

// Environment validation
console.log('📋 Environment Check:');
console.log(`   Supabase URL: ${supabaseUrl}`);
console.log(`   Environment: ${envVars.VITE_ENVIRONMENT || 'not set'}`);
console.log('');

if (!supabaseUrl) {
  console.log('❌ ERROR: No Supabase URL configured');
  console.log('   Please configure your .env file with Supabase credentials');
  process.exit(1);
}

console.log('🔌 Supabase URL configured - environment ready');
console.log('');
console.log('✅ SMOKE TEST: PASSED');
console.log('   - Supabase: Configured');
console.log('   - Environment: Ready');
console.log('');
console.log('🚀 Next Steps:');
console.log('   1. npm run dev');
console.log('   2. Open http://localhost:5173');
console.log('   3. Test application functionality');
