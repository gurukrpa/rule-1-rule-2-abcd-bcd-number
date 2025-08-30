// Create test record for 2025-08-21 HR-1 with correct D-1 Set-2 values
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const createTestRecord = async () => {
  try {
    console.log('📝 Creating test record for 2025-08-21 HR-1...');
    
    // First, get the structure from 2025-08-18
    const { data: templateRecord, error: templateError } = await supabase
      .from('rule2_analysis_results')
      .select('*')
      .eq('analysis_date', '2025-08-18')
      .eq('selected_hr', 1)
      .limit(1)
      .single();
    
    if (templateError || !templateRecord) {
      console.error('❌ Could not get template record:', templateError);
      return;
    }
    
    console.log('✅ Got template from 2025-08-18');
    
    // Create new record for 2025-08-21 with same user_id but correct D-1 Set-2 values
    const newTopicNumbers = { ...templateRecord.topic_numbers };
    
    // Update D-1 Set-2 Matrix to the correct values as mentioned in the issue
    newTopicNumbers['D-1 Set-2 Matrix'] = {
      abcd: [2, 5, 10, 11],
      bcd: [9]
    };
    
    console.log('📝 Updated D-1 Set-2 Matrix to:', newTopicNumbers['D-1 Set-2 Matrix']);
    
    // Insert the new record
    const { data: newRecord, error: insertError } = await supabase
      .from('rule2_analysis_results')
      .insert([
        {
          user_id: templateRecord.user_id,
          analysis_date: '2025-08-21',
          trigger_date: '2025-08-21',
          selected_hr: 1,
          overall_abcd_numbers: templateRecord.overall_abcd_numbers,
          overall_bcd_numbers: templateRecord.overall_bcd_numbers,
          topic_numbers: newTopicNumbers,
          total_topics: templateRecord.total_topics,
          available_hrs: templateRecord.available_hrs,
          a_day: '2025-08-17',
          b_day: '2025-08-18',
          c_day: '2025-08-19',
          d_day: '2025-08-20',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Failed to create test record:', insertError);
      return;
    }
    
    console.log('✅ Successfully created test record for 2025-08-21 HR-1');
    console.log('  user_id:', newRecord.user_id);
    console.log('  analysis_date:', newRecord.analysis_date);
    console.log('  selected_hr:', newRecord.selected_hr);
    console.log('  D-1 Set-2 Matrix:', newRecord.topic_numbers['D-1 Set-2 Matrix']);
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
};

createTestRecord();