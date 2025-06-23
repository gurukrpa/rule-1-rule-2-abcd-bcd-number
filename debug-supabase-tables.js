// Debug script to check Supabase tables and structure
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Create Supabase client directly since we're in Node.js
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 SUPABASE TABLES AND STRUCTURE ANALYSIS');
console.log('==========================================\n');

async function analyzeSupabaseTables() {
  try {
    // Test basic connection
    console.log('1️⃣ Testing Supabase Connection...');
    const { data, error } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      console.log(`   ❌ Connection failed: ${error.message}\n`);
      return;
    } else {
      console.log(`   ✅ Connected to Supabase successfully\n`);
    }

    // Check what tables exist by trying to query them
    console.log('2️⃣ Checking Table Structure...');
    
    const tablesToCheck = [
      'users',
      'excel_data', 
      'hour_entries',
      'user_dates',
      'auth_users'
    ];

    for (const table of tablesToCheck) {
      try {
        console.log(`\n📊 Table: ${table}`);
        
        // Get table structure by querying with limit 0
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(0);

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          continue;
        }

        console.log(`   ✅ Exists - Row count: ${count || 0}`);
        
        // Get a sample row to show structure
        const { data: sampleData } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (sampleData && sampleData.length > 0) {
          console.log(`   📋 Sample columns: ${Object.keys(sampleData[0]).join(', ')}`);
        } else {
          console.log(`   📋 Table empty - cannot show structure`);
        }

      } catch (err) {
        console.log(`   ❌ Table check failed: ${err.message}`);
      }
    }

    // Test basic Supabase operations
    console.log('\n3️⃣ Testing Basic Supabase Operations...');
    
    try {
      console.log('\n   Testing users table access...');
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log(`   ❌ Users query failed: ${error.message}`);
      } else {
        console.log(`   ✅ Users found: ${users.length}`);
        users.forEach(user => {
          console.log(`      - ${user.username} (ID: ${user.id})`);
        });
      }
    } catch (err) {
      console.log(`   ❌ Users test failed: ${err.message}`);
    }

    // Test excel_data table
    try {
      console.log('\n   Testing excel_data table...');
      const { data: excelData, error } = await supabase
        .from('excel_data')
        .select('user_id, date, file_name')
        .limit(3);
      
      if (error) {
        console.log(`   ❌ Excel data query failed: ${error.message}`);
      } else {
        console.log(`   ✅ Excel data entries: ${excelData.length}`);
        excelData.forEach(entry => {
          console.log(`      - User ${entry.user_id}: ${entry.file_name} on ${entry.date}`);
        });
      }
    } catch (err) {
      console.log(`   ❌ Excel data test failed: ${err.message}`);
    }

    console.log('\n4️⃣ supabaseClient vs CleanSupabaseService Comparison:');
    console.log('   🔗 supabaseClient.js:');
    console.log('      - Basic Supabase connection (createClient)');
    console.log('      - Contains ML functions (startTraining, getPrediction)');
    console.log('      - Used as foundation for other services');
    console.log('');
    console.log('   🏗️ CleanSupabaseService.js:');
    console.log('      - Full-featured data service class');
    console.log('      - Structured methods for all ABCD operations');
    console.log('      - Uses supabaseClient as underlying connection');
    console.log('      - Tables used:');
    console.log('         • users - User management');
    console.log('         • excel_data - Excel file uploads and sets');
    console.log('         • hour_entries - Hour/planet selections');
    console.log('         • user_dates - Date tracking per user');
    console.log('         • auth_users - OAuth authentication');

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
analyzeSupabaseTables().then(() => {
  console.log('\n✅ Analysis complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
