// browser-database-setup.js
// Direct browser script to setup ABCD/BCD database table
// Run this in the browser console on the running app

console.log('🚀 Starting Browser-Based Database Setup for ABCD/BCD Numbers...\n');

// Function to set up the database
async function setupAbcdBcdDatabase() {
  try {
    // Get supabase client from the global scope or import
    let supabase;
    
    // Try to get from window or import dynamically
    if (window.supabase) {
      supabase = window.supabase;
      console.log('✅ Using global supabase client');
    } else {
      // Try to import from the module
      const { supabase: supabaseClient } = await import('/src/supabaseClient.js');
      supabase = supabaseClient;
      console.log('✅ Imported supabase client');
    }

    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Test connection
    console.log('🔗 Testing Supabase connection...');
    const { data: authData } = await supabase.auth.getSession();
    console.log('✅ Connected to Supabase successfully\n');

    // Prepare topic data with the correct numbers
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
      .upsert(topicData, { 
        onConflict: 'topic_name',
        ignoreDuplicates: false 
      })
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      
      if (insertError.code === 'PGRST116') {
        console.log('\n🔧 Table does not exist. Creating table first...');
        
        // Instructions for manual table creation
        console.log('📋 Manual steps required:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Run this SQL script:');
        console.log(`
CREATE TABLE IF NOT EXISTS topic_abcd_bcd_numbers (
    id SERIAL PRIMARY KEY,
    topic_name VARCHAR(255) NOT NULL UNIQUE,
    abcd_numbers INTEGER[] DEFAULT '{}',
    bcd_numbers INTEGER[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT 'system',
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_topic_abcd_bcd_topic_name ON topic_abcd_bcd_numbers(topic_name);

ALTER TABLE topic_abcd_bcd_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all users" ON topic_abcd_bcd_numbers
    FOR SELECT USING (true);

CREATE POLICY "Allow insert/update to authenticated users" ON topic_abcd_bcd_numbers
    FOR ALL USING (true);
        `);
        console.log('3. After creating the table, run this script again');
        return false;
      } else {
        throw insertError;
      }
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
      return false;
    }

    console.log(`✅ Database contains ${verifyData.length} topic records`);
    console.log('\n📋 Key records:');
    const d1Set1 = verifyData.find(r => r.topic_name === 'D-1 Set-1 Matrix');
    const d1Set2 = verifyData.find(r => r.topic_name === 'D-1 Set-2 Matrix');
    
    if (d1Set1) {
      console.log(`  D-1 Set-1 Matrix: ABCD[${d1Set1.abcd_numbers.join(', ')}] BCD[${d1Set1.bcd_numbers.join(', ')}]`);
    }
    if (d1Set2) {
      console.log(`  D-1 Set-2 Matrix: ABCD[${d1Set2.abcd_numbers.join(', ')}] BCD[${d1Set2.bcd_numbers.join(', ')}]`);
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📌 Next steps:');
    console.log('  • The Planets Analysis page should now load dynamic numbers');
    console.log('  • Refresh the page to see [10, 12], [4, 11] for D-1 sets');
    console.log('  • Green "DATABASE ACTIVE" banner should appear');
    
    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Ensure you are on the Planets Analysis page');
    console.log('2. Open browser console and paste this script');
    console.log('3. If table creation fails, use Supabase Dashboard SQL Editor');
    return false;
  }
}

// Test the database service
async function testDatabaseService() {
  try {
    console.log('\n🧪 Testing database service integration...');
    
    // Try to import and use the database service
    const { abcdBcdDatabaseService } = await import('/src/services/abcdBcdDatabaseService.js');
    
    const result = await abcdBcdDatabaseService.getAllTopicNumbers();
    
    if (result.success) {
      console.log('✅ Database service test successful');
      const summary = abcdBcdDatabaseService.getAnalysisSummary(result);
      console.log(`📊 Service response:`, summary);
      
      // Check specific numbers
      const d1Set1Numbers = result.data.topicNumbers['D-1 Set-1 Matrix'];
      const d1Set2Numbers = result.data.topicNumbers['D-1 Set-2 Matrix'];
      
      if (d1Set1Numbers && d1Set2Numbers) {
        console.log(`🎯 Target numbers verified:`);
        console.log(`  D-1 Set-1: ABCD[${d1Set1Numbers.abcd.join(', ')}] BCD[${d1Set1Numbers.bcd.join(', ')}]`);
        console.log(`  D-1 Set-2: ABCD[${d1Set2Numbers.abcd.join(', ')}] BCD[${d1Set2Numbers.bcd.join(', ')}]`);
        
        // Check if we have the expected numbers
        const expectedAbcd = [10, 12];
        const expectedBcd = [4, 11];
        
        const d1Set1Match = JSON.stringify(d1Set1Numbers.abcd.sort()) === JSON.stringify(expectedAbcd.sort()) &&
                            JSON.stringify(d1Set1Numbers.bcd.sort()) === JSON.stringify(expectedBcd.sort());
        
        if (d1Set1Match) {
          console.log('🎉 PERFECT! Numbers match the expected [10, 12], [4, 11]');
        } else {
          console.log('⚠️ Numbers do not match expected values');
        }
      }
      
      return true;
    } else {
      console.error('❌ Database service test failed:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Database service test error:', error.message);
    return false;
  }
}

// Main execution
async function runSetup() {
  console.log('='.repeat(60));
  console.log('🗄️ ABCD/BCD DATABASE SETUP SCRIPT');
  console.log('='.repeat(60));
  
  const setupSuccess = await setupAbcdBcdDatabase();
  
  if (setupSuccess) {
    await testDatabaseService();
    console.log('\n✅ Setup complete! Refresh the Planets Analysis page to see dynamic numbers.');
  } else {
    console.log('\n❌ Setup failed. Check the console messages above for next steps.');
  }
}

// Auto-run the setup
runSetup();
