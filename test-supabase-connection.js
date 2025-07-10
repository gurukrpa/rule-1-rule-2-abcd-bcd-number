#!/usr/bin/env node

/**
 * Supabase Connection String Helper
 * This script helps you test different connection string formats
 */

import { execSync } from 'child_process';

// Common Supabase connection string patterns
const connectionPatterns = [
    // Pattern 1: Pooler connection (most common for newer projects)
    'postgresql://postgres.zndkprjytuhzufdqhnmt:PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
    'postgresql://postgres.zndkprjytuhzufdqhnmt:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
    'postgresql://postgres.zndkprjytuhzufdqhnmt:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
    
    // Pattern 2: Direct connection (older projects)
    'postgresql://postgres:PASSWORD@db.zndkprjytuhzufdqhnmt.supabase.co:5432/postgres',
    
    // Pattern 3: Alternative formats
    'postgresql://postgres.zndkprjytuhzufdqhnmt:PASSWORD@aws-0-us-west-1.supabase.co:6543/postgres',
];

const password = '#Vanakamnanba2020#';
const encodedPassword = '%23Vanakamnanba2020%23'; // URL encoded version

console.log('🔍 Testing Supabase Connection Strings...\n');
console.log('Your password:', password);
console.log('URL-encoded password:', encodedPassword);
console.log('\n' + '='.repeat(60) + '\n');

function testConnection(connectionString, description) {
    console.log(`Testing: ${description}`);
    console.log(`Connection: ${connectionString.replace(password, '***').replace(encodedPassword, '***')}`);
    
    try {
        // Test DNS resolution first
        const hostname = connectionString.match(/@([^:]+):/)[1];
        execSync(`nslookup ${hostname}`, { stdio: 'pipe' });
        console.log(`✅ DNS: ${hostname} resolves successfully`);
        
        // Test actual connection (just connection, not full backup)
        const testCommand = `pg_dump --schema-only "${connectionString}" > /dev/null 2>&1`;
        execSync(testCommand, { stdio: 'pipe' });
        console.log(`✅ CONNECTION: Successfully connected!`);
        console.log(`🎉 This is your working connection string!`);
        console.log(`\nTo create backup, run:`);
        console.log(`pg_dump "${connectionString}" > supabase-backup.sql`);
        return true;
        
    } catch (error) {
        console.log(`❌ Failed: ${error.message.split('\n')[0]}`);
        return false;
    }
}

// Test each pattern
let found = false;
for (let i = 0; i < connectionPatterns.length && !found; i++) {
    const pattern = connectionPatterns[i];
    
    // Try with regular password
    console.log(`\n--- Test ${i + 1}a: Regular Password ---`);
    const withPassword = pattern.replace('PASSWORD', password);
    if (testConnection(withPassword, 'Regular password format')) {
        found = true;
        break;
    }
    
    // Try with URL-encoded password
    console.log(`\n--- Test ${i + 1}b: URL-Encoded Password ---`);
    const withEncodedPassword = pattern.replace('PASSWORD', encodedPassword);
    if (testConnection(withEncodedPassword, 'URL-encoded password format')) {
        found = true;
        break;
    }
    
    console.log('\n' + '-'.repeat(40));
}

if (!found) {
    console.log('\n❌ None of the common patterns worked.');
    console.log('\n📋 Manual Steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Click Project Settings → Database');
    console.log('3. Find "Connection string" section');
    console.log('4. Copy the exact string that starts with "postgresql://"');
    console.log('5. Replace [YOUR-PASSWORD] with: #Vanakamnanba2020#');
    console.log('\n🔧 Common formats to look for:');
    connectionPatterns.forEach((pattern, i) => {
        console.log(`${i + 1}. ${pattern.replace('PASSWORD', '[YOUR-PASSWORD]')}`);
    });
}
