// Check abcd_bcd_analysis_results for Excel data
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const checkExcelData = async () => {
  try {
    console.log('🔍 Checking abcd_bcd_analysis_results for Excel data...');
    
    const { data, error } = await supabase
      .from('abcd_bcd_analysis_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Query error:', error);
      return;
    }
    
    console.log('📊 Found records:', data?.length || 0);
    
    if (data && data.length > 0) {
      data.forEach((record, index) => {
        console.log(`\n✅ Record ${index + 1}:`);
        console.log('  user_id:', record.user_id);
        console.log('  date:', record.date);
        console.log('  created_at:', record.created_at);
        
        if (record.topic_numbers) {
          console.log('  topic_numbers keys:', Object.keys(record.topic_numbers));
          
          // Check for D-1 Set-2 if it exists
          if (record.topic_numbers['D-1 Set-2 Matrix']) {
            console.log(`  D-1 Set-2 Matrix:`, record.topic_numbers['D-1 Set-2 Matrix']);
          }
        }
      });
    } else {
      console.log('❌ No Excel data found in abcd_bcd_analysis_results table');
      
      // Check if table exists and what columns it has
      const { data: schemaTest, error: schemaError } = await supabase
        .from('abcd_bcd_analysis_results')
        .select('*')
        .limit(1);
      
      if (schemaError) {
        console.log('🔍 Table schema error (table might not exist):', schemaError.message);
      } else {
        console.log('✅ Table exists but is empty');
      }
    }
  } catch (err) {
    console.error('💥 Error:', err);
  }
};

checkExcelData();