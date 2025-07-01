// direct-database-setup.mjs
// Simplified direct approach to insert ABCD/BCD data

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function setupDatabase() {
  console.log('🚀 Direct Database Setup for ABCD/BCD Numbers...\n');

  try {
    // Test basic connection
    console.log('🔗 Testing Supabase connection...');
    const { data: authData } = await supabase.auth.getSession();
    console.log('✅ Connected to Supabase successfully\n');

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

    console.log('📥 Attempting to insert ABCD/BCD numbers data...');

    // Try to insert data directly
    const { data: insertData, error: insertError } = await supabase
      .from('topic_abcd_bcd_numbers')
      .insert(topicData)
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.log('\n🔧 Trying upsert instead...');
      
      // Try upsert
      const { data: upsertData, error: upsertError } = await supabase
        .from('topic_abcd_bcd_numbers')
        .upsert(topicData, { 
          onConflict: 'topic_name',
          ignoreDuplicates: false 
        })
        .select();

      if (upsertError) {
        console.error('❌ Upsert also failed:', upsertError.message);
        console.log('\n📋 Manual steps required:');
        console.log('1. Go to Supabase Dashboard');
        console.log('2. Run the CREATE-ABCD-BCD-TABLE.sql script in SQL Editor');
        console.log('3. Re-run this script');
        return;
      }

      console.log(`✅ Successfully upserted ${topicData.length} topic records`);
    } else {
      console.log(`✅ Successfully inserted ${topicData.length} topic records`);
    }

    // Verify data
    console.log('\n🔍 Verifying data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('topic_abcd_bcd_numbers')
      .select('topic_name, abcd_numbers, bcd_numbers')
      .order('topic_name');

    if (verifyError) {
      console.error('❌ Failed to verify data:', verifyError.message);
      return;
    }

    console.log(`✅ Database contains ${verifyData.length} topic records`);
    console.log('\n📋 Key records:');
    console.log(`  D-1 Set-1 Matrix: ABCD[${verifyData.find(r => r.topic_name === 'D-1 Set-1 Matrix')?.abcd_numbers.join(', ') || 'not found'}] BCD[${verifyData.find(r => r.topic_name === 'D-1 Set-1 Matrix')?.bcd_numbers.join(', ') || 'not found'}]`);
    console.log(`  D-1 Set-2 Matrix: ABCD[${verifyData.find(r => r.topic_name === 'D-1 Set-2 Matrix')?.abcd_numbers.join(', ') || 'not found'}] BCD[${verifyData.find(r => r.topic_name === 'D-1 Set-2 Matrix')?.bcd_numbers.join(', ') || 'not found'}]`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📌 Next steps:');
    console.log('  • The Planets Analysis page should now load dynamic numbers');
    console.log('  • Test the page to verify it shows [10, 12], [4, 11] for D-1 sets');
    console.log('  • Green "DATABASE ACTIVE" banner should appear');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📋 Manual steps required:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run the CREATE-ABCD-BCD-TABLE.sql script');
    console.log('3. Re-run this script');
  }
}

setupDatabase();
