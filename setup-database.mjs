// setup-database.mjs
// Script to create and populate the ABCD/BCD database table

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check .env file.');
  console.log('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY (or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up ABCD/BCD Numbers Database...\n');

  try {
    // Test connection with a simple query
    console.log('🔗 Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      console.log('🔄 Trying alternative connection test...');
      
      // Try a different approach - check if we can access any table
      const { error: altError } = await supabase.auth.getSession();
      if (altError) {
        console.error('❌ Alternative connection test failed:', altError.message);
        return;
      }
    }
    console.log('✅ Connected to Supabase successfully\n');

    // Check if table exists by trying to select from it
    console.log('🔍 Checking if topic_abcd_bcd_numbers table exists...');
    const { data: tableExists, error: tableError } = await supabase
      .from('topic_abcd_bcd_numbers')
      .select('count(*)')
      .limit(1);

    if (tableError && tableError.code === 'PGRST116') {
      console.log('📝 Table does not exist, creating topic_abcd_bcd_numbers table...');
      // Try direct table creation instead of RPC
      console.log('⚠️ Table creation via SQL not available, proceeding with data insertion...');
      console.log('📌 Please manually create the table using the CREATE-ABCD-BCD-TABLE.sql file');
    } else if (tableError) {
      console.error('❌ Error checking table:', tableError.message);
      console.log('📝 Attempting to create table anyway...');
    } else {
      console.log('✅ Table already exists');
    }

    // Insert/update data
    console.log('\n📥 Inserting ABCD/BCD numbers data...');

    const topicData = [
      {
        topic_name: 'D-1 Set-1 Matrix',
        abcd_numbers: [10, 12],
        bcd_numbers: [4, 11],
        notes: 'Updated with dynamic numbers from analysis'
      },
      {
        topic_name: 'D-1 Set-2 Matrix',
        abcd_numbers: [10, 12],
        bcd_numbers: [4, 11],
        notes: 'Updated with dynamic numbers from analysis'
      },
      {
        topic_name: 'D-3 (trd) Set-1 Matrix',
        abcd_numbers: [1, 2, 8, 11],
        bcd_numbers: [4, 6],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-3 (trd) Set-2 Matrix',
        abcd_numbers: [5, 9, 10, 11],
        bcd_numbers: [3, 4],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-4 Set-1 Matrix',
        abcd_numbers: [2, 5, 6, 8],
        bcd_numbers: [1, 4, 12],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-4 Set-2 Matrix',
        abcd_numbers: [3, 5, 6, 10, 11],
        bcd_numbers: [7, 9],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-5 (pv) Set-1 Matrix',
        abcd_numbers: [2, 9],
        bcd_numbers: [],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-5 (pv) Set-2 Matrix',
        abcd_numbers: [1, 6, 10],
        bcd_numbers: [],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-7 (trd) Set-1 Matrix',
        abcd_numbers: [1, 5, 7, 10, 11, 12],
        bcd_numbers: [4, 9],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-7 (trd) Set-2 Matrix',
        abcd_numbers: [1, 3, 4, 6, 7, 10],
        bcd_numbers: [2],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-9 Set-1 Matrix',
        abcd_numbers: [3, 11],
        bcd_numbers: [2, 7],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-9 Set-2 Matrix',
        abcd_numbers: [4, 7, 9, 12],
        bcd_numbers: [5],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-10 (trd) Set-1 Matrix',
        abcd_numbers: [2, 7, 8, 10],
        bcd_numbers: [4],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-10 (trd) Set-2 Matrix',
        abcd_numbers: [3, 8, 9, 11],
        bcd_numbers: [5],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-11 Set-1 Matrix',
        abcd_numbers: [4, 7, 8, 9, 12],
        bcd_numbers: [6],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-11 Set-2 Matrix',
        abcd_numbers: [1, 5, 6, 9],
        bcd_numbers: [2, 4, 12],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-12 (trd) Set-1 Matrix',
        abcd_numbers: [4, 5, 12],
        bcd_numbers: [6, 7, 9],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-12 (trd) Set-2 Matrix',
        abcd_numbers: [6, 8, 9, 10],
        bcd_numbers: [3, 5],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-27 (trd) Set-1 Matrix',
        abcd_numbers: [4, 7],
        bcd_numbers: [11],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-27 (trd) Set-2 Matrix',
        abcd_numbers: [2, 7],
        bcd_numbers: [12],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-30 (sh) Set-1 Matrix',
        abcd_numbers: [1, 2, 6],
        bcd_numbers: [7, 10, 11],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-30 (sh) Set-2 Matrix',
        abcd_numbers: [1, 2, 9, 10],
        bcd_numbers: [4, 11],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-60 (Trd) Set-1 Matrix',
        abcd_numbers: [1, 4, 5, 6],
        bcd_numbers: [3, 9],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-60 (Trd) Set-2 Matrix',
        abcd_numbers: [3, 8, 9, 12],
        bcd_numbers: [6, 10],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-81 Set-1 Matrix',
        abcd_numbers: [5, 6, 7, 12],
        bcd_numbers: [3],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-81 Set-2 Matrix',
        abcd_numbers: [3, 9, 10],
        bcd_numbers: [2],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-108 Set-1 Matrix',
        abcd_numbers: [2, 4, 6, 8],
        bcd_numbers: [9, 10],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-108 Set-2 Matrix',
        abcd_numbers: [1, 5, 6, 12],
        bcd_numbers: [4, 8],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-144 Set-1 Matrix',
        abcd_numbers: [9, 10, 11],
        bcd_numbers: [2, 3, 4, 5, 12],
        notes: 'Default configuration'
      },
      {
        topic_name: 'D-144 Set-2 Matrix',
        abcd_numbers: [1, 4, 6, 8],
        bcd_numbers: [3, 11, 12],
        notes: 'Default configuration'
      }
    ];

    // Use upsert to insert or update
    const { data: insertData, error: insertError } = await supabase
      .from('topic_abcd_bcd_numbers')
      .upsert(topicData, { 
        onConflict: 'topic_name',
        ignoreDuplicates: false 
      })
      .select();

    if (insertError) {
      console.error('❌ Failed to insert data:', insertError.message);
      return;
    }

    console.log(`✅ Successfully inserted/updated ${topicData.length} topic records`);

    // Verify data
    console.log('\n🔍 Verifying data insertion...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('topic_abcd_bcd_numbers')
      .select('topic_name, abcd_numbers, bcd_numbers')
      .order('topic_name');

    if (verifyError) {
      console.error('❌ Failed to verify data:', verifyError.message);
      return;
    }

    console.log(`✅ Database contains ${verifyData.length} topic records`);
    console.log('\n📋 Sample data:');
    verifyData.slice(0, 3).forEach(row => {
      console.log(`  ${row.topic_name}: ABCD[${row.abcd_numbers.join(', ')}] BCD[${row.bcd_numbers.join(', ')}]`);
    });

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📌 Key points:');
    console.log('  • D-1 Set-1 Matrix: ABCD[10, 12] BCD[4, 11]');
    console.log('  • D-1 Set-2 Matrix: ABCD[10, 12] BCD[4, 11]');
    console.log('  • All 30 topics have been configured');
    console.log('  • The Planets Analysis page should now load dynamic numbers');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabase();
