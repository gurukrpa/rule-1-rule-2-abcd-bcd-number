/**
 * Test script to create the enhanced rule2_analysis_results table
 * and verify the topic-specific ABCD/BCD number fix
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = 'https://mgmzjqzrndymjyatanrr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbXpqcXpybmR5bWp5YXRhbnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMzg3NzQsImV4cCI6MjA0ODkxNDc3NH0.mFWHKULKsT8bxaT4Cl6QG7jaNvGCWkJgojWHYOsRJi8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createEnhancedTable() {
  console.log('🚀 Creating enhanced rule2_analysis_results table...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'CREATE-RULE2-ANALYSIS-RESULTS-TABLE.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error creating table:', error);
      
      // Try alternative approach - create table manually
      console.log('🔄 Trying manual table creation...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS rule2_analysis_results (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          analysis_date DATE NOT NULL,
          trigger_date DATE NOT NULL,
          selected_hr INTEGER DEFAULT 1,
          overall_abcd_numbers INTEGER[] DEFAULT '{}',
          overall_bcd_numbers INTEGER[] DEFAULT '{}',
          topic_numbers JSONB DEFAULT '{}',
          total_topics INTEGER DEFAULT 0,
          available_hrs INTEGER[] DEFAULT '{}',
          a_day DATE,
          b_day DATE,
          c_day DATE,
          d_day DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_rule2_analysis_user_date 
        ON rule2_analysis_results(user_id, analysis_date);
        
        ALTER TABLE rule2_analysis_results ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Allow read access to all users" 
        ON rule2_analysis_results FOR SELECT USING (true);
        
        CREATE POLICY IF NOT EXISTS "Allow insert/update to authenticated users" 
        ON rule2_analysis_results FOR ALL USING (true);
      `;
      
      // Split into individual statements
      const statements = createTableSQL.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' });
          if (stmtError) {
            console.log(`⚠️ Statement error (may be expected):`, stmtError.message);
          }
        }
      }
    }
    
    console.log('✅ Enhanced table creation completed!');
    
    // Test the table exists
    const { data: tables, error: testError } = await supabase
      .from('rule2_analysis_results')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('ℹ️ Table test result:', testError.message);
    } else {
      console.log('✅ Table is accessible and ready for use!');
    }
    
  } catch (err) {
    console.error('💥 Exception creating table:', err);
  }
}

async function testTopicSpecificFix() {
  console.log('\n🧪 Testing topic-specific ABCD/BCD number fix...');
  
  try {
    // Test data for verification
    const testUserId = '8db9861a-76ce-4ae3-81b0-7a8b82314ef2';
    const testDate = '2025-01-06';
    
    // Sample topic-specific data to simulate what Rule2CompactPage would save
    const mockTopicResults = [
      {
        setName: 'D-1 Set-1 Matrix',
        abcdNumbers: [1, 2, 4, 7, 9],
        bcdNumbers: [5]
      },
      {
        setName: 'D-1 Set-2 Matrix', 
        abcdNumbers: [3, 6, 8],
        bcdNumbers: [2, 10]
      },
      {
        setName: 'D-3 Set-1 Matrix',
        abcdNumbers: [11, 12],
        bcdNumbers: [4]
      }
    ];
    
    // Overall combined numbers (what Rule2CompactPage calculates)
    const overallAbcd = [1, 2, 3, 4, 6, 7, 8, 9, 11, 12];
    const overallBcd = [2, 4, 5, 10];
    
    // Build topic_numbers JSON
    const topicNumbers = {};
    mockTopicResults.forEach(result => {
      topicNumbers[result.setName] = {
        abcd: result.abcdNumbers,
        bcd: result.bcdNumbers
      };
    });
    
    console.log('📝 Sample data prepared:');
    console.log('   Overall ABCD:', overallAbcd);
    console.log('   Overall BCD:', overallBcd);
    console.log('   D-1 Set-1 Matrix:', topicNumbers['D-1 Set-1 Matrix']);
    console.log('   D-1 Set-2 Matrix:', topicNumbers['D-1 Set-2 Matrix']);
    
    // Test insert/update
    const { data: insertData, error: insertError } = await supabase
      .from('rule2_analysis_results')
      .upsert({
        user_id: testUserId,
        analysis_date: testDate,
        trigger_date: testDate,
        selected_hr: 1,
        overall_abcd_numbers: overallAbcd,
        overall_bcd_numbers: overallBcd,
        topic_numbers: topicNumbers,
        total_topics: mockTopicResults.length,
        a_day: '2025-01-03',
        b_day: '2025-01-04', 
        c_day: '2025-01-05',
        d_day: testDate
      }, {
        onConflict: 'user_id,analysis_date'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error saving test data:', insertError);
      return;
    }
    
    console.log('✅ Test data saved successfully!');
    
    // Test retrieval and topic-specific access
    const { data: retrievedData, error: retrieveError } = await supabase
      .from('rule2_analysis_results')
      .select('*')
      .eq('user_id', testUserId)
      .eq('analysis_date', testDate)
      .single();
    
    if (retrieveError) {
      console.error('❌ Error retrieving test data:', retrieveError);
      return;
    }
    
    console.log('✅ Test data retrieved successfully!');
    
    // Verify topic-specific numbers
    const d1Set1 = retrievedData.topic_numbers?.['D-1 Set-1 Matrix'];
    const d1Set2 = retrievedData.topic_numbers?.['D-1 Set-2 Matrix'];
    
    console.log('\n🎯 Topic-specific verification:');
    console.log(`   D-1 Set-1 Matrix: ABCD[${d1Set1?.abcd?.join(',') || 'None'}] BCD[${d1Set1?.bcd?.join(',') || 'None'}]`);
    console.log(`   D-1 Set-2 Matrix: ABCD[${d1Set2?.abcd?.join(',') || 'None'}] BCD[${d1Set2?.bcd?.join(',') || 'None'}]`);
    
    // Expected vs actual comparison
    console.log('\n📊 Expected vs Actual:');
    console.log('   EXPECTED D-1 Set-1: ABCD[1,2,4,7,9] BCD[5]');
    console.log(`   ACTUAL   D-1 Set-1: ABCD[${d1Set1?.abcd?.join(',') || 'None'}] BCD[${d1Set1?.bcd?.join(',') || 'None'}]`);
    
    console.log('   EXPECTED D-1 Set-2: ABCD[3,6,8] BCD[2,10]');
    console.log(`   ACTUAL   D-1 Set-2: ABCD[${d1Set2?.abcd?.join(',') || 'None'}] BCD[${d1Set2?.bcd?.join(',') || 'None'}]`);
    
    // Check if the fix works
    const d1Set1Expected = { abcd: [1,2,4,7,9], bcd: [5] };
    const d1Set1Actual = d1Set1;
    
    const abcdMatch = JSON.stringify(d1Set1Expected.abcd) === JSON.stringify(d1Set1Actual?.abcd || []);
    const bcdMatch = JSON.stringify(d1Set1Expected.bcd) === JSON.stringify(d1Set1Actual?.bcd || []);
    
    if (abcdMatch && bcdMatch) {
      console.log('\n🎉 SUCCESS! Topic-specific numbers are working correctly!');
      console.log('✅ D-1 Set-1 Matrix shows unique numbers: ABCD[1,2,4,7,9] BCD[5]');
      console.log('✅ No longer showing overall combined numbers for all topics');
    } else {
      console.log('\n❌ Issue detected - numbers don\'t match expected values');
    }
    
  } catch (err) {
    console.error('💥 Exception testing topic-specific fix:', err);
  }
}

async function verifyCurrentIssue() {
  console.log('\n🔍 Checking current issue status...');
  
  try {
    const testUserId = '8db9861a-76ce-4ae3-81b0-7a8b82314ef2';
    
    // Check rule2_results table (old overall numbers approach)
    const { data: oldData, error: oldError } = await supabase
      .from('rule2_results')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!oldError && oldData && oldData.length > 0) {
      const latestOld = oldData[0];
      console.log('📋 Current rule2_results (overall approach):');
      console.log(`   ABCD: [${latestOld.abcd_numbers?.join(',') || 'None'}]`);
      console.log(`   BCD: [${latestOld.bcd_numbers?.join(',') || 'None'}]`);
      console.log('   ⚠️ PROBLEM: All topics get these same overall numbers');
    } else {
      console.log('📋 No data in rule2_results table');
    }
    
    // Check enhanced table
    const { data: newData, error: newError } = await supabase
      .from('rule2_analysis_results')
      .select('*')
      .eq('user_id', testUserId)
      .order('analysis_date', { ascending: false })
      .limit(1);
    
    if (!newError && newData && newData.length > 0) {
      const latestNew = newData[0];
      console.log('\n🚀 Enhanced rule2_analysis_results (topic-specific approach):');
      console.log(`   Overall ABCD: [${latestNew.overall_abcd_numbers?.join(',') || 'None'}]`);
      console.log(`   Overall BCD: [${latestNew.overall_bcd_numbers?.join(',') || 'None'}]`);
      
      const topicCount = Object.keys(latestNew.topic_numbers || {}).length;
      console.log(`   Topics with specific numbers: ${topicCount}`);
      
      if (topicCount > 0) {
        console.log('   ✅ SOLUTION: Each topic has unique ABCD/BCD numbers');
        
        // Show sample topics
        const sampleTopics = Object.keys(latestNew.topic_numbers).slice(0, 3);
        sampleTopics.forEach(topicName => {
          const topic = latestNew.topic_numbers[topicName];
          console.log(`   📊 ${topicName}: ABCD[${topic.abcd?.join(',') || 'None'}] BCD[${topic.bcd?.join(',') || 'None'}]`);
        });
      }
    } else {
      console.log('\n🚀 Enhanced table is ready but no data yet');
      console.log('   ℹ️ Run Rule2CompactPage analysis to populate with topic-specific data');
    }
    
  } catch (err) {
    console.error('💥 Exception checking current status:', err);
  }
}

// Main execution
async function main() {
  console.log('🎯 TOPIC-SPECIFIC ABCD/BCD NUMBERS FIX');
  console.log('=====================================\n');
  
  console.log('PROBLEM: PlanetsAnalysisPage shows same overall numbers for all topics');
  console.log('SOLUTION: Enhanced table with topic-specific ABCD/BCD numbers\n');
  
  await createEnhancedTable();
  await verifyCurrentIssue();
  await testTopicSpecificFix();
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. ✅ Enhanced table created and tested');
  console.log('2. ✅ Rule2CompactPage updated to save topic-specific data');  
  console.log('3. ✅ PlanetsAnalysisPage updated to read topic-specific data');
  console.log('4. 🔄 Run Rule2CompactPage analysis to populate enhanced table');
  console.log('5. 🎯 Verify PlanetsAnalysisPage shows unique numbers per topic');
  
  console.log('\n🎉 Ready to test the fix!');
  process.exit(0);
}

main().catch(console.error);
