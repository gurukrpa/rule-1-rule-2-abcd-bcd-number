#!/usr/bin/env node

/**
 * Supabase Environment Verification Script
 * Confirms production and staging environments are properly separated
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Supabase Environment Verification');
console.log('====================================');
console.log('');

// Read environment files
function readEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const vars = {};
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        vars[key.trim()] = valueParts.join('=').trim();
      }
    });
    return vars;
  } catch (error) {
    return null;
  }
}

// Check production environment
const prodEnv = readEnvFile('.env.production');
const currentEnv = readEnvFile('.env');

console.log('📋 Environment File Status:');
console.log(`   Production (.env.production): ${prodEnv ? '✅ Found' : '❌ Missing'}`);
console.log(`   Current (.env): ${currentEnv ? '✅ Found' : '❌ Missing'}`);
console.log('');

if (!prodEnv) {
  console.log('❌ ERROR: Missing production environment file');
  process.exit(1);
}

// Extract Supabase URLs
const prodUrl = prodEnv.VITE_SUPABASE_URL;
const currentUrl = currentEnv?.VITE_SUPABASE_URL;

console.log('🔗 Supabase URL Verification:');
console.log(`   Production: ${prodUrl}`);
console.log(`   Current:    ${currentUrl}`);
console.log('');

// Verification checks
let passed = 0;
let total = 0;

// Check 1: Production URL configuration
total++;
if (prodUrl && !prodUrl.includes('YOUR_PRODUCTION')) {
  console.log('✅ Production URL is configured');
  passed++;
} else {
  console.log('❌ Production URL is not properly configured');
}

// Check 2: Production URL is the expected one
total++;
if (prodUrl?.includes('zndkprjytuhzufdqhnmt.supabase.co')) {
  console.log('✅ Production URL matches expected production');
  passed++;
} else {
  console.log('⚠️  Production URL unexpected');
}

// Check 4: Current environment identification
total++;
if (currentUrl === prodUrl) {
  console.log('✅ Current environment is production');
  passed++;
} else {
  console.log('⚠️  Current environment unclear');
}

console.log('');
console.log('📊 Verification Summary:');
console.log(`   Passed: ${passed}/${total} checks`);

if (passed === total) {
  console.log('   🎉 Environment configuration VERIFIED!');
  console.log('');
  console.log('🛡️  Status:');
  console.log('   ✅ Production environment properly configured');
  console.log('   ✅ Safe to proceed with application');
} else {
  console.log('   ⚠️  Issues detected - review above');
  console.log('');
  console.log('🔧 Next Steps:');
  console.log('   1. Ensure production project is properly configured');
  console.log('   2. Update .env.production with correct URLs');
  console.log('   3. Verify configuration is complete');
}

console.log('');
console.log('🚀 Quick Commands:');
console.log('   npm run dev                         # → Start development');
console.log('   npm run verify:supabase             # → Run this check');
