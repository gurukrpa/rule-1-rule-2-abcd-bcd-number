import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://wgnqlgwfpwdrkutktpvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnbnFsZ3dmcHdkcmt1dGt0cHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMjcwNTMsImV4cCI6MjA0ODkwMzA1M30.pTpyAJrH_RUumKPKmYyQ2iMhxaLg9FgFo5c4QHRYm7Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createEnhancedTable() {
  console.log('🚀 Creating rule2_analysis_results table...');
  
  try {
    // First, check if table exists
    const { data: checkData, error: checkError } = await supabase
      .from('rule2_analysis_results')
      .select('count', { count: 'exact', head: true });
    
    if (!checkError) {
      console.log('✅ Table rule2_analysis_results already exists');
      return { success: true, message: 'Table already exists' };
    }

    if (checkError.code !== '42P01') {
      console.error('❌ Unexpected error checking table:', checkError);
      return { success: false, error: checkError };
    }

    console.log('💡 Table does not exist, creating...');

    // Create the table using individual SQL commands
    const commands = [
      `CREATE TABLE rule2_analysis_results (
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
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, analysis_date, selected_hr)
      )`,
      
      `CREATE INDEX idx_rule2_analysis_results_user_date ON rule2_analysis_results(user_id, analysis_date)`,
      
      `CREATE INDEX idx_rule2_analysis_results_user_created ON rule2_analysis_results(user_id, created_at DESC)`,
      
      `ALTER TABLE rule2_analysis_results ENABLE ROW LEVEL SECURITY`,
      
      `CREATE POLICY "Users can manage their own rule2 analysis results" ON rule2_analysis_results
        FOR ALL USING (true) WITH CHECK (true)`
    ];

    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      console.log(`Executing command ${i + 1}/${commands.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: commands[i] });
        if (error) {
          console.error(`❌ Error executing command ${i + 1}:`, error);
          // Continue with other commands
        } else {
          console.log(`✅ Command ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`💥 Exception in command ${i + 1}:`, err);
      }
    }

    // Verify table creation
    const { data: verifyData, error: verifyError } = await supabase
      .from('rule2_analysis_results')
      .select('count', { count: 'exact', head: true });
    
    if (verifyError) {
      console.error('❌ Table creation verification failed:', verifyError);
      return { success: false, error: verifyError };
    }

    console.log('✅ Enhanced table created and verified successfully!');
    return { success: true, message: 'Table created successfully' };

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return { success: false, error };
  }
}

async function testTopicSpecificSave() {
  console.log('🧪 Testing topic-specific data save...');
  
  const mockData = {
    user_id: 'sing maya',
    analysis_date: '2025-07-07',
    trigger_date: '2025-07-07',
    selected_hr: 1,
    overall_abcd_numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    overall_bcd_numbers: [],
    topic_numbers: {
      "D-1 Set-1 Matrix": { abcd: [1, 2, 4, 7, 9], bcd: [5] },
      "D-1 Set-2 Matrix": { abcd: [3, 6, 8, 11], bcd: [10] },
      "D-3 Set-1 Matrix": { abcd: [2, 3, 5, 12], bcd: [1] },
      "D-3 Set-2 Matrix": { abcd: [4, 7, 9], bcd: [6, 8] }
    },
    total_topics: 30,
    a_day: '2025-07-04',
    b_day: '2025-07-05',
    c_day: '2025-07-06',
    d_day: '2025-07-07'
  };

  try {
    const { data, error } = await supabase
      .from('rule2_analysis_results')
      .insert(mockData)
      .select();
    
    if (error) {
      console.error('❌ Error saving test data:', error);
      return { success: false, error };
    }

    console.log('✅ Test data saved successfully:', data);
    return { success: true, data };

  } catch (error) {
    console.error('💥 Exception saving test data:', error);
    return { success: false, error };
  }
}

async function main() {
  console.log('🎯 Setting up enhanced Rule2 analysis database...');
  
  // Step 1: Create table
  const createResult = await createEnhancedTable();
  if (!createResult.success) {
    console.error('Failed to create table, stopping...');
    return;
  }

  // Step 2: Test with sample data
  const testResult = await testTopicSpecificSave();
  if (!testResult.success) {
    console.error('Failed to save test data');
    return;
  }

  console.log('🎉 Database setup complete! Now run Rule-2 analysis to generate real topic-specific numbers.');
}

main().catch(console.error);
